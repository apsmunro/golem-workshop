import type { ChapterHints } from './types'

/**
 * Chapter 2 hint ladders. Problems referenced by ID; work from your copy
 * of the book. All text and code here is original. Numerical answers
 * cross-checked against standard results for these problems.
 */
export const ch02Hints: ChapterHints = {
  '2E1': {
    paraphrase: 'Match the notation to the phrase "the probability of rain on Monday".',
    concept:
      'Read Pr(A|B) as "the probability of A, when B is already settled". Whatever sits right of the bar is taken as given, never as uncertain.',
    strategy:
      'Say each candidate out loud as a sentence. Two of them turn out to be the same sentence written two ways.',
    solution:
      'Statements (2) and (4). Pr(rain|Monday) is the direct translation, and Pr(rain, Monday)/Pr(Monday) is its definition: joint plausibility of rain-and-Monday, rescaled by how plausible Monday is. Same number, two costumes.',
  },
  '2E2': {
    paraphrase: 'Which sentence does Pr(Monday|rain) express?',
    concept:
      'The bar does the work: the right side is the given, the left side is the question.',
    strategy:
      'Here "rain" is on the right. So rain is settled and Monday is in doubt. Only one option runs that direction.',
    solution:
      'Statement (3): the probability that it is Monday, given that it is raining. If you picked "the probability of rain, given Monday", you swapped question and given — the single most common conditioning error, and the same one that makes medical tests confusing.',
  },
  '2E3': {
    paraphrase: 'Pick every expression for "the probability it is Monday, given rain".',
    concept:
      "One of the correct answers is Bayes' theorem wearing no label. The theorem is nothing more than the conditioning definition run in reverse.",
    strategy:
      'Write down Pr(Monday|rain) = Pr(Monday, rain)/Pr(rain), then expand the joint the other way: Pr(Monday, rain) = Pr(rain|Monday) Pr(Monday). Now compare against the candidates.',
    solution:
      'Statements (1) and (4). Pr(Monday|rain) directly, and Pr(rain|Monday) Pr(Monday)/Pr(rain) by expanding the joint. Nothing new was assumed in the second form; it is bookkeeping. That is the whole secret of the theorem.',
  },
  '2E4': {
    paraphrase: 'What does "the probability of water is 0.7" actually claim about the globe?',
    concept:
      'In the small world, probability describes the golem\'s uncertainty, never a hidden property of the globe. The globe does what physics tells it; the 0.7 lives in the model.',
    strategy:
      'Imagine you knew the toss perfectly: initial spin, air, catch. Where would the 0.7 go? Answering that tells you what the number was doing all along.',
    solution:
      'It means: given our model and our ignorance of each toss\'s exact physics, 0.7 is an honest summary of how plausible a water observation is. A perfectly informed observer would need no probability at all. So "0.7" describes the describer. The golem\'s numbers are statements about information, and that is why new data are allowed to change them.',
  },
  '2M1': {
    paraphrase: 'Grid-approximate the globe posterior, flat prior, for three data sets.',
    concept:
      'Grid approximation is the garden of forking data with the hypotheses lined up on a ruler: score each candidate p by how well it predicts the data, then normalize.',
    strategy:
      'Build a grid of p values, give each prior weight 1, compute the binomial likelihood of the observed tally at each p, multiply, normalize. Then plot posterior against p and describe the shape for each data set.',
    skeleton: `p_grid <- seq(0, 1, length.out = ___)
prior <- rep(1, length(p_grid))
likelihood <- dbinom(___, size = ___, prob = p_grid)
posterior_raw <- likelihood * prior
posterior <- posterior_raw / sum(posterior_raw)
plot(p_grid, posterior, type = "l")`,
    solution:
      'Run the same five lines three times, changing only the tally.\n\n```r\ngrid_posterior <- function(w, n, grid_n = 1000) {\n  p_grid <- seq(0, 1, length.out = grid_n)\n  likelihood <- dbinom(w, size = n, prob = p_grid)\n  posterior <- likelihood / sum(likelihood)  # flat prior folds in\n  list(p = p_grid, posterior = posterior)\n}\n\nfit1 <- grid_posterior(3, 3)   # W W W\nfit2 <- grid_posterior(3, 4)   # W W W L\nfit3 <- grid_posterior(5, 7)   # L W W L W W W\n```\n\nThree waters in three tosses piles all plausibility toward p = 1, with the peak exactly at 1. One land drags the peak back to 0.75 and gives the curve a proper mode. Five of seven puts the peak near 0.71 and visibly narrows it: more tosses, more concentration. Watch how a single contrary observation reshapes the whole curve when data are scarce.',
  },
  '2M2': {
    paraphrase: 'Same three fits, but the prior now rules out p below one half.',
    concept:
      'A prior is a conjecture with weights. Setting weight zero below 0.5 means "a mostly-land globe is off the table before any toss".',
    strategy:
      'Only one line changes from 2M1: the prior becomes a step function of the grid. Everything downstream is identical.',
    skeleton: `p_grid <- seq(0, 1, length.out = 1000)
prior <- ifelse(p_grid < ___, ___, ___)
likelihood <- dbinom(w, size = n, prob = p_grid)
posterior_raw <- likelihood * prior
posterior <- posterior_raw / sum(posterior_raw)`,
    solution:
      '```r\nprior <- ifelse(p_grid < 0.5, 0, 1)\n```\n\nBelow 0.5 the posterior is now exactly zero regardless of data — zero prior weight annihilates any likelihood. Above 0.5 each curve is the 2M1 shape, renormalized over the surviving region. For W W W the change is mild (the data already pointed above 0.5). For W W W L the posterior now slams into a wall at 0.5 instead of tailing off. Priors do surgery, never gentle nudging, when they contain hard zeros.',
  },
  '2M3': {
    paraphrase: 'Two globes, one shows land: how plausible is it that you tossed Earth?',
    concept:
      'This is the garden with two conjectures instead of five: Earth (30% land) and Mars (100% land). One observation of land prunes paths in each.',
    strategy:
      'Count with plausibilities: each globe starts at 1/2. Weight each by the chance it produces land, then normalize across the two.',
    solution:
      'Pr(Earth | land) = (0.3 × 0.5) / (0.3 × 0.5 + 1.0 × 0.5) = 0.15 / 0.65 ≈ 0.23.\n\nLand is unsurprising from Mars and mildly surprising from Earth, so the observation shifts plausibility toward Mars — without proving anything. A single datum moved you from 50% to 23%; that is what evidence is.',
  },
  '2M4': {
    paraphrase: 'Three cards, one drawn: a black face is up. Count the ways to a black back.',
    concept:
      'Count faces, never cards. The visible black face could be any one of the black faces in the deck, and each is its own path through the garden.',
    strategy:
      'List every black face each card could be showing: B/B has two ways to show black, B/W has one, W/W has none. Then ask which of those ways carry a black back.',
    solution:
      'Three ways to see a black face: two from the B/B card, one from B/W. Of those three ways, two have a black back — both from B/B. So Pr(other side black) = 2/3, though intuition begs for 1/2. Intuition treats the cards as equally likely given the observation; counting shows the observation itself favors the double-black card two-to-one.',
  },
  '2M5': {
    paraphrase: 'Add a second B/B card to the bag and recount.',
    concept: 'Same garden, more paths. New faces mean new ways to have produced the observation.',
    strategy: 'Redo the 2M4 census with four cards: B/B, B/W, W/W, B/B.',
    solution:
      'Black faces now: 2 + 1 + 0 + 2 = 5 ways. Ways with a black back: 4 (two from each B/B). Pr = 4/5. Each added double-black card makes the observed black face even less surprising from a double-black source.',
  },
  '2M6': {
    paraphrase: 'Black ink is heavy: prior counts 1, 2, 3 for B/B, B/W, W/W. Recount.',
    concept:
      'Prior weights multiply path counts — exactly the "update again" rule in the garden, applied before any draw.',
    strategy:
      'For each card: (ways to show black) × (prior count). Then normalize over the black-face total.',
    solution:
      'B/B: 2 × 1 = 2. B/W: 1 × 2 = 2. W/W: 0 × 3 = 0. Total 4, of which 2 lead to a black back. Pr = 2/4 = 0.5. The pull-from-the-bag prior exactly cancels the evidence in the face, landing you back at the naive answer — a coincidence of these particular weights, never a law.',
  },
  '2M7': {
    paraphrase: 'Draw a second card; its face shows white. Recount for the first card\'s back.',
    concept:
      'Both observations prune the same garden. Count joint sequences: (first card shows black) and (second card shows white).',
    strategy:
      'For each ordered pair of distinct cards, multiply the ways: first shows black × second shows white. Then sum by identity of the first card.',
    solution:
      'First = B/B (2 black faces): second is B/W (1 white face) or W/W (2): 2 × (1 + 2) = 6 ways. First = B/W (1 black face): second is B/B (0 white faces) or W/W (2): 1 × 2 = 2 ways. Total 8; black-back-first accounts for 6. Pr = 6/8 = 0.75. The white face on the second card is indirect evidence about the first — it "uses up" white faces that the first card might otherwise have owned.',
  },
  '2H1': {
    paraphrase: 'A panda has twins. How plausible are twins at her next birth?',
    concept:
      'Two-species mixture: the answer is a posterior-weighted average of each species\' twin rate, never either rate alone.',
    strategy:
      'First get Pr(species | twins) for both species. Then push those posteriors through each species\' twinning probability and add.',
    solution:
      'Posterior after one twin birth: A gets 0.1 × 0.5 = 0.05, B gets 0.2 × 0.5 = 0.10, so Pr(A|twins) = 1/3, Pr(B|twins) = 2/3.\n\nNext birth: Pr(twins) = (1/3)(0.1) + (2/3)(0.2) = 1/6 ≈ 0.167.\n\nNote it sits above the naive 0.15 average: the first twins tilted the odds toward the twin-happier species.',
  },
  '2H2': {
    paraphrase: 'Same panda: probability she is species A, given the one twin birth.',
    concept: 'This is the intermediate step of 2H1 promoted to the question itself.',
    strategy: 'Weigh each species by its rate of producing the observed event.',
    solution:
      'Pr(A | twins) = 0.1 × 0.5 / (0.1 × 0.5 + 0.2 × 0.5) = 1/3. Twins are twice as common under B, so B soaks up two thirds of the plausibility.',
  },
  '2H3': {
    paraphrase: 'Second birth is a singleton. Update Pr(species A) again.',
    concept:
      'Sequential updating: yesterday\'s posterior is today\'s prior. Or process both births at once — same answer, and checking that is the lesson.',
    strategy:
      'Likelihood of "twins then singleton" per species: A gives 0.1 × 0.9, B gives 0.2 × 0.8. Weight by the original halves, normalize.',
    solution:
      'A: 0.09 × 0.5 = 0.045. B: 0.16 × 0.5 = 0.080. Pr(A) = 0.045/0.125 = 0.36.\n\nThe singleton pushed plausibility back toward A (singletons are A\'s specialty), from 1/3 up to 0.36. Order does no work here: batch and sequential updating agree exactly.',
  },
  '2H4': {
    paraphrase: 'A genetic test says "species A". Update with the test alone, then with the births too.',
    concept:
      'A noisy test is just another likelihood. Its error rates are the ways it produces the observation under each hypothesis.',
    strategy:
      'Test says A. Under A that happens with 0.8; under B with 1 − 0.65 = 0.35. First use prior 0.5/0.5; then swap in the 2H3 posterior (0.36/0.64) as the prior.',
    solution:
      'Test only: Pr(A | test A) = 0.8 × 0.5 / (0.8 × 0.5 + 0.35 × 0.5) ≈ 0.6957.\n\nTest plus births: prior 0.36/0.64 gives 0.8 × 0.36 / (0.8 × 0.36 + 0.35 × 0.64) = 0.288/0.512 = 0.5625.\n\nThe birth record drags the "positive test" conclusion down from 70% to 56%. Evidence composes: no single source owns the answer, and the golem happily weighs a lab result against a field diary.',
  },
}
