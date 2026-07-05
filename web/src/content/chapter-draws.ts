/**
 * chapter-draws.ts — the real draws behind each chapter's living posterior.
 *
 * Early chapters run on JS simulation, generated here deterministically
 * from the chapter's actual model. Chapters 4–8 use synthetic draws whose
 * parameters match the quap/brms fits; chapter 9 samples its ridge with
 * the HMC toy's own engine. Once the r-pipeline artifacts land, these
 * swap to loadArtifact() without touching the header component.
 */
import { correlatedGaussian, runChain } from '../components/interactives/hmc-toy/engine'
import { HOUSE_SEED, RNG } from '../lib/rng'

interface ChapterDraws {
  draws: number[]
  range: [number, number]
}

const cache = new Map<number, ChapterDraws>()

/** 6 water in 9 tosses, flat prior → p ~ Beta(7, 4). */
function globeTossDraws(n: number): number[] {
  const rng = new RNG(HOUSE_SEED, 2)
  return Array.from({ length: n }, () => rng.beta(7, 4))
}

/** Normal draws for a coefficient's marginal, seeded per chapter. */
function normalDraws(n: number, mean: number, sd: number, stream: number): number[] {
  const rng = new RNG(HOUSE_SEED, stream)
  return Array.from({ length: n }, () => rng.normal(mean, sd))
}

export function drawsForChapter(chapter: number): ChapterDraws | null {
  if (cache.has(chapter)) return cache.get(chapter)!
  let result: ChapterDraws | null = null
  switch (chapter) {
    case 2:
    case 3:
      result = { draws: globeTossDraws(2000), range: [0, 1] }
      break
    // m4.3: β_weight ≈ 0.90 ± 0.04 (kg → cm)
    case 4:
      result = { draws: normalDraws(2000, 0.9, 0.042, 4), range: [0.72, 1.08] }
      break
    // m5.3: β_age ≈ −0.61 ± 0.15 (age dominates once both are in)
    case 5:
      result = { draws: normalDraws(2000, -0.61, 0.15, 5), range: [-1.15, -0.05] }
      break
    // m6 collider/mediator coefficient near zero once the fork is closed
    case 6:
      result = { draws: normalDraws(2000, 0.0, 0.22, 6), range: [-0.8, 0.8] }
      break
    // ch7: sampling spread of the overfit game's linear coefficient
    // (true slope 0.7, OLS se ≈ 0.17 at n = 12, σ = 0.35)
    case 7:
      result = { draws: normalDraws(2000, 0.7, 0.17, 7), range: [0.05, 1.35] }
      break
    // m8.3: ruggedness slope inside Africa ≈ 0.13 ± 0.07 (sign flip made visible)
    case 8:
      result = { draws: normalDraws(2000, 0.13, 0.074, 8), range: [-0.15, 0.41] }
      break
    // ch9 breathes with real HMC: q1 draws from the toy's own ridge
    case 9: {
      const chain = runChain(
        correlatedGaussian(0.9),
        [0, 0],
        0.15,
        15,
        2000,
        new RNG(HOUSE_SEED, 9),
      )
      result = { draws: chain.samples.map((q) => q[0]), range: [-3, 3] }
      break
    }
    // ch10: inverse-logit of Normal(0, 1.5) — the chapter's own trap,
    // a "flat" logit prior piling up at the outcome scale's walls
    case 10: {
      const rng = new RNG(HOUSE_SEED, 10)
      const draws = Array.from({ length: 2000 }, () => {
        const eta = rng.normal(0, 1.5)
        return 1 / (1 + Math.exp(-eta))
      })
      result = { draws, range: [0, 1] }
      break
    }
    // m11.7: the total male−female admission contrast ≈ +0.61 ± 0.06 —
    // the seductive number the department model dismantles
    case 11:
      result = { draws: normalDraws(2000, 0.61, 0.064, 11), range: [0.35, 0.87] }
      break
    // m12.5: the intention-with-contact interaction ≈ −1.24 ± 0.10
    case 12:
      result = { draws: normalDraws(2000, -1.24, 0.1, 12), range: [-1.66, -0.82] }
      break
    default:
      result = null
  }
  if (result) cache.set(chapter, result)
  return result
}
