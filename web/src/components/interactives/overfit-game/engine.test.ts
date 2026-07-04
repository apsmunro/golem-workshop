/**
 * Overfit-game engine tests.
 * Tolerances: exact polynomial recovery to 1e-6 (ridge is 1e-9);
 * statistical assertions use a fixed seed, so bounds are exact for
 * this stream, chosen with room to spare.
 */
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import {
  comparisonRows,
  deviance,
  fitPoly,
  generateSample,
  looDeviance,
  predict,
  scoreDegrees,
  trueMean,
} from './engine'

describe('fitPoly', () => {
  it('recovers an exact polynomial', () => {
    const x = [-1, -0.6, -0.2, 0.2, 0.6, 1, 0.8, -0.8]
    const y = x.map((v) => 2 - 3 * v + 1.5 * v * v)
    const fit = fitPoly({ x, y }, 2)
    expect(fit.coefs[0]).toBeCloseTo(2, 6)
    expect(fit.coefs[1]).toBeCloseTo(-3, 6)
    expect(fit.coefs[2]).toBeCloseTo(1.5, 6)
  })

  it('is deterministic and train deviance never rises with degree', () => {
    const sample = generateSample(12, new RNG(1959))
    const again = generateSample(12, new RNG(1959))
    expect(sample).toEqual(again)
    let prev = Infinity
    for (const degree of [1, 2, 3, 4, 5, 6]) {
      const fit = fitPoly(sample, degree)
      expect(fit.trainDeviance).toBeLessThanOrEqual(prev + 1e-9)
      prev = fit.trainDeviance
    }
  })

  it('rejects degrees the sample cannot support', () => {
    const sample = generateSample(4, new RNG(1))
    expect(() => fitPoly(sample, 4)).toThrow(RangeError)
  })
})

describe('predict/deviance', () => {
  it('deviance equals the closed form for one point', () => {
    // y = mu exactly, sigma = 1: −2 log N(0|0,1) = log(2π)
    const d = deviance([0], 1, { x: [0.3], y: [0] })
    expect(d).toBeCloseTo(Math.log(2 * Math.PI), 10)
  })

  it('predict evaluates the polynomial', () => {
    expect(predict([1, 2, 3], 2)).toBeCloseTo(1 + 4 + 12, 12)
  })
})

describe('out-of-sample truth', () => {
  it('LOO and test deviance prefer low degree over the saturated fit', () => {
    // averaged over several seeded samples so the assertion is about the
    // phenomenon, not one lucky draw
    let loo2 = 0
    let loo6 = 0
    let test2 = 0
    let test6 = 0
    for (const seed of [11, 22, 33, 44, 55]) {
      const sample = generateSample(12, new RNG(seed))
      const scores = scoreDegrees(sample, [2, 6], seed)
      loo2 += scores[0]!.looDeviance
      loo6 += scores[1]!.looDeviance
      test2 += scores[0]!.testDeviance
      test6 += scores[1]!.testDeviance
    }
    expect(loo2).toBeLessThan(loo6)
    expect(test2).toBeLessThan(test6)
  })

  it('looDeviance exceeds train deviance (fitting the fold you score is easier)', () => {
    const sample = generateSample(12, new RNG(7))
    for (const degree of [1, 2, 3, 4]) {
      const fit = fitPoly(sample, degree)
      expect(looDeviance(sample, degree)).toBeGreaterThan(fit.trainDeviance)
    }
  })

  it('the true curve sits inside the sampled cloud', () => {
    const sample = generateSample(400, new RNG(3))
    const resid = sample.y.map((y, i) => y - trueMean(sample.x[i]!))
    const meanResid = resid.reduce((a, b) => a + b, 0) / resid.length
    expect(Math.abs(meanResid)).toBeLessThan(0.05)
  })
})

describe('comparisonRows', () => {
  it('sorts by score, weights sum to 1, best has delta 0', () => {
    const rows = comparisonRows([
      { label: 'deg 4', score: 40 },
      { label: 'deg 2', score: 31 },
      { label: 'deg 1', score: 35 },
    ])
    expect(rows.map((r) => r.label)).toEqual(['deg 2', 'deg 1', 'deg 4'])
    expect(rows[0]!.delta).toBe(0)
    const total = rows.reduce((a, r) => a + r.weight, 0)
    expect(total).toBeCloseTo(1, 12)
    expect(rows[0]!.weight).toBeGreaterThan(rows[1]!.weight)
  })

  it('handles the empty list', () => {
    expect(comparisonRows([])).toEqual([])
  })
})
