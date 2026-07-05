import { useState } from 'react'
import { useWorkshopStore } from '../../store'
import type { ProblemHints } from '../../content/practice/types'
import { HintLadder } from './HintLadder'

interface ProblemCardProps {
  chapter: number
  id: string
  tier: 'easy' | 'medium' | 'hard'
  hints: ProblemHints
}

const TIER_LABEL = { easy: 'easy', medium: 'medium', hard: 'hard' } as const

export function ProblemCard({ chapter, id, tier, hints }: ProblemCardProps) {
  const [open, setOpen] = useState(false)
  const done = useWorkshopStore(
    (s) => s.chapters[chapter]?.problemsDone.includes(id) ?? false,
  )
  const markProblemDone = useWorkshopStore((s) => s.markProblemDone)
  const addCard = useWorkshopStore((s) => s.addCard)

  const complete = () => {
    markProblemDone(chapter, id)
    addCard(`problem-${id}`)
  }

  return (
    <article className="rounded-card border border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-baseline gap-4 px-4 py-3 text-left"
      >
        <span className="font-mono text-sm text-accent-bright">{id}</span>
        <span className="grow text-[15px]">{hints.paraphrase}</span>
        <span className="eyebrow shrink-0">{TIER_LABEL[tier]}</span>
        {done ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" role="img" aria-label="complete">
            <circle cx="6" cy="6" r="4.5" fill="var(--brass-400)" />
          </svg>
        ) : null}
      </button>
      {open ? (
        <div className="border-t border-line px-4 py-4">
          <p className="text-sm text-secondary">
            {hints.workshop
              ? 'A bench drill of this workshop — no book needed; the line above is the whole task.'
              : `Work from your copy of the book (${id}, end-of-chapter practice).`}{' '}
            Hints open one rung at a time; try each rung before the next.
          </p>
          <HintLadder hints={hints} />
          <div className="mt-4">
            <button
              type="button"
              onClick={complete}
              disabled={done}
              className="cursor-pointer rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950 disabled:cursor-default disabled:opacity-50"
            >
              {done ? 'Complete' : 'Mark complete'}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
