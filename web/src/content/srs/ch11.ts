import type { ChapterDeck } from './types'

export const ch11Deck: ChapterDeck = [
  {
    id: 's11-1',
    chapter: 11,
    kind: 'code',
    front: 'What scale are these coefficients on, and how do you read one?',
    code: 'brm(pulled_left ~ 1 + treatment + (1 | actor),\n    family = bernoulli(), data = chimps, ...)',
    back: 'Log-odds. A coefficient is the change in the log-odds of pulling left per unit of the predictor. Exponentiate for an odds ratio, or push it through the logistic to get probabilities, which are much easier to reason about.',
  },
  {
    id: 's11-2',
    chapter: 11,
    kind: 'trap',
    front: 'You compare two logit coefficients and conclude one effect is “twice as big”. Why is that risky?',
    back: 'Log-odds are not linear in probability. The same coefficient moves probability a lot near 0.5 and almost nothing near 0 or 1. Compare effects on the outcome scale at predictor values that matter, not the raw parameters.',
  },
  {
    id: 's11-3',
    chapter: 11,
    kind: 'concept',
    front: 'In a Poisson model, what is an offset (exposure), and when do you need one?',
    back: 'The log of the observation window — time, area, number of trials — added with its coefficient fixed at 1. It lets you model a rate when observations were gathered over different-sized windows, like manuscripts counted per day versus per week.',
  },
  {
    id: 's11-4',
    chapter: 11,
    kind: 'trap',
    front: 'Total admissions look biased against women, yet within every department they aren’t. What is going on?',
    back: 'Simpson’s paradox through a mediator. Department sits on the path — women applied more to competitive departments. Condition on department for the direct effect; the aggregate blends admission rate with where people applied.',
  },
]
