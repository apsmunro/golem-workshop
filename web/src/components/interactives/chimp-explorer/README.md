# Chimp Explorer

## Pedagogical goal

Chapter 11's binomial heart: m11.4 on the prosocial-option experiment,
with the two lessons the raw coefficients hide. First, the treatment
question — did adding a partner move any lever? The posterior contrasts
say no, and the learner reads that from densities hugging zero on
either scale. Second, the scale question: log-odds effects and
probability effects are different numbers answering different
questions, and the toggle makes the same posterior wear both. The
actor grid shows why the model needed seven intercepts — actor 2's
handedness dwarfs every treatment.

## Interaction spec

1. Contrast panel: posterior densities of the partner effect for each
   prosocial side (b3 − b1 and b4 − b2), with 89% PIs printed beneath.
   Scale toggle switches to average-actor differences in Pr(pull left).
2. Actor grid: 7 actors × 4 treatments; bone rings mark observed
   proportions, brass points and whiskers the posterior mean and 89%
   interval. Actor 2 is flagged.

## Engine

Aggregates the 504 trials into 28 binomial cells (identical
likelihood), then fits m11.4 by quap: 7 actor intercepts ~ N(0, 1.5),
4 treatment effects ~ N(0, 0.5), Nelder–Mead started at empirical
logits. Tests pin the aggregation exactly (28 cells × 18 trials),
actor 2's intercept > 2.5, all four treatment MAPs within ±0.25 of the
book's posterior means, near-zero partner contrasts, and determinism.
