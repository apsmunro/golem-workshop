# Interaction Surface

## Pedagogical goal

An interaction means the slope itself has a slope. Chapter 8's two cases —
terrain ruggedness whose effect on GDP reverses between Africa and elsewhere,
and tulip blooms where shade throttles the benefit of water — become one
instrument: pick a moderator value, watch the regression line tilt, and read
the slope-versus-moderator "bowtie" that is the interaction coefficient made
visible.

## Interaction spec

1. Left panel: scatter of the data. Points near the chosen moderator value
   at full strength, the rest receded. The fitted line at that moderator
   value in brass with its 89% band.
2. Moderator control: chips for a binary moderator (Africa / not Africa),
   a slider for a continuous one (shade).
3. Right panel: the slope of x as a function of the moderator, with its
   band and a hairline at zero. A flat line here means no interaction;
   a line crossing zero means the effect reverses — rugged's punchline.
4. Presets wired from real data: `rugged.csv` (log GDP standardized, terrain
   ruggedness, continent) and `tulips.csv` (blooms, water, shade, centered).

## Engine

Pure OLS with the design [1, x, m, x·m]; covariance σ̂²(XᵀX)⁻¹ gives honest
bands for the conditional line and the conditional slope (delta-free, exact
under the linear-Gaussian model). Tests pin exact recovery on noiseless
interaction data, the slope-at-moderator algebra, and the rugged sign flip
on the shipped dataset (parsed from an inline fixture).
