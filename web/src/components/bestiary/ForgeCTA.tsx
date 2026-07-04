import { useState } from 'react'
import { useWorkshopStore } from '../../store'
import { hintsByChapter } from '../../content/practice'
import { ForgingCeremony } from './ForgingCeremony'
import { golemForChapter } from './registry'

const EMPTY: string[] = []

/**
 * Appears under a chapter's practice section. Enabled once every problem
 * with a hint ladder is marked complete; forging triggers the ceremony.
 */
export function ForgeCTA({ chapter }: { chapter: number }) {
  const [ceremony, setCeremony] = useState(false)
  const golem = golemForChapter(chapter)
  // Select the stored array directly (stable identity); default after.
  const doneStored = useWorkshopStore((s) => s.chapters[chapter]?.problemsDone)
  const done = doneStored ?? EMPTY
  const forged = useWorkshopStore((s) =>
    golem ? s.golems[golem.id] !== undefined : false,
  )

  if (!golem) return null
  const hintIds = Object.keys(hintsByChapter[chapter] ?? {})
  const remaining = hintIds.filter((id) => !done.includes(id)).length
  const ready = remaining === 0 && hintIds.length > 0

  return (
    <div className="mt-10 rounded-card border border-line p-5">
      {forged ? (
        <p className="text-sm text-secondary">
          The <span className="text-accent-bright">{golem.name}</span> stands
          in your bestiary.
        </p>
      ) : ready ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm">
            Every problem forged. The {golem.name.toLowerCase()} is ready to
            wake.
          </p>
          <button
            type="button"
            onClick={() => setCeremony(true)}
            className="cursor-pointer rounded-card border border-accent px-5 py-2 text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
          >
            Forge the golem
          </button>
        </div>
      ) : (
        <p className="text-sm text-secondary">
          {remaining} problem{remaining === 1 ? '' : 's'} between you and the{' '}
          {golem.name}.
        </p>
      )}
      {ceremony ? (
        <ForgingCeremony golem={golem} onClose={() => setCeremony(false)} />
      ) : null}
    </div>
  )
}
