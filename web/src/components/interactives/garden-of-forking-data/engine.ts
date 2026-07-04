/**
 * Garden of Forking Data — pure counting engine.
 * A conjecture is "this bag holds `composition` marked marbles out of
 * `total`". A datum is 1 (blue/water) or 0 (white/land). Everything else
 * is products and normalization.
 */

export type Mark = 0 | 1
export type Mode = 'marbles' | 'globe'

export const BAG_SIZE = 4

/** Compositions 0..total marked marbles — the conjecture set. */
export function conjectureCompositions(total: number = BAG_SIZE): number[] {
  return Array.from({ length: total + 1 }, (_, i) => i)
}

/** How many marbles in this bag could have produced the datum. */
export function waysForDatum(composition: number, total: number, datum: Mark): number {
  return datum === 1 ? composition : total - composition
}

/** Paths through the garden compatible with the whole observed sequence. */
export function pathCount(
  composition: number,
  total: number,
  observed: readonly Mark[],
): number {
  let ways = 1
  for (const d of observed) ways *= waysForDatum(composition, total, d)
  return ways
}

export interface Plausibility {
  /** prior weight × path count, per conjecture */
  counts: number[]
  /** counts normalized to sum 1 (all-zero counts stay all zero) */
  posterior: number[]
}

export function plausibilities(
  priorCounts: readonly number[],
  observed: readonly Mark[],
  total: number = BAG_SIZE,
): Plausibility {
  const counts = conjectureCompositions(total).map(
    (c, i) => (priorCounts[i] ?? 1) * pathCount(c, total, observed),
  )
  const sum = counts.reduce((a, b) => a + b, 0)
  const posterior = sum > 0 ? counts.map((c) => c / sum) : counts.slice()
  return { counts, posterior }
}

export interface TreeNode {
  /** flat index within its ring; parent is floor(index / total) */
  index: number
  /** which marble of the bag this branch drew, 0..total-1 */
  marble: number
  /** is the marble marked (blue/water) under the given composition? */
  marked: boolean
  /** does this single draw match its datum? */
  matches: boolean
  /** are this node and all its ancestors compatible with the data? */
  alive: boolean
}

/** Ring `d` (1-based) holds total^d nodes: every path of length d. */
export function buildTree(
  composition: number,
  total: number,
  observed: readonly Mark[],
): TreeNode[][] {
  const rings: TreeNode[][] = []
  let prevAlive: boolean[] = [true]
  for (let level = 1; level <= observed.length; level++) {
    const datum = observed[level - 1]!
    const count = Math.pow(total, level)
    const ring: TreeNode[] = new Array(count)
    const alive: boolean[] = new Array(count)
    for (let i = 0; i < count; i++) {
      const marble = i % total
      const marked = marble < composition
      const matches = (marked ? 1 : 0) === datum
      const parentAlive = prevAlive[Math.floor(i / total)]!
      const nodeAlive = parentAlive && matches
      ring[i] = { index: i, marble, marked, matches, alive: nodeAlive }
      alive[i] = nodeAlive
    }
    rings.push(ring)
    prevAlive = alive
  }
  return rings
}

/** Living leaves of the deepest ring — equals pathCount when data ≤ rings. */
export function livingPaths(rings: readonly TreeNode[][]): number {
  if (rings.length === 0) return 1
  return rings[rings.length - 1]!.filter((n) => n.alive).length
}

export const TREE_MAX_OBSERVATIONS = 3
export const ROUND_MAX_OBSERVATIONS = 6
