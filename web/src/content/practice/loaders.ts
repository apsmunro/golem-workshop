import type { ChapterHints } from './types'

/**
 * Per-chapter dynamic imports so 165 kB of hint prose stays out of the
 * entry chunk — a chapter's ladder text loads only on its own page.
 * Import `hintsByChapter` (index.ts) only from code that is itself lazy.
 */
export const hintLoaders: Record<number, () => Promise<ChapterHints>> = {
  2: () => import('./ch02').then((m) => m.ch02Hints),
  3: () => import('./ch03').then((m) => m.ch03Hints),
  4: () => import('./ch04').then((m) => m.ch04Hints),
  5: () => import('./ch05').then((m) => m.ch05Hints),
  6: () => import('./ch06').then((m) => m.ch06Hints),
  7: () => import('./ch07').then((m) => m.ch07Hints),
  8: () => import('./ch08').then((m) => m.ch08Hints),
  9: () => import('./ch09').then((m) => m.ch09Hints),
  10: () => import('./ch10').then((m) => m.ch10Hints),
  11: () => import('./ch11').then((m) => m.ch11Hints),
  12: () => import('./ch12').then((m) => m.ch12Hints),
  13: () => import('./ch13').then((m) => m.ch13Hints),
  14: () => import('./ch14').then((m) => m.ch14Hints),
  15: () => import('./ch15').then((m) => m.ch15Hints),
  16: () => import('./ch16').then((m) => m.ch16Hints),
  17: () => import('./ch17').then((m) => m.ch17Hints),
}
