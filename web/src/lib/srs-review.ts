/**
 * Review-queue logic for the spaced-repetition deck. Pure and deterministic
 * given a `now`, so it is fully testable. The SM-2 rescheduling itself lives
 * in the store (`sm2`); this module only decides which authored deck cards a
 * learner should see, and in what order.
 *
 * Unlock rule: a chapter's deck opens once that chapter is forged (status
 * 'complete'). You review what you have already learned, not what you have
 * only glanced at.
 */
import type { SrsCard, SrsGrade } from '../store/types'
import type { ChapterStatus } from '../store/types'
import type { SrsDeckCard } from '../content/srs'

/** The four review verdicts, mapped onto SM-2 grades (0–2 fail, 3–5 pass). */
export type ReviewButton = 'again' | 'hard' | 'good' | 'easy'

export function buttonToGrade(button: ReviewButton): SrsGrade {
  switch (button) {
    case 'again':
      return 1
    case 'hard':
      return 3
    case 'good':
      return 4
    case 'easy':
      return 5
  }
}

type ChapterMap = Record<number, { status: ChapterStatus } | undefined>

/** Deck cards whose chapter has been forged. */
export function unlockedCards(
  deck: readonly SrsDeckCard[],
  chapters: ChapterMap,
): SrsDeckCard[] {
  return deck.filter((c) => chapters[c.chapter]?.status === 'complete')
}

export interface ReviewQueue {
  /** The session, in the order to show: new cards first, then most overdue. */
  queue: SrsDeckCard[]
  /** Unlocked cards not yet seeded into the scheduler (call addCard on these). */
  unseeded: SrsDeckCard[]
  /** How many queued cards are brand new (never scheduled). */
  newCount: number
  /** How many queued cards were already scheduled and are now due. */
  dueCount: number
  /** Total unlocked cards across all forged chapters. */
  unlockedCount: number
  /** ISO timestamp of the soonest not-yet-due unlocked card, or null. */
  nextDue: string | null
}

/**
 * Build the review session from the current store state.
 *
 * A card is queued when its chapter is forged and either it has never been
 * scheduled (new) or its due date has passed. New cards lead so the learner
 * meets them before the drilling of overdue ones; the rest follow oldest-due
 * first. `nextDue` reports when the next card comes back if nothing is due now.
 */
export function buildReviewQueue(
  deck: readonly SrsDeckCard[],
  cards: Record<string, SrsCard>,
  chapters: ChapterMap,
  now: Date,
): ReviewQueue {
  const unlocked = unlockedCards(deck, chapters)
  const nowMs = now.getTime()

  const unseeded: SrsDeckCard[] = []
  const dueSeeded: SrsDeckCard[] = []
  let nextDue: string | null = null

  for (const card of unlocked) {
    const rec = cards[card.id]
    if (!rec) {
      unseeded.push(card)
      continue
    }
    const dueMs = new Date(rec.due).getTime()
    if (dueMs <= nowMs) {
      dueSeeded.push(card)
    } else if (nextDue === null || dueMs < new Date(nextDue).getTime()) {
      nextDue = rec.due
    }
  }

  dueSeeded.sort(
    (a, b) =>
      new Date(cards[a.id]!.due).getTime() - new Date(cards[b.id]!.due).getTime(),
  )

  return {
    queue: [...unseeded, ...dueSeeded],
    unseeded,
    newCount: unseeded.length,
    dueCount: dueSeeded.length,
    unlockedCount: unlocked.length,
    nextDue,
  }
}
