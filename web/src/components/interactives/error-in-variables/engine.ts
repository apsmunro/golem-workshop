/**
 * error-in-variables engine — the divorce measurements of m15.1.
 *
 * Every state's divorce rate is an estimate with a standard error, and the
 * small states have huge ones. Regressing the point estimates as if they
 * were exact pretends Wyoming's rate is known as precisely as California's.
 * The measurement-error model treats each true rate D_i as a parameter,
 * with the observed value a noisy draw around it:
 *
 *   D_obs,i ~ Normal(D_i, SE_i),   D_i ~ Normal(a + b·A_i, σ).
 *
 * The regression is now a prior on the true values, so each observation
 * shrinks toward the line in proportion to how noisy it is. We fit it by
 * EM: given the line, each D_i is the precision-weighted average of its
 * measurement and the line; given the D_i, refit the line by OLS. A few
 * passes converge. Standardized to z-scores like the book, so slopes are
 * comparable. Pure logic, no React, no DOM.
 */

export interface WaffleRow {
  loc: string
  /** median age at marriage */
  ageMarriage: number
  divorce: number
  divorceSE: number
}

/** WaffleDivorce.csv: semicolon-separated, header has spaces in some names. */
export function parseWaffles(csv: string): WaffleRow[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]!.split(';').map((h) => h.trim())
  const iLoc = header.indexOf('Loc')
  const iAge = header.indexOf('MedianAgeMarriage')
  const iDiv = header.indexOf('Divorce')
  const iSE = header.indexOf('Divorce SE')
  const out: WaffleRow[] = []
  for (let r = 1; r < lines.length; r++) {
    const c = lines[r]!.split(';')
    if (c.length < header.length) continue
    out.push({
      loc: c[iLoc]!.trim(),
      ageMarriage: Number(c[iAge]),
      divorce: Number(c[iDiv]),
      divorceSE: Number(c[iSE]),
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

export interface Line {
  a: number
  b: number
  sigma: number
}

/** Ordinary least squares of y on x, with residual sd on n − 2. */
export function ols(x: readonly number[], y: readonly number[]): Line {
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
  const sigma = Math.sqrt(Math.max(sse / Math.max(n - 2, 1), 1e-6))
  return { a, b, sigma }
}

export interface StandardWaffles {
  loc: string[]
  A: number[]
  Dobs: number[]
  /** measurement SE, in the same z-units as Dobs */
  Dse: number[]
}

/** Standardize A and D to z-scores; scale each SE by sd(D). */
export function standardize(rows: readonly WaffleRow[]): StandardWaffles {
  const A0 = rows.map((r) => r.ageMarriage)
  const D0 = rows.map((r) => r.divorce)
  const mA = mean(A0)
  const sA = sd(A0)
  const mD = mean(D0)
  const sD = sd(D0)
  return {
    loc: rows.map((r) => r.loc),
    A: A0.map((a) => (a - mA) / sA),
    Dobs: D0.map((d) => (d - mD) / sD),
    Dse: rows.map((r) => r.divorceSE / sD),
  }
}

export interface ErrorFit {
  /** naive OLS line on the point estimates */
  naive: Line
  /** measurement-error-corrected line */
  corrected: Line
  /** posterior-mean true divorce values, shrunk toward the corrected line */
  Dtrue: number[]
}

/** EM fit of the Gaussian measurement-error model. */
export function fitErrorInVariables(
  data: StandardWaffles,
  iterations = 100,
): ErrorFit {
  const { A, Dobs, Dse } = data
  const n = A.length
  const naive = ols(A, Dobs)
  let line = naive
  const Dtrue = Dobs.slice()
  for (let it = 0; it < iterations; it++) {
    // E step: shrink each true value toward the line by its precision
    for (let i = 0; i < n; i++) {
      const precObs = 1 / (Dse[i]! * Dse[i]!)
      const precReg = 1 / (line.sigma * line.sigma)
      const muReg = line.a + line.b * A[i]!
      Dtrue[i] = (Dobs[i]! * precObs + muReg * precReg) / (precObs + precReg)
    }
    // M step: refit the line to the current true values
    line = ols(A, Dtrue)
  }
  return { naive, corrected: line, Dtrue }
}
