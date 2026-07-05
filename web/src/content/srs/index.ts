import { ch02Deck } from './ch02'
import { ch03Deck } from './ch03'
import { ch04Deck } from './ch04'
import { ch05Deck } from './ch05'
import { ch06Deck } from './ch06'
import { ch07Deck } from './ch07'
import { ch08Deck } from './ch08'
import { ch09Deck } from './ch09'
import { ch10Deck } from './ch10'
import { ch11Deck } from './ch11'
import { ch12Deck } from './ch12'
import { ch13Deck } from './ch13'
import { ch14Deck } from './ch14'
import { ch15Deck } from './ch15'
import { ch16Deck } from './ch16'
import { ch17Deck } from './ch17'
import type { ChapterDeck, SrsDeckCard } from './types'

export type { SrsDeckCard, SrsKind, ChapterDeck } from './types'

/** Deck per chapter, keyed by chapter number. Chapter 1 has no deck. */
export const deckByChapter: Record<number, ChapterDeck> = {
  2: ch02Deck,
  3: ch03Deck,
  4: ch04Deck,
  5: ch05Deck,
  6: ch06Deck,
  7: ch07Deck,
  8: ch08Deck,
  9: ch09Deck,
  10: ch10Deck,
  11: ch11Deck,
  12: ch12Deck,
  13: ch13Deck,
  14: ch14Deck,
  15: ch15Deck,
  16: ch16Deck,
  17: ch17Deck,
}

/** Every card, flattened, in chapter order. */
export const allDeckCards: SrsDeckCard[] = Object.keys(deckByChapter)
  .map(Number)
  .sort((a, b) => a - b)
  .flatMap((ch) => deckByChapter[ch]!)

/** Fast lookup from a scheduler id back to its authored card. */
export const deckCardById: Map<string, SrsDeckCard> = new Map(
  allDeckCards.map((c) => [c.id, c]),
)
