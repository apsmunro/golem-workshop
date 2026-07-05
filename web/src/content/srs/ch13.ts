import type { ChapterDeck } from './types'

export const ch13Deck: ChapterDeck = [
  {
    id: 's13-1',
    chapter: 13,
    kind: 'concept',
    front: 'What is partial pooling, and why does it usually beat both no pooling and complete pooling?',
    back: 'Each cluster borrows strength from the others through a shared distribution, so noisy small clusters shrink toward the grand mean while well-measured large ones barely move. It is a bias–variance compromise the data set for you, not one you tune by hand.',
  },
  {
    id: 's13-2',
    chapter: 13,
    kind: 'concept',
    front: 'What does the group-level standard deviation (like sd_tank) tell you?',
    back: 'How much the clusters truly differ. Small means they are alike and pooling is strong; large means real between-cluster variation and little pooling. The data estimate this rather than you fixing the amount of pooling in advance.',
  },
  {
    id: 's13-3',
    chapter: 13,
    kind: 'trap',
    front: 'Small tanks at 100% survival get pulled well below 1.0 while big tanks barely move. Is that a bug?',
    back: 'No — it is shrinkage doing its job. A tiny sample at the boundary is weak evidence, so the model leans on the population; a large sample speaks for itself. The pull scales with how much each cluster actually knows.',
  },
  {
    id: 's13-4',
    chapter: 13,
    kind: 'code',
    front: 'What does (1 | tank) add over a fixed tank term?',
    code: 'brm(surv | trials(density) ~ 1 + (1 | tank),\n    family = binomial(), data = reedfrogs, ...)',
    back: 'A varying intercept per tank drawn from a common Normal whose standard deviation is estimated. The tanks share a prior and pool toward one another, instead of each being fit on its own with no shrinkage.',
  },
]
