/**
 * Tolerances: aggregation checks exact; MAP estimates within ±0.25 of
 * the book's m11.4 posterior means (quap vs MCMC on a posterior this
 * regular agrees far tighter than that; the slack covers both).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import { chimpCells, fitChimps, summarizeChimps } from './engine'

const csv = readFileSync(
  resolve(__dirname, '../../../../public/data/datasets/chimpanzees.csv'),
  'utf-8',
)

describe('chimpCells', () => {
  const cells = chimpCells(csv)
  it('aggregates 504 pulls into 7 × 4 cells of 18 trials', () => {
    expect(cells).toHaveLength(28)
    expect(cells.every((c) => c.trials === 18)).toBe(true)
    expect(cells.reduce((s, c) => s + c.trials, 0)).toBe(504)
  })
  it('keeps actors 1–7 and treatments 1–4', () => {
    expect(new Set(cells.map((c) => c.actor)).size).toBe(7)
    expect(new Set(cells.map((c) => c.treatment)).size).toBe(4)
  })
  it('actor 2 always pulled left', () => {
    const a2 = cells.filter((c) => c.actor === 2)
    expect(a2.reduce((s, c) => s + c.pulls, 0)).toBe(72)
  })
})

describe('fitChimps — m11.4 by quap', () => {
  const fit = fitChimps(chimpCells(csv))
  const idx = (name: string) => fit.names.indexOf(name)

  it('actor 2 gets a large positive handedness intercept', () => {
    expect(fit.mode[idx('a2')]!).toBeGreaterThan(2.5)
  })
  it('treatment effects land near the book values', () => {
    // book m11.4 posterior means: b1 −0.04, b2 0.48, b3 −0.38, b4 0.37
    expect(Math.abs(fit.mode[idx('b1')]! - -0.04)).toBeLessThan(0.25)
    expect(Math.abs(fit.mode[idx('b2')]! - 0.48)).toBeLessThan(0.25)
    expect(Math.abs(fit.mode[idx('b3')]! - -0.38)).toBeLessThan(0.25)
    expect(Math.abs(fit.mode[idx('b4')]! - 0.37)).toBeLessThan(0.25)
  })
  it('the partner contrasts are small — chimps did not get nicer', () => {
    const db13 = fit.mode[idx('b1')]! - fit.mode[idx('b3')]!
    const db24 = fit.mode[idx('b2')]! - fit.mode[idx('b4')]!
    expect(Math.abs(db13)).toBeLessThan(0.6)
    expect(Math.abs(db24)).toBeLessThan(0.4)
  })

  it('summaries stay on the probability scale and bracket the data', () => {
    const draws = fit.draws(1000, new RNG(1959))
    const summary = summarizeChimps(draws)
    expect(summary.cells).toHaveLength(28)
    for (const c of summary.cells) {
      expect(c.mean).toBeGreaterThan(0)
      expect(c.mean).toBeLessThan(1)
      expect(c.lo).toBeLessThan(c.mean)
      expect(c.hi).toBeGreaterThan(c.mean)
    }
    // actor 2's fitted p stays extreme under every treatment
    for (const c of summary.cells.filter((c2) => c2.actor === 2)) {
      expect(c.mean).toBeGreaterThan(0.85)
    }
  })

  it('is deterministic', () => {
    const again = fitChimps(chimpCells(csv))
    expect(again.mode).toEqual(fit.mode)
  })
})
