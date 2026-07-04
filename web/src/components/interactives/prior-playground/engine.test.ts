/**
 * Prior playground checks. Deterministic under seed; the flat-Normal
 * slope prior must produce many absurd lines and the LogNormal prior
 * few — the chapter's actual argument, as an assertion.
 */
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import { HEIGHT_SPEC, absurdCount, drawPriorLines, violations } from './engine'

describe('violations', () => {
  it('flags lines that dive below zero within range', () => {
    // steep negative slope from a normal intercept
    expect(violations(HEIGHT_SPEC, 170, -12)).toContain('shorter than nothing')
    expect(violations(HEIGHT_SPEC, 170, 1)).toEqual([])
  })

  it('flags lines that top the tallest human', () => {
    expect(violations(HEIGHT_SPEC, 170, 8)).toContain(
      'taller than the tallest human ever',
    )
  })
})

describe('the chapter 4 argument, numerically', () => {
  it('b ~ Normal(0, 10) is a monster factory; LogNormal(0, 1) is tame', () => {
    const wild = drawPriorLines(
      HEIGHT_SPEC,
      { aMu: 178, aSd: 20, bKind: 'normal', bSd: 10 },
      500,
      new RNG(1959),
    )
    const tame = drawPriorLines(
      HEIGHT_SPEC,
      { aMu: 178, aSd: 20, bKind: 'lognormal', bSd: 1 },
      500,
      new RNG(1959),
    )
    expect(absurdCount(wild) / 500).toBeGreaterThan(0.5)
    expect(absurdCount(tame) / 500).toBeLessThan(0.15)
  })

  it('is deterministic under a fixed seed', () => {
    const config = { aMu: 178, aSd: 20, bKind: 'normal' as const, bSd: 10 }
    const a = drawPriorLines(HEIGHT_SPEC, config, 50, new RNG(7))
    const b = drawPriorLines(HEIGHT_SPEC, config, 50, new RNG(7))
    expect(a).toEqual(b)
  })
})
