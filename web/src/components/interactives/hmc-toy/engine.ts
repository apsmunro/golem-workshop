/**
 * HMC engine. Pure logic, no React, no DOM.
 *
 * Standard leapfrog integrator with identity mass matrix, Metropolis
 * accept on the energy error, and Stan's (simplified) divergence rule:
 * a trajectory diverges when |ΔH| exceeds 50 or the energy stops being
 * finite. Two analytic targets: a correlated bivariate Gaussian and the
 * 2D Neal funnel (shipped now, starring again in chapter 13).
 */
import type { RNG } from '../../../lib/rng'

export type Vec2 = [number, number]

export interface TargetDist {
  id: string
  name: string
  logDensity: (q: Vec2) => number
  /** gradient of the LOG density (not its negative) */
  grad: (q: Vec2) => Vec2
  xRange: [number, number]
  yRange: [number, number]
}

/** N(0, Σ) with unit variances and correlation rho. */
export function correlatedGaussian(rho: number): TargetDist {
  if (rho <= -1 || rho >= 1) throw new RangeError(`rho must be in (−1, 1), got ${rho}`)
  const det = 1 - rho * rho
  return {
    id: `gaussian-${rho}`,
    name: rho === 0 ? 'round bowl' : 'the ridge',
    logDensity: ([x, y]) => -0.5 * (x * x - 2 * rho * x * y + y * y) / det,
    grad: ([x, y]) => [-(x - rho * y) / det, -(y - rho * x) / det],
    xRange: [-3.2, 3.2],
    yRange: [-3.2, 3.2],
  }
}

/**
 * Neal's funnel in 2D: v ~ N(0, 3), x ~ N(0, exp(v/2)).
 * q = [x, v] so the funnel opens upward on the canvas.
 */
export function funnel(): TargetDist {
  return {
    id: 'funnel',
    name: "Neal's funnel",
    logDensity: ([x, v]) => -(v * v) / 18 - (x * x) / (2 * Math.exp(v)) - v / 2,
    grad: ([x, v]) => [
      -x * Math.exp(-v),
      -v / 9 + (x * x * Math.exp(-v)) / 2 - 0.5,
    ],
    xRange: [-8, 8],
    yRange: [-7, 5],
  }
}

export const DIVERGENCE_THRESHOLD = 50

export interface LeapfrogPoint {
  q: Vec2
  /** Hamiltonian at this point (potential + kinetic) */
  H: number
}

export interface Trajectory {
  points: LeapfrogPoint[]
  q0: Vec2
  q1: Vec2
  accepted: boolean
  divergent: boolean
  deltaH: number
  acceptProb: number
}

function hamiltonian(target: TargetDist, q: Vec2, p: Vec2): number {
  return -target.logDensity(q) + 0.5 * (p[0] * p[0] + p[1] * p[1])
}

/**
 * One HMC transition from q0. The full leapfrog path is returned so the
 * view can animate it. Integration stops early if energy goes non-finite.
 */
export function hmcStep(
  target: TargetDist,
  q0: Vec2,
  eps: number,
  L: number,
  rng: RNG,
): Trajectory {
  if (eps <= 0) throw new RangeError(`eps must be positive, got ${eps}`)
  if (!Number.isInteger(L) || L < 1) throw new RangeError(`L must be a positive integer, got ${L}`)

  const p0: Vec2 = [rng.normal(), rng.normal()]
  const H0 = hamiltonian(target, q0, p0)
  const points: LeapfrogPoint[] = [{ q: [...q0] as Vec2, H: H0 }]

  let q: Vec2 = [...q0] as Vec2
  let p: Vec2 = [...p0] as Vec2
  let divergent = false
  let H = H0

  for (let step = 0; step < L; step++) {
    let g = target.grad(q)
    p = [p[0] + 0.5 * eps * g[0], p[1] + 0.5 * eps * g[1]]
    q = [q[0] + eps * p[0], q[1] + eps * p[1]]
    g = target.grad(q)
    p = [p[0] + 0.5 * eps * g[0], p[1] + 0.5 * eps * g[1]]
    H = hamiltonian(target, q, p)
    if (!Number.isFinite(H) || Math.abs(H - H0) > DIVERGENCE_THRESHOLD) {
      divergent = true
      points.push({ q: [...q] as Vec2, H })
      break
    }
    points.push({ q: [...q] as Vec2, H })
  }

  const deltaH = Number.isFinite(H) ? H - H0 : Infinity
  const acceptProb = divergent ? 0 : Math.min(1, Math.exp(-deltaH))
  const accepted = !divergent && rng.uniform() < acceptProb
  return {
    points,
    q0: [...q0] as Vec2,
    q1: accepted ? ([...q] as Vec2) : ([...q0] as Vec2),
    accepted,
    divergent,
    deltaH,
    acceptProb,
  }
}

export interface ChainResult {
  samples: Vec2[]
  accepted: number
  divergences: number
}

/** n transitions, keeping every state (including repeats on rejection). */
export function runChain(
  target: TargetDist,
  q0: Vec2,
  eps: number,
  L: number,
  n: number,
  rng: RNG,
): ChainResult {
  const samples: Vec2[] = []
  let q = q0
  let accepted = 0
  let divergences = 0
  for (let i = 0; i < n; i++) {
    const t = hmcStep(target, q, eps, L, rng)
    q = t.q1
    samples.push(q)
    if (t.accepted) accepted++
    if (t.divergent) divergences++
  }
  return { samples, accepted, divergences }
}

/**
 * Density grid for the canvas background: exp(logDensity) normalized to
 * max 1 over the plotting window.
 */
export function densityGrid(target: TargetDist, nx: number, ny: number): Float64Array {
  const grid = new Float64Array(nx * ny)
  const [x0, x1] = target.xRange
  const [y0, y1] = target.yRange
  let max = -Infinity
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const lp = target.logDensity([
        x0 + ((x1 - x0) * i) / (nx - 1),
        y0 + ((y1 - y0) * j) / (ny - 1),
      ])
      grid[j * nx + i] = lp
      if (lp > max) max = lp
    }
  }
  for (let k = 0; k < grid.length; k++) grid[k] = Math.exp(grid[k]! - max)
  return grid
}
