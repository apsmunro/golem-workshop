import type { ChapterHints } from './types'

/**
 * Chapter 5 hint ladders. Original throughout; the DAG reasoning is the
 * point, so most ladders push the graph before the regression.
 */
export const ch05Hints: ChapterHints = {
  '5E1': {
    paraphrase: 'Which of the listed formulas are multiple linear regressions?',
    concept:
      'A multiple regression has two or more slope terms on distinct predictors inside one linear model.',
    strategy: 'Count predictors with their own coefficients. One predictor is not "multiple".',
    solution:
      'The models with two additive predictor terms (μ = α + β₁x₁ + β₂x₂) qualify. A single-predictor line is simple regression; a model with only an intercept is neither. The bookkeeping matters because "multiple" is exactly what buys you conditional interpretation.',
  },
  '5E2': {
    paraphrase: 'Write a model: animal diversity depends on latitude, controlling for plant diversity.',
    concept: '"Controlling for" means both predictors enter the same linear model.',
    strategy: 'One likelihood, μ = α + β_lat·latitude + β_plant·plant_diversity.',
    solution:
      'A ~ Normal(μ, σ); μ = α + β_L·L + β_P·P. The β_L you read off is "the association of latitude with diversity at fixed plant diversity" — which is what "controlling for" means, and why the coefficient can differ sharply from a simple regression of A on L.',
  },
  '5E3': {
    paraphrase: 'Time-to-PhD rises with both funding and lab size, though neither alone predicts it. Model and sign.',
    concept:
      'This is masking: two predictors correlated with each other, each hidden until the other is held fixed.',
    strategy: 'Both slopes should be positive in the joint model; note they can be ~0 in isolation.',
    solution:
      'T ~ Normal(μ, σ); μ = α + β_F·funding + β_S·size, with both β positive. The tell is "neither alone predicts": funding and lab size move together, and only when the golem holds one fixed does the other\'s positive effect surface. Same shape as neocortex-and-mass in the milk data.',
  },
  '5E4': {
    paraphrase: 'When are the index and indicator-variable formulations equivalent?',
    concept:
      'Index coding (one intercept per category) and indicator coding (a baseline plus offsets) describe the same fitted means when the category set is complete and non-overlapping.',
    strategy: 'Count free parameters and check they span the same category means.',
    solution:
      'They are inferentially equivalent whenever the dummies partition the categories exactly — same number of independent means, same fit. The index approach (a[category]) is preferred in the course because each category gets its own prior directly, with no awkward "difference from baseline" priors to reason about.',
  },
  '5M1': {
    paraphrase: 'Invent a spurious correlation and show it dissolving.',
    concept: 'A fork: one real cause drives two outcomes, so they correlate until you condition on the cause.',
    strategy: 'Simulate z → x and z → y with no x→y arrow, then regress y on x, then on x and z.',
    skeleton: `n <- 200
z <- rnorm(n)
x <- rnorm(n, z)
y <- rnorm(n, z)      # note: y depends on z, not x
# regress y ~ x, then y ~ x + z`,
    solution:
      '```r\nz <- rnorm(200); x <- rnorm(200, z); y <- rnorm(200, z)\n```\n\nRegress y on x alone: a clear positive slope, entirely spurious — x and y are correlated only because z drives both. Add z and the x-coefficient collapses to zero. You built a fork and then closed it, which is the whole trick behind "controlling for" a confound.',
  },
  '5M2': {
    paraphrase: 'Invent a masked relationship.',
    concept:
      'Two predictors correlated with each other and pushing the outcome in opposite directions hide until jointly modeled.',
    strategy: 'Make x1 and x2 correlated, y = x1 − x2 (opposite signs), then compare simple vs joint fits.',
    solution:
      '```r\nx1 <- rnorm(200)\nx2 <- rnorm(200, x1)      # correlated with x1\ny  <- rnorm(200, x1 - x2) # opposite signs\n```\n\nEach predictor alone looks weak — their effects cancel through the correlation. In the joint model both snap into focus with opposite signs. Masking is the mirror image of confounding: instead of faking an effect, correlation *hides* two real ones.',
  },
  '5M3': {
    paraphrase: 'How could a high divorce rate cause a high marriage rate? Test with multiple regression.',
    concept:
      'Reverse causation is a legitimate arrow; divorce frees people to remarry, raising the marriage rate.',
    strategy:
      'Propose divorce → remarriage → marriage rate, then think about what to measure (remarriage share) to test it.',
    solution:
      'Divorce produces a pool of people who can marry again, so a high divorce rate can *raise* the marriage rate — the arrow runs opposite to the naive story. To test it you would add remarriage rate (or the fraction of marriages that are remarriages) as a predictor and see whether it carries the divorce→marriage association. Regression cannot settle direction on its own; you need the extra measured variable that the causal story predicts.',
  },
  '5M4': {
    paraphrase: 'Add percent LDS to the divorce model and interpret.',
    concept: 'A third predictor that plausibly lowers divorce, on a scale that needs care (percentages, often logged).',
    strategy:
      'Standardize (and consider log) the LDS percentage, add it to m5.3, and read its coefficient with the others held fixed.',
    skeleton: `d$L <- scale(log(d$pct_LDS))
m <- quap(alist(
  D ~ dnorm(mu, sigma),
  mu <- a + bM*M + bA*A + bL*L,
  a ~ dnorm(0,0.2), bM ~ dnorm(0,0.5),
  bA ~ dnorm(0,0.5), bL ~ dnorm(0,0.5),
  sigma ~ dexp(1)
), data = d)`,
    solution:
      'The LDS coefficient comes out clearly negative: higher LDS share predicts lower divorce, holding age and marriage rate fixed. Logging first is defensible because the percentages are skewed and a few states dominate. The interpretive discipline is unchanged — β_L is the LDS association *conditional on* the other predictors, not a raw correlation.',
  },
  '5H1': {
    paraphrase: 'For the DAG M → A → D, which conditional independencies must hold?',
    concept:
      'A pure pipe M → A → D implies M ⊥ D given A: the middle node screens off the ends.',
    strategy: 'List every pair and ask whether conditioning on the intermediate blocks them.',
    solution:
      'The only implied independency is D ⊥ M | A. Condition on age at marriage and marriage rate should carry no further information about divorce. Check it by adding both to a regression: if bM ≈ 0 once A is present, the data are consistent with this DAG. (They are, roughly — which is why m5.3 kills the marriage-rate effect.)',
  },
  '5H2': {
    paraphrase: 'Fit the M → A → D DAG and compute a counterfactual: halve M, what happens to D?',
    concept:
      'To intervene on M you must propagate through A: M changes A, A changes D. A single regression of D on M and A will not do it — you need the M → A model too.',
    strategy:
      'Fit two models (A ~ M and D ~ A + M), then simulate: set M, draw A from the first, draw D from the second.',
    skeleton: `# model 1: A ~ M ; model 2: D ~ A + M
# counterfactual for a new M:
A_sim <- rnorm(n, aA + bMA * M_new, sigmaA)
D_sim <- rnorm(n, aD + bA*A_sim + bM*M_new, sigmaD)`,
    solution:
      'Halving the (standardized) marriage rate moves divorce only a little, and almost all of that movement arrives *through* age at marriage rather than directly. The counterfactual makes the pipe explicit: M\'s influence on D is mediated, so you cannot read it off the D-on-M-and-A coefficient alone — you have to push the change through the whole graph. This is the machinery chapter 5 is really teaching.',
  },
  '5H3': {
    paraphrase: 'Milk model: counterfactual of doubling body mass through the mass → neocortex path.',
    concept:
      'Mass affects milk energy both directly and via neocortex, so a mass intervention must propagate through N.',
    strategy:
      'Fit M → N and K ~ N + M, then simulate a new mass: draw N from the first model, K from the second.',
    solution:
      'Doubling log-mass changes N (the M → N model), and the new N plus the new M together move K (the K ~ N + M model). The total effect is the sum of the direct mass path and the mass-through-neocortex path, and it differs from the bare bM coefficient because that coefficient holds N *fixed* — exactly what an intervention on mass does not do. Same counterfactual discipline as 5H2, now on a fork-and-pipe.',
  },
  '5H4': {
    paraphrase: 'Add southernness to the divorce DAG and reconsider.',
    concept:
      'A region indicator is a candidate common cause; where it sits in the DAG decides whether it confounds the existing estimates.',
    strategy:
      'Draw arrows from South to whichever of A, M, D you think it influences, then check which back doors it opens or closes.',
    solution:
      'If South → A and South → D, it is a fork on the A–D relationship, and omitting it biases bA. Add S as a predictor (or as an index intercept) and see whether bA moves. The exercise has no single "right" DAG — the point is that adding a variable is a causal claim, and you justify it by drawing the arrows first and only then fitting. A golem given South with no theory will happily overfit region.',
  },
}
