/**
 * Scores are exact where hand-computable (TV of block densities) and
 * bounded (> 0.95) for a sketch tracing the truth exactly.
 */
import { describe, expect, it } from 'vitest'
import { scoreSketch, sketchIsScorable, sketchToDensity } from './engine'
import type { SketchPoint } from './engine'

const W = 400
const H = 200
const N = 40

describe('sketchToDensity', () => {
  it('bins heights above the baseline', () => {
    // One point in bin 0 at half height, one in the last bin at the top.
    const pts: SketchPoint[] = [
      { x: 2, y: H / 2 },
      { x: W - 2, y: 0 },
    ]
    const d = sketchToDensity(pts, W, H, N)
    expect(d[0]).toBeCloseTo(0.5, 9)
    expect(d[N - 1]).toBeCloseTo(1, 9)
  })

  it('interpolates interior gaps but leaves the outside at zero', () => {
    const pts: SketchPoint[] = [
      { x: W * 0.25 + 1, y: 0 }, // bin 10, height 1
      { x: W * 0.75 + 1, y: H }, // bin 30, height 0
    ]
    const d = sketchToDensity(pts, W, H, N)
    expect(d[10]).toBeCloseTo(1, 9)
    expect(d[30]).toBeCloseTo(0, 9)
    expect(d[20]!).toBeCloseTo(0.5, 9)
    expect(d[5]).toBe(0)
    expect(d[35]).toBe(0)
  })

  it('averages multiple samples landing in one bin', () => {
    const pts: SketchPoint[] = [
      { x: 2, y: 0 },
      { x: 3, y: H },
    ]
    const d = sketchToDensity(pts, W, H, N)
    expect(d[0]).toBeCloseTo(0.5, 9)
  })

  it('clamps strokes below the baseline to zero height', () => {
    const d = sketchToDensity([{ x: 2, y: H + 50 }], W, H, N)
    expect(d[0]).toBe(0)
  })
})

describe('sketchIsScorable', () => {
  it('requires at least 15% of the axis', () => {
    const sparse = new Array<number>(N).fill(0)
    sparse[0] = 1
    expect(sketchIsScorable(sparse)).toBe(false)
    const wide = new Array<number>(N).fill(0)
    for (let i = 0; i < 8; i++) wide[i] = 1
    expect(sketchIsScorable(wide)).toBe(true)
  })
})

describe('scoreSketch', () => {
  it('is 1 for a perfect trace and 0 for no overlap', () => {
    const truth = [0, 1, 2, 1, 0]
    expect(scoreSketch([0, 2, 4, 2, 0], truth)).toBeCloseTo(1, 12)
    expect(scoreSketch([1, 0, 0, 0, 0], [0, 0, 0, 0, 1])).toBeCloseTo(0, 12)
  })

  it('half-overlapping blocks score 0.5', () => {
    expect(scoreSketch([1, 1, 0], [0, 1, 1])).toBeCloseTo(0.5, 12)
  })

  it('an empty sketch scores 0 instead of throwing', () => {
    expect(scoreSketch([0, 0, 0], [1, 2, 1])).toBe(0)
  })

  it('a faithful KDE-shaped trace scores above 0.95', () => {
    const truth = Array.from({ length: N }, (_, i) =>
      Math.exp(-0.5 * ((i - 20) / 5) ** 2),
    )
    // trace with slight vertical noise
    const sketch = truth.map((t, i) => t * (1 + 0.02 * Math.sin(i)))
    expect(scoreSketch(sketch, truth)).toBeGreaterThan(0.95)
  })
})
