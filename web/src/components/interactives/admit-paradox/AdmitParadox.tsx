import { useEffect, useMemo, useState } from 'react'
import { artifactDraws, loadArtifact } from '../../../lib/posterior-artifact'
import { HOUSE_SEED, RNG } from '../../../lib/rng'
import { kde, mean, percentileInterval } from '../../../lib/stats'
import { invLogit } from '../link-morpher/engine'
import {
  admitRows,
  directContrast,
  fitDirect,
  fitTotal,
  totalContrast,
} from './engine'
import type { AdmitContrast, AdmitRow } from './engine'

/**
 * The real m11.7/m11.8 brms draws, when deployed. brms codes the direct
 * model as `0 + gid + dept`, which pins department A's offset at zero —
 * the engine's contrast math expects a dA column, so one is supplied.
 * Throws when either artifact is missing; the caller falls back to quap.
 */
async function loadAdmitDraws(): Promise<{
  total: Record<string, Float64Array>
  direct: Record<string, Float64Array>
}> {
  const [total, direct] = await Promise.all([
    loadArtifact('m11.7'),
    loadArtifact('m11.8'),
  ])
  const t = artifactDraws(total)
  const d = artifactDraws(direct)
  if (!t['aM'] || !t['aF'] || !d['aM'] || !d['aF']) {
    throw new Error('admit artifacts missing gender params')
  }
  d['dA'] = new Float64Array(d['aM'].length) // reference department
  return { total: t, direct: d }
}

type Model = 'total' | 'direct'

const W = 620
const H = 260
const DENS_H = 130
const DEPTS = ['A', 'B', 'C', 'D', 'E', 'F']

interface FitState {
  rows: AdmitRow[]
  totalDraws: Record<string, Float64Array>
  directDraws: Record<string, Float64Array>
  contrasts: Record<Model, AdmitContrast>
}

export function AdmitParadox() {
  const [state, setState] = useState<FitState | null>(null)
  const [model, setModel] = useState<Model>('total')

  useEffect(() => {
    let cancelled = false
    void fetch(`${import.meta.env.BASE_URL}data/datasets/UCBadmit.csv`)
      .then((r) => r.text())
      .then(async (csv) => {
        if (cancelled) return
        const rows = admitRows(csv)
        let totalDraws: Record<string, Float64Array>
        let directDraws: Record<string, Float64Array>
        try {
          // real brms draws when the artifacts are deployed
          const admit = await loadAdmitDraws()
          totalDraws = admit.total
          directDraws = admit.direct
        } catch {
          totalDraws = fitTotal(rows).draws(2000, new RNG(HOUSE_SEED, 21))
          directDraws = fitDirect(rows).draws(2000, new RNG(HOUSE_SEED, 22))
        }
        if (cancelled) return
        setState({
          rows,
          totalDraws,
          directDraws,
          contrasts: {
            total: totalContrast(totalDraws),
            direct: directContrast(directDraws, rows),
          },
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const predicted = useMemo(() => {
    if (!state) return null
    const draws = model === 'total' ? state.totalDraws : state.directDraws
    const n = draws.aM!.length
    return state.rows.map((r) => {
      const a = r.male ? draws.aM! : draws.aF!
      const d = model === 'direct' ? draws[`d${r.dept}`]! : null
      const ps = new Float64Array(n)
      for (let s = 0; s < n; s++) ps[s] = invLogit(a[s]! + (d ? d[s]! : 0))
      const sorted = [...ps].sort((x, y) => x - y)
      return {
        row: r,
        mean: ps.reduce((s2, v) => s2 + v, 0) / n,
        lo: sorted[Math.floor(0.055 * n)]!,
        hi: sorted[Math.floor(0.945 * n)]!,
      }
    })
  }, [state, model])

  if (!state || !predicted) {
    return <p className="text-sm text-secondary">Reading 4,526 applications…</p>
  }

  const contrast = state.contrasts[model]
  const fooled = model === 'total'
  const contrastColor = fooled ? 'var(--stat-danger)' : 'var(--stat-posterior)'

  const colW = (W - 70) / 6
  const cx = (dept: string, male: boolean) =>
    56 + DEPTS.indexOf(dept) * colW + colW * (male ? 0.32 : 0.68)
  const cy = (p: number) => 16 + (1 - p) * (H - 56)

  const dens = kde(contrast.logOdds, { n: 96 })
  const dLo = Math.min(...dens.x, 0)
  const dHi = Math.max(...dens.x, 0.8)
  const dMaxY = Math.max(...dens.y)
  const dx = (v: number) => 16 + ((v - dLo) / (dHi - dLo)) * (W - 32)
  const dy = (v: number) => 12 + (1 - v / dMaxY) * (DENS_H - 44)
  const densPath = dens.x
    .map((v, k) => `${k === 0 ? 'M' : 'L'}${dx(v).toFixed(1)},${dy(dens.y[k]!).toFixed(1)}`)
    .join(' ')
  const pi = percentileInterval(contrast.logOdds, 0.89)
  const probPts = mean(contrast.prob) * 100

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Who does Berkeley admit?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModel('total')}
            className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
              model === 'total'
                ? 'border-accent text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            gender only
          </button>
          <button
            type="button"
            onClick={() => setModel('direct')}
            className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
              model === 'direct'
                ? 'border-accent text-accent-bright'
                : 'border-line text-secondary hover:border-accent'
            }`}
          >
            condition on department
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Admission rates by department and gender, data versus model"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line
                x1={48}
                x2={W - 10}
                y1={cy(p)}
                y2={cy(p)}
                stroke="var(--line)"
                strokeWidth="1"
                opacity="0.45"
              />
              <text
                x={42}
                y={cy(p) + 3}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {p}
              </text>
            </g>
          ))}
          {DEPTS.map((dept) => {
            const m = state.rows.find((r) => r.dept === dept && r.male)!
            const f = state.rows.find((r) => r.dept === dept && !r.male)!
            return (
              <g key={dept}>
                <text
                  x={56 + DEPTS.indexOf(dept) * colW + colW / 2}
                  y={H - 22}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  {dept}
                </text>
                <line
                  x1={cx(dept, true)}
                  y1={cy(m.admit / m.applications)}
                  x2={cx(dept, false)}
                  y2={cy(f.admit / f.applications)}
                  stroke="var(--stat-data)"
                  strokeWidth="0.7"
                  opacity="0.5"
                />
              </g>
            )
          })}
          {predicted.map(({ row, mean: pm, lo, hi }) => (
            <g key={`${row.dept}-${row.male}`}>
              <line
                x1={cx(row.dept, row.male)}
                x2={cx(row.dept, row.male)}
                y1={cy(hi)}
                y2={cy(lo)}
                stroke="var(--stat-posterior)"
                strokeWidth="1"
                opacity="0.75"
              />
              <line
                x1={cx(row.dept, row.male) - 5}
                x2={cx(row.dept, row.male) + 5}
                y1={cy(pm)}
                y2={cy(pm)}
                stroke="var(--stat-posterior)"
                strokeWidth="1.5"
              />
            </g>
          ))}
          {state.rows.map((r) => {
            const rate = r.admit / r.applications
            const rad = 2.5 + Math.sqrt(r.applications) / 7
            return r.male ? (
              <circle
                key={`${r.dept}-m`}
                cx={cx(r.dept, true)}
                cy={cy(rate)}
                r={rad}
                fill="var(--stat-data)"
                opacity="0.9"
              />
            ) : (
              <circle
                key={`${r.dept}-f`}
                cx={cx(r.dept, false)}
                cy={cy(rate)}
                r={rad}
                fill="none"
                stroke="var(--stat-data)"
                strokeWidth="1.4"
              />
            )
          })}
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-secondary">
        filled = men, ring = women, area ∝ applications · brass dash = model's
        expected rate, whisker = 89% PI
      </p>

      <div className="mt-4 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${DENS_H}`}
          className="w-full"
          role="img"
          aria-label="Posterior contrast: male minus female log-odds of admission"
        >
          <line x1={dx(0)} x2={dx(0)} y1={8} y2={DENS_H - 30} stroke="var(--line)" strokeWidth="1" />
          <path
            d={`${densPath} L${dx(dens.x[dens.x.length - 1]!).toFixed(1)},${dy(0).toFixed(1)} L${dx(dens.x[0]!).toFixed(1)},${dy(0).toFixed(1)} Z`}
            fill={contrastColor}
            opacity="0.08"
          />
          <path d={densPath} fill="none" stroke={contrastColor} strokeWidth="1.5" />
          <text
            x={W / 2}
            y={DENS_H - 10}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            male − female, log-odds of admission
          </text>
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs">
        <span className="text-secondary">contrast 89% PI: </span>
        <span style={{ color: contrastColor }}>
          [{pi[0].toFixed(2)}, {pi[1].toFixed(2)}]
        </span>
        <span className="ml-4 text-secondary">on the admission scale: </span>
        <span style={{ color: contrastColor }}>
          {probPts >= 0 ? '+' : ''}
          {probPts.toFixed(1)} points
        </span>
        <span className="ml-4 text-secondary">
          {fooled
            ? '— the total effect, routed through department choice'
            : '— the direct effect, once department is held still'}
        </span>
      </p>
    </div>
  )
}
