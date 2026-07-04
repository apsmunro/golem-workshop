/**
 * Interaction-surface engine. Pure logic, no React, no DOM.
 *
 * OLS on the design [1, x, m, x·m]. The covariance σ̂²(XᵀX)⁻¹ yields
 * bands for the conditional mean line at a moderator value and for the
 * conditional slope ∂y/∂x = b1 + b3·m — the "bowtie" that shows an
 * interaction as a sloped line through slope-space.
 */
import { invertMatrix } from '../../../lib/quap'

export interface XYM {
  x: number
  m: number
  y: number
}

export interface InteractionFit {
  /** [intercept, x, m, x·m] */
  coefs: [number, number, number, number]
  /** 4×4 coefficient covariance */
  cov: number[][]
  /** residual sd (n − 4 denominator) */
  sigma: number
  n: number
}

function row4(x: number, m: number): [number, number, number, number] {
  return [1, x, m, x * m]
}

export function fitInteraction(rows: readonly XYM[]): InteractionFit {
  const n = rows.length
  if (n < 5) throw new RangeError(`need at least 5 rows, got ${n}`)
  const xtx: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(0))
  const xty = new Array<number>(4).fill(0)
  for (const r of rows) {
    const d = row4(r.x, r.m)
    for (let a = 0; a < 4; a++) {
      xty[a] = xty[a]! + d[a]! * r.y
      for (let b = 0; b < 4; b++) xtx[a]![b] = xtx[a]![b]! + d[a]! * d[b]!
    }
  }
  const inv = invertMatrix(xtx)
  const coefs = inv.map((rw) => rw.reduce((acc, v, j) => acc + v * xty[j]!, 0)) as [
    number,
    number,
    number,
    number,
  ]
  let sse = 0
  for (const r of rows) {
    const d = row4(r.x, r.m)
    const mu = d.reduce((acc, v, j) => acc + v * coefs[j]!, 0)
    sse += (r.y - mu) * (r.y - mu)
  }
  const s2 = sse / (n - 4)
  const cov = inv.map((rw) => rw.map((v) => v * s2))
  return { coefs, cov, sigma: Math.sqrt(s2), n }
}

function quadForm(cov: readonly (readonly number[])[], v: readonly number[]): number {
  let acc = 0
  for (let i = 0; i < v.length; i++) {
    for (let j = 0; j < v.length; j++) acc += v[i]! * cov[i]![j]! * v[j]!
  }
  return acc
}

/** Conditional slope of x at moderator value m, with its standard error. */
export function slopeAt(fit: InteractionFit, m: number): { slope: number; se: number } {
  const slope = fit.coefs[1] + fit.coefs[3] * m
  const se = Math.sqrt(quadForm(fit.cov, [0, 1, 0, m]))
  return { slope, se }
}

/** Conditional mean at (x, m) with its standard error. */
export function meanAt(
  fit: InteractionFit,
  x: number,
  m: number,
): { mu: number; se: number } {
  const d = row4(x, m)
  const mu = d.reduce((acc, v, j) => acc + v * fit.coefs[j]!, 0)
  return { mu, se: Math.sqrt(quadForm(fit.cov, d)) }
}

/** 89% interval half-width; 1.6 standard errors under normality. */
export const Z89 = 1.5982

/**
 * Parse a semicolon-separated rethinking CSV (read.csv2 dialect: `;`
 * separators, `.` decimals, quoted strings, empty cells for NA).
 * Quote-aware: "Micronesia; Federated States of" is one cell.
 */
export function parseSemicolonCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  const splitCells = (line: string): string[] => {
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes
      else if (ch === ';' && !inQuotes) {
        cells.push(cur)
        cur = ''
      } else cur += ch
    }
    cells.push(cur)
    return cells
  }
  const header = splitCells(lines[0]!)
  return lines.slice(1).map((line) => {
    const cells = splitCells(line)
    const rec: Record<string, string> = {}
    header.forEach((h, i) => {
      rec[h] = cells[i] ?? ''
    })
    return rec
  })
}

/** rugged.csv → x = ruggedness (prop. of max), m = cont_africa, y = log GDP (prop. of mean). */
export function ruggedRows(csv: string): XYM[] {
  const recs = parseSemicolonCsv(csv).filter((r) => r.rgdppc_2000 !== '')
  const logGdp = recs.map((r) => Math.log(Number(r.rgdppc_2000)))
  const meanLog = logGdp.reduce((a, b) => a + b, 0) / logGdp.length
  const maxRugged = Math.max(...recs.map((r) => Number(r.rugged)))
  return recs.map((r, i) => ({
    x: Number(r.rugged) / maxRugged,
    m: Number(r.cont_africa),
    y: logGdp[i]! / meanLog,
  }))
}

/** tulips.csv → x = water − 2, m = shade − 2, y = blooms (prop. of max). */
export function tulipsRows(csv: string): XYM[] {
  const recs = parseSemicolonCsv(csv)
  const maxBlooms = Math.max(...recs.map((r) => Number(r.blooms)))
  return recs.map((r) => ({
    x: Number(r.water) - 2,
    m: Number(r.shade) - 2,
    y: Number(r.blooms) / maxBlooms,
  }))
}
