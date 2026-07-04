/**
 * The forging ceremony — the one big animation in the app (CLAUDE.md §2.3).
 * The golem's engraved fragments assemble, its eyes kindle, and it joins
 * the bestiary. Under prefers-reduced-motion the golem simply appears.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkshopStore } from '../../store'
import type { GolemMeta } from './registry'

interface ForgingCeremonyProps {
  golem: GolemMeta
  onClose: () => void
}

export function ForgingCeremony({ golem, onClose }: ForgingCeremonyProps) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [assembled, setAssembled] = useState(reduced)
  const forgeGolem = useWorkshopStore((s) => s.forgeGolem)
  const completeChapter = useWorkshopStore((s) => s.completeChapter)

  useEffect(() => {
    forgeGolem(golem.id)
    completeChapter(golem.chapter)
    if (!reduced) {
      const t = window.setTimeout(() => setAssembled(true), 150)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [golem, forgeGolem, completeChapter, reduced])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Forging the ${golem.name}`}
    >
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center">
        <p className="eyebrow">The forging</p>
        <div className="mx-auto mt-6 h-56 w-44">
          <golem.Art state="forged" dismembered={!assembled} className="h-full w-full" />
        </div>
        <h2 className="mt-4 font-display text-xl">{golem.name}</h2>
        <p className="mt-2 text-sm text-secondary">{golem.epithet}</p>
        <p className="mt-3 font-mono text-xs text-secondary">{golem.signature}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/bestiary"
            onClick={onClose}
            className="rounded-card border border-accent px-4 py-2 text-sm !text-accent-bright !no-underline transition-colors duration-[180ms] hover:bg-accent hover:!text-ink-950"
          >
            Walk it to the bestiary
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-card border border-line px-4 py-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent"
          >
            Back to the bench
          </button>
        </div>
      </div>
    </div>
  )
}
