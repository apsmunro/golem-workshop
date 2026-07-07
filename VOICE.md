# VOICE.md — the house voice, by example

`prose-lint` catches the words a bad sentence *uses*. It cannot catch the
sentence that is bland, hedged, or structurally limp while using only
approved words. This file is the other half of the gate: a calibrated set of
before/after pairs so a future session (or model) can match the register by
imitation, the way you'd learn a house style by reading its back catalogue.

Read this before writing or editing any learner-facing prose — chapter MDX,
hints, solutions, UI copy. It is the companion to CLAUDE.md §4 (the rules) and
`scripts/banned-words.txt` (the automated floor). Where §4 says *avoid X*, this
file shows *what to write instead*, in this course's actual voice.

---

## The register in one breath

A master craftsman explaining at the bench — plainspoken, a little mischievous,
hostile to ritual. Second person. Concrete nouns, active verbs, specific
numbers, opinions held plainly. McElreath's tone is the north star (wry,
anti-ceremony), but we earn it with our own material and never imitate his
sentences. When a sentence could appear unchanged in any other stats course,
it has failed, and you sharpen it until it could only belong to this one.

Two tests before a paragraph ships:

1. **The transplant test.** Could this exact sentence sit in a generic
   Coursera stats MOOC? If yes, it is not ours yet. Our sentences carry a
   golem, a globe, a specific number, or a named opinion.
2. **The reread test.** Read it aloud. If you stumble, or if it takes two
   passes to parse, brevity bought nothing. Readable beats short.

---

## Calibrated pairs

Each pair is a real move from the course. The ✗ is a plausible generic draft;
the ✓ is what the course actually does (or should). Study the *why*, not just
the swap.

### 1 — Start inside the idea, not on its doorstep

> ✗ In this section, we will explore the concept of statistical models and
> why they can be dangerous when misapplied.

> ✓ Every statistical model is a golem: tireless, literal, incapable of
> noticing that the question you asked is a silly one.

The throat-clearing opener ("In this section, we will explore…") tells the
reader a topic is coming. The good version *is* the topic, already moving,
already committed to a claim. Never announce; begin.

### 2 — Concrete image over abstract noun

> ✗ The Gaussian distribution emerges as a consequence of summing many
> independent random variables, making it a natural choice for many outcomes.

> ✓ Add up many small independent nudges — genes, meals, illnesses, a
> thousand of them — and the sum forgets where each nudge came from.

"Independent random variables" is correct and dead. "Genes, meals, illnesses"
is the same fact with a pulse. Reach for the physical noun (nudge, marble,
leash, bowl) before the mathematical one; introduce the mathematical term
*after* the intuition has a handhold.

### 3 — Hold an opinion plainly

> ✗ Some practitioners argue that the 95% threshold may not always be the most
> appropriate choice in every context.

> ✓ 89% is as defensible as 95% — the only virtue 95% has is seniority, and
> seniority is how the flowchart happened.

The hedge-stack ("some practitioners argue… may not always… in every context")
launders a real opinion into mush. We have views and we state them, then defend
them in the next clause. Hedge once, precisely, only where the statistics
genuinely warrant it.

### 4 — Danger stated flatly beats danger dramatized

> ✗ It is crucial to understand that overfitting poses a significant risk that
> can severely undermine the robustness of your predictive models.

> ✓ The overfit golem arrives waving its excellent in-sample scores.

Banned words aside ("crucial", "significant", "robustness"), the ✗ version
*asserts* danger with intensifiers. The ✓ version *shows* it with a character
who lies to your face. Dramatize the mechanism, not the adjective.

### 5 — Let a short sentence land alone

> ✗ This rule, known as the Metropolis algorithm, does work in practice,
> although it tends to be quite slow in higher-dimensional settings.

> ✓ That rule — propose, compare, sometimes move — is the Metropolis
> algorithm, and it works. Slowly.

"Slowly." on its own is the whole point, given a full stop of its own to make
the reader feel the drag. Vary sentence length deliberately; a one-word
sentence after a long one is a tool, not an error.

### 6 — Name the reader's likely error, don't flatter them

> ✗ Whether you're new to Bayesian statistics or a seasoned practitioner,
> calibration is a skill worth developing.

> ✓ Most people draw their first posterior far too narrow — sure of an answer
> nine tosses cannot possibly justify. If that was you, you are in the
> majority.

Audience-flattering setups ("whether you're new or seasoned") say nothing. The
good version predicts the specific mistake the reader probably just made and
meets them in it. Diagnosis is intimacy; flattery is filler.

### 7 — End on a concrete point, not a wrap-up

> ✗ In conclusion, multiple regression is a powerful tool, but it must be used
> carefully with attention to causal structure.

> ✓ The Multivariable Golem is earned by getting the graph right, not the code.

Summary paragraphs restate what the reader just read. End instead on the
sharpest concrete claim in the section — the one sentence they'd quote.

### 8 — Prose over bold-led bullets for explanation

> ✗ **Prior:** what you believed before. **Likelihood:** how the data score
> each value. **Posterior:** your updated belief.

> ✓ The prior is what you believed about $p$ before tossing. The likelihood is
> the model's engine: it scores each candidate $p$ by how well it explains
> W L W W W L W L W. The posterior is the updated belief, and it is always a
> compromise between the other two, weighted by how much data you have.

Bold-led lists are the default explanatory mode of AI prose and we avoid them.
Prose can carry the same three items *and* the relationship between them (that
last clause — "a compromise… weighted by how much data") which the bullet
version has no room for. Use lists only for genuinely enumerable things.

### 9 — Vary how a concept enters

> ✗ Regularization is a technique that penalizes large coefficients to reduce
> overfitting.

> ✓ A prior that gently disbelieves large coefficients makes a golem harder to
> impress with noise.

Every-concept-as-"X is a technique that…" is a structural tell. Enter through
a failure, an example, an image, or a question the model can't yet answer.
Here: enter through what the prior *does* to the golem's temperament.

### 10 — Earn the wry aside; don't manufacture whimsy

> ✗ Buckle up, because we're about to take a wild ride through the wonderful
> world of information theory! 🎢

> ✓ Deviance is that score times −2, an accounting convention from older wars.

The mischief in this course is dry, not zany — it comes from an unexpected
true observation ("older wars"), never from exclamation marks or
manufactured excitement. No emoji. Exclamation marks almost nowhere (the one
sanctioned exception is the forging-ceremony toast).

---

## Human-review checklist (what the regex can't catch)

Run your eye over these before committing prose. None can be safely automated,
because each has legitimate and illegitimate forms a word-boundary match can't
distinguish.

- **`beautiful` / `stunning` in our own copy.** Fine describing the *world* or
  the *math* ("predicted eclipses beautifully", "trajectories hug the bowl").
  Banned describing *our own* visuals or product. Ask: whose beauty?
- **`rich` figurative.** Fine literal ("a tool-rich island", "unusually rich"
  of GDP). Banned as vague praise ("a rich set of features").
- **Em-dash density.** At most one em-dash per paragraph (a single paired aside
  counts as one move). Two separate dashes in a paragraph → recast one into a
  colon, comma, or parenthesis. This is the single most common drift in our own
  drafts; grep for it: paragraphs with ≥3 `—` almost always need a pass.
- **Uniform rhythm.** If five sentences in a row are the same length, the
  paragraph is humming on one note. Break one short.
- **The reflexive rule of three.** "fast, flexible, and fun" — only list three
  when there are genuinely three things, not for cadence.
- **Parenthetical hedges.** "(in most cases)", "(generally speaking)" sprinkled
  in are confidence leaks. Cut, or commit to the precise exception.

## Maintaining this file

When you catch a new tell in review — a sentence that was technically clean but
unmistakably generic — add the pair here with the fix, the way you'd add a
regex to `banned-words.txt`. The pairs are the institutional memory of the
voice; a future session reads them to calibrate before writing a word.
