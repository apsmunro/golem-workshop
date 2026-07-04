/**
 * HMC engine tests.
 * Tolerances: energy conservation |ΔH| < 1e-3 at ε = 0.01, L = 100 on the
 * unit Gaussian; moment checks on 4,000 draws allow ±0.1 on means/sds and
 * ±0.12 on the correlation — generous against MC error at that run length,
 * tight against any actual bug in the integrator or accept step.
 */
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import {
  correlatedGaussian,
  densityGrid,
  funnel,
  hmcStep,
  runChain,
} from './engine'
import type { Vec2 } from './engine'

describe('targets', () => {
  it('gaussian gradient matches finite differences', () => {
    const t = correlatedGaussian(0.6)
    const q: Vec2 = [0.7, -1.2]
    const h = 1e-6
    const g = t.grad(q)
    const gx = (t.logDensity([q[0] + h, q[1]]) - t.logDensity([q[0] - h, q[1]])) / (2 * h)
    const gy = (t.logDensity([q[0], q[1] + h]) - t.logDensity([q[0], q[1] - h])) / (2 * h)
    expect(g[0]).toBeCloseTo(gx, 5)
    expect(g[1]).toBeCloseTo(gy, 5)
  })

  it('funnel gradient matches finite differences', () => {
    const t = funnel()
    const q: Vec2 = [1.5, -2]
    const h = 1e-6
    const g = t.grad(q)
    const gx = (t.logDensity([q[0] + h, q[1]]) - t.logDensity([q[0] - h, q[1]])) / (2 * h)
    const gy = (t.logDensity([q[0], q[1] + h]) - t.logDensity([q[0], q[1] - h])) / (2 * h)
    expect(g[0]).toBeCloseTo(gx, 4)
    expect(g[1]).toBeCloseTo(gy, 4)
  })

  it('rejects degenerate correlation', () => {
    expect(() => correlatedGaussian(1)).toThrow(RangeError)
  })
})

describe('hmcStep', () => {
  it('conserves energy at small step size', () => {
    const t = correlatedGaussian(0)
    const traj = hmcStep(t, [1, 1], 0.01, 100, new RNG(1959))
    expect(Math.abs(traj.deltaH)).toBeLessThan(1e-3)
    expect(traj.divergent).toBe(false)
    expect(traj.points).toHaveLength(101)
  })

  it('accepts nearly always in the stable regime', () => {
    const t = correlatedGaussian(0.3)
    const rng = new RNG(7)
    let accepted = 0
    let q: Vec2 = [0, 0]
    for (let i = 0; i < 200; i++) {
      const traj = hmcStep(t, q, 0.1, 20, rng)
      q = traj.q1
      if (traj.accepted) accepted++
    }
    expect(accepted / 200).toBeGreaterThan(0.95)
  })

  it('diverges past the stability limit and never accepts that flick', () => {
    // unit Gaussian leapfrog is unstable for eps > 2: energy grows
    // exponentially, so |ΔH| > 50 is guaranteed, not just likely
    const t = correlatedGaussian(0)
    const rng = new RNG(11)
    let sawDivergence = false
    for (let i = 0; i < 20; i++) {
      const traj = hmcStep(t, [1, 0], 3, 30, rng)
      if (traj.divergent) {
        sawDivergence = true
        expect(traj.accepted).toBe(false)
        expect(traj.q1).toEqual([1, 0]) // stays home
      }
    }
    expect(sawDivergence).toBe(true)
  })

  it('validates knobs', () => {
    const t = correlatedGaussian(0)
    const rng = new RNG(1)
    expect(() => hmcStep(t, [0, 0], 0, 10, rng)).toThrow(RangeError)
    expect(() => hmcStep(t, [0, 0], 0.1, 0, rng)).toThrow(RangeError)
    expect(() => hmcStep(t, [0, 0], 0.1, 2.5, rng)).toThrow(RangeError)
  })
})

describe('runChain', () => {
  it('reproduces the correlated Gaussian moments', () => {
    const rho = 0.6
    const { samples, accepted, divergences } = runChain(
      correlatedGaussian(rho),
      [0, 0],
      0.15,
      15,
      4000,
      new RNG(1959),
    )
    const xs = samples.map((s) => s[0])
    const ys = samples.map((s) => s[1])
    const mean = (a: number[]) => a.reduce((p, c) => p + c, 0) / a.length
    const mx = mean(xs)
    const my = mean(ys)
    const sx = Math.sqrt(mean(xs.map((v) => (v - mx) ** 2)))
    const sy = Math.sqrt(mean(ys.map((v) => (v - my) ** 2)))
    const corr = mean(xs.map((v, i) => (v - mx) * (ys[i]! - my))) / (sx * sy)
    expect(Math.abs(mx)).toBeLessThan(0.1)
    expect(Math.abs(my)).toBeLessThan(0.1)
    expect(sx).toBeGreaterThan(0.9)
    expect(sx).toBeLessThan(1.1)
    expect(sy).toBeGreaterThan(0.9)
    expect(sy).toBeLessThan(1.1)
    expect(Math.abs(corr - rho)).toBeLessThan(0.12)
    expect(divergences).toBe(0)
    expect(accepted / samples.length).toBeGreaterThan(0.9)
  })

  it('is deterministic under a fixed seed', () => {
    const t = funnel()
    const a = runChain(t, [0, 0], 0.2, 10, 50, new RNG(42))
    const b = runChain(t, [0, 0], 0.2, 10, 50, new RNG(42))
    expect(a.samples).toEqual(b.samples)
  })

  it('the funnel neck produces divergences at a coarse step size', () => {
    const { divergences } = runChain(funnel(), [0, -3], 0.9, 20, 400, new RNG(3))
    expect(divergences).toBeGreaterThan(0)
  })
})

describe('densityGrid', () => {
  it('normalizes to a max of 1 at the mode', () => {
    const grid = densityGrid(correlatedGaussian(0), 33, 33)
    expect(Math.max(...grid)).toBeCloseTo(1, 6)
    // center cell is the mode for the symmetric window
    expect(grid[16 * 33 + 16]).toBeCloseTo(1, 6)
  })
})
