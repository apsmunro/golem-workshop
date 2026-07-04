/**
 * living-posterior-engine.ts — pure logic behind the LivingPosterior header.
 *
 * A small flock of density curves, each a KDE of a bootstrap subsample of
 * the chapter's real posterior draws. Curves are born at the baseline,
 * rise slowly, fade, and respawn with a fresh subsample — smoke from the
 * workbench. All randomness flows through the seeded RNG so a given
 * chapter header drifts the same way every visit.
 */
import { kde } from '../../lib/stats'
import type { RNG } from '../../lib/rng'

export interface SmokeCurve {
  /** x grid normalized to [0, 1] across the drawing band. */
  xs: number[]
  /** densities normalized so the curve's peak is its `scale`. */
  ys: number[]
  /** life position in [0, 1); 1 triggers respawn. */
  age: number
  /** peak height multiplier, ~0.75–1 for organic variation. */
  scale: number
}

export interface EngineOptions {
  curveCount: number
  subsampleSize: number
  gridN: number
  range: [number, number]
  /** seconds a curve lives from birth to full fade. */
  lifetime: number
}

export const DEFAULTS: Omit<EngineOptions, 'range'> = {
  curveCount: 7,
  subsampleSize: 120,
  gridN: 96,
  lifetime: 14,
}

export function makeCurve(
  draws: readonly number[],
  rng: RNG,
  opts: EngineOptions,
  age = 0,
): SmokeCurve {
  const n = Math.min(opts.subsampleSize, draws.length)
  const sub: number[] = new Array(n)
  for (let i = 0; i < n; i++) sub[i] = draws[rng.int(draws.length)]!
  const [lo, hi] = opts.range
  const { x, y } = kde(sub, { lo, hi, n: opts.gridN })
  const peak = Math.max(...y)
  const span = hi - lo
  return {
    xs: x.map((v) => (v - lo) / span),
    ys: peak > 0 ? y.map((v) => v / peak) : y,
    age,
    scale: 0.75 + 0.25 * rng.uniform(),
  }
}

/** Curves staggered across the lifecycle so the header never starts empty. */
export function initCurves(
  draws: readonly number[],
  rng: RNG,
  opts: EngineOptions,
): SmokeCurve[] {
  return Array.from({ length: opts.curveCount }, (_, i) =>
    makeCurve(draws, rng, opts, i / opts.curveCount),
  )
}

/** Advance all curves by dt seconds, respawning any that finish their life. */
export function tickCurves(
  curves: SmokeCurve[],
  dt: number,
  draws: readonly number[],
  rng: RNG,
  opts: EngineOptions,
): void {
  for (let i = 0; i < curves.length; i++) {
    const next = curves[i]!.age + dt / opts.lifetime
    if (next >= 1) curves[i] = makeCurve(draws, rng, opts, next % 1)
    else curves[i]!.age = next
  }
}

/** Opacity over life: quick rise, long exhale. Max ~0.55. */
export function curveAlpha(age: number): number {
  return 0.55 * Math.sin(Math.PI * Math.min(Math.max(age, 0), 1)) ** 1.5
}

/** Vertical rise over life as a fraction of the band height, eased. */
export function curveRise(age: number): number {
  const t = Math.min(Math.max(age, 0), 1)
  return t * t * (3 - 2 * t) // smoothstep
}
