/**
 * Chapter 15 dataset loaders: WaffleDivorce for the measurement-error sim,
 * milk for the imputation explorer. Fetched once and parsed.
 */
import { parseWaffles } from '../../components/interactives/error-in-variables/engine'
import type { WaffleRow } from '../../components/interactives/error-in-variables/engine'
import { parseMilk } from '../../components/interactives/imputation-explorer/engine'
import type { MilkRow } from '../../components/interactives/imputation-explorer/engine'

let waffleCache: WaffleRow[] | null = null
let milkCache: MilkRow[] | null = null

export async function loadWaffles(): Promise<WaffleRow[]> {
  if (waffleCache) return waffleCache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/WaffleDivorce.csv`)
  waffleCache = parseWaffles(await res.text())
  return waffleCache
}

export async function loadMilk(): Promise<MilkRow[]> {
  if (milkCache) return milkCache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/milk.csv`)
  milkCache = parseMilk(await res.text())
  return milkCache
}
