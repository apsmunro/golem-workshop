/**
 * Validates every deployed posterior artifact in public/data/posteriors
 * against the real loader gates (schema, draw shape, rhat < 1.01,
 * bulk-ESS > 400). The exporter enforces these too — this is the second
 * half of "belt and braces" (CLAUDE.md §5), and it means a hand-edited
 * or stale artifact can never ride along silently with a green build.
 * Passes trivially when no artifacts are deployed yet.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ARTIFACT_SCHEMA, validateArtifact } from './posterior-artifact'

const DIR = join(__dirname, '..', '..', 'public', 'data', 'posteriors')

function artifactFiles(): string[] {
  try {
    return readdirSync(DIR).filter((f) => /^m[\d.]+\.json$/.test(f))
  } catch {
    return [] // directory absent until the r-pipeline has run
  }
}

describe('deployed posterior artifacts', () => {
  const files = artifactFiles()

  it.each(files.length > 0 ? files : [])('%s passes the loader gates', (file) => {
    const raw = JSON.parse(readFileSync(join(DIR, file), 'utf8')) as unknown
    const artifact = validateArtifact(raw)
    expect(artifact.schema).toBe(ARTIFACT_SCHEMA)
    expect(`${artifact.model}.json`).toBe(file)
    expect(artifact.seed).toBe(1959)
    expect(artifact.engine).toBe('brms')
    // thinned to the pipeline's N_DRAWS
    for (const p of artifact.params) {
      expect(artifact.draws[p]!.length).toBe(2000)
    }
  })

  it('suite acknowledges artifact count', () => {
    // Not an assertion on the count — chapters land incrementally — just
    // a visible record in test output of how many artifacts shipped.
    expect(files.length).toBeGreaterThanOrEqual(0)
  })
})
