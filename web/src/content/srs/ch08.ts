import type { ChapterDeck } from './types'

export const ch08Deck: ChapterDeck = [
  {
    id: 's8-1',
    chapter: 8,
    kind: 'concept',
    front: 'What can an interaction term do that a purely additive model cannot?',
    back: 'Let the slope of one predictor depend on the value of another. An additive model forces every effect to be the same everywhere; an interaction lets one effect bend as a second variable changes.',
  },
  {
    id: 's8-2',
    chapter: 8,
    kind: 'trap',
    front: 'You read the main-effect coefficient in a model with an interaction as “the effect of X”. Why is that wrong?',
    back: 'With an interaction present, the coefficient on X is its slope only where the other predictor equals zero. Away from that point the effect differs. Read effects from the whole model across values of the moderator, not from one number.',
  },
  {
    id: 's8-3',
    chapter: 8,
    kind: 'concept',
    front: 'Why does the book insist an interaction is symmetric?',
    back: 'The interaction is a single product term, and algebra can’t say which variable moderates which. “Does ruggedness depend on continent” and “does continent depend on ruggedness” share one coefficient. Which story you tell is rhetoric, not statistics.',
  },
  {
    id: 's8-4',
    chapter: 8,
    kind: 'code',
    front: 'Expand what water * shade includes in this formula.',
    code: 'brm(blooms ~ water * shade, data = tulips, ...)',
    back: 'Three terms: water, shade, and their product water:shade. The star is shorthand for both main effects plus the interaction. Drop a main effect only when you have a specific reason to force it out.',
  },
]
