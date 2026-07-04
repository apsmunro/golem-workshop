# DAG Sandbox

## Pedagogical goal

Make conditioning a physical act with visible consequences. The learner
clicks nodes into the conditioning set, watches back doors open and close,
then presses "simulate" and sees what the equivalent regression would
actually estimate — bias as a number you produced, not a warning you read.

Covers the causal spine of chapters 5–6: forks, pipes, colliders,
post-treatment bias, and the haunted-DAG collider.

## Interaction spec

- **Presets**: the three elemental confounds plus waffles, milk, fungus,
  grandparents. Each pins an exposure and outcome and a one-line story.
  (Freehand DAG editing is deliberately out of v1; logged for later.)
- **Conditioning**: click any plain node. Brass fill = conditioned.
  Exposure, outcome, and unobserved nodes refuse the click.
- **Paths panel**: every path exposure↔outcome with arrows, live-labeled:
  causal path open (brass) / blocked (danger — you cut the thing you
  wanted to measure), back door closed (quiet) / OPEN (danger).
- **Adjustment sets**: minimal backdoor sets, or "no adjustment needed",
  or "out of reach" when unobserved nodes make it impossible.
- **The estimate**: simulates 5,000 observations from the graph
  (linear-Gaussian, unit noise, preset coefficients) and fits OLS with
  and without the current conditioning set. Truth as a hairline, biased
  estimates in clay, honest ones in brass. Fresh seed each press so
  learners see sampling noise too.

## Engine

`engine.ts`: d-separation and minimal backdoor adjustment sets by exact
path enumeration and subset search (graphs are ≤ 8 nodes). Validated
against known results — waffles admits exactly {S} and {A, M}.
`sim.ts`: topological simulation + OLS via normal equations, tested for
coefficient recovery and the four canonical bias stories.
