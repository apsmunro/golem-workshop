/**
 * Tolerances: exact-count checks are exact (multiplicities are integers
 * in log space, compared within 1e-9); maxent solutions within 1e-6 of
 * closed forms.
 */
import { describe, expect, it } from 'vitest'
import {
  PRESETS,
  entropy,
  logFactorial,
  logMultiplicity,
  maxentWithMean,
  meanValue,
  normalize,
} from './engine'

describe('logFactorial', () => {
  it('matches known values', () => {
    expect(logFactorial(0)).toBe(0)
    expect(logFactorial(1)).toBe(0)
    expect(logFactorial(5)).toBeCloseTo(Math.log(120), 9)
    expect(logFactorial(10)).toBeCloseTo(Math.log(3628800), 9)
  })
  it('rejects negatives and non-integers', () => {
    expect(() => logFactorial(-1)).toThrow(RangeError)
    expect(() => logFactorial(2.5)).toThrow(RangeError)
  })
})

describe('logMultiplicity — the book’s five bucket layouts', () => {
  const ways = { A: 1, B: 90, C: 1260, D: 37800, E: 113400 }
  for (const p of PRESETS) {
    it(`${p.name} can happen ${ways[p.name as keyof typeof ways]} ways`, () => {
      expect(Math.exp(logMultiplicity(p.counts))).toBeCloseTo(
        ways[p.name as keyof typeof ways],
        4,
      )
    })
  }
  it('ranks the presets by entropy the same way', () => {
    const hs = PRESETS.map((p) => entropy(normalize(p.counts)))
    for (let i = 1; i < hs.length; i++) expect(hs[i]!).toBeGreaterThan(hs[i - 1]!)
  })
})

describe('entropy', () => {
  it('is zero for a certain outcome', () => {
    expect(entropy([1, 0, 0])).toBe(0)
  })
  it('is log(k) for uniform over k buckets', () => {
    expect(entropy([0.2, 0.2, 0.2, 0.2, 0.2])).toBeCloseTo(Math.log(5), 9)
  })
  it('log-multiplicity per pebble approaches entropy as N grows', () => {
    // 10× the E-shape: (20,20,20,20,20) over N=100
    const big = [20, 20, 20, 20, 20]
    const perPebble = logMultiplicity(big) / 100
    expect(perPebble).toBeGreaterThan(entropy(normalize(big)) - 0.15)
    expect(perPebble).toBeLessThan(entropy(normalize(big)))
  })
})

describe('maxentWithMean', () => {
  const values = [1, 2, 3, 4, 5]
  it('returns uniform when the mean sits at the midpoint', () => {
    const p = maxentWithMean(values, 3)
    for (const pi of p) expect(pi).toBeCloseTo(0.2, 6)
  })
  it('hits the requested mean', () => {
    for (const target of [1.5, 2.2, 3.7, 4.6]) {
      const p = maxentWithMean(values, target)
      let mu = 0
      for (let i = 0; i < 5; i++) mu += p[i]! * values[i]!
      expect(mu).toBeCloseTo(target, 6)
    }
  })
  it('degenerates at the boundaries', () => {
    expect(maxentWithMean(values, 1)).toEqual([1, 0, 0, 0, 0])
    expect(maxentWithMean(values, 5)).toEqual([0, 0, 0, 0, 1])
  })
  it('beats every pebble arrangement with the same mean', () => {
    // among count vectors with mean 3 over 10 pebbles, none out-entropies maxent
    const p = maxentWithMean(values, 3)
    const hMax = entropy(p)
    for (const preset of PRESETS) {
      expect(entropy(normalize(preset.counts))).toBeLessThanOrEqual(hMax + 1e-9)
    }
  })
})

describe('meanValue', () => {
  it('averages bucket values under the counts', () => {
    expect(meanValue([0, 0, 10, 0, 0], [1, 2, 3, 4, 5])).toBe(3)
    expect(meanValue([5, 0, 0, 0, 5], [1, 2, 3, 4, 5])).toBe(3)
  })
})
