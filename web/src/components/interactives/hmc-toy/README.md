# HMC Physics Toy

## Pedagogical goal

Hamiltonian Monte Carlo is a marble flicked across a bowl whose shape is the
negative log posterior. Chapter 9 asks the learner to *feel* three things:
why gradient-guided proposals reach far without dying (contrast with
Metropolis), what the step size ε and path length L actually trade off, and
what a divergence physically is — the discretized marble gaining impossible
energy and flying out of the bowl. The funnel preset ships now and returns
in chapter 13, where divergences cluster in the neck and motivate
non-centered parameterization.

## Interaction spec

1. Canvas: the target density shaded on ink; accepted samples accumulate as
   brass points. "Flick the marble" draws one trajectory leapfrog step by
   leapfrog step (instant under `prefers-reduced-motion`); "Run" chains
   flicks continuously.
2. Knobs: step size ε, leapfrog steps L, and the bowl itself — round bowl
   (ρ = 0), the ridge (ρ = 0.9), and Neal's funnel.
3. A rejected trajectory flashes; a divergent one is drawn in clay and adds
   to the divergence tally. Push ε past the stability limit and watch the
   tally climb; push L so the marble U-turns and watch the waste.
4. Side rail: live trace of q₁, acceptance rate, sample count, divergences.

## Engine

Pure and deterministic under seeded PCG32. Analytic gradients for both
targets; standard leapfrog; Metropolis accept on −ΔH; a trajectory is
divergent when |ΔH| > 50 or energy stops being finite (Stan's notion,
simplified). Tests pin: energy conservation at small ε (|ΔH| < 1e-3),
high acceptance in the stable regime, guaranteed divergence past the
stability limit, and sample moments matching the correlated Gaussian
(tolerances in the test file header).
