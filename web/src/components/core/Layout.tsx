import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useWorkshopStore } from '../../store'
import type { SrsDeckCard } from '../../content/srs/types'
import { buildReviewQueue } from '../../lib/srs-review'
import { ProgressPorter } from './ProgressPorter'

export function Layout() {
  const theme = useWorkshopStore((s) => s.theme)
  const toggleTheme = useWorkshopStore((s) => s.toggleTheme)
  const cards = useWorkshopStore((s) => s.cards)
  const chaptersProgress = useWorkshopStore((s) => s.chapters)

  // Deck content loads after first paint; the badge pops in when it lands.
  const [deck, setDeck] = useState<readonly SrsDeckCard[] | null>(null)
  useEffect(() => {
    let live = true
    void import('../../content/srs').then((m) => {
      if (live) setDeck(m.allDeckCards)
    })
    return () => {
      live = false
    }
  }, [])

  const waiting = deck
    ? (() => {
        const q = buildReviewQueue(deck, cards, chaptersProgress, new Date())
        return q.newCount + q.dueCount
      })()
    : 0

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen bg-ground text-primary">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] items-baseline justify-between px-6 py-4">
          <Link
            to="/"
            className="font-display text-md !text-primary !no-underline"
          >
            The Golem Workshop
          </Link>
          <nav className="flex items-baseline gap-6">
            <Link
              to="/review"
              className="flex items-baseline gap-1.5 text-sm !text-secondary !no-underline transition-colors duration-[180ms] hover:!text-accent-bright"
            >
              Review
              {waiting > 0 ? (
                <span
                  className="inline-flex min-w-[1.1rem] justify-center rounded-full bg-accent px-1 font-mono text-xs text-ink-950"
                  aria-label={`${waiting} cards to review`}
                >
                  {waiting}
                </span>
              ) : null}
            </Link>
            <Link to="/bestiary" className="text-sm !text-secondary !no-underline transition-colors duration-[180ms] hover:!text-accent-bright">
              Bestiary
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="eyebrow cursor-pointer rounded-control border border-line px-4 py-1 !text-primary transition-colors duration-[180ms] hover:border-accent"
            >
              {theme === 'workshop' ? 'Daylight' : 'Workshop'}
            </button>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-32 border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 px-6 py-8">
          <p className="text-sm text-secondary">
            A companion to <em>Statistical Rethinking</em> (2nd ed.) by Richard
            McElreath. Original prose and code throughout; bring your own copy
            of the book.
          </p>
          <ProgressPorter />
        </div>
      </footer>
    </div>
  )
}
