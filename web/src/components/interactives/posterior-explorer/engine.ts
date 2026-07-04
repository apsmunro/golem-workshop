/**
 * Posterior Explorer engine — turns a table of draws into the four views:
 * marginal densities, pairs scatters, regression bands, counterfactual
 * predictions. Pure; RNG only where prediction genuinely simulates.
 */
import { kde, percentileInterval, quantile } from '../../../lib/stats'
import type { Density } from '../../../lib/stats'
import type { RNG } from '../../../lib/rng'

export interface Marginal {
  name: string
  density: Density
  mean: number
  interval: [number, number]
}

export function marginals(
  draws: Record<string, Float64Array>,
  width = 0.89,
): Marginal[] {
  return Object.entries(draws).map(([name, col]) => {
    const xs = [...col]
    const m = xs.reduce((a, b) => a + b, 0) / xs.length
    return {
      name,
      density: kde(xs, { n: 128 }),
      mean: m,
      interval: percentileInterval(xs, width),
    }
  })
}

/** Thin draws for scatter plots — index-strided, deterministic. */
export function thin(col: Float64Array, maxN: number): number[] {
  if (col.length <= maxN) return [...col]
  const stride = col.length / maxN
  const out: number[] = new Array(maxN)
  for (let i = 0; i < maxN; i++) out[i] = col[Math.floor(i * stride)]!
  return out
}

export interface RegressionBands {
  xs: number[]
  mean: number[]
  muLo: number[]
  muHi: number[]
  predLo: number[]
  predHi: number[]
}

/**
 * Bands for y = a + b (x − xbar) with Gaussian noise sigma.
 * mu band: quantiles of the linear predictor across draws.
 * predictive band: mu + sigma noise, one simulated outcome per draw.
 */
export function regressionBands(
  draws: { a: Float64Array; b: Float64Array; sigma: Float64Array },
  xbar: number,
  xRange: [number, number],
  rng: RNG,
  opts: { gridN?: number; width?: number } = {},
): RegressionBands {
  const gridN = opts.gridN ?? 40
  const width = opts.width ?? 0.89
  const tail = (1 - width) / 2
  const n = draws.a.length
  const xs: number[] = new Array(gridN)
  const mean: number[] = new Array(gridN)
  const muLo: number[] = new Array(gridN)
  const muHi: number[] = new Array(gridN)
  const predLo: number[] = new Array(gridN)
  const predHi: number[] = new Array(gridN)

  const mu = new Array<number>(n)
  const pred = new Array<number>(n)
  for (let g = 0; g < gridN; g++) {
    const x = xRange[0] + ((xRange[1] - xRange[0]) * g) / (gridN - 1)
    xs[g] = x
    let acc = 0
    for (let i = 0; i < n; i++) {
      const m = draws.a[i]! + draws.b[i]! * (x - xbar)
      mu[i] = m
      pred[i] = m + rng.normal(0, draws.sigma[i]!)
      acc += m
    }
    mean[g] = acc / n
    muLo[g] = quantile(mu, tail)
    muHi[g] = quantile(mu, 1 - tail)
    predLo[g] = quantile(pred, tail)
    predHi[g] = quantile(pred, 1 - tail)
  }
  return { xs, mean, muLo, muHi, predLo, predHi }
}

/** Simulated outcomes at a single x — the counterfactual density. */
export function predictAt(
  draws: { a: Float64Array; b: Float64Array; sigma: Float64Array },
  xbar: number,
  x: number,
  rng: RNG,
): number[] {
  const n = draws.a.length
  const out: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    out[i] =
      draws.a[i]! + draws.b[i]! * (x - xbar) + rng.normal(0, draws.sigma[i]!)
  }
  return out
}
