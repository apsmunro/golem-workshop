import type { ChapterDeck } from './types'

export const ch04Deck: ChapterDeck = [
  {
    id: 's4-1',
    chapter: 4,
    kind: 'concept',
    front: 'Why reach for a Gaussian likelihood even when you don’t believe the data are exactly normal?',
    back: 'Two reasons. Generatively, sums of many small independent nudges pile up into a bell. And among all distributions with a given mean and variance, the Gaussian assumes the least — it commits to nothing past the first two moments.',
  },
  {
    id: 's4-2',
    chapter: 4,
    kind: 'code',
    front: 'What does the lognormal prior on the slope encode here?',
    code: 'brm(height ~ 1 + weight, data = d,\n    prior = c(prior(normal(178, 20), class = Intercept),\n              prior(lognormal(0, 1), class = b),\n              prior(exponential(1), class = sigma)))',
    back: 'That the slope of height on weight is positive — a lognormal lives strictly above zero. You have assumed, before seeing data, that heavier goes with taller, ruling out the absurd negative slope.',
  },
  {
    id: 's4-3',
    chapter: 4,
    kind: 'trap',
    front: 'You put Normal(0, 100) on a regression slope, calling it flat and harmless. What can the prior predictive show?',
    back: 'Wildly impossible outcomes — metres of height change per kilogram. Flat is not the same as uninformative; on a real scale a very wide prior implies nonsense. Simulate from the prior and look before you trust it.',
  },
  {
    id: 's4-4',
    chapter: 4,
    kind: 'concept',
    front: 'What does centering or standardizing a predictor buy you in a linear or polynomial fit?',
    back: 'It decorrelates the parameters and puts them on a comparable scale, so priors are easier to set and the sampler moves better. The intercept becomes the mean outcome at the mean predictor, which you can actually interpret.',
  },
]
