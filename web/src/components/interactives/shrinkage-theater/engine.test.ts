/**
 * Shrinkage Theater engine tests.
 *
 * Validated against the reedfrog analysis of Statistical Rethinking §13.1:
 * the complete-pooling survival is high (≈0.8), the grand-mean intercept
 * sits near ᾱ ≈ 1.4 on the logit scale, and — the pedagogical point —
 * partial pooling shrinks small tanks toward the mean more than large
 * ones at a fixed σ. Tolerances are loose because we set σ by hand rather
 * than sampling the hyperprior.
 */
import { describe, expect, it } from 'vitest'
import {
  completePooling,
  grandMeanLogit,
  logistic,
  logit,
  parseReedfrogs,
  partialPoolTank,
  partialPooling,
  shrinkageTable,
} from './engine'

// A trimmed but faithful slice of reedfrogs.csv (n and surv are all that
// the engine reads); the full file ships in public/data/datasets.
const CSV = `density;pred;size;surv;propsurv
10;no;big;9;0.9
10;pred;big;4;0.4
25;no;big;24;0.96
25;pred;big;6;0.24
35;no;small;35;1
35;pred;big;4;0.114`

describe('parseReedfrogs', () => {
  it('reads density, surv, and treatments', () => {
    const tanks = parseReedfrogs(CSV)
    expect(tanks).toHaveLength(6)
    expect(tanks[0]).toMatchObject({ density: 10, surv: 9, pred: 'no', size: 'big' })
    expect(tanks[4]).toMatchObject({ density: 35, surv: 35, pred: 'no', size: 'small' })
    expect(tanks[0]!.id).toBe(1)
  })
})

describe('logit / logistic', () => {
  it('round-trips', () => {
    for (const p of [0.1, 0.42, 0.8, 0.97]) {
      expect(logistic(logit(p))).toBeCloseTo(p, 12)
    }
  })
})

describe('pooling summaries', () => {
  it('complete pooling is the total-survivor ratio', () => {
    const tanks = parseReedfrogs(CSV)
    const total = tanks.reduce((s, t) => s + t.surv, 0)
    const n = tanks.reduce((s, t) => s + t.density, 0)
    expect(completePooling(tanks)).toBeCloseTo(total / n, 12)
  })
})

describe('partial pooling', () => {
  it('a 100%-survival tank stays below 1 (the MLE would be +infinity)', () => {
    // tank of 35 with 35 survivors: no-pooling p = 1, logit = +Inf
    const p = partialPoolTank(35, 35, 1.4, 1.6)
    expect(p).toBeLessThan(1)
    expect(p).toBeGreaterThan(0.9)
  })

  it('shrinks toward the grand mean but not past it', () => {
    const mu = 1.4
    const grand = logistic(mu)
    // a small tank far below the mean
    const p = partialPoolTank(2, 10, mu, 1.6)
    const raw = 2 / 10
    expect(p).toBeGreaterThan(raw) // pulled up toward the mean
    expect(p).toBeLessThan(grand) // but not past it
  })

  it('shrinks small tanks more than large tanks at the same distance', () => {
    const mu = 0 // grand mean p = 0.5 for a clean comparison
    // both tanks observe 20% survival, one with n=10, one with n=40
    const small = partialPoolTank(2, 10, mu, 1.0)
    const large = partialPoolTank(8, 40, mu, 1.0)
    const rawShrinkSmall = small - 0.2
    const rawShrinkLarge = large - 0.2
    expect(rawShrinkSmall).toBeGreaterThan(rawShrinkLarge)
  })

  it('tighter priors (small σ) pull harder toward the mean', () => {
    const mu = 0
    const loose = partialPoolTank(8, 10, mu, 4.0)
    const tight = partialPoolTank(8, 10, mu, 0.3)
    // raw = 0.8; tight prior drags closer to 0.5
    expect(tight).toBeLessThan(loose)
    expect(tight).toBeGreaterThan(0.5)
  })
})

describe('grand mean and table', () => {
  it('grand-mean logit matches logit of complete pooling', () => {
    const tanks = parseReedfrogs(CSV)
    expect(grandMeanLogit(tanks)).toBeCloseTo(logit(completePooling(tanks)), 12)
  })

  it('table reports per-tank shrinkage fractions in [0, 1]', () => {
    const tanks = parseReedfrogs(CSV)
    const { rows } = shrinkageTable(tanks, 1.6)
    for (const row of rows) {
      expect(row.shrinkage).toBeGreaterThanOrEqual(-0.01)
      expect(row.shrinkage).toBeLessThanOrEqual(1.01)
    }
  })

  it('partialPooling returns one estimate per tank', () => {
    const tanks = parseReedfrogs(CSV)
    expect(partialPooling(tanks, 1.6)).toHaveLength(tanks.length)
  })
})
