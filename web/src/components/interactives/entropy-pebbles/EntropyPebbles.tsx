import { useState } from 'react'
import {
  BUCKETS,
  POUCH,
  PRESETS,
  entropy,
  logMultiplicity,
  maxentWithMean,
  meanValue,
  normalize,
} from './engine'

const VALUES = [1, 2, 3, 4, 5]

const W = 620
const H = 232
const FLOOR = H - 26
const BUCKET_W = 92
const GAP = (W - 48 - BUCKETS * BUCKET_W) / (BUCKETS - 1)
const PEB_R = 6.5

function bucketX(i: number): number {
  return 24 + i * (BUCKET_W + GAP)
}

/** Pebbles stack in two columns of five inside each bucket. */
function pebblePos(i: number, k: number): { cx: number; cy: number } {
  const col = k % 2
  const row = Math.floor(k / 2)
  return {
    cx: bucketX(i) + BUCKET_W / 2 + (col === 0 ? -PEB_R - 1.5 : PEB_R + 1.5),
    cy: FLOOR - PEB_R - 2 - row * (PEB_R * 2 + 2.5),
  }
}

export function EntropyPebbles() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0])
  const [locked, setLocked] = useState(false)
  const [targetMean, setTargetMean] = useState(3)

  const placed = counts.reduce((a, b) => a + b, 0)
  const ways = Math.exp(logMultiplicity(counts))
  const h = entropy(normalize(counts))
  const mu = placed > 0 ? meanValue(counts, VALUES) : null
  const champion = locked ? maxentWithMean(VALUES, targetMean) : null
  const championH = champion ? entropy(champion) : null

  const add = (i: number) => {
    if (placed >= POUCH) return
    setCounts((c) => c.map((v, j) => (j === i ? v + 1 : v)))
  }
  const remove = (i: number) => {
    setCounts((c) => c.map((v, j) => (j === i && v > 0 ? v - 1 : v)))
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Ten pebbles, five buckets</p>
        <p className="font-mono text-xs text-secondary">
          pouch:{' '}
          {Array.from({ length: POUCH }, (_, k) => (k < POUCH - placed ? '●' : '○')).join(
            ' ',
          )}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Five buckets receiving pebbles; the arrangement's ways and entropy update live"
        >
          {/* maxent champion silhouette, in verdigris (it is the prior being derived) */}
          {champion
            ? champion.map((p, i) => {
                const bh = p * POUCH * (PEB_R * 2 + 2.5)
                return (
                  <rect
                    key={i}
                    x={bucketX(i) + 6}
                    y={FLOOR - bh}
                    width={BUCKET_W - 12}
                    height={bh}
                    fill="var(--stat-prior)"
                    opacity="0.14"
                    stroke="var(--stat-prior)"
                    strokeWidth="1"
                  />
                )
              })
            : null}

          {/* buckets */}
          {counts.map((n, i) => (
            <g key={i}>
              <path
                d={`M${bucketX(i)} ${FLOOR - 74} L${bucketX(i)} ${FLOOR} L${bucketX(i) + BUCKET_W} ${FLOOR} L${bucketX(i) + BUCKET_W} ${FLOOR - 74}`}
                fill="none"
                stroke="var(--line)"
                strokeWidth="1.5"
              />
              <rect
                x={bucketX(i)}
                y={FLOOR - 130}
                width={BUCKET_W}
                height={130}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => add(i)}
                role="button"
                aria-label={`drop a pebble in bucket ${VALUES[i]}`}
              />
              {Array.from({ length: n }, (_, k) => {
                const { cx, cy } = pebblePos(i, k)
                return (
                  <circle
                    key={k}
                    cx={cx}
                    cy={cy}
                    r={PEB_R}
                    fill="none"
                    stroke="var(--stat-data)"
                    strokeWidth="1.5"
                  />
                )
              })}
              <text
                x={bucketX(i) + BUCKET_W / 2}
                y={H - 8}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {VALUES[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-5 gap-2" style={{ maxWidth: '100%' }}>
        {counts.map((n, i) => (
          <div key={i} className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={n === 0}
              aria-label={`remove a pebble from bucket ${VALUES[i]}`}
              className="cursor-pointer rounded-card border border-line px-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent disabled:cursor-default disabled:opacity-40"
            >
              −
            </button>
            <span className="font-mono text-xs">{n}</span>
            <button
              type="button"
              onClick={() => add(i)}
              disabled={placed >= POUCH}
              aria-label={`add a pebble to bucket ${VALUES[i]}`}
              className="cursor-pointer rounded-card border border-line px-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent disabled:cursor-default disabled:opacity-40"
            >
              +
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-secondary">the book's five:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setCounts([...p.counts])}
            className="cursor-pointer rounded-card border border-line px-3 py-1 font-mono text-xs transition-colors duration-[180ms] hover:border-accent"
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCounts([0, 0, 0, 0, 0])}
          className="cursor-pointer rounded-card border border-line px-3 py-1 font-mono text-xs text-secondary transition-colors duration-[180ms] hover:border-accent"
        >
          empty
        </button>
      </div>

      <div className="mt-4 rounded-card border border-line p-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
          <span>
            <span className="text-secondary">ways W = </span>
            <span className="text-accent-bright">
              {ways >= 1000 ? Math.round(ways).toLocaleString('en-US') : ways.toFixed(0)}
            </span>
          </span>
          <span>
            <span className="text-secondary">log W / N = </span>
            {placed > 0 ? (logMultiplicity(counts) / placed).toFixed(3) : '—'}
          </span>
          <span>
            <span className="text-secondary">entropy H = </span>
            {placed > 0 ? h.toFixed(3) : '—'}
          </span>
          <span>
            <span className="text-secondary">lever (mean) = </span>
            {mu === null ? '—' : mu.toFixed(2)}
          </span>
        </div>
        {locked && championH !== null ? (
          <p className="mt-2 font-mono text-xs text-secondary">
            best possible H at mean {targetMean.toFixed(1)}:{' '}
            <span className="text-(--stat-prior)">{championH.toFixed(3)}</span>
            {placed === POUCH && mu !== null && Math.abs(mu - targetMean) < 0.05 ? (
              <span>
                {' '}
                · your gap: {(championH - h).toFixed(3)}
              </span>
            ) : (
              <span> · place all ten pebbles at that mean to compete</span>
            )}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            className="accent-(--brass-400)"
          />
          lock the lever (fix the mean)
        </label>
        {locked ? (
          <label className="flex items-center gap-3 text-sm text-secondary">
            target mean
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={targetMean}
              onChange={(e) => setTargetMean(Number(e.target.value))}
              className="w-44 accent-(--verdigris-400)"
            />
            <span className="font-mono text-xs">{targetMean.toFixed(1)}</span>
          </label>
        ) : null}
      </div>
    </div>
  )
}
