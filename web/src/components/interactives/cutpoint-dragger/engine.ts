/**
 * cutpoint-dragger engine — the cumulative-logit machinery of ordered
 * categories (Trolley, m12.4/m12.5).
 *
 * Six cutpoints carve the latent logistic axis into seven response
 * categories: p_k = invlogit(κ_k − φ) − invlogit(κ_{k−1} − φ), with a
 * linear predictor φ shifting the whole story left or right across
 * fixed cutpoints. For an intercept-only model the MLE cutpoints are
 * the logits of the observed cumulative proportions — closed form, so
 * "reveal the fit" needs no optimizer.
 */
import { invLogit } from '../link-morpher/engine'

export const CATEGORIES = 7

export function logit(p: number): number {
  if (p <= 0 || p >= 1) throw new RangeError(`logit needs p in (0,1), got ${p}`)
  return Math.log(p / (1 - p))
}

/** Category probabilities implied by sorted cutpoints and a shift φ. */
export function categoryProbs(cutpoints: readonly number[], phi = 0): number[] {
  const out: number[] = []
  let prev = 0
  for (const k of cutpoints) {
    const c = invLogit(k - phi)
    out.push(c - prev)
    prev = c
  }
  out.push(1 - prev)
  return out
}

/** Intercept-only MLE cutpoints from observed category counts. */
export function cutpointsFromCounts(counts: readonly number[]): number[] {
  const n = counts.reduce((a, b) => a + b, 0)
  if (n === 0) throw new RangeError('cutpointsFromCounts needs data')
  const cuts: number[] = []
  let cum = 0
  for (let k = 0; k < counts.length - 1; k++) {
    cum += counts[k]!
    // clamp so empty leading/trailing categories stay finite
    const p = Math.min(1 - 1e-6, Math.max(1e-6, cum / n))
    cuts.push(logit(p))
  }
  return cuts
}

/** Standard logistic density, the latent axis's smoke. */
export function logisticPdf(x: number): number {
  const e = Math.exp(-Math.abs(x))
  return e / ((1 + e) * (1 + e))
}

/**
 * Constrain a dragged cutpoint between its neighbors with a minimum
 * gap, so the order (and the probabilities' signs) survive dragging.
 */
export function clampCutpoint(
  cutpoints: readonly number[],
  index: number,
  value: number,
  gap = 0.08,
): number {
  const lo = index === 0 ? -6 : cutpoints[index - 1]! + gap
  const hi = index === cutpoints.length - 1 ? 6 : cutpoints[index + 1]! - gap
  return Math.min(hi, Math.max(lo, value))
}

/** Mean response (1..7) under category probabilities. */
export function meanResponse(probs: readonly number[]): number {
  let m = 0
  for (let k = 0; k < probs.length; k++) m += (k + 1) * probs[k]!
  return m
}

export interface TrolleyCell {
  action: number
  intention: number
  contact: number
  n: number
  counts: number[]
}

/** Sum the response counts of the selected cells. */
export function pooledCounts(cells: readonly TrolleyCell[]): number[] {
  const out = new Array<number>(CATEGORIES).fill(0)
  for (const c of cells) {
    for (let k = 0; k < CATEGORIES; k++) out[k]! += c.counts[k]!
  }
  return out
}

export function proportions(counts: readonly number[]): number[] {
  const n = counts.reduce((a, b) => a + b, 0)
  return counts.map((c) => (n === 0 ? 0 : c / n))
}
