/**
 * Trace-triage engine tests.
 * Tolerances: R̂ thresholds are 1.05 (healthy passes) and 1.15
 * (unconverged fails) — the generators are tuned to clear these with a
 * wide margin at 3×300 draws, checked across several seeds.
 */
import { describe, expect, it } from 'vitest'
import {
  AILMENTS,
  CHAINS,
  DRAWS,
  effectiveSampleSize,
  makeDeck,
  makeRound,
  splitRhat,
} from './engine'

describe('makeRound', () => {
  it('is deterministic and correctly shaped', () => {
    const a = makeRound('healthy', 42)
    const b = makeRound('healthy', 42)
    expect(a).toEqual(b)
    expect(a.traces).toHaveLength(CHAINS)
    expect(a.traces[0]).toHaveLength(DRAWS)
    expect(a.divergences).toHaveLength(CHAINS)
  })

  it('only the divergent ailment plants divergences', () => {
    for (const ailment of AILMENTS) {
      const total = makeRound(ailment, 7).divergences.flat().length
      if (ailment === 'divergent') expect(total).toBeGreaterThan(4)
      else expect(total).toBe(0)
    }
  })

  it('stuck rounds contain a flatlined stretch', () => {
    const round = makeRound('stuck', 13)
    const flatline = round.traces.some((t) => {
      for (let i = 0; i + 60 < t.length; i++) {
        const win = t.slice(i, i + 60)
        const lo = Math.min(...win)
        const hi = Math.max(...win)
        if (hi - lo < 0.15) return true
      }
      return false
    })
    expect(flatline).toBe(true)
  })
})

describe('splitRhat', () => {
  it('passes healthy chains and fails unconverged ones, across seeds', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      expect(splitRhat(makeRound('healthy', seed).traces)).toBeLessThan(1.05)
      expect(splitRhat(makeRound('unconverged', seed).traces)).toBeGreaterThan(1.15)
    }
  })

  it('flags warm-up left in the sample', () => {
    for (const seed of [1, 2, 3]) {
      expect(splitRhat(makeRound('warmup', seed).traces)).toBeGreaterThan(1.05)
    }
  })

  it('equals √((n−1)/n) when between-chain variance is exactly zero', () => {
    // three copies of the same alternating sequence: B = 0, so the
    // estimator's small-sample floor √((n−1)/n) is the exact value
    const t = Array.from({ length: 100 }, (_, i) => (i % 2 === 0 ? 1 : -1))
    expect(splitRhat([t, t, t])).toBeCloseTo(Math.sqrt(49 / 50), 10)
  })
})

describe('effectiveSampleSize', () => {
  it('near-independent draws keep most of their sample size', () => {
    const ess = effectiveSampleSize(makeRound('healthy', 9).traces)
    expect(ess).toBeGreaterThan(0.25 * CHAINS * DRAWS)
  })

  it('sticky chains lose most of theirs', () => {
    const healthy = effectiveSampleSize(makeRound('healthy', 9).traces)
    const sticky = effectiveSampleSize(makeRound('unconverged', 9).traces)
    expect(sticky).toBeLessThan(healthy / 5)
  })

  it('a constant chain has no information', () => {
    const t = new Array<number>(50).fill(2)
    expect(effectiveSampleSize([t, t, t])).toBe(0)
  })
})

describe('makeDeck', () => {
  it('covers every ailment twice, deterministically', () => {
    const deck = makeDeck(1959)
    expect(deck).toHaveLength(2 * AILMENTS.length)
    for (const ailment of AILMENTS) {
      expect(deck.filter((r) => r.ailment === ailment)).toHaveLength(2)
    }
    expect(makeDeck(1959).map((r) => r.ailment)).toEqual(deck.map((r) => r.ailment))
  })
})
