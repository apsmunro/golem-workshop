/**
 * divergence-detective engine — Neal's funnel, centered vs non-centered.
 *
 * The funnel is the shape a multilevel model makes: v is a log-variance
 * (σ on the log scale) and x is a parameter whose spread is exp(v/2).
 * Down in the neck the good step size is tiny; up in the mouth it is huge.
 * One global ε cannot serve both, so a centered sampler throws divergences
 * exactly where v is small — precisely the region a multilevel model needs
 * to visit to learn that a cluster's variance is near zero.
 *
 * The cure is non-centering. Sample a round bowl in (z, r):
 *   v = 3 r,   x = z · exp(v / 2),   with z, r ~ Normal(0, 1),
 * then transform. HMC never sees the funnel; it walks the bowl, and the
 * divergences vanish while the neck fills in.
 *
 * Reuses the leapfrog step from the chapter-9 HMC toy so both chapters
 * share one integrator. Pure logic, no React, no DOM.
 */
import { RNG } from '../../../lib/rng'
import { correlatedGaussian, funnel, hmcStep } from '../hmc-toy/engine'
import type { Vec2 } from '../hmc-toy/engine'

export interface FunnelSample {
  q: Vec2
  divergent: boolean
}

export interface FunnelRun {
  samples: FunnelSample[]
  divergences: number
  accepted: number
  /** deepest (most negative) v the chain actually reached — the neck test. */
  minV: number
}

const ROUND_BOWL = correlatedGaussian(0)

/**
 * Centered run: HMC directly on the funnel in (x, v). Divergent transitions
 * are recorded at the point they were launched from, so the view can mark
 * the neck where they pile up.
 */
export function runCentered(
  eps: number,
  L: number,
  n: number,
  seed = 1959,
): FunnelRun {
  const target = funnel()
  const rng = new RNG(seed, 13)
  let q: Vec2 = [0, 0]
  const samples: FunnelSample[] = []
  let divergences = 0
  let accepted = 0
  let minV = Infinity
  for (let i = 0; i < n; i++) {
    const t = hmcStep(target, q, eps, L, rng)
    if (t.divergent) {
      divergences++
      // record the launch point: divergences cluster where sampling began
      samples.push({ q: [...q] as Vec2, divergent: true })
    } else {
      if (t.accepted) accepted++
      q = t.q1
      samples.push({ q: [...q] as Vec2, divergent: false })
      if (q[1] < minV) minV = q[1]
    }
  }
  return { samples, divergences, accepted, minV }
}

/** v = 3r, x = z·exp(v/2). Maps a bowl draw (z, r) to funnel space (x, v). */
export function toFunnelSpace([z, r]: Vec2): Vec2 {
  const v = 3 * r
  const x = z * Math.exp(v / 2)
  return [x, v]
}

/**
 * Non-centered run: HMC on the round bowl in (z, r), each state transformed
 * into funnel space for display. The bowl has no bad geometry, so ε works
 * everywhere and the neck fills in.
 */
export function runNonCentered(
  eps: number,
  L: number,
  n: number,
  seed = 1959,
): FunnelRun {
  const rng = new RNG(seed, 14)
  let q: Vec2 = [0, 0]
  const samples: FunnelSample[] = []
  let divergences = 0
  let accepted = 0
  let minV = Infinity
  for (let i = 0; i < n; i++) {
    const t = hmcStep(ROUND_BOWL, q, eps, L, rng)
    if (t.divergent) {
      divergences++
      const fq = toFunnelSpace([...q] as Vec2)
      samples.push({ q: fq, divergent: true })
    } else {
      if (t.accepted) accepted++
      q = t.q1
      const fq = toFunnelSpace(q)
      samples.push({ q: fq, divergent: false })
      if (fq[1] < minV) minV = fq[1]
    }
  }
  return { samples, divergences, accepted, minV }
}

export function runFunnel(
  mode: 'centered' | 'non-centered',
  eps: number,
  L: number,
  n: number,
  seed?: number,
): FunnelRun {
  return mode === 'centered'
    ? runCentered(eps, L, n, seed)
    : runNonCentered(eps, L, n, seed)
}
