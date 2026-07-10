import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ChapterProgress,
  SrsCard,
  SrsGrade,
  WorkshopState,
} from './types'

export const STORE_NAME = 'golem-workshop'
export const STORE_VERSION = 1

const emptyChapter = (): ChapterProgress => ({
  status: 'unvisited',
  problemsDone: [],
})

const newCard = (id: string, now: Date): SrsCard => ({
  id,
  ease: 2.5,
  intervalDays: 0,
  due: now.toISOString(),
  reps: 0,
  lapses: 0,
})

/** Classic SM-2 scheduling. Grades below 3 reset repetition and count a lapse. */
export function sm2(card: SrsCard, grade: SrsGrade, now: Date): SrsCard {
  const ease = Math.max(
    1.3,
    card.ease + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02),
  )
  let reps: number
  let intervalDays: number
  let lapses = card.lapses
  if (grade < 3) {
    reps = 0
    intervalDays = 1
    lapses += 1
  } else {
    reps = card.reps + 1
    if (reps === 1) intervalDays = 1
    else if (reps === 2) intervalDays = 6
    else intervalDays = Math.round(card.intervalDays * ease)
  }
  const due = new Date(now.getTime() + intervalDays * 86_400_000).toISOString()
  return { ...card, ease, reps, intervalDays, lapses, due }
}

export const useWorkshopStore = create<WorkshopState>()(
  persist(
    (set, get) => ({
      // ── progress ────────────────────────────────────────────
      chapters: {},
      visitChapter: (n) =>
        set((s) => {
          const ch = s.chapters[n] ?? emptyChapter()
          if (ch.status !== 'unvisited') return s
          return { chapters: { ...s.chapters, [n]: { ...ch, status: 'in-progress' } } }
        }),
      completeChapter: (n) =>
        set((s) => {
          const ch = s.chapters[n] ?? emptyChapter()
          return { chapters: { ...s.chapters, [n]: { ...ch, status: 'complete' } } }
        }),
      markProblemDone: (chapter, problemId) =>
        set((s) => {
          const ch = s.chapters[chapter] ?? emptyChapter()
          if (ch.problemsDone.includes(problemId)) return s
          return {
            chapters: {
              ...s.chapters,
              [chapter]: {
                ...ch,
                status: ch.status === 'unvisited' ? 'in-progress' : ch.status,
                problemsDone: [...ch.problemsDone, problemId],
              },
            },
          }
        }),

      // ── bestiary ────────────────────────────────────────────
      golems: {},
      forgeGolem: (id) =>
        set((s) => {
          if (s.golems[id]) return s
          return {
            golems: {
              ...s.golems,
              [id]: { state: 'forged', forgedAt: new Date().toISOString() },
            },
          }
        }),
      upgradeGolem: (id) =>
        set((s) => {
          const g = s.golems[id]
          if (!g || g.state === 'upgraded') return s
          return { golems: { ...s.golems, [id]: { ...g, state: 'upgraded' } } }
        }),

      // ── calibration ─────────────────────────────────────────
      calibrations: [],
      recordCalibration: (entry) =>
        set((s) => ({
          calibrations: [
            ...s.calibrations,
            { ...entry, at: new Date().toISOString() },
          ],
        })),

      // ── srs ─────────────────────────────────────────────────
      cards: {},
      addCard: (id) =>
        set((s) => {
          if (s.cards[id]) return s
          return { cards: { ...s.cards, [id]: newCard(id, new Date()) } }
        }),
      reviewCard: (id, grade, now = new Date()) => {
        const card = get().cards[id]
        if (!card) return
        set((s) => ({ cards: { ...s.cards, [id]: sm2(card, grade, now) } }))
      },

      // ── settings ────────────────────────────────────────────
      theme: 'workshop',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'workshop' ? 'daylight' : 'workshop' })),
      dialect: 'brms',
      setDialect: (dialect) => set({ dialect }),
    }),
    {
      name: STORE_NAME,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Migrations run oldest-to-newest; add a case per version bump.
      migrate: (persisted, _version) => persisted as WorkshopState,
    },
  ),
)
