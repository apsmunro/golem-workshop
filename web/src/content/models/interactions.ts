/**
 * Chapter 8 datasets, fetched once and adapted for the interaction
 * surface. Scaling follows the book: log GDP as a proportion of the
 * mean log GDP, ruggedness as a proportion of the maximum, blooms as a
 * proportion of the maximum, water and shade centered on 2.
 */
import { ruggedRows, tulipsRows } from '../../components/interactives/interaction-surface/engine'
import type { XYM } from '../../components/interactives/interaction-surface/engine'

let ruggedCache: XYM[] | null = null
let tulipsCache: XYM[] | null = null

export async function loadRugged(): Promise<XYM[]> {
  if (ruggedCache) return ruggedCache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/rugged.csv`)
  ruggedCache = ruggedRows(await res.text())
  return ruggedCache
}

export async function loadTulips(): Promise<XYM[]> {
  if (tulipsCache) return tulipsCache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/tulips.csv`)
  tulipsCache = tulipsRows(await res.text())
  return tulipsCache
}
