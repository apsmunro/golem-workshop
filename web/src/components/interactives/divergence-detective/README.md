# Divergence Detective (Ch. 13)

**Pedagogical goal.** Show *where* divergences come from and *why*
non-centering fixes them, on the exact geometry a multilevel model makes.
Neal's funnel is the caricature: `v` is a cluster's log-variance and `x` a
parameter whose spread is `exp(v/2)`. The good step size in the mouth is far
too big for the neck, so one global ε cannot serve both — and the neck is
where the model must go to learn a variance near zero.

**Two panels, one model.**

- *Centered* — HMC directly on the funnel in `(x, v)`. Divergences (clay
  crosses) cluster in the neck; raising ε makes more; the chain can't reach
  low `v`.
- *Non-centered* — `v = 3r`, `x = z·exp(v/2)` with `z, r ~ Normal(0, 1)`.
  HMC walks a round bowl and the samples are transformed back into funnel
  space. Divergences vanish and the neck fills in.

**Interaction.** One ε slider drives both panels; "Resample" advances the
seed. The header keeps a live count of divergences in each parameterization
so the contrast is always on screen, and each panel reports the deepest `v`
its chain actually reached.

**Correctness.** `engine.test.ts` asserts the centered chain throws many more
divergences than the non-centered one at a shared step size, that the
non-centered chain reaches deeper into the neck, that the transform matches
`v = 3r, x = z·exp(v/2)`, and that runs are deterministic under a fixed seed.
The leapfrog integrator is shared with the chapter-9 HMC toy.

Demo: `/dev/divergence`.
