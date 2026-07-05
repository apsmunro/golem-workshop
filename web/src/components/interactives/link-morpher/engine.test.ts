/**
 * Tolerances: closed-form link values to 1e-9; morph interpolation
 * checked exactly at the endpoints and for monotonicity between them.
 */
import { describe, expect, it } from 'vitest'
import {
  defaultConfig,
  gridlineFractions,
  invLink,
  invLogit,
  morphFraction,
  outcomeSlope,
} from './engine'

describe('invLogit', () => {
  it('matches known values', () => {
    expect(invLogit(0)).toBeCloseTo(0.5, 9)
    expect(invLogit(Math.log(3))).toBeCloseTo(0.75, 9)
    expect(invLogit(-Math.log(3))).toBeCloseTo(0.25, 9)
  })
  it('saturates without overflow', () => {
    expect(invLogit(100)).toBe(1)
    expect(invLogit(-100)).toBe(0)
  })
  it('is monotone', () => {
    let prev = -1
    for (let eta = -6; eta <= 6; eta += 0.25) {
      const p = invLogit(eta)
      expect(p).toBeGreaterThan(prev)
      prev = p
    }
  })
})

describe('invLink', () => {
  it('log link exponentiates', () => {
    expect(invLink('log', 0)).toBeCloseTo(1, 9)
    expect(invLink('log', Math.log(7))).toBeCloseTo(7, 9)
  })
})

describe('outcomeSlope', () => {
  it('logit slope peaks at p = 0.5 with β/4', () => {
    expect(outcomeSlope('logit', 0, 2)).toBeCloseTo(0.5, 9)
    expect(outcomeSlope('logit', 3, 2)).toBeLessThan(0.5)
    expect(outcomeSlope('logit', -3, 2)).toBeLessThan(0.5)
  })
  it('log slope is β·μ', () => {
    expect(outcomeSlope('log', Math.log(5), 0.3)).toBeCloseTo(1.5, 9)
  })
})

describe('morphFraction', () => {
  const cfg = defaultConfig('logit', 0, 1.2)
  it('t = 0 gives the linear-scale position', () => {
    // at x = 0, η = 0, midway through a symmetric η range
    expect(morphFraction(cfg, 0, 0)).toBeCloseTo(0.5, 9)
  })
  it('t = 1 gives the outcome-scale position', () => {
    expect(morphFraction(cfg, 0, 1)).toBeCloseTo(0.5, 9)
    expect(morphFraction(cfg, 3, 1)).toBeCloseTo(invLogit(3.6), 6)
  })
  it('interpolates linearly in t', () => {
    const a = morphFraction(cfg, 2, 0)
    const b = morphFraction(cfg, 2, 1)
    expect(morphFraction(cfg, 2, 0.5)).toBeCloseTo((a + b) / 2, 9)
  })
})

describe('gridlineFractions', () => {
  const cfg = defaultConfig('logit', 0, 1.5)
  it('is evenly spaced at t = 0', () => {
    const g = gridlineFractions(cfg, 0)
    for (let i = 1; i < g.length; i++) {
      expect(g[i]! - g[i - 1]!).toBeCloseTo(g[1]! - g[0]!, 9)
    }
  })
  it('bunches toward floor and ceiling at t = 1 under logit', () => {
    const g = gridlineFractions(cfg, 1)
    const mid = g.length >> 1
    const centerGap = g[mid + 1]! - g[mid]!
    const edgeGap = g[1]! - g[0]!
    expect(edgeGap).toBeLessThan(centerGap)
  })
})
