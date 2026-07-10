import { useMemo, useState } from 'react'
import { ModelComparison } from '../../core/ModelComparison'
import { RNG } from '../../../lib/rng'
import {
  comparisonRows,
  fitPoly,
  generateSample,
  predict,
  scoreDegrees,
  trueMean,
} from './engine'
import type { DegreeScore } from './engine'

const DEGREES = [1, 2, 3, 4, 5, 6]
const N = 12

export function OverfitGame() {
  const [seed, setSeed] = useState(1959)
  const [degree, setDegree] = useState(1)
  const [guess, setGuess] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showTruth, setShowTruth] = useState(false)

  const sample = useMemo(() => generateSample(N, new RNG(seed)), [seed])
  const fit = useMemo(() => fitPoly(sample, degree), [sample, degree])
  const scores = useMemo(
    () => (revealed ? scoreDegrees(sample, DEGREES, seed) : null),
    [revealed, sample, seed],
  )

  // scatter geometry
  const W = 620
  const H = 340
  const yLo = -1.4
  const yHi = 1.6
  const px = (x: number) => ((x + 1.05) / 2.1) * (W - 60) + 40
  const py = (y: number) => H - 30 - ((y - yLo) / (yHi - yLo)) * (H - 50)
  const curveXs = useMemo(
    () => Array.from({ length: 121 }, (_, i) => -1.05 + (i * 2.1) / 120),
    [],
  )
  const curvePath = (f: (x: number) => number) =>
    curveXs
      .map((x, i) => {
        const y = Math.max(yLo, Math.min(yHi, f(x)))
        return `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(y).toFixed(1)}`
      })
      .join(' ')

  // deviance plot geometry (after reveal)
  const dev = scores
    ? (() => {
        const all = scores.flatMap((s) => [s.trainDeviance, s.looDeviance, s.testDeviance])
        return { lo: Math.min(...all), hi: Math.max(...all) }
      })()
    : null

  const ranked = scores
    ? comparisonRows(scores.map((s) => ({ label: `degree ${s.degree}`, score: s.looDeviance })))
    : null
  const guessRank = scores && guess !== null
    ? [...scores].sort((a, b) => a.testDeviance - b.testDeviance).findIndex((s) => s.degree === guess) + 1
    : null

  return (
    <div>
      <div className="rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Training sample with a degree-${degree} polynomial fit`}
        >
          {showTruth ? (
            <path
              d={curvePath(trueMean)}
              fill="none"
              stroke="var(--bone-300)"
              strokeWidth="1"
              strokeDasharray="5 4"
              opacity="0.55"
            />
          ) : null}
          <path
            d={curvePath((x) => predict(fit.coefs, x))}
            fill="none"
            stroke="var(--stat-posterior)"
            strokeWidth="1.5"
          />
          {sample.x.map((x, i) => (
            <circle
              key={i}
              cx={px(x)}
              cy={py(Math.max(yLo, Math.min(yHi, sample.y[i]!)))}
              r="2.6"
              fill="none"
              stroke="var(--bone-100)"
              strokeWidth="1"
            />
          ))}
          <line x1={px(-1.05)} x2={px(1.05)} y1={py(yLo)} y2={py(yLo)} stroke="var(--line)" strokeWidth="1" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-secondary">degree</span>
        {DEGREES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDegree(d)}
            aria-pressed={degree === d}
            className={`cursor-pointer rounded-card border px-3 py-1.5 font-mono text-sm transition-colors duration-[180ms] ${
              degree === d
                ? 'border-accent text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-secondary">
          train deviance{' '}
          <span className="text-primary">{fit.trainDeviance.toFixed(1)}</span>
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setSeed((s) => s + 1)
          }}
          className="cursor-pointer rounded-card border border-line px-3 py-1.5 text-xs text-secondary transition-colors duration-[180ms] hover:border-accent"
        >
          Forge a new sample
        </button>
        <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-secondary">
          <input
            type="checkbox"
            checked={showTruth}
            onChange={(e) => setShowTruth(e.target.checked)}
            className="accent-(--brass-400)"
          />
          show the process that made the data
        </label>
      </div>

      <div className="mt-8 rounded-card border border-line p-5">
        {!revealed ? (
          <>
            <p className="eyebrow">Commit before the reveal</p>
            <p className="mt-3 text-sm text-secondary">
              Raising the degree always lowers train deviance. Which degree will
              score best on data this golem has never seen?
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {DEGREES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setGuess(d)}
                  aria-pressed={guess === d}
                  className={`cursor-pointer rounded-card border px-3 py-1.5 font-mono text-sm transition-colors duration-[180ms] ${
                    guess === d
                      ? 'border-(--plum-500) text-primary'
                      : 'border-line text-secondary hover:border-(--plum-500)'
                  }`}
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                disabled={guess === null}
                onClick={() => setRevealed(true)}
                className="ml-auto cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] enabled:hover:bg-surface disabled:cursor-not-allowed disabled:border-line disabled:text-secondary"
              >
                Score every golem on new data
              </button>
            </div>
          </>
        ) : dev && scores ? (
          <>
            <p className="eyebrow">The reveal</p>
            {guess !== null && guessRank !== null ? (
              <p className="mt-3 text-sm">
                Your pick, degree {guess}, ranked{' '}
                <span className="font-mono text-accent-bright">
                  {guessRank} of {DEGREES.length}
                </span>{' '}
                on fresh data.
              </p>
            ) : null}
            <svg
              viewBox="0 0 620 260"
              className="mt-4 w-full"
              role="img"
              aria-label="Train, leave-one-out and test deviance by polynomial degree"
            >
              {(() => {
                const qx = (d: number) => ((d - 1) / 5) * 500 + 70
                const qy = (v: number) =>
                  225 - ((v - dev.lo) / (dev.hi - dev.lo || 1)) * 190
                const line = (get: (s: DegreeScore) => number) =>
                  scores.map((s, i) => `${i === 0 ? 'M' : 'L'}${qx(s.degree)},${qy(get(s)).toFixed(1)}`).join(' ')
                return (
                  <>
                    <path d={line((s) => s.trainDeviance)} fill="none" stroke="var(--stat-posterior)" strokeWidth="1.5" />
                    <path d={line((s) => s.testDeviance)} fill="none" stroke="var(--stat-predictive)" strokeWidth="1.5" />
                    <path d={line((s) => s.looDeviance)} fill="none" stroke="var(--stat-predictive)" strokeWidth="1" strokeDasharray="4 3" />
                    {scores.map((s) => (
                      <g key={s.degree}>
                        <circle cx={qx(s.degree)} cy={qy(s.trainDeviance)} r="3" fill="var(--stat-posterior)" />
                        <circle cx={qx(s.degree)} cy={qy(s.testDeviance)} r="3" fill="none" stroke="var(--stat-predictive)" strokeWidth="1.5" />
                        {s.degree === guess ? (
                          <circle cx={qx(s.degree)} cy={qy(s.testDeviance)} r="7" fill="none" stroke="var(--brass-200)" strokeWidth="1" />
                        ) : null}
                        <text x={qx(s.degree)} y={248} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--bone-300)">
                          {s.degree}
                        </text>
                      </g>
                    ))}
                    <text x={70} y={16} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bone-300)">
                      deviance (lower is better)
                    </text>
                  </>
                )
              })()}
            </svg>
            <p className="mt-1 font-mono text-xs text-secondary">
              brass: in-sample · plum: fresh data · dashed plum: leave-one-out estimate
            </p>
            <div className="mt-5">
              {ranked ? (
                <ModelComparison
                  rows={ranked}
                  scoreName="LOO deviance"
                  marked={guess !== null ? `degree ${guess}` : undefined}
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm text-secondary">
              Forge a new sample and watch: the high-degree fits convulse from
              sample to sample while the low-degree ones barely move. That
              tremor is variance, and new data always bills for it.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
