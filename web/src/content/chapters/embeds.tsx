/**
 * Course-specific wrappers used inside chapter MDX. Keeps the MDX prose
 * clean of setup code.
 */
import { useEffect, useMemo, useState } from 'react'
import { AdmitParadox } from '../../components/interactives/admit-paradox/AdmitParadox'
import { CalibrationSketch } from '../../components/interactives/calibration-sketch/CalibrationSketch'
import { ChimpExplorer } from '../../components/interactives/chimp-explorer/ChimpExplorer'
import { CutpointDragger } from '../../components/interactives/cutpoint-dragger/CutpointDragger'
import { EntropyPebbles } from '../../components/interactives/entropy-pebbles/EntropyPebbles'
import { KlinePoisson } from '../../components/interactives/kline-poisson/KlinePoisson'
import { LinkMorpher } from '../../components/interactives/link-morpher/LinkMorpher'
import { ZeroInflationMixer } from '../../components/interactives/zero-inflation-mixer/ZeroInflationMixer'
import { PriorPlayground } from '../../components/interactives/prior-playground/PriorPlayground'
import { DagSandbox } from '../../components/interactives/dag-sandbox/DagSandbox'
import { HmcToy } from '../../components/interactives/hmc-toy/HmcToy'
import { InteractionSurface } from '../../components/interactives/interaction-surface/InteractionSurface'
import type { XYM } from '../../components/interactives/interaction-surface/engine'
import { OverfitGame } from '../../components/interactives/overfit-game/OverfitGame'
import { PosteriorExplorer } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import type { ExplorerDraws } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import { TraceTriage } from '../../components/interactives/trace-triage/TraceTriage'
import { RNG } from '../../lib/rng'
import { drawsForChapter } from '../chapter-draws'
import { adults, fitM43, loadHowell } from '../models/howell'
import { loadRugged, loadTulips } from '../models/interactions'
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

export {
  PriorPlayground,
  DagSandbox,
  OverfitGame,
  HmcToy,
  TraceTriage,
  EntropyPebbles,
  LinkMorpher,
  ChimpExplorer,
  AdmitParadox,
  KlinePoisson,
  CutpointDragger,
  ZeroInflationMixer,
}

/** Chapter 8: terrain ruggedness and GDP, moderated by continent. */
export function RuggedSurface() {
  const [data, setData] = useState<XYM[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadRugged().then((rows) => {
      if (!cancelled) setData(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])
  if (!data) return <p className="text-sm text-secondary">Surveying 170 nations…</p>
  return (
    <InteractionSurface
      data={data}
      xLabel="ruggedness"
      yLabel="log GDP (rel.)"
      mLabel="continent"
      moderator={{ kind: 'binary', labels: ['not Africa', 'Africa'] }}
    />
  )
}

/** Chapter 8: the tulip greenhouse, water throttled by shade. */
export function TulipsSurface() {
  const [data, setData] = useState<XYM[] | null>(null)
  useEffect(() => {
    let cancelled = false
    loadTulips().then((rows) => {
      if (!cancelled) setData(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])
  if (!data) return <p className="text-sm text-secondary">Watering 27 tulip beds…</p>
  return (
    <InteractionSurface
      data={data}
      xLabel="water (centered)"
      yLabel="blooms (rel.)"
      mLabel="shade (centered)"
      moderator={{ kind: 'range', lo: -1, hi: 1, step: 1 }}
    />
  )
}

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
