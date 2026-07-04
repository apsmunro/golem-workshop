# Calibration Sketch

## Pedagogical goal

Predict before reveal (plan §1, principle 1). Before the app shows any
posterior, the learner draws the shape they expect over a labeled axis.
The app scores the overlap between guess and truth and logs it, building
a calibration record across the whole course ("your intervals are too
narrow" feedback comes later, in the capstone).

Guessing first is the mechanism that turns a plot from something you look
at into something you were wrong about. That difference is retention.

## Interaction spec

- A canvas band over a labeled x-axis. Draw with pointer or touch; the
  stroke becomes the guess. Redraw freely — each stroke replaces the bins
  it crosses. "Clear" starts over.
- "Reveal" locks the sketch, overlays the true density (brass, house
  curve treatment), shows the score, and records `{id, chapter, score}`
  to the calibration store. One reveal per prompt; after reveal the
  sketch is frozen (the point is the honest first guess).
- Score = 1 − total variation distance between the normalized sketch and
  the normalized truth on the truth's grid. 1 means the shapes match;
  0 means no overlap at all. Displayed as a percentage with one decimal.
- The learner's guess renders in bone (it is *their* data about
  themselves); the truth in brass (it is a posterior).
- Keyboard: the canvas is focusable; arrow-key sketching is out of scope
  for v1 and logged as a Phase 7 a11y task.

## Engine

`sketchToDensity` bins pointer samples into the truth's x-grid (average y
per bin, linear interpolation across gaps between sketched bins, zero
outside the sketched range) and flips canvas y into height above the
baseline. `scoreSketch` = 1 − TV. Both pure; tests cover binning,
interpolation, and known-overlap scores.
