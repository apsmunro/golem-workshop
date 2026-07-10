import { useEffect, useMemo, useRef, useState } from 'react'
import { totalVariation } from '../../../lib/stats'
import {
  CATEGORIES,
  categoryProbs,
  clampCutpoint,
  cutpointsFromCounts,
  logisticPdf,
  meanResponse,
  pooledCounts,
  proportions,
} from './engine'
import type { TrolleyCell } from './engine'
import { useNarrow } from '../../../lib/use-narrow'

// Two compositions: the phone axis is taller with fatter drag handles so
// cutpoints stay grabbable at 390px, rather than the desktop drawing
// scaled to 55%.
const DESK = { W: 620, AXIS_H: 170, BAR_H: 150, HANDLE_R: 7 }
const PHONE = { W: 360, AXIS_H: 210, BAR_H: 170, HANDLE_R: 11 }
const X_LO = -4.5
const X_HI = 4.5

const CELL_LABELS: Record<string, string> = {
  '000': 'no action, no intention, no contact',
  '010': 'intention only',
  '001': 'contact, not intended',
  '011': 'intended contact',
  '100': 'action only',
  '110': 'intended action',
}

const START_CUTS = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]

export function CutpointDragger() {
  const narrow = useNarrow()
  const { W, AXIS_H, BAR_H, HANDLE_R } = narrow ? PHONE : DESK
  const [cells, setCells] = useState<TrolleyCell[] | null>(null)
  const [selection, setSelection] = useState<string>('all')
  const [cuts, setCuts] = useState<number[]>(START_CUTS)
  const [phi, setPhi] = useState(0)
  const dragIndex = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/datasets/trolley_counts.json`)
      .then((r) => r.json())
      .then((data: TrolleyCell[]) => {
        if (!cancelled) setCells(data)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const observed = useMemo(() => {
    if (!cells) return null
    const chosen =
      selection === 'all'
        ? cells
        : cells.filter((c) => `${c.action}${c.intention}${c.contact}` === selection)
    return proportions(pooledCounts(chosen))
  }, [cells, selection])

  if (!cells || !observed) {
    return <p className="text-sm text-secondary">Collecting 9,930 judgments…</p>
  }

  const implied = categoryProbs(cuts, phi)
  const score = 1 - totalVariation(implied, observed)

  const xOf = (v: number) => 16 + ((v - X_LO) / (X_HI - X_LO)) * (W - 32)
  const vOf = (px: number) => X_LO + ((px - 16) / (W - 32)) * (X_HI - X_LO)

  const densPath = Array.from({ length: 121 }, (_, i) => {
    const x = X_LO + (i / 120) * (X_HI - X_LO)
    const y = AXIS_H - 26 - logisticPdf(x - phi) * 4.4 * (AXIS_H - 50)
    return `${i === 0 ? 'M' : 'L'}${xOf(x).toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIndex.current === null || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = dragIndex.current
    setCuts((c) => {
      const next = [...c]
      next[i] = clampCutpoint(c, i, vOf(px))
      return next
    })
  }

  const nudge = (i: number, dir: number) => {
    setCuts((c) => {
      const next = [...c]
      next[i] = clampCutpoint(c, i, c[i]! + dir * 0.1)
      return next
    })
  }

  const reveal = () => {
    setPhi(0)
    setCuts(cutpointsFromCounts(pooledCounts(
      selection === 'all'
        ? cells
        : cells.filter((c) => `${c.action}${c.intention}${c.contact}` === selection),
    )))
  }

  const barW = (W - 60) / CATEGORIES

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Where do the knives fall?</p>
        <p className="font-mono text-xs text-secondary">
          match: <span className="text-accent-bright">{(score * 100).toFixed(1)}%</span>
          {' · '}mean response {meanResponse(implied).toFixed(2)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelection('all')}
          className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
            selection === 'all'
              ? 'border-accent text-accent-bright'
              : 'border-line text-secondary hover:border-accent'
          }`}
        >
          all stories
        </button>
        {cells.map((c) => {
          const key = `${c.action}${c.intention}${c.contact}`
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelection(key)}
              className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
                selection === key
                  ? 'border-accent text-accent-bright'
                  : 'border-line text-secondary hover:border-accent'
              }`}
            >
              {CELL_LABELS[key]}
            </button>
          )
        })}
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${AXIS_H}`}
          className="w-full touch-none select-none"
          role="img"
          aria-label="Latent logistic axis with six draggable cutpoints"
          onPointerMove={onPointerMove}
          onPointerUp={() => {
            dragIndex.current = null
          }}
          onPointerLeave={() => {
            dragIndex.current = null
          }}
        >
          <path d={densPath} fill="none" stroke="var(--bone-300)" strokeWidth="1.2" opacity="0.55" />
          <line
            x1={16}
            x2={W - 16}
            y1={AXIS_H - 26}
            y2={AXIS_H - 26}
            stroke="var(--line)"
            strokeWidth="1"
          />
          {cuts.map((k, i) => (
            <g key={i}>
              <line
                x1={xOf(k)}
                x2={xOf(k)}
                y1={16}
                y2={AXIS_H - 26}
                stroke="var(--brass-400)"
                strokeWidth="1.5"
              />
              <circle
                cx={xOf(k)}
                cy={16}
                r={HANDLE_R}
                fill="var(--ink-800)"
                stroke="var(--brass-400)"
                strokeWidth="1.5"
                className="cursor-ew-resize focus:outline-none focus-visible:stroke-(--brass-200)"
                tabIndex={0}
                role="slider"
                aria-label={`cutpoint ${i + 1}`}
                aria-valuenow={Number(k.toFixed(2))}
                aria-valuemin={-6}
                aria-valuemax={6}
                onPointerDown={(e) => {
                  dragIndex.current = i
                  ;(e.target as Element).setPointerCapture?.(e.pointerId)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') nudge(i, -1)
                  if (e.key === 'ArrowRight') nudge(i, 1)
                }}
              />
              <text
                x={xOf(k)}
                y={AXIS_H - 10}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                κ{i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${BAR_H}`}
          className="w-full"
          role="img"
          aria-label="Implied category probabilities against the observed response proportions"
        >
          {implied.map((p, k) => {
            const x = 34 + k * barW
            const obs = observed[k]!
            const yTop = (v: number) => 12 + (1 - v / 0.45) * (BAR_H - 46)
            return (
              <g key={k}>
                <rect
                  x={x + 6}
                  y={yTop(p)}
                  width={barW - 22}
                  height={BAR_H - 34 - yTop(p)}
                  fill="var(--stat-posterior)"
                  opacity="0.28"
                  stroke="var(--stat-posterior)"
                  strokeWidth="1.2"
                />
                <line
                  x1={x + 2}
                  x2={x + barW - 12}
                  y1={yTop(obs)}
                  y2={yTop(obs)}
                  stroke="var(--stat-data)"
                  strokeWidth="1.6"
                />
                <text
                  x={x + (barW - 10) / 2}
                  y={BAR_H - 20}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {k + 1}
                </text>
              </g>
            )
          })}
          <text
            x={W / 2}
            y={BAR_H - 5}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            response — brass: your cutpoints imply · bone dash: the data
          </text>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          shift φ (the linear predictor)
          <input
            type="range"
            min={-2}
            max={2}
            step={0.05}
            value={phi}
            onChange={(e) => setPhi(Number(e.target.value))}
            className="w-44 accent-(--brass-400)"
          />
          <span className="font-mono text-xs">{phi.toFixed(2)}</span>
        </label>
        <button
          type="button"
          onClick={reveal}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          Reveal the fitted cutpoints
        </button>
        <button
          type="button"
          onClick={() => {
            setCuts(START_CUTS)
            setPhi(0)
          }}
          className="cursor-pointer rounded-card border border-line px-4 py-1.5 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
