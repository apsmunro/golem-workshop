/**
 * Course-specific wrappers used inside chapter MDX. Keeps the MDX prose
 * clean of setup code.
 */
import { useEffect, useMemo, useState } from 'react'
import { CalibrationSketch } from '../../components/interactives/calibration-sketch/CalibrationSketch'
import { PriorPlayground } from '../../components/interactives/prior-playground/PriorPlayground'
import { DagSandbox } from '../../components/interactives/dag-sandbox/DagSandbox'
import { PosteriorExplorer } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import type { ExplorerDraws } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import { RNG } from '../../lib/rng'
import { drawsForChapter } from '../chapter-draws'
import { adults, fitM43, loadHowell } from '../models/howell'
import { kde } from '../../lib/stats'

/** Guess the globe-tossing posterior (6 W in 9) before seeing it. */
export function GlobeCalibration() {
  const truth = useMemo(() => {
    const globe = drawsForChapter(2)!
    return kde(globe.draws, { lo: 0, hi: 1, n: 128 })
  }, [])
  return (
    <CalibrationSketch
      id="ch02-globe-posterior"
      chapter={2}
      truth={truth}
      axis={{ left: '0', label: 'proportion water p', right: '1' }}
    />
  )
}

export { PriorPlayground, DagSandbox }

/** The chapter-4 posterior explorer, fit in the browser from Howell1. */
export function HowellExplorer() {
  const [state, setState] = useState<{
    draws: ExplorerDraws
    xbar: number
    data: { x: number; y: number }[]
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    loadHowell().then((rows) => {
      if (cancelled) return
      const grown = adults(rows)
      const fit = fitM43(grown)
      setState({
        draws: fit.draws(4000, new RNG(1959)) as unknown as ExplorerDraws,
        xbar: fit.xbar,
        data: grown.map((r) => ({ x: r.weight, y: r.height })),
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!state) {
    return <p className="text-sm text-secondary">Fitting the Gaussian golem to 352 adults…</p>
  }
  return (
    <PosteriorExplorer
      draws={state.draws}
      xbar={state.xbar}
      data={state.data}
      xLabel="weight (kg)"
      yLabel="height (cm)"
      xRange={[31, 63]}
    />
  )
}
