/**
 * stats.ts — summaries and density estimation shared by interactives.
 * Pure functions, no DOM, no RNG.
 */

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) throw new RangeError('mean of empty array')
  let s = 0
  for (const x of xs) s += x
  return s / xs.length
}

export function variance(xs: readonly number[]): number {
  if (xs.length < 2) throw new RangeError('variance needs at least 2 values')
  const m = mean(xs)
  let s = 0
  for (const x of xs) s += (x - m) * (x - m)
  return s / (xs.length - 1)
}

export function sd(xs: readonly number[]): number {
  return Math.sqrt(variance(xs))
}

/** Type-7 (linear interpolation) quantile, matching R's default. */
export function quantile(xs: readonly number[], p: number): number {
  if (xs.length === 0) throw new RangeError('quantile of empty array')
  if (p < 0 || p > 1) throw new RangeError(`p must be in [0,1], got ${p}`)
  const sorted = xs.slice().sort((a, b) => a - b)
  const h = (sorted.length - 1) * p
  const lo = Math.floor(h)
  const hi = Math.ceil(h)
  return sorted[lo]! + (h - lo) * (sorted[hi]! - sorted[lo]!)
}

/** Equal-tailed percentile interval, e.g. width 0.89 → [5.5%, 94.5%]. */
export function percentileInterval(
  xs: readonly number[],
  width: number,
): [number, number] {
  const tail = (1 - width) / 2
  return [quantile(xs, tail), quantile(xs, 1 - tail)]
}

export interface Density {
  x: number[]
  y: number[]
}

/**
 * Gaussian kernel density estimate on a regular grid. Bandwidth defaults
 * to Silverman's rule of thumb. y integrates to ≈1 over [lo, hi] when the
 * grid covers the data comfortably.
 */
export function kde(
  draws: readonly number[],
  opts: { lo?: number; hi?: number; n?: number; bandwidth?: number } = {},
): Density {
  if (draws.length < 2) throw new RangeError('kde needs at least 2 draws')
  const s = sd(draws)
  const bw =
    opts.bandwidth ?? 1.06 * (s || 1e-9) * Math.pow(draws.length, -1 / 5)
  const lo = opts.lo ?? Math.min(...draws) - 3 * bw
  const hi = opts.hi ?? Math.max(...draws) + 3 * bw
  const n = opts.n ?? 128
  const x: number[] = new Array(n)
  const y: number[] = new Array(n)
  const step = (hi - lo) / (n - 1)
  const inv = 1 / (bw * Math.sqrt(2 * Math.PI) * draws.length)
  for (let i = 0; i < n; i++) {
    const xi = lo + i * step
    let acc = 0
    for (const d of draws) {
      const z = (xi - d) / bw
      acc += Math.exp(-0.5 * z * z)
    }
    x[i] = xi
    y[i] = acc * inv
  }
  return { x, y }
}

/**
 * Total variation distance between two densities sampled on the SAME grid,
 * each first normalized to unit mass on that grid. Returns a value in [0, 1].
 * Calibration scores are 1 − TV.
 */
export function totalVariation(p: readonly number[], q: readonly number[]): number {
  if (p.length !== q.length || p.length === 0) {
    throw new RangeError('totalVariation needs two same-length non-empty arrays')
  }
  let ps = 0
  let qs = 0
  for (let i = 0; i < p.length; i++) {
    const pi = p[i]!
    const qi = q[i]!
    if (pi < 0 || qi < 0) throw new RangeError('densities must be non-negative')
    ps += pi
    qs += qi
  }
  if (ps === 0 || qs === 0) throw new RangeError('densities must have positive mass')
  let acc = 0
  for (let i = 0; i < p.length; i++) {
    acc += Math.abs(p[i]! / ps - q[i]! / qs)
  }
  return acc / 2
}
