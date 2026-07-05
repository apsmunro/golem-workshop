import type { ChapterDeck } from './types'

export const ch05Deck: ChapterDeck = [
  {
    id: 's5-1',
    chapter: 5,
    kind: 'trap',
    front: 'Adding a second predictor collapses a coefficient you cared about to near zero. Name two very different causes.',
    back: 'Either the two predictors carry the same information — the first was a proxy for a common cause, a spurious association — or you conditioned on a mediator or collider and distorted the estimate. The regression alone cannot tell you which; only the DAG can.',
  },
  {
    id: 's5-2',
    chapter: 5,
    kind: 'concept',
    front: 'What is a masked relationship, and how does adding a variable reveal it?',
    back: 'Two predictors each tied to the outcome in opposite directions and correlated with each other, so each alone looks weak. Put both in the model and each shows its effect with the other held fixed — both spring into view.',
  },
  {
    id: 's5-3',
    chapter: 5,
    kind: 'code',
    front: 'With standardized variables, what does the coefficient on marriage mean in this fit?',
    code: 'brm(divorce ~ 1 + marriage + age, data = d,\n    prior = c(prior(normal(0, 0.2), class = Intercept),\n              prior(normal(0, 0.5), class = b),\n              prior(exponential(1), class = sigma)))',
    back: 'The association of marriage rate with divorce rate after accounting for median age at marriage. In the Waffle data it is near zero: once you know age, marriage rate adds little — the raw marriage–divorce link was mostly age all along.',
  },
  {
    id: 's5-4',
    chapter: 5,
    kind: 'concept',
    front: 'Why fit a categorical predictor as an index variable rather than a set of dummies?',
    back: 'An index gives every category its own intercept on equal footing, with the same prior, and scales to many levels without a baseline-category asymmetry. You compute contrasts from the posterior afterward.',
  },
]
