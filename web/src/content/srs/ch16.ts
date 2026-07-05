import type { ChapterDeck } from './types'

export const ch16Deck: ChapterDeck = [
  {
    id: 's16-1',
    chapter: 16,
    kind: 'concept',
    front: 'What separates a scientific model like weight ∝ height³ from a generic GLM?',
    back: 'The GLM is a flexible curve-fitter with off-the-shelf link functions; the structural model encodes a mechanism — mass scales with volume — so its parameters carry meaning and it extrapolates on principle rather than on convenience.',
  },
  {
    id: 's16-2',
    chapter: 16,
    kind: 'concept',
    front: 'Why can a model built from theory use fewer parameters yet fit better?',
    back: 'The theory supplies structure the data would otherwise have to estimate. Fixing the height-cubed shape leaves only a density constant to fit. When the mechanism is real, the right structure beats flexible curve-fitting.',
  },
  {
    id: 's16-3',
    chapter: 16,
    kind: 'concept',
    front: 'A Lynx–Hare model is fit by solving its differential equations for each parameter draw. What does that buy over regressing on the counts?',
    back: 'It enforces the predator–prey dynamics that generate the cycles, so the parameters are birth and death rates with real meaning and the fit obeys the mechanism — instead of drawing an arbitrary wavy line through the pelts.',
  },
  {
    id: 's16-4',
    chapter: 16,
    kind: 'trap',
    front: 'A purely statistical curve extrapolates to negative sizes or impossible values. How does a scientific model avoid that?',
    back: 'Its functional form is bounded by the mechanism — a volume cannot be negative, a proportion stays in range. Structure taken from the science constrains predictions where a flexible curve would run off the rails.',
  },
]
