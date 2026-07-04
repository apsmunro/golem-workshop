import type { ChapterHints } from './types'

/**
 * Chapter 3 hint ladders. The 3E problems share one setup: the globe
 * posterior for 6 waters in 9 tosses, flat prior, sampled 10,000 times
 * (the book pins the sampling seed to 100 so everyone's numbers agree —
 * quoted values below are from that seed and will wobble slightly under
 * any other). 3H uses the birth data from the rethinking package
 * (data(homeworkch3): birth1, birth2 for 100 two-child families).
 */

const SETUP = `p_grid <- seq(0, 1, length.out = 1000)
prior <- rep(1, 1000)
likelihood <- dbinom(6, size = 9, prob = p_grid)
posterior <- likelihood * prior
posterior <- posterior / sum(posterior)
set.seed(100)
samples <- sample(p_grid, prob = posterior, size = 1e4, replace = TRUE)`

export const ch03Hints: ChapterHints = {
  '3E1': {
    paraphrase: 'How much posterior mass lies below p = 0.2?',
    concept:
      'With samples in hand, integrals become head-counting: the fraction of draws in a region is the posterior mass of that region.',
    strategy: 'Compare every sample against 0.2 and take the mean of the logical vector.',
    skeleton: `${SETUP}\n\nmean(samples ___ 0.2)`,
    solution:
      '```r\nmean(samples < 0.2)\n```\n\nAbout 4e-04 — four draws in ten thousand. Six waters in nine tosses makes a mostly-land globe nearly indefensible, and the sample count says so directly.',
  },
  '3E2': {
    paraphrase: 'How much posterior mass lies above p = 0.8?',
    concept: 'Same counting trick, other tail.',
    strategy: 'Flip the comparison from 3E1.',
    skeleton: `mean(samples ___ 0.8)`,
    solution:
      '```r\nmean(samples > 0.8)\n```\n\nAbout 0.11. The upper tail carries real weight — 6 of 9 is compatible with a very watery globe in a way it is simply never compatible with a dry one. Posteriors are routinely lopsided like this; that is why we sample instead of quoting a mean and calling it a day.',
  },
  '3E3': {
    paraphrase: 'How much mass sits between 0.2 and 0.8?',
    concept: 'Regions add: middle = 1 − both tails. Or count the middle directly.',
    strategy: 'Combine two comparisons with & inside mean().',
    skeleton: `mean(samples > ___ & samples < ___)`,
    solution:
      '```r\nmean(samples > 0.2 & samples < 0.8)\n```\n\nAbout 0.89, which is 1 minus the two tails from 3E1 and 3E2, as it must be. Cheap arithmetic like this is a useful habit: it catches sampling and typo errors early.',
  },
  '3E4': {
    paraphrase: 'Below which value of p does 20% of the posterior mass lie?',
    concept:
      'This inverts 3E1: given the mass, find the boundary. That is a quantile of the samples.',
    strategy: 'Ask for the 20th percentile of the sample vector.',
    skeleton: `quantile(samples, ___)`,
    solution:
      '```r\nquantile(samples, 0.2)\n```\n\nAbout 0.52. Read it as a claim: "one fifth of the golem\'s belief lives below p ≈ 0.52."',
  },
  '3E5': {
    paraphrase: 'Above which value of p does 20% of the mass lie?',
    concept: 'The mirror of 3E4: you want the 80th percentile.',
    strategy: 'The region above the answer must hold 0.2, so the region below holds 0.8.',
    skeleton: `quantile(samples, ___)`,
    solution:
      '```r\nquantile(samples, 0.8)\n```\n\nAbout 0.76. Together with 3E4, the middle 60% of belief spans roughly 0.52 to 0.76 — an interval nobody asked for, built from two answers people did ask for.',
  },
  '3E6': {
    paraphrase: 'Find the narrowest interval holding 66% of the posterior.',
    concept:
      'Narrowest-interval-of-given-mass is the HPDI: it hugs the densest region, and for skewed posteriors it is off-center on purpose.',
    strategy: 'rethinking::HPDI(samples, prob = 0.66), or reason from density if doing it by hand.',
    skeleton: `library(rethinking)\nHPDI(samples, prob = ___)`,
    solution:
      '```r\nHPDI(samples, prob = 0.66)\n```\n\nRoughly 0.51 to 0.77. The HPDI leans toward the posterior\'s dense shoulder rather than splitting tail mass evenly.',
  },
  '3E7': {
    paraphrase: 'Find the interval holding 66% with equal mass left outside each tail.',
    concept:
      'That is the percentile interval: 17% chopped from each end. Compare it against 3E6 to feel the difference between the two interval creatures.',
    strategy: 'Take quantiles at 0.17 and 0.83, or rethinking::PI(samples, 0.66).',
    skeleton: `PI(samples, prob = ___)\n# or: quantile(samples, c(___, ___))`,
    solution:
      '```r\nPI(samples, prob = 0.66)\n```\n\nRoughly 0.50 to 0.77 — nearly the HPDI here, because this posterior is only mildly skewed. The two interval types diverge exactly when the posterior gets asymmetric, which is when the choice starts to matter and when you should say which one you used.',
  },
  '3M1': {
    paraphrase: 'New data: 8 waters in 15 tosses. Rebuild the grid posterior, flat prior.',
    concept: 'Same machinery as chapter 2; only the tally changes.',
    strategy: 'Swap 6-of-9 for 8-of-15 in the likelihood line.',
    skeleton: `p_grid <- seq(0, 1, length.out = 1000)
prior <- rep(1, 1000)
likelihood <- dbinom(___, size = ___, prob = p_grid)
posterior <- likelihood * prior
posterior <- posterior / sum(posterior)`,
    solution:
      '```r\nlikelihood <- dbinom(8, size = 15, prob = p_grid)\n```\n\nThe posterior peaks near 8/15 ≈ 0.53 and is broader than a 6-of-9 fit is around its own peak relative to the extra data — fifteen tosses is still not many. Keep this fit; 3M2 through 3M5 all feed on it.',
  },
  '3M2': {
    paraphrase: 'Sample the 3M1 posterior and get the 90% HPDI.',
    concept: 'Draws first, then any summary you like — the sampling step decouples model from questions.',
    strategy: 'sample() the grid with posterior weights, then HPDI at 0.9.',
    skeleton: `set.seed(100)
samples <- sample(p_grid, prob = posterior, size = 1e4, replace = TRUE)
HPDI(samples, prob = ___)`,
    solution:
      '```r\nHPDI(samples, prob = 0.9)\n```\n\nAbout 0.33 to 0.72. Ninety percent of the golem\'s belief spans a range of width ~0.4: it has an opinion, held loosely.',
  },
  '3M3': {
    paraphrase: 'Posterior predictive check: how often does this model reproduce 8 of 15?',
    concept:
      'Push whole posterior draws through the sampling distribution. Uncertainty about p flows into uncertainty about future tallies — two layers, one line of code.',
    strategy: 'rbinom with size 15 and prob = samples (the vector!), then count the 8s.',
    skeleton: `w <- rbinom(1e4, size = ___, prob = ___)
mean(w == ___)`,
    solution:
      '```r\nw <- rbinom(1e4, size = 15, prob = samples)\nmean(w == 8)\n```\n\nAbout 0.15 — the single most probable tally, and still only 15%. A model can make the observed data its top pick and be far from certain about it; predictive distributions are wide because they carry both the binomial noise and the posterior\'s doubt about p.',
  },
  '3M4': {
    paraphrase: 'Using the 8-of-15 posterior, predict the probability of 6 waters in 9 new tosses.',
    concept:
      'Old data trained the golem; the question asks it to bet on a fresh experiment of different size.',
    strategy: 'Same rbinom trick with size 9, count the 6s. Do NOT rebuild the posterior.',
    skeleton: `w9 <- rbinom(1e4, size = ___, prob = samples)
mean(w9 == ___)`,
    solution:
      '```r\nw9 <- rbinom(1e4, size = 9, prob = samples)\nmean(w9 == 6)\n```\n\nAbout 0.18. One posterior, any number of hypothetical experiments — this is what "the posterior is the estimate" buys you.',
  },
  '3M5': {
    paraphrase: 'Redo 3M1–3M4 with a prior that zeroes everything below 0.5.',
    concept:
      'A truth-shaped prior (the real globe is ~0.71 water) shows what informed priors purchase: sharper answers from the same fifteen tosses.',
    strategy:
      'prior <- ifelse(p_grid < 0.5, 0, 1), rerun the pipeline, put each result beside its flat-prior twin.',
    skeleton: `prior <- ifelse(p_grid < ___, ___, ___)
# then rerun 3M1-3M4 unchanged`,
    solution:
      '```r\nprior <- ifelse(p_grid < 0.5, 0, 1)\n```\n\nThe 90% HPDI tightens to roughly 0.50–0.71 (the lower edge is the prior wall). Pr(8 of 15) rises a little, and predictions concentrate nearer truth. The prior did real inferential work here — it contributed exactly the information the data were too few to supply. It would do harm just as efficiently if it were wrong.',
  },
  '3M6': {
    paraphrase: 'How many tosses until the 99% interval is only 0.05 wide?',
    concept:
      'Interval width shrinks like one over the square root of N. Tiny target widths get expensive fast.',
    strategy:
      'Simulate: pick N, generate data with a true p (say 0.7), fit, measure PI width, repeat over a ladder of Ns until the width dips under 0.05. Average over many simulations per N.',
    skeleton: `width_at_n <- function(n, true_p = 0.7) {
  w <- rbinom(1, size = n, prob = true_p)
  likelihood <- dbinom(w, size = n, prob = p_grid)
  post <- likelihood / sum(likelihood)
  s <- sample(p_grid, prob = post, size = 1e4, replace = TRUE)
  diff(PI(s, prob = ___))
}
# try n in c(500, 1000, 2000, 3000, 5000), many reps each`,
    solution:
      '```r\nsapply(c(500, 1000, 2000, 3000), function(n)\n  mean(replicate(50, width_at_n(n))))\n```\n\nSomewhere a bit past two thousand tosses, the average 99% interval width crosses below 0.05 (the exact N wobbles with true p — widths peak at p = 0.5). The square-root law is merciless: halving a width costs quadruple the data. Precision is bought wholesale and sold retail.',
  },
  '3H1': {
    paraphrase: 'Birth data: fit the posterior for the probability a birth is a boy.',
    concept:
      'Two hundred births, and 111 boys among them, collapse into one binomial tally once births are assumed exchangeable.',
    strategy:
      'sum(birth1) + sum(birth2) boys out of 200. Grid posterior, flat prior, then find the peak with which.max.',
    skeleton: `library(rethinking)
data(homeworkch3)
boys <- sum(birth1) + sum(birth2)   # 111
p_grid <- seq(0, 1, length.out = 1000)
likelihood <- dbinom(boys, size = ___, prob = p_grid)
posterior <- likelihood / sum(likelihood)
p_grid[which.max(posterior)]`,
    solution:
      '```r\np_grid[which.max(posterior)]\n```\n\nThe posterior peaks at p ≈ 0.555, just above one half, matching the raw 111/200. With this much data the flat prior is a spectator.',
  },
  '3H2': {
    paraphrase: 'Sample that posterior; report the 50%, 89%, and 97% HPDIs.',
    concept: 'Different masses, same procedure — nested snapshots of certainty.',
    strategy: 'Draw 10,000 samples, call HPDI three times.',
    skeleton: `set.seed(100)
samples <- sample(p_grid, prob = posterior, size = 1e4, replace = TRUE)
HPDI(samples, prob = ___)  # three times`,
    solution:
      '```r\nHPDI(samples, prob = c(0.5, 0.89, 0.97))\n```\n\nAbout 0.53–0.58, 0.50–0.61, and 0.48–0.63. All three straddle or nearly touch 0.5: "more boys than girls" is favored, and a 50/50 world is still inside the widest interval\'s reach.',
  },
  '3H3': {
    paraphrase: 'Simulate 10,000 replications of 200 births. Does the observed 111 look typical?',
    concept:
      'A model that cannot re-produce its own training data has disqualified itself. This is the cheapest model check there is.',
    strategy:
      'rbinom(1e4, 200, samples), then plot the distribution (dens) and mark 111 on it.',
    skeleton: `b <- rbinom(1e4, size = ___, prob = samples)
dens(b)
abline(v = ___)`,
    solution:
      '```r\nb <- rbinom(1e4, size = 200, prob = samples)\ndens(b); abline(v = 111)\n```\n\nThe simulated counts pile up right around 111 — the observation sits at the distribution\'s center. The model passes the check it was guaranteed to pass; the honest tests come next.',
  },
  '3H4': {
    paraphrase: 'Check the same model against first births only (100 births).',
    concept:
      'Held-together data can hide structure. Testing a sub-slice the model never saw as a slice is a sharper question.',
    strategy:
      'Simulate counts of boys in 100 births from the full-data posterior; compare with sum(birth1).',
    skeleton: `b1 <- rbinom(1e4, size = ___, prob = samples)
dens(b1)
abline(v = sum(birth1))`,
    solution:
      '```r\nb1 <- rbinom(1e4, size = 100, prob = samples)\ndens(b1); abline(v = sum(birth1))  # 51\n```\n\nSimulations center near 55.5; the observed 51 sits below center yet comfortably inside the spread. A mild tension, no alarm. So far.',
  },
  '3H5': {
    paraphrase: 'Now check boys born after firstborn girls. The model breaks here — say how.',
    concept:
      'The model assumes births are independent. This slice is engineered to catch exactly that assumption with its guard down.',
    strategy:
      'Count firstborn girls (100 − sum(birth1) = 49). Simulate boy-counts for 49 births; compare against the observed boys among those 49 second births.',
    skeleton: `girls_first <- birth1 == 0
n_gf <- sum(girls_first)                 # 49
obs <- sum(birth2[girls_first])          # observed boys after girls
sim <- rbinom(1e4, size = ___, prob = samples)
dens(sim); abline(v = obs)`,
    solution:
      '```r\nsim <- rbinom(1e4, size = 49, prob = samples)\ndens(sim); abline(v = sum(birth2[birth1 == 0]))  # 39\n```\n\nSimulations center near 27; the data say 39. The observation lands far out in the right tail — the model is badly wrong about these births. Second births after firstborn girls run heavily to boys in this sample, so births within a family are anything except independent. The golem never volunteers this: it answered every earlier check with a straight face. You had to know where to press.',
  },
}
