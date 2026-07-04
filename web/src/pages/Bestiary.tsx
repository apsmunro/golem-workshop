import { Link } from 'react-router-dom'
import { chapters } from '../content/chapters'
import { toRoman } from '../lib/roman'
import { useWorkshopStore } from '../store'
import { golemForChapter } from '../components/bestiary/registry'

export function Bestiary() {
  const forged = useWorkshopStore((s) => s.golems)

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">The bestiary</p>
      <h1 className="mt-4 font-display text-3xl">Your golems</h1>
      <p className="mt-4 max-w-[52ch] text-secondary">
        Every model you forge stands here, formula stamped on its chest.
        Empty plinths are chapters still waiting for their clay.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {chapters
          .filter((ch) => ch.golem !== null)
          .map((ch) => {
            const meta = golemForChapter(ch.n)
            const isForged = meta ? forged[meta.id] !== undefined : false
            return (
              <Link
                key={ch.n}
                to={`/chapter/${ch.slug}`}
                className="group rounded-card border border-line p-4 !no-underline transition-colors duration-[180ms] hover:border-accent"
              >
                <p className="eyebrow">Chapter {toRoman(ch.n)}</p>
                <div className="mx-auto mt-3 flex h-40 w-32 items-center justify-center">
                  {meta ? (
                    <meta.Art
                      state={isForged ? 'forged' : 'unforged'}
                      className="h-full w-full"
                    />
                  ) : (
                    <svg viewBox="0 0 120 150" className="h-full w-full" aria-hidden="true">
                      <path
                        d="M35 130 L85 130 L80 118 L40 118 Z M44 118 L44 110 L76 110 L76 118"
                        fill="none"
                        stroke="var(--line)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <p className={`mt-3 text-center text-sm ${isForged ? '!text-primary' : 'text-secondary'}`}>
                  {ch.golem}
                </p>
                {meta && isForged ? (
                  <p className="mt-1 text-center font-mono text-[10px] leading-snug text-secondary">
                    {meta.signature}
                  </p>
                ) : (
                  <p className="mt-1 text-center text-xs text-secondary">
                    {meta ? 'unforged' : 'clay not yet dug'}
                  </p>
                )}
              </Link>
            )
          })}
      </div>
    </div>
  )
}
