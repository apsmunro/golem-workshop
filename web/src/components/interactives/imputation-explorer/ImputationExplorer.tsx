import { useMemo, useState } from 'react'
import { imputeMilk, standardizeMilk } from './engine'
import type { MilkRow } from './engine'

const W = 600
const H = 400
const PAD_L = 44
const PAD_R = 14
const PAD_T = 16
const PAD_B = 44
const R = 2.6

function xOf(x: number): number {
  return PAD_L + ((x + R) / (2 * R)) * (W - PAD_L - PAD_R)
}
function yOf(y: number): number {
  return H - PAD_B - ((y + R) / (2 * R)) * (H - PAD_T - PAD_B)
}

export function ImputationExplorer({ rows }: { rows: MilkRow[] }) {
  const [impute, setImpute] = useState(true)
  const std = useMemo(() => standardizeMilk(rows), [rows])
  const res = useMemo(() => imputeMilk(std), [std])

  const kSlopeComplete = res.completeCase.b[1]
  const kSlopeImputed = res.imputed.b[1]
  const line = res.imputeLine
  const lineY = (x: number) => line.a + line.b * x

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Neocortex is missing for 12 of 29 species</p>
        <p className="font-mono text-xs text-secondary">
          K↞N slope: complete-case {kSlopeComplete.toFixed(2)} · imputed {kSlopeImputed.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Standardized neocortex against body mass; observed species in bone, imputed species in brass on the neocortex-mass line"
        >
          {[-2, -1, 0, 1, 2].map((g) => (
            <g key={g}>
              <line x1={xOf(g)} x2={xOf(g)} y1={PAD_T} y2={H - PAD_B} stroke="var(--line)" strokeWidth="1" opacity="0.22" />
              <line x1={PAD_L} x2={W - PAD_R} y1={yOf(g)} y2={yOf(g)} stroke="var(--line)" strokeWidth="1" opacity="0.22" />
              <text x={xOf(g)} y={H - PAD_B + 16} textAnchor="middle" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
              <text x={PAD_L - 6} y={yOf(g) + 3} textAnchor="end" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">{g}</text>
            </g>
          ))}
          <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fill="var(--bone-300)" fontSize="10" fontFamily="var(--font-mono)">
            body mass, log (std)
          </text>
          <text x={14} y={(PAD_T + H - PAD_B) / 2} textAnchor="middle" fill="var(--bone-300)" fontSize="10" fontFamily="var(--font-mono)" transform={`rotate(-90 14 ${(PAD_T + H - PAD_B) / 2})`}>
            neocortex % (std)
          </text>

          {/* the N ~ M line that carries the imputation */}
          {impute ? (
            <line x1={xOf(-R)} y1={yOf(lineY(-R))} x2={xOf(R)} y2={yOf(lineY(R))} stroke="var(--brass-400)" strokeWidth="1.4" opacity="0.7" />
          ) : null}

          {res.rows.map((row, i) =>
            row.missing ? (
              impute ? (
                <g key={i}>
                  <line x1={xOf(row.M)} x2={xOf(row.M)} y1={yOf(row.N - row.Nse)} y2={yOf(row.N + row.Nse)} stroke="var(--brass-400)" strokeWidth="1" opacity="0.5" />
                  <circle cx={xOf(row.M)} cy={yOf(row.N)} r={R} fill="var(--stat-posterior)" />
                </g>
              ) : (
                // complete-case view: the missing species vanish, mass and all
                <line key={i} x1={xOf(row.M)} x2={xOf(row.M)} y1={H - PAD_B} y2={H - PAD_B + 5} stroke="var(--stat-danger)" strokeWidth="1.4" opacity="0.6" />
              )
            ) : (
              <circle key={i} cx={xOf(row.M)} cy={yOf(row.N)} r={R} fill="none" stroke="var(--bone-100)" strokeWidth="1.2" opacity="0.85" />
            ),
          )}
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        open bone: observed species · {impute ? 'brass: imputed neocortex ±1 residual sd on the N↞M line' : 'clay ticks: the 12 dropped species (their mass thrown away too)'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => setImpute((v) => !v)}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-surface"
        >
          {impute ? 'Drop the incomplete species' : 'Impute the missing neocortex'}
        </button>
        <span className="font-mono text-xs text-secondary">
          n = {impute ? res.nTotal : res.nComplete} of {res.nTotal}
        </span>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Complete-case analysis quietly deletes twelve species — and with them
        twelve perfectly good measurements of kcal and body mass — because one
        column was blank. Imputation keeps them. It reads the neocortex it
        cannot see off the mass it can, since the two run together, and it does
        so with honest uncertainty: the brass bars say how much the guess could
        be wrong. The downstream neocortex effect barely shifts, but it is now
        estimated from twenty-nine species instead of seventeen.
      </p>
    </div>
  )
}
