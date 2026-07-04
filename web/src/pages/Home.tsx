import { Link } from 'react-router-dom'
import { chapters } from '../content/chapters'
import { toRoman } from '../lib/roman'
import { useWorkshopStore } from '../store'
import type { ChapterStatus } from '../store/types'

function StatusMark({ status }: { status: ChapterStatus }) {
  const label =
    status === 'complete'
      ? 'forged'
      : status === 'in-progress'
        ? 'at the bench'
        : 'unforged'
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3 shrink-0"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      {status === 'complete' ? (
        <circle cx="6" cy="6" r="4.5" fill="var(--brass-400)" />
      ) : status === 'in-progress' ? (
        <>
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--brass-400)" strokeWidth="1" />
          <path d="M6 1.5 A 4.5 4.5 0 0 1 6 10.5 Z" fill="var(--brass-400)" />
        </>
      ) : (
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--line)" strokeWidth="1" />
      )}
    </svg>
  )
}

export function Home() {
  const progress = useWorkshopStore((s) => s.chapters)

  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <section className="pt-28 pb-24">
        <div className="prose-col">
          <p className="eyebrow">A workshop for Statistical Rethinking</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05]">
            Forge golems.
            <br />
            Learn what they can't do.
          </h1>
          <p className="mt-8 max-w-[46ch] text-md text-secondary">
            Every statistical model is a golem: obedient, tireless, and
            dangerous when misread. Seventeen benches, one per chapter. At each
            you predict before you see, simulate before you trust, and forge a
            golem you keep.
          </p>
        </div>
      </section>

      <section className="pb-28">
        <div className="mx-auto max-w-[820px]">
          <p className="eyebrow border-b border-line pb-3">The benches</p>
          <ol className="list-none">
            {chapters.map((ch) => {
              const status = progress[ch.n]?.status ?? 'unvisited'
              return (
                <li key={ch.n} className="border-b border-line">
                  <Link
                    to={`/chapter/${ch.slug}`}
                    className="group flex items-baseline gap-6 py-5 !no-underline"
                  >
                    <span className="w-12 shrink-0 text-right font-display text-md text-accent">
                      {toRoman(ch.n)}
                    </span>
                    <span className="flex min-w-0 grow items-baseline justify-between gap-4">
                      <span>
                        <span className="block !text-primary transition-colors duration-[180ms] group-hover:!text-accent-bright">
                          {ch.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-secondary">
                          {ch.golem ?? 'The key to the workshop'}
                        </span>
                      </span>
                      <StatusMark status={status} />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}
