import type { ChapterDeck } from './types'

export const ch03Deck: ChapterDeck = [
  {
    id: 's3-1',
    chapter: 3,
    kind: 'concept',
    front: 'Why work with samples from the posterior instead of the posterior itself?',
    back: 'Once you hold draws, every summary — intervals, tail probabilities, predictions — becomes counting and averaging over samples. The same code works whether the posterior has one parameter or a hundred, and you never need its closed form.',
  },
  {
    id: 's3-2',
    chapter: 3,
    kind: 'trap',
    front: 'A 95% percentile interval and a 95% highest-density interval disagree on a skewed posterior. Which do you report?',
    back: 'They answer different questions. The percentile interval leaves equal mass in each tail; the highest-density interval is the narrowest span holding the mass. On a skewed or bounded posterior the highest-density one shows where the density actually sits; when the posterior is roughly symmetric they nearly coincide, so the simpler percentile interval is fine.',
  },
  {
    id: 's3-3',
    chapter: 3,
    kind: 'concept',
    front: 'What is a posterior predictive check, and what does it catch?',
    back: 'Simulate new observations from the posterior and compare them to the data you have. It reveals where the model’s own implied data miss the real data — misfit you would never see from parameter summaries alone.',
  },
  {
    id: 's3-4',
    chapter: 3,
    kind: 'trap',
    front: 'You report the single most probable parameter value (the mode) as your estimate. When does that mislead?',
    back: 'When the posterior is skewed or wide, the mode can sit far from where most of the mass is. Prefer the whole distribution; if you must pick one number, let the loss function choose — the mean minimizes squared loss, the median absolute loss.',
  },
]
