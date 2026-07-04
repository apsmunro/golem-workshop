import { describe, expect, it } from 'vitest'
import { outputMatches } from './webr-session'

describe('outputMatches', () => {
  const lines = [
    { text: '[1] 0.5333333' },
    { text: '[1]  4  8 15 16 23 42' },
  ]

  it('finds fragments regardless of whitespace runs', () => {
    expect(outputMatches(lines, ['0.5333'])).toBe(true)
    expect(outputMatches(lines, ['4 8 15'])).toBe(true)
  })

  it('requires every fragment', () => {
    expect(outputMatches(lines, ['0.5333', 'nope'])).toBe(false)
  })

  it('empty expectation always passes', () => {
    expect(outputMatches(lines, [])).toBe(true)
  })
})
