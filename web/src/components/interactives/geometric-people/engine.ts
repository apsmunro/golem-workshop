/**
 * geometric-people engine — the cylinder model of weight, m16.1.
 *
 * A person is (roughly) a cylinder: fixed proportions, fixed density. Then
 * mass grows with volume, and volume grows with the cube of height —
 * weight ∝ height³. That single geometric fact, with no free shape per age,
 * fits the whole Howell census from infants to adults, where an additive
 * line has to bend and fails at the ends.
 *
 * We work in relative units (H/H̄, W/W̄) so the constant is near 1 at the
 * theoretical exponent 3. For any exponent b the best multiplicative
 * constant is closed-form least squares, so the learner drags b and reads
 * the fit; the geometry announces itself as a minimum of the error near 3.
 * Pure logic, no React, no DOM.
 */

export interface HW {
  height: number
  weight: number
}

/** Howell1.csv, semicolon-separated with a quoted header. All ages kept. */
export function parseHeightWeight(csv: string): HW[] {
  const lines = csv.trim().split(/\r?\n/)
  return lines.slice(1).map((line) => {
    const [height, weight] = line.split(';').map(Number)
    return { height: height!, weight: weight! }
  })
}

export interface Scale {
  hbar: number
  wbar: number
}

export function scaleOf(rows: readonly HW[]): Scale {
  const hbar = rows.reduce((s, r) => s + r.height, 0) / rows.length
  const wbar = rows.reduce((s, r) => s + r.weight, 0) / rows.length
  return { hbar, wbar }
}

/**
 * Best multiplicative constant c for W/W̄ = c·(H/H̄)^b, by least squares
 * (linear in c). Returns c and the RMSE back in raw kg.
 */
export function fitConstant(rows: readonly HW[], b: number, scale?: Scale): { c: number; rmse: number } {
  const { hbar, wbar } = scale ?? scaleOf(rows)
  let sxy = 0
  let sxx = 0
  for (const r of rows) {
    const x = Math.pow(r.height / hbar, b)
    const y = r.weight / wbar
    sxy += x * y
    sxx += x * x
  }
  const c = sxy / sxx
  let sse = 0
  for (const r of rows) {
    const pred = wbar * c * Math.pow(r.height / hbar, b)
    sse += (r.weight - pred) * (r.weight - pred)
  }
  return { c, rmse: Math.sqrt(sse / rows.length) }
}

/** Predicted weight (kg) at a height (cm) for the fitted (b, c). */
export function predictWeight(height: number, b: number, c: number, scale: Scale): number {
  return scale.wbar * c * Math.pow(height / scale.hbar, b)
}

/**
 * Scan a grid of exponents and return the one minimizing RMSE — used to
 * confirm the geometric exponent falls near 3.
 */
export function bestExponent(
  rows: readonly HW[],
  lo = 1,
  hi = 4,
  steps = 300,
): { b: number; rmse: number } {
  const scale = scaleOf(rows)
  let best = { b: lo, rmse: Infinity }
  for (let i = 0; i <= steps; i++) {
    const b = lo + ((hi - lo) * i) / steps
    const { rmse } = fitConstant(rows, b, scale)
    if (rmse < best.rmse) best = { b, rmse }
  }
  return best
}

/** RMSE of the ordinary straight line W = a + s·H, for the honest comparison. */
export function linearRmse(rows: readonly HW[]): number {
  const n = rows.length
  const mh = rows.reduce((s, r) => s + r.height, 0) / n
  const mw = rows.reduce((s, r) => s + r.weight, 0) / n
  let sxx = 0
  let sxy = 0
  for (const r of rows) {
    sxx += (r.height - mh) * (r.height - mh)
    sxy += (r.height - mh) * (r.weight - mw)
  }
  const slope = sxy / sxx
  const inter = mw - slope * mh
  let sse = 0
  for (const r of rows) {
    const e = r.weight - (inter + slope * r.height)
    sse += e * e
  }
  return Math.sqrt(sse / n)
}
