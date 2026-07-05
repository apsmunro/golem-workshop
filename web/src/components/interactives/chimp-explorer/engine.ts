/**
 * chimp-explorer engine — m11.4 on the prosocial chimpanzees, fit in
 * the browser by quadratic approximation.
 *
 * The 504 pulls aggregate exactly into 7 actors × 4 treatments of
 * binomial counts (the likelihood is identical), which keeps the log
 * posterior cheap enough for Nelder–Mead in 11 dimensions. Priors are
 * the book's: a_actor ~ Normal(0, 1.5), b_treatment ~ Normal(0, 0.5).
 * Treatments: 1 R/N, 2 L/N, 3 R/P, 4 L/P (side/partner).
 */
import { parseSemicolonCsv } from '../interaction-surface/engine'
import { dnormLog, quap } from '../../../lib/quap'
import type { QuapFit } from '../../../lib/quap'
import { invLogit } from '../link-morpher/engine'

export interface ChimpCell {
  actor: number // 1..7
  treatment: number // 1..4
  pulls: number // pulled_left successes
  trials: number
}

export const TREATMENT_LABELS = ['R/N', 'L/N', 'R/P', 'L/P'] as const

export function chimpCells(csv: string): ChimpCell[] {
  const recs = parseSemicolonCsv(csv)
  const map = new Map<string, ChimpCell>()
  for (const r of recs) {
    const actor = Number(r.actor)
    const treatment = 1 + Number(r.prosoc_left) + 2 * Number(r.condition)
    const key = `${actor}-${treatment}`
    let cell = map.get(key)
    if (!cell) {
      cell = { actor, treatment, pulls: 0, trials: 0 }
      map.set(key, cell)
    }
    cell.trials += 1
    cell.pulls += Number(r.pulled_left)
  }
  return [...map.values()].sort(
    (a, b) => a.actor - b.actor || a.treatment - b.treatment,
  )
}

/** Binomial-logit log likelihood, dropping the constant choose term. */
function binomLogitLog(k: number, n: number, eta: number): number {
  // k·η − n·log(1 + e^η), with a stable log1p-exp
  const log1pExp = eta > 30 ? eta : Math.log1p(Math.exp(eta))
  return k * eta - n * log1pExp
}

export const CHIMP_PARAMS = [
  'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
  'b1', 'b2', 'b3', 'b4',
]

/** Fit m11.4: logit p = a[actor] + b[treatment]. */
export function fitChimps(cells: readonly ChimpCell[]): QuapFit {
  const logPost = (theta: readonly number[]): number => {
    let lp = 0
    for (let i = 0; i < 7; i++) lp += dnormLog(theta[i]!, 0, 1.5)
    for (let i = 7; i < 11; i++) lp += dnormLog(theta[i]!, 0, 0.5)
    for (const c of cells) {
      const eta = theta[c.actor - 1]! + theta[6 + c.treatment]!
      lp += binomLogitLog(c.pulls, c.trials, eta)
    }
    return lp
  }

  // start each actor at the empirical logit of its pooled rate, b at 0
  const start: number[] = []
  for (let a = 1; a <= 7; a++) {
    const mine = cells.filter((c) => c.actor === a)
    const k = mine.reduce((s, c) => s + c.pulls, 0)
    const n = mine.reduce((s, c) => s + c.trials, 0)
    const p = Math.min(0.98, Math.max(0.02, k / n))
    start.push(Math.log(p / (1 - p)))
  }
  start.push(0, 0, 0, 0)

  return quap(logPost, start, CHIMP_PARAMS)
}

export interface ChimpSummary {
  /** posterior mean p and 89% interval per actor × treatment */
  cells: { actor: number; treatment: number; mean: number; lo: number; hi: number }[]
  /** treatment-effect contrasts on the logit scale: db13, db24 */
  contrasts: { name: string; draws: number[] }[]
  /** the same contrasts as differences in p for each actor averaged */
  contrastsProb: { name: string; draws: number[] }[]
}

export function summarizeChimps(
  draws: Record<string, Float64Array>,
): ChimpSummary {
  const n = draws.a1!.length
  const cells: ChimpSummary['cells'] = []
  for (let a = 1; a <= 7; a++) {
    for (let t = 1; t <= 4; t++) {
      const ps = new Float64Array(n)
      const ak = draws[`a${a}`]!
      const bk = draws[`b${t}`]!
      for (let s = 0; s < n; s++) ps[s] = invLogit(ak[s]! + bk[s]!)
      const sorted = [...ps].sort((x, y) => x - y)
      cells.push({
        actor: a,
        treatment: t,
        mean: ps.reduce((s2, v) => s2 + v, 0) / n,
        lo: sorted[Math.floor(0.055 * n)]!,
        hi: sorted[Math.floor(0.945 * n)]!,
      })
    }
  }

  const contrastPairs: [string, number, number][] = [
    ['R: partner − none (b3 − b1)', 3, 1],
    ['L: partner − none (b4 − b2)', 4, 2],
  ]
  const contrasts = contrastPairs.map(([name, hi2, lo2]) => ({
    name,
    draws: Array.from({ length: n }, (_, s) => draws[`b${hi2}`]![s]! - draws[`b${lo2}`]![s]!),
  }))

  // absolute scale: average over actors of p(a, hi) − p(a, lo)
  const contrastsProb = contrastPairs.map(([name, hi2, lo2]) => ({
    name: name.replace('b3 − b1', 'p scale').replace('b4 − b2', 'p scale'),
    draws: Array.from({ length: n }, (_, s) => {
      let acc = 0
      for (let a = 1; a <= 7; a++) {
        const ak = draws[`a${a}`]![s]!
        acc += invLogit(ak + draws[`b${hi2}`]![s]!) - invLogit(ak + draws[`b${lo2}`]![s]!)
      }
      return acc / 7
    }),
  }))

  return { cells, contrasts, contrastsProb }
}
