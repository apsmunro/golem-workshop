# Kline Poisson

## Pedagogical goal

Two Poisson lessons in one instrument. First m11.10 on the Oceanic
tool kits: counts follow population on the log scale, contact level
moves the curve, and the natural-scale toggle shows why "linear in
log population" means "diminishing returns in people" — with Hawaii
sitting alone where the low-contact band has to reach. Second, the
offset: a monastery that logs weekly totals looks several times as
productive as one that logs daily, until the ledger's exposure enters
the model as log τ and the comparison becomes rates against rates.

## Interaction spec

1. Scatter of tools vs population (log-standardized or natural axis),
   ten societies, filled = high contact. Posterior mean curves and 89%
   bands per contact level from the in-browser m11.10 fit; solid brass
   = high contact, dashed = low.
2. Exposure lab: a slider for the second monastery's days-per-record
   and a checkbox for the log-exposure offset. Its estimated rate bar
   turns clay while the bookkeeping fools the model and brass when the
   offset makes the rates commensurable.

## Engine

Kline.csv parsing with in-engine log-pop standardization; m11.10 by
quap (a ~ N(3, 0.5), b ~ N(0, 0.2) per contact level); posterior
expected-tools curves with PIs; seeded Knuth Poisson simulation and
closed-form rate MLEs (Σy/Στ with offset, ȳ without). Tests pin the
ten societies and standardization, intercepts within ±0.3 of the
book's m11.10 means, monotone curves, the high-contact advantage at
average population, Poisson simulation calibration, and exact 7×
inflation when a weekly ledger is read as daily.
