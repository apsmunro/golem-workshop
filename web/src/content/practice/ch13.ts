import type { ChapterHints } from './types'

/**
 * Chapter 13 hint ladders. Partial pooling and the adaptive prior first,
 * then the reedfrog variations and alternative varying-effect distributions,
 * then the full multilevel re-analyses (chimpanzees blocks, Bangladesh
 * districts). Solutions are original brms translations validated against the
 * manual's numerical results only.
 */
export const ch13Hints: ChapterHints = {
  '13E1': {
    paraphrase: 'Which adaptive prior on the tank intercepts produces more shrinkage: Normal(0, 1) or Normal(0, 2)?',
    concept: 'A tighter adaptive prior pools harder toward the mean.',
    strategy: 'Ask which prior keeps the varying effects closer to their common center before the data arrive.',
    solution:
      'Normal(0, 1) produces more shrinkage. The smaller standard deviation is a stronger claim that the tanks are alike, so each estimate is pulled harder toward the grand mean; a tank would need more data to escape it. Normal(0, 2) is more permissive and lets tanks stay near their raw values. In a real multilevel model you would not fix this σ at all — you would let the data estimate it — but the comparison shows what σ controls.',
  },
  '13E2': {
    paraphrase: 'Rewrite the given fixed-intercept binomial GLM as a multilevel model with a varying intercept on the group.',
    concept: 'A varying intercept replaces a fixed prior with an estimated one.',
    strategy: 'Take the group intercept out of a fixed prior and give it a Normal(ā, σ) with ā and σ as parameters.',
    skeleton: `# was: a_group ~ dnorm(0, 1.5)
y ~ dbinom(1, p)
logit(p) <- a[group] + b * x
a[group] ~ dnorm(a_bar, sigma)
a_bar ~ dnorm(0, 1.5)
sigma ~ dexp(1)`,
    solution:
      'The single change is to give the group intercepts a common distribution whose mean ā and spread σ are themselves estimated: a[group] ~ Normal(ā, σ), with priors on ā and σ. The slope term b·x stays as it was. In brms this is the difference between `y ~ x + group` (group as fixed dummies) and `y ~ x + (1 | group)` (group as a varying intercept). The multilevel version adds two hyperparameters and, through them, regularizes the whole stack of group intercepts.',
  },
  '13E3': {
    paraphrase: 'Rewrite the given Gaussian-outcome model as a multilevel model with a varying intercept.',
    concept: 'Varying intercepts work identically for a Gaussian likelihood.',
    strategy: 'Same move as 13E2: promote the group intercept to a Normal(ā, σ) with estimated hyperparameters, keeping the residual σ separate.',
    skeleton: `y ~ dnorm(mu, sigma)
mu <- a[group] + b * x
a[group] ~ dnorm(a_bar, sigma_group)
a_bar ~ dnorm(0, 10)
sigma_group ~ dexp(1)
sigma ~ dexp(1)`,
    solution:
      'The outcome distribution is Gaussian rather than binomial, but the multilevel step is unchanged: a[group] ~ Normal(ā, σ_group). The only bookkeeping trap is that there are now two standard deviations — σ_group for the spread of intercepts across groups and σ for residual variation within a group — and they must be named distinctly. In brms, `y ~ x + (1 | group)` with a Gaussian family, where `sd` is σ_group and `sigma` is the residual.',
  },
  '13M1': {
    paraphrase: 'Refit the reedfrogs tanks adding predation and size as predictors (and their interaction); watch how the estimated variation across tanks changes.',
    concept: 'Explaining variation with predictors shrinks the leftover σ.',
    strategy: 'Fit the varying-intercept model with predation, size, and predation×size in the linear model, and compare the posterior σ across specifications.',
    skeleton: `m <- brm(surv | trials(density) ~ 1 + pred * size + (1 | tank),
  data = d, family = binomial(),
  prior = c(prior(normal(0, 1.5), class = Intercept),
            prior(normal(0, 0.5), class = b),
            prior(exponential(1), class = sd)), ...)`,
    solution:
      'As real causes of survival enter the linear model, the tank-level σ falls: predation especially soaks up a large slice of the between-tank variation, because much of what made tanks differ was whether predators were present. The varying intercepts then capture only the residual, unexplained differences. This is the general lesson — σ is not a fixed property of the data but a measure of what your predictors have failed to explain, and it shrinks as the model learns more.',
  },
  '13M2': {
    paraphrase: 'Compare the reedfrog models from 13M1 with WAIC (or PSIS-LOO) and interpret.',
    concept: 'Information criteria weigh fit against effective complexity for multilevel models.',
    strategy: 'Add the criterion to each fit and compare; expect small differences because shrinkage already regularizes.',
    skeleton: `m1 <- add_criterion(m1, "loo"); m2 <- add_criterion(m2, "loo")
loo_compare(m1, m2, m3, m4)`,
    solution:
      'The models land within a standard error or two of each other on WAIC/LOO, even though they differ in predictors. Partial pooling is doing much of the regularizing already, so adding predators as a predictor improves the linear model but barely moves out-of-sample score, because the varying intercepts were absorbing that structure anyway. The takeaway is that WAIC differences among well-regularized multilevel models are often small, and the scientific interpretation of σ and the coefficients matters more than a ranking.',
  },
  '13M3': {
    paraphrase: 'Refit the reedfrogs varying intercepts using a Cauchy distribution instead of a Gaussian; compare the tank estimates.',
    concept: 'A heavy-tailed varying-effect prior shrinks the bulk but frees the outliers.',
    strategy: 'Swap the Normal adaptive prior for a Cauchy and look at which tanks change most.',
    solution:
      'Under a Cauchy adaptive prior the typical tanks shrink about as before, but the extreme tanks — the ones with survival far from the mean — are pulled in far less, because the fat tails make large deviations cheap. The posterior for those outlying tanks sits closer to their no-pooling values. This previews robustness: when a few clusters genuinely differ from the rest, a heavy-tailed prior refuses to over-shrink them, at the cost of slightly weaker regularization everywhere else.',
  },
  '13M4': {
    paraphrase: 'Refit using a Student-t distribution for the varying intercepts; compare against the Gaussian and Cauchy versions.',
    concept: 'Student-t interpolates between Gaussian and Cauchy via its degrees of freedom.',
    strategy: 'Use a Student-t adaptive prior (small ν for heavier tails) and read the tank estimates as a middle ground.',
    solution:
      'Student-t with a moderate ν sits between the Gaussian and Cauchy results: more tolerant of outlying tanks than the Normal, less permissive than the Cauchy. As ν grows the fit approaches the Gaussian; as it shrinks toward 1 it approaches the Cauchy. The practical value is a tunable amount of tail-robustness, so a few unusual clusters do not distort the estimated σ for all the others while ordinary clusters still pool sensibly.',
  },
  '13M5': {
    paraphrase: 'Add a second varying intercept (block) to the chimpanzees model, cross-classified with actor; interpret the two variances.',
    concept: 'Cross-classified clusters give each observation membership in two overlapping groups.',
    strategy: 'Put varying intercepts on both actor and block and compare σ_actor with σ_block.',
    skeleton: `m <- brm(pulled_left ~ 1 + treatment + (1 | actor) + (1 | block),
  data = d, family = bernoulli(),
  prior = c(prior(normal(0, 1.5), class = Intercept),
            prior(normal(0, 0.5), class = b),
            prior(exponential(1), class = sd)), ...)`,
    solution:
      'The two cluster types are not nested — every actor appears in every block — so each pull is a member of both. Fitting varying intercepts on both, σ_actor comes out large (chimps differ a lot in their baseline handedness) while σ_block is near zero (the experimental blocks barely matter). The model has quietly told you which grouping carries signal and which does not, and because σ_block shrinks almost to zero, adding block cost essentially nothing in effective parameters.',
  },
  '13M6': {
    paraphrase: 'Fit the four models crossing Gaussian and Student-t for the prior and the likelihood on a single observation; compare the posteriors.',
    concept: 'Tail behavior in the prior and the likelihood pull the posterior in opposite tugs-of-war.',
    strategy: 'For one data point far from the prior mean, compare Normal/Normal, Normal/t, t/Normal, t/t and see which component yields.',
    solution:
      'With a single discrepant observation, the combination decides who gives way. Normal prior and Normal likelihood split the difference smoothly. A Student-t likelihood lets the model treat the point as a possible outlier and stay near the prior; a Student-t prior lets the parameter move to accommodate the point. When both are heavy-tailed the posterior can become bimodal, unsure whether the prior or the datum is the anomaly. The exercise is a compact lesson in where robustness comes from — the fat tail wins the tug-of-war.',
  },
  '13H1': {
    paraphrase: 'Bangladesh contraception: compare a fixed-intercept-per-district model with a varying-intercept model, and plot the predicted use against sample size.',
    concept: 'Partial pooling helps most where districts are small.',
    strategy: 'Fit both models, plot each district\'s predicted proportion, and mark the districts with few women.',
    skeleton: `m_fixed <- brm(use ~ 0 + factor(district), data = d, family = bernoulli(), ...)
m_multi <- brm(use ~ 1 + (1 | district), data = d, family = bernoulli(), ...)`,
    solution:
      'The two models agree for large districts and diverge sharply for small ones: the fixed model swings to extreme predictions (including 0 and 1) in districts with a handful of women, while the varying-intercept model pulls those toward the national average, exactly in proportion to how little each district knows. Plotting predictions against sample size shows the classic shrinkage fan — wide, confident-looking fixed estimates for tiny districts, tamed by pooling. One district with no users is the clearest case: pooling rescues it from a probability of zero.',
  },
  '13H2': {
    paraphrase: 'Add an urban/rural varying intercept or predictor to the Bangladesh model and interpret the difference in contraceptive use.',
    concept: 'A district-level predictor explains some of the between-district variation.',
    strategy: 'Add urban as a fixed effect (or let it vary by district) and see how σ_district and the predictions change.',
    skeleton: `m <- brm(use ~ 1 + urban + (1 | district), data = d, family = bernoulli(),
  prior = c(prior(normal(0, 1), class = b),
            prior(exponential(1), class = sd)), ...)`,
    solution:
      'Urban residence raises contraceptive use substantially, and adding it lowers the district-level σ, because some of what separated districts was simply how urban they were. Predictions become sharper, and districts that looked unusual in the intercept-only model turn out to differ mainly in their urban share. This is the district-level analogue of 13M1: a real predictor absorbs variation the varying intercept had been standing in for.',
  },
  '13H3': {
    paraphrase: 'Let the urban effect itself vary by district (a varying slope) and interpret the correlation with the intercept.',
    concept: 'A varying slope allows the urban effect to differ across districts, and it may correlate with baseline use.',
    strategy: 'Fit (1 + urban | district) and read both the slope variance and its correlation with the intercept.',
    skeleton: `m <- brm(use ~ 1 + urban + (1 + urban | district),
  data = d, family = bernoulli(),
  prior = c(prior(normal(0, 1), class = b),
            prior(exponential(1), class = sd),
            prior(lkj(2), class = cor)), ...)`,
    solution:
      'Letting the urban effect vary reveals that districts differ not only in baseline use but in how much urban living matters, and the intercept–slope correlation is typically negative: districts with low rural use show the largest urban boost, so the urban and rural rates are closer to converging in already-high-use districts. This is the bridge into chapter 14 — the moment a varying-intercept model becomes a varying-slopes model, and the covariance between the two effects starts carrying information.',
  },
  '13C1': {
    workshop: true,
    paraphrase:
      'Two classrooms, same true-story school. Each pupil\'s score scatters around their class mean with within-class sd 1. Class A tested only 5 pupils and averaged 2.0; class B tested 50 and averaged 2.0 as well. The school\'s partial-pooling model has settled on a grand mean of 0 and a between-class sd of 1. By hand, compute each class\'s shrunk estimate, say which class the leash pulls harder and why, then predict what happens to both if you slide the between-class sd toward 0 and toward infinity.',
    concept:
      'Shrinkage is a precision-weighted average, and the weights are counting: the pooled estimate leans on the data in proportion to how much data there is, and on the grand mean in proportion to how alike the classes are.',
    strategy:
      'For a Gaussian class mean, the partial-pooling estimate given the hyperparameters is θ̂ = (n·ȳ/σ² + μ/τ²) / (n/σ² + 1/τ²). Here σ = 1 (within), μ = 0 (grand), τ = 1 (between), so data-weight is just n and prior-weight is 1. Plug in n = 5 and n = 50 at the same raw mean of 2.0, then push τ to its two extremes and read off complete versus no pooling.',
    skeleton: `sigma <- 1; mu <- 0; tau <- 1
shrink <- function(n, ybar) {
  wd <- n / sigma^2      # data precision
  wp <- 1 / tau^2        # prior (grand-mean) precision
  (wd * ybar + wp * mu) / (wd + wp)
}
shrink(5, 2); shrink(50, 2)`,
    solution:
      'With σ = τ = 1 the weights are just n against 1. Class A: θ̂ = (5·2 + 1·0)/(5 + 1) = 10/6 ≈ **1.67**. Class B: θ̂ = (50·2)/(50 + 1) = 100/51 ≈ **1.96**. Same raw average of 2.0, two different estimates — the five-pupil class is dragged a sixth of the way toward the grand mean (its prior weight is 1 against 5 data-points\' worth) while the fifty-pupil class barely moves. The leash pulls hardest on the class that knows least, exactly the reedfrog rule: little data means little to lose by borrowing, so the model borrows more.\n\nNow the extremes, both exact. Send τ → 0 (the school insists every class is identical) and the prior precision 1/τ² blows up, so both estimates collapse to the grand mean 0: complete pooling, one number for the school. Send τ → ∞ (classes are unrelated strangers) and the prior precision vanishes, so each estimate returns to its own raw mean of 2.0 — no pooling, every class alone. The multilevel model lives between these poles and, unlike this hand calculation, *estimates* τ from how much the classes actually differ rather than being told. That single learned number is the whole difference between a golem with memory and one without.',
  },
}
