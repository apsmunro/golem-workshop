import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'

export type MDXPage = ComponentType<{ components?: MDXComponents }>

type Loader = () => Promise<{ default: MDXPage }>

/**
 * Import thunks for each chapter's MDX chunk. Shared by ChapterPage (which
 * wraps them in React.lazy) and by the boot-time prefetch in main.tsx, so a
 * direct hit on /chapter/:slug fetches its content chunk in parallel with
 * React starting up instead of after first render. import() dedupes, so
 * calling a thunk twice costs nothing.
 */
export const chapterContent: Record<number, Loader> = {
  1: () => import('./chapters/ch01.mdx'),
  2: () => import('./chapters/ch02.mdx'),
  3: () => import('./chapters/ch03.mdx'),
  4: () => import('./chapters/ch04.mdx'),
  5: () => import('./chapters/ch05.mdx'),
  6: () => import('./chapters/ch06.mdx'),
  7: () => import('./chapters/ch07.mdx'),
  8: () => import('./chapters/ch08.mdx'),
  9: () => import('./chapters/ch09.mdx'),
  10: () => import('./chapters/ch10.mdx'),
  11: () => import('./chapters/ch11.mdx'),
  12: () => import('./chapters/ch12.mdx'),
  13: () => import('./chapters/ch13.mdx'),
  14: () => import('./chapters/ch14.mdx'),
  15: () => import('./chapters/ch15.mdx'),
  16: () => import('./chapters/ch16.mdx'),
  17: () => import('./chapters/ch17.mdx'),
}
