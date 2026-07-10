import { STORE_NAME, STORE_VERSION, useWorkshopStore } from './index'
import type { WorkshopState } from './types'

/** The persisted data keys — everything except actions. */
const DATA_KEYS = [
  'chapters',
  'golems',
  'calibrations',
  'cards',
  'theme',
  'dialect',
] as const

type DataKey = (typeof DATA_KEYS)[number]
export type ExportedState = Pick<WorkshopState, DataKey>

export interface ExportEnvelope {
  app: typeof STORE_NAME
  version: number
  exportedAt: string
  state: ExportedState
}

export function exportState(): string {
  const s = useWorkshopStore.getState()
  const state = Object.fromEntries(
    DATA_KEYS.map((k) => [k, s[k]]),
  ) as ExportedState
  const envelope: ExportEnvelope = {
    app: STORE_NAME,
    version: STORE_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
  return JSON.stringify(envelope, null, 2)
}

export type ImportResult = { ok: true } | { ok: false; error: string }

export function importState(json: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Not valid JSON.' }
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Not a workshop export.' }
  }
  const env = parsed as Partial<ExportEnvelope>
  if (env.app !== STORE_NAME || typeof env.version !== 'number') {
    return { ok: false, error: 'Not a workshop export.' }
  }
  if (env.version > STORE_VERSION) {
    return { ok: false, error: 'Export was made by a newer version of the app.' }
  }
  const state = env.state
  if (typeof state !== 'object' || state === null) {
    return { ok: false, error: 'Export contains no state.' }
  }
  const clean = Object.fromEntries(
    DATA_KEYS.filter((k) => k in state).map((k) => [k, state[k]]),
  ) as Partial<ExportedState>
  useWorkshopStore.setState(clean)
  return { ok: true }
}
