import type { ComponentType } from 'react'
import type { GolemArtState } from './golem-art'
import {
  CompassOfUlysses,
  CovarianceHydra,
  GaussianGolem,
  GlmPrism,
  GlobeTossingGolem,
  HauntedDagGolem,
  IntegerGolem,
  MadScientistGolem,
  ManateeGolem,
  McmcEngineCore,
  MemoryGolem,
  MonsterMixer,
  MultivariableGolem,
  PhantomGolem,
  SamplerSprite,
  WorkshopMasterSeal,
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
  {
    id: 'glm-prism',
    name: 'GLM Prism',
    chapter: 10,
    signature: 'g(μ) = α + βx · maximum entropy in, bounded scale out',
    epithet: 'Refracts one straight line onto every bounded world.',
    Art: GlmPrism,
  },
  {
    id: 'integer-golem',
    name: 'Integer Golem',
    chapter: 11,
    signature: 'y ~ Binomial(n, p) · y ~ Poisson(λ) · log and logit',
    epithet: 'Counts only in whole things, and multiplies its effects.',
    Art: IntegerGolem,
  },
  {
    id: 'monster-mixer',
    name: 'Monster Mixer',
    chapter: 12,
    signature: 'zero-inflated · gamma-Poisson · ordered logit',
    epithet: 'Admits an observation had more than one way to happen.',
    Art: MonsterMixer,
  },
  {
    id: 'memory-golem',
    name: 'Memory Golem',
    chapter: 13,
    signature: 'y ~ (1 | tank) · α_tank ~ Normal(ᾱ, σ)',
    epithet: 'Lets every cluster borrow what the others learned.',
    Art: MemoryGolem,
  },
  {
    id: 'covariance-hydra',
    name: 'Covariance Hydra',
    chapter: 14,
    signature: '[a, b] ~ MVNormal([ā, b̄], S·R·S)',
    epithet: 'Two heads that vary together, and a kernel for a spine.',
    Art: CovarianceHydra,
  },
  {
    id: 'phantom-golem',
    name: 'Phantom Golem',
    chapter: 15,
    signature: 'x_obs ~ Normal(x_true, x_se) · x_true estimated',
    epithet: 'Made of what was measured badly and what was never measured at all.',
    Art: PhantomGolem,
  },
  {
    id: 'mad-scientist-golem',
    name: 'Mad Scientist Golem',
    chapter: 16,
    signature: 'dH/dt = H(bH − mH·L) · weight ∝ height³',
    epithet: 'Brings the mechanism and makes the data set the scale.',
    Art: MadScientistGolem,
  },
  {
    id: 'workshop-master-seal',
    name: 'Workshop Master Seal',
    chapter: 17,
    signature: 'the golem has no wisdom of its own',
    epithet: 'Stamped on the ones who learned what the golems cannot do.',
    Art: WorkshopMasterSeal,
  },
]

export function golemForChapter(n: number): GolemMeta | undefined {
  return golems.find((g) => g.chapter === n)
}
