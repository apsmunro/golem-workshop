import type { ReactNode } from 'react'
import { toRoman } from '../../lib/roman'

interface ChapterShellProps {
  n: number
  title: string
  golem?: string | null
  /**
   * The living-posterior header canvas (Phase 1). Until then the header
   * band holds the reserved space so layouts don't shift when it lands.
   */
  header?: ReactNode
  children: ReactNode
}

export function ChapterShell({ n, title, golem, header, children }: ChapterShellProps) {
  return (
    <article>
      <header className="border-b border-line">
        <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-16">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {header}
          </div>
          <div className="relative">
            <p className="eyebrow">
              Chapter {toRoman(n)} · {title}
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight">
              {title}
            </h1>
            {golem ? (
              <p className="mt-3 text-secondary">
                Forged here: <span className="text-accent-bright">{golem}</span>
              </p>
            ) : null}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="prose-col">{children}</div>
      </div>
    </article>
  )
}
