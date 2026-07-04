import { useMemo, useState } from 'react'
import { RNG } from '../../../lib/rng'
import {
  HEIGHT_SPEC,
  absurdCount,
  drawPriorLines,
} from './engine'
import type { PriorConfig, SlopePriorKind } from './engine'

const W = 640
const H = 380
const N_LINES = 60
const Y_LO = -80
const Y_HI = 340

export function PriorPlayground() {
  const [aMu, setAMu] = useState(178)
  const [aSd, setASd] = useState(20)
  const [bKind, setBKind] = useState<SlopePriorKind>('normal')
  const [bSd, setBSd] = useState(10)
  const [seed, setSeed] = useState(1959)

  const config: PriorConfig = { aMu, aSd, bKind, bSd }
  const lines = useMemo(
    () => drawPriorLines(HEIGHT_SPEC, config, N_LINES, new RNG(seed)),
    [aMu, aSd, bKind, bSd, seed],
  )
  const absurd = absurdCount(lines)

  const [xLo, xHi] = HEIGHT_SPEC.xRange
  const px = (x: number) => ((x - xLo) / (xHi - xLo)) * (W - 70) + 55
  const py = (y: number) => H - 30 - ((y - Y_LO) / (Y_HI - Y_LO)) * (H - 50)

  return (
    <div>
      {/* controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="font-mono text-xs text-secondary">
            α ~ Normal({aMu}, {aSd}) · mean
          </span>
          <input
            type="range"
            min={100}
            max={250}
            value={aMu}
            onChange={(e) => setAMu(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs text-secondary">α sd: {aSd}</span>
          <input
            type="range"
            min={1}
            max={60}
            value={aSd}
            onChange={(e) => setASd(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs text-secondary">
            β prior family
          </span>
          <span className="mt-1 flex rounded-card border border-line">
            {(['normal', 'lognormal'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setBKind(k)}
                aria-pressed={bKind === k}
                className={`grow cursor-pointer px-2 py-1 text-xs transition-colors duration-[180ms] ${
                  bKind === k ? 'bg-surface text-accent-bright' : 'text-secondary'
                }`}
              >
                {k === 'normal' ? 'Normal(0, s)' : 'LogNormal(0, s)'}
              </button>
            ))}
          </span>
        </label>
        <label className="block">
          <span className="font-mono text-xs text-secondary">β scale s: {bSd}</span>
          <input
            type="range"
            min={0.1}
            max={12}
            step={0.1}
            value={bSd}
            onChange={(e) => setBSd(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
      </div>

      {/* plot */}
      <div className="mt-5 rounded-card border border-line bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prior predictive lines over red zones">
          {/* red zones */}
          {HEIGHT_SPEC.redZones.map((z) => {
            const yTop = z.above !== undefined ? py(Y_HI) : py(z.below!)
            const yBottom = z.above !== undefined ? py(z.above) : py(Y_LO)
            return (
              <g key={z.label}>
                <rect
                  x={px(xLo)}
                  y={Math.min(yTop, yBottom)}
                  width={px(xHi) - px(xLo)}
                  height={Math.abs(yBottom - yTop)}
                  fill="var(--stat-danger)"
                  opacity="0.08"
                />
                <line
                  x1={px(xLo)}
                  x2={px(xHi)}
                  y1={z.above !== undefined ? py(z.above) : py(z.below!)}
                  y2={z.above !== undefined ? py(z.above) : py(z.below!)}
                  stroke="var(--stat-danger)"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <text
                  x={px(xLo) + 6}
                  y={(z.above !== undefined ? py(z.above) : py(z.below!)) + (z.above !== undefined ? -6 : 14)}
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--stat-danger)"
                >
                  {z.label}
                </text>
              </g>
            )
          })}
          {/* prior lines */}
          {lines.map((l, i) => {
            const bad = l.violations.length > 0
            return (
              <line
                key={i}
                x1={px(xLo)}
                y1={py(l.a + l.b * (xLo - HEIGHT_SPEC.xbar))}
                x2={px(xHi)}
                y2={py(l.a + l.b * (xHi - HEIGHT_SPEC.xbar))}
                stroke={bad ? 'var(--stat-danger)' : 'var(--stat-prior)'}
                strokeWidth="1"
                opacity={bad ? 0.55 : 0.5}
              />
            )
          })}
          {/* axes */}
          <line x1={px(xLo)} x2={px(xHi)} y1={py(Y_LO)} y2={py(Y_LO)} stroke="var(--line)" strokeWidth="1" />
          <text x={px((xLo + xHi) / 2)} y={H - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)">
            weight (kg)
          </text>
          <text x={16} y={py(130)} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)" transform={`rotate(-90 16 ${py(130)})`}>
            height (cm)
          </text>
        </svg>
      </div>

      {/* readout */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setSeed(seed + 1)}
          className="cursor-pointer rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
        >
          Draw {N_LINES} fresh golems
        </button>
        <p className={`font-mono text-sm ${absurd > N_LINES * 0.2 ? 'text-stat-danger' : 'text-secondary'}`}>
          {absurd} of {N_LINES} predict impossible people
        </p>
      </div>
    </div>
  )
}
