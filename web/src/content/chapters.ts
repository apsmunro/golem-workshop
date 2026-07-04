export interface ChapterMeta {
  n: number
  slug: string
  title: string
  /** The golem forged on completing the chapter; null for Ch. 1 (workshop key). */
  golem: string | null
}

export const chapters: ChapterMeta[] = [
  { n: 1, slug: 'the-golem-of-prague', title: 'The Golem of Prague', golem: null },
  { n: 2, slug: 'small-worlds-and-large-worlds', title: 'Small Worlds and Large Worlds', golem: 'Globe-Tossing Golem' },
  { n: 3, slug: 'sampling-the-imaginary', title: 'Sampling the Imaginary', golem: 'Sampler Sprite' },
  { n: 4, slug: 'geocentric-models', title: 'Geocentric Models', golem: 'Gaussian Golem' },
  { n: 5, slug: 'the-many-variables-and-the-spurious-waffles', title: 'The Many Variables & The Spurious Waffles', golem: 'Multivariable Golem' },
  { n: 6, slug: 'the-haunted-dag-and-the-causal-terror', title: 'The Haunted DAG & The Causal Terror', golem: 'Haunted DAG Charm' },
  { n: 7, slug: 'ulysses-compass', title: "Ulysses' Compass", golem: 'Compass of Ulysses' },
  { n: 8, slug: 'conditional-manatees', title: 'Conditional Manatees', golem: 'Manatee Golem' },
  { n: 9, slug: 'markov-chain-monte-carlo', title: 'Markov Chain Monte Carlo', golem: 'MCMC Engine Core' },
  { n: 10, slug: 'big-entropy-and-the-glm', title: 'Big Entropy and the GLM', golem: 'GLM Prism' },
  { n: 11, slug: 'god-spiked-the-integers', title: 'God Spiked the Integers', golem: 'Integer Golem' },
  { n: 12, slug: 'monsters-and-mixtures', title: 'Monsters and Mixtures', golem: 'Monster Mixer' },
  { n: 13, slug: 'models-with-memory', title: 'Models With Memory', golem: 'Memory Golem' },
  { n: 14, slug: 'adventures-in-covariance', title: 'Adventures in Covariance', golem: 'Covariance Hydra' },
  { n: 15, slug: 'missing-data-and-other-opportunities', title: 'Missing Data and Other Opportunities', golem: 'Phantom Golem' },
  { n: 16, slug: 'generalized-linear-madness', title: 'Generalized Linear Madness', golem: 'Mad Scientist Golem' },
  { n: 17, slug: 'horoscopes', title: 'Horoscopes', golem: 'Workshop Master Seal' },
]

export function chapterBySlug(slug: string): ChapterMeta | undefined {
  return chapters.find((c) => c.slug === slug)
}
