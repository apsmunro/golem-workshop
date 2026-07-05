/**
 * gp-islands engine tests.
 *
 * The kernel, covariance, and correlation are checked against their
 * definitions and the m14.8 story: covariance is largest for the closest
 * pair (Malekula–Tikopia, 0.5) and near zero for the farthest (Yap–Hawaii,
 * 7.2). The Jacobi eigensolver is validated on a known symmetric matrix,
 * and MDS is checked for reconstructing the input distances.
 */
import { describe, expect, it } from 'vitest'
import {
  DIST,
  SOCIETIES,
  correlationMatrix,
  covarianceMatrix,
  jacobiEigen,
  kernel,
  mdsLayout,
} from './engine'

describe('kernel', () => {
  it('peaks at distance zero and decays', () => {
    const k = kernel(0.2, 1.5)
    expect(k(0)).toBeCloseTo(0.2, 12)
    expect(k(1)).toBeLessThan(k(0))
    expect(k(5)).toBeLessThan(k(1))
    expect(k(5)).toBeGreaterThanOrEqual(0)
  })
})

describe('covariance / correlation', () => {
  it('the closest pair covaries far more than the farthest', () => {
    const K = covarianceMatrix(0.2, 1.5)
    // Malekula(0)–Tikopia(1) are 0.5 apart; Yap(3)–Hawaii(9) are 7.2 apart
    expect(K[0]![1]!).toBeGreaterThan(K[3]![9]!)
    expect(K[3]![9]!).toBeLessThan(1e-6)
  })

  it('correlation has unit diagonal and lies in [-1, 1]', () => {
    const R = correlationMatrix(0.3, 0.8)
    for (let i = 0; i < R.length; i++) {
      expect(R[i]![i]!).toBeCloseTo(1, 10)
      for (let j = 0; j < R.length; j++) {
        expect(R[i]![j]!).toBeGreaterThanOrEqual(-1e-9)
        expect(R[i]![j]!).toBeLessThanOrEqual(1 + 1e-9)
      }
    }
  })

  it('larger ρ² decays correlation faster', () => {
    const slow = correlationMatrix(0.2, 0.3)
    const fast = correlationMatrix(0.2, 3.0)
    // a mid-distance pair: Malekula(0)–Trobriand(5) at 2.0
    expect(fast[0]![5]!).toBeLessThan(slow[0]![5]!)
  })
})

describe('jacobiEigen', () => {
  it('recovers eigenvalues of a known symmetric matrix', () => {
    const { values } = jacobiEigen([
      [2, 0, 0],
      [0, 3, 0],
      [0, 0, 5],
    ])
    expect(values.slice().sort((a, b) => a - b)).toEqual([2, 3, 5])
  })

  it('produces orthonormal eigenvectors that diagonalize the matrix', () => {
    const M = [
      [4, 1, 1],
      [1, 3, 0],
      [1, 0, 2],
    ]
    const { values, vectors } = jacobiEigen(M)
    // reconstruct M ≈ V Λ Vᵀ
    const n = 3
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let acc = 0
        for (let k = 0; k < n; k++) acc += vectors[i]![k]! * values[k]! * vectors[j]![k]!
        expect(acc).toBeCloseTo(M[i]![j]!, 8)
      }
    }
  })
})

describe('mdsLayout', () => {
  it('places all ten societies and roughly reconstructs the distances', () => {
    const pts = mdsLayout()
    expect(pts).toHaveLength(SOCIETIES.length)
    // 2-D embedding can't be exact, but the closest true pair should embed
    // closer than the farthest true pair
    const dist = (a: number, b: number) =>
      Math.hypot(pts[a]!.x - pts[b]!.x, pts[a]!.y - pts[b]!.y)
    expect(dist(0, 1)).toBeLessThan(dist(3, 9))
    // sanity: recovered near-pair distance is within a reasonable factor
    expect(dist(0, 1)).toBeLessThan(2 * DIST[0]![1]! + 1)
  })
})
