import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChapterShell } from '../components/core/ChapterShell'
import { LivingPosterior } from '../components/core/LivingPosterior'
import { chapterBySlug } from '../content/chapters'
import { drawsForChapter } from '../content/chapter-draws'
import { useWorkshopStore } from '../store'

export function ChapterPage() {
  const { slug } = useParams()
  const chapter = slug ? chapterBySlug(slug) : undefined
  const visitChapter = useWorkshopStore((s) => s.visitChapter)

  useEffect(() => {
    if (chapter) visitChapter(chapter.n)
  }, [chapter, visitChapter])

  if (!chapter) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-28">
        <div className="prose-col">
          <p className="eyebrow">No such bench</p>
          <h1 className="mt-4 font-display text-2xl">
            Nothing is forged here
          </h1>
          <p className="mt-6 text-secondary">
            The workshop has seventeen benches, and this is none of them.{' '}
            <Link to="/">Return to the floor.</Link>
          </p>
        </div>
      </div>
    )
  }

  const living = drawsForChapter(chapter.n)

  return (
    <ChapterShell
      n={chapter.n}
      title={chapter.title}
      golem={chapter.golem}
      header={
        living ? (
          <LivingPosterior draws={living.draws} range={living.range} />
        ) : undefined
      }
    >
      <p className="eyebrow">Bench under construction</p>
      <p className="mt-4 text-secondary">
        The tools for this chapter are still being forged. When the bench is
        ready it will hold the chapter's living posterior, its interactives,
        practice problems with hint ladders, and{' '}
        {chapter.golem ? (
          <>
            the <span className="text-accent-bright">{chapter.golem}</span>
          </>
        ) : (
          'the key to the workshop'
        )}
        .
      </p>
      <p className="mt-6">
        <Link to="/">Back to the workshop floor</Link>
      </p>
    </ChapterShell>
  )
}
