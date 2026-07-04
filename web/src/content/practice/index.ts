import { ch02Hints } from './ch02'
import { ch03Hints } from './ch03'
import type { ChapterHints } from './types'

export const hintsByChapter: Record<number, ChapterHints> = {
  2: ch02Hints,
  3: ch03Hints,
}
