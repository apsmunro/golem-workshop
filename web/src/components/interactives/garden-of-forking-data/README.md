# Garden of Forking Data

## Pedagogical goal

Make Bayesian updating feel like counting, because at this resolution it *is*
counting. The learner picks a conjecture about the bag (or globe), draws data,
and watches incompatible paths through the garden wither. The path counts that
survive, normalized, are the posterior. No formula appears until the learner
has produced one by hand.

Covers book §2.1 (2E/2M problems lean on this directly).

## Interaction spec

- **Two modes, one engine.** Marbles: a bag of four marbles, each blue or
  white; five conjectures (0–4 blue). Globe: a four-sided "mini globe" with
  0–4 water faces, so proportions 0, ¼, ½, ¾, 1. Labels change; counting
  does not — that equivalence is the lesson.
- **Conjecture strip.** Five cards, each showing its bag as four engraved
  dots. Click one to plant its garden. Every card always shows its live path
  count and normalized plausibility bar (brass — this is the posterior being
  born), so the comparison across conjectures never leaves the screen.
- **Drawing data.** Two buttons append an observation (blue/white, or
  water/land). Undo removes the last. The tree redraws; paths that
  contradict the new datum fade to hairline ghosts (180ms, ease-out;
  no movement under `prefers-reduced-motion` — opacity only).
- **The tree.** Radial fan, book-style: ring *d* holds all 4^d paths of
  length *d*. Drawn for up to 3 observations (64 leaves); past that the
  garden is "too dense to draw" and the bars carry on alone — which is
  itself the point: counting scales, drawing does not.
- **Update again.** Ends the round: current counts become prior weights
  (verdigris ticks on the bars), observations reset, and the learner draws
  the next round of data. Sequential updating, made tactile.

## Engine

Pure counting, no React, seeded-RNG-free (nothing random here).
`pathCount(composition, total, observed)` is a product of per-draw ways;
`plausibilities` multiplies by prior counts and normalizes. Tree structure
from `buildTree`, laid out by the view.

Validated in `engine.test.ts` against the known marble counts: conjecture
counts for observing ⬤◯⬤ are 0 / 3 / 8 / 9 / 0, and a further ⬤ makes them
0 / 3 / 16 / 27 / 0.
