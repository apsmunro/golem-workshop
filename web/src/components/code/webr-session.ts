/**
 * webr-session.ts — one shared, lazily created webR instance.
 *
 * webR is ~15MB of WASM fetched at runtime, so nothing here loads until
 * the first cell asks for it (plan §2: heavy assets lazy). The session
 * seeds itself with the house seed so learners see reproducible draws.
 */

export interface RunResult {
  /** printed lines, stdout and stderr interleaved in emission order */
  lines: { type: 'stdout' | 'stderr'; text: string }[]
  /** R condition message if evaluation failed */
  error: string | null
}

export interface WebRSession {
  runR(code: string): Promise<RunResult>
}

let sessionPromise: Promise<WebRSession> | null = null

/** True once someone has begun loading R (used for status displays). */
export function webRRequested(): boolean {
  return sessionPromise !== null
}

export function getWebR(): Promise<WebRSession> {
  sessionPromise ??= init()
  return sessionPromise
}

async function init(): Promise<WebRSession> {
  const { WebR } = await import('webr')
  const webR = new WebR()
  await webR.init()
  await webR.evalRVoid(`set.seed(1959)`)

  return {
    async runR(code: string): Promise<RunResult> {
      const shelter = await new webR.Shelter()
      try {
        const capture = await shelter.captureR(code, {
          withAutoprint: true,
          captureStreams: true,
          captureConditions: false,
        })
        const lines = capture.output
          .filter((m) => m.type === 'stdout' || m.type === 'stderr')
          .map((m) => ({
            type: m.type as 'stdout' | 'stderr',
            text: String(m.data),
          }))
        return { lines, error: null }
      } catch (e) {
        return {
          lines: [],
          error: e instanceof Error ? e.message : String(e),
        }
      } finally {
        shelter.purge()
      }
    },
  }
}

/**
 * Expected-output check: every expected fragment must appear in some
 * printed line. Whitespace runs are normalized so formatting drift in
 * R's printing doesn't fail a correct answer.
 */
export function outputMatches(
  lines: readonly { text: string }[],
  expected: readonly string[],
): boolean {
  const haystack = lines
    .map((l) => l.text)
    .join('\n')
    .replace(/\s+/g, ' ')
  return expected.every((frag) => haystack.includes(frag.replace(/\s+/g, ' ')))
}
