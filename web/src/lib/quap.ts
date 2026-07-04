/**
 * quap.ts — quadratic approximation of a posterior, the engine the book
 * itself uses for chapters 4–8. Find the MAP by Nelder–Mead, measure the
 * curvature there with a numeric Hessian, and treat the posterior as
 * multivariate normal. Draws come from that MVN via Cholesky.
 *
 * This is not a stand-in hack: for these chapters it is the method.
 * Precomputed brms artifacts replace it chapter by chapter once the
 * r-pipeline runs (see r-pipeline/README.md).
 */
import type { RNG } from './rng'

export type LogPost = (theta: readonly number[]) => number

/** Nelder–Mead maximization. Deterministic; no RNG involved. */
export function nelderMead(
  f: LogPost,
  start: readonly number[],
  opts: { maxIter?: number; tol?: number; step?: number } = {},
): { x: number[]; fx: number } {
  const n = start.length
  const maxIter = opts.maxIter ?? 2000
  const tol = opts.tol ?? 1e-10
  const step = opts.step ?? 0.5

  // simplex of n+1 points
  let simplex: { x: number[]; fx: number }[] = [
    { x: [...start], fx: f(start) },
  ]
  for (let i = 0; i < n; i++) {
    const x = [...start]
    x[i] = x[i]! + step
    simplex.push({ x, fx: f(x) })
  }

  for (let iter = 0; iter < maxIter; iter++) {
    simplex.sort((a, b) => b.fx - a.fx) // best first (maximizing)
    const best = simplex[0]!
    const worst = simplex[n]!
    if (Math.abs(best.fx - worst.fx) < tol) break

    // centroid of all but worst
    const centroid = new Array<number>(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) centroid[j] = centroid[j]! + simplex[i]!.x[j]! / n
    }

    const at = (coef: number): { x: number[]; fx: number } => {
      const x = centroid.map((c, j) => c + coef * (c - worst.x[j]!))
      return { x, fx: f(x) }
    }

    const reflected = at(1)
    if (reflected.fx > best.fx) {
      const expanded = at(2)
      simplex[n] = expanded.fx > reflected.fx ? expanded : reflected
    } else if (reflected.fx > simplex[n - 1]!.fx) {
      simplex[n] = reflected
    } else {
      const contracted = at(reflected.fx > worst.fx ? 0.5 : -0.5)
      if (contracted.fx > Math.max(worst.fx, reflected.fx)) {
        simplex[n] = contracted
      } else {
        // shrink toward best
        simplex = simplex.map((p, i) =>
          i === 0
            ? p
            : (() => {
                const x = p.x.map((v, j) => best.x[j]! + 0.5 * (v - best.x[j]!))
                return { x, fx: f(x) }
              })(),
        )
      }
    }
  }
  simplex.sort((a, b) => b.fx - a.fx)
  return simplex[0]!
}

/** Central-difference Hessian of f at x. */
export function numericHessian(f: LogPost, x: readonly number[]): number[][] {
  const n = x.length
  const h = x.map((v) => 1e-4 * Math.max(1, Math.abs(v)))
  const H: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const fx = f(x)
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        const xp = [...x]
        const xm = [...x]
        xp[i] = xp[i]! + h[i]!
        xm[i] = xm[i]! - h[i]!
        H[i]![i] = (f(xp) - 2 * fx + f(xm)) / (h[i]! * h[i]!)
      } else {
        const xpp = [...x]
        const xpm = [...x]
        const xmp = [...x]
        const xmm = [...x]
        xpp[i] = xpp[i]! + h[i]!
        xpp[j] = xpp[j]! + h[j]!
        xpm[i] = xpm[i]! + h[i]!
        xpm[j] = xpm[j]! - h[j]!
        xmp[i] = xmp[i]! - h[i]!
        xmp[j] = xmp[j]! + h[j]!
        xmm[i] = xmm[i]! - h[i]!
        xmm[j] = xmm[j]! - h[j]!
        const v = (f(xpp) - f(xpm) - f(xmp) + f(xmm)) / (4 * h[i]! * h[j]!)
        H[i]![j] = v
        H[j]![i] = v
      }
    }
  }
  return H
}

/** Invert a small symmetric matrix by Gauss–Jordan. */
export function invertMatrix(m: readonly (readonly number[])[]): number[][] {
  const n = m.length
  const a = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r]![col]!) > Math.abs(a[pivot]![col]!)) pivot = r
    }
    const tmp = a[col]!
    a[col] = a[pivot]!
    a[pivot] = tmp
    const d = a[col]![col]!
    if (Math.abs(d) < 1e-14) throw new Error('invertMatrix: singular')
    for (let c = 0; c < 2 * n; c++) a[col]![c] = a[col]![c]! / d
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = a[r]![col]!
      for (let c = 0; c < 2 * n; c++) a[r]![c] = a[r]![c]! - f * a[col]![c]!
    }
  }
  return a.map((row) => row.slice(n))
}

/** Cholesky factor L with LLᵀ = m (m symmetric positive definite). */
export function cholesky(m: readonly (readonly number[])[]): number[][] {
  const n = m.length
  const L: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = m[i]![j]!
      for (let k = 0; k < j; k++) sum -= L[i]![k]! * L[j]![k]!
      if (i === j) {
        if (sum <= 0) throw new Error('cholesky: matrix not positive definite')
        L[i]![i] = Math.sqrt(sum)
      } else {
        L[i]![j] = sum / L[j]![j]!
      }
    }
  }
  return L
}

export interface QuapFit {
  names: string[]
  /** MAP estimate */
  mode: number[]
  /** posterior covariance (inverse negative Hessian at the mode) */
  cov: number[][]
  /** marginal posterior standard deviations */
  sd: number[]
  /** draw n samples from the MVN approximation */
  draws: (n: number, rng: RNG) => Record<string, Float64Array>
}

export function quap(
  logPost: LogPost,
  start: readonly number[],
  names: readonly string[],
): QuapFit {
  const { x: mode } = nelderMead(logPost, start)
  const H = numericHessian(logPost, mode)
  const negH = H.map((row) => row.map((v) => -v))
  const cov = invertMatrix(negH)
  const sd = cov.map((row, i) => Math.sqrt(row[i]!))
  const L = cholesky(cov)
  const k = mode.length

  return {
    names: [...names],
    mode,
    cov,
    sd,
    draws: (n, rng) => {
      const out: Record<string, Float64Array> = {}
      for (const name of names) out[name] = new Float64Array(n)
      const z = new Array<number>(k)
      for (let s = 0; s < n; s++) {
        for (let i = 0; i < k; i++) z[i] = rng.normal()
        for (let i = 0; i < k; i++) {
          let v = mode[i]!
          for (let j = 0; j <= i; j++) v += L[i]![j]! * z[j]!
          out[names[i]!]![s] = v
        }
      }
      return out
    },
  }
}

/** log N(x | mu, sd) */
export function dnormLog(x: number, mu: number, sd: number): number {
  const z = (x - mu) / sd
  return -0.5 * z * z - Math.log(sd) - 0.9189385332046727
}
