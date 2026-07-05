/**
 * admit-paradox engine — UCBadmit, the two models whose disagreement
 * is the lesson (m11.7 vs m11.8).
 *
 * Total effect of gender: logit(admit) = a[gid]. Direct effect:
 * logit(admit) = a[gid] + d[dept]. Both fit by quap; the interesting
 * output is the posterior of the male−female contrast under each,
 * on the log-odds scale and on the admission-probability scale.
 */
import { parseSemicolonCsv } from '../interaction-surface/engine'
import { dnormLog, quap } from '../../../lib/quap'
import type { QuapFit } from '../../../lib/quap'
import { invLogit } from '../link-morpher/engine'

export interface AdmitRow {
  dept: string // A..F
  male: boolean
  admit: number
  applications: number
}

/**
 * UCBadmit.csv has an unnamed leading row-index column: the header
 * names 5 columns, each data row carries 6 cells. Naming the index
 * restores the alignment for the shared parser.
 */
export function admitRows(csv: string): AdmitRow[] {
  const lines = csv.trim().split(/\r?\n/)
  const patched = [`"row";${lines[0]!}`, ...lines.slice(1)].join('\n')
  const recs = parseSemicolonCsv(patched)
  return recs.map((r) => ({
    dept: r.dept!,
    male: r['applicant.gender'] === 'male',
    admit: Number(r.admit),
    applications: Number(r.applications),
  }))
}

const DEPTS = ['A', 'B', 'C', 'D', 'E', 'F']

/** m11.7: total effect of gender. Params: aM, aF. */
export function fitTotal(rows: readonly AdmitRow[]): QuapFit {
  const logPost = (theta: readonly number[]): number => {
    let lp = dnormLog(theta[0]!, 0, 1.5) + dnormLog(theta[1]!, 0, 1.5)
    for (const r of rows) {
      const eta = r.male ? theta[0]! : theta[1]!
      const log1pExp = eta > 30 ? eta : Math.log1p(Math.exp(eta))
      lp += r.admit * eta - r.applications * log1pExp
    }
    return lp
  }
  return quap(logPost, [0, 0], ['aM', 'aF'])
}

/** m11.8: gender within department. Params: aM, aF, dA..dF. */
export function fitDirect(rows: readonly AdmitRow[]): QuapFit {
  const names = ['aM', 'aF', ...DEPTS.map((d) => `d${d}`)]
  const logPost = (theta: readonly number[]): number => {
    let lp = 0
    for (let i = 0; i < 8; i++) lp += dnormLog(theta[i]!, 0, 1.5)
    for (const r of rows) {
      const gid = r.male ? 0 : 1
      const di = 2 + DEPTS.indexOf(r.dept)
      const eta = theta[gid]! + theta[di]!
      const log1pExp = eta > 30 ? eta : Math.log1p(Math.exp(eta))
      lp += r.admit * eta - r.applications * log1pExp
    }
    return lp
  }
  return quap(logPost, new Array(8).fill(0), names)
}

export interface AdmitContrast {
  /** male − female, log-odds */
  logOdds: number[]
  /** male − female, admission probability (dept-weighted for the direct model) */
  prob: number[]
}

export function totalContrast(draws: Record<string, Float64Array>): AdmitContrast {
  const n = draws.aM!.length
  const logOdds: number[] = new Array(n)
  const prob: number[] = new Array(n)
  for (let s = 0; s < n; s++) {
    logOdds[s] = draws.aM![s]! - draws.aF![s]!
    prob[s] = invLogit(draws.aM![s]!) - invLogit(draws.aF![s]!)
  }
  return { logOdds, prob }
}

export function directContrast(
  draws: Record<string, Float64Array>,
  rows: readonly AdmitRow[],
): AdmitContrast {
  const n = draws.aM!.length
  const totalApps = rows.reduce((s, r) => s + r.applications, 0)
  const weight = DEPTS.map(
    (d) =>
      rows
        .filter((r) => r.dept === d)
        .reduce((s, r) => s + r.applications, 0) / totalApps,
  )
  const logOdds: number[] = new Array(n)
  const prob: number[] = new Array(n)
  for (let s = 0; s < n; s++) {
    logOdds[s] = draws.aM![s]! - draws.aF![s]!
    let dp = 0
    for (let k = 0; k < DEPTS.length; k++) {
      const dd = draws[`d${DEPTS[k]}`]![s]!
      dp += weight[k]! * (invLogit(draws.aM![s]! + dd) - invLogit(draws.aF![s]! + dd))
    }
    prob[s] = dp
  }
  return { logOdds, prob }
}
