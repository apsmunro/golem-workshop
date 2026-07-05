import { useMemo, useState } from 'react'
import { runCentered, runNonCentered } from './engine'

const W = 360
const H = 320
const PAD = 8
const X_RANGE = [-8, 8] as const
const V_RANGE = [-7, 5] as const
const N = 700

function xOf(x: number): number {
  return PAD + ((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (W - 2 * PAD)
}
function yOf(v: number): number {
  return H - PAD - ((v - V_RANGE[0]) / (V_RANGE[1] - V_RANGE[0])) * (H - 2 * PAD)
}

/** ±k·exp(v/2) envelope of the funnel, as an engraved guide curve. */
function envelope(k: number, sign: 1 | -1): string {
  const pts: string[] = []
  for (let v = V_RANGE[0]; v <= V_RANGE[1] + 1e-9; v += 0.15) {
    const x = sign * k * Math.exp(v / 2)
    if (x < X_RANGE[0] || x > X_RANGE[1]) continue
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${xOf(x).toFixed(1)},${yOf(v).toFixed(1)}`)
  }
  return pts.join(' ')
}

function FunnelPanel({
  title,
  run,
  accent,
}: {
  title: string
  run: ReturnType<typeof runCentered>
  accent: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{title}</p>
        <p className="font-mono text-xs" style={{ color: run.divergences > 0 ? 'var(--clay-300)' : accent }}>
          {run.divergences} divergences
        </p>
      </div>
      <div className="mt-2 rounded-card border border-line bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}: funnel samples`}>
          {/* funnel envelopes */}
          {[1, 2].map((k) => (
            <g key={k}>
              <path d={envelope(k, 1)} fill="none" stroke="var(--brass-400)" strokeWidth="1" opacity={0.35 / k} />
              <path d={envelope(k, -1)} fill="none" stroke="var(--brass-400)" strokeWidth="1" opacity={0.35 / k} />
            </g>
          ))}
          {/* neck line at v where the trouble lives */}
          <line
            x1={PAD}
            x2={W - PAD}
            y1={yOf(-3)}
            y2={yOf(-3)}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          <text x={W - PAD} y={yOf(-3) - 4} textAnchor="end" fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">
            the neck
          </text>

          {/* accepted samples */}
          {run.samples.map((s, i) =>
            s.divergent ? null : (
              <circle key={i} cx={xOf(s.q[0])} cy={yOf(s.q[1])} r={1.3} fill="var(--stat-data)" opacity="0.5" />
            ),
          )}
          {/* divergences: clay crosses at the launch point */}
          {run.samples.map((s, i) =>
            s.divergent ? (
              <g key={`d-${i}`} stroke="var(--stat-danger)" strokeWidth="1.2">
                <line x1={xOf(s.q[0]) - 2.6} y1={yOf(s.q[1]) - 2.6} x2={xOf(s.q[0]) + 2.6} y2={yOf(s.q[1]) + 2.6} />
                <line x1={xOf(s.q[0]) - 2.6} y1={yOf(s.q[1]) + 2.6} x2={xOf(s.q[0]) + 2.6} y2={yOf(s.q[1]) - 2.6} />
              </g>
            ) : null,
          )}

          <text x={PAD + 2} y={H - PAD - 2} fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">
            x (the parameter)
          </text>
          <text
            x={PAD + 8}
            y={PAD + 40}
            fill="var(--text-secondary)"
            fontSize="8"
            fontFamily="var(--font-mono)"
            transform={`rotate(-90 ${PAD + 8} ${PAD + 40})`}
          >
            v (log variance)
          </text>
        </svg>
      </div>
      <p className="mt-1 font-mono text-xs text-secondary">
        deepest v reached: {Number.isFinite(run.minV) ? run.minV.toFixed(1) : '—'}
      </p>
    </div>
  )
}

export function DivergenceDetective() {
  const [eps, setEps] = useState(0.9)
  const [seed, setSeed] = useState(1959)

  const centered = useMemo(() => runCentered(eps, 12, N, seed), [eps, seed])
  const nonCentered = useMemo(() => runNonCentered(eps, 12, N, seed), [eps, seed])

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">The same funnel, parameterized two ways</p>
        <p className="font-mono text-xs text-secondary">
          centered {centered.divergences} · non-centered {nonCentered.divergences} divergences
        </p>
      </div>

      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <FunnelPanel title="Centered · α ~ Normal(ᾱ, σ)" run={centered} accent="var(--brass-400)" />
        <FunnelPanel title="Non-centered · α = ᾱ + σz" run={nonCentered} accent="var(--verdigris-400)" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          step size ε
          <input
            type="range"
            min={0.1}
            max={1.6}
            step={0.02}
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
            className="w-48 accent-(--brass-400)"
          />
          <span className="font-mono text-xs">{eps.toFixed(2)}</span>
        </label>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          Resample
        </button>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Both panels sample the identical funnel. On the left the sampler works
        in the natural coordinates and chokes in the neck — the clay crosses are
        divergences, and they pile up exactly where v is small and the geometry
        pinches. Raise ε and they multiply; the chain never gets far down. On
        the right the same model is written as α = ᾱ + σz with z standard
        normal: HMC now walks a round bowl, the divergences vanish, and the neck
        fills in. Nothing about the model changed. Only the coordinates did.
      </p>
    </div>
  )
}
