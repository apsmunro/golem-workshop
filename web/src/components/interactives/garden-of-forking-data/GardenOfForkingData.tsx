import { useMemo, useState } from 'react'
import {
  BAG_SIZE,
  ROUND_MAX_OBSERVATIONS,
  TREE_MAX_OBSERVATIONS,
  buildTree,
  conjectureCompositions,
  plausibilities,
} from './engine'
import type { Mark, Mode } from './engine'

const LABELS: Record<Mode, { marked: string; unmarked: string; thing: string }> = {
  marbles: { marked: 'blue', unmarked: 'white', thing: 'marble' },
  globe: { marked: 'water', unmarked: 'land', thing: 'face' },
}

function MarbleDot({ marked, size = 10 }: { marked: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <circle
        cx="5"
        cy="5"
        r="4"
        fill={marked ? 'var(--stat-data)' : 'none'}
        stroke="var(--stat-data)"
        strokeWidth="1"
      />
    </svg>
  )
}

interface FanProps {
  composition: number
  observed: readonly Mark[]
}

/** The radial garden: ring d holds every path of length d. */
function Fan({ composition, observed }: FanProps) {
  const rings = useMemo(
    () => buildTree(composition, BAG_SIZE, observed.slice(0, TREE_MAX_OBSERVATIONS)),
    [composition, observed],
  )
  const W = 640
  const H = 344
  const cx = W / 2
  const cy = H - 12
  const radii = [96, 188, 278]
  const start = Math.PI * 0.94
  const span = Math.PI * 0.88

  const pos = (level: number, index: number, count: number) => {
    const angle = start - ((index + 0.5) / count) * span
    const r = radii[level]!
    return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Garden of forking data: ${observed.length} observation(s), ${composition} of ${BAG_SIZE} marked`}
    >
      <circle cx={cx} cy={cy} r={3.5} fill="var(--accent)" />
      {rings.map((ring, li) =>
        ring.map((node) => {
          const p = pos(li, node.index, ring.length)
          const parent =
            li === 0
              ? { x: cx, y: cy }
              : pos(li - 1, Math.floor(node.index / BAG_SIZE), rings[li - 1]!.length)
          const dotR = [4, 2.8, 2][li] ?? 2
          return (
            <g
              key={`${li}-${node.index}`}
              className="transition-opacity duration-[180ms] ease-out"
              opacity={node.alive ? 1 : 0.18}
            >
              <line
                x1={parent.x}
                y1={parent.y}
                x2={p.x}
                y2={p.y}
                stroke={node.alive ? 'var(--stat-data)' : 'var(--line)'}
                strokeWidth={node.alive ? 1 : 0.75}
                opacity={node.alive ? 0.55 : 1}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={dotR}
                fill={node.marked ? 'var(--stat-data)' : 'var(--ink-950)'}
                stroke="var(--stat-data)"
                strokeWidth={0.9}
              />
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function GardenOfForkingData() {
  const [mode, setMode] = useState<Mode>('marbles')
  const [composition, setComposition] = useState(2)
  const [observed, setObserved] = useState<Mark[]>([])
  const [priorCounts, setPriorCounts] = useState<number[]>([1, 1, 1, 1, 1])
  const [round, setRound] = useState(1)

  const labels = LABELS[mode]
  const { counts, posterior } = plausibilities(priorCounts, observed, BAG_SIZE)
  const priorTotal = priorCounts.reduce((a, b) => a + b, 0)
  const treeTruncated = observed.length > TREE_MAX_OBSERVATIONS

  const draw = (d: Mark) => {
    setObserved((prev) =>
      prev.length < ROUND_MAX_OBSERVATIONS ? [...prev, d] : prev,
    )
  }
  const reset = () => {
    setObserved([])
    setPriorCounts([1, 1, 1, 1, 1])
    setRound(1)
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    reset()
  }
  const updateAgain = () => {
    setPriorCounts(counts)
    setObserved([])
    setRound(round + 1)
  }

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-card border border-line" role="group" aria-label="Mode">
          {(['marbles', 'globe'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={`cursor-pointer px-4 py-1.5 text-sm capitalize transition-colors duration-[180ms] ${
                mode === m ? 'bg-surface text-accent-bright' : 'text-secondary'
              }`}
            >
              {m === 'marbles' ? 'Marbles' : 'Globe'}
            </button>
          ))}
        </div>
        <span className="eyebrow">
          Round {round}
          {round > 1 ? ' · prior carried forward' : ''}
        </span>
      </div>

      {/* conjecture strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {conjectureCompositions(BAG_SIZE).map((c, i) => {
          const selected = composition === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setComposition(c)}
              aria-pressed={selected}
              className={`cursor-pointer rounded-card border p-3 text-left transition-colors duration-[180ms] ${
                selected ? 'border-accent bg-surface' : 'border-line hover:border-accent'
              }`}
            >
              <span className="flex gap-1.5">
                {Array.from({ length: BAG_SIZE }, (_, m) => (
                  <MarbleDot key={m} marked={m < c} />
                ))}
              </span>
              <span className="mt-2 block font-mono text-xs text-secondary">
                {counts[i]} path{counts[i] === 1 ? '' : 's'}
              </span>
              <span className="relative mt-1.5 block h-1.5 w-full overflow-hidden rounded-card bg-ink-800">
                <span
                  className="absolute inset-y-0 left-0 bg-stat-posterior transition-[width] duration-[180ms] ease-out"
                  style={{ width: `${(posterior[i] ?? 0) * 100}%` }}
                />
                {round > 1 && priorTotal > 0 ? (
                  <span
                    className="absolute inset-y-0 w-[1.5px] bg-stat-prior"
                    style={{ left: `${((priorCounts[i] ?? 0) / priorTotal) * 100}%` }}
                  />
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {/* garden */}
      <div className="mt-6 rounded-card border border-line bg-ink-950 p-4">
        {treeTruncated ? (
          <p className="py-16 text-center text-sm text-secondary">
            {Math.pow(BAG_SIZE, observed.length).toLocaleString()} paths — the
            garden is too dense to draw. The counting continues; that is the
            point.
          </p>
        ) : observed.length === 0 ? (
          <p className="py-16 text-center text-sm text-secondary">
            Draw a {labels.thing} to plant the garden.
          </p>
        ) : (
          <Fan composition={composition} observed={observed} />
        )}
      </div>

      {/* data controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => draw(1)}
          disabled={observed.length >= ROUND_MAX_OBSERVATIONS}
          className="flex cursor-pointer items-center gap-2 rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MarbleDot marked size={12} /> Draw {labels.marked}
        </button>
        <button
          type="button"
          onClick={() => draw(0)}
          disabled={observed.length >= ROUND_MAX_OBSERVATIONS}
          className="flex cursor-pointer items-center gap-2 rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MarbleDot marked={false} size={12} /> Draw {labels.unmarked}
        </button>
        <button
          type="button"
          onClick={() => setObserved((prev) => prev.slice(0, -1))}
          disabled={observed.length === 0}
          className="cursor-pointer rounded-card border border-line px-4 py-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={updateAgain}
          disabled={observed.length === 0}
          className="cursor-pointer rounded-card border border-line px-4 py-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Update again
        </button>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-card border border-line px-4 py-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent"
        >
          Start over
        </button>
      </div>

      {/* observed sequence */}
      {observed.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-secondary">
          Observed:
          {observed.map((d, i) => (
            <MarbleDot key={i} marked={d === 1} size={12} />
          ))}
          <span className="font-mono text-xs">
            ({observed.map((d) => (d === 1 ? labels.marked[0]!.toUpperCase() : labels.unmarked[0]!.toUpperCase())).join(' ')})
          </span>
        </p>
      ) : null}
    </div>
  )
}
