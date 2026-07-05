# Link Morpher

## Pedagogical goal

The one idea every GLM chapter leans on: the model is linear on the
link scale and curved on the outcome scale, and the two pictures are
the same object. The morph slider carries a straight brass line
continuously into the logistic S (or the exponential blade), while
gridlines drawn at equal steps of η travel along and visibly bunch at
the floor and ceiling. The probe drives home the corollary: on the
outcome scale there is no such thing as "the" effect of x — the slope
is β·p(1−p) under logit, β·λ under log, different everywhere.

## Interaction spec

1. Link toggle: logit or log. Sliders for α, β, a morph slider t from
   link scale (t = 0) to outcome scale (t = 1), and a probe x.
2. The curve interpolates pointwise between its two plot positions;
   left-edge labels (η) fade out as right-edge labels (p or λ) fade in.
3. Readout under the plot: η at the probe, its inverse-linked value,
   and the outcome-scale tangent slope next to the constant link-scale β.

## Engine

Pure functions. invLogit with tail guards, log link, outcome-scale
tangent slopes, pointwise morph interpolation, gridline positions.
Tests pin invLogit at 0 and ±log 3 (1e-9), the β/4 maximum slope at
p = 0.5, morph endpoints and linear-in-t interpolation, equal spacing
of gridlines at t = 0 and edge-bunching at t = 1.
