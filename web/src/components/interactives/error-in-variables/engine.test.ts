/**
 * error-in-variables engine tests.
 *
 * Validated against the divorce measurement-error model of §15.1: parsing
 * the SE column, the shrinkage limits (a precise measurement barely moves,
 * a noisy one shrinks toward the line), and that high-SE states move more
 * than low-SE ones. OLS is checked against a hand-fit line.
 */
import { describe, expect, it } from 'vitest'
import {
  fitErrorInVariables,
  ols,
  parseWaffles,
  standardize,
} from './engine'
import type { StandardWaffles } from './engine'

const CSV = `Location;Loc;Population;MedianAgeMarriage;Marriage;Marriage SE;Divorce;Divorce SE
Alabama;AL;4.78;25.3;20.2;1.27;12.7;0.79
Alaska;AK;0.71;25.2;26.0;2.93;12.5;2.05
Arizona;AZ;6.33;25.8;20.3;0.98;10.8;0.74`

describe('parseWaffles', () => {
  it('reads the age, divorce, and SE columns', () => {
    const rows = parseWaffles(CSV)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ loc: 'AL', ageMarriage: 25.3, divorce: 12.7, divorceSE: 0.79 })
    expect(rows[1]!.divorceSE).toBe(2.05)
  })
})

describe('ols', () => {
  it('recovers a known line', () => {
    // y = 2 + 3x exactly
    const x = [0, 1, 2, 3, 4]
    const y = x.map((v) => 2 + 3 * v)
    const line = ols(x, y)
    expect(line.a).toBeCloseTo(2, 8)
    expect(line.b).toBeCloseTo(3, 8)
  })
})

describe('measurement-error shrinkage', () => {
  // four precise points on the clean line y = x, plus one noisy outlier at
  // the edge (A = 2, high influence) whose observed value (5) sits above 2
  const data: StandardWaffles = {
    loc: ['a', 'b', 'c', 'd', 'e'],
    A: [-2, -1, 0, 1, 2],
    Dobs: [-2, -1, 0, 1, 5],
    Dse: [0.05, 0.05, 0.05, 0.05, 1.5],
  }

  it('pulls the noisy outlier hard toward the line', () => {
    const fit = fitErrorInVariables(data)
    const outlierIdx = 4
    const moved = Math.abs(fit.Dtrue[outlierIdx]! - data.Dobs[outlierIdx]!)
    const preciseMoved = Math.abs(fit.Dtrue[0]! - data.Dobs[0]!)
    expect(moved).toBeGreaterThan(preciseMoved * 10)
    // the corrected value drops from 5 toward the line's value near 2
    expect(fit.Dtrue[outlierIdx]!).toBeLessThan(3)
    expect(fit.Dtrue[outlierIdx]!).toBeGreaterThan(1.5)
  })

  it('the corrected slope differs from the naive slope', () => {
    const fit = fitErrorInVariables(data)
    // the edge outlier steepens the naive fit above 1
    expect(fit.naive.b).toBeGreaterThan(1.3)
    expect(fit.corrected.b).not.toBeCloseTo(fit.naive.b, 2)
    // with the outlier discounted, the corrected line is close to slope 1
    expect(fit.corrected.b).toBeCloseTo(1, 1)
  })

  it('a precise measurement barely shrinks', () => {
    const fit = fitErrorInVariables(data)
    for (const i of [0, 1, 2, 3]) {
      expect(Math.abs(fit.Dtrue[i]! - data.Dobs[i]!)).toBeLessThan(0.1)
    }
  })
})

describe('standardize', () => {
  it('centers and scales A and D to unit sd', () => {
    const rows = parseWaffles(CSV)
    const s = standardize(rows)
    const meanA = s.A.reduce((a, b) => a + b, 0) / s.A.length
    expect(meanA).toBeCloseTo(0, 8)
    // SE is scaled into z-units, so it stays positive and finite
    for (const se of s.Dse) expect(se).toBeGreaterThan(0)
  })
})
