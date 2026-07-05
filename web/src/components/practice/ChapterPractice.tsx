import { useEffect, useState } from 'react'
import type { ChapterHints } from '../../content/practice/types'
import { ProblemCard } from './ProblemCard'

interface ProblemMeta {
  id: string
  tier: 'easy' | 'medium' | 'hard'
  hasSolution: boolean
}

type ProblemsFile = Record<string, ProblemMeta[]>

let problemsCache: ProblemsFile | null = null

export function ChapterPractice({ chapter, hints }: { chapter: number; hints: ChapterHints }) {
  const [problems, setProblems] = useState<ProblemMeta[] | null>(
    problemsCache?.[String(chapter)] ?? null,
  )

  useEffect(() => {
    if (problemsCache) return
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/course/problems.json`)
      .then((r) => r.json())
      .then((data: ProblemsFile) => {
        problemsCache = data
        if (!cancelled) setProblems(data[String(chapter)] ?? [])
      })
      .catch(() => {
        if (!cancelled) setProblems([])
      })
    return () => {
      cancelled = true
    }
  }, [chapter])

  if (problems === null) {
    return <p className="text-sm text-secondary">Fetching the problem ledger…</p>
  }

  const withHints = problems.filter((p) => hints[p.id])

  // Chapters with no book practice section (ch 10) carry workshop-only
  // drills that never appear in the ledger; render them from the hints.
  if (withHints.length === 0) {
    const drills = Object.keys(hints).filter((id) => hints[id]!.workshop)
    if (drills.length > 0) {
      return (
        <div className="space-y-3">
          {drills.map((id) => (
            <ProblemCard key={id} chapter={chapter} id={id} tier="medium" hints={hints[id]!} />
          ))}
        </div>
      )
    }
  }

  return (
    <div className="space-y-3">
      {withHints.map((p) => (
        <ProblemCard key={p.id} chapter={chapter} id={p.id} tier={p.tier} hints={hints[p.id]!} />
      ))}
    </div>
  )
}
