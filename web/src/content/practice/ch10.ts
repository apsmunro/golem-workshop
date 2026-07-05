import type { ChapterHints } from './types'

/**
 * Chapter 10 bench drills. The book gives this chapter no practice
 * section, so these three are the workshop's own — original tasks
 * built on the chapter's two instruments.
 */
export const ch10Hints: ChapterHints = {
  '10W1': {
    workshop: true,
    paraphrase:
      'With the pebble lever locked at mean 2.0, find the ten-pebble arrangement with the most ways — then explain why it is not ten pebbles in bucket 2.',
    concept:
      'Maximum entropy under a constraint spreads out as much as the constraint allows; it never stacks.',
    strategy:
      'Lock the lever at 2.0 in the simulator and chase the verdigris silhouette with pebble arrangements whose mean is exactly 2. Compare W for a stacked shape against a spread one at the same mean.',
    solution:
      'Ten pebbles in bucket 2 satisfies the constraint in exactly one way. Any shape that trades pebbles symmetrically outward at the same mean — say 1-2-3-4 across buckets 1 to 4 with a straggler — multiplies the orderings enormously. The champion is the discrete version of an exponential tilt: probabilities decaying geometrically away from the low buckets, the flattest shape whose average still lands on 2. The lesson generalizes to every maxent distribution in the chapter: the constraint is honored, and beyond it, nothing else is assumed.',
  },
  '10W2': {
    workshop: true,
    paraphrase:
      'A colleague calls Normal(0, 10) on an intercept "uninformative" for a logistic model. Use the morpher to show what it actually claims about probability, and find a σ that is closer to flat on p.',
    concept:
      'Priors must be judged on the scale where their consequences live — flat on the logit is extremist on the probability.',
    strategy:
      'Set the morph to the outcome scale and imagine η drawn from Normal(0, 10): almost every draw lands past ±4, where p has saturated. Then shrink σ until intermediate probabilities stop being rare.',
    solution:
      'Normal(0, 10) sends about two thirds of its mass beyond |η| = 4, and the inverse logit maps everything out there to p < 0.02 or p > 0.98 — the "uninformative" prior asserts that the event almost always happens or almost never does. Around σ ≈ 1.5 the implied distribution on p flattens; push σ toward 2.5 and the walls start rising again. There is no σ that is exactly flat on p (that would be logistic-distributed η with σ ≈ 1.8, not normal), but 1.5 is the working compromise the book leans on all through chapters 11 and 12.',
  },
  '10W3': {
    workshop: true,
    paraphrase:
      'With α = 0, β = 1 under the logit link, compute the change in p from x = 0 → 1 and from x = 3 → 4. Same β — why are the answers so different, and where is the +1 step worth the most?',
    concept:
      'On the outcome scale the effect of a predictor depends on where you already stand: the built-in interaction of every GLM.',
    strategy:
      'Read both probabilities off the probe at the four x values, or compute invlogit by hand. Then find the x where the tangent-slope readout peaks.',
    solution:
      'From x = 0 to 1, p moves from 0.500 to 0.731 — a gain of 23 points. From x = 3 to 4 it crawls from 0.953 to 0.982 — under 3 points. The same β buys eight times the effect depending on the neighborhood, because the outcome-scale slope is β·p(1−p), maximized at p = 0.5 where it equals β/4. Ceiling and floor eat everything near the edges. This is why chapter 11 keeps refusing to convert a logit coefficient into "percentage points" without first asking where on the curve the cases sit.',
  },
}
