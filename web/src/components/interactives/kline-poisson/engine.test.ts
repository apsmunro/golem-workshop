/**
 * Tolerances: parsing exact; m11.10 curve behavior structural (order
 * relations) plus intercepts within ±0.3 of the book's posterior
 * means; offset MLEs within 12% of truth for a 200-record seeded sim.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import {
  expectedTools,
  fitKline,
  klineRows,
  poisson,
  rateIgnoringExposure,
  rateWithOffset,
  simulateLedger,
} from './engine'

const csv = readFileSync(
  resolve(__dirname, '../../../../public/data/datasets/Kline.csv'),
  'utf-8',
)

describe('klineRows', () => {
  const rows = klineRows(csv)
  it('parses the ten societies', () => {
    expect(rows).toHaveLength(10)
    expect(rows.map((r) => r.culture)).toContain('Hawaii')
    expect(rows.filter((r) => r.highContact)).toHaveLength(5)
  })
  it('standardizes log population to mean 0, sd 1', () => {
    const m = rows.reduce((a, r) => a + r.logPopStd, 0) / 10
    expect(m).toBeCloseTo(0, 9)
    const v = rows.reduce((a, r) => a + r.logPopStd ** 2, 0) / 9
    expect(Math.sqrt(v)).toBeCloseTo(1, 9)
  })
  it('Hawaii is the population outlier with the most tools', () => {
    const hawaii = rows.find((r) => r.culture === 'Hawaii')!
    expect(hawaii.tools).toBe(71)
    expect(hawaii.logPopStd).toBeGreaterThan(1.5)
    expect(hawaii.highContact).toBe(false)
  })
})

describe('fitKline — m11.10', () => {
  const rows = klineRows(csv)
  const fit = fitKline(rows)
  const draws = fit.draws(1500, new RNG(1959))

  it('intercepts land near the book (a_low ≈ 0.85·e-ish scale: log ~3.2/3.6 tools)', () => {
    // book m11.10 posterior means: a[low] ≈ 3.32, a[high] ≈ 3.61 on log scale
    const iLow = fit.names.indexOf('aLow')
    const iHigh = fit.names.indexOf('aHigh')
    expect(Math.abs(fit.mode[iLow]! - 3.32)).toBeLessThan(0.3)
    expect(Math.abs(fit.mode[iHigh]! - 3.61)).toBeLessThan(0.3)
    expect(fit.mode[iHigh]!).toBeGreaterThan(fit.mode[iLow]!)
  })
  it('tools rise with population for both contact levels', () => {
    for (const hc of [false, true]) {
      const lo = expectedTools(draws, -1, hc)
      const mid = expectedTools(draws, 0, hc)
      const hi = expectedTools(draws, 1.5, hc)
      expect(mid.mean).toBeGreaterThan(lo.mean)
      expect(hi.mean).toBeGreaterThan(mid.mean)
    }
  })
  it('high contact buys more tools at an average population', () => {
    expect(expectedTools(draws, 0, true).mean).toBeGreaterThan(
      expectedTools(draws, 0, false).mean,
    )
  })
})

describe('the exposure lab', () => {
  it('Poisson simulation matches its mean', () => {
    const rng = new RNG(1959, 7)
    let s = 0
    const n = 4000
    for (let i = 0; i < n; i++) s += poisson(rng, 3.5)
    expect(s / n).toBeGreaterThan(3.3)
    expect(s / n).toBeLessThan(3.7)
  })
  it('the offset recovers the daily rate; ignoring exposure inflates it', () => {
    const rng = new RNG(1959, 8)
    const weekly = simulateLedger(rng, 0.5, 7, 200)
    const withOffset = rateWithOffset(weekly)
    const without = rateIgnoringExposure(weekly)
    expect(Math.abs(withOffset - 0.5)).toBeLessThan(0.06)
    // without the offset the "rate" is the weekly total, ~7× too big
    expect(without).toBeGreaterThan(3)
    expect(without / withOffset).toBeCloseTo(7, 5)
  })
})
