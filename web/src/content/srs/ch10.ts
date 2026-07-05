import type { ChapterDeck } from './types'

export const ch10Deck: ChapterDeck = [
  {
    id: 's10-1',
    chapter: 10,
    kind: 'concept',
    front: 'What does “choose the maximum-entropy distribution consistent with your constraints” mean in practice?',
    back: 'Pick the distribution that spreads probability as evenly as it can while still respecting what you know — the support, a mean, a variance, a count. It is the flattest, least-committed choice, the one that can arise the most ways.',
  },
  {
    id: 's10-2',
    chapter: 10,
    kind: 'concept',
    front: 'What is a link function, and why does a GLM need one?',
    back: 'It maps the linear predictor, which ranges over all reals, onto the valid range of the parameter — logit for a probability in (0,1), log for a positive rate. Without it a linear model would happily predict impossible values.',
  },
  {
    id: 's10-3',
    chapter: 10,
    kind: 'trap',
    front: 'You put Normal(0, 10) on a coefficient on the logit scale, thinking it vague. What does it really imply?',
    back: 'On the probability scale it heaps mass near 0 and 1 — it says outcomes are almost surely certain. Flat on the logit scale is not flat on the probability scale; a Normal(0, 1.5) is far closer to uniform there.',
  },
  {
    id: 's10-4',
    chapter: 10,
    kind: 'concept',
    front: 'Why is the binomial the maximum-entropy distribution for a count of successes out of a fixed number of trials?',
    back: 'Given only two outcomes, a known number of trials, and a constant expected count, the binomial assumes nothing further. Any other distribution over that setup smuggles in extra structure you did not claim to know.',
  },
]
