import type { ChapterHints } from './types'

/**
 * Chapter 14 hint ladders. Varying slopes and the covariance prior first,
 * then the café simulations and uncorrelated comparisons, then Gaussian
 * processes over distance and phylogeny, and the social-relations network.
 * Original brms translations validated against the manual's numbers only.
 */
export const ch14Hints: ChapterHints = {
  '14E1': {
    paraphrase: 'Rewrite the given varying-intercept model to also let the slope vary by cluster.',
    concept: 'A varying slope draws the intercept and slope jointly from a multivariate normal.',
    strategy: 'Replace the univariate adaptive prior on the intercept with a two-dimensional one over the (intercept, slope) pair.',
    skeleton: `# was: a[group] ~ dnorm(a_bar, sigma_a)
c(a, b)[group] ~ multi_normal(c(a_bar, b_bar), Rho, sigma_group)
a_bar ~ dnorm(...); b_bar ~ dnorm(...)
sigma_group ~ dexp(1)
Rho ~ lkj_corr(2)`,
    solution:
      'The intercept and slope for each group become a pair drawn from a multivariate normal with a mean vector, a vector of standard deviations, and a correlation matrix R. In brms this is the step from `y ~ x + (1 | group)` to `y ~ x + (1 + x | group)`, where the shared `| group` estimates the correlation between the varying intercept and the varying slope. The model now has one extra parameter — that correlation — and it is where the chapter\'s payoff lives.',
  },
  '14E2': {
    paraphrase: 'Describe a context in which the varying intercepts and slopes would be positively correlated.',
    concept: 'Positive correlation means high-baseline clusters also respond more strongly.',
    strategy: 'Look for a setting where the units that start high also gain the most from the predictor.',
    solution:
      'Coffee shops in wealthy neighborhoods might have both higher baseline sales (intercept) and a steeper response to a loyalty discount (slope), because their customers have more to spend — the ones that start high also swing high. Classrooms where strong teachers both raise the average score and amplify the effect of extra study time work too. The signature is that whatever pushes the intercept up pushes the slope up as well, tilting the covariance ellipse upward.',
  },
  '14E3': {
    paraphrase: 'Can a varying-slopes model ever have fewer effective parameters than the corresponding fixed-slope model? Explain.',
    concept: 'Shrinkage can drive the effective number of parameters below the nominal count.',
    strategy: 'Think about what happens to the effective parameter count when σ is estimated near zero.',
    solution:
      'Yes. When the data show little genuine variation in slopes, the model estimates a small slope σ and pools the varying slopes almost to a single value, so the effective number of parameters (as WAIC or PSIS measures it) can fall below that of the unpooled fixed-slope model, despite the varying-slopes model having more nominal parameters. Adaptive regularization is the mechanism: parameters that the data do not support are shrunk until they cost almost nothing. More parameters on paper, fewer in effect.',
  },
  '14M1': {
    paraphrase: 'Repeat the café simulation with the true intercept–slope correlation set to zero; check what the model recovers.',
    concept: 'The posterior correlation should concentrate near zero when the truth is zero.',
    strategy: 'Simulate cafés with ρ = 0, fit m14.1, and inspect the posterior for the correlation parameter.',
    skeleton: `# simulate with rho = 0, then
m <- brm(wait ~ 1 + afternoon + (1 + afternoon | cafe),
  data = d, family = gaussian(),
  prior = c(..., prior(lkj(2), class = cor)), ...)`,
    solution:
      'With ρ set to zero in the simulation, the fitted model recovers a posterior correlation centered near zero, its width reflecting how many cafés and visits you simulated. The lkj(2) prior already leans toward zero, so the model has no trouble agreeing. The point of the exercise is calibration — the varying-slopes machinery does not manufacture a correlation that is not there, and the posterior honestly reports its uncertainty about it.',
  },
  '14M2': {
    paraphrase: 'Fit the café data with varying intercepts and slopes but no correlation between them, and compare to m14.1 by WAIC.',
    concept: 'Dropping the correlation removes the sideways pooling channel.',
    strategy: 'Use two independent varying effects instead of a joint multivariate normal, and compare out-of-sample score.',
    skeleton: `# uncorrelated: (1 | cafe) + (0 + afternoon | cafe)
m_uncor <- brm(wait ~ 1 + afternoon + (1 | cafe) + (0 + afternoon | cafe),
  data = d, family = gaussian(), ...)`,
    solution:
      'The uncorrelated model scores close to m14.1 when the true correlation is weak and slightly worse when it is strong, because it cannot use knowledge of a café\'s intercept to sharpen its slope. WAIC differences are usually modest, since both models still pool each effect on its own; the correlated model wins mainly in its ability to make better per-café predictions from partial information. The comparison isolates exactly what the off-diagonal term buys.',
  },
  '14M3': {
    paraphrase: 'Refit the café model with far more cafés (or more visits) and describe how the correlation estimate changes.',
    concept: 'More clusters sharpen the estimate of the between-cluster covariance.',
    strategy: 'Increase the number of cafés and watch the posterior for ρ tighten around the truth.',
    solution:
      'Increasing the number of cafés narrows the posterior for the correlation, because the correlation is a property of the population of cafés, and you learn it from having many cafés rather than many visits per café. More visits per café sharpen each individual estimate but do less for ρ. This mirrors the reedfrog lesson from chapter 13: hyperparameters are learned from the count of clusters, so a covariance is only as well-estimated as your number of groups is large.',
  },
  '14M4': {
    paraphrase: 'Fit a Gaussian-process model to the Oceanic tools using the island distance matrix, and interpret the covariance function.',
    concept: 'A Gaussian process replaces per-society effects with a covariance that decays with distance.',
    strategy: 'Use the squared-exponential kernel over distances, fit the tool-count Poisson model, and plot posterior covariance against distance.',
    skeleton: `m <- brm(total_tools ~ 1 + gp(lon2, lat2, scale = FALSE),
  data = d, family = poisson(),
  prior = c(prior(normal(3, 0.5), class = Intercept),
            prior(inv_gamma(2, 1), class = lscale),
            prior(exponential(1), class = sdgp)), ...)`,
    solution:
      'The posterior covariance function falls off steeply: societies within a thousand kilometers or so share meaningful covariance in their tool counts, and beyond a few thousand it decays to almost nothing. Malekula, Tikopia, and Santa Cruz pool tightly; Hawaii sits nearly alone. Interpreting the kernel means reading η² as the maximum covariance and ρ² (or brms\'s length scale) as how fast proximity stops mattering. The model has learned one smooth rule for the whole map instead of ten disconnected intercepts.',
  },
  '14M5': {
    paraphrase: 'Fit a phylogenetic Gaussian process to the Primates data, treating the phylogeny as a distance matrix; interpret.',
    concept: 'Phylogenetic distance can play exactly the role geographic distance did.',
    strategy: 'Build the covariance from branch-length distances between species and fit the outcome (e.g. group size or brain volume) with a GP over that matrix.',
    solution:
      'Using phylogenetic distances in the kernel, closely related primate species get correlated varying effects, so the model accounts for the fact that species are not independent data points — they share ancestry. Whether the phylogenetic covariance matters is itself estimated: if the outcome carries strong phylogenetic signal, η² is large and the naive independent-species regression was overconfident; if not, the GP shrinks toward independence. The mechanics are identical to the islands — only the meaning of "distance" changed.',
  },
  '14H1': {
    paraphrase: 'Bangladesh again: add a varying urban slope with correlation to the district intercept, and interpret the covariance.',
    concept: 'The urban effect can vary by district and correlate with baseline use.',
    strategy: 'Fit (1 + urban | district) and read the intercept–slope correlation.',
    skeleton: `m <- brm(use ~ 1 + urban + (1 + urban | district),
  data = d, family = bernoulli(),
  prior = c(prior(normal(0, 1), class = b),
            prior(exponential(1), class = sd),
            prior(lkj(2), class = cor)), ...)`,
    solution:
      'The intercept–slope correlation comes out negative: districts with low rural contraceptive use tend to show the strongest urban effect, so urban and rural rates are further apart precisely where the rural baseline is low, and closer together where it is already high. Reading it as a ceiling helps — districts near the top have little room for urban to add. This is the varying-slopes payoff on real data: the covariance is a substantive finding, not just a nuisance parameter.',
  },
  '14H2': {
    paraphrase: 'Fit the social-relations model to the KosterLeckie gift-giving network, with varying effects for giving, receiving, and the dyad.',
    concept: 'A social-relations model separates generalized giving, generalized receiving, and dyad-specific reciprocity.',
    strategy: 'Give each household varying giver and receiver effects (correlated) and each dyad a pair of correlated tie effects.',
    solution:
      'The model splits gift-giving into three sources: how much a household gives in general, how much it receives in general, and the household-pair-specific ties. The giver–receiver correlation asks whether generous households are also popular recipients; the within-dyad correlation measures reciprocity — whether a gift from A to B predicts a return from B to A. Fitting it in brms needs multiple grouping terms with their own covariance matrices, and the reward is decomposing a network into interpretable, partially pooled pieces rather than one tangle of coefficients.',
  },
}
