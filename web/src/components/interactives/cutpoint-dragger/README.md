# Cutpoint Dragger

## Pedagogical goal

Ordered categories confuse because the parameters live on a latent
axis nobody observes. Here the axis is physical: a logistic density,
six brass cutpoints to drag, and seven bars that respond. The learner
matches the Trolley data's response histogram by hand — feeling that
cutpoints *are* cumulative log-odds — then presses reveal and finds
the fitted values were nothing more mysterious than logits of
cumulative proportions. The φ slider teaches the second half of the
model: a predictor never moves the cutpoints, it slides the whole
story along the axis, and mass leaks across every threshold at once.

## Interaction spec

1. Latent axis: standard logistic density (bone), six draggable brass
   cutpoint handles (pointer or arrow keys), constrained to stay
   ordered.
2. Bar panel: implied category probabilities (brass) against observed
   proportions (bone dashes) for the selected story cell — all stories
   or any of the six action/intention/contact combinations from the
   shipped Trolley aggregate. Match scored as 1 − total variation.
3. φ slider shifts the density under fixed cutpoints; "reveal" jumps
   to the closed-form MLE cutpoints for the current selection.

## Engine

Cumulative-logit category probabilities, closed-form intercept-only
cutpoints (logit of cumulative proportions), logistic pdf, order-
preserving drag clamping, mean response. Tests pin sum-to-one, the
mass-shift direction under φ, the exact round trip counts → cutpoints
→ proportions, the book's m12.4 cutpoints (−1.92 … 1.77 within
±0.03) from the shipped 9,930-judgment aggregate, and that intended
contact is the harshest story cell.
