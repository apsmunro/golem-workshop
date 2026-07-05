/**
 * kline-poisson engine — m11.10 on the Oceanic tool kits, plus the
 * exposure lab that motivates offsets.
 *
 * m11.10: tools ~ Poisson(λ), log λ = a[cid] + b[cid]·log_pop_std,
 * priors a ~ N(3, 0.5), b ~ N(0, 0.2) — the book's tamed priors.
 * Fit by quap on 10 societies (4 parameters).
 *
 * The exposure lab is closed-form: with a log-exposure offset the
 * Poisson MLE of a shared daily rate is Σy/Στ; ignoring exposure it
 * is the raw mean of the counts. Simulation is seeded (Knuth Poisson;
 * λ stays small).
 */
import { dnormLog, quap } from '../../../lib/quap'
import type { QuapFit } from '../../../lib/quap'
import type { RNG } from '../../../lib/rng'

export interface Society {
  culture: string
  population: number
  highContact: boolean
  tools: number
  logPopStd: number
}

/** Kline.csv: semicolon-separated, unquoted, no NA. */
export function klineRows(csv: string): Society[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]!.split(';')
  const idx = (name: string) => header.indexOf(name)
  const raw = lines.slice(1).map((line) => {
    const cells = line.split(';')
    return {
      culture: cells[idx('culture')]!,
      population: Number(cells[idx('population')]),
      highContact: cells[idx('contact')] === 'high',
      tools: Number(cells[idx('total_tools')]),
    }
  })
  const logs = raw.map((r) => Math.log(r.population))
  const m = logs.reduce((a, b) => a + b, 0) / logs.length
  const s = Math.sqrt(
    logs.reduce((a, b) => a + (b - m) * (b - m), 0) / (logs.length - 1),
  )
  return raw.map((r, i) => ({ ...r, logPopStd: (logs[i]! - m) / s }))
}

function logFactorial(n: number): number {
  let acc = 0
  for (let k = 2; k <= n; k++) acc += Math.log(k)
  return acc
}

export const KLINE_PARAMS = ['aLow', 'aHigh', 'bLow', 'bHigh']

/** Fit m11.10 by quap. */
export function fitKline(rows: readonly Society[]): QuapFit {
  const logPost = (theta: readonly number[]): number => {
    let lp =
      dnormLog(theta[0]!, 3, 0.5) +
      dnormLog(theta[1]!, 3, 0.5) +
      dnormLog(theta[2]!, 0, 0.2) +
      dnormLog(theta[3]!, 0, 0.2)
    for (const r of rows) {
      const a = r.highContact ? theta[1]! : theta[0]!
      const b = r.highContact ? theta[3]! : theta[2]!
      const logLambda = a + b * r.logPopStd
      lp += r.tools * logLambda - Math.exp(logLambda) - logFactorial(r.tools)
    }
    return lp
  }
  return quap(logPost, [3, 3, 0, 0], KLINE_PARAMS)
}

/** Expected tools at a standardized log population, per contact level. */
export function expectedTools(
  draws: Record<string, Float64Array>,
  logPopStd: number,
  highContact: boolean,
): { mean: number; lo: number; hi: number } {
  const a = highContact ? draws.aHigh! : draws.aLow!
  const b = highContact ? draws.bHigh! : draws.bLow!
  const n = a.length
  const lam = new Float64Array(n)
  for (let s = 0; s < n; s++) lam[s] = Math.exp(a[s]! + b[s]! * logPopStd)
  const sorted = [...lam].sort((x, y) => x - y)
  return {
    mean: lam.reduce((s2, v) => s2 + v, 0) / n,
    lo: sorted[Math.floor(0.055 * n)]!,
    hi: sorted[Math.floor(0.945 * n)]!,
  }
}

// ---------------------------------------------------------------- offsets

/** Seeded Poisson draw (Knuth); fine for the small rates used here. */
export function poisson(rng: RNG, lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng.uniform()
  } while (p > L)
  return k - 1
}

export interface Ledger {
  /** counts per record */
  y: number[]
  /** exposure (days) per record */
  tau: number[]
}

/** Simulate a monastery ledger: n records, each covering `days` days. */
export function simulateLedger(
  rng: RNG,
  dailyRate: number,
  days: number,
  n: number,
): Ledger {
  const y: number[] = new Array(n)
  const tau: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    y[i] = poisson(rng, dailyRate * days)
    tau[i] = days
  }
  return { y, tau }
}

/** MLE of the daily rate with the offset honored: Σy / Στ. */
export function rateWithOffset(ledger: Ledger): number {
  const sy = ledger.y.reduce((a, b) => a + b, 0)
  const st = ledger.tau.reduce((a, b) => a + b, 0)
  return sy / st
}

/** MLE if exposure is ignored (every record treated as one day). */
export function rateIgnoringExposure(ledger: Ledger): number {
  const sy = ledger.y.reduce((a, b) => a + b, 0)
  return sy / ledger.y.length
}
