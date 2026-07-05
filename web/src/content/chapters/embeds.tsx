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
import { ShrinkageTheater } from '../../components/interactives/shrinkage-theater/ShrinkageTheater'
import type { Tank } from '../../components/interactives/shrinkage-theater/engine'
import { DivergenceDetective } from '../../components/interactives/divergence-detective/DivergenceDetective'
import { CafeEllipse } from '../../components/interactives/cafe-ellipse/CafeEllipse'
import { GpIslands } from '../../components/interactives/gp-islands/GpIslands'
import { ErrorInVariables } from '../../components/interactives/error-in-variables/ErrorInVariables'
import type { WaffleRow } from '../../components/interactives/error-in-variables/engine'
import { ImputationExplorer } from '../../components/interactives/imputation-explorer/ImputationExplorer'
import type { MilkRow } from '../../components/interactives/imputation-explorer/engine'
import { GeometricPeople as GeometricPeopleView } from '../../components/interactives/geometric-people/GeometricPeople'
import type { HW } from '../../components/interactives/geometric-people/engine'
import { LynxHareOde } from '../../components/interactives/lynx-hare-ode/LynxHareOde'
import { HoroscopesCapstone } from '../../components/interactives/horoscopes/HoroscopesCapstone'
import { RNG } from '../../lib/rng'
import { drawsForChapter } from '../chapter-draws'
import { adults, fitM43, loadHowell } from '../models/howell'
import { loadRugged, loadTulips } from '../models/interactions'
import { loadReedfrogs } from '../models/multilevel'
import { loadMilk, loadWaffles } from '../models/measurement'
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
  DivergenceDetective,
  CafeEllipse,
  GpIslands,
  LynxHareOde,
  HoroscopesCapstone,
}

/** Chapter 13: the reedfrog tanks, loaded once for the Shrinkage Theater. */
export function ReedfrogTheater() {
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
  if (!tanks) return <p className="text-sm text-secondary">Counting 48 tanks of tadpoles…</p>
  return <ShrinkageTheater tanks={tanks} />
}

/** Chapter 15: WaffleDivorce measurement-error sim. */
export function DivorceError() {
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
  if (!rows) return <p className="text-sm text-secondary">Measuring fifty states…</p>
  return <ErrorInVariables rows={rows} />
}

/** Chapter 15: milk imputation explorer. */
export function MilkImputation() {
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
  if (!rows) return <p className="text-sm text-secondary">Loading 29 primate species…</p>
  return <ImputationExplorer rows={rows} />
}

/** Chapter 16: the geometric cylinder model over the full Howell census. */
export function GeometricPeople() {
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
  if (!rows) return <p className="text-sm text-secondary">Measuring 544 !Kung…</p>
  return <GeometricPeopleView rows={rows} />
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
