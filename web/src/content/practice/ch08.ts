import type { ChapterHints } from './types'

/**
 * Chapter 8 hint ladders. One move throughout: let a slope depend on
 * another variable, then plot conditional predictions instead of
 * squinting at coefficient tables.
 */
export const ch08Hints: ChapterHints = {
  '8E1': {
    paraphrase: 'For each stated cause, invent a third variable that would moderate it.',
    concept: 'An interaction candidate is anything the mechanism needs to work.',
    strategy: 'For each causal story, ask: under what condition would this cause do nothing?',
    solution:
      'Yeast raises dough only in a warm kitchen: temperature moderates fermentation. Education raises income more in some labor markets, fields, or eras than others: any of those moderates the return. Gasoline moves a car only if the engine runs: a broken engine sets the gasoline slope to zero. In each case the moderator gates the mechanism rather than adding to it.',
  },
  '8E2': {
    paraphrase: 'Pick out which of the four explanations actually invokes an interaction.',
    concept: 'An interaction is a joint requirement, not two separate influences.',
    strategy: 'Rewrite each claim as a µ equation; only "the effect of A depends on B" earns a product term.',
    solution:
      'Only the onions: caramelizing requires low heat *and* not drying out — the effect of heat depends on moisture, a genuine interaction. The others are additive ("cylinders or fuel injector", "parents or friends", "wheels and looks") — multiple causes, each doing its work regardless of the others\' level.',
  },
  '8E3': {
    paraphrase: 'Write linear models for each of the 8E2 statements.',
    concept: 'Translation practice: "depends on" becomes a product; "also" becomes a sum.',
    strategy: 'One µ per statement; give the interaction only to the statement that earned it.',
    skeleton: `# onions: mu = a + bH*heat + bM*moisture + bHM*heat*moisture
# car:    mu = a + bC*cylinders + bF*injector
# beliefs: mu = a + bP*parents + bF*friends
# sales:  mu = a + bW*wheels + bL*looks`,
    solution:
      'Caramelizing: µ = α + β_H·heat + β_M·moisture + β_HM·heat·moisture, with β_HM negative — drying out cancels the benefit of heat. The other three are plain additive: µ = α + β₁x₁ + β₂x₂. Writing them out makes the difference concrete: the interaction claim lives entirely in that one product term.',
  },
  '8M1': {
    paraphrase: 'No tulip bloomed under the hot temperature — what does this say about the model?',
    concept: 'A moderator can zero out every other effect at once: a three-way interaction.',
    strategy: 'If heat kills blooms regardless of water and shade, temperature must multiply the whole water–shade structure, not add to it.',
    solution:
      'Temperature interacts with both water and shade — under heat, the water slope, the shade slope, and their product all collapse to zero. No additive term can say that: an additive temperature effect would just lower the intercept while leaving water still helping, which contradicts the total die-off. Biologically, heat breaks the machinery that water and light feed.',
  },
  '8M2': {
    paraphrase: 'Write a parameterization where blooms go exactly to zero when it is hot.',
    concept: 'Multiply the entire cold-weather mean by an indicator.',
    strategy: 'Let cold = 1 for cool, 0 for hot, and wrap the whole chapter-8 µ in it.',
    skeleton: `mu = cold * (a + bW*water_c + bS*shade_c + bWS*water_c*shade_c)`,
    solution:
      'µᵢ = coldᵢ · (α + β_W·waterᵢ + β_S·shadeᵢ + β_WS·waterᵢ·shadeᵢ). When cold = 0 the mean is exactly zero whatever the other dials say; when cold = 1 the familiar model returns untouched. One multiplication encodes "heat disables everything" — parameterization is model design, not bookkeeping.',
  },
  '8M3': {
    paraphrase: 'Simulate a raven population that depends on wolves and prey jointly.',
    concept: 'Species interaction as statistical interaction — ravens eat what wolves open up.',
    strategy: 'Simulate prey and wolves, make ravens depend on their product (no wolves, no carcasses; no prey, nothing to kill), then ask whether a linear interaction captures it.',
    skeleton: `N <- 500
prey   <- rnorm(N)
wolves <- rnorm(N)
ravens <- rnorm(N, mean = 0.2 + 0.6 * prey * wolves, sd = 0.5)`,
    solution:
      'Ravens should rise with wolves only where there is prey to hunt, so the generative mean needs the product prey·wolves — with few prey, wolves contribute nothing. A linear interaction fits the simulated pattern locally but nothing guarantees biology is linear: a saturating form (ravens can only eat so much carrion) is more defensible, and the exercise\'s real lesson is that you chose the generative equation, so you can also choose it to be nonlinear.',
  },
  '8M4': {
    paraphrase: 'Repeat the tulip analysis with priors constraining water up and shade down.',
    concept: 'Signed priors are scientific claims; prior predictive simulation shows what they buy.',
    strategy: 'Use lognormal (or truncated normal) priors to force β_W > 0 and β_S < 0, then simulate lines from the prior and compare the spread against the unconstrained version.',
    skeleton: `prior = c(
  prior(lognormal(0, 0.25), class = b, coef = water_c),
  # negative shade: model -shade with a positive prior, or use ub
  prior(normal(0, 0.25), class = b, coef = shade_c, ub = 0),
  ___)`,
    solution:
      'The constrained prior predictive stops proposing greenhouses where watering kills flowers and shade feeds them — the absurd quadrants vanish before any data arrive. The posterior barely moves (the tulip data already insist on those signs) but concentrates a little, and the interaction prior now has a cleaner job: with the main-effect signs fixed, β_WS < 0 is the single claim "shade throttles water", stated in advance.',
  },
  '8H1': {
    paraphrase: 'Add the greenhouse bed to the tulip model as a categorical predictor.',
    concept: 'Index variables extend to interactions untouched: one intercept per bed.',
    strategy: 'Give each bed its own intercept alongside the water–shade interaction; centered predictors keep the bed intercepts comparable.',
    skeleton: `m_bed <- brm(
  blooms_std ~ 0 + bed + water_c * shade_c,
  data = tulips,
  prior = c(prior(normal(0.5, 0.25), class = b),
            prior(exponential(1), class = sigma)),
  backend = "cmdstanr", seed = 1959)`,
    solution:
      'Bed a blooms noticeably less than beds b and c, which are near twins; the water, shade, and interaction estimates barely shift because the treatment structure is balanced across beds. The bed intercepts soak up nuisance variation (soil, position, luck) that otherwise inflates σ — a preview of the varying intercepts that chapter 13 will fit properly.',
  },
  '8H2': {
    paraphrase: 'Compare the with-bed and without-bed tulip models and reconcile the verdict.',
    concept: 'A small WAIC edge with wide error bars is a shrug, not a ruling.',
    strategy: 'loo_compare the two; look at the difference against its standard error; read the bed intercept posteriors alongside.',
    solution:
      'The bed model usually edges ahead, but the difference sits within a standard error or two of zero — 27 data points cannot decisively pay for two extra parameters. Meanwhile the posterior for bed a is clearly below the others. Both readings are correct at once: bed membership matters for these particular beds, and it barely improves prediction for hypothetical new ones. Estimation answers one question, comparison another.',
  },
  '8H3': {
    paraphrase: 'Hunt the influential country in the rugged analysis, then blunt it.',
    concept: 'One point can hold up a whole interaction; PSIS names it.',
    strategy: 'Check pointwise Pareto k for m8.3, find the small rugged Africa-rich state, then refit with student() and see how the Africa slope moves.',
    skeleton: `loo(m8.3)   # pareto k table
m8.3t <- brm(log_gdp_std ~ 0 + cid + cid:rugged_std_c,
  data = dd, family = student(), ___)`,
    solution:
      'The Seychelles: extremely rugged, unusually rich, and African — it props up a visible share of the positive Africa slope, and PSIS flags it with a high Pareto k. Under a Student-t likelihood its pull weakens and the Africa slope shrinks toward zero without vanishing. The interaction survives, more modestly. That is the pattern to internalize: influence diagnostics do not tell you to delete a country; they tell you how much one country is doing the talking.',
  },
  '8H4': {
    paraphrase: 'Evaluate the language-diversity hypotheses with the nettle data.',
    concept: 'Turn a verbal theory into two or three regressions with interactions, then let conditional plots judge.',
    strategy: 'Outcome: log languages per capita. Test mean growing season, sd growing season, and their interaction, with log area as a covariate; plot conditional slopes rather than reading the table.',
    skeleton: `nettle$lang.pc  <- log(nettle$num.lang / nettle$k.pop)
m_h <- brm(lang.pc ~ mean.growing.season * sd.growing.season + log(area),
  data = nettle, ___)`,
    solution:
      'Longer mean growing seasons associate with more languages per capita (food security lets small groups stay small), higher variance in season length associates with fewer (risk forces wider alliance networks), and the negative interaction says the two work jointly: a long average season only fragments societies where it is also reliable. Uncertainty is honest-sized — 74 countries — but the signs line up with the theory, and the interaction is the interesting part of the finding.',
  },
  '8H5': {
    paraphrase: 'Model the wine scores with judge and wine index variables.',
    concept: 'Two categorical axes, each with its own intercepts — no interaction yet.',
    strategy: 'Standardize score; give every judge and every wine an index intercept; read which judges run harsh or generous and which wines rate high.',
    skeleton: `m_wine <- brm(score_std ~ 0 + factor(judge) + factor(wine),
  data = wines, prior = prior(normal(0, 0.5), class = b), ___)`,
    solution:
      'Judges differ more than wines do: a couple are systematically generous and a couple harsh, spanning roughly a standard deviation of score, while most wines crowd together with one or two clear laggards. Variation you attribute to judges is variation the wines no longer have to explain — exactly why the indexes belong in the model.',
  },
  '8H6': {
    paraphrase: 'Refit the wine model using wine features instead of wine identities.',
    concept: 'Swap 20 wine intercepts for 3 descriptive slopes and see what survives.',
    strategy: 'Regress standardized score on flight (red/white), wine.amer, judge.amer; compare the story with 8H5.',
    solution:
      'The feature slopes are all small and uncertain: flight does almost nothing, and the American-origin coefficients hover near zero with wide intervals. Twenty identities compressed into three indicators lose most of what made individual wines distinct — the features simply do not carry the identity information. When a coarse model finds nothing, that is a statement about the coarseness as much as about the wines.',
  },
  '8H7': {
    paraphrase: 'Add the two-way interactions among flight and the American indicators.',
    concept: 'Interactions between indicator variables are just cell-mean adjustments — plot the cells.',
    strategy: 'Fit score on the three indicators plus their three pairwise products; then compute predicted means for the eight cells instead of reading coefficients.',
    skeleton: `m_int <- brm(score_std ~ flight * wine.amer + flight * judge.amer +
    wine.amer * judge.amer, data = wines, ___)
# then: posterior predictions for all indicator combinations`,
    solution:
      'One interaction stands out modestly: American judges rate American red wines a touch higher, i.e. the wine.amer × judge.amer (and its flight variant) terms lean positive while everything else stays near zero. On the cell-mean scale the effect is small — fractions of a standard deviation — and the main lesson is procedural: with indicator interactions, coefficients are differences of differences, unreadable in a table and obvious in a plot of the eight predicted cells.',
  },
}
