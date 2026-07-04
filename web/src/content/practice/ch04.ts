import type { ChapterHints } from './types'

/**
 * Chapter 4 hint ladders. Work from your copy of the book; problems are
 * referenced by ID. Code and commentary original; numerical answers
 * cross-checked against the standard quap/brms results on Howell1.
 */
export const ch04Hints: ChapterHints = {
  '4E1': {
    paraphrase: 'In the model, which line is the likelihood?',
    concept:
      'The likelihood is the line that ties the observed variable to a distribution. Everything else is a prior on a parameter.',
    strategy: 'Find the line with the data on the left of the ~, not a parameter.',
    solution:
      'The first line, y_i ~ Normal(mu, sigma), is the likelihood. The other two lines are priors on mu and sigma — statements about parameters, made before seeing y.',
  },
  '4E2': {
    paraphrase: 'How many parameters are in the posterior?',
    concept: 'Count the quantities with priors — those are what the posterior is over.',
    strategy: 'Every symbol that gets its own ~ prior line and is not data.',
    solution:
      'Two: mu and sigma. The posterior is a joint distribution over both at once, not two separate curves.',
  },
  '4E3': {
    paraphrase: "Write Bayes' theorem for this model as a proportionality.",
    concept:
      'Posterior ∝ likelihood × prior, with the product taken over all observations and both priors multiplied in.',
    strategy:
      'Numerator: product of Normal(y|mu,sigma) over data, times the mu prior, times the sigma prior. Denominator: the same integrated over mu and sigma.',
    solution:
      'Pr(μ, σ | y) = [∏ᵢ Normal(yᵢ | μ, σ) · Normal(μ | 0, 10) · Exponential(σ | 1)] / ∫∫ [same] dμ dσ. The denominator is just the normalizer that makes it a probability; every inference lives in the numerator.',
  },
  '4E4': {
    paraphrase: 'Which line is the linear model?',
    concept: 'The linear model is the deterministic line — an = not a ~.',
    strategy: 'Look for mu defined as a sum of parameters and a predictor.',
    solution:
      'The line mu_i = alpha + beta·x_i. It is deterministic: given the parameters and x, mu is fixed, no distribution attached. The randomness enters only through the likelihood.',
  },
  '4E5': {
    paraphrase: 'Now how many parameters?',
    concept: 'Adding a linear model trades one free mean for a slope and intercept.',
    strategy: 'mu is no longer a parameter — it is built from alpha, beta. Count what has priors.',
    solution:
      'Three: alpha, beta, sigma. mu is not a parameter anymore; it is a deterministic function of alpha, beta, and the data.',
  },
  '4M1': {
    paraphrase: 'Simulate observed heights from the priors alone.',
    concept:
      'Prior predictive simulation: draw parameters from their priors, then draw data from the likelihood at those parameters.',
    strategy: 'Sample mu and sigma from their priors, then y from Normal(mu, sigma). Plot the y distribution.',
    skeleton: `n <- 1e4
mu <- rnorm(n, 0, 10)
sigma <- rexp(n, 1)
y <- rnorm(n, mu, sigma)
dens(y)`,
    solution:
      '```r\nmu <- rnorm(1e4, 0, 10); sigma <- rexp(1e4, 1)\ny_prior <- rnorm(1e4, mu, sigma)\ndens(y_prior)\n```\n\nThe simulated y is centered near 0 and spreads roughly ±20 — exactly what the priors claim before any data. This is the check you run to catch absurd priors while they are still cheap to fix.',
  },
  '4M2': {
    paraphrase: 'Translate the 4M1 model into a quap alist.',
    concept: 'Each line of the mathematical model becomes one line of the alist.',
    strategy: 'Likelihood, then a prior line per parameter, in the same order.',
    skeleton: `f <- alist(
  y ~ dnorm(mu, sigma),
  mu ~ dnorm(___, ___),
  sigma ~ dexp(___)
)`,
    solution:
      '```r\nf <- alist(\n  y ~ dnorm(mu, sigma),\n  mu ~ dnorm(0, 10),\n  sigma ~ dexp(1)\n)\n```\n\nThe alist is the model, one-to-one. In brms the same thing is `bf(y ~ 1)` plus explicit `prior()` calls — different syntax, identical claims.',
  },
  '4M3': {
    paraphrase: 'Rewrite a quap model as mathematical notation.',
    concept: 'Reverse of 4M2: alist lines become distribution statements.',
    strategy: 'Map dnorm/dunif to Normal/Uniform; keep the deterministic mu line as =.',
    solution:
      'y_i ~ Normal(μ_i, σ); μ_i = α + β x_i; α ~ Normal(0, 10); β ~ Uniform(0, 1); σ ~ Exponential(1). The one subtlety: the mu line uses = (deterministic), every other line uses ~ (a distribution).',
  },
  '4M4': {
    paraphrase: 'A model for students growing over three years of height data.',
    concept:
      'Height increases with year, so this is linear regression with year as the predictor. The prior craft is choosing scales that respect that growth is positive and bounded.',
    strategy:
      'Center year. Intercept prior around a plausible mean height for the sample; slope prior positive-ish but not enormous (a few cm/year); sigma weakly informative.',
    skeleton: `h_ij ~ Normal(mu_ij, sigma)
mu_ij = a + b * (year_j - mean_year)
a ~ Normal(___, ___)     # typical height
b ~ Normal(___, ___)     # cm per year, keep positive-leaning
sigma ~ Exponential(1)`,
    solution:
      'h ~ Normal(μ, σ); μ = α + β(year − ȳ); α ~ Normal(150, 20) (unknown grade, wide); β ~ LogNormal(1, 0.5) or Normal(5, 3) truncated positive (children gain a handful of cm/year, never shrink); σ ~ Exponential(1). The defensible move is a positive-mean slope prior: simulate from it and confirm no student loses height between years.',
  },
  '4M5': {
    paraphrase: 'You learn every student grew each year. Does that change the priors?',
    concept: 'New knowledge that growth is strictly positive tightens the slope prior.',
    strategy: 'Switch beta to a strictly-positive prior if it was not already.',
    solution:
      'Yes — make β strictly positive, e.g. β ~ LogNormal(0, 1). "Everyone grew" is a hard fact the prior should encode; a Normal slope that allots probability to negative growth now contradicts something you know. Priors are for putting in what you know, and you now know more.',
  },
  '4M6': {
    paraphrase: 'You learn the variance of heights never exceeds 64. Update the model.',
    concept: 'A cap on variance is a cap on sigma: sd ≤ 8.',
    strategy: 'Bound sigma at 8 (since 64 = 8²), e.g. Uniform(0, 8).',
    solution:
      'Set σ ~ Uniform(0, 8), because variance ≤ 64 means sd ≤ 8. This is another case of a prior carrying a genuine external fact. It also gently regularizes: the golem can no longer explain outliers by inflating σ without bound.',
  },
  '4H1': {
    paraphrase: 'Predict heights (with intervals) for four new weights.',
    concept:
      'Push the posterior through the model at each weight: link for the mean interval, sim for the prediction interval.',
    strategy:
      'Fit m4.3 on adults, then use link() to get mu at each weight and sim() (or rnorm with sigma draws) for the full predictive spread. Report the 89% PI of the predictive.',
    skeleton: `post <- extract.samples(m4.3)
for each weight w:
  mu <- post$a + post$b * (w - xbar)
  h_sim <- rnorm(length(mu), mu, post$sigma)
  c(mean(h_sim), PI(h_sim, 0.89))`,
    solution:
      '```r\nweights <- c(46.95, 43.72, 64.78, 32.59)\nmu <- sapply(weights, function(w) post$a + post$b*(w - xbar))\nhsim <- apply(mu, 2, function(m) rnorm(length(m), m, post$sigma))\nexpected <- colMeans(hsim)\nintervals <- apply(hsim, 2, PI, prob = 0.89)\n```\n\nExpected heights run about 156, 153, 172, 143 cm. Report the *predictive* interval (mu + sigma noise), not the narrow mu interval — you were asked about people, not about the mean line. The 64.78 kg case sits at the edge of the data; note how its interval is a touch wider, and distrust anything past the observed range.',
  },
  '4H2': {
    paraphrase: 'Fit the linear model to under-18s and describe the misfit.',
    concept:
      'Children are where the straight line fails: growth against weight curves, and a line cannot bend.',
    strategy:
      'Filter to age < 18, fit height ~ weight, then plot the mean line and predictive band over the data and look at the residual pattern.',
    skeleton: `kids <- d[d$age < 18, ]
m <- quap(alist(
  height ~ dnorm(mu, sigma),
  mu <- a + b * (weight - mean(kids$weight)),
  a ~ dnorm(120, 30), b ~ dlnorm(0, 1),
  sigma ~ dunif(0, 50)
), data = kids)`,
    solution:
      'β lands near 2.7 cm per kg — much steeper than the adult 0.9, because children pack growth into a smaller weight range. Plotted, the line runs above the data at the extremes and below it in the middle: the true relationship is concave, and a straight golem splits the difference badly. This is the setup for 4H3\'s fix and for the whole polynomial/spline discussion — the data are telling you the model is the wrong shape.',
  },
  '4H3': {
    paraphrase: 'A colleague models height on log(weight) over the whole census. Assess it.',
    concept:
      'log(weight) linearizes the concave curve, so one line fits infants to elders at once.',
    strategy:
      'Fit height ~ log(weight) on all ages, then plot predictions on the natural weight scale with 89% mu and predictive bands.',
    skeleton: `m <- quap(alist(
  height ~ dnorm(mu, sigma),
  mu <- a + b * log(weight),
  a ~ dnorm(178, 20), b ~ dnorm(0, 20),
  sigma ~ dunif(0, 50)
), data = d)`,
    solution:
      'The log model fits startlingly well across the full range — the curve that defeated a straight line in weight becomes a straight line in log-weight. Back on the natural scale the mean line bends exactly the way the cloud does. The lesson is not "logs are magic" but that choosing the scale on which a relationship is linear is half the modeling, and the golem cannot choose it for you.',
  },
  '4H4': {
    paraphrase: 'Prior-predict a parabolic height–weight model before fitting.',
    concept:
      'A quadratic adds a curvature term; its prior decides whether the parabola opens plausibly or does something grotesque.',
    strategy:
      'Simulate lines from the priors on a, b1, b2 over the weight range and eyeball whether the curves stay in human territory.',
    solution:
      'Draw a, b1, b2 from candidate priors and plot μ = a + b1·x_std + b2·x_std² over standardized weight. With vague priors the parabolas fly off into thousands of centimetres or curve downward at the ends (people shrinking when heavy). Tighten until the simulated curves stay monotone-ish and inside plausible heights. The exercise is the chapter 4 argument again, one polynomial degree up: you cannot judge a prior in your head, only by simulating from it.',
  },
}
