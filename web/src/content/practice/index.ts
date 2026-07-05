import { ch02Hints } from './ch02'
import { ch03Hints } from './ch03'
import { ch04Hints } from './ch04'
import { ch05Hints } from './ch05'
import { ch06Hints } from './ch06'
import { ch07Hints } from './ch07'
import { ch08Hints } from './ch08'
import { ch09Hints } from './ch09'
import { ch10Hints } from './ch10'
import { ch11Hints } from './ch11'
import { ch12Hints } from './ch12'
import type { ChapterHints } from './types'

export const hintsByChapter: Record<number, ChapterHints> = {
  2: ch02Hints,
  3: ch03Hints,
  4: ch04Hints,
  5: ch05Hints,
  6: ch06Hints,
  7: ch07Hints,
  8: ch08Hints,
  9: ch09Hints,
  10: ch10Hints,
  11: ch11Hints,
  12: ch12Hints,
}
