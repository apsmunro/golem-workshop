/**
 * zero-inflation-mixer engine — the drinking monks of m12.3.
 *
 * A zero-inflated Poisson mixes two processes: with probability p the
 * monastery drinks (zero manuscripts, guaranteed), otherwise it works
 * at rate λ (zero still possible). The pmf, the zero decomposition,
 * and a seeded day-by-day simulation that remembers *why* each zero
 * happened — which no real dataset ever does.
 */
import type { RNG } from '../../../lib/rng'
import { poisson } from '../kline-poisson/engine'

export function poissonPmf(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0
  let logP = -lambda + k * Math.log(lambda)
  for (let i = 2; i <= k; i++) logP -= Math.log(i)
  return Math.exp(logP)
}

/** ZIPoisson pmf. */
export function zipPmf(k: number, pDrink: number, lambda: number): number {
  const work = (1 - pDrink) * poissonPmf(k, lambda)
  return k === 0 ? pDrink + work : work
}

/** The two ways to see nothing: P(0) = p + (1−p)e^{−λ}. */
export function zeroDecomposition(
  pDrink: number,
  lambda: number,
): { drinking: number; working: number; total: number } {
  const drinking = pDrink
  const working = (1 - pDrink) * Math.exp(-lambda)
  return { drinking, working, total: drinking + working }
}

export interface SimDay {
  count: number
  drinking: boolean
}

/** Simulate n monastery days, remembering the hidden state. */
export function simulateDays(
  rng: RNG,
  n: number,
  pDrink: number,
  lambda: number,
): SimDay[] {
  const out: SimDay[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const drinking = rng.uniform() < pDrink
    out[i] = { count: drinking ? 0 : poisson(rng, lambda), drinking }
  }
  return out
}

export interface ZeroHistogram {
  /** bar heights per count value; zeros split by cause */
  zerosDrinking: number
  zerosWorking: number
  counts: number[] // index 1.. = days with that many manuscripts
  maxK: number
}

export function histogram(days: readonly SimDay[], maxK: number): ZeroHistogram {
  const counts = new Array<number>(maxK + 1).fill(0)
  let zerosDrinking = 0
  let zerosWorking = 0
  for (const d of days) {
    if (d.count === 0) {
      if (d.drinking) zerosDrinking++
      else zerosWorking++
    } else if (d.count <= maxK) {
      counts[d.count]!++
    }
  }
  return { zerosDrinking, zerosWorking, counts, maxK }
}

/**
 * What a plain Poisson would conclude from the blended data: its MLE
 * is the sample mean, which under the mixture estimates (1−p)λ — too
 * lazy a monastery, and still too few zeros to explain the pile.
 */
export function naiveLambda(days: readonly SimDay[]): number {
  if (days.length === 0) return 0
  return days.reduce((s, d) => s + d.count, 0) / days.length
}
