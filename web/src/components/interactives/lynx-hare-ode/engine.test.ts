/**
 * lynx-hare-ode engine tests.
 *
 * The Lotka–Volterra system has known analytic properties, and RK4 must
 * respect them: the interior fixed point is stationary, an off-equilibrium
 * orbit is periodic (it returns near its start), the conserved quantity
 * stays nearly constant along a trajectory, and the equilibrium formula is
 * (m_L/b_L, b_H/m_H). Determinism follows from the seeded ensemble.
 */
import { describe, expect, it } from 'vitest'
import {
  DEFAULTS,
  INIT,
  ensemble,
  equilibrium,
  integrate,
  rk4Step,
} from './engine'
import type { LvParams, State } from './engine'

describe('equilibrium', () => {
  it('is (m_L/b_L, b_H/m_H)', () => {
    const [h, l] = equilibrium(DEFAULTS)
    expect(h).toBeCloseTo(DEFAULTS.mL / DEFAULTS.bL, 10)
    expect(l).toBeCloseTo(DEFAULTS.bH / DEFAULTS.mH, 10)
  })

  it('is a fixed point: the derivative there is zero, so it does not move', () => {
    const eq = equilibrium(DEFAULTS)
    let s: State = [eq[0], eq[1]]
    for (let i = 0; i < 500; i++) s = rk4Step(s, DEFAULTS, 0.02)
    expect(s[0]).toBeCloseTo(eq[0], 4)
    expect(s[1]).toBeCloseTo(eq[1], 4)
  })
})

describe('integrate', () => {
  it('produces a periodic orbit that returns near its start', () => {
    const tr = integrate(DEFAULTS, INIT, 40, 0.01)
    // find the closest return to the start after a full swing
    let best = Infinity
    let bestT = 0
    for (let i = 200; i < tr.t.length; i++) {
      const d = Math.hypot(tr.H[i]! - INIT[0], tr.L[i]! - INIT[1])
      if (d < best) {
        best = d
        bestT = tr.t[i]!
      }
    }
    expect(best).toBeLessThan(1) // comes back within 1k pelts
    expect(bestT).toBeGreaterThan(5) // after a real period, not immediately
  })

  it('nearly conserves the Lotka–Volterra invariant along a trajectory', () => {
    const p: LvParams = DEFAULTS
    const V = ([h, l]: State) =>
      p.bL * h - p.mL * Math.log(h) + p.mH * l - p.bH * Math.log(l)
    const tr = integrate(p, INIT, 30, 0.005)
    const v0 = V([tr.H[0]!, tr.L[0]!])
    let maxDev = 0
    for (let i = 0; i < tr.t.length; i += 50) {
      maxDev = Math.max(maxDev, Math.abs(V([tr.H[i]!, tr.L[i]!]) - v0))
    }
    expect(maxDev).toBeLessThan(0.02) // RK4 drifts very little
  })

  it('keeps populations non-negative', () => {
    const tr = integrate(DEFAULTS, [40, 2], 60, 0.02)
    expect(Math.min(...tr.H)).toBeGreaterThanOrEqual(0)
    expect(Math.min(...tr.L)).toBeGreaterThanOrEqual(0)
  })
})

describe('ensemble', () => {
  it('is deterministic under a fixed seed and returns n traces', () => {
    const a = ensemble(DEFAULTS, INIT, 20, 6, 7)
    const b = ensemble(DEFAULTS, INIT, 20, 6, 7)
    expect(a).toHaveLength(6)
    expect(a[2]!.H[100]).toBe(b[2]!.H[100])
  })
})
