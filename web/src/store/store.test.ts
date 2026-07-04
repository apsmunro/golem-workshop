import { beforeEach, describe, expect, it } from 'vitest'
import { sm2, useWorkshopStore } from './index'
import { exportState, importState } from './io'
import type { SrsCard, WorkshopState } from './types'

const initial = useWorkshopStore.getState()

function resetStore() {
  useWorkshopStore.setState(
    {
      chapters: {},
      golems: {},
      calibrations: [],
      cards: {},
      theme: 'workshop',
    } satisfies Partial<WorkshopState>,
    false,
  )
}

beforeEach(() => {
  localStorage.clear()
  resetStore()
})

describe('progress slice', () => {
  it('visit marks a chapter in-progress but never demotes', () => {
    initial.visitChapter(2)
    expect(useWorkshopStore.getState().chapters[2]?.status).toBe('in-progress')
    initial.completeChapter(2)
    initial.visitChapter(2)
    expect(useWorkshopStore.getState().chapters[2]?.status).toBe('complete')
  })

  it('problem completion is idempotent and promotes unvisited chapters', () => {
    initial.markProblemDone(3, '3E1')
    initial.markProblemDone(3, '3E1')
    const ch = useWorkshopStore.getState().chapters[3]
    expect(ch?.problemsDone).toEqual(['3E1'])
    expect(ch?.status).toBe('in-progress')
  })
})

describe('bestiary slice', () => {
  it('forges once, upgrades once', () => {
    initial.forgeGolem('globe-tossing')
    const forged = useWorkshopStore.getState().golems['globe-tossing']
    expect(forged?.state).toBe('forged')
    expect(forged?.forgedAt).toBeTruthy()
    initial.upgradeGolem('globe-tossing')
    expect(useWorkshopStore.getState().golems['globe-tossing']?.state).toBe('upgraded')
  })

  it('cannot upgrade an unforged golem', () => {
    initial.upgradeGolem('phantom')
    expect(useWorkshopStore.getState().golems['phantom']).toBeUndefined()
  })
})

describe('srs slice (SM-2)', () => {
  const base: SrsCard = {
    id: 'c1',
    ease: 2.5,
    intervalDays: 0,
    due: new Date(0).toISOString(),
    reps: 0,
    lapses: 0,
  }
  const now = new Date('2026-07-04T12:00:00Z')

  it('first two passes schedule 1 then 6 days', () => {
    const first = sm2(base, 4, now)
    expect(first.intervalDays).toBe(1)
    const second = sm2(first, 4, now)
    expect(second.intervalDays).toBe(6)
  })

  it('a grade-5 streak grows the interval by the ease factor', () => {
    let card = sm2(sm2(base, 5, now), 5, now)
    card = sm2(card, 5, now)
    // ease after three 5s stays ≥ 2.5, so interval jumps well past 6 days
    expect(card.intervalDays).toBeGreaterThanOrEqual(15)
    expect(card.reps).toBe(3)
  })

  it('a failing grade resets reps, counts a lapse, keeps ease ≥ 1.3', () => {
    let card = base
    for (let i = 0; i < 10; i++) card = sm2(card, 0, now)
    expect(card.reps).toBe(0)
    expect(card.lapses).toBe(10)
    expect(card.intervalDays).toBe(1)
    expect(card.ease).toBeGreaterThanOrEqual(1.3)
  })

  it('reviewCard updates the stored card', () => {
    initial.addCard('ch02-globe')
    initial.reviewCard('ch02-globe', 4, now)
    const card = useWorkshopStore.getState().cards['ch02-globe']
    expect(card?.reps).toBe(1)
    expect(new Date(card!.due).getTime()).toBeGreaterThan(now.getTime())
  })
})

describe('settings slice', () => {
  it('toggles between workshop and daylight', () => {
    expect(useWorkshopStore.getState().theme).toBe('workshop')
    initial.toggleTheme()
    expect(useWorkshopStore.getState().theme).toBe('daylight')
    initial.toggleTheme()
    expect(useWorkshopStore.getState().theme).toBe('workshop')
  })
})

describe('export / import round trip', () => {
  it('restores state exactly after a reset', () => {
    initial.visitChapter(2)
    initial.completeChapter(2)
    initial.forgeGolem('globe-tossing')
    initial.recordCalibration({ id: 'ch02-post', chapter: 2, score: 0.82 })
    initial.addCard('ch02-globe')
    initial.setTheme('daylight')

    const json = exportState()
    resetStore()
    expect(useWorkshopStore.getState().chapters[2]).toBeUndefined()

    const result = importState(json)
    expect(result.ok).toBe(true)
    const s = useWorkshopStore.getState()
    expect(s.chapters[2]?.status).toBe('complete')
    expect(s.golems['globe-tossing']?.state).toBe('forged')
    expect(s.calibrations[0]?.score).toBe(0.82)
    expect(s.cards['ch02-globe']).toBeTruthy()
    expect(s.theme).toBe('daylight')
  })

  it('rejects garbage and foreign payloads', () => {
    expect(importState('not json').ok).toBe(false)
    expect(importState('{"app":"other-app","version":1}').ok).toBe(false)
    expect(importState(JSON.stringify({ app: 'golem-workshop', version: 999, state: {} })).ok).toBe(false)
  })
})
