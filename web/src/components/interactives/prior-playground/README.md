# Prior Predictive Playground

## Pedagogical goal

Priors are claims about the world, and the only way to hear what they
claim is to simulate from them before touching data. The learner moves
prior sliders and watches the implied regression lines; lines that enter
a red zone (heights below zero, heights above the tallest person who
ever lived) turn clay. The chapter 4 argument — Normal(0, 10) slopes are
a monster factory, LogNormal(0, 1) is a sensible opinion — becomes a
number in the corner: "34 of 60 golems predict impossible people."

## Interaction spec

- Sliders for the intercept prior's mean and sd; a family toggle
  (Normal / LogNormal) and scale slider for the slope prior.
- 60 lines drawn from the current priors, verdigris (they are priors);
  offenders in clay. Red zones as clay 8% bands with dashed hairlines.
- "Draw fresh golems" resamples with a new seed; everything else is
  reactive to the sliders.
- Data never appears here. Prior predictive means prior.

## Engine

`drawPriorLines` (seeded) and `violations` (exact endpoint check —
a line's extremes on a closed interval are at the endpoints). The spec
object (x-range, centering point, red zones) is the config surface;
future chapters add specs, not code. Tests pin the chapter's argument:
Normal(0,10) slopes violate > 50% of the time, LogNormal(0,1) < 15%.
