import { useEffect, useState } from 'react'
import type { ChapterHints } from '../../content/practice/types'
import { hintLoaders } from '../../content/practice/loaders'
import { ForgeCTA } from '../bestiary/ForgeCTA'
import { ChapterPractice } from './ChapterPractice'

/**
 * The practice block of a chapter page. Loads the chapter's hint ladders
 * on demand (they are prose-heavy) and feeds both the problem cards and
 * the forge gate from the same fetch.
 */
export function PracticeSection({ chapter }: { chapter: number }) {
  const [hints, setHints] = useState<ChapterHints | null>(null)

  useEffect(() => {
    let live = true
    setHints(null)
    hintLoaders[chapter]?.().then((h) => {
      if (live) setHints(h)
    })
    return () => {
      live = false
    }
  }, [chapter])

  return (
    <section className="mt-16">
      <h2 className="eyebrow border-b border-line pb-3">
        Practice · work from your copy of the book
      </h2>
      <div className="mt-6">
        {hints ? (
          <ChapterPractice chapter={chapter} hints={hints} />
        ) : (
          <p className="text-sm text-secondary">Opening the drawer of problems…</p>
        )}
      </div>
      {hints ? <ForgeCTA chapter={chapter} hintIds={Object.keys(hints)} /> : null}
    </section>
  )
}
