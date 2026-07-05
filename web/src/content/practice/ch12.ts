import type { ChapterHints } from './types'

/**
 * Chapter 12 hint ladders. Over-dispersion and mixtures first, then the
 * ordered-categorical machinery, then the full re-analyses across the
 * over-dispersed, zero-inflated, and ordered datasets.
 */
export const ch12Hints: ChapterHints = {
  '12E1': {
    paraphrase: 'Distinguish an ordered categorical variable from an unordered one.',
    concept: 'Order without spacing: categories rank but the gaps are not numbers.',
    strategy: 'Ask whether the categories have a natural sequence, and separately whether the distance between adjacent ones is meaningful.',
    solution:
      'An unordered categorical (eye color, species) has categories with no inherent sequence. An ordered categorical (survey grade 1–7, education level) has a definite sequence but no guarantee that the step from 1 to 2 equals the step from 6 to 7. That missing metric is exactly why you cannot treat the response as a number and run ordinary regression — you would be inventing distances the data never provided.',
  },
  '12E2': {
    paraphrase: 'What link does an ordered-logit model use, and on what quantity?',
    concept: 'A cumulative logit: log-odds of being at or below each cutpoint.',
    strategy: 'Recall that the cutpoints live on the cumulative probability, not the individual category probability.',
    solution:
      'It uses the logit of the *cumulative* probability: for each threshold k, log-odds that the response falls in category k or below. The cutpoints are those cumulative log-odds, and individual category probabilities come from differencing adjacent cumulative ones. The dragger makes this physical — each cutpoint is a slice through the latent axis, and a bar is the gap between two slices.',
  },
  '12E3': {
    paraphrase: 'What happens if you ignore zero-inflation when it is present?',
    concept: 'The rate parameter is biased downward and the zero count is under-predicted.',
    strategy: 'Split the zeros into their two sources and ask which the plain model can see.',
    solution:
      'A plain Poisson blames every zero on a low rate, so it pulls λ down to manufacture enough zeros — underestimating the true working rate — and still fails, because it cannot produce as many zeros as a two-process world generates. You get a biased rate and a posterior predictive check that visibly misses the zero bar. The zero-inflated model separates "didn\'t happen because idle" from "didn\'t happen by chance", recovering both quantities.',
  },
  '12E4': {
    paraphrase: 'Give an example that would generate over-dispersed counts and one that would generate under-dispersed counts.',
    concept: 'Unmodeled variation inflates variance; enforced regularity deflates it.',
    strategy: 'Over-dispersion comes from heterogeneity or clustering; under-dispersion from processes that space events out.',
    solution:
      'Over-dispersion: counts pooled across units with different underlying rates — customers per store across cities, parasites per host across immune systems — where the mixing of rates fattens the variance beyond Poisson. Under-dispersion: processes with built-in regularity, like a machine dispensing exactly one item every fixed interval, or territorial animals that space nests more evenly than randomness would, giving variance below the mean. Real data lean over-dispersed far more often, which is why the gamma-Poisson gets the most use.',
  },
  '12M1': {
    paraphrase: 'Compute the implied ordered-logit cutpoints for a given set of response frequencies by hand.',
    concept: 'Cutpoints are logits of cumulative proportions.',
    strategy: 'Cumulate the frequencies, divide by the total for cumulative proportions, drop the last, and take logits.',
    solution:
      'Cumulate the counts, normalize to cumulative proportions p₁ ≤ p₂ ≤ … ≤ p₆, then each cutpoint κ_k = log(p_k / (1 − p_k)). For an employee-rating example rising then falling, the middle cutpoints cluster where most mass sits and the outer ones stretch toward ±2. This is the identical closed form the dragger reveals — the "fit" of an intercept-only ordered model is pure bookkeeping on the cumulative proportions.',
  },
  '12M2': {
    paraphrase: 'Draw the cumulative-probability picture for those frequencies and relate it to the cutpoints.',
    concept: 'The cumulative curve is a staircase; cutpoints are its logit-scale riser heights.',
    strategy: 'Plot cumulative proportion against category and see each cutpoint as where the curve passes a given height.',
    solution:
      'The cumulative proportions trace a staircase from near 0 to 1 across the seven categories. On the probability scale the steps are uneven — tall where a category is common. Pass each cumulative value through the logit and the staircase becomes the six cutpoints on the latent axis; crowded categories map to closely spaced cutpoints, rare ones to wide gaps. The dragger\'s bar panel and axis panel are these two views side by side.',
  },
  '12M3': {
    paraphrase: 'Convert a zero-inflated binomial description into an explicit mixture likelihood.',
    concept: 'A mixture sums the probabilities of each way an observation could arise.',
    strategy: 'Write P(y = 0) as the sum over both processes and P(y > 0) as the surviving process only.',
    solution:
      'With inflation probability p and binomial success probability q over n trials: P(y = 0) = p + (1 − p)(1 − q)ⁿ, and for y > 0, P(y) = (1 − p)·C(n, y)·qʸ(1 − q)^(n−y). The zero gets contributions from the inflation process and from an ordinary binomial zero; every positive count can only come from the binomial, because the inflation process produces nothing but zeros. Writing it out this way is what lets HMC marginalize the hidden state and sample the rest.',
  },
  '12H1': {
    paraphrase: 'Fit the Hurricanes data — does feminine-ness of a name predict deaths, as a Poisson?',
    concept: 'Poisson regression plus a hard look at over-dispersion and influential storms.',
    strategy: 'Model deaths on femininity, then on femininity × damage, and check whether a gamma-Poisson changes the story.',
    skeleton: `m_hur <- brm(deaths ~ femininity, data = d, family = poisson(),
  prior = prior(normal(0, 0.5), class = b), ...)
m_hur_gp <- brm(deaths ~ femininity, data = d, family = negbinomial(), ...)`,
    solution:
      'The plain Poisson finds a small "feminine names kill more" association, but the deaths are wildly over-dispersed — a few catastrophic storms dominate — and once you switch to a gamma-Poisson the effect\'s interval widens to include zero. Adding damage and pressure, the real drivers, shrinks femininity further. The exercise is a parable about over-dispersion masquerading as signal: the pure golem was over-confident, and the honest one is unimpressed.',
  },
  '12H2': {
    paraphrase: 'Refit the Hurricanes counts as a gamma-Poisson and compare inferences.',
    concept: 'The gamma-Poisson lets each storm draw its own rate, widening intervals honestly.',
    strategy: 'Fit family = negbinomial(), compare the femininity interval and the predictive spread against the Poisson.',
    skeleton: `m_gp <- brm(deaths ~ femininity + damage_norm,
  data = d, family = negbinomial(),
  prior = prior(normal(0, 0.5), class = b), ...)`,
    solution:
      'The gamma-Poisson\'s extra shape parameter absorbs the between-storm variation the Poisson had no way to express, so every coefficient keeps roughly its central estimate but gains a much wider interval, and the posterior predictive finally covers the deadly outliers. Femininity, credible under the Poisson, is no longer distinguishable from zero. Nothing about the point estimates was a lie; the Poisson\'s intervals were, and the mixture tells the truth about uncertainty.',
  },
  '12H3': {
    paraphrase: 'Add an interaction with damage to the hurricane model and interpret.',
    concept: 'The femininity effect, if any, may only appear for severe storms.',
    strategy: 'Include femininity × damage and read the predicted deaths across the damage range for feminine vs masculine names.',
    solution:
      'The interaction is where the book\'s original claim really lived: any femininity signal concentrates in the high-damage storms, where the argument was that people under-prepared for "less threatening" names. Even so, with the gamma-Poisson\'s honest intervals the interaction is fragile, resting on a handful of severe storms. The modeling lesson stands regardless of the substantive verdict — interactions on the log scale multiply, and you must plot predictions across the moderator to see what a coefficient claims.',
  },
  '12H4': {
    paraphrase: 'Fit the Trolley data with the full action/intention/contact ordered-logit and interpret the contrasts.',
    concept: 'Ordered-logit with predictors shifting the latent axis via φ.',
    strategy: 'Fit the cumulative-logit model with the interactions, then read effects as shifts in the whole response distribution, not single categories.',
    skeleton: `m12.5 <- brm(response ~ action + contact + intention +
  intention:action + intention:contact,
  data = d, family = cumulative("logit"),
  prior = c(prior(normal(0, 0.5), class = b),
            prior(normal(0, 1.5), class = Intercept)), ...)`,
    solution:
      'Every treatment lowers approval, and the interactions matter: intention combined with contact produces the harshest judgment, more negative than adding the two main effects would suggest. Because predictors move φ and not the cutpoints, each coefficient shifts the entire response distribution down the scale — the dragger\'s φ slider is this exact motion. Reporting a single "average drop" undersells it; the whole histogram slides.',
  },
  '12H5': {
    paraphrase: 'Add gender to the Trolley model and ask whether the effects of intention differ by gender.',
    concept: 'Interaction between a person-level variable and the treatment on the latent scale.',
    strategy: 'Include gender and gender × intention, and compare the intention effect within each gender.',
    solution:
      'Men and women differ somewhat in baseline severity, and the intention effect is modestly stronger for one group, but the effect is present and negative for both — intention makes a scenario worse regardless. The care here is not to over-read a gender × intention coefficient on the latent scale: convert to predicted response distributions for representative respondents before claiming a difference, because latent-scale interactions do not translate one-to-one into visible category shifts.',
  },
  '12H6': {
    paraphrase: 'The Fish data as a zero-inflated Poisson — separate the fishing from the catching.',
    concept: 'Zero-inflation with the two processes possibly driven by different predictors.',
    strategy: 'Model the zero-inflation probability (were they even fishing?) and the rate (given fishing, how many?) with their own linear predictors.',
    skeleton: `m_fish <- brm(bf(fish ~ persons + child, zi ~ camper),
  data = d, family = zero_inflated_poisson(),
  prior = ___, ...)`,
    solution:
      'The two sub-models tell different stories: group size and children drive the catch rate, while whether the party came to fish at all (the inflation part) responds to features like having a camper. Splitting them recovers a believable catch rate that a plain Poisson had deflated by blaming non-fishers\' zeros on bad luck. The interpretive discipline is remembering which coefficient lives in which process — a predictor can raise the rate while doing nothing to the probability of fishing.',
  },
  '12H7': {
    paraphrase: 'Use ordered predictors (education) with a Dirichlet prior in some outcome model and interpret the increments.',
    concept: 'Monotonic effects: an ordered predictor enters as summed increments with a simplex prior.',
    strategy: 'Give education a Dirichlet-distributed set of step increments δ so the model never assumes equal spacing between levels.',
    skeleton: `m_edu <- brm(response ~ mo(edu_ordered) + action + intention,
  data = d, family = cumulative("logit"),
  prior = prior(dirichlet(2), class = simo, coef = moedu1), ...)`,
    solution:
      'brms\'s mo() term multiplies a total education effect by a simplex of increments δ₁…δ_k summing to one, with a Dirichlet prior over how the effect distributes across steps. The posterior δ often shows the jumps are uneven — some educational transitions matter far more than others — which is the whole reason not to code education as a number. You get one interpretable total effect plus an honest picture of where along the ladder it accrues.',
  },
  '12H8': {
    paraphrase: 'Invent or find a dataset where under-dispersion appears and discuss modeling options.',
    concept: 'Under-dispersion needs a distribution with variance below the mean.',
    strategy: 'Identify a regular process, then consider generalized-count families (e.g. Conway–Maxwell–Poisson) or a mechanistic reframing.',
    solution:
      'Regularly spaced events — items off a metered dispenser, evenly spaced territorial nests, scheduled arrivals — produce variance below the mean, which no Poisson or gamma-Poisson can represent (both have variance at least the mean). Options are a generalized count distribution such as Conway–Maxwell–Poisson that carries a dispersion parameter in both directions, or, better where possible, modeling the mechanism that enforces the regularity directly. The meta-lesson closes the chapter: match the likelihood to how the counts are actually generated, in both directions of dispersion.',
  },
}
