import type { ChapterHints } from './types'

/**
 * Chapter 6 hint ladders. The whole chapter is one lesson — condition on
 * the right variables — so every ladder routes through the DAG.
 */
export const ch06Hints: ChapterHints = {
  '6E1': {
    paraphrase: 'Name three mechanisms that bias a multiple regression.',
    concept: 'Three ways conditioning goes wrong: confounding, colliders, and post-treatment control.',
    strategy: 'Recall the shapes: fork not closed, collider opened, mediator conditioned.',
    solution:
      'Multicollinearity (predictors so correlated the golem cannot tell them apart), post-treatment bias (conditioning on a variable between cause and effect), and collider bias (conditioning on a common effect of two variables). Each is a conditioning error; none is fixed by more data.',
  },
  '6E2': {
    paraphrase: 'Give a real-world example of one of those biases.',
    concept: 'Pick a mechanism and tell its causal story concretely.',
    strategy: 'A collider or post-treatment example from your own field is best; make the arrows explicit.',
    solution:
      'Post-treatment: a drug trial that "controls for" blood pressure at follow-up, when the drug works by lowering blood pressure — the adjustment deletes the effect. Or collider: hiring only on either strong grades or strong interviews makes the two look negatively related among employees though they are unrelated in applicants. State the DAG and name which node you wrongly conditioned on.',
  },
  '6E3': {
    paraphrase: 'State the four elemental confounds and their conditional independencies.',
    concept: 'Fork, pipe, collider, descendant — each has a signature (in)dependence.',
    strategy: 'For each, write what is independent of what, and whether conditioning helps or hurts.',
    solution:
      'Fork (X ← Z → Y): X and Y dependent, independent given Z. Pipe (X → Z → Y): dependent, independent given Z. Collider (X → Z ← Y): X and Y independent, dependent given Z. Descendant: conditioning on a child of Z partially conditions on Z, weakly reproducing whatever Z would do. The first two say "condition to fix", the third says "conditioning breaks it".',
  },
  '6E4': {
    paraphrase: 'Why is a biased sample like conditioning on a collider?',
    concept: 'Selection into the sample is itself a variable you have conditioned on.',
    strategy: 'Think of "being in the sample" as a node with arrows pointing into it.',
    solution:
      'A sample selected on some criterion is a sample conditioned on the collider "selected = yes". If two independent traits both raise the chance of selection, they become correlated among the selected — the grant-committee story. So a biased sample manufactures associations by exactly the collider mechanism, with selection playing Z.',
  },
  '6M1': {
    paraphrase: 'Add a new variable and re-derive the implied conditional independencies.',
    concept:
      'A modified DAG has a new set of open paths; the adjustment sets change accordingly.',
    strategy:
      'Enumerate every path between exposure and outcome in the new graph and classify each node.',
    solution:
      'With the extra node, list all paths and mark forks/pipes/colliders. The new variable may open a back door (requiring you to add it to the adjustment set) or, if it is a collider, may require you to *not* condition on it. Feed the graph to the DAG sandbox and compare its adjustment sets against your hand derivation — that is exactly what the sandbox is for.',
  },
  '6M2': {
    paraphrase: 'Simulate a legs-height style multicollinearity and inspect the posterior.',
    concept:
      'Two near-identical predictors split one effect between them; individually indeterminate, jointly fine.',
    strategy: 'Make x2 ≈ x1 + tiny noise, regress y on both, and look at the joint posterior of the two slopes.',
    skeleton: `x1 <- rnorm(200)
x2 <- rnorm(200, x1, 0.01)   # almost identical
y  <- rnorm(200, 2*x1)
# fit y ~ x1 + x2, then plot post$b1 vs post$b2`,
    solution:
      'The individual slopes are wildly uncertain and strongly negatively correlated in the posterior — the golem knows their *sum* is about 2 but cannot say how to split it. Crucially the predictions are unharmed: multicollinearity muddies interpretation of coefficients, not the fit. The fix is not "drop a variable" reflexively but understanding why the two are redundant.',
  },
  '6M3': {
    paraphrase: 'For four small DAGs, state the adjustment set for the total X → Y effect.',
    concept:
      'Close every back door (path into X), leave the causal paths and colliders alone.',
    strategy:
      'For each DAG: list paths X–Y, find the ones entering X, block them with the smallest observed set that opens no collider.',
    solution:
      'Work each graph with the back-door criterion: condition on the fork nodes on back-door paths, never on a mediator of X→Y, never on a collider (or its descendant) unless you then also block the path it opens. The DAG sandbox reports the minimal sets for exactly these shapes; derive them by hand first, then check. The recurring trap is a variable that looks like a helpful control but is actually a collider — conditioning on it creates the bias you were avoiding.',
  },
  '6H1': {
    paraphrase: 'Estimate the effect of Waffle Houses on divorce using a DAG-justified adjustment.',
    concept:
      'Draw the Southern-confound DAG, read off the adjustment set, then fit exactly that regression.',
    strategy:
      'South is the common cause; conditioning on South (or on the mediators A and M) closes the back doors. Fit D ~ W + (that set).',
    solution:
      'With S → W and S → {A, M} → D, the minimal adjustment set is {S} (or {A, M}). Fit divorce on Waffle Houses plus that set: the Waffle coefficient collapses toward zero, as it should — waffles were a bystander. The exercise is the whole chapter: the regression is trivial once the graph tells you what to put in it, and dangerous if you guess.',
  },
  '6H2': {
    paraphrase: 'Test the implied conditional independencies of your waffle DAG against the data.',
    concept:
      'A DAG makes falsifiable independence claims; check each with a regression whose expected coefficient is zero.',
    strategy:
      'List the independencies the graph implies, then fit the corresponding conditional regressions and see whether the relevant coefficient is near zero.',
    solution:
      'For each implied independency (e.g. W ⊥ D | S), fit the conditioning regression and check the coefficient is credibly near zero. Independencies that hold support the DAG; a clearly non-zero coefficient falsifies it and sends you back to redraw. This is how a DAG earns trust — not by looking reasonable but by surviving the independence tests it commits to.',
  },
  '6H3': {
    paraphrase: 'Foxes: estimate the total effect of area on weight.',
    concept:
      'In the foxes DAG (area → avgfood → groupsize and avgfood → weight), area has no back doors — its total effect needs no adjustment.',
    strategy: 'Regress weight on area alone; adding downstream variables would block the causal path.',
    solution:
      'Fit weight ~ area with nothing else. Area\'s only routes to weight run forward through food and group size, so there is no back door to close and no covariate to add — controlling for food or group size here would be post-treatment bias. The total effect of area turns out near zero, which is itself the interesting finding and sets up 6H4–6H5.',
  },
  '6H4': {
    paraphrase: 'Estimate the total effect of adding food to a territory.',
    concept: 'avgfood → weight directly and via group size; the total effect is food regressed alone.',
    strategy: 'Regress weight on avgfood only — do not condition on group size, which is a mediator.',
    solution:
      'Fit weight ~ avgfood with no other predictors. Group size sits *between* food and weight, so including it would block part of the very effect you want. The total effect of food is small — more food brings more foxes, and the extra mouths eat the gain. That cancellation is only visible if you resist the urge to "control for" the mediator.',
  },
  '6H5': {
    paraphrase: 'Estimate the direct effect of group size on weight.',
    concept:
      'To isolate the direct group-size effect you must close the food back door — condition on avgfood.',
    strategy: 'Regress weight on group size AND avgfood together.',
    solution:
      'Fit weight ~ groupsize + avgfood. Now food is held fixed, so group size shows its direct (negative) effect — more foxes sharing the same food means less each. Compare with 6H4: food\'s total effect was ~0 because its positive direct effect and negative through-group-size effect cancel. Same three variables, three different regressions, three different questions — and the DAG is what tells you which regression answers which.',
  },
}
