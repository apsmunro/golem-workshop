import type { ChapterDeck } from './types'

export const ch07Deck: ChapterDeck = [
  {
    id: 's7-1',
    chapter: 7,
    kind: 'concept',
    front: 'What does regularization trade, and why does a slightly-too-tight prior often predict better out of sample?',
    back: 'It trades a little bias for less variance. A skeptical prior keeps the model from chasing noise in the sample, so it generalizes better even though it fits the training data a touch worse.',
  },
  {
    id: 's7-2',
    chapter: 7,
    kind: 'concept',
    front: 'What do WAIC and PSIS-LOO estimate, and why isn’t in-sample fit enough?',
    back: 'They estimate out-of-sample predictive accuracy — the expected log predictive density on new data. In-sample deviance always improves with more parameters, so it cannot separate overfitting from signal; the criteria subtract a penalty for the effective number of parameters.',
  },
  {
    id: 's7-3',
    chapter: 7,
    kind: 'trap',
    front: 'One model has the lowest WAIC, so you discard the rest. What did you skip?',
    back: 'The standard error of the difference. If the gap between models is small next to its standard error, the ranking is noise. And a high Pareto-k point warns that the PSIS-LOO estimate is shaky there — check it before trusting the comparison.',
  },
  {
    id: 's7-4',
    chapter: 7,
    kind: 'code',
    front: 'This returns elpd_diff and se_diff. How do you read them?',
    code: 'loo_compare(loo(m1), loo(m2))',
    back: 'elpd_diff is the difference in expected log predictive density from the best model. If its size is only one or two times se_diff, the models predict about equally well; a difference several times its standard error is a real edge.',
  },
]
