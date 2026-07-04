# Overfit the Polynomial

## Pedagogical goal

Chapter 7's core claim, made physical: fit to sample always improves as a
model gains parameters, while prediction of new data does not. The learner
fits polynomials of rising degree to a small sample, *commits to a guess*
about which degree will predict best (predict-before-reveal), then scores
every golem against data it has never seen.

## Interaction spec

1. A training sample (n = 12) from a fixed quadratic-ish process appears as
   bone points. Degree chips 1–6 fit and draw the curve live (brass).
2. Train deviance updates per degree and only ever falls — the trap.
3. The learner picks the degree they believe will predict *new* data best.
   Until they commit, test scores stay hidden.
4. Reveal: exact leave-one-out cross-validation deviance per degree (computed
   by honest refitting, no approximation) plus deviance on a large fresh test
   set (plum), drawn as the book's train/test U-plot. Their pick is marked;
   in/out verdict shown.
5. "Forge a new sample" re-draws training data. High-degree fits convulse
   between samples; low-degree fits barely move — variance made visible.
6. A comparison table (shared `ModelComparison` component, reused for T3
   artifacts in later chapters) ranks the degrees by LOO deviance with
   Akaike-style weights.

## Engine

Pure, deterministic under a seeded PCG32. OLS by normal equations with a
tiny ridge for numerical stability at high degree on standardized x. Scores
are deviances, −2·Σ log N(y | μ, σ̂). LOO refits n times per degree — exact,
not approximated. Tests pin: exact-recovery of polynomial data, monotone
train deviance, LOO/test minimum at the true degree, determinism.
