# Shrinkage Theater (Ch. 13)

**Pedagogical goal.** Make partial pooling felt, not just defined. The
reedfrog tanks vary in how many tadpoles they started with; the estimate a
tank deserves depends on how much it knows. Complete pooling ignores the
tanks; no pooling trusts each one blindly; partial pooling learns how much
to trust each from the whole pond.

**The three estimators.**

- *No pooling* — `surv / density`, one estimate per tank, no borrowing.
- *Complete pooling* — `Σ surv / Σ density`, a single probability for all.
- *Partial pooling* — `α_tank ~ Normal(ᾱ, σ)`. Each tank's posterior mean
  is computed exactly for a given σ by 1-D quadrature over the logit-scale
  intercept, so 100%-survival tanks stay finite and small tanks shrink
  hardest toward ᾱ.

**Interaction.** A σ slider is the "prior width" knob: σ → 0 collapses every
tank onto the grand mean (complete pooling), σ → ∞ frees each to its raw
value (no pooling). "Play the trade-off" animates the sweep so the brass
estimates visibly rush the dashed grand-mean line and spring back to the
book's σ = 1.6. Circle radius encodes tank size; the ten-tadpole tanks move
the most.

**Correctness.** `engine.test.ts` checks the pooling summaries against the
total-survivor ratio, that a 100%-survival tank never reaches 1, that
shrinkage always points toward the mean and never past it, and that at a
fixed distance small tanks shrink more than large ones. Validated against
the reedfrog analysis of *Statistical Rethinking* §13.1 (ᾱ ≈ 1.4).

Demo: `/dev/shrinkage`.
