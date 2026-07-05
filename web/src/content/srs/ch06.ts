import type { ChapterDeck } from './types'

export const ch06Deck: ChapterDeck = [
  {
    id: 's6-1',
    chapter: 6,
    kind: 'trap',
    front: 'You control for every variable you can measure and the estimate still looks wrong. How can adding controls hurt?',
    back: 'Conditioning on a collider (or its descendant) opens a non-causal path and manufactures a spurious association. Conditioning on a post-treatment variable blocks part of the effect you wanted. More controls is not more correct — the DAG says which belong.',
  },
  {
    id: 's6-2',
    chapter: 6,
    kind: 'concept',
    front: 'What is collider bias, in one sentence with an example?',
    back: 'Conditioning on a common effect of two causes makes those causes look related in the conditioned data — among hired actors, talent and looks appear to trade off even if independent in the population, because selection is the collider.',
  },
  {
    id: 's6-3',
    chapter: 6,
    kind: 'trap',
    front: 'In the plant example, adding “presence of fungus” makes the anti-fungal treatment look useless. Why?',
    back: 'Fungus is post-treatment — it is how the treatment acts. Conditioning on it blocks the causal path and hides the effect. To estimate the total treatment effect, leave the mediator out of the model.',
  },
  {
    id: 's6-4',
    chapter: 6,
    kind: 'concept',
    front: 'Why can conditioning on a variable that is only correlated with a collider still bias you?',
    back: 'Conditioning on a descendant partly conditions on its parent. If that parent is a collider or confounder, some of the bias leaks through. Draw the full DAG, proxies included, before choosing what to adjust for.',
  },
]
