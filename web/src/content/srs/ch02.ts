import type { ChapterDeck } from './types'

export const ch02Deck: ChapterDeck = [
  {
    id: 's2-1',
    chapter: 2,
    kind: 'concept',
    front: 'What is the difference between the small world and the large world?',
    back: 'The small world is the self-consistent world of the model’s own assumptions, where Bayesian updating is provably optimal. The large world is the one you actually live in, where those assumptions may be wrong. A golem is only guaranteed to behave inside the small world.',
  },
  {
    id: 's2-2',
    chapter: 2,
    kind: 'concept',
    front: 'What three things must you specify before a model can produce a posterior?',
    back: 'A likelihood (how the data arise for each value of the unknowns), the parameters themselves, and a prior for each parameter. Feed those the data and the posterior follows by Bayes.',
  },
  {
    id: 's2-3',
    chapter: 2,
    kind: 'concept',
    front: 'In the garden of forking data, what is a prior really made of?',
    back: 'Counts. The prior is the number of ways each conjecture could already be true before the new data. Multiply by the ways the data could arise, normalize, and you have the posterior. A prior is just previously-counted possibilities.',
  },
  {
    id: 's2-4',
    chapter: 2,
    kind: 'trap',
    front: 'Your grid approximation of a posterior comes out jagged, with sharp spikes. What went wrong?',
    back: 'Too few grid points for how concentrated the posterior is — the spikes are the grid showing through, not features of the posterior. Add points until it smooths, or use a method that does not discretize the parameter.',
  },
]
