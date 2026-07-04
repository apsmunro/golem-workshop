/**
 * chapter-draws.ts — the real draws behind each chapter's living posterior.
 *
 * Chapters 2–4 run on JS/webR simulation (tier T1/T2), so their draws are
 * generated here, deterministically, from the chapter's actual model.
 * Later chapters will load precomputed brms artifacts instead.
 */
import { HOUSE_SEED, RNG } from '../lib/rng'

const cache = new Map<number, number[]>()

/**
 * Chapter 2–3: globe tossing. 6 water in 9 tosses under a flat prior
 * gives posterior p ~ Beta(7, 4).
 */
function globeTossDraws(n: number): number[] {
  const rng = new RNG(HOUSE_SEED, 2)
  return Array.from({ length: n }, () => rng.beta(7, 4))
}

export function drawsForChapter(chapter: number): { draws: number[]; range: [number, number] } | null {
  switch (chapter) {
    case 2:
    case 3: {
      if (!cache.has(2)) cache.set(2, globeTossDraws(2000))
      return { draws: cache.get(2)!, range: [0, 1] }
    }
    default:
      return null
  }
}
