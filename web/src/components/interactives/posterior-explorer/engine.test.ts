/**
 * Explorer engine on real m4.3 quap draws. Tolerances: at x̄ the mean
 * line equals mean(a) ± 0.05; bands nest strictly; prediction at 50 kg
 * centers near 159 cm ± 1 (published m4.3 relationship).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RNG } from '../../../lib/rng'
import { mean } from '../../../lib/stats'
import { adults, fitM43, parseHowellCsv } from '../../../content/models/howell'
import { marginals, predictAt, regressionBands, thin } from './engine'

const rows = adults(
  parseHowellCsv(
    readFileSync(resolve(__dirname, '../../../../public/data/datasets/Howell1.csv'), 'utf8'),
  ),
)
const fit = fitM43(rows)
const draws = fit.draws(4000, new RNG(1959)) as {
  a: Float64Array
  b: Float64Array
  sigma: Float64Array
}

describe('marginals', () => {
  it('summarizes each parameter with density and interval', () => {
    const ms = marginals(draws)
    const a = ms.find((m) => m.name === 'a')!
    expect(a.mean).toBeCloseTo(154.6, 0)
    expect(a.interval[0]).toBeLessThan(a.mean)
    expect(a.interval[1]).toBeGreaterThan(a.mean)
    expect(a.density.y.every((v) => v >= 0)).toBe(true)
  })
})

describe('thin', () => {
  it('keeps order and caps length', () => {
    const col = new Float64Array(Array.from({ length: 1000 }, (_, i) => i))
    const t = thin(col, 100)
    expect(t.length).toBe(100)
    expect(t[0]).toBe(0)
    expect(t[99]).toBeGreaterThan(t[98]!)
  })
})

describe('regressionBands', () => {
  const bands = regressionBands(draws, fit.xbar, [32, 62], new RNG(7))

  it('mean line passes through mean(a) at xbar', () => {
    const idx = bands.xs.reduce(
      (best, x, i) => (Math.abs(x - fit.xbar) < Math.abs(bands.xs[best]! - fit.xbar) ? i : best),
      0,
    )
    expect(bands.mean[idx]!).toBeCloseTo(mean([...draws.a]), 0)
  })

  it('predictive band strictly contains the mu band', () => {
    for (let i = 0; i < bands.xs.length; i++) {
      expect(bands.predLo[i]!).toBeLessThan(bands.muLo[i]!)
      expect(bands.predHi[i]!).toBeGreaterThan(bands.muHi[i]!)
    }
  })

  it('slope of the mean line matches b', () => {
    const rise = bands.mean[bands.mean.length - 1]! - bands.mean[0]!
    const run = bands.xs[bands.xs.length - 1]! - bands.xs[0]!
    expect(rise / run).toBeCloseTo(mean([...draws.b]), 1)
  })
})

describe('predictAt', () => {
  it('a 50 kg counterfactual centers near 159 cm', () => {
    const preds = predictAt(draws, fit.xbar, 50, new RNG(3))
    expect(mean(preds)).toBeCloseTo(159, 0)
  })
})
