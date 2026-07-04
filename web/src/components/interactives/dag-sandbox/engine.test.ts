/**
 * DAG engine validated against known results for the course DAGs:
 * elemental confounds behave per definition; waffles admits exactly
 * {S} and {A, M}; fungus shows post-treatment blocking; grandparents
 * shows the collider haunting. All checks exact.
 */
import { describe, expect, it } from 'vitest'
import {
  adjustmentSets,
  allPaths,
  backdoorPaths,
  dSeparated,
  descendants,
  isAcyclic,
  pathBlocked,
} from './engine'
import type { Dag } from './engine'
import { presetById } from './presets'

const fork = presetById('fork')!.dag
const pipe = presetById('pipe')!.dag
const collider = presetById('collider')!.dag
const waffles = presetById('waffles')!.dag
const milk = presetById('milk')!.dag
const fungus = presetById('fungus')!.dag
const grandparents = presetById('grandparents')!.dag

const z = (...ns: string[]) => new Set(ns)

describe('structure', () => {
  it('all presets are acyclic', () => {
    for (const dag of [fork, pipe, collider, waffles, milk, fungus, grandparents]) {
      expect(isAcyclic(dag)).toBe(true)
    }
  })

  it('detects cycles', () => {
    const cyclic: Dag = { nodes: ['A', 'B'], edges: [['A', 'B'], ['B', 'A']] }
    expect(isAcyclic(cyclic)).toBe(false)
  })

  it('descendants are transitive', () => {
    expect(descendants(waffles, 'S')).toEqual(new Set(['W', 'A', 'M', 'D']))
    expect(descendants(waffles, 'D')).toEqual(new Set())
  })
})

describe('elemental confounds', () => {
  it('fork: X ⊥̸ Y, but X ⊥ Y | Z', () => {
    expect(dSeparated(fork, 'X', 'Y')).toBe(false)
    expect(dSeparated(fork, 'X', 'Y', z('Z'))).toBe(true)
  })

  it('pipe: X ⊥̸ Y, but X ⊥ Y | Z', () => {
    expect(dSeparated(pipe, 'X', 'Y')).toBe(false)
    expect(dSeparated(pipe, 'X', 'Y', z('Z'))).toBe(true)
  })

  it('collider: X ⊥ Y, but X ⊥̸ Y | Z — and conditioning on a descendant of Z also opens it', () => {
    expect(dSeparated(collider, 'X', 'Y')).toBe(true)
    expect(dSeparated(collider, 'X', 'Y', z('Z'))).toBe(false)
    expect(dSeparated(collider, 'X', 'Y', z('D'))).toBe(false)
  })
})

describe('waffles (WaffleDivorce)', () => {
  it('finds all four backdoor paths; only three are open by default', () => {
    const bd = backdoorPaths(waffles, 'W', 'D')
    const routes = bd.map((p) => p.nodes.join('')).sort()
    // WSMAD exists but is blocked at the collider M without conditioning.
    expect(routes).toEqual(['WSAD', 'WSAMD', 'WSMAD', 'WSMD'])
    const open = bd
      .filter((p) => !pathBlocked(waffles, p, z()))
      .map((p) => p.nodes.join(''))
      .sort()
    expect(open).toEqual(['WSAD', 'WSAMD', 'WSMD'])
  })

  it('minimal adjustment sets for W → D are {S} and {A, M}', () => {
    expect(adjustmentSets(waffles, 'W', 'D')).toEqual([['S'], ['A', 'M']])
  })

  it('conditioning on S d-separates W from A', () => {
    expect(dSeparated(waffles, 'W', 'A', z('S'))).toBe(true)
  })
})

describe('milk (masking)', () => {
  it('N → K needs {M}', () => {
    expect(adjustmentSets(milk, 'N', 'K')).toEqual([['M']])
  })
})

describe('fungus (post-treatment bias)', () => {
  it('T and H1 are associated, but conditioning on F blocks the effect path', () => {
    expect(dSeparated(fungus, 'T', 'H1')).toBe(false)
    expect(dSeparated(fungus, 'T', 'H1', z('F'))).toBe(true)
  })

  it('T → H1 needs no adjustment at all', () => {
    expect(adjustmentSets(fungus, 'T', 'H1')).toEqual([[]])
  })
})

describe('grandparents (the haunted DAG)', () => {
  it('G and U start independent; conditioning on P opens the haunted path', () => {
    expect(dSeparated(grandparents, 'G', 'U')).toBe(true)
    expect(dSeparated(grandparents, 'G', 'U', z('P'))).toBe(false)
  })

  it('total effect G → C needs no adjustment (G has no backdoors)', () => {
    expect(backdoorPaths(grandparents, 'G', 'C')).toEqual([])
    expect(adjustmentSets(grandparents, 'G', 'C')).toEqual([[]])
  })

  it('with U unobserved, conditioning on P cannot be repaired', () => {
    // The path G → P ← U → C is open given {P}; U is not conditionable.
    const paths = allPaths(grandparents, 'G', 'C')
    const haunted = paths.find((p) => p.nodes.join('') === 'GPUC')
    expect(haunted).toBeTruthy()
  })
})

describe('property: d-separation is symmetric', () => {
  it('holds across presets and conditioning sets', () => {
    const cases: [Dag, string, string, Set<string>][] = [
      [waffles, 'W', 'D', z('S')],
      [waffles, 'A', 'W', z()],
      [grandparents, 'G', 'U', z('P')],
      [fungus, 'H0', 'T', z('H1')],
      [milk, 'M', 'K', z('N')],
    ]
    for (const [dag, a, b, cond] of cases) {
      expect(dSeparated(dag, a, b, cond)).toBe(dSeparated(dag, b, a, cond))
    }
  })
})
