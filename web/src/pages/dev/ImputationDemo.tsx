import { useEffect, useState } from 'react'
import { ImputationExplorer } from '../../components/interactives/imputation-explorer/ImputationExplorer'
import type { MilkRow } from '../../components/interactives/imputation-explorer/engine'
import { loadMilk } from '../../content/models/measurement'

export function ImputationDemo() {
  const [rows, setRows] = useState<MilkRow[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadMilk().then((r) => {
      if (!cancelled) setRows(r)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Imputation explorer</p>
      <h1 className="mt-4 font-display text-2xl">The milk with holes in it</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Toggle between deleting the incomplete species and imputing their
        neocortex from body mass, and watch twelve species return to the model.
      </p>
      <div className="mt-10 max-w-[740px]">
        {rows ? <ImputationExplorer rows={rows} /> : <p className="text-sm text-secondary">Loading 29 primate species…</p>}
      </div>
    </div>
  )
}
