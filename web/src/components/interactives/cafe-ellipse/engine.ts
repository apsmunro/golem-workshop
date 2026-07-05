/**
 * cafe-ellipse engine — correlated varying effects, the m14.1 cafés.
 *
 * Each café has two numbers: its morning wait (an intercept) and how much
 * longer the afternoon takes (a slope). Across cafés these co-vary — the
 * popular places are slow in the morning *and* swing hardest in the
 * afternoon — so the adaptive prior is a 2-D Gaussian with a correlation,
 * not two independent ones.
 *
 * Partial pooling in two dimensions shrinks each noisy café estimate toward
 * that tilted ellipse. With the Gaussian conjugate update the shrunk point
 * is exact:
 *   θ̂ = (Σ⁻¹ + S⁻¹)⁻¹ (Σ⁻¹ μ + S⁻¹ x̂),
 * where μ, Σ are the population mean and covariance (the sliders), S is the
 * café's sampling covariance, and x̂ its raw estimate. When Σ carries a
 * negative correlation the shrinkage tilts along the ellipse: knowing a
 * café is slow in the morning tells you something about its afternoon.
 *
 * Pure logic, no React, no DOM. 2×2 linear algebra kept local and explicit.
 */
import { RNG } from '../../../lib/rng'

export type Vec2 = [number, number]
/** row-major 2×2: [[a, b], [c, d]] */
export type Mat2 = [number, number, number, number]

export function covMatrix(sigmaA: number, sigmaB: number, rho: number): Mat2 {
  const cab = rho * sigmaA * sigmaB
  return [sigmaA * sigmaA, cab, cab, sigmaB * sigmaB]
}

export function inv2([a, b, c, d]: Mat2): Mat2 {
  const det = a * d - b * c
  if (Math.abs(det) < 1e-12) throw new RangeError('singular 2×2 matrix')
  const inv = 1 / det
  return [d * inv, -b * inv, -c * inv, a * inv]
}

export function add2(m: Mat2, n: Mat2): Mat2 {
  return [m[0] + n[0], m[1] + n[1], m[2] + n[2], m[3] + n[3]]
}

export function matVec([a, b, c, d]: Mat2, [x, y]: Vec2): Vec2 {
  return [a * x + b * y, c * x + d * y]
}

/** Lower-triangular Cholesky factor L with M = L Lᵀ, for MVN sampling. */
export function chol2([a, b, , d]: Mat2): Mat2 {
  const l11 = Math.sqrt(a)
  const l21 = b / l11
  const l22 = Math.sqrt(Math.max(d - l21 * l21, 0))
  return [l11, 0, l21, l22]
}

export function sampleMvn(rng: RNG, mean: Vec2, cov: Mat2): Vec2 {
  const L = chol2(cov)
  const z: Vec2 = [rng.normal(), rng.normal()]
  const [lx, ly] = matVec(L, z)
  return [mean[0] + lx, mean[1] + ly]
}

export interface EllipseAxes {
  /** rotation of the major axis, radians. */
  angle: number
  /** half-length of the major axis at the given number of sd. */
  major: number
  /** half-length of the minor axis. */
  minor: number
}

/** Eigen-decomposition of a symmetric 2×2 covariance → ellipse geometry. */
export function ellipseAxes(cov: Mat2, nSd = 1): EllipseAxes {
  const [a, b, , d] = cov
  const tr = a + d
  const det = a * d - b * b
  const disc = Math.sqrt(Math.max(tr * tr / 4 - det, 0))
  const l1 = tr / 2 + disc
  const l2 = tr / 2 - disc
  // eigenvector of the larger eigenvalue
  const angle = Math.abs(b) < 1e-12 ? (a >= d ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b)
  return { angle, major: nSd * Math.sqrt(Math.max(l1, 0)), minor: nSd * Math.sqrt(Math.max(l2, 0)) }
}

/** Gaussian conjugate posterior mean: shrink a raw estimate toward (μ, Σ). */
export function shrink(raw: Vec2, samplingCov: Mat2, priorMean: Vec2, priorCov: Mat2): Vec2 {
  const priorPrec = inv2(priorCov)
  const dataPrec = inv2(samplingCov)
  const postCov = inv2(add2(priorPrec, dataPrec))
  const rhs: Vec2 = [
    matVec(priorPrec, priorMean)[0] + matVec(dataPrec, raw)[0],
    matVec(priorPrec, priorMean)[1] + matVec(dataPrec, raw)[1],
  ]
  return matVec(postCov, rhs)
}

export interface Cafe {
  id: number
  /** the (unobserved) true varying effect. */
  truth: Vec2
  /** the noisy raw estimate from this café's own visits. */
  raw: Vec2
}

/** The true café world, matching the m14.1 simulation's parameters. */
export const TRUTH = {
  mean: [3.5, -1] as Vec2,
  sigmaA: 1,
  sigmaB: 0.5,
  rho: -0.7,
}

/** Sampling covariance of one café's raw estimate — chosen so the geometry reads. */
export const SAMPLING_COV: Mat2 = [0.4, 0, 0, 0.55]

/** Simulate n cafés: true effects from the true MVN, plus sampling noise. */
export function simulateCafes(n = 20, seed = 1959): Cafe[] {
  const rng = new RNG(seed, 41)
  const trueCov = covMatrix(TRUTH.sigmaA, TRUTH.sigmaB, TRUTH.rho)
  const out: Cafe[] = []
  for (let i = 0; i < n; i++) {
    const truth = sampleMvn(rng, TRUTH.mean, trueCov)
    const raw = sampleMvn(rng, truth, SAMPLING_COV)
    out.push({ id: i + 1, truth, raw })
  }
  return out
}

export interface PooledCafe extends Cafe {
  pooled: Vec2
}

/** Apply the user's adaptive prior to every café's raw estimate. */
export function poolCafes(
  cafes: readonly Cafe[],
  priorMean: Vec2,
  priorCov: Mat2,
): PooledCafe[] {
  return cafes.map((c) => ({
    ...c,
    pooled: shrink(c.raw, SAMPLING_COV, priorMean, priorCov),
  }))
}
