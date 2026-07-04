/**
 * RNG correctness tests. Tolerances: with n = 50,000 draws, sample moments
 * of U(0,1), N(0,1), Beta(6,4) and quantiles are checked to within ±0.02
 * absolute (loose enough to be seed-stable, tight enough to catch a broken
 * generator). Determinism is exact.
 */
import { describe, expect, it } from 'vitest'
import { HOUSE_SEED, RNG } from './rng'
import { mean, quantile, sd } from './stats'

const N = 50_000

describe('PCG32 core', () => {
  it('is deterministic for a given seed and stream', () => {
    const a = new RNG(HOUSE_SEED)
    const b = new RNG(HOUSE_SEED)
    const seqA = Array.from({ length: 10 }, () => a.nextUint32())
    const seqB = Array.from({ length: 10 }, () => b.nextUint32())
    expect(seqA).toEqual(seqB)
  })

  it('differs across seeds and streams', () => {
    const a = new RNG(1)
    const b = new RNG(2)
    const c = new RNG(1, 99)
    expect(a.nextUint32()).not.toBe(b.nextUint32())
    const a2 = new RNG(1)
    expect(a2.nextUint32()).not.toBe(c.nextUint32())
  })
})

describe('uniform', () => {
  it('has mean ≈ 0.5 and sd ≈ 0.2887', () => {
    const r = new RNG(HOUSE_SEED)
    const xs = Array.from({ length: N }, () => r.uniform())
    expect(mean(xs)).toBeCloseTo(0.5, 2)
    expect(sd(xs)).toBeCloseTo(Math.sqrt(1 / 12), 2)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...xs)).toBeLessThan(1)
  })
})

describe('int', () => {
  it('covers [0, n) roughly uniformly', () => {
    const r = new RNG(7)
    const counts = new Array<number>(5).fill(0)
    for (let i = 0; i < N; i++) counts[r.int(5)]!++
    for (const c of counts) {
      expect(c / N).toBeGreaterThan(0.18)
      expect(c / N).toBeLessThan(0.22)
    }
  })
})

describe('normal', () => {
  it('matches N(0,1) moments and quartiles', () => {
    const r = new RNG(HOUSE_SEED)
    const xs = Array.from({ length: N }, () => r.normal())
    expect(mean(xs)).toBeCloseTo(0, 1)
    expect(sd(xs)).toBeCloseTo(1, 1)
    // known N(0,1) quartiles ±0.02
    expect(Math.abs(quantile(xs, 0.25) - -0.6745)).toBeLessThan(0.02)
    expect(Math.abs(quantile(xs, 0.75) - 0.6745)).toBeLessThan(0.02)
  })
})

describe('beta', () => {
  it('Beta(6,4) has mean 0.6 and sd ≈ 0.1477', () => {
    const r = new RNG(HOUSE_SEED)
    const xs = Array.from({ length: N }, () => r.beta(6, 4))
    expect(mean(xs)).toBeCloseTo(0.6, 2)
    expect(sd(xs)).toBeCloseTo(Math.sqrt((0.6 * 0.4) / 11), 2)
  })

  it('handles shape < 1 without degenerate output', () => {
    const r = new RNG(3)
    const xs = Array.from({ length: 5000 }, () => r.beta(0.5, 0.5))
    // arcsine distribution: mean 0.5, mass piles at the edges
    expect(mean(xs)).toBeCloseTo(0.5, 1)
    expect(xs.every((x) => x > 0 && x < 1)).toBe(true)
  })
})

describe('binomial & categorical', () => {
  it('Binomial(9, 0.7) has mean 6.3', () => {
    const r = new RNG(HOUSE_SEED)
    const xs = Array.from({ length: N }, () => r.binomial(9, 0.7))
    expect(mean(xs)).toBeCloseTo(6.3, 1)
  })

  it('categorical respects weights', () => {
    const r = new RNG(11)
    const counts = [0, 0, 0]
    for (let i = 0; i < N; i++) counts[r.categorical([1, 2, 7])]!++
    expect(counts[0]! / N).toBeCloseTo(0.1, 1)
    expect(counts[1]! / N).toBeCloseTo(0.2, 1)
    expect(counts[2]! / N).toBeCloseTo(0.7, 1)
  })
})
