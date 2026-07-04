# Trace-Plot Triage

## Pedagogical goal

Chain care, chapter 9's closing craft. Reading a trace plot is pattern
recognition, and pattern recognition is trained by cases. The learner plays
workshop physician: a three-chain trace arrives, they name the ailment, the
instrument then reveals the diagnostics (split-R̂ and effective sample size,
computed for real by the engine) so the visual judgment and the numbers
learn to agree.

## Interaction spec

1. Each round shows 3 chains × 300 draws, one parameter, plus a clay rug of
   divergent transitions when present.
2. Five possible diagnoses: healthy; a stuck chain; chains that never found
   each other (not converged); divergent transitions clustering; warm-up
   left in the sample.
3. Learner commits a diagnosis, then gets the verdict, the computed R̂ and
   ESS, and two sentences on what gives the ailment away and what to do
   about it.
4. Deck of rounds is a seeded shuffle covering every ailment; score tallies
   across the visit.

## Engine

Pure, deterministic under seeded PCG32. Traces are AR(1) processes dressed
per pathology (flatline segment, separated means with high persistence,
dispersed unforgotten starts, funnel-style visits with divergence marks).
Split-R̂ follows Gelman et al.; ESS uses pooled autocorrelations truncated
at the first negative lag (Geyer-style, simplified). Tests pin: healthy
decks pass R̂ < 1.05, unconverged decks fail R̂ > 1.15, warm-up inflates R̂,
determinism, and full-deck coverage of the five ailments.
