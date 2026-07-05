import type { ChapterDeck } from './types'

export const ch12Deck: ChapterDeck = [
  {
    id: 's12-1',
    chapter: 12,
    kind: 'concept',
    front: 'What does a zero-inflated model say that a plain Poisson can’t?',
    back: 'That zeros come from two processes — a structural “never happens” switch and the ordinary count process, which can also land on zero. Modeling a probability for the switch plus a rate keeps the model from mistaking excess zeros for a low rate.',
  },
  {
    id: 's12-2',
    chapter: 12,
    kind: 'concept',
    front: 'In an ordered-categorical model, what do the cutpoints represent?',
    back: 'Thresholds on a latent continuous scale that slice it into the ordered response levels. They are cumulative log-odds of being at or below each level; a predictor shifts the whole latent distribution across the fixed cuts.',
  },
  {
    id: 's12-3',
    chapter: 12,
    kind: 'trap',
    front: 'Your count data have variance far above their mean and you fit a Poisson. What breaks, and what’s the fix?',
    back: 'Over-dispersion. A Poisson forces variance to equal the mean, so its intervals come out far too narrow. Add a dispersion parameter with a gamma-Poisson (negative binomial) or a varying intercept to soak up the extra spread.',
  },
  {
    id: 's12-4',
    chapter: 12,
    kind: 'concept',
    front: 'Why does adding a predictor to an ordered logit shift the response distribution rather than reshape it?',
    back: 'The cutpoints are fixed and shared, so a predictor only moves the latent mean, sliding mass across every threshold at once. To let categories widen or narrow you would have to let the predictor act on the cutpoints too.',
  },
]
