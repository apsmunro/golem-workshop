import type { ChapterHints } from './types'

/**
 * Chapter 17 bench drills. Horoscopes has no models and no book practice —
 * it is the course's reflection. These three original drills close the
 * loop: read your own calibration, name a golem's structural limit, and
 * write down the scientific model you have been avoiding.
 */
export const ch17Hints: ChapterHints = {
  '17W1': {
    workshop: true,
    paraphrase:
      'Open the capstone calibration report and find your worst chapter. Write the two-sentence explanation of why your intuition failed there specifically — not "I was overconfident", but what about that chapter\'s object made your interval too narrow.',
    concept:
      'Calibration is a skill that fails in specific, diagnosable ways, not a single global number.',
    strategy:
      'Read the per-chapter bars in the capstone. The low ones usually share a feature: a heavy tail you ignored, a bounded scale you treated as unbounded, a correlation you forgot. Name that feature.',
    solution:
      'A good answer points at the mathematics, not the mood. Low overlap on the count chapters often means you forgot the log link and sketched a symmetric interval on a skewed outcome; low overlap on the multilevel chapters often means you drew the no-pooling spread and the truth had shrunk. The value of the drill is turning "I guessed badly" into "I forget that X does Y", which is a mistake you can stop making. If your report is empty, go sketch a few posteriors first — the tool only reflects what you have fed it.',
  },
  '17W2': {
    workshop: true,
    paraphrase:
      'Choose one forged golem and write the single question it is structurally unable to answer — a question no amount of data through that model could resolve — and say which later golem you would need instead.',
    concept:
      'Every model has a horizon set by its structure, not its sample size.',
    strategy:
      'Ask what the golem holds fixed that the question needs to vary. A model with no varying effects cannot speak to between-cluster variation; a model with no DAG cannot tell a cause from a confound however tight its posterior.',
    solution:
      'The Gaussian golem can predict height from weight forever and never tell you whether feeding a child changes its adult height — that is a causal question its structure does not encode, and it needs the DAG charm. The compass ranks models for prediction and is silent on causation. The chimp explorer estimates handedness and cannot say why an actor is left-handed. Naming the horizon is the whole lesson of the chapter: the golem has no wisdom about the question you did not build into it, and knowing which golem to reach for next is the wisdom you supply.',
  },
  '17W3': {
    workshop: true,
    paraphrase:
      'Find a place in your own work where a default prior, a p-value, or an off-the-shelf regression currently stands in for a scientific model you have not written down. Sketch the mechanistic model you are avoiding, even roughly.',
    concept:
      'The final move of the course is to replace a statistical stand-in with a model of how the data were actually generated.',
    strategy:
      'Take a regression you trust out of habit and ask what process produces its outcome. Write two or three equations for that process, the way chapter 16 turned bodies into cylinders and hares into differential equations.',
    solution:
      'There is no single right answer — the drill is the point. A dose-response you fit as a line might really be a saturating curve with a mechanism; a growth you log-transform might be geometry asking for an exponent; a count you throw at a GLM might come from two processes that a mixture would separate. Writing the mechanistic model down, even badly, changes what your priors mean and what your parameters are, and it is the habit the whole workshop was building toward: a golem shaped like the science, not like the software\'s defaults.',
  },
}
