/**
 * cafe-ellipse engine tests.
 *
 * The 2×2 linear algebra is checked against hand computation; the Gaussian
 * conjugate shrinkage against its two limits (no data vs. no prior); and the
 * pedagogical claim that a negatively correlated prior tilts the shrinkage
 * off the coordinate axes. Ellipse geometry is validated on a known
 * covariance. Matches the m14.1 café simulation (§14.1).
 */
import { describe, expect, it } from 'vitest'
import {
  covMatrix,
  ellipseAxes,
  inv2,
  matVec,
  shrink,
  simulateCafes,
  poolCafes,
} from './engine'
import type { Mat2, Vec2 } from './engine'

describe('2×2 algebra', () => {
  it('inverts and multiplies consistently', () => {
    const m: Mat2 = [4, 1, 1, 3]
    const inv = inv2(m)
    // m · m⁻¹ · v == v
    const v: Vec2 = [2, -5]
    const back = matVec(m, matVec(inv, v))
    expect(back[0]).toBeCloseTo(v[0], 10)
    expect(back[1]).toBeCloseTo(v[1], 10)
  })

  it('builds covariance from sd and correlation', () => {
    const c = covMatrix(2, 3, -0.5)
    expect(c).toEqual([4, -3, -3, 9])
  })
})

describe('ellipse geometry', () => {
  it('a diagonal covariance gives axis-aligned axes', () => {
    const { angle, major, minor } = ellipseAxes([9, 0, 0, 1], 1)
    expect(major).toBeCloseTo(3, 10)
    expect(minor).toBeCloseTo(1, 10)
    expect(Math.abs(Math.sin(angle))).toBeCloseTo(0, 10) // 0 or π → horizontal major
  })

  it('a negative correlation tilts the major axis into the second/fourth quadrant', () => {
    const { angle } = ellipseAxes(covMatrix(1, 1, -0.7), 1)
    expect(Math.sin(angle) * Math.cos(angle)).toBeLessThan(0) // downward-sloping
  })
})

describe('Gaussian shrinkage', () => {
  const prior: Mat2 = covMatrix(1, 0.5, -0.7)
  const S: Mat2 = [0.4, 0, 0, 0.55]
  const mu: Vec2 = [3.5, -1]

  it('with vanishing sampling noise, keeps the raw estimate', () => {
    const raw: Vec2 = [5, -2]
    const tight: Mat2 = [1e-6, 0, 0, 1e-6]
    const p = shrink(raw, tight, mu, prior)
    expect(p[0]).toBeCloseTo(raw[0], 3)
    expect(p[1]).toBeCloseTo(raw[1], 3)
  })

  it('with a vanishing prior width, collapses to the mean', () => {
    const raw: Vec2 = [5, -2]
    const tightPrior: Mat2 = [1e-6, 0, 0, 1e-6]
    const p = shrink(raw, S, mu, tightPrior)
    expect(p[0]).toBeCloseTo(mu[0], 3)
    expect(p[1]).toBeCloseTo(mu[1], 3)
  })

  it('a correlated prior moves the slope even when only the intercept is off', () => {
    // raw café sits at the mean slope but well above the mean intercept
    const raw: Vec2 = [mu[0] + 2, mu[1]]
    const withCorr = shrink(raw, S, mu, covMatrix(1, 0.5, -0.7))
    const noCorr = shrink(raw, S, mu, covMatrix(1, 0.5, 0))
    // the uncorrelated prior leaves the slope essentially at the mean;
    // the correlated prior pulls the slope downward (negative correlation)
    expect(noCorr[1]).toBeCloseTo(mu[1], 2)
    expect(withCorr[1]).toBeLessThan(noCorr[1] - 0.05)
  })
})

describe('simulation', () => {
  it('is deterministic and produces the requested count', () => {
    const a = simulateCafes(20, 5)
    const b = simulateCafes(20, 5)
    expect(a).toHaveLength(20)
    expect(a[3]!.raw).toEqual(b[3]!.raw)
  })

  it('pooled estimates sit between raw and the population mean', () => {
    const cafes = simulateCafes(20, 1)
    const mu: Vec2 = [3.5, -1]
    const pooled = poolCafes(cafes, mu, covMatrix(1, 0.5, -0.7))
    // average distance to the mean should shrink
    const rawDist = cafes.reduce((s, c) => s + Math.hypot(c.raw[0] - mu[0], c.raw[1] - mu[1]), 0)
    const poolDist = pooled.reduce((s, c) => s + Math.hypot(c.pooled[0] - mu[0], c.pooled[1] - mu[1]), 0)
    expect(poolDist).toBeLessThan(rawDist)
  })
})
