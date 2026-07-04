/**
 * plot-theme.ts — the one place charts get their colors and chrome.
 *
 * The semantic statistical palette (CLAUDE.md §2.2) is sacred:
 *   data → bone · prior → verdigris · posterior → brass
 *   predictive simulation → plum · danger → clay
 *
 * Colors are read from the CSS variables in tokens.css at call time, so
 * charts follow the workshop/daylight theme automatically. Never pass a
 * hex color to a chart; pass `stat("posterior")`.
 */

export type StatRole = 'data' | 'prior' | 'posterior' | 'predictive' | 'danger'

const STAT_VARS: Record<StatRole, string> = {
  data: '--stat-data',
  prior: '--stat-prior',
  posterior: '--stat-posterior',
  predictive: '--stat-predictive',
  danger: '--stat-danger',
}

function cssVar(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  if (!value) {
    throw new Error(
      `plot-theme: CSS variable ${name} is unset — is tokens.css loaded?`,
    )
  }
  return value
}

/** Resolve a statistical role to its themed color. */
export function stat(role: StatRole): string {
  return cssVar(STAT_VARS[role])
}

/** House treatment for density curves: 1.5px stroke, 8% fill of the same hue. */
export function densityStyle(role: StatRole): {
  stroke: string
  strokeWidth: number
  fill: string
  fillOpacity: number
} {
  const color = stat(role)
  return { stroke: color, strokeWidth: 1.5, fill: color, fillOpacity: 0.08 }
}

/**
 * Shared chart chrome for Observable Plot / D3: mono axis type, hairline
 * rules, no chart border, no gridline clutter.
 */
export function plotDefaults(): {
  fontFamily: string
  fontSize: number
  textColor: string
  hairline: string
  background: 'transparent'
} {
  return {
    fontFamily: cssVar('--font-mono'),
    fontSize: 12,
    textColor: cssVar('--text-secondary'),
    hairline: cssVar('--line'),
    background: 'transparent',
  }
}
