import type { ChapterHints } from './types'

/**
 * Chapter 16 hint ladders. Scientific models built from domain knowledge:
 * the cylinder height model, the nut-cracking growth curve, and the
 * lynx–hare differential equations. Original brms/Stan translations
 * validated against the manual's numerical results only.
 */
export const ch16Hints: ChapterHints = {
  '16M1': {
    paraphrase: 'Modify the cylinder weight model to let the height exponent be a free parameter instead of fixed at 3.',
    concept: 'Freeing the exponent tests whether the geometry the theory assumes is the geometry the data show.',
    strategy: 'Replace the fixed cube with weight ∝ height^b and put a prior on b centered on 3.',
    skeleton: `w[i] ~ dlnorm(log(k) + b * log(h[i]), sigma)
b ~ dnorm(3, 0.5)
k ~ ...`,
    solution:
      'Letting the exponent float, the posterior for b concentrates near 3 — the value pure geometry predicts for a shape that scales uniformly. A value below 3 would mean people get relatively lighter as they grow taller (stretching), above 3 relatively heavier (widening). That the data agree with 3 is a small triumph for the scientific model: the cube was not fit from the numbers, and the numbers endorse it anyway. The exercise shows how to test a mechanistic assumption rather than merely impose it.',
  },
  '16M2': {
    paraphrase: 'Explore how the priors on the cylinder model constant and error shape the prior predictive weights.',
    concept: 'Priors on a mechanistic model must produce physically reasonable people before seeing data.',
    strategy: 'Simulate weights from the priors across the height range and check they stay positive and sensible.',
    solution:
      'Because the model is multiplicative and on a log scale, careless priors on the constant produce prior-predictive people who weigh grams or tonnes. Simulating from the priors before fitting shows whether the implied weight-at-mean-height is plausible and whether the lognormal error keeps predictions positive. Tightening the constant\'s prior around a realistic density fixes it. The general discipline is the chapter 4 lesson applied to a scientific model: the prior lives on interpretable physical quantities, so you can check it against what a person could actually weigh.',
  },
  '16M3': {
    paraphrase: 'Alter the lynx–hare model — change a rate or the observation model — and describe the effect on the predicted cycles.',
    concept: 'The differential-equation parameters control the period and amplitude of the cycle, not the levels directly.',
    strategy: 'Change one rate at a time, integrate, and read the change in cycle shape and the fit to the pelt data.',
    solution:
      'Raising the predation rate shortens and tightens the cycle; lowering the lynx death rate lets predators overshoot and crash harder. Because the parameters act through the integrated trajectory, none of them maps to a single feature of the data — you have to solve the equations to see what a change does, which is the defining property of this kind of model. Swapping the observation model (say, from lognormal to a different measurement process for pelts) mostly rescales the fit without changing the underlying dynamics.',
  },
  '16H1': {
    paraphrase: 'Fit the Panda nut-opening data with a scientific growth model relating strength to age, and interpret.',
    concept: 'A mechanistic growth curve links opening rate to strength, which grows with age toward an asymptote.',
    strategy: 'Model strength as an increasing function of age approaching a maximum, and let nut-opening rate depend on strength.',
    skeleton: `# strength grows toward an asymptote with age
# opening rate is a power of strength
lambda[i] <- phi * (1 - exp(-k * age[i]))^theta
nuts[i] ~ dpois(lambda[i] * seconds[i])`,
    solution:
      'The model says chimpanzees crack more nuts as they grow stronger, and strength rises with age toward a plateau rather than linearly. Fitting the exponential-approach-to-asymptote form for strength, with opening rate a power of strength, captures the sharp rise in young adults and the leveling off in mature ones that a straight Poisson regression on age would miss. The parameters are interpretable — a growth rate, an asymptotic strength, an efficiency exponent — which is exactly what a scientific model buys over a flexible curve: each number means something about pandas.',
  },
  '16H2': {
    paraphrase: 'Fit the lynx–hare differential-equation model to the pelt data and assess how well it recovers the cycles.',
    concept: 'The full model couples the Lotka–Volterra ODE to an observation model for pelts.',
    strategy: 'Solve the ODE inside the model, treat pelts as noisy observations of the populations, and fit the rates plus the observation error.',
    skeleton: `# in Stan via brms custom / ulam: integrate the ODE,
# then pelts ~ lognormal(log(p * population), sigma_obs)`,
    solution:
      'Coupling the Lotka–Volterra equations to a lognormal pelt-observation model, the fit recovers the roughly ten-year cycle and the phase lag between hare peaks and the lynx peaks that follow them. The posterior over the four rates is wide and correlated, because many rate combinations produce similar cycles, and the pelt data are noisy proxies for the true populations. The exercise is the chapter\'s culmination: a model with no closed-form likelihood, solved numerically inside the sampler, fitting a real ecological time series through the mechanism that generated it.',
  },
}
