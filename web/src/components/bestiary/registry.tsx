import type { ComponentType } from 'react'
import type { GolemArtState } from './golem-art'
import { GlobeTossingGolem, SamplerSprite } from './golem-art'

export interface GolemMeta {
  id: string
  name: string
  chapter: number
  /** The signature stamped on its chest in the bestiary. */
  signature: string
  /** One line of character. */
  epithet: string
  Art: ComponentType<{ state?: GolemArtState; dismembered?: boolean; className?: string }>
}

export const golems: GolemMeta[] = [
  {
    id: 'globe-tossing',
    name: 'Globe-Tossing Golem',
    chapter: 2,
    signature: 'W ~ Binomial(N, p) · p ~ Uniform(0, 1)',
    epithet: 'A fist of clay that counts the ways.',
    Art: GlobeTossingGolem,
  },
  {
    id: 'sampler-sprite',
    name: 'Sampler Sprite',
    chapter: 3,
    signature: 'sample(p_grid, prob = posterior, size = 1e4, replace = TRUE)',
    epithet: 'Ladles ten thousand worlds from one urn.',
    Art: SamplerSprite,
  },
]

export function golemForChapter(n: number): GolemMeta | undefined {
  return golems.find((g) => g.chapter === n)
}
