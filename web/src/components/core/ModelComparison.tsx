/**
 * ModelComparison — the house table for ranking golems by an
 * out-of-sample score (LOO, WAIC, or exact CV — the caller says which).
 * Rows arrive already scored; this component only renders. Reused from
 * chapter 7 onward, including T3 artifact comparisons.
 */
export interface ModelComparisonRow {
  label: string
  score: number
  delta: number
  weight: number
  /** optional penalty / effective-parameter column */
  penalty?: number
}

interface ModelComparisonProps {
  rows: ModelComparisonRow[]
  /** name of the score column, e.g. "LOO deviance" */
  scoreName: string
  /** name of the penalty column when present, e.g. "pLOO" */
  penaltyName?: string | undefined
  /** label to highlight (the learner's pick) */
  marked?: string | undefined
}

export function ModelComparison({ rows, scoreName, penaltyName, marked }: ModelComparisonProps) {
  if (rows.length === 0) return null
  const hasPenalty = rows.some((r) => r.penalty !== undefined)
  const maxWeight = Math.max(...rows.map((r) => r.weight))
  return (
    <table className="w-full border-collapse font-mono text-sm tabular-nums">
      <thead>
        <tr className="border-b border-line text-left text-xs text-secondary">
          <th className="py-2 pr-4 font-normal">model</th>
          <th className="py-2 pr-4 text-right font-normal">{scoreName}</th>
          <th className="py-2 pr-4 text-right font-normal">Δ</th>
          {hasPenalty ? (
            <th className="py-2 pr-4 text-right font-normal">{penaltyName ?? 'penalty'}</th>
          ) : null}
          <th className="py-2 font-normal">weight</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-line">
            <td className={`py-2 pr-4 ${r.label === marked ? 'text-accent-bright' : ''}`}>
              {r.label}
              {r.label === marked ? ' ◆' : ''}
            </td>
            <td className="py-2 pr-4 text-right">{r.score.toFixed(1)}</td>
            <td className="py-2 pr-4 text-right text-secondary">
              {r.delta === 0 ? '—' : r.delta.toFixed(1)}
            </td>
            {hasPenalty ? (
              <td className="py-2 pr-4 text-right text-secondary">
                {r.penalty === undefined ? '' : r.penalty.toFixed(1)}
              </td>
            ) : null}
            <td className="py-2">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-[3px] bg-(--brass-400)"
                  style={{ width: `${Math.max(2, (r.weight / maxWeight) * 72)}px` }}
                  aria-hidden="true"
                />
                {r.weight.toFixed(2)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
