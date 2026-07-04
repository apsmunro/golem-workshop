/**
 * The Howell1 !Kung census models from chapter 4, as quap log-posteriors.
 * Priors match the book exactly:
 *   m4.1: h ~ N(mu, sigma), mu ~ N(178, 20), sigma ~ U(0, 50)
 *   m4.3: h ~ N(a + b(w − w̄), sigma), a ~ N(178, 20),
 *         b ~ LogNormal(0, 1), sigma ~ U(0, 50)
 */
import { dnormLog, quap } from '../../lib/quap'
import type { QuapFit } from '../../lib/quap'

export interface HowellRow {
  height: number
  weight: number
  age: number
  male: number
}

/** Howell1.csv is semicolon-separated with a quoted header row. */
export function parseHowellCsv(text: string): HowellRow[] {
  const lines = text.trim().split('\n')
  return lines.slice(1).map((line) => {
    const [height, weight, age, male] = line.split(';').map(Number)
    return { height: height!, weight: weight!, age: age!, male: male! }
  })
}

export function adults(rows: readonly HowellRow[]): HowellRow[] {
  return rows.filter((r) => r.age >= 18)
}

export function fitM41(heights: readonly number[]): QuapFit {
  const logPost = (theta: readonly number[]): number => {
    const mu = theta[0]!
    const sigma = theta[1]!
    if (sigma <= 0 || sigma >= 50) return -Infinity
    let lp = dnormLog(mu, 178, 20) + Math.log(1 / 50)
    for (const h of heights) lp += dnormLog(h, mu, sigma)
    return lp
  }
  return quap(logPost, [170, 10], ['mu', 'sigma'])
}

export function fitM43(rows: readonly HowellRow[]): QuapFit & { xbar: number } {
  const xbar = rows.reduce((a, r) => a + r.weight, 0) / rows.length
  const logPost = (theta: readonly number[]): number => {
    const a = theta[0]!
    const b = theta[1]!
    const sigma = theta[2]!
    if (sigma <= 0 || sigma >= 50 || b <= 0) return -Infinity
    // LogNormal(0, 1) prior density on b
    const lb = Math.log(b)
    let lp =
      dnormLog(a, 178, 20) +
      (-0.5 * lb * lb - lb - 0.9189385332046727) +
      Math.log(1 / 50)
    for (const r of rows) {
      lp += dnormLog(r.height, a + b * (r.weight - xbar), sigma)
    }
    return lp
  }
  const fit = quap(logPost, [178, 1, 10], ['a', 'b', 'sigma'])
  return { ...fit, xbar }
}

let howellCache: HowellRow[] | null = null

/** Runtime loader for the app (tests parse the CSV directly). */
export async function loadHowell(): Promise<HowellRow[]> {
  if (howellCache) return howellCache
  const res = await fetch(`${import.meta.env.BASE_URL}data/datasets/Howell1.csv`)
  howellCache = parseHowellCsv(await res.text())
  return howellCache
}
