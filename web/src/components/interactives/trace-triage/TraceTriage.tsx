import { useMemo, useState } from 'react'
import {
  AILMENTS,
  DIAGNOSES,
  DRAWS,
  effectiveSampleSize,
  makeDeck,
  splitRhat,
} from './engine'
import type { Ailment } from './engine'

const CHAIN_COLORS = ['var(--brass-400)', 'var(--brass-200)', 'var(--bone-300)']

export function TraceTriage() {
  const [deckSeed, setDeckSeed] = useState(1959)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<Ailment | null>(null)
  const [score, setScore] = useState({ right: 0, seen: 0 })

  const deck = useMemo(() => makeDeck(deckSeed), [deckSeed])
  const round = deck[index % deck.length]!
  const diagnostics = useMemo(
    () =>
      answer === null
        ? null
        : {
            rhat: splitRhat(round.traces),
            ess: effectiveSampleSize(round.traces),
          },
    [answer, round],
  )

  const W = 620
  const H = 260
  const all = round.traces.flat()
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo) * 0.08
  const px = (i: number) => (i / (DRAWS - 1)) * (W - 24) + 12
  const py = (v: number) => 8 + (1 - (v - (lo - pad)) / (hi - lo + 2 * pad)) * (H - 40)

  const commit = (a: Ailment) => {
    if (answer !== null) return
    setAnswer(a)
    setScore((s) => ({ right: s.right + (a === round.ailment ? 1 : 0), seen: s.seen + 1 }))
  }

  const next = () => {
    setAnswer(null)
    if (index + 1 >= deck.length) {
      setDeckSeed((s) => s + 1)
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
  }

  const hasDivergences = round.divergences.some((d) => d.length > 0)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Patient {score.seen + (answer === null ? 1 : 0)}</p>
        <p className="font-mono text-xs text-secondary">
          diagnosed {score.right} of {score.seen}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Three MCMC chains for one parameter; diagnose their condition"
        >
          {round.traces.map((t, c) => (
            <path
              key={c}
              d={t.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={CHAIN_COLORS[c]}
              strokeWidth="0.9"
              opacity="0.8"
            />
          ))}
          {round.divergences.map((d, c) =>
            d.map((i) => (
              <line
                key={`${c}-${i}`}
                x1={px(i)}
                x2={px(i)}
                y1={H - 18}
                y2={H - 10}
                stroke="var(--stat-danger)"
                strokeWidth="1.2"
              />
            )),
          )}
          <line x1={12} x2={W - 12} y1={H - 18} y2={H - 18} stroke="var(--line)" strokeWidth="1" />
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-secondary">
        3 chains × {DRAWS} draws{hasDivergences ? ' · clay ticks mark divergent transitions' : ''}
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {AILMENTS.map((a) => {
          const isAnswer = answer !== null && a === round.ailment
          const isWrongPick = answer === a && a !== round.ailment
          return (
            <button
              key={a}
              type="button"
              onClick={() => commit(a)}
              disabled={answer !== null}
              className={`cursor-pointer rounded-card border px-4 py-2.5 text-left text-sm transition-colors duration-[180ms] disabled:cursor-default ${
                isAnswer
                  ? 'border-accent text-accent-bright'
                  : isWrongPick
                    ? 'border-(--clay-500) text-(--clay-500)'
                    : answer !== null
                      ? 'border-line text-secondary opacity-60'
                      : 'border-line hover:border-accent'
              }`}
            >
              {DIAGNOSES[a].label}
            </button>
          )
        })}
      </div>

      {answer !== null && diagnostics ? (
        <div className="mt-5 rounded-card border border-line p-5">
          <p className="eyebrow">
            {answer === round.ailment ? 'Correct diagnosis' : `It was: ${DIAGNOSES[round.ailment].label}`}
          </p>
          <p className="mt-3 text-sm">{DIAGNOSES[round.ailment].giveaway}</p>
          <p className="mt-2 text-sm text-secondary">{DIAGNOSES[round.ailment].remedy}</p>
          <p className="mt-4 font-mono text-xs">
            <span className="text-secondary">R̂ = </span>
            <span className={diagnostics.rhat > 1.01 ? 'text-(--clay-500)' : 'text-accent-bright'}>
              {diagnostics.rhat === Infinity ? '∞' : diagnostics.rhat.toFixed(3)}
            </span>
            <span className="ml-4 text-secondary">ESS ≈ </span>
            <span className={diagnostics.ess < 400 ? 'text-(--clay-500)' : 'text-accent-bright'}>
              {diagnostics.ess.toFixed(0)}
            </span>
            <span className="ml-4 text-secondary">
              (gates: R̂ &lt; 1.01, ESS &gt; 400)
            </span>
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
          >
            Next patient
          </button>
        </div>
      ) : null}
    </div>
  )
}
