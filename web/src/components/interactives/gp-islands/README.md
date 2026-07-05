# GP Islands — Gaussian process over distance (Ch. 14)

**Pedagogical goal.** Show what a Gaussian process actually estimates: not a
separate effect per unit, but one smooth function of distance that induces a
covariance between every pair at once. The Oceanic tools example (m14.8) has
ten societies at known sea distances; near societies should pool, far ones
should not.

**What it shows.**

- *The map.* The ten societies are laid out by classical MDS from the real
  `islandsDistMatrix`, so positions come from the distances themselves.
  Circle size is log population; each brass line's opacity is the
  Gaussian-process correlation between that pair.
- *The kernel.* `K(d) = η²·exp(−ρ²·d²)` drawn over distance — the single
  curve that produces the whole covariance matrix.

**Interaction.** η² (maximum covariance) and ρ² (decay rate) sliders reshape
the kernel and, live, the correlations on the map. Push ρ² up and the map
goes dark except for the closest cluster; pull it down and covariance reaches
across open ocean.

**Correctness.** `engine.test.ts` checks the kernel's peak and decay, that
the closest pair covaries more than the farthest and the far pair is
near-zero, correlation-matrix bounds and unit diagonal, the Jacobi
eigensolver against a known matrix (reconstruction `V Λ Vᵀ`), and that the
MDS embedding preserves the near/far distance ordering.

Demo: `/dev/gp`.
