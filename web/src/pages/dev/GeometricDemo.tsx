import { useEffect, useState } from 'react'
import { GeometricPeople } from '../../components/interactives/geometric-people/GeometricPeople'
import type { HW } from '../../components/interactives/geometric-people/engine'
import { loadHowell } from '../../content/models/howell'

export function GeometricDemo() {
  const [rows, setRows] = useState<HW[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadHowell().then((hs) => {
      if (!cancelled) setRows(hs.map((r) => ({ height: r.height, weight: r.weight })))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Geometric people</p>
      <h1 className="mt-4 font-display text-2xl">Weight is a cube of height</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Drag the exponent and find the value where a single constant fits the
        whole growth curve. Geometry says three.
      </p>
      <div className="mt-10 max-w-[740px]">
        {rows ? <GeometricPeople rows={rows} /> : <p className="text-sm text-secondary">Measuring 544 !Kung…</p>}
      </div>
    </div>
  )
}
