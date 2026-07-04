// jsdom does not cascade stylesheets into custom properties, so tests set
// variables inline on the root element with sentinel (non-hex) values.
import { beforeEach, describe, expect, it } from 'vitest'
import { densityStyle, stat } from './plot-theme'

const root = document.documentElement

beforeEach(() => {
  root.style.setProperty('--stat-data', 'sentinel-bone')
  root.style.setProperty('--stat-prior', 'sentinel-verdigris')
  root.style.setProperty('--stat-posterior', 'sentinel-brass')
  root.style.setProperty('--stat-predictive', 'sentinel-plum')
  root.style.setProperty('--stat-danger', 'sentinel-clay')
})

describe('stat()', () => {
  it('maps every role to its semantic variable', () => {
    expect(stat('data')).toBe('sentinel-bone')
    expect(stat('prior')).toBe('sentinel-verdigris')
    expect(stat('posterior')).toBe('sentinel-brass')
    expect(stat('predictive')).toBe('sentinel-plum')
    expect(stat('danger')).toBe('sentinel-clay')
  })

  it('throws loudly when tokens are missing', () => {
    root.style.removeProperty('--stat-posterior')
    expect(() => stat('posterior')).toThrow(/tokens\.css/)
  })
})

describe('densityStyle()', () => {
  it('applies the house curve treatment', () => {
    const style = densityStyle('posterior')
    expect(style).toEqual({
      stroke: 'sentinel-brass',
      strokeWidth: 1.5,
      fill: 'sentinel-brass',
      fillOpacity: 0.08,
    })
  })
})
