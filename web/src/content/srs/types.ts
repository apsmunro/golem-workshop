/**
 * Spaced-repetition deck types (CLAUDE.md §4.9, plan §4.9). One deck per
 * chapter; all text original. Three card kinds teach different muscles:
 *  - concept: a front/back recall of a load-bearing idea.
 *  - trap:    a scenario whose back names the bias or failure and the fix.
 *  - code:    a brms snippet on the front; the back reads what it fits.
 *
 * Cards seed into the SM-2 scheduler by `id` once their chapter is forged.
 * Ids are stable — never renumber a shipped card, or a learner's schedule
 * for it is orphaned. Add new cards with fresh ids at the end of a deck.
 */
export type SrsKind = 'concept' | 'trap' | 'code'

export interface SrsDeckCard {
  /** Stable, globally unique. Convention: `s{chapter}-{n}` (e.g. `s7-3`). */
  id: string
  chapter: number
  kind: SrsKind
  /** The prompt, shown before the reveal. */
  front: string
  /** The answer and its reasoning, shown after the reveal. */
  back: string
  /** Optional brms/code snippet shown with the prompt (code-reading cards). */
  code?: string
}

export type ChapterDeck = SrsDeckCard[]
