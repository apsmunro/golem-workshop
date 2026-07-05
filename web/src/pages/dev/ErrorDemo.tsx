import { useEffect, useState } from 'react'
import { ErrorInVariables } from '../../components/interactives/error-in-variables/ErrorInVariables'
import type { WaffleRow } from '../../components/interactives/error-in-variables/engine'
import { loadWaffles } from '../../content/models/measurement'

export function ErrorDemo() {
  const [rows, setRows] = useState<WaffleRow[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadWaffles().then((r) => {
      if (!cancelled) setRows(r)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Error-in-variables</p>
      <h1 className="mt-4 font-display text-2xl">Divorce, measured with error</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Toggle the measurement-error model and watch the noisy small states
        shrink toward the line while the precise states hold their ground.
      </p>
      <div className="mt-10 max-w-[760px]">
        {rows ? <ErrorInVariables rows={rows} /> : <p className="text-sm text-secondary">Loading fifty states…</p>}
      </div>
    </div>
  )
}
