/**
 * Engine validated against the known marble-counting results for the
 * four-marble bag: data ⬤◯⬤ gives per-conjecture counts 0/3/8/9/0;
 * a further ⬤ gives 0/3/16/27/0. All checks exact — this is counting.
 */
import { describe, expect, it } from 'vitest'
import {
  BAG_SIZE,
  buildTree,
  conjectureCompositions,
  livingPaths,
  pathCount,
  plausibilities,
} from './engine'
import type { Mark } from './engine'

const BWB: Mark[] = [1, 0, 1]

describe('pathCount', () => {
  it('reproduces the known counts for data 1,0,1', () => {
    const counts = conjectureCompositions().map((c) => pathCount(c, BAG_SIZE, BWB))
    expect(counts).toEqual([0, 3, 8, 9, 0])
  })

  it('multiplies in a fourth draw of 1: 0/3/16/27/0', () => {
    const counts = conjectureCompositions().map((c) =>
      pathCount(c, BAG_SIZE, [...BWB, 1]),
    )
    expect(counts).toEqual([0, 3, 16, 27, 0])
  })

  it('no data means one path (the empty product)', () => {
    expect(pathCount(2, BAG_SIZE, [])).toBe(1)
  })
})

describe('plausibilities', () => {
  it('normalizes the flat-prior counts', () => {
    const { counts, posterior } = plausibilities([1, 1, 1, 1, 1], BWB)
    expect(counts).toEqual([0, 3, 8, 9, 0])
    expect(posterior.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(posterior[3]).toBeCloseTo(9 / 20, 12)
  })

  it('carries prior counts multiplicatively (sequential updating)', () => {
    // Round 1: observe 1,0,1 → counts 0,3,8,9,0. Round 2: observe 1.
    const round2 = plausibilities([0, 3, 8, 9, 0], [1])
    expect(round2.counts).toEqual([0, 3, 16, 27, 0])
  })

  it('factory prior example: unequal prior counts reweight the garden', () => {
    const { counts } = plausibilities([0, 3, 2, 1, 0], [1])
    expect(counts).toEqual([0, 3, 4, 3, 0])
  })

  it('all-zero counts stay zero rather than dividing by zero', () => {
    const { posterior } = plausibilities([1, 1, 1, 1, 1], [1, 1, 1, 1, 1], 4)
    // composition 0 and 4-White conjectures die; sum is positive, fine.
    expect(posterior.every((p) => Number.isFinite(p))).toBe(true)
    const dead = plausibilities([0, 0, 0, 0, 0], [1])
    expect(dead.posterior).toEqual([0, 0, 0, 0, 0])
  })
})

describe('buildTree', () => {
  it('grows rings of 4, 16, 64 and marks survivors', () => {
    const rings = buildTree(2, BAG_SIZE, BWB)
    expect(rings.map((r) => r.length)).toEqual([4, 16, 64])
    expect(livingPaths(rings)).toBe(pathCount(2, BAG_SIZE, BWB))
  })

  it('a dead ancestor kills the whole subtree', () => {
    const rings = buildTree(0, BAG_SIZE, [1, 0])
    // composition 0 has no marked marbles: ring 1 all dead on datum 1
    expect(rings[0]!.every((n) => !n.alive)).toBe(true)
    expect(rings[1]!.every((n) => !n.alive)).toBe(true)
  })

  it('marble marking follows composition', () => {
    const rings = buildTree(3, BAG_SIZE, [1])
    expect(rings[0]!.map((n) => n.marked)).toEqual([true, true, true, false])
  })
})
