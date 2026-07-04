import { ch02Hints } from './ch02'
import { ch03Hints } from './ch03'
import { ch04Hints } from './ch04'
import { ch05Hints } from './ch05'
import { ch06Hints } from './ch06'
import type { ChapterHints } from './types'

export const hintsByChapter: Record<number, ChapterHints> = {
  2: ch02Hints,
  3: ch03Hints,
  4: ch04Hints,
  5: ch05Hints,
  6: ch06Hints,
}
