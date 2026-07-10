import { useMemo, useState } from 'react'
import { fitErrorInVariables, standardize } from './engine'
import type { WaffleRow } from './engine'

const W = 620
const H = 420
const PAD_L = 44
const PAD_R = 14
const PAD_T = 16
const PAD_B = 44
const RANGE = 3

function xOf(x: number): number {
  return PAD_L + ((x + RANGE) / (2 * RANGE)) * (W - PAD_L - PAD_R)
}
function yOf(y: number): number {
  return H - PAD_B - ((y + RANGE) / (2 * RANGE)) * (H - PAD_T - PAD_B)
}

export function ErrorInVariables({ rows }: { rows: WaffleRow[] }) {
  const [correct, setCorrect] = useState(true)
  const data = useMemo(() => standardize(rows), [rows])
  const fit = useMemo(() => fitErrorInVariables(data), [data])

  const line = correct ? fit.corrected : fit.naive
  const lineY = (x: number) => line.a + line.b * x

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Fifty states, each measured with its own error</p>
        <p className="font-mono text-xs text-secondary">
          slope: naive {fit.naive.b.toFixed(2)} · corrected {fit.corrected.b.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Standardized divorce rate against median age at marriage, with per-state measurement error bars and the error-corrected regression line"
        >
          {[-2, -1, 0, 1, 2].map((g) => (
            <g key={g}>
              <line x1={xOf(g)} x2={xOf(g)} y1={PAD_T} y2={H - PAD_B} stroke="var(--line)" strokeWidth="1" opacity="0.25" />
              <line x1={PAD_L} x2={W - PAD_R} y1={yOf(g)} y2={yOf(g)} stroke="var(--line)" strokeWidth="1" opacity="0.25" />
              <text x={xOf(g)} y={H - PAD_B + 16} textAnchor="middle" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
              <text x={PAD_L - 6} y={yOf(g) + 3} textAnchor="end" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
            </g>
          ))}
          <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fill="var(--bone-300)" fontSize="10" fontFamily="var(--font-mono)">
            median age at marriage (std)
          </text>
          <text x={14} y={(PAD_T + H - PAD_B) / 2} textAnchor="middle" fill="var(--bone-300)" fontSize="10" fontFamily="var(--font-mono)" transform={`rotate(-90 14 ${(PAD_T + H - PAD_B) / 2})`}>
            divorce rate (std)
          </text>

          {/* naive line, always shown as a faint dashed reference */}
          <line x1={xOf(-RANGE)} y1={yOf(lineY0(fit.naive.a, fit.naive.b, -RANGE))} x2={xOf(RANGE)} y2={yOf(lineY0(fit.naive.a, fit.naive.b, RANGE))} stroke="var(--bone-100)" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.5" />
          {/* active line */}
          <line x1={xOf(-RANGE)} y1={yOf(lineY(-RANGE))} x2={xOf(RANGE)} y2={yOf(lineY(RANGE))} stroke="var(--stat-posterior)" strokeWidth="1.8" />

          {/* per-state error bars + observed and corrected points */}
          {data.A.map((a, i) => {
            const dObs = data.Dobs[i]!
            const se = data.Dse[i]!
            const dTrue = fit.Dtrue[i]!
            return (
              <g key={i}>
                <line x1={xOf(a)} x2={xOf(a)} y1={yOf(dObs - se)} y2={yOf(dObs + se)} stroke="var(--bone-300)" strokeWidth="1" opacity="0.4" />
                {correct ? (
                  <line x1={xOf(a)} y1={yOf(dObs)} x2={xOf(a)} y2={yOf(dTrue)} stroke="var(--brass-400)" strokeWidth="1" opacity="0.5" />
                ) : null}
                <circle cx={xOf(a)} cy={yOf(dObs)} r={2.4} fill="none" stroke="var(--bone-100)" strokeWidth="1.1" opacity="0.75" />
                {correct ? <circle cx={xOf(a)} cy={yOf(dTrue)} r={2.6} fill="var(--stat-posterior)" /> : null}
              </g>
            )
          })}
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        bone bars: ±1 measurement SE · open bone: point estimate · brass: error-corrected value · brass line: {correct ? 'error model' : 'off'} · bone dash: naive fit
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => setCorrect((c) => !c)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          {correct ? 'Ignore the error bars' : 'Account for measurement error'}
        </button>
      </div>

      <p className="mt-4 text-sm text-secondary">
        The bars are as long as the states are small: a handful of divorces in
        Wyoming or Idaho gives an estimate that could be a point higher or lower.
        Regress the dots as if they were exact and those noisy states yank the
        line around. Turn the error model on and each estimate slides toward the
        line by exactly how little it can be trusted — the precise states hold
        still, the noisy ones give way, and the slope settles onto what the
        reliable measurements actually support.
      </p>
    </div>
  )
}

function lineY0(a: number, b: number, x: number): number {
  return a + b * x
}
