import { describe, expect, it } from 'vitest'
import {
  ArtifactError,
  artifactDraws,
  validateArtifact,
} from './posterior-artifact'

function goodArtifact() {
  return {
    schema: 'golem-workshop/posterior@1',
    model: 'm4.3',
    chapter: 4,
    seed: 1959,
    engine: 'brms',
    created: '2026-07-04T00:00:00Z',
    data: { name: 'Howell1', n: 352 },
    params: ['a', 'b'],
    draws: { a: [154.1, 154.6, 155.0], b: [0.88, 0.9, 0.92] },
    diagnostics: {
      a: { rhat: 1.001, ess_bulk: 3800 },
      b: { rhat: 1.002, ess_bulk: 3500 },
    },
  }
}

describe('validateArtifact', () => {
  it('accepts a clean artifact and exposes typed draws', () => {
    const a = validateArtifact(goodArtifact())
    const draws = artifactDraws(a)
    expect(draws['a']).toBeInstanceOf(Float64Array)
    expect(draws['b']!.length).toBe(3)
  })

  it('refuses wrong schema', () => {
    const bad = { ...goodArtifact(), schema: 'something-else@9' }
    expect(() => validateArtifact(bad)).toThrow(ArtifactError)
  })

  it('refuses rhat at or above 1.01', () => {
    const bad = goodArtifact()
    bad.diagnostics.a.rhat = 1.011
    expect(() => validateArtifact(bad)).toThrow(/rhat/)
  })

  it('refuses bulk-ESS at or below 400', () => {
    const bad = goodArtifact()
    bad.diagnostics.b.ess_bulk = 400
    expect(() => validateArtifact(bad)).toThrow(/ESS/)
  })

  it('refuses ragged or non-finite draws', () => {
    const ragged = goodArtifact()
    ragged.draws.b = [0.9]
    expect(() => validateArtifact(ragged)).toThrow(/length/)

    const nan = goodArtifact()
    nan.draws.a = [154, Number.NaN, 155]
    expect(() => validateArtifact(nan)).toThrow(/non-finite/)
  })

  it('refuses missing diagnostics', () => {
    const bad = goodArtifact() as Record<string, unknown>
    bad['diagnostics'] = { a: { rhat: 1.0, ess_bulk: 3000 } }
    expect(() => validateArtifact(bad)).toThrow(/diagnostics for b/)
  })
})
