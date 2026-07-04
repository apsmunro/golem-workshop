/**
 * Prior Predictive Playground engine. Draw regression lines implied by
 * the priors alone, then check each against red zones — regions of the
 * outcome that are physically absurd. Pure and seeded.
 */
import type { RNG } from '../../../lib/rng'

export interface RedZone {
  label: string
  /** absurd when y drops below this */
  below?: number
  /** absurd when y rises above this */
  above?: number
}

export type SlopePriorKind = 'normal' | 'lognormal'

export interface PriorConfig {
  /** intercept ~ Normal(aMu, aSd) */
  aMu: number
  aSd: number
  /** slope prior family and scale: Normal(0, bSd) or LogNormal(0, bSd) */
  bKind: SlopePriorKind
  bSd: number
}

export interface PriorLine {
  a: number
  b: number
  /** labels of every red zone the line enters within the x-range */
  violations: string[]
}

export interface PlaygroundSpec {
  xRange: [number, number]
  /** centered predictor: y = a + b (x − xbar) */
  xbar: number
  redZones: RedZone[]
}

export function drawPriorLines(
  spec: PlaygroundSpec,
  config: PriorConfig,
  n: number,
  rng: RNG,
): PriorLine[] {
  const lines: PriorLine[] = []
  for (let i = 0; i < n; i++) {
    const a = rng.normal(config.aMu, config.aSd)
    const b =
      config.bKind === 'lognormal'
        ? Math.exp(rng.normal(0, config.bSd))
        : rng.normal(0, config.bSd)
    lines.push({ a, b, violations: violations(spec, a, b) })
  }
  return lines
}

/** A line's extremes over a closed x interval sit at the endpoints. */
export function violations(spec: PlaygroundSpec, a: number, b: number): string[] {
  const [lo, hi] = spec.xRange
  const y1 = a + b * (lo - spec.xbar)
  const y2 = a + b * (hi - spec.xbar)
  const yMin = Math.min(y1, y2)
  const yMax = Math.max(y1, y2)
  const out: string[] = []
  for (const zone of spec.redZones) {
    if (zone.below !== undefined && yMin < zone.below) out.push(zone.label)
    else if (zone.above !== undefined && yMax > zone.above) out.push(zone.label)
  }
  return out
}

export function absurdCount(lines: readonly PriorLine[]): number {
  return lines.filter((l) => l.violations.length > 0).length
}

/** The chapter 4 spec: !Kung adult heights against weight. */
export const HEIGHT_SPEC: PlaygroundSpec = {
  xRange: [30, 65],
  xbar: 45,
  redZones: [
    { label: 'shorter than nothing', below: 0 },
    { label: 'taller than the tallest human ever', above: 272 },
  ],
}
