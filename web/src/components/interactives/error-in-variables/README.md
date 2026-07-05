# Error-in-Variables (Ch. 15)

**Pedagogical goal.** Show that a measurement is a distribution, not a point,
and that ignoring its width lets noisy observations distort a regression. The
WaffleDivorce data ships each state's divorce rate with a standard error; the
small states have enormous ones. The measurement-error model (m15.1) treats
each true rate as a parameter and the observed value as a noisy draw, so the
regression becomes a prior and every point shrinks toward the line by how
little it can be trusted.

**What it shows.** Standardized divorce rate against median age at marriage.
Each state is an open bone point with a ±1 SE bar; toggling the error model on
draws the error-corrected value in brass, joined to the observed point, and
swaps the active regression line from the naive fit to the corrected one.

**Computation.** The Gaussian measurement-error model is fit by EM: given the
line, each true value is the precision-weighted average of its measurement and
the line's prediction; given the true values, the line is refit by OLS. A
hundred passes converge. Header reports both slopes.

**Correctness.** `engine.test.ts` checks SE-column parsing, OLS against a known
line, that a noisy outlier shrinks far more than the precise points, that the
corrected slope differs from the naive one and lands near the clean-line slope,
and that precise measurements barely move.

Demo: `/dev/error`.
