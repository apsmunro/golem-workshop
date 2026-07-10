import { useMemo, useState } from 'react'
import {
  covMatrix,
  ellipseAxes,
  poolCafes,
  simulateCafes,
} from './engine'
import type { Vec2 } from './engine'

const W = 560
const H = 420
const PAD_L = 46
const PAD_R = 16
const PAD_T = 16
const PAD_B = 44
const X_RANGE = [1, 6] as const
const Y_RANGE = [-2.6, 0.7] as const
const MEAN: Vec2 = [3.5, -1]

function xOf(x: number): number {
  return PAD_L + ((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (W - PAD_L - PAD_R)
}
function yOf(y: number): number {
  return H - PAD_B - ((y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0])) * (H - PAD_T - PAD_B)
}

function ellipsePath(sigmaA: number, sigmaB: number, rho: number, nSd: number): string {
  const { angle, major, minor } = ellipseAxes(covMatrix(sigmaA, sigmaB, rho), nSd)
  const ux = Math.cos(angle)
  const uy = Math.sin(angle)
  const pts: string[] = []
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * 2 * Math.PI
    const px = MEAN[0] + major * Math.cos(t) * ux - minor * Math.sin(t) * uy
    const py = MEAN[1] + major * Math.cos(t) * uy + minor * Math.sin(t) * ux
    pts.push(`${i === 0 ? 'M' : 'L'}${xOf(px).toFixed(1)},${yOf(py).toFixed(1)}`)
  }
  return pts.join(' ') + ' Z'
}

export function CafeEllipse() {
  const [sigmaA, setSigmaA] = useState(1)
  const [sigmaB, setSigmaB] = useState(0.5)
  const [rho, setRho] = useState(-0.7)

  const cafes = useMemo(() => simulateCafes(20, 1959), [])
  const pooled = useMemo(
    () => poolCafes(cafes, MEAN, covMatrix(sigmaA, sigmaB, rho)),
    [cafes, sigmaA, sigmaB, rho],
  )

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Twenty cafés, two numbers each</p>
        <p className="font-mono text-xs text-secondary">
          ρ = {rho.toFixed(2)} · σ_morning = {sigmaA.toFixed(2)} · σ_afternoon = {sigmaB.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Café intercepts against slopes, with the adaptive prior ellipse and shrinkage of raw estimates toward it"
        >
          {/* axes */}
          {[1, 2, 3, 4, 5, 6].map((x) => (
            <text key={x} x={xOf(x)} y={H - PAD_B + 16} textAnchor="middle" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">
              {x}
            </text>
          ))}
          {[-2, -1, 0].map((y) => (
            <g key={y}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yOf(y)} y2={yOf(y)} stroke="var(--line)" strokeWidth="1" opacity="0.3" />
              <text x={PAD_L - 6} y={yOf(y) + 3} textAnchor="end" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">
                {y}
              </text>
            </g>
          ))}
          <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fill="var(--bone-300)" fontSize="10" fontFamily="var(--font-mono)">
            morning wait (intercept)
          </text>
          <text
            x={14}
            y={(PAD_T + H - PAD_B) / 2}
            textAnchor="middle"
            fill="var(--bone-300)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            transform={`rotate(-90 14 ${(PAD_T + H - PAD_B) / 2})`}
          >
            afternoon effect (slope)
          </text>

          {/* prior ellipse: the tilted 2-D adaptive prior */}
          <path d={ellipsePath(sigmaA, sigmaB, rho, 2)} fill="var(--verdigris-400)" opacity="0.06" stroke="var(--verdigris-400)" strokeWidth="1" strokeOpacity={0.4} />
          <path d={ellipsePath(sigmaA, sigmaB, rho, 1)} fill="var(--verdigris-400)" opacity="0.08" stroke="var(--verdigris-400)" strokeWidth="1.4" />

          {/* population mean */}
          <line x1={xOf(MEAN[0]) - 5} x2={xOf(MEAN[0]) + 5} y1={yOf(MEAN[1])} y2={yOf(MEAN[1])} stroke="var(--brass-200)" strokeWidth="1.4" />
          <line x1={xOf(MEAN[0])} x2={xOf(MEAN[0])} y1={yOf(MEAN[1]) - 5} y2={yOf(MEAN[1]) + 5} stroke="var(--brass-200)" strokeWidth="1.4" />

          {/* shrinkage segments raw → pooled */}
          {pooled.map((c) => (
            <line key={`seg-${c.id}`} x1={xOf(c.raw[0])} y1={yOf(c.raw[1])} x2={xOf(c.pooled[0])} y2={yOf(c.pooled[1])} stroke="var(--brass-400)" strokeWidth="1" opacity="0.4" />
          ))}
          {/* raw estimates */}
          {pooled.map((c) => (
            <circle key={`raw-${c.id}`} cx={xOf(c.raw[0])} cy={yOf(c.raw[1])} r={2.4} fill="none" stroke="var(--bone-100)" strokeWidth="1.1" opacity="0.7" />
          ))}
          {/* pooled estimates */}
          {pooled.map((c) => (
            <circle key={`pool-${c.id}`} cx={xOf(c.pooled[0])} cy={yOf(c.pooled[1])} r={2.6} fill="var(--stat-posterior)" />
          ))}
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        verdigris ellipse: the adaptive prior (1 & 2 sd) · open bone: raw café estimates · brass: partial pooling · brass cross: population mean
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">correlation ρ: {rho.toFixed(2)}</span>
          <input type="range" min={-0.95} max={0.95} step={0.01} value={rho} onChange={(e) => setRho(Number(e.target.value))} className="mt-1 w-full accent-(--verdigris-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">σ morning: {sigmaA.toFixed(2)}</span>
          <input type="range" min={0.15} max={2} step={0.05} value={sigmaA} onChange={(e) => setSigmaA(Number(e.target.value))} className="mt-1 w-full accent-(--verdigris-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">σ afternoon: {sigmaB.toFixed(2)}</span>
          <input type="range" min={0.1} max={1.5} step={0.05} value={sigmaB} onChange={(e) => setSigmaB(Number(e.target.value))} className="mt-1 w-full accent-(--verdigris-400)" />
        </label>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Set ρ negative and the ellipse tilts down: the model has learned that a
        café slow in the morning swings harder in the afternoon. Now the raw
        points shrink <em>along</em> that tilt — a café with only a high
        intercept gets its slope tugged downward too, because the correlation
        carries information sideways. Flatten ρ to zero and the pull becomes
        strictly vertical and horizontal, each coordinate pooled on its own. The
        covariance is the extra thing a varying-slopes model knows.
      </p>
    </div>
  )
}
