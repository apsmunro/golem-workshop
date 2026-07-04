import type { ComponentType } from 'react'
import type { GolemArtState } from './golem-art'
import {
  CompassOfUlysses,
  GaussianGolem,
  GlobeTossingGolem,
  HauntedDagGolem,
  ManateeGolem,
  McmcEngineCore,
  MultivariableGolem,
  SamplerSprite,
} from './golem-art'

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
  {
    id: 'gaussian-golem',
    name: 'Gaussian Golem',
    chapter: 4,
    signature: 'height ~ Normal(a + b·(weight − w̄), sigma)',
    epithet: 'Draws a line and a crowd of lines around it.',
    Art: GaussianGolem,
  },
  {
    id: 'multivariable-golem',
    name: 'Multivariable Golem',
    chapter: 5,
    signature: 'D ~ Normal(a + bM·M + bA·A, sigma)',
    epithet: 'Holds two causes apart to see which one lied.',
    Art: MultivariableGolem,
  },
  {
    id: 'haunted-dag-charm',
    name: 'Haunted DAG Charm',
    chapter: 6,
    signature: 'condition wisely — colliders bite',
    epithet: 'Wards against the confounder you cannot see.',
    Art: HauntedDagGolem,
  },
  {
    id: 'compass-of-ulysses',
    name: 'Compass of Ulysses',
    chapter: 7,
    signature: 'loo(m1, m2, m3) · elpd, pareto k',
    epithet: 'Steers between the monsters of overfitting and underfitting.',
    Art: CompassOfUlysses,
  },
  {
    id: 'manatee-golem',
    name: 'Manatee Golem',
    chapter: 8,
    signature: 'y ~ x * m · the slope has a slope',
    epithet: 'Gentle, rounded, and conditional on everything.',
    Art: ManateeGolem,
  },
  {
    id: 'mcmc-engine-core',
    name: 'MCMC Engine Core',
    chapter: 9,
    signature: 'brm(..., chains = 4, cores = 4) · R̂ < 1.01',
    epithet: 'A marble that rolls where the posterior is deep.',
    Art: McmcEngineCore,
  },
]

export function golemForChapter(n: number): GolemMeta | undefined {
  return golems.find((g) => g.chapter === n)
}
