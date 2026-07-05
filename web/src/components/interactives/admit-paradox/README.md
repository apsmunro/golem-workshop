# Admit Paradox

## Pedagogical goal

The UCBadmit lesson is not "Simpson's paradox exists"; it is that two
correct models answer two different causal questions. The gender-only
model estimates the total effect of gender on admission — real, and
routed through which department people apply to. Conditioning on
department asks the direct question and the six-department picture
flips the answer. The toggle is the interactive argument: same data,
same golem family, different question, different posterior.

## Interaction spec

1. Department panel: admission rates for men (filled bone, area ∝
   applications) and women (rings) across departments A–F, joined by
   hairlines. The selected model's expected rates overlay as brass
   dashes with 89% whiskers — the gender-only model visibly refuses to
   track the departments.
2. Contrast panel: posterior density of the male−female log-odds
   difference. Clay while the total model is selected (the number that
   fooled everyone), brass once department is conditioned on. PI and
   percentage-point readouts beneath.

## Engine

Parses the CSV's unnamed leading index column, then fits both models
by quap on the 12 aggregated binomial rows: m11.7 (a[gid], N(0, 1.5))
and m11.8 (a[gid] + d[dept]). Contrasts are returned on the log-odds
and probability scales, the direct-model probability contrast weighted
by department application shares. Tests pin the totals (4,526
applications, 1,198 admitted men), the +0.61 total contrast, the ≈−0.1
direct contrast, and the ~14-point probability gap of the total model.
