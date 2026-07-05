/**
 * Tolerances: pmf identities to 1e-9 (tail mass beyond k = 60 ignored);
 * seeded simulation frequencies within 3 percentage points of the pmf
 * at n = 4000.
 */
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import {
  histogram,
  naiveLambda,
  poissonPmf,
  simulateDays,
  zeroDecomposition,
  zipPmf,
} from './engine'

describe('poissonPmf', () => {
  it('matches known values', () => {
    expect(poissonPmf(0, 1)).toBeCloseTo(Math.exp(-1), 9)
    expect(poissonPmf(2, 3)).toBeCloseTo((9 / 2) * Math.exp(-3), 9)
  })
  it('sums to one', () => {
    let s = 0
    for (let k = 0; k <= 60; k++) s += poissonPmf(k, 4)
    expect(s).toBeCloseTo(1, 9)
  })
})

describe('zipPmf', () => {
  it('sums to one for any mixture', () => {
    for (const [p, lam] of [
      [0.2, 1],
      [0.5, 3],
      [0.05, 0.4],
    ] as const) {
      let s = 0
      for (let k = 0; k <= 60; k++) s += zipPmf(k, p, lam)
      expect(s).toBeCloseTo(1, 9)
    }
  })
  it('the zero probability decomposes as p + (1−p)e^{−λ}', () => {
    const d = zeroDecomposition(0.2, 1)
    expect(d.total).toBeCloseTo(0.2 + 0.8 * Math.exp(-1), 9)
    expect(zipPmf(0, 0.2, 1)).toBeCloseTo(d.total, 9)
    expect(d.drinking).toBeCloseTo(0.2, 9)
  })
})

describe('simulateDays', () => {
  const rng = new RNG(1959, 12)
  const days = simulateDays(rng, 4000, 0.2, 1)

  it('frequencies track the pmf', () => {
    for (let k = 0; k <= 4; k++) {
      const freq = days.filter((d) => d.count === k).length / days.length
      expect(Math.abs(freq - zipPmf(k, 0.2, 1))).toBeLessThan(0.03)
    }
  })
  it('drinking days never produce manuscripts', () => {
    expect(days.filter((d) => d.drinking && d.count > 0)).toHaveLength(0)
  })
  it('the histogram splits zeros by cause and loses nobody', () => {
    const h = histogram(days, 8)
    const binned =
      h.zerosDrinking +
      h.zerosWorking +
      h.counts.reduce((a, b) => a + b, 0)
    expect(binned).toBe(days.filter((d) => d.count <= 8).length)
    expect(h.zerosDrinking / days.length).toBeGreaterThan(0.15)
    expect(h.zerosDrinking / days.length).toBeLessThan(0.25)
  })
  it('a plain Poisson underestimates the work rate', () => {
    const nl = naiveLambda(days)
    expect(nl).toBeLessThan(0.9) // true λ = 1
    expect(Math.abs(nl - 0.8)).toBeLessThan(0.05) // (1−p)λ
  })
})
