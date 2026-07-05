/**
 * Tolerances: parsing exact; contrasts within ±0.12 of the book's
 * m11.7/m11.8 posterior means (quap on aggregated binomials is very
 * regular here).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import { mean } from '../../../lib/stats'
import {
  admitRows,
  directContrast,
  fitDirect,
  fitTotal,
  totalContrast,
} from './engine'

const csv = readFileSync(
  resolve(__dirname, '../../../../public/data/datasets/UCBadmit.csv'),
  'utf-8',
)

describe('admitRows', () => {
  const rows = admitRows(csv)
  it('parses 12 rows across 6 departments despite the unnamed index column', () => {
    expect(rows).toHaveLength(12)
    expect(new Set(rows.map((r) => r.dept)).size).toBe(6)
  })
  it('recovers the famous totals', () => {
    const apps = rows.reduce((s, r) => s + r.applications, 0)
    expect(apps).toBe(4526)
    const maleAdmit = rows.filter((r) => r.male).reduce((s, r) => s + r.admit, 0)
    expect(maleAdmit).toBe(1198)
  })
  it('dept A admits most of everyone', () => {
    const a = rows.filter((r) => r.dept === 'A')
    for (const r of a) expect(r.admit / r.applications).toBeGreaterThan(0.6)
  })
})

describe('the paradox, quantified', () => {
  const rows = admitRows(csv)
  const total = fitTotal(rows)
  const direct = fitDirect(rows)

  it('the total model sees a male advantage near +0.61 log-odds', () => {
    const diff = total.mode[0]! - total.mode[1]!
    expect(Math.abs(diff - 0.61)).toBeLessThan(0.12)
  })

  it('conditioning on department shrinks the contrast to about −0.1', () => {
    const diff = direct.mode[0]! - direct.mode[1]!
    expect(diff).toBeLessThan(0.05)
    expect(diff).toBeGreaterThan(-0.3)
  })

  it('contrast draws land on both scales with the right signs', () => {
    const tDraws = totalContrast(total.draws(1500, new RNG(1959)))
    const dDraws = directContrast(direct.draws(1500, new RNG(1959)), rows)
    expect(mean(tDraws.logOdds)).toBeGreaterThan(0.4)
    // book: about 14 percentage points of apparent male advantage
    expect(Math.abs(mean(tDraws.prob) - 0.14)).toBeLessThan(0.04)
    expect(mean(dDraws.logOdds)).toBeLessThan(0.05)
    expect(Math.abs(mean(dDraws.prob))).toBeLessThan(0.05)
  })
})
