import type { ChapterHints } from './types'

/**
 * Chapter 11 hint ladders. Scale fluency first (logit/log ↔ natural),
 * then the modeling judgment calls — aggregation, offsets, contrasts —
 * then the full re-analyses on chimpanzees, Kline, and Berkeley.
 */
export const ch11Hints: ChapterHints = {
  '11E1': {
    paraphrase: 'An event happens with probability 0.35 — what is that on the log-odds scale?',
    concept: 'The logit is log(p / (1 − p)).',
    strategy: 'Form the odds first, then take the natural log.',
    solution:
      'Odds are 0.35 / 0.65 ≈ 0.538; log(0.538) ≈ −0.619. Negative log-odds always mean p below one half, and this is the everyday translation you must be able to do without thinking before the chimpanzee coefficients mean anything.',
  },
  '11E2': {
    paraphrase: 'A coefficient moves the log-odds by 1.7 — what does that do to the odds?',
    concept: 'On the log-odds scale, addition; on the odds scale, multiplication by e^β.',
    strategy: 'Exponentiate the coefficient to get the odds multiplier.',
    solution:
      'e^1.7 ≈ 5.47: the odds multiply by about 5.5 for a one-unit change in the predictor. Note what is missing — a statement about probability. The same 1.7 turns p = 0.1 into p ≈ 0.38 but p = 0.5 into p ≈ 0.85, because odds multipliers are not probability shifts.',
  },
  '11E3': {
    paraphrase: 'What does a coefficient on the log scale of a Poisson mean for the expected count?',
    concept: 'log λ is linear, so λ is multiplicative in e^β.',
    strategy: 'Exponentiate; a change of β multiplies the rate.',
    solution:
      'A coefficient β changes the expected count by a factor e^β per unit predictor — β = 0.2 multiplies the rate by about 1.22, a 22% increase. As with the logit, the natural-scale effect is proportional, not additive, which is exactly why the Kline tools grow explosively with population while the log-scale slope stays modest.',
  },
  '11E4': {
    paraphrase: 'Why would a Poisson regression ever need an offset?',
    concept: 'Different observations can accrue counts over different exposures.',
    strategy: 'Ask what makes two counts comparable when one was measured over a longer window or larger population.',
    solution:
      'When the exposure varies — days of observation, person-years, area surveyed — a raw count of 10 means something different for a week than for a day. Adding log(exposure) to the linear predictor with a coefficient fixed at 1 turns the model into one for the *rate*, so counts measured over different windows become comparable. Without it the model confuses "more exposure" with "higher rate", the exact trap the monastery ledger springs.',
  },
  '11M1': {
    paraphrase: 'Why do aggregated and disaggregated binomial models share a posterior but not a likelihood value?',
    concept: 'The multiplicity (n-choose-k) term differs; the parameter-dependent part does not.',
    strategy: 'Write both likelihoods and separate the parts that depend on p from the parts that do not.',
    solution:
      'The disaggregated Bernoulli likelihood and the aggregated binomial likelihood differ only by the binomial coefficient counting the orderings — a constant in p. So the posterior over p is identical, but the absolute log-likelihood is smaller (more negative) for the aggregated form. This matters for information criteria: never compare a WAIC from aggregated data against one from disaggregated data, because the constant does not cancel across different data representations.',
  },
  '11M2': {
    paraphrase: 'A Poisson coefficient is 1.5 — describe the effect on the outcome fully.',
    concept: 'Multiplicative on the rate, so context-dependent in absolute counts.',
    strategy: 'Give the multiplier and then show why the count change depends on the baseline.',
    solution:
      'e^1.5 ≈ 4.48, so a one-unit change quadruples-and-a-half the expected count. In absolute terms that is +3.5 counts against a baseline of 1 but +35 against a baseline of 10 — the coefficient fixes the ratio, never the difference. Reporting "+4.5×" is honest; reporting a single count change is only meaningful pinned to a stated baseline.',
  },
  '11M3': {
    paraphrase: 'What link maps a binomial probability parameter onto the real line, and why that one?',
    concept: 'The logit is the maximum-entropy-compatible canonical link.',
    strategy: 'Recall which function takes (0,1) to all reals and is the natural parameter of the binomial family.',
    solution:
      'The logit, log(p/(1−p)). It is the canonical link — the binomial\'s natural parameter — so the linear predictor maps directly onto the quantity the exponential-family math already uses, giving clean interpretations and good sampling behavior. Alternatives like probit work too, but logit\'s odds interpretation is why it dominates teaching.',
  },
  '11M4': {
    paraphrase: 'And the canonical link for a Poisson — which, and why?',
    concept: 'The log is the Poisson\'s natural parameter.',
    strategy: 'Which function maps positive rates to the whole line and keeps λ positive under any linear predictor?',
    solution:
      'The log link. It guarantees λ = e^η stays positive for any real η, and it is the Poisson\'s canonical parameter, so effects are multiplicative — the natural scale for counts, where doubling a population plausibly scales activity rather than adding a fixed amount.',
  },
  '11M5': {
    paraphrase: 'What would using a logit link on a Poisson-like count outcome cost you?',
    concept: 'The link must respect the outcome\'s support and natural scale.',
    strategy: 'Think about what a logit assumes about an upper bound.',
    solution:
      'A logit presumes a ceiling — it maps to (0,1), i.e. a probability, which only makes sense when there is a known maximum number of trials. Unbounded counts have no such ceiling, so a logit would either require inventing one or would misrepresent the process. The log link, with no upper bound, is the honest choice; the mismatch is the same category error as using a Gaussian for a probability.',
  },
  '11M6': {
    paraphrase: 'State the maximum-entropy constraints that single out the binomial and the Poisson.',
    concept: 'Each exponential-family distribution is the flattest under a specific set of known quantities.',
    strategy: 'Recall chapter 10: fixed number of trials and expected successes give one; the limit of that gives the other.',
    solution:
      'The binomial is maximum entropy for a binary outcome with a fixed number of trials and a fixed expected count of successes. The Poisson is the limiting case: the same constraints as the number of trials grows large and the per-trial probability small, so the expected count stays finite. They share their entropy justification because the Poisson simply *is* the binomial pushed to that limit — one reason they so often fit the same data comparably.',
  },
  '11M7': {
    paraphrase: 'Refit the chimpanzee model with quap instead of HMC and compare the actor intercepts.',
    concept: 'Where the posterior is near-Gaussian, quap and HMC agree; where it is skewed, they part.',
    strategy: 'Fit m11.4 both ways and look especially at actor 2, whose all-left record pushes its intercept toward a boundary.',
    skeleton: `m11.4q <- quap(
  alist(
    pulled_left ~ dbinom(1, p),
    logit(p) <- a[actor] + b[treatment],
    a[actor] ~ dnorm(0, 1.5),
    b[treatment] ~ dnorm(0, 0.5)
  ), data = dat_list)
# compare precis(m11.4q) with the HMC summary`,
    solution:
      'Most actor and treatment posteriors are close to symmetric, and quap matches HMC to a couple of decimals. The exception is actor 2: pulling left every time drives its intercept up against the region where the likelihood flattens, so the true posterior is right-skewed with a long tail, and quap\'s symmetric Gaussian misplaces both the mean and the interval. This is the chapter\'s quiet argument for HMC — not that quap is usually wrong, but that it fails silently exactly where the data are most extreme.',
  },
  '11M8': {
    paraphrase: 'Refit the Kline tools model dropping Hawaii; what moves, and what does that say?',
    concept: 'A single influential point can carry an extrapolating model.',
    strategy: 'Remove the Hawaii row, refit m11.10, and compare the population slope and the high-vs-low contact gap.',
    skeleton: `d2 <- d[d$culture != "Hawaii", ]
m11.10_noHI <- brm(total_tools ~ 0 + contact + contact:log_pop_std,
  data = d2, family = poisson(), prior = ___, ...)`,
    solution:
      'Hawaii is low contact, huge, and tool-rich, so it single-handedly props up the low-contact curve at high population. Drop it and the low-contact slope softens and its uncertainty balloons out where no data remain, and the high-vs-low ordering at large populations becomes far less certain. The point is influence, not error: the conclusion "more people, more tools" survives, but any claim about contact at Hawaii-scale populations was resting on one island.',
  },
  '11H1': {
    paraphrase: 'Compare the chimpanzee model with and without actor intercepts by WAIC; interpret.',
    concept: 'Ignoring the actor clusters throws away the biggest source of variation.',
    strategy: 'Fit a treatment-only model and the full actor model, add WAIC or LOO to both, and read the gap and its standard error.',
    skeleton: `m_noactor <- brm(pulled_left ~ 0 + factor(treatment), ...)
loo_compare(add_criterion(m11.4, "loo"), add_criterion(m_noactor, "loo"))`,
    solution:
      'The actor model wins by a wide margin, far larger than the standard error of the difference. Handedness — actor to actor — is the dominant signal in these data, dwarfing any treatment effect, so a model that pools all chimps together predicts much worse. The comparison quantifies what the explorer\'s actor grid showed by eye: seven intercepts were not decoration, they were most of the story.',
  },
  '11H2': {
    paraphrase: 'Refit the Berkeley data as a binomial with department but not gender; compare to the full model.',
    concept: 'Department alone already predicts admissions well; gender adds little once it is in.',
    strategy: 'Fit admit | trials ~ dept, then admit | trials ~ dept + gender, and compare posteriors and LOO.',
    skeleton: `m_dept <- brm(admit | trials(applications) ~ 0 + dept,
  data = d, family = binomial(), ...)
m_both <- brm(admit | trials(applications) ~ 0 + dept + gender, ...)`,
    solution:
      'Department alone captures most of the predictive accuracy; adding gender barely moves LOO and its coefficient sits near zero with a slight edge to women in the larger departments. This is the direct-effect story from the explorer, now scored: once you condition on department, gender carries little information about admission. The apparent aggregate advantage lived entirely in the correlation between gender and department choice.',
  },
  '11H3': {
    paraphrase: 'The eagles pirating data — fit a binomial for successful thefts and interpret body-size effects.',
    concept: 'Binomial GLM with multiple predictors; interactions between pirate and victim size.',
    strategy: 'Model successes out of attempts with pirate size, victim size, and pirate age on the logit scale; then look at predicted probabilities, not just coefficients.',
    skeleton: `m_eagles <- brm(y | trials(n) ~ P + V + A,
  data = eagles, family = binomial(),
  prior = prior(normal(0, 1.5), class = b), ...)`,
    solution:
      'Large pirates succeed far more often and large victims resist far more, both with large log-odds coefficients; pirate age helps modestly. The instructive step is converting to the probability scale for representative cases — a big adult pirate against a small victim approaches certainty, while the coefficients alone hide how the ceiling flattens differences among already-likely thefts. Same lesson as the chimps: read effects where the cases live.',
  },
  '11H4': {
    paraphrase: 'Model the salamander counts as Poisson with forest-cover and age predictors.',
    concept: 'Poisson regression with continuous predictors; check for over-dispersion.',
    strategy: 'Fit log λ on percent cover and forest age, then compare predictions to data spread — if variance outruns the mean, foreshadow chapter 12.',
    skeleton: `m_sal <- brm(salaman ~ pctcover + forestage,
  data = d, family = poisson(),
  prior = prior(normal(0, 0.5), class = b), ...)`,
    solution:
      'Percent cover is the strong predictor — salamander counts rise steeply with it — while forest age adds little once cover is included, the two being correlated. Posterior predictive checks show the data scattering wider than a pure Poisson allows at high-cover sites, a hint that a gamma-Poisson would fit the tails better. That over-dispersion is precisely the monster chapter 12 forges next.',
  },
  '11H5': {
    paraphrase: 'Use the Trolley "contact" data as a binomial-ish problem — where does a plain binomial mislead?',
    concept: 'Forcing an ordered response into a binary success loses the ordering information.',
    strategy: 'Collapse the 1–7 response to a threshold, fit a binomial, and note what the dichotomization discards.',
    solution:
      'Any threshold you pick throws away the graded structure: a shift from 6 to 7 and a shift from 1 to 2 both vanish unless they cross your cut, and different thresholds give different coefficients. The binomial can answer a specific yes/no question ("rated above 4?") but cannot represent "the whole distribution moved down", which is the actual effect of intention and contact. This is the setup for chapter 12\'s ordered-categorical golem, which keeps the order the binomial destroys.',
  },
  '11H6': {
    paraphrase: 'Fit the Fish (or Hurricanes) data and diagnose why a pure Poisson strains.',
    concept: 'Excess zeros or excess variance signal a mixture is needed.',
    strategy: 'Fit the Poisson, run a posterior predictive check on the count of zeros and on the variance, and see which the model cannot reproduce.',
    skeleton: `m_fish <- brm(fish_caught ~ ___, data = d, family = poisson(), ...)
pp_check(m_fish, type = "rootogram")  # look at the zero bar`,
    solution:
      'The Poisson under-predicts zeros badly — many visitors caught nothing because they were not really fishing, a second process the model has no term for — and its variance is too small for the long right tail of a few big hauls. A zero-inflated Poisson repairs the first failure and a gamma-Poisson the second. The diagnosis is the whole point: the pure golem is not broken so much as too simple, and the residual shape tells you which monster to reach for.',
  },
}
