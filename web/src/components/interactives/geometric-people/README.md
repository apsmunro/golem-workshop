# Geometric People (Ch. 16)

**Pedagogical goal.** Show what a *scientific* model buys over a statistical
one. Treat a person as a cylinder — fixed proportions, fixed density — and
mass follows the cube of height by pure geometry. That one fact (m16.1) fits
the entire Howell census from infants to adults with a single free constant,
where an additive line has to bend and still misses both ends.

**What it shows.** Weight against height for all ages. A brass power-law curve
`weight = W̄·c·(height/H̄)^b` where the exponent b is a slider and the
multiplicative constant c is refit in closed form for whichever b is chosen.
"Compare a straight line" overlays the ordinary linear fit. The header reports
the current RMSE against the line's RMSE.

**Why it works.** Because the exponent is not fit from noise but supplied by
geometry, the error is a genuine minimum near b = 3; dragging away from 3 in
either direction raises the RMSE, and a straight line (b → 1) fails at the
infants and the tallest adults simultaneously.

**Correctness.** `engine.test.ts` generates people from an exact cube law and
checks that the constant reproduces it with zero error at b = 3, that the
exponent scan recovers 3, that a wrong exponent fits worse, that the best
power law beats a straight line, and that predictions are monotonic and match
the generating law.

Demo: `/dev/geometric`.
