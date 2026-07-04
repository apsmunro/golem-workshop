/**
 * Rosetta — the same model in the book's dialect (quap/ulam) and ours
 * (brms), as tabs. The chosen dialect persists for the session so a
 * reader who thinks in one voice stays in it across the whole page.
 */
import { useSyncExternalStore } from 'react'

export type Dialect = 'book' | 'brms'

let currentDialect: Dialect = 'brms'
const listeners = new Set<() => void>()

function setDialect(d: Dialect) {
  currentDialect = d
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

interface RosettaProps {
  /** model name shown in the header, e.g. "m4.3" */
  model: string
  /** rethinking-dialect code (quap or ulam) */
  book: string
  /** brms translation with explicit priors */
  brms: string
}

export function Rosetta({ model, book, brms }: RosettaProps) {
  const dialect = useSyncExternalStore(subscribe, () => currentDialect)
  const code = dialect === 'book' ? book : brms

  return (
    <figure className="my-6 rounded-card border border-line">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono text-sm text-accent-bright">{model}</span>
        <span className="flex rounded-card border border-line" role="group" aria-label="Code dialect">
          {(
            [
              ['brms', 'brms'],
              ['book', 'quap/ulam'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDialect(key)}
              aria-pressed={dialect === key}
              className={`cursor-pointer px-3 py-1 text-xs transition-colors duration-[180ms] ${
                dialect === key ? 'bg-surface text-accent-bright' : 'text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </span>
      </figcaption>
      <pre className="overflow-x-auto bg-ink-950 p-4 font-mono text-sm leading-relaxed whitespace-pre">
        {code}
      </pre>
    </figure>
  )
}
