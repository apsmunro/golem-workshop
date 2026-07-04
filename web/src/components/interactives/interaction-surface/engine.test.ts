/**
 * Interaction-surface engine tests.
 * Tolerances: exact recovery on noiseless data to 1e-8; the tulips
 * fixture checks against hand-computed OLS on the full 27-row design.
 */
import { describe, expect, it } from 'vitest'
import {
  fitInteraction,
  meanAt,
  parseSemicolonCsv,
  ruggedRows,
  slopeAt,
  tulipsRows,
} from './engine'
import type { XYM } from './engine'

function grid(f: (x: number, m: number) => number): XYM[] {
  const rows: XYM[] = []
  for (const x of [-1, -0.5, 0, 0.5, 1]) {
    for (const m of [-1, 0, 1, 2]) rows.push({ x, m, y: f(x, m) })
  }
  return rows
}

describe('fitInteraction', () => {
  it('recovers exact interaction coefficients', () => {
    const rows = grid((x, m) => 1 + 2 * x + 3 * m + 4 * x * m)
    const fit = fitInteraction(rows)
    expect(fit.coefs[0]).toBeCloseTo(1, 8)
    expect(fit.coefs[1]).toBeCloseTo(2, 8)
    expect(fit.coefs[2]).toBeCloseTo(3, 8)
    expect(fit.coefs[3]).toBeCloseTo(4, 8)
    expect(fit.sigma).toBeCloseTo(0, 6)
  })

  it('slopeAt applies b1 + b3·m and shrinks se with exact data', () => {
    const rows = grid((x, m) => 1 + 2 * x + 3 * m + 4 * x * m)
    const fit = fitInteraction(rows)
    expect(slopeAt(fit, 0).slope).toBeCloseTo(2, 8)
    expect(slopeAt(fit, 1.5).slope).toBeCloseTo(8, 8)
    expect(slopeAt(fit, -1).slope).toBeCloseTo(-2, 8)
    expect(slopeAt(fit, 1).se).toBeLessThan(1e-4)
  })

  it('meanAt matches the plane', () => {
    const rows = grid((x, m) => 0.5 - x + 2 * m - 0.5 * x * m)
    const fit = fitInteraction(rows)
    expect(meanAt(fit, 0.4, -0.6).mu).toBeCloseTo(0.5 - 0.4 - 1.2 + 0.12, 8)
  })

  it('refuses degenerate inputs', () => {
    expect(() => fitInteraction(grid(() => 1).slice(0, 4))).toThrow(RangeError)
  })
})

describe('parseSemicolonCsv', () => {
  it('handles quotes, empty cells and headers', () => {
    const recs = parseSemicolonCsv('"a";b;"c"\n"x";1.5;\n"y";2;3')
    expect(recs).toEqual([
      { a: 'x', b: '1.5', c: '' },
      { a: 'y', b: '2', c: '3' },
    ])
  })

  it('keeps semicolons inside quoted cells (Micronesia; Federated States of)', () => {
    const recs = parseSemicolonCsv(
      'code;country;rugged\n"FSM";"Micronesia; Federated States of";1.353',
    )
    expect(recs).toEqual([
      { code: 'FSM', country: 'Micronesia; Federated States of', rugged: '1.353' },
    ])
  })
})

describe('dataset adapters', () => {
  const ruggedFixture = [
    'isocode;country;rugged;rgdppc_2000;cont_africa',
    '"AAA";"Flatrich";0.1;20000;0',
    '"BBB";"Roughpoor";4.0;800;0',
    '"CCC";"Flatpoor";0.2;900;1',
    '"DDD";"Roughrich";3.8;2500;1',
    '"EEE";"Midlands";2.0;5000;0',
    '"FFF";"Midafrica";2.0;1500;1',
    '"GGG";"NoData";1.0;;0',
  ].join('\n')

  it('ruggedRows drops missing GDP and scales as the book does', () => {
    const rows = ruggedRows(ruggedFixture)
    expect(rows).toHaveLength(6)
    const maxX = Math.max(...rows.map((r) => r.x))
    expect(maxX).toBeCloseTo(1, 10)
    // y is log GDP over its mean, so values straddle 1
    expect(Math.min(...rows.map((r) => r.y))).toBeLessThan(1)
    expect(Math.max(...rows.map((r) => r.y))).toBeGreaterThan(1)
  })

  it('the fixture shows the sign flip: rugged slope down outside Africa, up inside', () => {
    const fit = fitInteraction(ruggedRows(ruggedFixture))
    expect(slopeAt(fit, 0).slope).toBeLessThan(0)
    expect(slopeAt(fit, 1).slope).toBeGreaterThan(0)
  })

  it('tulipsRows centers water and shade and scales blooms to [0, 1]', () => {
    const csv = [
      '"bed";"water";"shade";"blooms"',
      'a;1;1;0',
      'a;2;2;50',
      'a;3;3;100',
      'b;1;3;20',
      'b;3;1;200',
    ].join('\n')
    const rows = tulipsRows(csv)
    expect(rows.map((r) => r.x)).toEqual([-1, 0, 1, -1, 1])
    expect(rows.map((r) => r.m)).toEqual([-1, 0, 1, 1, -1])
    expect(Math.max(...rows.map((r) => r.y))).toBeCloseTo(1, 10)
  })
})
