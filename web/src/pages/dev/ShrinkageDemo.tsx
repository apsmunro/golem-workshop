import { useEffect, useState } from 'react'
import { ShrinkageTheater } from '../../components/interactives/shrinkage-theater/ShrinkageTheater'
import type { Tank } from '../../components/interactives/shrinkage-theater/engine'
import { loadReedfrogs } from '../../content/models/multilevel'

export function ShrinkageDemo() {
  const [tanks, setTanks] = useState<Tank[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadReedfrogs().then((t) => {
      if (!cancelled) setTanks(t)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Shrinkage Theater</p>
      <h1 className="mt-4 font-display text-2xl">The reedfrog tanks</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Drag the prior width to slide between no pooling and complete pooling,
        and watch the small tanks give up their raw estimates first.
      </p>
      <div className="mt-10 max-w-[820px]">
        {tanks ? (
          <ShrinkageTheater tanks={tanks} />
        ) : (
          <p className="text-sm text-secondary">Counting 48 tanks of tadpoles…</p>
        )}
      </div>
    </div>
  )
}
