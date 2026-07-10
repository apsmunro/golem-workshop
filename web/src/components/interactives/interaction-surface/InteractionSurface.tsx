import { useMemo, useState } from 'react'
import { Z89, fitInteraction, meanAt, slopeAt } from './engine'
import type { XYM } from './engine'

export type ModeratorControl =
  | { kind: 'binary'; labels: [string, string] }
  | { kind: 'range'; lo: number; hi: number; step: number; format?: (m: number) => string }

interface InteractionSurfaceProps {
  data: XYM[]
  xLabel: string
  yLabel: string
  mLabel: string
  moderator: ModeratorControl
}

export function InteractionSurface({
  data,
  xLabel,
  yLabel,
  mLabel,
  moderator,
}: InteractionSurfaceProps) {
  const [m0, setM0] = useState(moderator.kind === 'binary' ? 0 : (moderator.lo + moderator.hi) / 2)

  const fit = useMemo(() => fitInteraction(data), [data])
  const xLo = Math.min(...data.map((d) => d.x))
  const xHi = Math.max(...data.map((d) => d.x))
  const yLo = Math.min(...data.map((d) => d.y))
  const yHi = Math.max(...data.map((d) => d.y))
  const yPad = (yHi - yLo) * 0.12

  // left panel: scatter + conditional line
  const W = 340
  const H = 300
  const px = (x: number) => ((x - xLo) / (xHi - xLo)) * (W - 62) + 46
  const py = (y: number) =>
    H - 34 - ((y - (yLo - yPad)) / (yHi - yLo + 2 * yPad)) * (H - 54)
  const lineXs = useMemo(
    () => Array.from({ length: 41 }, (_, i) => xLo + ((xHi - xLo) * i) / 40),
    [xLo, xHi],
  )
  const conditional = lineXs.map((x) => meanAt(fit, x, m0))
  const bandPath = () => {
    const up = lineXs
      .map((x, i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(conditional[i]!.mu + Z89 * conditional[i]!.se).toFixed(1)}`)
      .join(' ')
    const down = [...lineXs]
      .reverse()
      .map((x, i) => {
        const c = conditional[lineXs.length - 1 - i]!
        return `L${px(x).toFixed(1)},${py(c.mu - Z89 * c.se).toFixed(1)}`
      })
      .join(' ')
    return `${up} ${down} Z`
  }

  // right panel: slope against moderator
  const mLo = moderator.kind === 'binary' ? -0.15 : moderator.lo
  const mHi = moderator.kind === 'binary' ? 1.15 : moderator.hi
  const mGrid = useMemo(
    () => Array.from({ length: 41 }, (_, i) => mLo + ((mHi - mLo) * i) / 40),
    [mLo, mHi],
  )
  const slopes = mGrid.map((m) => slopeAt(fit, m))
  const sLo = Math.min(0, ...slopes.map((s) => s.slope - Z89 * s.se))
  const sHi = Math.max(0, ...slopes.map((s) => s.slope + Z89 * s.se))
  const sPad = (sHi - sLo) * 0.08
  const qx = (m: number) => ((m - mLo) / (mHi - mLo)) * (W - 62) + 46
  const qy = (s: number) =>
    H - 34 - ((s - (sLo - sPad)) / (sHi - sLo + 2 * sPad)) * (H - 54)
  const slopeBand = () => {
    const up = mGrid
      .map((m, i) => `${i === 0 ? 'M' : 'L'}${qx(m).toFixed(1)},${qy(slopes[i]!.slope + Z89 * slopes[i]!.se).toFixed(1)}`)
      .join(' ')
    const down = [...mGrid]
      .reverse()
      .map((m, i) => {
        const s = slopes[mGrid.length - 1 - i]!
        return `L${qx(m).toFixed(1)},${qy(s.slope - Z89 * s.se).toFixed(1)}`
      })
      .join(' ')
    return `${up} ${down} Z`
  }

  const here = slopeAt(fit, m0)
  const mNear = (m: number) =>
    moderator.kind === 'binary'
      ? m === m0
      : Math.abs(m - m0) <= (moderator.hi - moderator.lo) / 4 + 1e-9

  const formatM = (m: number) =>
    moderator.kind === 'binary'
      ? moderator.labels[m0 === 0 ? 0 : 1]
      : (moderator.format?.(m) ?? m.toFixed(1))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-secondary">{mLabel}:</span>
        {moderator.kind === 'binary' ? (
          moderator.labels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setM0(i)}
              aria-pressed={m0 === i}
              className={`cursor-pointer rounded-card border px-3 py-1.5 font-mono text-sm transition-colors duration-[180ms] ${
                m0 === i
                  ? 'border-accent text-accent-bright'
                  : 'border-line text-secondary hover:border-accent'
              }`}
            >
              {label}
            </button>
          ))
        ) : (
          <label className="flex grow items-center gap-3">
            <input
              type="range"
              min={moderator.lo}
              max={moderator.hi}
              step={moderator.step}
              value={m0}
              onChange={(e) => setM0(Number(e.target.value))}
              className="grow accent-(--brass-400)"
              aria-label={mLabel}
            />
            <span className="font-mono text-sm text-accent-bright">{formatM(m0)}</span>
          </label>
        )}
        <span className="ml-auto font-mono text-xs text-secondary">
          slope of {xLabel} here:{' '}
          <span className={here.slope >= 0 ? 'text-accent-bright' : 'text-(--clay-500)'}>
            {here.slope >= 0 ? '+' : ''}
            {here.slope.toFixed(2)}
          </span>{' '}
          ± {(Z89 * here.se).toFixed(2)}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <figure className="rounded-card border border-line bg-ink-950">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`${yLabel} against ${xLabel} with the regression line at ${mLabel} = ${formatM(m0)}`}
          >
            <path d={bandPath()} fill="var(--stat-posterior)" fillOpacity="0.14" />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={px(d.x)}
                cy={py(d.y)}
                r="2.2"
                fill="none"
                stroke="var(--bone-100)"
                strokeWidth="0.9"
                opacity={mNear(d.m) ? 0.9 : 0.18}
              />
            ))}
            <path
              d={lineXs
                .map((x, i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(conditional[i]!.mu).toFixed(1)}`)
                .join(' ')}
              fill="none"
              stroke="var(--stat-posterior)"
              strokeWidth="1.5"
            />
            <line x1={px(xLo)} x2={px(xHi)} y1={H - 34} y2={H - 34} stroke="var(--line)" strokeWidth="1" />
            <text x={W / 2} y={H - 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)">
              {xLabel}
            </text>
            <text x={16} y={H / 2} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)" transform={`rotate(-90 16 ${H / 2})`} textAnchor="middle">
              {yLabel}
            </text>
          </svg>
          <figcaption className="border-t border-line px-3 py-2 font-mono text-xs text-bone-300">
            the line where {mLabel} = {formatM(m0)}
          </figcaption>
        </figure>

        <figure className="rounded-card border border-line bg-ink-950">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Slope of ${xLabel} as a function of ${mLabel}`}
          >
            <path d={slopeBand()} fill="var(--stat-posterior)" fillOpacity="0.14" />
            <line x1={qx(mLo)} x2={qx(mHi)} y1={qy(0)} y2={qy(0)} stroke="var(--line)" strokeWidth="1" strokeDasharray="4 3" />
            <path
              d={mGrid
                .map((m, i) => `${i === 0 ? 'M' : 'L'}${qx(m).toFixed(1)},${qy(slopes[i]!.slope).toFixed(1)}`)
                .join(' ')}
              fill="none"
              stroke="var(--stat-posterior)"
              strokeWidth="1.5"
            />
            <line
              x1={qx(m0)}
              x2={qx(m0)}
              y1={qy(sLo - sPad)}
              y2={qy(sHi + sPad)}
              stroke="var(--stat-predictive)"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.8"
            />
            <line x1={qx(mLo)} x2={qx(mHi)} y1={H - 34} y2={H - 34} stroke="var(--line)" strokeWidth="1" />
            <text x={W / 2} y={H - 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)">
              {mLabel}
            </text>
            <text x={16} y={H / 2} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)" transform={`rotate(-90 16 ${H / 2})`} textAnchor="middle">
              slope of {xLabel}
            </text>
          </svg>
          <figcaption className="border-t border-line px-3 py-2 font-mono text-xs text-bone-300">
            the interaction: how the slope itself moves
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
