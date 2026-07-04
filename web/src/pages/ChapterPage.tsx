import { Suspense, lazy, useEffect } from 'react'
import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Link, useParams } from 'react-router-dom'
import { ForgeCTA } from '../components/bestiary/ForgeCTA'
import { ChapterShell } from '../components/core/ChapterShell'
import { LivingPosterior } from '../components/core/LivingPosterior'
import { ChapterPractice } from '../components/practice/ChapterPractice'
import { chapterBySlug } from '../content/chapters'
import { drawsForChapter } from '../content/chapter-draws'
import { hintsByChapter } from '../content/practice'
import { useWorkshopStore } from '../store'

type MDXPage = ComponentType<{ components?: MDXComponents }>

/** Chapter prose, loaded per route together with its interactives + KaTeX. */
const chapterContent: Record<number, React.LazyExoticComponent<MDXPage>> = {
  1: lazy(() => import('../content/chapters/ch01.mdx')),
  2: lazy(() => import('../content/chapters/ch02.mdx')),
  3: lazy(() => import('../content/chapters/ch03.mdx')),
}

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
  const Content = chapterContent[chapter.n]

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
          fallback={<p className="text-sm text-secondary">Lighting the lamps…</p>}
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
      {hintsByChapter[chapter.n] ? (
        <section className="mt-16">
          <h2 className="eyebrow border-b border-line pb-3">
            Practice · work from your copy of the book
          </h2>
          <div className="mt-6">
            <ChapterPractice chapter={chapter.n} hints={hintsByChapter[chapter.n]!} />
          </div>
          <ForgeCTA chapter={chapter.n} />
        </section>
      ) : null}
      <p className="mt-16">
        <Link to="/">Back to the workshop floor</Link>
      </p>
    </ChapterShell>
  )
}
