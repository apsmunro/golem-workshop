import { useMemo, useState } from 'react'
import { RNG } from '../../../lib/rng'
import {
  adjustmentSets,
  allPaths,
  pathBlocked,
} from './engine'
import type { DagPath } from './engine'
import { presets } from './presets'
import { biasDemo } from './sim'
import type { BiasReadout } from './sim'

const W = 620
const H = 380
const R = 17

function pathLabel(path: DagPath): string {
  let out = path.nodes[0]!
  for (let i = 1; i < path.nodes.length; i++) {
    out += path.intoNode[i - 1] ? ' → ' : ' ← '
    out += path.nodes[i]!
  }
  return out
}

function isDirectedCausal(path: DagPath): boolean {
  return path.intoNode.every(Boolean)
}

export function DagSandbox() {
  const [presetId, setPresetId] = useState('waffles')
  const [conditioned, setConditioned] = useState<Set<string>>(new Set())
  const [readout, setReadout] = useState<BiasReadout | null>(null)
  const [simSeed, setSimSeed] = useState(1959)

  const preset = presets.find((p) => p.id === presetId)!
  const { dag, exposure, outcome } = preset
  const unobserved = new Set(dag.unobserved ?? [])

  const paths = useMemo(() => allPaths(dag, exposure, outcome), [dag, exposure, outcome])
  const sets = useMemo(() => adjustmentSets(dag, exposure, outcome), [dag, exposure, outcome])

  const pick = (id: string) => {
    setPresetId(id)
    setConditioned(new Set())
    setReadout(null)
  }

  const toggle = (node: string) => {
    if (node === exposure || node === outcome || unobserved.has(node)) return
    setConditioned((prev) => {
      const next = new Set(prev)
      if (next.has(node)) next.delete(node)
      else next.add(node)
      return next
    })
    setReadout(null)
  }

  const simulate = () => {
    const r = biasDemo(dag, exposure, outcome, conditioned, 5000, new RNG(simSeed), preset.coefs)
    setReadout(r)
    setSimSeed(simSeed + 1)
  }

  const pos = (n: string) => {
    const [x, y] = preset.layout[n] ?? [0.5, 0.5]
    return { x: 60 + x * (W - 120), y: 40 + y * (H - 80) }
  }

  return (
    <div>
      {/* presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p.id)}
            aria-pressed={p.id === presetId}
            className={`cursor-pointer rounded-card border px-3 py-1.5 text-sm transition-colors duration-[180ms] ${
              p.id === presetId
                ? 'border-accent bg-surface text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-3 max-w-[62ch] text-sm text-secondary">{preset.blurb}</p>

      {/* graph */}
      <div className="mt-5 rounded-card border border-line bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`DAG: ${preset.name}`}>
          <defs>
            <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0.5 L7,4 L0,7.5 Z" fill="var(--bone-300)" />
            </marker>
          </defs>
          {dag.edges.map(([from, to]) => {
            const a = pos(from)
            const b = pos(to)
            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.hypot(dx, dy)
            const pad = R + 6
            const x1 = a.x + (dx / len) * pad
            const y1 = a.y + (dy / len) * pad
            const x2 = b.x - (dx / len) * pad
            const y2 = b.y - (dy / len) * pad
            return (
              <line
                key={`${from}-${to}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--bone-300)"
                strokeWidth="1.2"
                markerEnd="url(#arrow)"
                opacity="0.8"
              />
            )
          })}
          {dag.nodes.map((n) => {
            const p = pos(n)
            const isCond = conditioned.has(n)
            const role =
              n === exposure ? 'exposure' : n === outcome ? 'outcome' : null
            const clickable = !role && !unobserved.has(n)
            return (
              <g
                key={n}
                onClick={() => toggle(n)}
                className={clickable ? 'cursor-pointer' : undefined}
                role={clickable ? 'button' : undefined}
                aria-label={
                  clickable
                    ? `${isCond ? 'Stop conditioning' : 'Condition'} on ${n}`
                    : n
                }
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={R}
                  fill={isCond ? 'var(--brass-400)' : 'var(--ink-950)'}
                  stroke={unobserved.has(n) ? 'var(--line)' : 'var(--bone-300)'}
                  strokeWidth="1.5"
                  strokeDasharray={unobserved.has(n) ? '3 3' : undefined}
                  className="transition-colors duration-[180ms]"
                />
                <text
                  x={p.x}
                  y={p.y + 4.5}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="13"
                  fill={isCond ? 'var(--ink-950)' : 'var(--bone-100)'}
                >
                  {n}
                </text>
                {role ? (
                  <text
                    x={p.x}
                    y={p.y + R + 14}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--bone-300)"
                  >
                    {role}
                  </text>
                ) : null}
                {unobserved.has(n) ? (
                  <text
                    x={p.x}
                    y={p.y + R + 14}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--bone-300)"
                  >
                    unobserved
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-secondary">
        Click a node to condition on it. Brass fill = in the conditioning set.
      </p>

      {/* paths */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow border-b border-line pb-2">
            Paths {exposure} to {outcome}
          </h3>
          <ul className="mt-3 space-y-2">
            {paths.map((p) => {
              const blocked = pathBlocked(dag, p, conditioned)
              const causal = isDirectedCausal(p)
              const tone = causal
                ? blocked
                  ? 'text-stat-danger'
                  : 'text-accent-bright'
                : blocked
                  ? 'text-secondary'
                  : 'text-stat-danger'
              const status = causal
                ? blocked
                  ? 'causal path — blocked!'
                  : 'causal path, open'
                : blocked
                  ? 'back door, closed'
                  : 'back door, OPEN'
              return (
                <li key={p.nodes.join()} className="flex items-baseline justify-between gap-3 font-mono text-sm">
                  <span>{pathLabel(p)}</span>
                  <span className={`shrink-0 text-xs ${tone}`}>{status}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-sm text-secondary">
            {sets.length === 0
              ? 'No observed set closes every back door. This effect is out of reach.'
              : sets[0]!.length === 0
                ? 'No adjustment needed: the back doors are already closed.'
                : `Close the back doors with ${sets
                    .map((s) => `{${s.join(', ')}}`)
                    .join(' or ')}.`}
          </p>
        </div>

        {/* simulation */}
        <div>
          <h3 className="eyebrow border-b border-line pb-2">The estimate</h3>
          <p className="mt-3 text-sm text-secondary">
            5,000 simulated worlds from this exact graph. The regression{' '}
            <span className="font-mono text-xs">
              {outcome} ~ {[exposure, ...conditioned].join(' + ')}
            </span>{' '}
            estimates the {exposure} coefficient; truth is{' '}
            {preset.coefs?.[`${exposure}->${outcome}`] ??
              (dag.edges.some(([f, t]) => f === exposure && t === outcome) ? 1 : 0)}
            .
          </p>
          <button
            type="button"
            onClick={simulate}
            className="mt-4 cursor-pointer rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
          >
            Simulate 5,000 worlds
          </button>
          {readout ? (
            <div className="mt-5">
              {(() => {
                const lo = -1.6
                const hi = 1.6
                const x = (v: number) =>
                  `${(100 * (Math.min(Math.max(v, lo), hi) - lo)) / (hi - lo)}%`
                const biased = Math.abs(readout.adjusted - readout.truth) > 0.1
                return (
                  <div>
                    <div className="relative h-10 border-b border-line">
                      <span
                        className="absolute top-0 h-full w-[1.5px] bg-bone-300 opacity-60"
                        style={{ left: x(readout.truth) }}
                        title={`truth ${readout.truth}`}
                      />
                      <span
                        className="absolute top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-control bg-stat-danger"
                        style={{ left: x(readout.unadjusted) }}
                        title={`unadjusted ${readout.unadjusted.toFixed(2)}`}
                      />
                      <span
                        className={`absolute top-6 h-2.5 w-2.5 -translate-x-1/2 rounded-control ${biased ? 'bg-stat-danger' : 'bg-stat-posterior'}`}
                        style={{ left: x(readout.adjusted) }}
                        title={`adjusted ${readout.adjusted.toFixed(2)}`}
                      />
                    </div>
                    <div className="mt-3 space-y-1 font-mono text-xs">
                      <p className="text-secondary">
                        truth <span className="text-primary">{readout.truth.toFixed(2)}</span>
                      </p>
                      <p className="text-stat-danger">
                        no controls: {readout.unadjusted.toFixed(2)}
                      </p>
                      <p className={biased ? 'text-stat-danger' : 'text-accent-bright'}>
                        with {conditioned.size > 0 ? `{${[...conditioned].join(', ')}}` : 'no controls'}:{' '}
                        {readout.adjusted.toFixed(2)}
                        {biased ? ' — still fooled' : ' — honest'}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
