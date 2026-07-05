import type { ChapterHints } from './types'

/**
 * Chapter 15 hint ladders. Measurement error first, then missing data and
 * imputation, then the full re-analyses. Solutions are original brms
 * translations validated against the manual's numerical results only.
 */
export const ch15Hints: ChapterHints = {
  '15E1': {
    paraphrase: 'Rewrite the milk model so that the outcome (kcal) is observed with a known standard error.',
    concept: 'A measured outcome is a noisy view of a true value that becomes a parameter.',
    strategy: 'Add a latent true kcal for each case, with the observation Gaussian around it and the regression as the prior on the true value.',
    skeleton: `K_obs[i] ~ dnorm(K_true[i], K_sd[i])
K_true[i] ~ dnorm(mu[i], sigma)
mu[i] <- a + bN * N[i]`,
    solution:
      'Introduce a parameter K_true for each observation. The observed kcal is a Gaussian draw around it with the reported SE, and the regression line becomes the prior: K_true ~ Normal(a + bN·N, σ). The model now estimates the true values jointly with the coefficients, and each observation is pulled toward the line in proportion to its measurement error. In brms this is the `me()` term on the response side; by hand it is exactly the extra layer written above.',
  },
  '15E2': {
    paraphrase: 'Rewrite the model so that a predictor is observed with error instead of the outcome.',
    concept: 'Error on a predictor needs a model for the predictor itself.',
    strategy: 'Give the true predictor a distribution, treat the observed predictor as noisy around it, and use the true value in the linear model.',
    skeleton: `N_obs[i] ~ dnorm(N_true[i], N_sd[i])
N_true[i] ~ dnorm(nu, sigma_N)
mu[i] <- a + bN * N_true[i]`,
    solution:
      'Error in a predictor is harder than error in an outcome, because the true predictor now needs its own prior distribution — you cannot condition on a value you do not know. Give N_true a population distribution, let the observed N be noisy around it, and put N_true into the linear model. brms writes this as `me(N, N_sd)`. The consequence is regression dilution: ignoring predictor error biases the slope toward zero, and modeling it recovers the steeper true relationship.',
  },
  '15E3': {
    paraphrase: 'Describe what changes when both a predictor and the outcome are measured with error in the same model.',
    concept: 'Two error layers, each with its own latent true values.',
    strategy: 'Stack the two constructions; the latent predictor feeds the linear model that is the prior for the latent outcome.',
    solution:
      'You carry two sets of latent parameters — true predictors and true outcomes — with the observed versions Gaussian around each. The true predictor enters the linear model, which is the prior for the true outcome, which the observed outcome measures. The posterior has to disentangle two sources of noise from the signal, so intervals widen honestly and the point estimate lands between the naive fit and the fully corrected one. The lesson is that error anywhere in the chain is a modeling problem, not a data-cleaning one.',
  },
  '15M1': {
    paraphrase: 'Modify the divorce measurement-error model to also treat the marriage-rate predictor as measured with error.',
    concept: 'Both divorce and marriage rates carry state-level standard errors.',
    strategy: 'Add a latent true marriage rate with the observed value noisy around it, and use the true value in the linear model for divorce.',
    skeleton: `D_obs[i] ~ dnorm(D_true[i], D_sd[i])
M_obs[i] ~ dnorm(M_true[i], M_sd[i])
D_true[i] ~ dnorm(a + bA*A[i] + bM*M_true[i], sigma)`,
    solution:
      'Both rates are estimates from finite samples, so both get latent true values. Modeling the marriage-rate error as well as the divorce-rate error shrinks the noisy small states on both axes and generally weakens the apparent marriage→divorce association further, because some of what looked like a relationship was two noisy measurements sharing the same small-sample noise. The divorce–age relationship is more stable, since age at marriage is measured precisely.',
  },
  '15M2': {
    paraphrase: 'Refit the milk model imputing missing neocortex, and compare the neocortex slope to the complete-case estimate.',
    concept: 'Imputation uses the predictors of the missing values to fill them in with uncertainty.',
    strategy: 'Give missing neocortex a distribution linked to body mass, fit jointly with the outcome model, and compare intervals.',
    skeleton: `N[i] ~ dnorm(nu, sigma_N)   # for observed and missing alike
nu <- aN + bNM * M[i]        # neocortex predicted by mass
K[i] ~ dnorm(a + bN*N[i] + bM*M[i], sigma)`,
    solution:
      'Model neocortex as a function of body mass so the missing values are imputed from the mass you do observe, then feed both observed and imputed neocortex into the kcal model. The point estimate of the neocortex effect barely moves relative to complete-case analysis, but the interval tightens because twelve more species now contribute their kcal and mass. The imputed neocortex values themselves come with posteriors — the model tells you how uncertain each guess is, rather than pretending the species never existed.',
  },
  '15M3': {
    paraphrase: 'Double all the divorce-rate standard errors and describe the effect on the measurement-error model.',
    concept: 'Bigger measurement error means more shrinkage toward the regression line.',
    strategy: 'Inflate the SEs and watch how far the estimated true values collapse onto the line.',
    solution:
      'Doubling the standard errors tells the model the measurements are half as trustworthy, so every state shrinks harder toward the regression line and the estimated true rates cluster tightly around it. In the limit of enormous SEs, the data carry no information and the true values become the line itself, with the slope determined entirely by the prior structure. The exercise makes the shrinkage dial explicit: the SE is exactly how much each observation is allowed to speak.',
  },
  '15H1': {
    paraphrase: 'Fit the full WaffleDivorce model with measurement error on both divorce and marriage rates, and interpret.',
    concept: 'Joint measurement-error model on two predictors and one outcome.',
    strategy: 'Latent true values for D and M, observed values Gaussian around them, regression on age and true marriage rate.',
    skeleton: `m15h1 <- brm(
  bf(D | mi(D_sd) ~ A + me(M, M_sd)),
  data = d, family = gaussian(), ...)`,
    solution:
      'With both rates modeled as measured with error, the marriage-rate coefficient shrinks further toward zero and its interval widens, confirming that marriage rate carries little information about divorce once age at marriage is accounted for — much of its apparent signal was measurement noise correlated with small state size. Age at marriage keeps a clear negative association. The measurement-error machinery does not overturn the causal story from chapter 5; it sharpens it by refusing to trust noisy estimates as if they were exact.',
  },
  '15H2': {
    paraphrase: 'Fit the milk kcal model with neocortex imputed, using body mass to inform the missing values, and report the neocortex and mass effects.',
    concept: 'Imputation inside a masked-relationship model.',
    strategy: 'Impute neocortex from mass, fit K ~ N + M jointly, and compare to complete-case.',
    skeleton: `m15h2 <- brm(
  bf(K ~ mi(N) + M) +
  bf(N | mi() ~ M) + set_rescor(FALSE),
  data = d, family = gaussian(), ...)`,
    solution:
      'The masked relationship from chapter 5 survives imputation: neocortex and mass push kcal in opposite directions, and using all 29 species tightens both coefficients relative to the 17-species complete-case fit. The imputed neocortex values track body mass, as the imputation model intends, and their posterior spread is honest about which species were guessed. Nothing about the substantive conclusion changes; the model simply stops discarding information, which is the whole point of imputation over deletion.',
  },
  '15H3': {
    paraphrase: 'A dataset where a predictor is measured with a large, non-ignorable error: fit it with and without the error model and compare the slope.',
    concept: 'Ignoring predictor error attenuates the slope (regression dilution).',
    strategy: 'Fit the naive regression on the noisy predictor, then the measurement-error version, and compare the estimated slope magnitudes.',
    solution:
      'The naive regression on the noisy predictor recovers a slope biased toward zero, because random error in x spreads the points horizontally and flattens the apparent relationship. The measurement-error model, by placing a latent true predictor between the observation and the outcome, un-dilutes the slope and returns a steeper, wider-interval estimate closer to the truth. This is one of the chapter\'s sharpest warnings: a predictor you measured casually can make a real effect look weak, and only modeling the error brings it back.',
  },
}
