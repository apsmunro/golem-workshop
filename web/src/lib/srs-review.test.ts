import { describe, expect, it } from 'vitest'
import {
  buildReviewQueue,
  buttonToGrade,
  unlockedCards,
} from './srs-review'
import { allDeckCards, deckByChapter } from '../content/srs'
import type { SrsDeckCard } from '../content/srs'
import type { SrsCard, ChapterStatus } from '../store/types'

const complete = (n: number): Record<number, { status: ChapterStatus }> => ({
  [n]: { status: 'complete' },
})

const card = (id: string, dueIso: string): SrsCard => ({
  id,
  ease: 2.5,
  intervalDays: 6,
  due: dueIso,
  reps: 2,
  lapses: 0,
})

const now = new Date('2026-07-05T12:00:00Z')

describe('deck integrity', () => {
  it('every chapter 2–17 has a deck of at least three cards', () => {
    for (let ch = 2; ch <= 17; ch++) {
      const deck = deckByChapter[ch]
      expect(deck, `chapter ${ch}`).toBeTruthy()
      expect(deck!.length, `chapter ${ch} card count`).toBeGreaterThanOrEqual(3)
    }
  })

  it('card ids are globally unique', () => {
    const ids = allDeckCards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every card is well formed and tagged to its chapter', () => {
    for (const c of allDeckCards) {
      expect(['concept', 'trap', 'code']).toContain(c.kind)
      expect(c.front.trim().length).toBeGreaterThan(0)
      expect(c.back.trim().length).toBeGreaterThan(0)
      // Id convention `s{chapter}-{n}` keeps schedules stable across renames.
      expect(c.id.startsWith(`s${c.chapter}-`)).toBe(true)
      if (c.kind === 'code') {
        expect(c.code, `${c.id} is a code card without a snippet`).toBeTruthy()
      }
    }
  })
})

describe('buttonToGrade', () => {
  it('maps the four verdicts onto SM-2 grades', () => {
    expect(buttonToGrade('again')).toBe(1)
    expect(buttonToGrade('hard')).toBe(3)
    expect(buttonToGrade('good')).toBe(4)
    expect(buttonToGrade('easy')).toBe(5)
  })
})

const miniDeck: SrsDeckCard[] = [
  { id: 's2-1', chapter: 2, kind: 'concept', front: 'a', back: 'A' },
  { id: 's2-2', chapter: 2, kind: 'trap', front: 'b', back: 'B' },
  { id: 's3-1', chapter: 3, kind: 'concept', front: 'c', back: 'C' },
]

describe('unlockedCards', () => {
  it('opens a chapter only once it is forged', () => {
    expect(unlockedCards(miniDeck, {}).length).toBe(0)
    expect(unlockedCards(miniDeck, { 2: { status: 'in-progress' } }).length).toBe(0)
    const open = unlockedCards(miniDeck, complete(2))
    expect(open.map((c) => c.id)).toEqual(['s2-1', 's2-2'])
  })
})

describe('buildReviewQueue', () => {
  it('excludes cards from unforged chapters', () => {
    const q = buildReviewQueue(miniDeck, {}, { 3: { status: 'complete' } }, now)
    expect(q.unlockedCount).toBe(1)
    expect(q.queue.map((c) => c.id)).toEqual(['s3-1'])
    expect(q.newCount).toBe(1)
  })

  it('leads with new (unseeded) cards, then most-overdue seeded ones', () => {
    const chapters = { ...complete(2), ...complete(3) }
    const cards = {
      // s2-1 due yesterday, s3-1 due last week → s3-1 is more overdue.
      's2-1': card('s2-1', '2026-07-04T12:00:00Z'),
      's3-1': card('s3-1', '2026-06-28T12:00:00Z'),
      // s2-2 has no record → new.
    }
    const q = buildReviewQueue(miniDeck, cards, chapters, now)
    expect(q.newCount).toBe(1)
    expect(q.dueCount).toBe(2)
    expect(q.queue.map((c) => c.id)).toEqual(['s2-2', 's3-1', 's2-1'])
  })

  it('holds back not-yet-due cards and reports the soonest return', () => {
    const cards = {
      's2-1': card('s2-1', '2026-07-10T12:00:00Z'),
      's2-2': card('s2-2', '2026-07-08T12:00:00Z'),
    }
    const q = buildReviewQueue(miniDeck, cards, complete(2), now)
    expect(q.queue.length).toBe(0)
    expect(q.dueCount).toBe(0)
    expect(q.nextDue).toBe('2026-07-08T12:00:00Z')
  })

  it('treats a card due exactly now as due', () => {
    const cards = {
      's2-1': card('s2-1', now.toISOString()),
      // hold s2-2 in the future so only the due-now card surfaces
      's2-2': card('s2-2', '2026-08-01T12:00:00Z'),
    }
    const q = buildReviewQueue(miniDeck, cards, complete(2), now)
    expect(q.queue.map((c) => c.id)).toEqual(['s2-1'])
    expect(q.dueCount).toBe(1)
    expect(q.newCount).toBe(0)
  })
})
