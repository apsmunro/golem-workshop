/**
 * Trace-triage engine. Pure logic, no React, no DOM.
 *
 * Generates three-chain traces with a planted pathology and computes the
 * honest diagnostics: split-R̂ (Gelman et al.) and a Geyer-style effective
 * sample size from pooled autocorrelations truncated at the first
 * negative lag. The game shows the picture first, the numbers after.
 */
import { RNG } from '../../../lib/rng'

export type Ailment = 'healthy' | 'stuck' | 'unconverged' | 'divergent' | 'warmup'

export const AILMENTS: Ailment[] = ['healthy', 'stuck', 'unconverged', 'divergent', 'warmup']

export interface Round {
  ailment: Ailment
  /** traces[chain][draw] */
  traces: number[][]
  /** draw indices with divergent transitions, per chain */
  divergences: number[][]
}

export const CHAINS = 3
export const DRAWS = 300

function ar1(rng: RNG, n: number, mean: number, phi: number, innovSd: number, start?: number): number[] {
  const out = new Array<number>(n)
  let v = start ?? mean + rng.normal(0, innovSd / Math.sqrt(1 - phi * phi))
  for (let i = 0; i < n; i++) {
    v = mean + phi * (v - mean) + rng.normal(0, innovSd)
    out[i] = v
  }
  return out
}

export function makeRound(ailment: Ailment, seed: number): Round {
  const rng = new RNG(seed, 17)
  const traces: number[][] = []
  const divergences: number[][] = []

  switch (ailment) {
    case 'healthy': {
      for (let c = 0; c < CHAINS; c++) {
        traces.push(ar1(rng, DRAWS, 0, 0.4, 0.9))
        divergences.push([])
      }
      break
    }
    case 'stuck': {
      for (let c = 0; c < CHAINS; c++) {
        const t = ar1(rng, DRAWS, 0, 0.4, 0.9)
        if (c === 1) {
          // the middle chain seizes for a third of the run
          const from = 90 + rng.int(40)
          const level = t[from]!
          for (let i = from; i < from + 100; i++) {
            t[i] = level + rng.normal(0, 0.015)
          }
        }
        traces.push(t)
        divergences.push([])
      }
      break
    }
    case 'unconverged': {
      const means = [-2.2, 0.3, 2.4]
      for (let c = 0; c < CHAINS; c++) {
        traces.push(ar1(rng, DRAWS, means[c]!, 0.985, 0.25))
        divergences.push([])
      }
      break
    }
    case 'divergent': {
      for (let c = 0; c < CHAINS; c++) {
        const t = ar1(rng, DRAWS, 0, 0.5, 0.85)
        const d: number[] = []
        for (let i = 1; i < DRAWS; i++) {
          // divergences cluster where the chain visits the low tail —
          // the funnel's neck
          if (t[i]! < -1.1 && rng.uniform() < 0.5) {
            d.push(i)
            t[i] = t[i - 1]! // rejected transition: the chain stays put
          }
        }
        traces.push(t)
        divergences.push(d)
      }
      break
    }
    case 'warmup': {
      const starts = [9, -7, 5.5]
      for (let c = 0; c < CHAINS; c++) {
        const t = new Array<number>(DRAWS)
        let v = starts[c]! + rng.normal(0, 0.5)
        for (let i = 0; i < DRAWS; i++) {
          // decay toward the stationary region, then behave
          v = v * 0.955 + rng.normal(0, 0.9) * (1 - Math.exp(-i / 25)) * 0.7
          t[i] = v
        }
        traces.push(t)
        divergences.push([])
      }
      break
    }
  }
  return { ailment, traces, divergences }
}

/** A seeded deck: two passes over the ailments, shuffled, no adjacent repeats guaranteed by reshuffle. */
export function makeDeck(seed: number): Round[] {
  const rng = new RNG(seed, 23)
  const kinds = rng.shuffle([...AILMENTS, ...AILMENTS])
  return kinds.map((k, i) => makeRound(k, seed * 100 + i))
}

/** Split-R̂: each chain halved, between/within variance ratio. */
export function splitRhat(traces: readonly (readonly number[])[]): number {
  const halves: number[][] = []
  for (const t of traces) {
    const mid = Math.floor(t.length / 2)
    halves.push(t.slice(0, mid) as number[], t.slice(mid) as number[])
  }
  const m = halves.length
  const n = halves[0]!.length
  const means = halves.map((h) => h.reduce((a, b) => a + b, 0) / h.length)
  const grand = means.reduce((a, b) => a + b, 0) / m
  const B = (n / (m - 1)) * means.reduce((a, mu) => a + (mu - grand) ** 2, 0)
  const W =
    halves.reduce((acc, h, j) => {
      const mu = means[j]!
      return acc + h.reduce((a, v) => a + (v - mu) ** 2, 0) / (n - 1)
    }, 0) / m
  if (W === 0) return Infinity
  const varPlus = ((n - 1) / n) * W + B / n
  return Math.sqrt(varPlus / W)
}

/**
 * Effective sample size from pooled autocorrelations of centered chains,
 * truncated at the first negative estimate.
 */
export function effectiveSampleSize(traces: readonly (readonly number[])[]): number {
  const m = traces.length
  const n = traces[0]!.length
  const centered = traces.map((t) => {
    const mu = t.reduce((a, b) => a + b, 0) / t.length
    return t.map((v) => v - mu)
  })
  const var0 =
    centered.reduce((acc, t) => acc + t.reduce((a, v) => a + v * v, 0), 0) / (m * n)
  if (var0 === 0) return 0
  let sumRho = 0
  for (let lag = 1; lag < n - 1; lag++) {
    let acc = 0
    for (const t of centered) {
      for (let i = 0; i < n - lag; i++) acc += t[i]! * t[i + lag]!
    }
    const rho = acc / (m * (n - lag)) / var0
    if (rho < 0) break
    sumRho += rho
  }
  return (m * n) / (1 + 2 * sumRho)
}

export interface Diagnosis {
  label: string
  giveaway: string
  remedy: string
}

export const DIAGNOSES: Record<Ailment, Diagnosis> = {
  healthy: {
    label: 'Healthy — use it',
    giveaway:
      'Hairy caterpillar: all three chains share one band, wander freely, forget where they were within a few draws.',
    remedy: 'Nothing to fix. Check R̂ ≈ 1 and a comfortable ESS, then get on with inference.',
  },
  stuck: {
    label: 'A chain got stuck',
    giveaway:
      'One chain flatlines while the others keep breathing — its sampler stopped moving, often at a difficult spot in the posterior.',
    remedy:
      'Reparameterize or tighten priors so the geometry is kinder; more draws will not unstick it.',
  },
  unconverged: {
    label: 'Chains never found each other',
    giveaway:
      'Three ribbons at three levels, each smooth and self-satisfied. Any one alone looks fine — that is why you run several.',
    remedy:
      'Longer warm-up, better starts, and check the model for multimodality or unidentified parameters. R̂ far above 1 confirms it.',
  },
  divergent: {
    label: 'Divergent transitions',
    giveaway:
      'Clay ticks stacking up in one region — the leapfrog integrator blowing up where the posterior curves sharply.',
    remedy:
      'Raise adapt_delta first; if they persist and cluster, reparameterize (chapter 13 shows the non-centered trick).',
  },
  warmup: {
    label: 'Warm-up left in',
    giveaway:
      'Every chain sweeps in from somewhere absurd before settling — the approach path is still in the sample.',
    remedy:
      'Discard the adaptation phase (brms does by default). If you kept it deliberately, do not summarize with it.',
  },
}
