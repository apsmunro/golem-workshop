import type { ChapterHints } from './types'

/**
 * Chapter 9 hint ladders. Mechanics first (why each sampler works and
 * when it fails), then chain care on real refits, then the classics:
 * the devil's funnel and the two collinear legs.
 */
export const ch09Hints: ChapterHints = {
  '9E1': {
    paraphrase: 'Which requirements does the simple Metropolis algorithm actually impose?',
    concept: 'Metropolis needs symmetric proposals; it does not need conjugate priors or Gaussian anything.',
    strategy: 'Go through each candidate requirement and ask whether the accept ratio still targets the posterior without it.',
    solution:
      'Only the symmetry of the proposal distribution is required: the chance of proposing B from A must equal the chance of proposing A from B, or the simple accept rule no longer balances. The parameters need not be discrete, the likelihood need not be Gaussian — the algorithm is far more general than the toy examples that introduce it.',
  },
  '9E2': {
    paraphrase: 'What does Gibbs sampling gain over Metropolis, and at what price?',
    concept: 'Adaptive proposals from conjugate conditionals: no rejections, but a restricted menu.',
    strategy: 'Ask where Gibbs\'s clever proposals come from, then ask what happens when models outgrow that source or parameters correlate.',
    solution:
      'Gibbs draws each parameter from its exact full conditional, so every proposal is accepted and the chain moves efficiently — when conjugate forms exist to supply those conditionals. The price is the conjugacy requirement itself, which modern models routinely violate, and the same high-dimensional curse that afflicts Metropolis: with many correlated parameters, one-at-a-time updates shuffle in tiny steps.',
  },
  '9E3': {
    paraphrase: 'Which parameters can HMC not handle, and why?',
    concept: 'No gradient, no glide.',
    strategy: 'The marble needs a smooth surface — what kind of parameter has no slope to follow?',
    solution:
      'Discrete parameters. HMC moves by following the gradient of the log posterior, and a parameter that jumps between categories has no gradient to follow. Models with discrete unknowns (mixtures, occupancy states) must marginalize them out analytically before Stan can sample — which brms does for its mixture families behind the scenes.',
  },
  '9E4': {
    paraphrase: 'Distinguish effective samples from raw samples.',
    concept: 'Autocorrelated draws repeat information; ESS counts only the fresh part.',
    strategy: 'Imagine 1,000 draws where each is nearly a copy of the last — how much have you learned?',
    solution:
      'n_eff estimates how many *independent* draws would carry the same information as your autocorrelated chain. Sticky chains have n_eff far below the raw count; a well-tuned HMC chain can occasionally exceed it (anti-correlated draws explore faster than independence). It is the number that matters for the precision of posterior summaries — the raw count is just how long you waited.',
  },
  '9E5': {
    paraphrase: 'Which value should R̂ approach, and when?',
    concept: 'R̂ compares between-chain to within-chain variance.',
    strategy: 'If all chains sample the same distribution, how do the two variances relate?',
    solution:
      'It should approach 1.00 from above as chains converge to a shared stationary distribution — at that point a chain is statistically indistinguishable from any other, so between-chain variance adds nothing. Values above about 1.01 mean the chains still disagree. And R̂ ≈ 1 is necessary, never sufficient: chains can agree because all of them are stuck in the same wrong place.',
  },
  '9E6': {
    paraphrase: 'Sketch a healthy trace plot and a pathological one; say what distinguishes them.',
    concept: 'Stationarity, good mixing, convergence — the hairy caterpillar test.',
    strategy: 'You already trained the eye in the triage clinic above; describe the silhouettes in words.',
    solution:
      'Healthy: all chains oscillate rapidly around one stable level, braided together so tightly you cannot follow a single chain by eye — stationary (constant mean and spread), well-mixed (draws forget their past quickly), converged (chains overlap). Malfunctioning: a chain drifting toward a level it never reaches, chains sitting at distinct levels, a flatlined segment, or slow ocean-swell wandering. Each silhouette maps to a cause: unfinished warm-up, multimodality or non-identification, a stuck sampler, heavy autocorrelation.',
  },
  '9E7': {
    paraphrase: 'Sketch a healthy and an unhealthy trace-rank (trank) plot.',
    concept: 'Rank histograms: each chain\'s share of the low and high ranks should be uniform.',
    strategy: 'Pool all draws, rank them, histogram the ranks chain by chain — what shape says "fair shares"?',
    solution:
      'Healthy: each chain\'s rank histogram is roughly flat, all chains interleaved — every chain owns its fair share of the smallest and largest values. Unhealthy: one chain\'s histogram piles up on the left while another\'s piles right, meaning one chain systematically sits below the other — the rank version of ribbons at different levels, and often easier to read than the traces themselves.',
  },
  '9M1': {
    paraphrase: 'Refit the terrain model with a uniform prior on sigma; hunt for consequences.',
    concept: 'With enough data, a mildly silly prior on σ changes almost nothing — and you should verify that, not assume it.',
    strategy: 'Swap exponential(1) for uniform(0, 1) on sigma, then compare the σ posteriors and the sampler diagnostics side by side.',
    skeleton: `m9.1_unif <- brm(log_gdp_std ~ 0 + cid + cid:rugged_std_c,
  data = dd, family = gaussian(),
  prior = c(___,
    prior(uniform(0, 1), class = sigma, ub = 1)),
  chains = 4, cores = 4, backend = "cmdstanr", seed = 1959)`,
    solution:
      'The σ posterior is essentially unchanged: 170 countries concentrate the likelihood near 0.11, far from the uniform\'s hard boundary at 1, so the prior\'s shape is irrelevant where the mass lives. Diagnostics stay clean for the same reason. The detectable-difference test is the transferable skill — priors matter exactly when the posterior wants to sit where the prior says it cannot.',
  },
  '9M2': {
    paraphrase: 'Tighten the ruggedness-slope prior stepwise and watch the posterior respond.',
    concept: 'Feel the point at which a prior stops being background and starts being the estimate.',
    strategy: 'Refit with the slope prior sd stepping down (0.3 → 0.1 → 0.03 …) and track the Africa slope\'s posterior mean and width at each step.',
    solution:
      'At sd 0.3 and 0.1 the posterior barely notices. Somewhere around 0.03 the prior begins visibly dragging both continent slopes toward zero, and by 0.01 the interaction is effectively erased — the prior now outweighs 170 countries. Plotting posterior mean against prior sd draws the regularization dial from chapter 7 as a single curve, and shows it is a dial, not a switch.',
  },
  '9M3': {
    paraphrase: 'Re-estimate one model under different warm-up lengths and compare efficiency.',
    concept: 'Warm-up buys adaptation quality; after a threshold, it only burns draws.',
    strategy: 'Fix iter, vary warmup (say 5, 50, 100, 500, 1000), record n_eff per post-warm-up draw each time.',
    skeleton: `for (w in c(5, 50, 100, 500, 1000)) {
  fit <- update(m9.1, warmup = w, iter = w + 1000, seed = 1959)
  # record summary(fit) n_eff and any warnings
}`,
    solution:
      'With single-digit warm-up the sampler runs on untuned ε and mass matrix: low n_eff, possible divergences, occasionally embarrassing R̂. Efficiency climbs steeply through the tens and levels off somewhere near a few hundred warm-up iterations for a posterior this friendly — beyond that, extra warm-up buys nothing and costs samples. Warm-up is tuning time for the instrument, and the instrument tunes quickly when the geometry is easy.',
  },
  '9H1': {
    paraphrase: 'Explain the trace of a chain sampling a flat normal and a Cauchy together.',
    concept: 'The Cauchy has no moments; its trace is supposed to lurch.',
    strategy: 'Run the two-parameter model, look at each trace, and resist the urge to call the spiky one broken.',
    skeleton: `mp <- brm(bf(y ~ 1), ...)  # or directly: a ~ normal(0,1), b ~ cauchy(0,1)
# sample with no likelihood: the "posterior" is the prior`,
    solution:
      'The normal trace is the familiar caterpillar. The Cauchy trace mixes calm stretches with sudden enormous excursions — and that is correct behavior, because a Cauchy\'s tails are thick enough that extreme values carry real probability, and its mean and variance do not exist. The chain is faithfully visiting a distribution with no stable center to hover around. Diagnosing "bad mixing" here would be blaming the sampler for the distribution\'s honest personality.',
  },
  '9H2': {
    paraphrase: 'Refit the divorce models with HMC and compare them by an information criterion.',
    concept: 'Chapter 5\'s conclusions survive the engine swap; the comparison table adds ranking to the story.',
    strategy: 'Fit D ~ A, D ~ M, and D ~ A + M with brm, add loo, compare; reconcile the ranking with what chapter 5 said about M.',
    skeleton: `m5.1h <- brm(D ~ A, data = waffles, ___)
m5.2h <- brm(D ~ M, data = waffles, ___)
m5.3h <- brm(D ~ A + M, data = waffles, ___)
loo_compare(add_criterion(m5.1h, "loo"), ___)`,
    solution:
      'The age-only model and the two-predictor model land within a standard error of each other at the top, and the marriage-rate-only model trails clearly. That is chapter 5 restated in deviance units: M carries no information beyond A (so adding it neither helps nor much hurts), while M alone rides a spurious association that predicts worse. The posteriors match the quap versions almost digit for digit — this posterior is quadratic, and HMC simply confirms it.',
  },
  '9H3': {
    paraphrase: 'Refit the two-legs model with a constraint forcing one slope positive; explain the change.',
    concept: 'Truncating one of two exchangeable parameters breaks the symmetry for both.',
    strategy: 'Fit height on both leg lengths, then repeat with a lower bound of zero on the right-leg slope; compare the joint posterior of the two slopes.',
    skeleton: `m_legs  <- brm(height ~ leg_left + leg_right, data = d, ___)
m_legsR <- brm(height ~ leg_left + leg_right, data = d,
  prior = c(prior(normal(2, 10), class = b, coef = leg_right, lb = 0), ___))`,
    solution:
      'Unconstrained, the two slopes form the chapter-6 ridge: enormously uncertain individually, tightly negatively correlated, summing to a well-estimated total. Forbid the right slope from going negative and the left slope\'s posterior is forced to change too — the ridge is cut in half, so the left slope now concentrates on the low side to keep the sum right. The two marginal posteriors look completely different from before while the sum is untouched. Constraints propagate through correlation; you never truncate just one parameter.',
  },
  '9H4': {
    paraphrase: 'Compare effective samples between the unconstrained and constrained legs models.',
    concept: 'Boundaries are hard geometry for a sampler that glides.',
    strategy: 'Read n_eff (bulk and tail) for both fits, especially the constrained coefficient and its partner.',
    solution:
      'The constrained model samples worse: the truncation plants a wall in the middle of the probability ridge, the marble keeps arriving at the boundary, and n_eff drops for both slope parameters (the partner suffers too, through their correlation). The unconstrained ridge is unpleasant but smooth; the wall is worse. Sampler efficiency is a readout of posterior geometry — when n_eff craters after you "helped" with a constraint, the geometry is telling you what you did.',
  },
  '9H5': {
    paraphrase: 'Adapt the island-visiting Metropolis walk to unordered islands.',
    concept: 'The proposal ring was a convenience; the accept rule never cared about order.',
    strategy: 'Ask which line of the algorithm used adjacency, and whether population enters anywhere except the accept ratio.',
    skeleton: `positions <- rep(0, 1e5)
current <- 10
for (i in 1:1e5) {
  proposal <- sample(1:10, 1)          # any island, not a neighbor
  prob_move <- pop[proposal] / pop[current]
  current <- ifelse(runif(1) < prob_move, proposal, current)
  positions[i] <- current
}`,
    solution:
      'Only the proposal step changes: draw the candidate island uniformly from all ten instead of stepping to a neighbor. The proposal stays symmetric, so the accept ratio pop[proposal]/pop[current] is untouched, and long-run visit frequencies still match populations. The exercise\'s point is to see which parts of Metropolis are load-bearing (symmetry, the ratio) and which were storytelling (the ring of islands).',
  },
  '9H6': {
    paraphrase: 'Write a Metropolis sampler for the globe-tossing posterior.',
    concept: 'The whole machinery on one parameter you already know the answer to.',
    strategy: 'Random-walk proposals on p in [0,1]; accept on the ratio of prior × binomial likelihood; reject proposals outside the interval; compare the histogram to Beta(7, 4).',
    skeleton: `p <- rep(0.5, 2e4)
for (i in 2:2e4) {
  prop <- p[i-1] + rnorm(1, 0, 0.1)
  if (prop < 0 || prop > 1) { p[i] <- p[i-1]; next }
  r <- dbinom(6, 9, prop) / dbinom(6, 9, p[i-1])
  p[i] <- ifelse(runif(1) < r, prop, p[i-1])
}`,
    solution:
      'With W = 6, N = 9 and a flat prior, the target is Beta(7, 4), so the sampler grades itself: the histogram of the chain should sit on that curve. Play with the proposal sd and watch the trade-off you now understand mechanically — tiny steps accept almost always and crawl; huge steps reject constantly and stall. Either way the chain eventually gets there, which is Metropolis in one sentence.',
  },
  '9H7': {
    paraphrase: 'Hand-build an HMC update for globe tossing: log posterior, gradient, leapfrog.',
    concept: 'Everything the physics toy animates, written as a dozen lines of R.',
    strategy: 'Work on the logit scale so the parameter is unconstrained; derive d/dθ of the log posterior; then the standard leapfrog loop with a momentum half-step on each end.',
    skeleton: `U      <- function(theta) { p <- plogis(theta); -(6*log(p) + 3*log(1-p)) }
grad_U <- function(theta) { p <- plogis(theta); -(6 - 9*p) }   # d(-logpost)/dtheta
# leapfrog: phi half-step, theta full step, phi half-step, repeat L times
# accept with min(1, exp(H0 - H1))`,
    solution:
      'On the logit scale, with the flat prior absorbed by the Jacobian, the gradient of the negative log posterior collapses to −(W − N·p) = 9p − 6 — one line. Leapfrog with small ε conserves H to a few decimals and acceptance sits near 1; crank ε and you can produce your own divergences on a one-dimensional posterior. After this exercise, nothing Stan reports is folklore: you have built the marble, the flick, and the bowl yourself.',
  },
}
