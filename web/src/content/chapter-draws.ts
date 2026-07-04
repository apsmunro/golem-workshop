/**
 * chapter-draws.ts — the real draws behind each chapter's living posterior.
 *
 * Early chapters run on JS simulation, generated here deterministically
 * from the chapter's actual model. Chapters 4–6 use synthetic draws whose
 * parameters match the quap/brms fits; once the r-pipeline artifacts land,
 * these swap to loadArtifact() without touching the header component.
 */
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
    default:
      result = null
  }
  if (result) cache.set(chapter, result)
  return result
}
