import { describe, expect, it } from 'vitest'
import { RNG } from '../../lib/rng'
import {
  DEFAULTS,
  curveAlpha,
  curveRise,
  initCurves,
  makeCurve,
  tickCurves,
} from './living-posterior-engine'
import type { EngineOptions } from './living-posterior-engine'

const opts: EngineOptions = { ...DEFAULTS, range: [0, 1] }

function fakeDraws(): number[] {
  const rng = new RNG(42)
  return Array.from({ length: 2000 }, () => rng.beta(7, 4))
}

describe('makeCurve', () => {
  it('produces normalized, finite curves on the unit grid', () => {
    const curve = makeCurve(fakeDraws(), new RNG(1), opts)
    expect(curve.xs[0]).toBeCloseTo(0, 9)
    expect(curve.xs[curve.xs.length - 1]).toBeCloseTo(1, 9)
    expect(Math.max(...curve.ys)).toBeCloseTo(1, 9)
    expect(curve.ys.every((y) => Number.isFinite(y) && y >= 0)).toBe(true)
    expect(curve.scale).toBeGreaterThanOrEqual(0.75)
    expect(curve.scale).toBeLessThanOrEqual(1)
  })

  it('is deterministic under a fixed seed', () => {
    const a = makeCurve(fakeDraws(), new RNG(9), opts)
    const b = makeCurve(fakeDraws(), new RNG(9), opts)
    expect(a.ys).toEqual(b.ys)
  })
})

describe('lifecycle', () => {
  it('staggers initial ages across the flock', () => {
    const curves = initCurves(fakeDraws(), new RNG(1), opts)
    const ages = curves.map((c) => c.age)
    expect(new Set(ages.map((a) => a.toFixed(3))).size).toBe(opts.curveCount)
    expect(Math.max(...ages)).toBeLessThan(1)
  })

  it('tick advances age and respawns finished curves', () => {
    const draws = fakeDraws()
    const rng = new RNG(1)
    const curves = initCurves(draws, rng, opts)
    const oldest = curves[curves.length - 1]!
    const oldYs = oldest.ys.slice()
    // Advance far enough that the oldest curve wraps.
    tickCurves(curves, opts.lifetime * 0.5, draws, rng, opts)
    const replaced = curves[curves.length - 1]!
    expect(replaced.age).toBeLessThan(1)
    expect(replaced.ys).not.toEqual(oldYs)
  })
})

describe('alpha and rise', () => {
  it('alpha is zero at both ends of life and positive mid-life', () => {
    expect(curveAlpha(0)).toBeCloseTo(0, 9)
    expect(curveAlpha(1)).toBeCloseTo(0, 6)
    expect(curveAlpha(0.5)).toBeGreaterThan(0.3)
    expect(curveAlpha(0.5)).toBeLessThanOrEqual(0.55)
  })

  it('rise is monotone from 0 to 1', () => {
    expect(curveRise(0)).toBe(0)
    expect(curveRise(1)).toBe(1)
    let prev = 0
    for (let t = 0.1; t <= 1; t += 0.1) {
      const r = curveRise(t)
      expect(r).toBeGreaterThanOrEqual(prev)
      prev = r
    }
  })
})
