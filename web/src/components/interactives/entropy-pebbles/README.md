# Entropy Pebbles

## Pedagogical goal

Chapter 10's opening argument, made physical: distributions that can
happen more ways are more plausible, and "more ways" is entropy. The
learner throws ten pebbles into five buckets and watches two numbers —
the exact count of ways W and the entropy of the shape — agree about
which arrangements are ordinary and which are miracles. The second act
adds a constraint: lock the expected bucket value and the flattest
shape consistent with the lock appears in verdigris, because that is
what a maximum-entropy prior is.

## Interaction spec

1. Five buckets, a pouch of ten pebbles. Click a bucket (or its +) to
   drop a pebble, − to take one back. Pebbles render as bone circles
   stacking in the bucket.
2. Live readouts: ways W (exact), log W / N, entropy H of the current
   shape. The book's five presets (A–E) load with one click.
3. Constraint mode: a target-mean slider. The maximum-entropy solution
   under that mean draws behind the learner's bars in verdigris; the
   learner tries to match it with pebbles and sees the entropy gap.
4. Every arrangement of all ten pebbles is scored against the best
   possible for its own mean — "your shape does it in W ways; the
   champion of mean 2.8 would take ~W* ways" framing.

## Engine

Pure functions, no RNG. Exact log-multiplicity via summed-log
factorials; Shannon entropy; constrained maxent by exponential tilting
with bisection on λ. Tests pin the book's multiplicity table
(1 / 90 / 1,260 / 37,800 / 113,400), uniform and degenerate limits,
target-mean recovery to 1e-6, and log W / N → H.
