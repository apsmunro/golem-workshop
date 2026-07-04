/**
 * posterior-artifact.ts — loader for golem-workshop/posterior@1 files
 * exported by the r-pipeline. The loader re-checks everything the
 * exporter promised (CLAUDE.md §5): schema id, draw shape, and the
 * diagnostic gates rhat < 1.01, bulk-ESS > 400. A failing artifact is
 * refused loudly, never coerced.
 */

export const ARTIFACT_SCHEMA = 'golem-workshop/posterior@1'
export const RHAT_MAX = 1.01
export const ESS_MIN = 400

export interface PosteriorArtifact {
  schema: typeof ARTIFACT_SCHEMA
  model: string
  chapter: number
  seed: number
  engine: string
  created: string
  data: { name: string; n: number }
  params: string[]
  draws: Record<string, number[]>
  diagnostics: Record<string, { rhat: number; ess_bulk: number }>
}

export class ArtifactError extends Error {}

export function validateArtifact(raw: unknown): PosteriorArtifact {
  if (typeof raw !== 'object' || raw === null) {
    throw new ArtifactError('artifact is not an object')
  }
  const a = raw as Record<string, unknown>
  if (a['schema'] !== ARTIFACT_SCHEMA) {
    throw new ArtifactError(`unknown schema: ${String(a['schema'])}`)
  }
  if (typeof a['model'] !== 'string' || typeof a['chapter'] !== 'number') {
    throw new ArtifactError('missing model/chapter')
  }
  const params = a['params']
  if (!Array.isArray(params) || params.length === 0) {
    throw new ArtifactError('missing params')
  }
  const draws = a['draws'] as Record<string, unknown> | undefined
  const diagnostics = a['diagnostics'] as Record<string, unknown> | undefined
  if (!draws || !diagnostics) {
    throw new ArtifactError('missing draws or diagnostics')
  }

  let n: number | null = null
  for (const p of params as string[]) {
    const col = draws[p]
    if (!Array.isArray(col) || col.length === 0 || !col.every((v) => Number.isFinite(v))) {
      throw new ArtifactError(`draws for ${p} missing or non-finite`)
    }
    if (n === null) n = col.length
    else if (col.length !== n) {
      throw new ArtifactError(`draws for ${p} have length ${col.length}, expected ${n}`)
    }
    const d = diagnostics[p] as { rhat?: unknown; ess_bulk?: unknown } | undefined
    if (!d || typeof d.rhat !== 'number' || typeof d.ess_bulk !== 'number') {
      throw new ArtifactError(`diagnostics for ${p} missing`)
    }
    if (d.rhat >= RHAT_MAX) {
      throw new ArtifactError(
        `${String(a['model'])} ${p}: rhat ${d.rhat} fails the < ${RHAT_MAX} gate`,
      )
    }
    if (d.ess_bulk <= ESS_MIN) {
      throw new ArtifactError(
        `${String(a['model'])} ${p}: bulk-ESS ${d.ess_bulk} fails the > ${ESS_MIN} gate`,
      )
    }
  }
  return raw as PosteriorArtifact
}

/** Draws as typed arrays keyed by course parameter name. */
export function artifactDraws(a: PosteriorArtifact): Record<string, Float64Array> {
  const out: Record<string, Float64Array> = {}
  for (const p of a.params) out[p] = Float64Array.from(a.draws[p]!)
  return out
}

export async function loadArtifact(model: string): Promise<PosteriorArtifact> {
  const res = await fetch(
    `${import.meta.env.BASE_URL}data/posteriors/${model}.json`,
  )
  if (!res.ok) throw new ArtifactError(`artifact ${model} not found (${res.status})`)
  return validateArtifact(await res.json())
}
