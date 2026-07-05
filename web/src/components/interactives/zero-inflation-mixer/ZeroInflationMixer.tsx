import { useMemo, useState } from 'react'
import { HOUSE_SEED, RNG } from '../../../lib/rng'
import {
  histogram,
  naiveLambda,
  simulateDays,
  zeroDecomposition,
  zipPmf,
} from './engine'

const W = 620
const H = 280
const MAX_K = 8
const N_DAYS = 365

export function ZeroInflationMixer() {
  const [pDrink, setPDrink] = useState(0.2)
  const [lambda, setLambda] = useState(1)
  const [revealed, setRevealed] = useState(false)

  const { hist, naive } = useMemo(() => {
    const rng = new RNG(HOUSE_SEED, 51)
    const days = simulateDays(rng, N_DAYS, pDrink, lambda)
    return { hist: histogram(days, MAX_K), naive: naiveLambda(days) }
  }, [pDrink, lambda])

  const zeros = zeroDecomposition(pDrink, lambda)

  const barW = (W - 70) / (MAX_K + 1)
  const maxFreq = Math.max(
    0.4,
    (hist.zerosDrinking + hist.zerosWorking) / N_DAYS + 0.05,
  )
  const yOf = (freq: number) => 14 + (1 - freq / maxFreq) * (H - 58)
  const xOf = (k: number) => 44 + k * barW

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">A year at the scriptorium</p>
        <p className="font-mono text-xs text-secondary">
          P(0) = p + (1−p)e^−λ = {zeros.drinking.toFixed(2)} +{' '}
          {zeros.working.toFixed(2)} = {zeros.total.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Histogram of manuscripts per day; the zero column splits into drinking and working zeros"
        >
          {[0, 0.1, 0.2, 0.3, 0.4].map((f) =>
            f <= maxFreq ? (
              <g key={f}>
                <line
                  x1={40}
                  x2={W - 10}
                  y1={yOf(f)}
                  y2={yOf(f)}
                  stroke="var(--line)"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <text
                  x={34}
                  y={yOf(f) + 3}
                  textAnchor="end"
                  fill="var(--text-secondary)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {f.toFixed(1)}
                </text>
              </g>
            ) : null,
          )}

          {/* zero column: working zeros in bone below, drinking zeros stacked in plum */}
          {(() => {
            const fWork = hist.zerosWorking / N_DAYS
            const fDrink = hist.zerosDrinking / N_DAYS
            return (
              <g>
                <rect
                  x={xOf(0) + 6}
                  y={yOf(fWork)}
                  width={barW - 16}
                  height={H - 44 - yOf(fWork)}
                  fill="var(--stat-data)"
                  opacity="0.35"
                  stroke="var(--stat-data)"
                  strokeWidth="1.2"
                />
                <rect
                  x={xOf(0) + 6}
                  y={yOf(fWork + fDrink)}
                  width={barW - 16}
                  height={yOf(fWork) - yOf(fWork + fDrink)}
                  fill={revealed ? 'var(--plum-500)' : 'var(--stat-data)'}
                  opacity={revealed ? 0.55 : 0.35}
                  stroke={revealed ? 'var(--plum-500)' : 'var(--stat-data)'}
                  strokeWidth="1.2"
                />
              </g>
            )
          })()}

          {hist.counts.map((c, k) =>
            k === 0 ? null : (
              <rect
                key={k}
                x={xOf(k) + 6}
                y={yOf(c / N_DAYS)}
                width={barW - 16}
                height={H - 44 - yOf(c / N_DAYS)}
                fill="var(--stat-data)"
                opacity="0.35"
                stroke="var(--stat-data)"
                strokeWidth="1.2"
              />
            ),
          )}

          {/* the ZIP pmf as brass ticks; the naive Poisson's zero claim in clay */}
          {Array.from({ length: MAX_K + 1 }, (_, k) => (
            <line
              key={k}
              x1={xOf(k) + 4}
              x2={xOf(k) + barW - 12}
              y1={yOf(zipPmf(k, pDrink, lambda))}
              y2={yOf(zipPmf(k, pDrink, lambda))}
              stroke="var(--stat-posterior)"
              strokeWidth="1.6"
            />
          ))}
          <line
            x1={xOf(0) + 4}
            x2={xOf(0) + barW - 12}
            y1={yOf(Math.exp(-naive))}
            y2={yOf(Math.exp(-naive))}
            stroke="var(--stat-danger)"
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />

          {Array.from({ length: MAX_K + 1 }, (_, k) => (
            <text
              key={k}
              x={xOf(k) + (barW - 8) / 2}
              y={H - 26}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {k}
            </text>
          ))}
          <text
            x={W / 2}
            y={H - 8}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            manuscripts finished per day, {N_DAYS} days
          </text>
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        brass ticks: the mixture's pmf · clay dash: zeros a plain Poisson (λ̂ ={' '}
        {naive.toFixed(2)}) can explain
        {revealed ? ' · plum: zeros that were drinking all along' : ''}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm text-secondary">
          p(drink)
          <input
            type="range"
            min={0}
            max={0.7}
            step={0.01}
            value={pDrink}
            onChange={(e) => setPDrink(Number(e.target.value))}
            className="w-40 accent-(--plum-500)"
          />
          <span className="font-mono text-xs">{pDrink.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-3 text-sm text-secondary">
          work rate λ
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.05}
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-40 accent-(--brass-400)"
          />
          <span className="font-mono text-xs">{lambda.toFixed(2)}</span>
        </label>
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          {revealed ? 'Hide the hidden state' : 'Reveal which zeros were wine'}
        </button>
      </div>

      <p className="mt-3 text-sm text-secondary">
        The data never carry the plum label — every zero looks identical in a
        ledger. The mixture earns its keep by admitting that two processes can
        make the same observation, and letting the rest of the histogram say
        how often each one did.
      </p>
    </div>
  )
}
