import { useEffect, useMemo, useRef, useState } from 'react'
import type { Tank } from './engine'
import { shrinkageTable } from './engine'

const W = 700
const H = 360
const PAD_L = 40
const PAD_R = 12
const PAD_T = 16
const PAD_B = 46

/** Book value of σ for m13.2 (adaptive prior sd on the tank intercepts). */
const SIGMA_BOOK = 1.6
const SIGMA_MIN = 0.25
const SIGMA_MAX = 8

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export function ShrinkageTheater({ tanks }: { tanks: Tank[] }) {
  const [sigma, setSigma] = useState(SIGMA_BOOK)
  const [playing, setPlaying] = useState(false)
  const reduced = usePrefersReducedMotion()
  const raf = useRef<number | null>(null)

  const { rows, grandMean } = useMemo(() => shrinkageTable(tanks, sigma), [tanks, sigma])

  // Play the trade-off: sweep σ from wide (no pooling) to tight (complete
  // pooling) and settle at the book's value, so the brass points visibly
  // collapse onto the grand-mean line and spring back.
  useEffect(() => {
    if (!playing) return
    if (reduced) {
      setSigma(SIGMA_BOOK)
      setPlaying(false)
      return
    }
    const start = performance.now()
    const dur = 3600
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      // ease along a wide→tight→book path in log space
      const logMax = Math.log(SIGMA_MAX)
      const logMin = Math.log(SIGMA_MIN)
      const logBook = Math.log(SIGMA_BOOK)
      let logs: number
      if (t < 0.5) {
        const u = t / 0.5
        logs = logMax + (logMin - logMax) * (u * u * (3 - 2 * u))
      } else {
        const u = (t - 0.5) / 0.5
        logs = logMin + (logBook - logMin) * (u * u * (3 - 2 * u))
      }
      setSigma(Math.exp(logs))
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playing, reduced])

  const n = rows.length
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const xOf = (i: number) => PAD_L + ((i + 0.5) / n) * plotW
  const yOf = (p: number) => PAD_T + (1 - p) * plotH
  const rOf = (density: number) => 2.4 + (density / 35) * 3.2

  const meanShrink =
    rows.reduce((s, r) => s + Math.max(0, Math.min(1, r.shrinkage)), 0) / n

  // group dividers between density blocks (16 tanks each)
  const dividers = [16, 32].map((k) => PAD_L + (k / n) * plotW)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Forty-eight tanks, three theories of the pond</p>
        <p className="font-mono text-xs text-secondary">
          σ = {sigma.toFixed(2)} · mean shrinkage {(meanShrink * 100).toFixed(0)}%
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Survival proportion per tank; raw estimates in bone, partial-pooling estimates in brass, drawn toward the grand mean"
        >
          {/* y gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={yOf(p)}
                y2={yOf(p)}
                stroke="var(--line)"
                strokeWidth="1"
                opacity="0.35"
              />
              <text
                x={PAD_L - 6}
                y={yOf(p) + 3}
                textAnchor="end"
                fill="var(--bone-300)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {p.toFixed(2)}
              </text>
            </g>
          ))}

          {/* grand mean: the complete-pooling line every estimate is pulled toward */}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yOf(grandMean)}
            y2={yOf(grandMean)}
            stroke="var(--brass-200)"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            opacity="0.8"
          />
          <text
            x={W - PAD_R}
            y={yOf(grandMean) - 5}
            textAnchor="end"
            fill="var(--brass-200)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            grand mean {grandMean.toFixed(2)}
          </text>

          {/* density-group dividers + labels */}
          {dividers.map((x, i) => (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={PAD_T}
              y2={H - PAD_B}
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.5"
            />
          ))}
          {['10 tadpoles', '25 tadpoles', '35 tadpoles'].map((label, i) => (
            <text
              key={label}
              x={PAD_L + ((i + 0.5) / 3) * plotW}
              y={H - PAD_B + 26}
              textAnchor="middle"
              fill="var(--bone-300)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {label}
            </text>
          ))}

          {/* shrinkage segments: raw → partial */}
          {rows.map((r, i) => (
            <line
              key={`seg-${i}`}
              x1={xOf(i)}
              x2={xOf(i)}
              y1={yOf(r.raw)}
              y2={yOf(r.partial)}
              stroke="var(--brass-400)"
              strokeWidth="1"
              opacity="0.4"
            />
          ))}

          {/* raw (no-pooling) estimates: open bone circles, radius ∝ tank size */}
          {rows.map((r, i) => (
            <circle
              key={`raw-${i}`}
              cx={xOf(i)}
              cy={yOf(r.raw)}
              r={rOf(r.tank.density)}
              fill="none"
              stroke="var(--bone-100)"
              strokeWidth="1.1"
              opacity="0.75"
            />
          ))}

          {/* partial-pooling estimates: filled brass */}
          {rows.map((r, i) => (
            <circle
              key={`par-${i}`}
              cx={xOf(i)}
              cy={yOf(r.partial)}
              r={2.4}
              fill="var(--stat-posterior)"
            />
          ))}

          <text
            x={PAD_L - 30}
            y={PAD_T + plotH / 2}
            textAnchor="middle"
            fill="var(--bone-300)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            transform={`rotate(-90 ${PAD_L - 30} ${PAD_T + plotH / 2})`}
          >
            proportion survived
          </text>
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        open bone: raw surv/n (circle size = tank size) · brass: partial pooling ·
        brass dash: the grand mean
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          prior width σ
          <input
            type="range"
            min={SIGMA_MIN}
            max={SIGMA_MAX}
            step={0.05}
            value={sigma}
            onChange={(e) => {
              setPlaying(false)
              setSigma(Number(e.target.value))
            }}
            className="w-48 accent-(--brass-400)"
          />
          <span className="font-mono text-xs">{sigma.toFixed(2)}</span>
        </label>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          {playing ? 'Stop' : 'Play the trade-off'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setSigma(SIGMA_BOOK)
          }}
          className="cursor-pointer text-sm text-secondary underline decoration-dotted underline-offset-4 hover:text-accent-bright"
        >
          reset to σ = 1.6
        </button>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Slide σ toward zero and every brass point rushes the dashed line — the
        pond becomes one number, the small tanks first. Slide it wide and the
        brass settles back onto the bone: each tank believed only itself. The
        multilevel model learns the middle setting from the data, and it shrinks
        the ten-tadpole tanks hardest, because a tank that saw the least has the
        most to borrow.
      </p>
    </div>
  )
}
