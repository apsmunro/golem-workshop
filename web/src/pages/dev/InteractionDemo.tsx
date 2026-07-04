import { useEffect, useState } from 'react'
import { InteractionSurface } from '../../components/interactives/interaction-surface/InteractionSurface'
import type { XYM } from '../../components/interactives/interaction-surface/engine'
import { loadRugged, loadTulips } from '../../content/models/interactions'

export function InteractionDemo() {
  const [rugged, setRugged] = useState<XYM[] | null>(null)
  const [tulips, setTulips] = useState<XYM[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadRugged().then((r) => {
      if (!cancelled) setRugged(r)
    })
    loadTulips().then((t) => {
      if (!cancelled) setTulips(t)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Interaction surface</p>
      <h1 className="mt-4 font-display text-2xl">The slope has a slope</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Two real datasets where one predictor's effect depends on another:
        terrain and continent, then water and shade.
      </p>
      <div className="mt-10 max-w-[900px]">
        <h2 className="eyebrow border-b border-line pb-3">rugged · log GDP</h2>
        <div className="mt-6">
          {rugged ? (
            <InteractionSurface
              data={rugged}
              xLabel="ruggedness"
              yLabel="log GDP (rel.)"
              mLabel="continent"
              moderator={{ kind: 'binary', labels: ['not Africa', 'Africa'] }}
            />
          ) : (
            <p className="text-sm text-secondary">Loading rugged.csv…</p>
          )}
        </div>
        <h2 className="eyebrow mt-16 border-b border-line pb-3">tulips · blooms</h2>
        <div className="mt-6">
          {tulips ? (
            <InteractionSurface
              data={tulips}
              xLabel="water (centered)"
              yLabel="blooms (rel.)"
              mLabel="shade (centered)"
              moderator={{ kind: 'range', lo: -1, hi: 1, step: 1 }}
            />
          ) : (
            <p className="text-sm text-secondary">Loading tulips.csv…</p>
          )}
        </div>
      </div>
    </div>
  )
}
