/**
 * Tolerances: probability identities to 1e-9; the book's m12.4
 * cutpoints recovered from the shipped Trolley aggregate within ±0.03
 * (they are the same closed form the book's posterior means approach).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  categoryProbs,
  clampCutpoint,
  cutpointsFromCounts,
  logisticPdf,
  logit,
  meanResponse,
  pooledCounts,
  proportions,
} from './engine'
import type { TrolleyCell } from './engine'

const cells = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../public/data/datasets/trolley_counts.json'),
    'utf-8',
  ),
) as TrolleyCell[]

describe('categoryProbs', () => {
  const cuts = [-2, -1, 0, 0.7, 1.3, 2]
  it('sums to one and stays positive', () => {
    const p = categoryProbs(cuts)
    expect(p).toHaveLength(7)
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9)
    for (const pi of p) expect(pi).toBeGreaterThan(0)
  })
  it('a positive shift moves mass toward the high categories', () => {
    const low = meanResponse(categoryProbs(cuts, -1))
    const mid = meanResponse(categoryProbs(cuts, 0))
    const high = meanResponse(categoryProbs(cuts, 1))
    expect(mid).toBeGreaterThan(low)
    expect(high).toBeGreaterThan(mid)
  })
})

describe('cutpointsFromCounts', () => {
  it('round-trips through categoryProbs', () => {
    const counts = [10, 20, 30, 60, 40, 25, 15]
    const cuts = cutpointsFromCounts(counts)
    const p = categoryProbs(cuts)
    const obs = proportions(counts)
    for (let k = 0; k < 7; k++) expect(p[k]!).toBeCloseTo(obs[k]!, 9)
  })
  it('recovers the book’s m12.4 cutpoints from the full Trolley data', () => {
    const all = pooledCounts(cells)
    expect(all.reduce((a, b) => a + b, 0)).toBe(9930)
    const cuts = cutpointsFromCounts(all)
    const book = [-1.92, -1.27, -0.72, 0.25, 0.89, 1.77]
    for (let k = 0; k < 6; k++) {
      expect(Math.abs(cuts[k]! - book[k]!)).toBeLessThan(0.03)
    }
  })
})

describe('the aggregate file', () => {
  it('holds the six treatment cells (contact never rides with action)', () => {
    expect(cells).toHaveLength(6)
    for (const c of cells) expect(c.action * c.contact).toBe(0)
  })
  it('intention + contact is the harshest story', () => {
    const worst = cells.find((c) => c.intention === 1 && c.contact === 1)!
    const m = meanResponse(proportions(worst.counts))
    for (const c of cells) {
      if (c !== worst) {
        expect(meanResponse(proportions(c.counts))).toBeGreaterThan(m)
      }
    }
  })
})

describe('clampCutpoint', () => {
  const cuts = [-2, -1, 0, 1, 2, 3]
  it('keeps a dragged cutpoint between its neighbors', () => {
    expect(clampCutpoint(cuts, 2, 5)).toBeCloseTo(1 - 0.08, 9)
    expect(clampCutpoint(cuts, 2, -5)).toBeCloseTo(-1 + 0.08, 9)
    expect(clampCutpoint(cuts, 2, 0.5)).toBe(0.5)
  })
  it('lets the outer cutpoints reach the axis limits', () => {
    expect(clampCutpoint(cuts, 0, -10)).toBe(-6)
    expect(clampCutpoint(cuts, 5, 10)).toBe(6)
  })
})

describe('logisticPdf and logit', () => {
  it('pdf peaks at 0 with value 1/4 and is symmetric', () => {
    expect(logisticPdf(0)).toBeCloseTo(0.25, 9)
    expect(logisticPdf(1.3)).toBeCloseTo(logisticPdf(-1.3), 12)
  })
  it('logit inverts the logistic cdf', () => {
    expect(logit(0.5)).toBeCloseTo(0, 9)
    expect(logit(0.75)).toBeCloseTo(Math.log(3), 9)
    expect(() => logit(0)).toThrow(RangeError)
  })
})
