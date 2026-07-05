import type { ChapterDeck } from './types'

export const ch15Deck: ChapterDeck = [
  {
    id: 's15-1',
    chapter: 15,
    kind: 'concept',
    front: 'How does a Bayesian model handle measurement error on a predictor instead of ignoring it?',
    back: 'It treats each true value as an unknown parameter with a prior set by the measured value and its standard error, then lets that parameter inform the outcome. The uncertainty propagates, so noisier observations carry less weight.',
  },
  {
    id: 's15-2',
    chapter: 15,
    kind: 'concept',
    front: 'What does Bayesian imputation do that dropping incomplete rows doesn’t?',
    back: 'It treats each missing value as a parameter, estimated from the other variables and the model, using every observed relationship. Complete-case analysis throws away partial information and can bias results when data are not missing at random.',
  },
  {
    id: 's15-3',
    chapter: 15,
    kind: 'trap',
    front: 'You fill missing predictor values with the column mean, then fit as if they were observed. What’s wrong?',
    back: 'Single imputation pretends you know the missing values exactly, so intervals come out too narrow and estimates can bias. Carry the imputation uncertainty through by modeling the missing values jointly with everything else.',
  },
  {
    id: 's15-4',
    chapter: 15,
    kind: 'concept',
    front: 'When measurement error differs across observations, what does the model do with the noisy ones?',
    back: 'It shrinks them toward the regression line more than the precise ones, pulling each point in proportion to its uncertainty. Error-in-variables regression trusts the well-measured points and discounts the rest.',
  },
]
