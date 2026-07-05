import type { ChapterDeck } from './types'

export const ch17Deck: ChapterDeck = [
  {
    id: 's17-1',
    chapter: 17,
    kind: 'concept',
    front: 'Why does the book end on “horoscopes”? What is the warning?',
    back: 'That a procedure can look rigorous and precise while being unfalsifiable and vague — like a horoscope. Ritualized statistics, a default model or a lone p-value, can dress up a weak inference. The cure is stated assumptions and a model tied to a real question.',
  },
  {
    id: 's17-2',
    chapter: 17,
    kind: 'concept',
    front: 'Name one honest thing your fitted golem cannot do.',
    back: 'It cannot check its own assumptions — the DAG, the likelihood, the priors all came from you. It answers the small-world question exactly and stays silent on whether the small world matches the large one.',
  },
  {
    id: 's17-3',
    chapter: 17,
    kind: 'trap',
    front: 'You report a tight posterior interval as though it were the whole truth. What uncertainty did you leave out?',
    back: 'Model uncertainty. The interval is conditional on this model being right; it says nothing about the chance the structure is wrong. Compare models, check predictions, and state plainly what would change your mind.',
  },
]
