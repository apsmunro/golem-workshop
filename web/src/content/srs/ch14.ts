import type { ChapterDeck } from './types'

export const ch14Deck: ChapterDeck = [
  {
    id: 's14-1',
    chapter: 14,
    kind: 'concept',
    front: 'What does a varying-slopes model learn that varying intercepts alone cannot?',
    back: 'That clusters differ not only in baseline but in how strongly they respond to a predictor — and, through the correlation term, whether high-baseline clusters also tend to have steeper slopes. It pools intercepts and slopes together.',
  },
  {
    id: 's14-2',
    chapter: 14,
    kind: 'concept',
    front: 'Why estimate the correlation between varying intercepts and slopes instead of assuming it is zero?',
    back: 'Because a cluster’s intercept often tells you something about its slope — cafés with long morning waits swing more by afternoon. Letting the two effects inform each other tightens the estimates of both.',
  },
  {
    id: 's14-3',
    chapter: 14,
    kind: 'concept',
    front: 'What is a Gaussian process doing in the islands-and-tools example?',
    back: 'It places a covariance over a continuous input — distance — so nearer islands get more-correlated intercepts, without chopping distance into bins. The kernel turns “closer means more alike” into a smooth function the model estimates.',
  },
  {
    id: 's14-4',
    chapter: 14,
    kind: 'code',
    front: 'What does (1 + x | group) estimate?',
    code: 'brm(y ~ 1 + x + (1 + x | group), data = d, ...)',
    back: 'A varying intercept and a varying slope on x for each group, plus the correlation between them, all drawn from one multivariate Normal. The model learns two standard deviations and the intercept–slope correlation.',
  },
]
