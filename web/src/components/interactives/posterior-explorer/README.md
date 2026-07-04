# Posterior Explorer

## Pedagogical goal

One posterior, four questions: what does each parameter believe
(marginals), how do parameters lean on each other (pairs), does the
model reproduce the data it ate (PPC bands), and what does it predict
for a case it never saw (counterfactual slider)? The uncertainty
grammar is fixed by color: brass for the posterior and its μ band,
plum for simulated outcomes, bone for data. Learners meet that grammar
here and see it unchanged through chapter 16.

## Interaction spec

- Marginal density strips with mean and 89% PI in mono.
- Pairs scatters behind a toggle (a·b, a·σ, b·σ), thinned to 600 draws.
- Main panel: data scatter, posterior mean line, 89% μ band (brass),
  89% predictive band (plum). The predictive band must visibly contain
  the μ band — that gap *is* sampling noise, and the engine test pins it.
- Counterfactual slider: pick an x, get the full simulated outcome
  density (plum), its mean, and the 89% interval. The dashed plum rule
  on the main plot tracks the slider.

## Engine and draws

`engine.ts` is pure (marginals, thinning, bands, predictAt) and tested
on real m4.3 draws. Draws come from the in-browser quap fit of Howell1
adults — the same approximation the book uses for these chapters. When
the r-pipeline produces brms artifacts, the wrapper swaps sources; the
explorer itself only ever sees a table of draws.
