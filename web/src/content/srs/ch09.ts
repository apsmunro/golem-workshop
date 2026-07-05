import type { ChapterDeck } from './types'

export const ch09Deck: ChapterDeck = [
  {
    id: 's9-1',
    chapter: 9,
    kind: 'concept',
    front: 'What is the core rule of the Metropolis algorithm — King Markov and his islands?',
    back: 'Propose a move; take it for certain if it raises the posterior density, and take it with probability equal to the density ratio if it lowers it. Over many steps the chain visits each region in proportion to its posterior probability.',
  },
  {
    id: 's9-2',
    chapter: 9,
    kind: 'concept',
    front: 'Why does Hamiltonian Monte Carlo explore a high-dimensional posterior so much better than plain Metropolis?',
    back: 'It uses the gradient to glide along the posterior with momentum, taking long, informed steps instead of a random walk. Fewer, less-correlated samples cover the space — and divergences flag exactly where the physics breaks down.',
  },
  {
    id: 's9-3',
    chapter: 9,
    kind: 'trap',
    front: 'A trace plot wanders slowly, the chains don’t overlap, and R-hat is 1.4. What is this, and what do you try?',
    back: 'The chains have not converged — R-hat well above 1.0 means between-chain and within-chain variance disagree. Run longer, reparameterize (non-centered), tighten priors, or raise adapt_delta. A fuzzy caterpillar with overlapping chains is the target.',
  },
  {
    id: 's9-4',
    chapter: 9,
    kind: 'code',
    front: 'What problem is raising adapt_delta meant to fix?',
    code: 'brm(..., chains = 4, cores = 4, iter = 2000,\n    control = list(adapt_delta = 0.95))',
    back: 'Divergent transitions. A higher target acceptance makes the sampler take smaller steps, so it can move through awkward geometry — a funnel neck, say — without diverging, at the cost of some speed.',
  },
]
