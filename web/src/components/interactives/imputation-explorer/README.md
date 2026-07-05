# Imputation Explorer (Ch. 15)

**Pedagogical goal.** Show that missing data is not a reason to discard rows.
Neocortex percentage is missing for 12 of the 29 milk species; complete-case
analysis drops those rows and, with them, their kcal and body-mass
measurements. Bayesian imputation (m15.5) fills the missing neocortex using
its correlation with body mass, keeping every species and carrying honest
uncertainty about the filled-in values.

**What it shows.** Standardized neocortex against body mass. Observed species
are open bone points. Toggle imputation on and the 12 missing species appear
as brass points sitting on the N ~ M line, each with a ±1 residual-sd bar;
toggle it off and they collapse to clay ticks on the axis — deleted. The
header reports the downstream K ~ N + M neocortex slope computed both ways.

**Computation.** Neocortex is standardized over observed rows only. Missing
values are imputed from an OLS fit of N on M through the complete cases, with
the regression's residual sd as their uncertainty. The K ~ N + M model is then
fit by a 3×3 normal-equation solve on the 17 complete cases and again on all
29 rows with imputed neocortex.

**Correctness.** `engine.test.ts` checks NA parsing, that standardization uses
only observed neocortex, both OLS solvers against known coefficients, that
imputed values land exactly on the N ~ M line with positive uncertainty, and
the complete/total counts.

Demo: `/dev/imputation`.
