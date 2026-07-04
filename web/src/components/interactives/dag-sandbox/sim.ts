/**
 * Simulate-from-DAG and the OLS bias readout. Linear-Gaussian structural
 * model: every node is the coefficient-weighted sum of its parents plus
 * unit normal noise. Small and exact on purpose — the point is watching
 * an estimate move as you open and close doors, not realism.
 */
import type { RNG } from '../../../lib/rng'
import type { Dag } from './engine'
import { parents } from './engine'

export type EdgeCoefs = Record<string, number>

export const edgeKey = (from: string, to: string) => `${from}->${to}`

/** Topological order via repeated parent-free extraction. */
export function topoOrder(dag: Dag): string[] {
  const remaining = new Set(dag.nodes)
  const order: string[] = []
  while (remaining.size > 0) {
    const ready = [...remaining].filter((n) =>
      parents(dag, n).every((p) => !remaining.has(p)),
    )
    if (ready.length === 0) throw new Error('topoOrder: graph has a cycle')
    for (const n of ready) {
      order.push(n)
      remaining.delete(n)
    }
  }
  return order
}

/** Draw n joint observations. Missing edge coefficients default to 1. */
export function simulateFromDag(
  dag: Dag,
  n: number,
  rng: RNG,
  coefs: EdgeCoefs = {},
): Record<string, Float64Array> {
  const order = topoOrder(dag)
  const data: Record<string, Float64Array> = {}
  for (const node of order) {
    const col = new Float64Array(n)
    const ps = parents(dag, node)
    for (let i = 0; i < n; i++) {
      let v = rng.normal()
      for (const p of ps) {
        v += (coefs[edgeKey(p, node)] ?? 1) * data[p]![i]!
      }
      col[i] = v
    }
    data[node] = col
  }
  return data
}

/**
 * OLS via normal equations with Gaussian elimination — fine for the
 * handful of predictors a sandbox regression ever has. Returns the
 * coefficient on each predictor (intercept excluded from the result).
 */
export function olsCoefs(
  y: Float64Array,
  predictors: Record<string, Float64Array>,
): Record<string, number> {
  const names = Object.keys(predictors)
  const n = y.length
  const p = names.length + 1 // intercept first
  const X = (i: number, j: number): number =>
    j === 0 ? 1 : predictors[names[j - 1]!]![i]!

  // Build X'X and X'y
  const a: number[][] = Array.from({ length: p }, () => new Array<number>(p + 1).fill(0))
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < p; r++) {
      const xr = X(i, r)
      a[r]![p] = a[r]![p]! + xr * y[i]!
      for (let c = 0; c < p; c++) a[r]![c] = a[r]![c]! + xr * X(i, c)
    }
  }
  // Gaussian elimination with partial pivoting
  for (let col = 0; col < p; col++) {
    let pivot = col
    for (let r = col + 1; r < p; r++) {
      if (Math.abs(a[r]![col]!) > Math.abs(a[pivot]![col]!)) pivot = r
    }
    const tmp = a[col]!
    a[col] = a[pivot]!
    a[pivot] = tmp
    const d = a[col]![col]!
    if (Math.abs(d) < 1e-12) throw new Error('olsCoefs: singular design matrix')
    for (let c = col; c <= p; c++) a[col]![c] = a[col]![c]! / d
    for (let r = 0; r < p; r++) {
      if (r === col) continue
      const f = a[r]![col]!
      for (let c = col; c <= p; c++) a[r]![c] = a[r]![c]! - f * a[col]![c]!
    }
  }
  const out: Record<string, number> = {}
  names.forEach((name, i) => {
    out[name] = a[i + 1]![p]!
  })
  return out
}

export interface BiasReadout {
  /** coefficient on the exposure with no controls */
  unadjusted: number
  /** coefficient on the exposure controlling for the chosen set */
  adjusted: number
  /** the true coefficient on the exposure → outcome edge (0 if absent) */
  truth: number
}

export function biasDemo(
  dag: Dag,
  exposure: string,
  outcome: string,
  conditioned: ReadonlySet<string>,
  n: number,
  rng: RNG,
  coefs: EdgeCoefs = {},
): BiasReadout {
  const data = simulateFromDag(dag, n, rng, coefs)
  const y = data[outcome]!
  const unadjusted = olsCoefs(y, { [exposure]: data[exposure]! })[exposure]!
  const controls: Record<string, Float64Array> = { [exposure]: data[exposure]! }
  for (const c of conditioned) {
    if (c !== exposure && c !== outcome) controls[c] = data[c]!
  }
  const adjusted = olsCoefs(y, controls)[exposure]!
  const hasEdge = dag.edges.some(([f, t]) => f === exposure && t === outcome)
  const truth = hasEdge ? (coefs[edgeKey(exposure, outcome)] ?? 1) : 0
  return { unadjusted, adjusted, truth }
}
