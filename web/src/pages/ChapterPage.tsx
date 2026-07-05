import { Suspense, lazy, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChapterShell } from '../components/core/ChapterShell'
import { LivingPosterior } from '../components/core/LivingPosterior'
import { chapterBySlug } from '../content/chapters'
import { chapterContent } from '../content/chapter-content'
import type { MDXPage } from '../content/chapter-content'
import { drawsForChapter } from '../content/chapter-draws'
import { hintLoaders } from '../content/practice/loaders'
import { useWorkshopStore } from '../store'

// Below the fold and heavy (golem art, ceremony, hint prose) — own chunk.
const PracticeSection = lazy(async () => {
  const m = await import('../components/practice/PracticeSection')
  return { default: m.PracticeSection }
})

/** Chapter prose, loaded per route together with its interactives + KaTeX. */
const lazyContent: Record<number, React.LazyExoticComponent<MDXPage>> = Object.fromEntries(
  Object.entries(chapterContent).map(([n, load]) => [n, lazy(load)]),
)

const MdxBundle = lazy(async () => {
  const { mdxComponents } = await import('../components/core/mdx-components')
  return {
    default: ({ Content }: { Content: MDXPage }) => (
      <Content components={mdxComponents} />
    ),
  }
})

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
          <h1 className="mt-4 font-display text-2xl">Nothing is forged here</h1>
          <p className="mt-6 text-secondary">
            The workshop has seventeen benches, and this is none of them.{' '}
            <Link to="/">Return to the floor.</Link>
          </p>
        </div>
      </div>
    )
  }

  const living = drawsForChapter(chapter.n)
  const Content = lazyContent[chapter.n]

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
      {Content ? (
        <Suspense
          fallback={
            // Tall fallback keeps the practice section below the fold while
            // the chapter chunk loads, so the swap doesn't shift the page.
            <div className="min-h-[80vh]">
              <p className="text-sm text-secondary">Lighting the lamps…</p>
            </div>
          }
        >
          <MdxBundle Content={Content} />
        </Suspense>
      ) : (
        <>
          <p className="eyebrow">Bench under construction</p>
          <p className="mt-4 text-secondary">
            The tools for this chapter are still being forged. When the bench
            is ready it will hold the chapter's living posterior, its
            interactives, practice problems with hint ladders, and{' '}
            {chapter.golem ? (
              <>
                the <span className="text-accent-bright">{chapter.golem}</span>
              </>
            ) : (
              'the key to the workshop'
            )}
            .
          </p>
        </>
      )}
      {hintLoaders[chapter.n] ? (
        <Suspense fallback={null}>
          <PracticeSection chapter={chapter.n} />
        </Suspense>
      ) : null}
      <p className="mt-16">
        <Link to="/">Back to the workshop floor</Link>
      </p>
    </ChapterShell>
  )
}
