# Lynx–Hare ODE (Ch. 16)

**Pedagogical goal.** Show a model that has to be *solved* to make a
prediction. The Lotka–Volterra predator–prey equations (m16.5) have no closed
form, so the golem integrates them forward — here with RK4 in JavaScript — and
the four rate parameters shape a closed orbit rather than fixing the
populations directly.

**What it shows.**

- *Time series* — hare (brass) and lynx (verdigris) populations over twenty
  years, with the Hudson's Bay pelt record (MacLulich 1937) overlaid as
  points for scale and rhythm.
- *Phase portrait* — lynx against hare, the signature closed loop. A faint
  ensemble of orbits shows the spread from jittered parameters; the brass dot
  marks the interior equilibrium `(m_L/b_L, b_H/m_H)`.

**Interaction.** Sliders for the four rates (hare birth, predation, lynx
birth, lynx death) reshape the loop live: predation tightens the cycle, a
lower lynx death rate lets predators overrun the peak.

**Correctness.** `engine.test.ts` checks the equilibrium formula and that it
is a genuine fixed point, that an off-equilibrium orbit is periodic (returns
near its start after a real period), that RK4 nearly conserves the
Lotka–Volterra invariant, that populations stay non-negative, and that the
ensemble is deterministic under a fixed seed.

Demo: `/dev/lynxhare`.
