import type { ChapterHints } from './types'

/**
 * Chapter 7 hint ladders. Entropy by hand first, then the machinery of
 * WAIC/PSIS, then real comparisons where the score and the causal story
 * pull in different directions.
 */
export const ch07Hints: ChapterHints = {
  '7E1': {
    paraphrase: 'State the three design criteria behind information entropy.',
    concept: 'Entropy is the only uncertainty measure satisfying three reasonable demands.',
    strategy: 'Think about what any sane measure of uncertainty must do as outcomes change in number and probability.',
    solution:
      'The measure should be continuous (small probability changes cannot jump the uncertainty), increase with the number of possible outcomes (more ways for things to happen means more uncertainty), and be additive (uncertainty over combined events is the sum over their parts). Those three constraints pin down −Σ pᵢ log pᵢ up to the choice of units.',
  },
  '7E2': {
    paraphrase: 'Entropy of a coin that lands heads 70% of the time.',
    concept: 'Plug two probabilities into −Σ p log p.',
    strategy: 'H = −(0.7·log 0.7 + 0.3·log 0.3), natural log.',
    skeleton: `p <- c(0.7, 0.3)
-sum(p * log(p))`,
    solution:
      'H = −(0.7·log 0.7 + 0.3·log 0.3) ≈ 0.611 nats. Less than the fair coin\'s log 2 ≈ 0.693, because a biased coin is more predictable — every step away from uniform lowers entropy.',
  },
  '7E3': {
    paraphrase: 'Entropy of a four-sided die with unequal face probabilities.',
    concept: 'Same formula, four terms.',
    strategy: 'Sum −p log p over the four given face probabilities.',
    skeleton: `p <- c(0.2, 0.25, 0.25, 0.3)
-sum(p * log(p))`,
    solution:
      'H = −Σ pᵢ log pᵢ ≈ 1.376 nats, a shade under the uniform die\'s log 4 ≈ 1.386. The probabilities are nearly equal, so nearly maximum uncertainty.',
  },
  '7E4': {
    paraphrase: 'Entropy of a die that never shows one of its faces.',
    concept: 'Impossible outcomes contribute nothing: p log p → 0 as p → 0.',
    strategy: 'Drop the impossible face and compute over the remaining equal ones.',
    solution:
      'With three equally likely faces and one impossible, H = −3·(1/3)·log(1/3) = log 3 ≈ 1.099 nats. The impossible face simply leaves the sum — a die with a dead face is exactly a three-sided die.',
  },
  '7M1': {
    paraphrase: 'Define AIC and WAIC; say which is more general and what the other assumes.',
    concept: 'Both estimate out-of-sample deviance as training deviance plus a flexibility penalty; they differ in how the penalty is earned.',
    strategy: 'Write each criterion\'s penalty term, then list the conditions under which WAIC\'s reduces to AIC\'s.',
    solution:
      'AIC = D_train + 2k: the penalty is just the parameter count. WAIC = −2(lppd − Σᵢ var log p(yᵢ)): the penalty is the posterior variance of each point\'s log score, summed. WAIC is the more general — it assumes nothing about the shape of the posterior. AIC emerges as a special case when priors are flat (or swamped), the posterior is approximately multivariate Gaussian, and the sample dwarfs the parameter count. Break any of those and the "count the parameters" shortcut miscounts.',
  },
  '7M2': {
    paraphrase: 'Model selection versus model comparison — what is lost by selecting?',
    concept: 'Selection keeps one golem and discards the information in the ranking itself.',
    strategy: 'Ask what the differences between scores tell you that the single winner cannot.',
    solution:
      'Selection picks the best scorer and throws the rest away, losing the relative distances — how much better, and whether the difference exceeds its standard error. Comparison keeps the whole table: near-ties tell you the data cannot distinguish the models, and *which* models tie is itself evidence about which variables matter. Selection also invites the silent error of treating the predictive winner as the causal truth, which chapter 6 already showed can be exactly backwards.',
  },
  '7M3': {
    paraphrase: 'Why must compared models be fit to exactly the same observations?',
    concept: 'Deviance is a sum over points; change the points and you change the currency.',
    strategy: 'Imagine comparing a model fit to 50 rows against one fit to 100 — which direction does the score move mechanically?',
    solution:
      'Log-probability scores accumulate per observation, so a model fit to fewer rows has fewer (negative) terms and looks better for reasons that have nothing to do with skill. Missing values are the usual culprit: a predictor with NAs silently shrinks the data and rigs the comparison. Fit every model to the same complete cases before comparing anything.',
  },
  '7M4': {
    paraphrase: 'What happens to the effective number of parameters as a prior concentrates?',
    concept: 'WAIC\'s penalty measures posterior wiggle, not parameter count.',
    strategy: 'The penalty term is the variance of each point\'s log score across posterior draws — what does a tighter prior do to that variance?',
    solution:
      'It falls. A concentrated prior pins the posterior down, the per-point log scores vary less across draws, and the summed variance — the effective number of parameters — shrinks, even though the nominal count is unchanged. This is the accounting behind regularization: skeptical priors literally make a model act smaller.',
  },
  '7M5': {
    paraphrase: 'Explain why informative priors reduce overfitting.',
    concept: 'Overfitting is being too impressed by your own sample.',
    strategy: 'Think of the prior as pre-committed doubt about large effects.',
    solution:
      'An informative prior refuses to chase extreme coefficient values without strong evidence, so the noise in this particular sample — which is exactly the part that will not repeat — cannot drag the fit far. The golem learns the regular features, which generalize, and shrugs at the irregular ones, which do not.',
  },
  '7M6': {
    paraphrase: 'Explain why overly informative priors cause underfitting.',
    concept: 'The same dial, turned too far.',
    strategy: 'What happens when the prior doubts effects that are actually in the data?',
    solution:
      'A prior can be so skeptical that the likelihood never overcomes it, and real signal gets shrunk away with the noise. The golem underlearns the regular features of the sample and predicts badly for the opposite reason: too rigid instead of too excitable. Priors trade the two monsters; neither extreme sails through.',
  },
  '7H1': {
    paraphrase: 'Fit curves to the Laffer tax data and judge whether the famous curve is there.',
    concept: 'A straight line versus a curve is a model comparison question, settled by out-of-sample score.',
    strategy: 'Fit a line and at least one curved mean (quadratic or spline) to revenue against rate, then compare with PSIS/WAIC.',
    skeleton: `m_line  <- brm(revenue ~ rate, data = laffer,
  prior = prior(normal(0, 0.5), class = b), ___)
m_curve <- brm(revenue ~ poly(rate, 2), data = laffer, ___)
loo_compare(add_criterion(m_line, "loo"),
            add_criterion(m_curve, "loo"))`,
    solution:
      'The curved model scores at most a whisker better than the line, with a difference well inside its standard error — the data cannot tell the two stories apart. Any downward bend leans heavily on one extreme country. The honest conclusion is not "the Laffer curve is false" but "this dataset contains almost no evidence of curvature", which is a different and more useful sentence.',
  },
  '7H2': {
    paraphrase: 'Measure the influence of the Laffer outlier and refit with a heavier-tailed likelihood.',
    concept: 'PSIS points at individual points it cannot vouch for; Student-t likelihoods stop those points from steering.',
    strategy: 'Inspect pointwise Pareto k, find the offending country, then swap gaussian() for student() and compare the curvature conclusion.',
    skeleton: `loo(m_curve)                    # look at the pareto k warnings
m_t <- brm(revenue ~ poly(rate, 2), data = laffer,
  family = student(), ___)`,
    solution:
      'One country carries a Pareto k far above the comfort zone — the model finds it nearly impossible, so leave-one-out importance weights blow up there. Under a Student-t likelihood the thick tails expect the occasional wild point, its influence collapses, and the estimated curve flattens. The outlier was not "wrong data" to delete; it was information that the Gaussian\'s thin tails could not digest.',
  },
  '7H3': {
    paraphrase: 'Compute entropies and KL divergences for the three birds islands.',
    concept: 'Entropy summarizes each island\'s own uncertainty; KL divergence scores each island as a predictor of the others.',
    strategy: 'H per island first. Then D(p, q) = Σ p (log p − log q) for each ordered pair; predict best with the island whose divergences from the others are smallest.',
    skeleton: `H  <- function(p) -sum(p * log(p))
KL <- function(p, q) sum(p * (log(p) - log(q)))`,
    solution:
      'The near-uniform island has the highest entropy, and it also predicts the others best — its divergences are smallest because a spread-out distribution is rarely shocked by anyone else\'s birds. The specialized islands predict each other terribly: each assigns tiny probability to species the other has in abundance, and KL punishes confident wrongness hardest. High entropy is humility, and humility travels.',
  },
  '7H4': {
    paraphrase: 'Compare the marriage–happiness collider models with an information criterion.',
    concept: 'The predictive winner is the causally wrong model — on purpose.',
    strategy: 'Fit the chapter-6 pair (with and without conditioning on marriage status), compare by WAIC/PSIS, then explain the disagreement with the DAG.',
    solution:
      'The model conditioning on marriage wins the comparison decisively — marriage status is a collider of age and happiness, so conditioning on it manufactures a strong association that genuinely helps prediction. It remains useless for the causal question, since the age–happiness path it exploits does not exist in the population. Keep the two verdicts in separate pockets: WAIC measures expected predictive distance, and a confound can be predictive gold while being causal poison.',
  },
  '7H5': {
    paraphrase: 'Compare five fox models with WAIC and interpret the differences.',
    concept: 'Read a comparison table through the DAG: which additions matter, and why do some models tie?',
    strategy: 'Fit weight on the combinations of area, avgfood, and groupsize; compare; then explain each near-tie with the path structure (area → food → weight, food → groupsize → weight).',
    skeleton: `f1 <- brm(weight ~ avgfood + groupsize + area, data = foxes, ___)
# ... four more per the problem
loo_compare(f1, f2, f3, f4, f5)`,
    solution:
      'The models containing both avgfood (or area) and groupsize cluster at the top within a standard error of one another, while the single-predictor models trail. The DAG explains every gap: food helps foxes but also attracts groupmates who eat the surplus, so the two paths nearly cancel unless both variables are in the model, and area acts only through food, so area and food are interchangeable predictors. The WAIC table and the causal graph tell one consistent story — read together, as always.',
  },
  '7C1': {
    workshop: true,
    paraphrase:
      'Forge your own overfitting trap. Simulate 20 points from a known quadratic — y = 2 + 0.8x − 0.9x² + Normal(0, 0.5), x standardized, seed 1959 — then fit polynomials of degree 1 through 5. Confirm the one thing that is mathematically guaranteed (train deviance falls at every added degree), then use PSIS-LOO to find the degree that predicts new data best, and check it against the degree you know is true. Finally, resimulate the y-values a few times and watch which fitted curve stays put and which one thrashes.',
    concept:
      'The whole chapter on data you built, so the truth is known: train fit always improves with flexibility, out-of-sample skill peaks at the generating degree, and variance is the thing you can literally watch shake.',
    strategy:
      'Standardize x once. Fit the five nested polynomials by least squares (or brm with weak priors). Tabulate train deviance across degrees first — it must decrease monotonically, no exceptions, or you have a bug. Then add LOO to each fit and read loo_compare. Then hold the x fixed, redraw y under the same seed family, refit, and overlay the degree-2 and degree-5 curves across draws.',
    skeleton: `set.seed(1959)
n <- 20
x <- scale(runif(n, -2, 2))[, 1]
y <- 2 + 0.8 * x - 0.9 * x^2 + rnorm(n, 0, 0.5)
train_dev <- sapply(1:5, function(d) {
  m <- lm(y ~ poly(x, d))
  -2 * as.numeric(logLik(m))   # deviance; must fall as d rises
})
# then: brm each degree, add_criterion(., "loo"), loo_compare(...)`,
    solution:
      'The verifiable spine of the drill is the guarantee: `train_dev` is **strictly decreasing** in degree — 1 > 2 > 3 > 4 > 5 — every time, because each higher polynomial nests the last and least squares can only lower the residual sum. If yours ever ticks up, the bug is in your code, not the statistics. That monotonic slide is exactly why in-sample deviance can never referee model choice.\n\nLOO tells the honest story. The degree-2 model wins or ties the top, degree-1 trails clearly (it cannot bend to the real curvature), and degrees 3 through 5 score a hair worse than 2 with overlapping standard errors — flexibility you paid for and did not need. The exact LOO numbers wobble with the seed, but the *ordering* holds: you built a degree-2 world, and leave-one-out finds it. That is the chapter\'s promise made checkable: out-of-sample skill peaks at the generating degree, not the highest one.\n\nThe resimulation is the payoff you can see. Redraw y and refit: the degree-2 curve barely shivers between draws, while the degree-5 curve convulses at the edges, inventing a new wiggle for each fresh accident. That shaking is variance, and it is the bill the overfit golem hands you the moment tomorrow\'s data arrive.',
  },
}
