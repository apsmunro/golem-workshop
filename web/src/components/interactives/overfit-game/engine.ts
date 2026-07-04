/**
 * Overfit-the-polynomial engine. Pure logic, no React, no DOM.
 *
 * The hidden process is a fixed quadratic; samples of n points get
 * polynomial OLS fits of degree 1..6. Scores are deviances
 * (−2·Σ log N(y | μ, σ̂)). Out-of-sample truth comes two honest ways:
 * exact leave-one-out refitting, and a large fresh test sample.
 */
import { invertMatrix } from '../../../lib/quap'
import { RNG } from '../../../lib/rng'

export interface Sample {
  x: number[]
  y: number[]
}

export interface PolyFit {
  degree: number
  /** coefs[k] multiplies x^k */
  coefs: number[]
  /** MLE residual sd */
  sigma: number
  trainDeviance: number
}

/** The process behind every sample: a gentle hump with real scatter. */
export const TRUE_DEGREE = 2
export const NOISE_SD = 0.35

export function trueMean(x: number): number {
  return 0.4 + 0.7 * x - 0.9 * x * x
}

/** n points, x spread over [−1, 1] with jitter so no grid artifacts. */
export function generateSample(n: number, rng: RNG): Sample {
  const x: number[] = new Array(n)
  const y: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const base = n === 1 ? 0 : (2 * i) / (n - 1) - 1
    const xi = Math.max(-1, Math.min(1, base + rng.normal(0, 0.06)))
    x[i] = xi
    y[i] = trueMean(xi) + rng.normal(0, NOISE_SD)
  }
  return { x, y }
}

function designRow(x: number, degree: number): number[] {
  const row = new Array<number>(degree + 1)
  let p = 1
  for (let k = 0; k <= degree; k++) {
    row[k] = p
    p *= x
  }
  return row
}

/**
 * OLS via normal equations with a whisper of ridge (1e-9) so degree-6
 * designs on 12 points stay invertible. The ridge is far below the scale
 * of any coefficient the data can support; tests confirm exact recovery.
 */
export function fitPoly(sample: Sample, degree: number): PolyFit {
  const n = sample.x.length
  const k = degree + 1
  if (n <= degree) throw new RangeError(`degree ${degree} needs more than ${degree} points`)
  const xtx: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const xty = new Array<number>(k).fill(0)
  for (let i = 0; i < n; i++) {
    const row = designRow(sample.x[i]!, degree)
    for (let a = 0; a < k; a++) {
      xty[a] = xty[a]! + row[a]! * sample.y[i]!
      for (let b = 0; b < k; b++) xtx[a]![b] = xtx[a]![b]! + row[a]! * row[b]!
    }
  }
  for (let a = 0; a < k; a++) xtx[a]![a] = xtx[a]![a]! + 1e-9
  const inv = invertMatrix(xtx)
  const coefs = inv.map((row) => row.reduce((acc, v, j) => acc + v * xty[j]!, 0))
  let sse = 0
  for (let i = 0; i < n; i++) {
    const r = sample.y[i]! - predict(coefs, sample.x[i]!)
    sse += r * r
  }
  // MLE sigma, floored so a saturated fit cannot claim infinite skill
  const sigma = Math.max(Math.sqrt(sse / n), 1e-3)
  return { degree, coefs, sigma, trainDeviance: deviance(coefs, sigma, sample) }
}

export function predict(coefs: readonly number[], x: number): number {
  let acc = 0
  let p = 1
  for (const c of coefs) {
    acc += c * p
    p *= x
  }
  return acc
}

const LOG_2PI = 1.8378770664093453

export function deviance(
  coefs: readonly number[],
  sigma: number,
  sample: Sample,
): number {
  let ll = 0
  for (let i = 0; i < sample.x.length; i++) {
    const z = (sample.y[i]! - predict(coefs, sample.x[i]!)) / sigma
    ll += -0.5 * z * z - Math.log(sigma) - 0.5 * LOG_2PI
  }
  return -2 * ll
}

/**
 * Exact leave-one-out deviance: refit without point i, score point i,
 * −2·Σ held-out log densities. n refits per degree — cheap at this size.
 */
export function looDeviance(sample: Sample, degree: number): number {
  const n = sample.x.length
  let ll = 0
  for (let i = 0; i < n; i++) {
    const held: Sample = {
      x: sample.x.filter((_, j) => j !== i),
      y: sample.y.filter((_, j) => j !== i),
    }
    const fit = fitPoly(held, degree)
    const z = (sample.y[i]! - predict(fit.coefs, sample.x[i]!)) / fit.sigma
    ll += -0.5 * z * z - Math.log(fit.sigma) - 0.5 * LOG_2PI
  }
  return -2 * ll
}

/** Deviance on a big fresh sample, scaled to the training n for comparison. */
export function testDeviance(
  fit: PolyFit,
  trainN: number,
  rng: RNG,
  testN = 1000,
): number {
  const test = generateSample(testN, rng)
  return (deviance(fit.coefs, fit.sigma, test) * trainN) / testN
}

export interface DegreeScore {
  degree: number
  trainDeviance: number
  looDeviance: number
  testDeviance: number
}

export interface ComparisonRow {
  label: string
  score: number
  delta: number
  weight: number
}

/** Fit and score every degree on one sample. Deterministic per (sample, seed). */
export function scoreDegrees(
  sample: Sample,
  degrees: readonly number[],
  testSeed: number,
): DegreeScore[] {
  return degrees.map((degree) => {
    const fit = fitPoly(sample, degree)
    return {
      degree,
      trainDeviance: fit.trainDeviance,
      looDeviance: looDeviance(sample, degree),
      // same test stream for every degree: all golems face the same future
      testDeviance: testDeviance(fit, sample.x.length, new RNG(testSeed, 91)),
    }
  })
}

/** Akaike-style weights from any deviance-scaled score (lower is better). */
export function comparisonRows(
  entries: readonly { label: string; score: number }[],
): ComparisonRow[] {
  if (entries.length === 0) return []
  const best = Math.min(...entries.map((e) => e.score))
  const raw = entries.map((e) => Math.exp(-0.5 * (e.score - best)))
  const total = raw.reduce((a, b) => a + b, 0)
  return entries
    .map((e, i) => ({
      label: e.label,
      score: e.score,
      delta: e.score - best,
      weight: raw[i]! / total,
    }))
    .sort((a, b) => a.score - b.score)
}
