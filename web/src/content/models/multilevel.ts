/**
 * Chapter 13 dataset loader. Fetches reedfrogs.csv once and parses it into
 * tanks for the Shrinkage Theater.
 */
import { parseReedfrogs } from '../../components/interactives/shrinkage-theater/engine'
import type { Tank } from '../../components/interactives/shrinkage-theater/engine'

let cache: Tank[] | null = null

export async function loadReedfrogs(): Promise<Tank[]> {
  if (cache) return cache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/reedfrogs.csv`)
  cache = parseReedfrogs(await res.text())
  return cache
}
