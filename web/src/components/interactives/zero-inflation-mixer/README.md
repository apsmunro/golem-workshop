# Zero-Inflation Mixer

## Pedagogical goal

m12.3's drinking monks, run as a year of simulated days. Zeros are
ambiguous evidence: the monastery drank, or it worked and finished
nothing. The learner mixes the two processes with sliders and watches
the zero column outgrow anything a plain Poisson can explain — the
clay dash marks the zeros λ̂ = ȳ can account for, and the gap above it
is the inflation. The reveal button colors the drinking zeros plum,
which is exactly the label the real data never carry; the point is
that the mixture model infers that split from the shape of the
nonzero counts.

## Interaction spec

1. Sliders: p(drink) and the work rate λ. A seeded 365-day simulation
   re-runs live; histogram bars in bone, the ZIP pmf overlaid as brass
   ticks.
2. The naive-Poisson zero prediction (from λ̂ = sample mean, which
   estimates (1−p)λ) drawn as a clay dash on the zero column.
3. "Reveal which zeros were wine" splits the zero bar: working zeros
   stay bone, drinking zeros turn plum. The P(0) = p + (1−p)e^{−λ}
   decomposition prints live in the header.

## Engine

Poisson and ZIP pmfs, the zero decomposition, seeded day simulation
that records the hidden state, cause-splitting histogram, naive λ̂.
Tests pin pmf normalization (1e-9), the closed-form zero probability,
simulation frequencies within 3 points of the pmf at n = 4000, that
drinking days never produce manuscripts, and that the naive rate
estimates (1−p)λ rather than λ.
