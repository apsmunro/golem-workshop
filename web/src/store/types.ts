export type ChapterStatus = 'unvisited' | 'in-progress' | 'complete'

export interface ChapterProgress {
  status: ChapterStatus
  problemsDone: string[]
}

export type GolemState = 'unforged' | 'forged' | 'upgraded'

export interface GolemRecord {
  state: GolemState
  forgedAt?: string
}

export interface CalibrationEntry {
  /** Identifies the guess prompt, e.g. "ch02-globe-posterior". */
  id: string
  chapter: number
  /** Overlap score in [0, 1]; 1 − total variation distance vs. truth. */
  score: number
  at: string
}

export interface SrsCard {
  id: string
  /** SM-2 ease factor, floor 1.3. */
  ease: number
  intervalDays: number
  due: string
  reps: number
  lapses: number
}

/** SM-2 quality grade: 0–2 = fail, 3–5 = pass. */
export type SrsGrade = 0 | 1 | 2 | 3 | 4 | 5

export type ThemeName = 'workshop' | 'daylight'

export interface ProgressSlice {
  chapters: Record<number, ChapterProgress>
  visitChapter: (n: number) => void
  completeChapter: (n: number) => void
  markProblemDone: (chapter: number, problemId: string) => void
}

export interface BestiarySlice {
  golems: Record<string, GolemRecord>
  forgeGolem: (id: string) => void
  upgradeGolem: (id: string) => void
}

export interface CalibrationSlice {
  calibrations: CalibrationEntry[]
  recordCalibration: (entry: Omit<CalibrationEntry, 'at'>) => void
}

export interface SrsSlice {
  cards: Record<string, SrsCard>
  addCard: (id: string) => void
  reviewCard: (id: string, grade: SrsGrade, now?: Date) => void
}

export interface SettingsSlice {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  toggleTheme: () => void
}

export type WorkshopState = ProgressSlice &
  BestiarySlice &
  CalibrationSlice &
  SrsSlice &
  SettingsSlice
