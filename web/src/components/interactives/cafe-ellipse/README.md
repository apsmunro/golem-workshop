# Café Ellipse — correlated varying effects (Ch. 14)

**Pedagogical goal.** Make the *covariance* in a varying-slopes model do
visible work. Each café has an intercept (morning wait) and a slope
(afternoon effect); across cafés these co-vary. A varying-slopes model puts
a 2-D Gaussian prior on the pair, and partial pooling then shrinks each noisy
café toward a tilted ellipse rather than a point — so learning about one
coordinate updates the other.

**What it shows.** Twenty simulated cafés (m14.1 parameters) as raw estimates
(open bone) and their partial-pooled positions (brass), joined by shrinkage
segments. The adaptive prior is drawn as a verdigris ellipse at 1 and 2 sd,
centered on the brass population-mean cross.

**Interaction.** Sliders for the correlation ρ and the two standard
deviations reshape the prior ellipse live. With ρ negative the ellipse tilts
down and the shrinkage runs along it; at ρ = 0 the pull is strictly
axis-aligned. The shrinkage is the exact Gaussian conjugate update
`θ̂ = (Σ⁻¹ + S⁻¹)⁻¹(Σ⁻¹μ + S⁻¹x̂)`.

**Correctness.** `engine.test.ts` checks the 2×2 inverse/matrix-vector
algebra, the two shrinkage limits (no noise → keep raw; no prior width →
collapse to the mean), that a correlated prior moves the slope when only the
intercept is off, and the ellipse geometry on a known covariance.

Demo: `/dev/cafe`.
