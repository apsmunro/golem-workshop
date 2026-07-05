/**
 * shrinkage-theater engine — the reedfrog tanks of m13.1 / m13.2.
 *
 * Forty-eight tanks, each with a starting count of tadpoles and a number
 * of survivors. Three ways to estimate each tank's survival probability:
 *
 *   no pooling      — every tank alone: p̂ = surv / density (the MLE).
 *   complete pooling — one probability for all tanks: total surv / total n.
 *   partial pooling  — α_tank ~ Normal(ᾱ, σ); each tank borrows strength
 *                       from the others in proportion to how little it knows.
 *
 * The partial-pooling estimate is computed exactly for a given σ by 1-D
 * quadrature of the tank's posterior over the logit-scale intercept:
 *   p(α | data) ∝ Binomial(surv | n, logistic(α)) · Normal(α | ᾱ, σ),
 * so 100%-survival tanks stay finite (the MLE would be +∞) and small
 * tanks shrink hard toward ᾱ — which is the whole lesson. ᾱ is fixed at
 * the complete-pooling logit; σ is the slider the learner drags to feel
 * the under/overfit trade-off. Pure logic, no React, no DOM.
 */

export interface Tank {
  /** 1-based tank id, in dataset order. */
  id: number
  /** starting tadpoles. */
  density: number
  /** survivors. */
  surv: number
  /** predation treatment, kept for optional coloring. */
  pred: 'no' | 'pred'
  /** tadpole size. */
  size: 'big' | 'small'
}

/** Parse the semicolon-delimited reedfrogs.csv into tanks. */
export function parseReedfrogs(csv: string): Tank[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]!.split(';').map((h) => h.replace(/"/g, '').trim())
  const iDensity = header.indexOf('density')
  const iPred = header.indexOf('pred')
  const iSize = header.indexOf('size')
  const iSurv = header.indexOf('surv')
  const out: Tank[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = lines[r]!.split(';').map((c) => c.replace(/"/g, '').trim())
    if (cells.length < header.length) continue
    out.push({
      id: r,
      density: Number(cells[iDensity]),
      surv: Number(cells[iSurv]),
      pred: cells[iPred] === 'pred' ? 'pred' : 'no',
      size: cells[iSize] === 'small' ? 'small' : 'big',
    })
  }
  return out
}

export function logit(p: number): number {
  return Math.log(p / (1 - p))
}

export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** surv / density; the estimate that fits each tank in isolation. */
export function noPooling(tanks: readonly Tank[]): number[] {
  return tanks.map((t) => t.surv / t.density)
}

/** One probability for the whole pond: Σ surv / Σ density. */
export function completePooling(tanks: readonly Tank[]): number {
  let s = 0
  let n = 0
  for (const t of tanks) {
    s += t.surv
    n += t.density
  }
  return s / n
}

/** The grand-mean intercept ᾱ on the logit scale. */
export function grandMeanLogit(tanks: readonly Tank[]): number {
  return logit(completePooling(tanks))
}

/** log Binomial(surv | n, logistic(alpha)), constant terms dropped. */
function binomLogLik(surv: number, n: number, alpha: number): number {
  const p = logistic(alpha)
  // guard the log at the boundaries
  const lp = p < 1e-12 ? -1e12 : Math.log(p)
  const lq = 1 - p < 1e-12 ? -1e12 : Math.log(1 - p)
  return surv * lp + (n - surv) * lq
}

/**
 * Posterior mean survival probability for one tank under
 * α ~ Normal(mu, sigma), by quadrature over a fixed logit-scale grid.
 */
export function partialPoolTank(
  surv: number,
  n: number,
  mu: number,
  sigma: number,
  grid = 401,
): number {
  const lo = -8
  const hi = 8
  const step = (hi - lo) / (grid - 1)
  // first pass: find the max log-weight for numerical stability
  let maxLog = -Infinity
  const logw = new Float64Array(grid)
  for (let i = 0; i < grid; i++) {
    const a = lo + i * step
    const z = (a - mu) / sigma
    const lw = binomLogLik(surv, n, a) - 0.5 * z * z
    logw[i] = lw
    if (lw > maxLog) maxLog = lw
  }
  let wsum = 0
  let wpsum = 0
  for (let i = 0; i < grid; i++) {
    const a = lo + i * step
    const w = Math.exp(logw[i]! - maxLog)
    wsum += w
    wpsum += w * logistic(a)
  }
  return wpsum / wsum
}

/** Partial-pooling posterior-mean proportion for every tank at a given σ. */
export function partialPooling(tanks: readonly Tank[], sigma: number): number[] {
  const mu = grandMeanLogit(tanks)
  return tanks.map((t) => partialPoolTank(t.surv, t.density, mu, sigma))
}

export interface ShrinkageRow {
  tank: Tank
  raw: number
  partial: number
  /** how far the estimate moved toward the grand mean, as a fraction. */
  shrinkage: number
}

/** Everything the view needs for one σ setting. */
export function shrinkageTable(tanks: readonly Tank[], sigma: number): {
  rows: ShrinkageRow[]
  grandMean: number
} {
  const grandMean = completePooling(tanks)
  const partial = partialPooling(tanks, sigma)
  const rows = tanks.map((t, i): ShrinkageRow => {
    const raw = t.surv / t.density
    const p = partial[i]!
    const gap = raw - grandMean
    const shrinkage = Math.abs(gap) < 1e-9 ? 0 : (raw - p) / gap
    return { tank: t, raw, partial: p, shrinkage }
  })
  return { rows, grandMean }
}
