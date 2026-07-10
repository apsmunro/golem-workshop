import { useEffect, useMemo, useState } from 'react'
import { HOUSE_SEED, RNG } from '../../../lib/rng'
import {
  expectedTools,
  fitKline,
  klineRows,
  rateIgnoringExposure,
  rateWithOffset,
  simulateLedger,
} from './engine'
import type { Society } from './engine'

const W = 620
const H = 300

interface FitState {
  rows: Society[]
  draws: Record<string, Float64Array>
  /** for converting logPopStd back to population */
  logMean: number
  logSd: number
}

export function KlinePoisson() {
  const [state, setState] = useState<FitState | null>(null)
  const [naturalAxis, setNaturalAxis] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/datasets/Kline.csv`)
      .then((r) => r.text())
      .then((csv) => {
        if (cancelled) return
        const rows = klineRows(csv)
        const logs = rows.map((r) => Math.log(r.population))
        const logMean = logs.reduce((a, b) => a + b, 0) / logs.length
        const logSd = Math.sqrt(
          logs.reduce((a, b) => a + (b - logMean) ** 2, 0) / (logs.length - 1),
        )
        const draws = fitKline(rows).draws(2000, new RNG(HOUSE_SEED, 31))
        setState({ rows, draws, logMean, logSd })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const curves = useMemo(() => {
    if (!state) return null
    const N = 60
    const zLo = -1.5
    const zHi = 2.6
    return ([false, true] as const).map((hc) => ({
      highContact: hc,
      pts: Array.from({ length: N + 1 }, (_, i) => {
        const z = zLo + (i / N) * (zHi - zLo)
        return { z, ...expectedTools(state.draws, z, hc) }
      }),
    }))
  }, [state])

  if (!state || !curves) {
    return <p className="text-sm text-secondary">Counting tool kits on ten islands…</p>
  }

  const zToPop = (z: number) => Math.exp(state.logMean + state.logSd * z)
  const popMax = 300000
  const xOf = (z: number) =>
    naturalAxis
      ? 52 + (Math.min(zToPop(z), popMax) / popMax) * (W - 68)
      : 52 + ((z + 1.5) / 4.1) * (W - 68)
  const yMax = 90
  const yOf = (tools: number) => 14 + (1 - Math.min(tools, yMax) / yMax) * (H - 58)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Tools follow people — on which scale?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNaturalAxis(false)}
            className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
              !naturalAxis
                ? 'border-accent text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            log population
          </button>
          <button
            type="button"
            onClick={() => setNaturalAxis(true)}
            className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
              naturalAxis
                ? 'border-accent text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            natural population
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Total tools against population for ten Oceanic societies with posterior mean curves per contact level"
        >
          {[0, 30, 60, 90].map((tv) => (
            <g key={tv}>
              <line
                x1={46}
                x2={W - 10}
                y1={yOf(tv)}
                y2={yOf(tv)}
                stroke="var(--line)"
                strokeWidth="1"
                opacity="0.45"
              />
              <text
                x={40}
                y={yOf(tv) + 3}
                textAnchor="end"
                fill="var(--bone-300)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {tv}
              </text>
            </g>
          ))}

          {curves.map((c) => {
            const stroke = c.highContact ? 'var(--brass-400)' : 'var(--brass-200)'
            const visible = c.pts.filter((p) => !naturalAxis || zToPop(p.z) <= popMax)
            const path = visible
              .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.z).toFixed(1)},${yOf(p.mean).toFixed(1)}`)
              .join(' ')
            const band = [
              ...visible.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.z).toFixed(1)},${yOf(p.hi).toFixed(1)}`),
              ...visible
                .slice()
                .reverse()
                .map((p) => `L${xOf(p.z).toFixed(1)},${yOf(p.lo).toFixed(1)}`),
              'Z',
            ].join(' ')
            return (
              <g key={String(c.highContact)}>
                <path d={band} fill={stroke} opacity="0.07" />
                <path
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.5"
                  strokeDasharray={c.highContact ? undefined : '5 3'}
                />
              </g>
            )
          })}

          {state.rows.map((r) => (
            <g key={r.culture}>
              {r.highContact ? (
                <circle
                  cx={xOf(r.logPopStd)}
                  cy={yOf(r.tools)}
                  r="4"
                  fill="var(--bone-100)"
                />
              ) : (
                <circle
                  cx={xOf(r.logPopStd)}
                  cy={yOf(r.tools)}
                  r="4.4"
                  fill="none"
                  stroke="var(--bone-100)"
                  strokeWidth="1.4"
                />
              )}
              {['Hawaii', 'Tonga', 'Yap'].includes(r.culture) ? (
                <text
                  x={xOf(r.logPopStd) + (r.culture === 'Hawaii' ? -8 : 8)}
                  y={yOf(r.tools) - 7}
                  textAnchor={r.culture === 'Hawaii' ? 'end' : 'start'}
                  fill="var(--bone-300)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {r.culture}
                </text>
              ) : null}
            </g>
          ))}

          <line x1={46} x2={W - 10} y1={H - 44} y2={H - 44} stroke="var(--line)" strokeWidth="1" />
          <text
            x={(46 + W) / 2}
            y={H - 24}
            textAnchor="middle"
            fill="var(--bone-300)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {naturalAxis ? 'population' : 'log population (standardized)'}
          </text>
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-secondary">
        solid brass = high contact, dashed = low · filled data points = high
        contact · 89% bands · Hawaii is low contact, huge, and alone out there
      </p>

      <ExposureLab />
    </div>
  )
}

/** The monastery ledger: same rate, different bookkeeping. */
function ExposureLab() {
  const [days, setDays] = useState(7)
  const [useOffset, setUseOffset] = useState(false)

  const { rateA, rateBRaw, rateBOffset } = useMemo(() => {
    const rng = new RNG(HOUSE_SEED, 41)
    const a = simulateLedger(rng, 1.5, 1, 30)
    const b = simulateLedger(rng, 0.5, days, 30)
    return {
      rateA: rateWithOffset(a),
      rateBRaw: rateIgnoringExposure(b),
      rateBOffset: rateWithOffset(b),
    }
  }, [days])

  const shownB = useOffset ? rateBOffset : rateBRaw
  const honest = useOffset || days === 1
  const barMax = Math.max(rateA, shownB, 2)
  const barW = (v: number) => (v / barMax) * 320

  return (
    <div className="mt-6 rounded-card border border-line p-5">
      <p className="eyebrow">The second ledger — an offset in the wild</p>
      <p className="mt-3 text-sm text-secondary">
        Your monastery finishes about 1.5 manuscripts a day and logs daily. A
        monastery you might buy logs one total per{' '}
        <span className="font-mono text-primary">{days}</span> day
        {days === 1 ? '' : 's'}. Compare their apparent output.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          days per record
          <input
            type="range"
            min={1}
            max={14}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-40 accent-(--brass-400)"
          />
          <span className="font-mono text-xs">{days}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useOffset}
            onChange={(e) => setUseOffset(e.target.checked)}
            className="accent-(--brass-400)"
          />
          include log(exposure) offset
        </label>
      </div>

      <div className="mt-4 space-y-2 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-40 text-secondary">yours (daily log)</span>
          <svg width="330" height="12" aria-hidden="true">
            <rect x="0" y="2" width={barW(rateA)} height="8" fill="var(--stat-data)" opacity="0.85" />
          </svg>
          <span>{rateA.toFixed(2)}/day</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-40 text-secondary">theirs (as estimated)</span>
          <svg width="330" height="12" aria-hidden="true">
            <rect
              x="0"
              y="2"
              width={barW(shownB)}
              height="8"
              fill={honest ? 'var(--stat-posterior)' : 'var(--stat-danger)'}
              opacity="0.9"
            />
          </svg>
          <span className={honest ? 'text-accent-bright' : 'text-(--clay-500)'}>
            {shownB.toFixed(2)}
            {useOffset ? '/day' : '/record'}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-secondary">
        {honest
          ? 'With the exposure declared, their true daily rate shows: about a third of yours. Keep your monastery.'
          : 'Their ledger counts per record, not per day — the model is comparing λ·' +
            days +
            ' against λ·1 and calling it productivity.'}
      </p>
    </div>
  )
}
