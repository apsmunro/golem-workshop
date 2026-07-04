/**
 * quap validated two ways: exactly on a known Gaussian target, and
 * against the book's published m4.1 / m4.3 results on Howell1 adults
 * (mu 154.61 ± sd 0.41, sigma 7.73 ± sd 0.29; a 154.60, b 0.90,
 * sigma 5.07). Tolerances: modes ±0.15, sds ±0.06, b ±0.03.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RNG } from './rng'
import { mean, sd as sampleSd } from './stats'
import { cholesky, dnormLog, invertMatrix, nelderMead, quap } from './quap'
import { adults, fitM41, fitM43, parseHowellCsv } from '../content/models/howell'

const csv = readFileSync(
  resolve(__dirname, '../../public/data/datasets/Howell1.csv'),
  'utf8',
)
const rows = parseHowellCsv(csv)
const grown = adults(rows)

describe('linear algebra helpers', () => {
  it('invertMatrix recovers identity', () => {
    const m = [
      [4, 1],
      [1, 3],
    ]
    const inv = invertMatrix(m)
    // m × inv = I
    const prod = [
      [4 * inv[0]![0]! + 1 * inv[1]![0]!, 4 * inv[0]![1]! + 1 * inv[1]![1]!],
      [1 * inv[0]![0]! + 3 * inv[1]![0]!, 1 * inv[0]![1]! + 3 * inv[1]![1]!],
    ]
    expect(prod[0]![0]).toBeCloseTo(1, 10)
    expect(prod[0]![1]).toBeCloseTo(0, 10)
    expect(prod[1]![1]).toBeCloseTo(1, 10)
  })

  it('cholesky reproduces the matrix', () => {
    const m = [
      [4, 2],
      [2, 3],
    ]
    const L = cholesky(m)
    expect(L[0]![0]! * L[0]![0]!).toBeCloseTo(4, 10)
    expect(L[1]![0]! * L[0]![0]!).toBeCloseTo(2, 10)
    expect(L[1]![0]! ** 2 + L[1]![1]! ** 2).toBeCloseTo(3, 10)
  })
})

describe('quap on a known Gaussian target', () => {
  it('recovers mode and covariance of N([1, -2], diag(4, 0.25))', () => {
    const logPost = (t: readonly number[]) =>
      dnormLog(t[0]!, 1, 2) + dnormLog(t[1]!, -2, 0.5)
    const fit = quap(logPost, [0, 0], ['x', 'y'])
    expect(fit.mode[0]).toBeCloseTo(1, 3)
    expect(fit.mode[1]).toBeCloseTo(-2, 3)
    expect(fit.sd[0]).toBeCloseTo(2, 2)
    expect(fit.sd[1]).toBeCloseTo(0.5, 2)
    const draws = fit.draws(20000, new RNG(1))
    expect(mean([...draws['x']!])).toBeCloseTo(1, 1)
    expect(sampleSd([...draws['y']!])).toBeCloseTo(0.5, 1)
  })
})

describe('m4.1 (Howell adults, height only)', () => {
  it('data slice matches the book: 352 adults', () => {
    expect(rows.length).toBe(544)
    expect(grown.length).toBe(352)
  })

  it('matches published mu and sigma', () => {
    const fit = fitM41(grown.map((r) => r.height))
    const [mu, sigma] = fit.mode
    expect(mu).toBeCloseTo(154.61, 1)
    expect(sigma).toBeCloseTo(7.73, 1)
    expect(fit.sd[0]!).toBeCloseTo(0.41, 1)
    expect(fit.sd[1]!).toBeCloseTo(0.29, 1)
  })
})

describe('m4.3 (height ~ weight, adults)', () => {
  it('matches published a, b, sigma', () => {
    const fit = fitM43(grown)
    const [a, b, sigma] = fit.mode
    expect(a).toBeCloseTo(154.6, 1)
    expect(b!).toBeGreaterThan(0.87)
    expect(b!).toBeLessThan(0.93)
    expect(sigma).toBeCloseTo(5.07, 1)
  })

  it('draws behave like the posterior summaries', () => {
    const fit = fitM43(grown)
    const draws = fit.draws(10000, new RNG(1959))
    expect(mean([...draws['b']!])).toBeCloseTo(0.9, 1)
    expect(sampleSd([...draws['a']!])).toBeCloseTo(0.27, 1)
  })
})

describe('nelderMead', () => {
  it('maximizes a simple concave function', () => {
    const { x } = nelderMead((t) => -((t[0]! - 3) ** 2) - (t[1]! + 1) ** 2, [0, 0])
    expect(x[0]).toBeCloseTo(3, 4)
    expect(x[1]).toBeCloseTo(-1, 4)
  })
})
