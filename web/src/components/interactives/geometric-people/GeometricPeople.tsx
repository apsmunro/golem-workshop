import { useMemo, useState } from 'react'
import { fitConstant, linearRmse, predictWeight, scaleOf } from './engine'
import type { HW } from './engine'

const W = 600
const H = 400
const PAD_L = 44
const PAD_R = 14
const PAD_T = 16
const PAD_B = 44
const X_RANGE = [50, 180] as const
const Y_RANGE = [0, 65] as const

function xOf(x: number): number {
  return PAD_L + ((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (W - PAD_L - PAD_R)
}
function yOf(y: number): number {
  return H - PAD_B - ((y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0])) * (H - PAD_T - PAD_B)
}

export function GeometricPeople({ rows }: { rows: HW[] }) {
  const [b, setB] = useState(3)
  const [showLine, setShowLine] = useState(false)

  const scale = useMemo(() => scaleOf(rows), [rows])
  const { c, rmse } = useMemo(() => fitConstant(rows, b, scale), [rows, b, scale])
  const lineRmse = useMemo(() => linearRmse(rows), [rows])

  const curve = useMemo(() => {
    const pts: string[] = []
    for (let h = X_RANGE[0]; h <= X_RANGE[1]; h += 2) {
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${xOf(h).toFixed(1)},${yOf(predictWeight(h, b, c, scale)).toFixed(1)}`)
    }
    return pts.join(' ')
  }, [b, c, scale])

  // straight line for comparison
  const straight = useMemo(() => {
    const n = rows.length
    const mh = rows.reduce((s, r) => s + r.height, 0) / n
    const mw = rows.reduce((s, r) => s + r.weight, 0) / n
    let sxx = 0
    let sxy = 0
    for (const r of rows) {
      sxx += (r.height - mh) * (r.height - mh)
      sxy += (r.height - mh) * (r.weight - mw)
    }
    const slope = sxy / sxx
    const inter = mw - slope * mh
    return { inter, slope }
  }, [rows])

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">One geometric law, infants to adults</p>
        <p className="font-mono text-xs text-secondary">
          exponent {b.toFixed(2)} · RMSE {rmse.toFixed(2)} kg · line {lineRmse.toFixed(2)} kg
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Weight against height for the Howell census, fit by a power law of height">
          {[60, 90, 120, 150, 180].map((g) => (
            <g key={g}>
              <line x1={xOf(g)} x2={xOf(g)} y1={PAD_T} y2={H - PAD_B} stroke="var(--line)" strokeWidth="1" opacity="0.2" />
              <text x={xOf(g)} y={H - PAD_B + 16} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
            </g>
          ))}
          {[0, 20, 40, 60].map((g) => (
            <g key={g}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yOf(g)} y2={yOf(g)} stroke="var(--line)" strokeWidth="1" opacity="0.2" />
              <text x={PAD_L - 6} y={yOf(g) + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
            </g>
          ))}
          <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">height (cm)</text>
          <text x={14} y={(PAD_T + H - PAD_B) / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)" transform={`rotate(-90 14 ${(PAD_T + H - PAD_B) / 2})`}>weight (kg)</text>

          {rows.map((r, i) => (
            <circle key={i} cx={xOf(r.height)} cy={yOf(r.weight)} r={1.7} fill="var(--stat-data)" opacity="0.5" />
          ))}

          {showLine ? (
            <line x1={xOf(X_RANGE[0])} y1={yOf(straight.inter + straight.slope * X_RANGE[0])} x2={xOf(X_RANGE[1])} y2={yOf(straight.inter + straight.slope * X_RANGE[1])} stroke="var(--bone-300)" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.6" />
          ) : null}

          <path d={curve} fill="none" stroke="var(--stat-posterior)" strokeWidth="2" />
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        brass curve: weight = W̄·c·(height/H̄)^b · {showLine ? 'bone dash: ordinary straight line' : 'bone points: !Kung census, all ages'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          exponent b
          <input type="range" min={1} max={4} step={0.05} value={b} onChange={(e) => setB(Number(e.target.value))} className="w-48 accent-(--brass-400)" />
          <span className="font-mono text-xs">{b.toFixed(2)}</span>
        </label>
        <button
          type="button"
          onClick={() => setB(3)}
          className="cursor-pointer text-sm text-secondary underline decoration-dotted underline-offset-4 hover:text-accent-bright"
        >
          theory says 3
        </button>
        <button
          type="button"
          onClick={() => setShowLine((v) => !v)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          {showLine ? 'Hide the straight line' : 'Compare a straight line'}
        </button>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Slide the exponent toward 1 and the curve straightens, missing the
        infants at the bottom and the tallest adults at the top at the same
        time — the error climbs. Slide it back to 3, the value geometry
        demands, and one constant carries the model across the entire growth
        range. The scientific model did not learn its shape from the data; it
        brought the shape and let the data set a single scale.
      </p>
    </div>
  )
}
