/**
 * Divergence-detective engine tests.
 *
 * The pedagogical claims, stated as assertions: a centered funnel sampler
 * with a modest step size throws many more divergences than a non-centered
 * one on the same problem, and the non-centered chain reaches deeper into
 * the neck (more negative v). The transform is checked against its
 * definition. Determinism is guaranteed by the seeded RNG.
 */
import { describe, expect, it } from 'vitest'
import { runCentered, runNonCentered, toFunnelSpace } from './engine'

describe('toFunnelSpace', () => {
  it('applies v = 3r and x = z·exp(v/2)', () => {
    expect(toFunnelSpace([0, 0])).toEqual([0, 0])
    const [x, v] = toFunnelSpace([1, 1])
    expect(v).toBeCloseTo(3, 12)
    expect(x).toBeCloseTo(Math.exp(1.5), 12)
  })
})

describe('centered vs non-centered', () => {
  it('centering throws far more divergences at a shared step size', () => {
    // ε large enough to break the neck for the centered chain
    const cen = runCentered(0.9, 12, 800, 1)
    const non = runNonCentered(0.9, 12, 800, 1)
    expect(cen.divergences).toBeGreaterThan(non.divergences)
    expect(cen.divergences).toBeGreaterThan(20)
  })

  it('non-centering reaches deeper into the neck', () => {
    const cen = runCentered(0.9, 12, 800, 2)
    const non = runNonCentered(0.9, 12, 800, 2)
    // more negative v = deeper neck exploration
    expect(non.minV).toBeLessThan(cen.minV)
  })

  it('is deterministic under a fixed seed', () => {
    const a = runCentered(0.6, 10, 300, 7)
    const b = runCentered(0.6, 10, 300, 7)
    expect(a.divergences).toBe(b.divergences)
    expect(a.samples.length).toBe(b.samples.length)
    expect(a.samples[100]!.q).toEqual(b.samples[100]!.q)
  })

  it('returns one sample per iteration', () => {
    expect(runNonCentered(0.5, 8, 250, 3).samples).toHaveLength(250)
  })
})
