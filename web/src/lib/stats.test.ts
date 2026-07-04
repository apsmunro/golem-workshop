/**
 * Stats tests. Quantile checked against R's type-7 results exactly;
 * KDE mass checked to ±0.01; TV distances exact for hand-computable cases.
 */
import { describe, expect, it } from 'vitest'
import { kde, mean, percentileInterval, quantile, sd, totalVariation, variance } from './stats'

describe('summaries', () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9]

  it('mean, variance, sd', () => {
    expect(mean(xs)).toBe(5)
    expect(variance(xs)).toBeCloseTo(32 / 7, 10)
    expect(sd(xs)).toBeCloseTo(Math.sqrt(32 / 7), 10)
  })

  it('quantile matches R type-7', () => {
    // R: quantile(c(2,4,4,4,5,5,7,9), c(.25,.5,.75)) → 4.00 4.50 5.50
    expect(quantile(xs, 0.25)).toBe(4)
    expect(quantile(xs, 0.5)).toBe(4.5)
    expect(quantile(xs, 0.75)).toBe(5.5)
    expect(quantile(xs, 0)).toBe(2)
    expect(quantile(xs, 1)).toBe(9)
  })

  it('percentile interval is equal-tailed', () => {
    const draws = Array.from({ length: 1001 }, (_, i) => i / 1000)
    const [lo, hi] = percentileInterval(draws, 0.89)
    expect(lo).toBeCloseTo(0.055, 3)
    expect(hi).toBeCloseTo(0.945, 3)
  })
})

describe('kde', () => {
  it('integrates to ≈ 1 and peaks near the data mode', () => {
    // Deterministic triangular sample peaked at 0: sum of two low-discrepancy
    // uniforms minus 1 (sin() would pile mass at the edges — arcsine law).
    const draws: number[] = []
    for (let i = 1; i <= 500; i++) {
      const u1 = (i * 0.6180339887) % 1
      const u2 = (i * 0.4142135624) % 1
      draws.push(u1 + u2 - 1)
    }
    const { x, y } = kde(draws, { n: 256 })
    const step = x[1]! - x[0]!
    const massEstimate = y.reduce((a, b) => a + b, 0) * step
    expect(massEstimate).toBeGreaterThan(0.99)
    expect(massEstimate).toBeLessThan(1.01)
    const peakX = x[y.indexOf(Math.max(...y))]!
    expect(Math.abs(peakX)).toBeLessThan(0.5)
  })
})

describe('totalVariation', () => {
  it('is 0 for identical densities and 1 for disjoint ones', () => {
    expect(totalVariation([1, 2, 3], [2, 4, 6])).toBeCloseTo(0, 12)
    expect(totalVariation([1, 1, 0, 0], [0, 0, 1, 1])).toBeCloseTo(1, 12)
  })

  it('half-overlapping uniform blocks give TV = 0.5', () => {
    expect(totalVariation([1, 1, 0], [0, 1, 1])).toBeCloseTo(0.5, 12)
  })
})
