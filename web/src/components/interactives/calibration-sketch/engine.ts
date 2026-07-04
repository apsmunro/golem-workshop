/**
 * Calibration sketch engine — turn a freehand stroke into a density on a
 * grid and score it against the truth. Pure; no canvas, no React.
 */
import { totalVariation } from '../../../lib/stats'

export interface SketchPoint {
  /** canvas x in px, 0..width */
  x: number
  /** canvas y in px from the top, 0..height */
  y: number
}

/**
 * Bin stroke points into `gridN` columns across the canvas width.
 * Height = distance above the baseline (canvas bottom), clamped ≥ 0.
 * Bins the stroke crossed get the mean height; gaps between sketched
 * bins are linearly interpolated; outside the sketched range is zero.
 */
export function sketchToDensity(
  points: readonly SketchPoint[],
  width: number,
  height: number,
  gridN: number,
): number[] {
  if (width <= 0 || height <= 0 || gridN < 2) {
    throw new RangeError('sketchToDensity: bad geometry')
  }
  const sums = new Array<number>(gridN).fill(0)
  const counts = new Array<number>(gridN).fill(0)
  for (const p of points) {
    if (p.x < 0 || p.x > width) continue
    const bin = Math.min(gridN - 1, Math.floor((p.x / width) * gridN))
    sums[bin]! += Math.max(0, height - p.y) / height
    counts[bin]! += 1
  }
  const out = new Array<number>(gridN).fill(0)
  const filled: number[] = []
  for (let i = 0; i < gridN; i++) {
    if (counts[i]! > 0) {
      out[i] = sums[i]! / counts[i]!
      filled.push(i)
    }
  }
  // Interpolate interior gaps only — the sketch's own extent is respected.
  for (let f = 0; f < filled.length - 1; f++) {
    const a = filled[f]!
    const b = filled[f + 1]!
    for (let i = a + 1; i < b; i++) {
      const t = (i - a) / (b - a)
      out[i] = out[a]! * (1 - t) + out[b]! * t
    }
  }
  return out
}

/** True when enough of the axis has been sketched to score honestly. */
export function sketchIsScorable(density: readonly number[]): boolean {
  const positive = density.filter((d) => d > 0).length
  return positive >= density.length * 0.15
}

/** 1 − total variation distance; both densities normalized internally. */
export function scoreSketch(
  sketch: readonly number[],
  truth: readonly number[],
): number {
  if (sketch.every((v) => v === 0)) return 0
  return 1 - totalVariation(sketch, truth)
}
