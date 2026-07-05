/**
 * imputation-explorer engine — the milk model of m15.5 with missing data.
 *
 * Neocortex percentage is missing for 12 of 29 primate species. Dropping
 * them (complete-case analysis) throws away the 12 species' kcal and body
 * mass too — data the model could use. Bayesian imputation instead treats
 * each missing neocortex value as a parameter, informed by the fact that
 * neocortex and body mass are correlated: knowing a species is large tells
 * you something about its neocortex even when the measurement is absent.
 *
 * We compute the honest OLS version of the imputation: fit N ~ M on the
 * complete cases, predict the missing neocortex values on that line with
 * the regression's residual spread as their uncertainty, then compare the
 * downstream K ~ N + M slope with and without them. Pure logic, no React.
 */

export interface MilkRow {
  species: string
  kcal: number
  mass: number
  /** neocortex percentage, or null when missing (NA in the file). */
  neocortex: number | null
}

/** milk.csv: quoted header, semicolon-separated, "NA" for missing neocortex. */
export function parseMilk(csv: string): MilkRow[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]!.split(';').map((h) => h.replace(/"/g, '').trim())
  const iSpecies = header.indexOf('species')
  const iKcal = header.indexOf('kcal.per.g')
  const iMass = header.indexOf('mass')
  const iNeo = header.indexOf('neocortex.perc')
  const out: MilkRow[] = []
  for (let r = 1; r < lines.length; r++) {
    const c = lines[r]!.split(';').map((x) => x.replace(/"/g, '').trim())
    if (c.length < header.length) continue
    const neoRaw = c[iNeo]!
    out.push({
      species: c[iSpecies]!,
      kcal: Number(c[iKcal]),
      mass: Number(c[iMass]),
      neocortex: neoRaw === 'NA' || neoRaw === '' ? null : Number(neoRaw),
    })
  }
  return out
}

function mean(xs: readonly number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length
}
function sd(xs: readonly number[]): number {
  const m = mean(xs)
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (xs.length - 1))
}

export interface StandardMilk {
  species: string[]
  /** standardized log mass, all species */
  M: number[]
  /** standardized kcal, all species */
  K: number[]
  /** standardized neocortex, or null when missing */
  N: (number | null)[]
}

/** Standardize kcal, log-mass over all rows; neocortex over observed rows. */
export function standardizeMilk(rows: readonly MilkRow[]): StandardMilk {
  const kcal = rows.map((r) => r.kcal)
  const logM = rows.map((r) => Math.log(r.mass))
  const observedNeo = rows.filter((r) => r.neocortex !== null).map((r) => r.neocortex!)
  const mK = mean(kcal)
  const sK = sd(kcal)
  const mM = mean(logM)
  const sM = sd(logM)
  const mN = mean(observedNeo)
  const sN = sd(observedNeo)
  return {
    species: rows.map((r) => r.species),
    M: logM.map((m) => (m - mM) / sM),
    K: kcal.map((k) => (k - mK) / sK),
    N: rows.map((r) => (r.neocortex === null ? null : (r.neocortex - mN) / sN)),
  }
}

interface Coefs2 {
  /** [intercept, slope1, slope2] for y ~ 1 + x1 + x2 */
  b: [number, number, number]
}

/** Simple OLS for y ~ x (2-column design). Returns intercept + slope + resid sd. */
export function olsSimple(
  x: readonly number[],
  y: readonly number[],
): { a: number; b: number; sigma: number } {
  const n = x.length
  const mx = mean(x)
  const my = mean(y)
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    sxx += (x[i]! - mx) * (x[i]! - mx)
    sxy += (x[i]! - mx) * (y[i]! - my)
  }
  const b = sxy / sxx
  const a = my - b * mx
  let sse = 0
  for (let i = 0; i < n; i++) {
    const e = y[i]! - (a + b * x[i]!)
    sse += e * e
  }
  return { a, b, sigma: Math.sqrt(Math.max(sse / Math.max(n - 2, 1), 1e-6)) }
}

/** OLS for y ~ 1 + x1 + x2 via normal equations (3×3 solve). */
export function olsTwo(
  x1: readonly number[],
  x2: readonly number[],
  y: readonly number[],
): Coefs2 {
  const n = y.length
  // build XtX (3×3) and Xty (3)
  const design = (i: number): [number, number, number] => [1, x1[i]!, x2[i]!]
  const A: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const g = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    const d = design(i)
    for (let a = 0; a < 3; a++) {
      g[a]! += d[a]! * y[i]!
      for (let b = 0; b < 3; b++) A[a]![b]! += d[a]! * d[b]!
    }
  }
  const b = solve3(A, g)
  return { b: [b[0]!, b[1]!, b[2]!] }
}

/** Gaussian elimination for a 3×3 system A x = g. */
function solve3(A: number[][], g: number[]): number[] {
  const m = A.map((row, i) => [...row, g[i]!])
  for (let col = 0; col < 3; col++) {
    // partial pivot
    let piv = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(m[r]![col]!) > Math.abs(m[piv]![col]!)) piv = r
    ;[m[col], m[piv]] = [m[piv]!, m[col]!]
    const d = m[col]![col]!
    for (let c = col; c < 4; c++) m[col]![c]! /= d
    for (let r = 0; r < 3; r++) {
      if (r === col) continue
      const f = m[r]![col]!
      for (let c = col; c < 4; c++) m[r]![c]! -= f * m[col]![c]!
    }
  }
  return [m[0]![3]!, m[1]![3]!, m[2]![3]!]
}

export interface ImputedSpecies {
  species: string
  M: number
  K: number
  /** observed N, or the imputed point estimate when missing */
  N: number
  missing: boolean
  /** imputation uncertainty (residual sd of N ~ M), 0 for observed rows */
  Nse: number
}

export interface ImputationResult {
  rows: ImputedSpecies[]
  /** N ~ M line used to impute */
  imputeLine: { a: number; b: number; sigma: number }
  /** K ~ N + M coefficients on the 17 complete cases */
  completeCase: Coefs2
  /** K ~ N + M coefficients using all 29, missing N imputed */
  imputed: Coefs2
  nComplete: number
  nTotal: number
}

/** Fit the imputation and the two downstream K ~ N + M models. */
export function imputeMilk(std: StandardMilk): ImputationResult {
  const n = std.species.length
  const compIdx: number[] = []
  for (let i = 0; i < n; i++) if (std.N[i] !== null) compIdx.push(i)

  // impute N from M using the complete cases
  const Mc = compIdx.map((i) => std.M[i]!)
  const Nc = compIdx.map((i) => std.N[i]!)
  const imputeLine = olsSimple(Mc, Nc)

  const rows: ImputedSpecies[] = std.species.map((species, i) => {
    const observed = std.N[i] !== null
    const N = observed ? std.N[i]! : imputeLine.a + imputeLine.b * std.M[i]!
    return {
      species,
      M: std.M[i]!,
      K: std.K[i]!,
      N,
      missing: !observed,
      Nse: observed ? 0 : imputeLine.sigma,
    }
  })

  // downstream K ~ N + M, complete-case vs imputed-augmented
  const Kc = compIdx.map((i) => std.K[i]!)
  const completeCase = olsTwo(Nc, Mc, Kc)
  const imputed = olsTwo(
    rows.map((r) => r.N),
    rows.map((r) => r.M),
    rows.map((r) => r.K),
  )

  return {
    rows,
    imputeLine,
    completeCase,
    imputed,
    nComplete: compIdx.length,
    nTotal: n,
  }
}
