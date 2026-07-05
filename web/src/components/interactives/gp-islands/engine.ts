/**
 * gp-islands engine — the Oceanic-tools Gaussian process, m14.8.
 *
 * Ten Pacific societies at known sea distances. A Gaussian process puts a
 * covariance on their tool-count intercepts that decays with distance:
 *   K_ij = η² · exp(−ρ² · D_ij²),
 * the L2 (squared-exponential) kernel the book calls etasq / rhosq. Near
 * societies share a large covariance and pool toward each other; far ones
 * are almost independent. The magic is that the model learns one smooth
 * function of distance and applies it to every pair at once.
 *
 * We also lay the islands out with classical multidimensional scaling from
 * the distance matrix (a Jacobi eigensolver on the doubly-centered matrix),
 * so the "islands" map is generated from the real distances rather than
 * eyeballed coordinates. Pure logic, no React, no DOM.
 */

export const SOCIETIES = [
  'Malekula',
  'Tikopia',
  'Santa Cruz',
  'Yap',
  'Lau Fiji',
  'Trobriand',
  'Chuuk',
  'Manus',
  'Tonga',
  'Hawaii',
] as const

/** islandsDistMatrix, thousands of km (Statistical Rethinking §14.5). */
export const DIST: number[][] = [
  [0.0, 0.5, 0.6, 4.4, 1.2, 2.0, 3.2, 2.8, 1.9, 5.7],
  [0.5, 0.0, 0.3, 4.2, 1.2, 2.0, 2.9, 2.7, 2.0, 5.3],
  [0.6, 0.3, 0.0, 3.9, 1.6, 1.7, 2.6, 2.4, 2.3, 5.4],
  [4.4, 4.2, 3.9, 0.0, 5.5, 2.5, 1.6, 1.6, 6.1, 7.2],
  [1.2, 1.2, 1.6, 5.5, 0.0, 3.2, 4.0, 3.9, 0.8, 4.9],
  [2.0, 2.0, 1.7, 2.5, 3.2, 0.0, 1.8, 0.8, 3.9, 6.7],
  [3.2, 2.9, 2.6, 1.6, 4.0, 1.8, 0.0, 1.2, 4.8, 5.8],
  [2.8, 2.7, 2.4, 1.6, 3.9, 0.8, 1.2, 0.0, 4.6, 6.7],
  [1.9, 2.0, 2.3, 6.1, 0.8, 3.9, 4.8, 4.6, 0.0, 5.0],
  [5.7, 5.3, 5.4, 7.2, 4.9, 6.7, 5.8, 6.7, 5.0, 0.0],
]

/** total_tools and population from Kline, in society order. */
export const TOOLS = [13, 22, 24, 43, 33, 19, 40, 28, 55, 71]
export const POPULATION = [1100, 1500, 3600, 4791, 7400, 8000, 9200, 13000, 17500, 275000]

/** The squared-exponential kernel as a function of distance. */
export function kernel(etasq: number, rhosq: number): (d: number) => number {
  return (d) => etasq * Math.exp(-rhosq * d * d)
}

/** 10×10 covariance from the kernel; adds a small diagonal for identifiability. */
export function covarianceMatrix(etasq: number, rhosq: number, jitter = 0.01): number[][] {
  const k = kernel(etasq, rhosq)
  return DIST.map((row, i) =>
    row.map((d, j) => (i === j ? etasq + jitter : k(d))),
  )
}

/** Correlation matrix from the covariance. */
export function correlationMatrix(etasq: number, rhosq: number): number[][] {
  const K = covarianceMatrix(etasq, rhosq)
  const n = K.length
  const out = K.map((r) => r.slice())
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out[i]![j] = K[i]![j]! / Math.sqrt(K[i]![i]! * K[j]![j]!)
    }
  }
  return out
}

/**
 * Jacobi eigenvalue algorithm for a symmetric matrix. Returns eigenvalues
 * and eigenvectors (columns), unsorted. Small n, so O(n³·sweeps) is fine.
 */
export function jacobiEigen(
  input: number[][],
): { values: number[]; vectors: number[][] } {
  const n = input.length
  const a = input.map((r) => r.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )
  for (let sweep = 0; sweep < 100; sweep++) {
    // largest off-diagonal magnitude
    let off = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i]![j]! * a[i]![j]!
    if (off < 1e-18) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p]![q]!) < 1e-15) continue
        const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let i = 0; i < n; i++) {
          const aip = a[i]![p]!
          const aiq = a[i]![q]!
          a[i]![p] = c * aip - s * aiq
          a[i]![q] = s * aip + c * aiq
        }
        for (let i = 0; i < n; i++) {
          const api = a[p]![i]!
          const aqi = a[q]![i]!
          a[p]![i] = c * api - s * aqi
          a[q]![i] = s * api + c * aqi
        }
        for (let i = 0; i < n; i++) {
          const vip = v[i]![p]!
          const viq = v[i]![q]!
          v[i]![p] = c * vip - s * viq
          v[i]![q] = s * vip + c * viq
        }
      }
    }
  }
  const values = a.map((r, i) => r[i]!)
  return { values, vectors: v }
}

/** Classical MDS: place the societies in 2-D from the distance matrix. */
export function mdsLayout(): { x: number; y: number }[] {
  const n = DIST.length
  // squared distances, doubly centered: B = -1/2 J D² J
  const d2 = DIST.map((r) => r.map((d) => d * d))
  const rowMean = d2.map((r) => r.reduce((s, x) => s + x, 0) / n)
  const grand = rowMean.reduce((s, x) => s + x, 0) / n
  const B = d2.map((r, i) =>
    r.map((x, j) => -0.5 * (x - rowMean[i]! - rowMean[j]! + grand)),
  )
  const { values, vectors } = jacobiEigen(B)
  const order = values.map((val, i) => ({ val, i })).sort((p, q) => q.val - p.val)
  const [e1, e2] = [order[0]!, order[1]!]
  const s1 = Math.sqrt(Math.max(e1.val, 0))
  const s2 = Math.sqrt(Math.max(e2.val, 0))
  return Array.from({ length: n }, (_, k) => ({
    x: vectors[k]![e1.i]! * s1,
    y: vectors[k]![e2.i]! * s2,
  }))
}
