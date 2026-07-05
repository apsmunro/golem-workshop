/**
 * Hint-ladder content types. All text is original (CLAUDE.md §4):
 * problems are referenced by ID plus at most a one-line paraphrase;
 * solutions are fresh code and commentary validated against numerical
 * results only.
 */
export interface ProblemHints {
  /** One original line orienting the learner; never book text. */
  paraphrase: string
  /** Tier 1 — which idea this problem exercises. */
  concept: string
  /** Tier 2 — how to attack it, no code. */
  strategy: string
  /** Tier 3 — code skeleton with ___ blanks (omit for pure-reasoning problems). */
  skeleton?: string
  /** Tier 4 — full worked solution and interpretation. */
  solution: string
  /**
   * Original workshop drill with no book counterpart (used for
   * chapter 10, which has no end-of-chapter practice). The paraphrase
   * carries the full task.
   */
  workshop?: boolean
}

export type ChapterHints = Record<string, ProblemHints>
