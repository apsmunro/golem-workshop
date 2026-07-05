/**
 * entropy-pebbles engine — counting the ways pebbles can land.
 *
 * Multiplicity is exact (log factorials as summed logs; N stays small),
 * entropy is Shannon's, and the constrained-maximum distribution comes
 * from the exponential-family solution p_i ∝ exp(λ·v_i) with λ found by
 * bisection. Tested against the book's five-bucket table (W = 1, 90,
 * 1260, 37800, 113400) and against uniform/degenerate limits.
 */

/** log(n!) as a plain sum of logs; exact enough for n ≤ a few hundred. */
export function logFactorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`logFactorial expects a non-negative integer, got ${n}`)
  }
  let s = 0
  for (let k = 2; k <= n; k++) s += Math.log(k)
  return s
}

/** log of the multinomial multiplicity N! / ∏ nᵢ!. */
export function logMultiplicity(counts: readonly number[]): number {
  const n = counts.reduce((a, b) => a + b, 0)
  let s = logFactorial(n)
  for (const c of counts) s -= logFactorial(c)
  return s
}

/** Shannon entropy of a probability vector, in nats. 0·log 0 = 0. */
export function entropy(probs: readonly number[]): number {
  let h = 0
  for (const p of probs) {
    if (p < 0) throw new RangeError('entropy expects non-negative probabilities')
    if (p > 0) h -= p * Math.log(p)
  }
  return h
}

/** Normalize counts to probabilities; all-zero counts give all-zero probs. */
export function normalize(counts: readonly number[]): number[] {
  const n = counts.reduce((a, b) => a + b, 0)
  return n === 0 ? counts.map(() => 0) : counts.map((c) => c / n)
}

/** Expected value of `values` under probabilities from `counts`. */
export function meanValue(counts: readonly number[], values: readonly number[]): number {
  const p = normalize(counts)
  let m = 0
  for (let i = 0; i < p.length; i++) m += p[i]! * values[i]!
  return m
}

/**
 * The maximum-entropy distribution over `values` with a fixed mean:
 * p_i ∝ exp(λ·v_i), λ solved by bisection. mean at the boundary values
 * returns the degenerate distribution; mean at the midpoint returns
 * uniform (λ = 0).
 */
export function maxentWithMean(values: readonly number[], mean: number): number[] {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (mean <= lo) return values.map((v) => (v === lo ? 1 : 0))
  if (mean >= hi) return values.map((v) => (v === hi ? 1 : 0))

  const meanAt = (lambda: number): number => {
    // subtract max exponent for stability
    const exps = values.map((v) => lambda * v)
    const m = Math.max(...exps)
    const w = exps.map((e) => Math.exp(e - m))
    const z = w.reduce((a, b) => a + b, 0)
    let mu = 0
    for (let i = 0; i < values.length; i++) mu += (w[i]! / z) * values[i]!
    return mu
  }

  let a = -50
  let b = 50
  for (let iter = 0; iter < 200; iter++) {
    const mid = (a + b) / 2
    if (meanAt(mid) < mean) a = mid
    else b = mid
  }
  const lambda = (a + b) / 2
  const exps = values.map((v) => lambda * v)
  const mx = Math.max(...exps)
  const w = exps.map((e) => Math.exp(e - mx))
  const z = w.reduce((a2, b2) => a2 + b2, 0)
  return w.map((x) => x / z)
}

export interface Preset {
  name: string
  counts: number[]
}

/** The book's five ways to land 10 pebbles in 5 buckets (figure 10.1). */
export const PRESETS: Preset[] = [
  { name: 'A', counts: [0, 0, 10, 0, 0] },
  { name: 'B', counts: [0, 1, 8, 1, 0] },
  { name: 'C', counts: [0, 2, 6, 2, 0] },
  { name: 'D', counts: [1, 2, 4, 2, 1] },
  { name: 'E', counts: [2, 2, 2, 2, 2] },
]

export const BUCKETS = 5
export const POUCH = 10
