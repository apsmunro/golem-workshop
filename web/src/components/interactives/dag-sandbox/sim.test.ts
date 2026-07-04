/**
 * Simulation and OLS bias checks. Tolerances: n = 8000 draws, seeded;
 * coefficient recovery within ±0.06 of truth; bias detection requires
 * |bias| > 0.2 where theory says the confounded estimate is far off.
 */
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import { presetById } from './presets'
import { biasDemo, edgeKey, olsCoefs, simulateFromDag, topoOrder } from './sim'

const N = 8000

describe('topoOrder', () => {
  it('parents always precede children', () => {
    const dag = presetById('waffles')!.dag
    const order = topoOrder(dag)
    for (const [from, to] of dag.edges) {
      expect(order.indexOf(from)).toBeLessThan(order.indexOf(to))
    }
  })
})

describe('olsCoefs', () => {
  it('recovers known coefficients from a clean linear system', () => {
    const rng = new RNG(11)
    const x1 = new Float64Array(N)
    const x2 = new Float64Array(N)
    const y = new Float64Array(N)
    for (let i = 0; i < N; i++) {
      x1[i] = rng.normal()
      x2[i] = rng.normal()
      y[i] = 2 + 1.5 * x1[i]! - 0.7 * x2[i]! + rng.normal(0, 0.5)
    }
    const b = olsCoefs(y, { x1, x2 })
    expect(b['x1']).toBeCloseTo(1.5, 1)
    expect(b['x2']).toBeCloseTo(-0.7, 1)
  })
})

describe('bias demos', () => {
  it('fork: unadjusted estimate is confounded; adjusting on Z recovers 0', () => {
    const dag = presetById('fork')!.dag
    const r = biasDemo(dag, 'X', 'Y', new Set(['Z']), N, new RNG(7))
    expect(r.truth).toBe(0)
    expect(Math.abs(r.unadjusted)).toBeGreaterThan(0.2)
    expect(Math.abs(r.adjusted)).toBeLessThan(0.06)
  })

  it('waffles with a zero W → D effect: raw estimate is fooled, {S} fixes it', () => {
    const dag = presetById('waffles')!.dag
    const coefs = { [edgeKey('W', 'D')]: 0 }
    const r = biasDemo(dag, 'W', 'D', new Set(['S']), N, new RNG(1959), coefs)
    expect(r.truth).toBe(0)
    expect(Math.abs(r.unadjusted)).toBeGreaterThan(0.2)
    expect(Math.abs(r.adjusted)).toBeLessThan(0.06)
  })

  it('collider: adjusting on Z manufactures an association from nothing', () => {
    const dag = presetById('collider')!.dag
    const r = biasDemo(dag, 'X', 'Y', new Set(['Z']), N, new RNG(3))
    expect(r.truth).toBe(0)
    expect(Math.abs(r.unadjusted)).toBeLessThan(0.06)
    expect(Math.abs(r.adjusted)).toBeGreaterThan(0.2)
  })

  it('fungus: conditioning on F hides a real treatment effect', () => {
    const dag = presetById('fungus')!.dag
    // make the true chain negative-ish and visible: T -> F (-1), F -> H1 (-1)
    const coefs = {
      [edgeKey('T', 'F')]: -1,
      [edgeKey('F', 'H1')]: -1,
    }
    const clean = biasDemo(dag, 'T', 'H1', new Set(), N, new RNG(5), coefs)
    const blocked = biasDemo(dag, 'T', 'H1', new Set(['F']), N, new RNG(5), coefs)
    // total effect through the pipe is (-1)(-1) = +1
    expect(clean.adjusted).toBeCloseTo(1, 1)
    expect(Math.abs(blocked.adjusted)).toBeLessThan(0.06)
  })

  it('simulateFromDag columns have plausible marginal scale', () => {
    const dag = presetById('pipe')!.dag
    const data = simulateFromDag(dag, N, new RNG(2))
    // Y = Z + e, Z = X + e ⇒ var(Y) = 3
    const y = data['Y']!
    let m = 0
    for (const v of y) m += v
    m /= N
    let s2 = 0
    for (const v of y) s2 += (v - m) * (v - m)
    s2 /= N - 1
    expect(m).toBeCloseTo(0, 1)
    expect(s2).toBeCloseTo(3, 0)
  })
})
