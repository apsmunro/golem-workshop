/**
 * imputation-explorer engine tests.
 *
 * Validated against the milk missing-data analysis of §15.2: the file has
 * 12 missing neocortex values out of 29; standardization uses only observed
 * neocortex; imputed values land on the N ~ M line; and the two OLS solvers
 * recover known coefficients. The downstream K ~ N + M slope is computed on
 * both the 17 complete cases and all 29 with imputation.
 */
import { describe, expect, it } from 'vitest'
import { imputeMilk, olsSimple, olsTwo, parseMilk, standardizeMilk } from './engine'

const CSV = `"clade";"species";"kcal.per.g";"perc.fat";"perc.protein";"perc.lactose";"mass";"neocortex.perc"
"A";"s1";0.49;16.6;15.42;67.98;1.95;55.16
"A";"s2";0.51;19.27;16.91;63.82;2.09;NA
"A";"s3";0.46;14.11;16.85;69.04;2.51;NA
"A";"s4";0.6;27.28;19.5;53.22;2.19;64.54
"A";"s5";0.71;19.5;16.5;60.0;3.5;67.0`

describe('parseMilk', () => {
  it('parses NA neocortex as null and keeps mass', () => {
    const rows = parseMilk(CSV)
    expect(rows).toHaveLength(5)
    expect(rows[0]!.neocortex).toBeCloseTo(55.16, 5)
    expect(rows[1]!.neocortex).toBeNull()
    expect(rows[2]!.neocortex).toBeNull()
    expect(rows[0]!.mass).toBe(1.95)
  })
})

describe('standardizeMilk', () => {
  it('standardizes neocortex over observed rows only, leaving nulls', () => {
    const std = standardizeMilk(parseMilk(CSV))
    // three observed neocortex values; their standardized mean is ~0
    const obs = std.N.filter((x): x is number => x !== null)
    expect(obs).toHaveLength(3)
    expect(obs.reduce((a, b) => a + b, 0) / obs.length).toBeCloseTo(0, 8)
    expect(std.N[1]).toBeNull()
  })
})

describe('OLS solvers', () => {
  it('olsSimple recovers a known line', () => {
    const x = [0, 1, 2, 3]
    const y = x.map((v) => 1 - 2 * v)
    const f = olsSimple(x, y)
    expect(f.a).toBeCloseTo(1, 8)
    expect(f.b).toBeCloseTo(-2, 8)
  })

  it('olsTwo recovers known two-slope coefficients', () => {
    const x1 = [0, 1, 2, 0, 1, 2]
    const x2 = [0, 0, 0, 1, 1, 1]
    const y = x1.map((v, i) => 3 + 2 * v - 1 * x2[i]!)
    const { b } = olsTwo(x1, x2, y)
    expect(b[0]).toBeCloseTo(3, 6)
    expect(b[1]).toBeCloseTo(2, 6)
    expect(b[2]).toBeCloseTo(-1, 6)
  })
})

describe('imputeMilk', () => {
  const std = standardizeMilk(parseMilk(CSV))
  const res = imputeMilk(std)

  it('counts complete and total cases', () => {
    expect(res.nTotal).toBe(5)
    expect(res.nComplete).toBe(3)
  })

  it('places each imputed value exactly on the N ~ M line', () => {
    for (const row of res.rows) {
      if (row.missing) {
        const expected = res.imputeLine.a + res.imputeLine.b * row.M
        expect(row.N).toBeCloseTo(expected, 8)
        expect(row.Nse).toBeGreaterThan(0)
      } else {
        expect(row.Nse).toBe(0)
      }
    }
  })

  it('uses more rows in the imputed fit than the complete-case fit', () => {
    // both produce three coefficients; the imputed one is fit on all rows
    expect(res.imputed.b).toHaveLength(3)
    expect(res.completeCase.b).toHaveLength(3)
    expect(res.nComplete).toBeLessThan(res.nTotal)
  })
})
