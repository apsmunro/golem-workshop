import { useEffect, useMemo, useState } from 'react'
import { HOUSE_SEED, RNG } from '../../../lib/rng'
import { kde, percentileInterval } from '../../../lib/stats'
import { TREATMENT_LABELS, chimpCells, fitChimps, summarizeChimps } from './engine'
import type { ChimpCell, ChimpSummary } from './engine'

type Scale = 'logit' | 'prob'

const W = 620
const GRID_H = 240
const DENS_H = 150

interface FitState {
  summary: ChimpSummary
  cells: ChimpCell[]
}

export function ChimpExplorer() {
  const [state, setState] = useState<FitState | null>(null)
  const [scale, setScale] = useState<Scale>('logit')

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/datasets/chimpanzees.csv`)
      .then((r) => r.text())
      .then((csv) => {
        if (cancelled) return
        const cells = chimpCells(csv)
        const fit = fitChimps(cells)
        const draws = fit.draws(2000, new RNG(HOUSE_SEED, 11))
        setState({ summary: summarizeChimps(draws), cells })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const densities = useMemo(() => {
    if (!state) return null
    const source =
      scale === 'logit' ? state.summary.contrasts : state.summary.contrastsProb
    return source.map((c) => {
      const lo = Math.min(...c.draws)
      const hi = Math.max(...c.draws)
      return {
        name: c.name.split(' (')[0]!,
        pi: percentileInterval(c.draws, 0.89),
        density: kde(c.draws, { lo, hi, n: 96 }),
      }
    })
  }, [state, scale])

  if (!state || !densities) {
    return <p className="text-sm text-secondary">Watching 504 lever pulls…</p>
  }

  // density panel geometry
  const allX = densities.flatMap((d) => d.density.x)
  const allY = densities.flatMap((d) => d.density.y)
  const dLo = Math.min(...allX, 0)
  const dHi = Math.max(...allX, 0)
  const dMaxY = Math.max(...allY)
  const dx = (v: number) => 16 + ((v - dLo) / (dHi - dLo)) * (W - 32)
  const dy = (v: number) => 10 + (1 - v / dMaxY) * (DENS_H - 34)

  // actor grid geometry
  const colW = (W - 60) / 7
  const ax = (actor: number, t: number) =>
    48 + (actor - 1) * colW + ((t - 0.5) / 4) * (colW - 10) + 5
  const ay = (p: number) => 14 + (1 - p) * (GRID_H - 44)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Did a partner change the pull?</p>
        <div className="flex gap-2">
          {(['logit', 'prob'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
                scale === s
                  ? 'border-accent text-accent-bright'
                  : 'border-line text-secondary hover:border-accent'
              }`}
            >
              {s === 'logit' ? 'log-odds scale' : 'probability scale'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${DENS_H}`}
          className="w-full"
          role="img"
          aria-label="Posterior contrasts: the effect of adding a partner, on each prosocial side"
        >
          <line
            x1={dx(0)}
            x2={dx(0)}
            y1={8}
            y2={DENS_H - 24}
            stroke="var(--line)"
            strokeWidth="1"
          />
          {densities.map((d, i) => {
            const path = d.density.x
              .map(
                (v, k) =>
                  `${k === 0 ? 'M' : 'L'}${dx(v).toFixed(1)},${dy(d.density.y[k]!).toFixed(1)}`,
              )
              .join(' ')
            const fill = `${path} L${dx(d.density.x[d.density.x.length - 1]!).toFixed(1)},${dy(0).toFixed(1)} L${dx(d.density.x[0]!).toFixed(1)},${dy(0).toFixed(1)} Z`
            const stroke = i === 0 ? 'var(--brass-400)' : 'var(--brass-200)'
            return (
              <g key={d.name}>
                <path d={fill} fill={stroke} opacity="0.08" />
                <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
                <text
                  x={16}
                  y={20 + i * 14}
                  textAnchor="start"
                  fill={stroke}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {d.name}
                </text>
              </g>
            )
          })}
          <text
            x={W / 2}
            y={DENS_H - 8}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {scale === 'logit'
              ? 'partner effect, log-odds of pulling left'
              : 'partner effect, change in Pr(pull left), averaged over actors'}
          </text>
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        {densities
          .map(
            (d) =>
              `${d.name}: 89% PI [${d.pi[0].toFixed(2)}, ${d.pi[1].toFixed(2)}]`,
          )
          .join(' · ')}
      </p>

      <div className="mt-5 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${GRID_H}`}
          className="w-full"
          role="img"
          aria-label="Seven actors, four treatments: observed proportions and posterior means"
        >
          {[0, 0.5, 1].map((p) => (
            <g key={p}>
              <line
                x1={44}
                x2={W - 8}
                y1={ay(p)}
                y2={ay(p)}
                stroke="var(--line)"
                strokeWidth="1"
                opacity={p === 0.5 ? 0.8 : 0.4}
              />
              <text
                x={38}
                y={ay(p) + 3}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {p}
              </text>
            </g>
          ))}
          {Array.from({ length: 7 }, (_, i) => i + 1).map((actor) => (
            <g key={actor}>
              {actor > 1 ? (
                <line
                  x1={48 + (actor - 1) * colW - 2}
                  x2={48 + (actor - 1) * colW - 2}
                  y1={12}
                  y2={GRID_H - 30}
                  stroke="var(--line)"
                  strokeWidth="0.6"
                  opacity="0.5"
                />
              ) : null}
              <text
                x={48 + (actor - 0.5) * colW}
                y={GRID_H - 16}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {actor === 2 ? '2 ◆' : actor}
              </text>
              {state.summary.cells
                .filter((c) => c.actor === actor)
                .map((c) => {
                  const data = state.cells.find(
                    (d) => d.actor === actor && d.treatment === c.treatment,
                  )!
                  const x = ax(actor, c.treatment)
                  return (
                    <g key={c.treatment}>
                      <line
                        x1={x}
                        x2={x}
                        y1={ay(c.hi)}
                        y2={ay(c.lo)}
                        stroke="var(--stat-posterior)"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                      <circle cx={x} cy={ay(c.mean)} r="2.6" fill="var(--stat-posterior)" />
                      <circle
                        cx={x}
                        cy={ay(data.pulls / data.trials)}
                        r="3.4"
                        fill="none"
                        stroke="var(--stat-data)"
                        strokeWidth="1.2"
                      />
                    </g>
                  )
                })}
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-secondary">
        per actor, left to right: {TREATMENT_LABELS.join(' · ')} — bone rings are the
        data, brass points the posterior; actor 2 pulls left no matter what
      </p>
    </div>
  )
}
