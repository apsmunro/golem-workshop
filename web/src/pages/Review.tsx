import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allDeckCards } from '../content/srs'
import type { SrsDeckCard, SrsKind } from '../content/srs'
import { chapters } from '../content/chapters'
import { toRoman } from '../lib/roman'
import { buildReviewQueue, buttonToGrade } from '../lib/srs-review'
import type { ReviewButton } from '../lib/srs-review'
import { useWorkshopStore } from '../store'

const KIND: Record<SrsKind, { label: string; accent: string }> = {
  concept: { label: 'concept', accent: 'var(--brass-400)' },
  trap: { label: 'trap', accent: 'var(--clay-500)' },
  code: { label: 'code reading', accent: 'var(--verdigris-400)' },
}

const BUTTONS: { key: ReviewButton; label: string; hint: string }[] = [
  { key: 'again', label: 'Again', hint: 'blanked' },
  { key: 'hard', label: 'Hard', hint: 'a struggle' },
  { key: 'good', label: 'Good', hint: 'recalled it' },
  { key: 'easy', label: 'Easy', hint: 'instant' },
]

function chapterTitle(n: number): string {
  return chapters.find((c) => c.n === n)?.title ?? ''
}

/** Human "in 3 days" / "tomorrow" for the caught-up screen. */
function untilLabel(iso: string, now: Date): string {
  const days = Math.round(
    (new Date(iso).getTime() - now.getTime()) / 86_400_000,
  )
  if (days <= 0) return 'shortly'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

export function Review() {
  const addCard = useWorkshopStore((s) => s.addCard)
  const reviewCard = useWorkshopStore((s) => s.reviewCard)

  // Snapshot the session once: grading reschedules cards into the future, and
  // we don't want the queue reshuffling under the learner mid-review.
  const [session] = useState(() => {
    const s = useWorkshopStore.getState()
    return buildReviewQueue(allDeckCards, s.cards, s.chapters, new Date())
  })

  // Seed any brand-new cards into the scheduler (idempotent).
  useEffect(() => {
    for (const c of session.unseeded) addCard(c.id)
  }, [session, addCard])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card: SrsDeckCard | undefined = session.queue[index]

  const grade = useCallback(
    (button: ReviewButton) => {
      if (!card) return
      reviewCard(card.id, buttonToGrade(button))
      setRevealed(false)
      setIndex((i) => i + 1)
    },
    [card, reviewCard],
  )

  // Keyboard: space/enter reveals; 1–4 grade once revealed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if (!revealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          setRevealed(true)
        }
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= 4) {
        e.preventDefault()
        grade(BUTTONS[n - 1]!.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, grade])

  const now = useMemo(() => new Date(), [])

  // ── Nothing forged yet ────────────────────────────────────────────
  if (session.unlockedCount === 0) {
    return (
      <Shell>
        <p className="eyebrow">The review deck is empty</p>
        <h2 className="mt-4 font-display text-2xl">Nothing to drill yet</h2>
        <p className="mt-6 max-w-[52ch] text-secondary">
          Cards appear here as you forge golems. Finish a chapter — work its
          practice problems until the golem forges — and its deck opens for
          spaced review.
        </p>
        <p className="mt-8">
          <Link to="/">Back to the workshop floor</Link>
        </p>
      </Shell>
    )
  }

  // ── Caught up (all unlocked cards scheduled ahead) ────────────────
  if (session.queue.length === 0) {
    return (
      <Shell>
        <p className="eyebrow">Deck rested</p>
        <h2 className="mt-4 font-display text-2xl">You're caught up</h2>
        <p className="mt-6 max-w-[52ch] text-secondary">
          Every one of your {session.unlockedCount} unlocked cards is scheduled
          ahead.{' '}
          {session.nextDue
            ? `The next comes back ${untilLabel(session.nextDue, now)}.`
            : ''}{' '}
          Spacing the reviews is the point — come back when they're due.
        </p>
        <p className="mt-8">
          <Link to="/">Back to the workshop floor</Link>
        </p>
      </Shell>
    )
  }

  // ── Session finished ──────────────────────────────────────────────
  if (!card) {
    return (
      <Shell>
        <p className="eyebrow">Session complete</p>
        <h2 className="mt-4 font-display text-2xl">
          {session.queue.length} card{session.queue.length === 1 ? '' : 's'}{' '}
          reviewed
        </h2>
        <p className="mt-6 max-w-[52ch] text-secondary">
          Each answer nudged its card forward or back on the schedule. The ones
          you found hard return sooner; the easy ones drift further out.
        </p>
        <div className="mt-8 flex gap-6">
          <Link to="/">Back to the workshop floor</Link>
          <Link to="/bestiary">See the bestiary</Link>
        </div>
      </Shell>
    )
  }

  const kind = KIND[card.kind]
  const total = session.queue.length
  const progress = (index / total) * 100

  return (
    <Shell>
      {/* progress rail */}
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">
          Card {index + 1} of {total}
        </span>
        <span className="eyebrow">
          {session.newCount > 0 ? `${session.newCount} new · ` : ''}
          {session.dueCount} due
        </span>
      </div>
      <div
        className="mt-2 h-px w-full bg-line"
        role="progressbar"
        aria-valuenow={index}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="review progress"
      >
        <div
          className="h-px bg-accent transition-[width] duration-[220ms] ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="mt-10 rounded-card border border-line">
        <header className="flex flex-col gap-0.5 border-b border-line px-6 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span className="eyebrow" style={{ color: kind.accent }}>
            {kind.label}
          </span>
          <span className="eyebrow">
            {toRoman(card.chapter)} · {chapterTitle(card.chapter)}
          </span>
        </header>

        <div className="px-6 py-8">
          <p className="text-lg leading-[1.5]">{card.front}</p>
          {card.code ? (
            <pre className="mt-5 overflow-x-auto rounded-card border border-line bg-surface px-4 py-3 text-sm">
              <code>{card.code}</code>
            </pre>
          ) : null}

          {revealed ? (
            <div className="mt-7 border-t border-line pt-6">
              <p className="eyebrow">Answer</p>
              <p className="mt-3 text-md leading-[1.6] text-secondary">
                {card.back}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="border-t border-line px-6 py-4">
          {!revealed ? (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="cursor-pointer rounded-card border border-accent px-5 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
              >
                Reveal answer
              </button>
              <span className="text-sm text-secondary">
                or press <kbd className="text-accent-bright">Space</kbd>
              </span>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2">
                {BUTTONS.map((b, i) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => grade(b.key)}
                    aria-label={`${b.label} — ${b.hint}`}
                    className={
                      'flex-1 cursor-pointer rounded-card border px-3 py-2 text-sm transition-colors duration-[180ms] ' +
                      (b.key === 'again'
                        ? 'border-[color:var(--clay-500)] text-[color:var(--clay-500)] hover:bg-[color:var(--clay-500)] hover:text-bone-100'
                        : 'border-accent text-accent-bright hover:bg-accent hover:text-ink-950')
                    }
                  >
                    <span className="block font-mono text-xs opacity-60">
                      {i + 1}
                    </span>
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-secondary">
                How did that go? Hard cards come back sooner.
              </p>
            </div>
          )}
        </footer>
      </article>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mx-auto max-w-[640px]">
        <p className="eyebrow">Spaced review</p>
        <h1 className="mt-1 font-display text-md text-accent">The whetstone</h1>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
