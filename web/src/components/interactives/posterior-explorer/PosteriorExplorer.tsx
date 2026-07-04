import { useMemo, useState } from 'react'
import { RNG } from '../../../lib/rng'
import { kde, percentileInterval } from '../../../lib/stats'
import { marginals, predictAt, regressionBands, thin } from './engine'

export interface ExplorerDraws {
  a: Float64Array
  b: Float64Array
  sigma: Float64Array
}

interface PosteriorExplorerProps {
  draws: ExplorerDraws
  xbar: number
  data: { x: number; y: number }[]
  xLabel: string
  yLabel: string
  xRange: [number, number]
}

function DensityPanel({ name, mean, interval, density }: ReturnType<typeof marginals>[number]) {
  const W = 200
  const H = 90
  const xs = density.x
  const lo = xs[0]!
  const hi = xs[xs.length - 1]!
  const peak = Math.max(...density.y)
  const px = (x: number) => ((x - lo) / (hi - lo)) * (W - 8) + 4
  const py = (y: number) => H - 22 - (y / peak) * (H - 34)
  const path = density.y
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${px(xs[i]!).toFixed(1)},${py(v).toFixed(1)}`)
    .join(' ')
  return (
    <figure className="rounded-card border border-line p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        <path
          d={`${path} L${px(hi)},${H - 22} L${px(lo)},${H - 22} Z`}
          fill="var(--stat-posterior)"
          fillOpacity="0.08"
        />
        <path d={path} fill="none" stroke="var(--stat-posterior)" strokeWidth="1.5" />
        <line x1="4" x2={W - 4} y1={H - 22} y2={H - 22} stroke="var(--line)" strokeWidth="1" />
      </svg>
      <figcaption className="mt-1 font-mono text-xs">
        <span className="text-accent-bright">{name}</span>{' '}
        <span className="text-secondary">
          {mean.toFixed(2)} [{interval[0].toFixed(2)}, {interval[1].toFixed(2)}]
        </span>
      </figcaption>
    </figure>
  )
}

function PairsPanel({ x, y, xName, yName }: { x: number[]; y: number[]; xName: string; yName: string }) {
  const W = 200
  const H = 160
  const xLo = Math.min(...x)
  const xHi = Math.max(...x)
  const yLo = Math.min(...y)
  const yHi = Math.max(...y)
  const px = (v: number) => ((v - xLo) / (xHi - xLo)) * (W - 16) + 8
  const py = (v: number) => H - 8 - ((v - yLo) / (yHi - yLo)) * (H - 16)
  return (
    <figure className="rounded-card border border-line p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        {x.map((v, i) => (
          <circle key={i} cx={px(v)} cy={py(y[i]!)} r="1.4" fill="var(--stat-posterior)" opacity="0.35" />
        ))}
      </svg>
      <figcaption className="mt-1 text-center font-mono text-xs text-secondary">
        {yName} against {xName}
      </figcaption>
    </figure>
  )
}

export function PosteriorExplorer({ draws, xbar, data, xLabel, yLabel, xRange }: PosteriorExplorerProps) {
  const [cfX, setCfX] = useState(50)
  const [showPairs, setShowPairs] = useState(false)

  const ms = useMemo(() => marginals(draws as unknown as Record<string, Float64Array>), [draws])
  const bands = useMemo(
    () => regressionBands(draws, xbar, xRange, new RNG(1959)),
    [draws, xbar, xRange],
  )
  const cf = useMemo(() => predictAt(draws, xbar, cfX, new RNG(7)), [draws, xbar, cfX])
  const cfDensity = useMemo(() => kde(cf, { n: 96 }), [cf])
  const cfInterval = percentileInterval(cf, 0.89)
  const cfMean = cf.reduce((a, b) => a + b, 0) / cf.length

  // main plot geometry
  const W = 620
  const H = 400
  const yLo = Math.min(...bands.predLo, ...data.map((d) => d.y)) - 4
  const yHi = Math.max(...bands.predHi, ...data.map((d) => d.y)) + 4
  const px = (x: number) => ((x - xRange[0]) / (xRange[1] - xRange[0])) * (W - 80) + 60
  const py = (y: number) => H - 36 - ((y - yLo) / (yHi - yLo)) * (H - 56)
  const bandPath = (lo: readonly number[], hi: readonly number[]) => {
    const up = bands.xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(hi[i]!).toFixed(1)}`).join(' ')
    const down = [...bands.xs]
      .reverse()
      .map((x, i) => `L${px(x).toFixed(1)},${py(lo[bands.xs.length - 1 - i]!).toFixed(1)}`)
      .join(' ')
    return `${up} ${down} Z`
  }

  const pairsData = useMemo(
    () => ({
      a: thin(draws.a, 600),
      b: thin(draws.b, 600),
      sigma: thin(draws.sigma, 600),
    }),
    [draws],
  )

  return (
    <div>
      {/* marginals */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ms.map((m) => (
          <DensityPanel key={m.name} {...m} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowPairs(!showPairs)}
        className="mt-3 cursor-pointer rounded-card border border-line px-3 py-1.5 text-xs text-secondary transition-colors duration-[180ms] hover:border-accent"
      >
        {showPairs ? 'Hide' : 'Show'} pairs
      </button>
      {showPairs ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PairsPanel x={pairsData.a} y={pairsData.b} xName="a" yName="b" />
          <PairsPanel x={pairsData.a} y={pairsData.sigma} xName="a" yName="sigma" />
          <PairsPanel x={pairsData.b} y={pairsData.sigma} xName="b" yName="sigma" />
        </div>
      ) : null}

      {/* PPC */}
      <div className="mt-6 rounded-card border border-line bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Data with posterior mean and predictive bands">
          <path d={bandPath(bands.predLo, bands.predHi)} fill="var(--stat-predictive)" fillOpacity="0.12" />
          <path d={bandPath(bands.muLo, bands.muHi)} fill="var(--stat-posterior)" fillOpacity="0.16" />
          {data.map((d, i) => (
            <circle key={i} cx={px(d.x)} cy={py(d.y)} r="2" fill="none" stroke="var(--stat-data)" strokeWidth="0.8" opacity="0.7" />
          ))}
          <path
            d={bands.xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(bands.mean[i]!).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--stat-posterior)"
            strokeWidth="1.5"
          />
          {/* counterfactual marker */}
          <line x1={px(cfX)} x2={px(cfX)} y1={py(yLo)} y2={py(yHi)} stroke="var(--stat-predictive)" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
          <line x1={px(xRange[0])} x2={px(xRange[1])} y1={py(yLo)} y2={py(yLo)} stroke="var(--line)" strokeWidth="1" />
          <text x={px((xRange[0] + xRange[1]) / 2)} y={H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)">
            {xLabel}
          </text>
          <text x={18} y={py((yLo + yHi) / 2)} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)" transform={`rotate(-90 18 ${py((yLo + yHi) / 2)})`}>
            {yLabel}
          </text>
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-secondary">
        bone: data · brass: posterior mean and 89% of μ · plum: 89% of simulated {yLabel}
      </p>

      {/* counterfactual */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block">
            <span className="font-mono text-xs text-secondary">
              counterfactual {xLabel}: {cfX}
            </span>
            <input
              type="range"
              min={xRange[0]}
              max={xRange[1]}
              step={0.5}
              value={cfX}
              onChange={(e) => setCfX(Number(e.target.value))}
              className="mt-1 w-full accent-(--plum-500)"
            />
          </label>
          <p className="mt-3 font-mono text-sm">
            predicted {yLabel}:{' '}
            <span className="text-accent-bright">{cfMean.toFixed(1)}</span>{' '}
            <span className="text-secondary">
              [{cfInterval[0].toFixed(1)}, {cfInterval[1].toFixed(1)}] (89%)
            </span>
          </p>
        </div>
        <svg viewBox="0 0 260 100" className="w-full" aria-hidden="true">
          {(() => {
            const lo = cfDensity.x[0]!
            const hi = cfDensity.x[cfDensity.x.length - 1]!
            const peak = Math.max(...cfDensity.y)
            const qx = (v: number) => ((v - lo) / (hi - lo)) * 252 + 4
            const qy = (v: number) => 88 - (v / peak) * 76
            const p = cfDensity.y.map((v, i) => `${i === 0 ? 'M' : 'L'}${qx(cfDensity.x[i]!).toFixed(1)},${qy(v).toFixed(1)}`).join(' ')
            return (
              <>
                <path d={`${p} L${qx(hi)},88 L${qx(lo)},88 Z`} fill="var(--stat-predictive)" fillOpacity="0.08" />
                <path d={p} fill="none" stroke="var(--stat-predictive)" strokeWidth="1.5" />
                <line x1="4" x2="256" y1="88" y2="88" stroke="var(--line)" strokeWidth="1" />
              </>
            )
          })()}
        </svg>
      </div>
    </div>
  )
}
