import { useState } from 'react'
import type { ProblemHints } from '../../content/practice/types'

interface Tier {
  key: 'concept' | 'strategy' | 'skeleton' | 'solution'
  label: string
  nudge: string
}

const TIERS: Tier[] = [
  { key: 'concept', label: 'Concept nudge', nudge: 'A pointer to the idea, nothing more.' },
  { key: 'strategy', label: 'Strategy', nudge: 'How to attack it, still no code.' },
  { key: 'skeleton', label: 'Code skeleton', nudge: 'The scaffolding with blanks to fill.' },
  { key: 'solution', label: 'Worked solution', nudge: 'Try it on paper first. The answer keeps.' },
]

export function HintLadder({ hints }: { hints: ProblemHints }) {
  const [unlocked, setUnlocked] = useState(0)
  const tiers = TIERS.filter((t) => hints[t.key] !== undefined)

  return (
    <div className="mt-4 space-y-3">
      {tiers.map((tier, i) => {
        const content = hints[tier.key]!
        if (i > unlocked) return null
        if (i === unlocked) {
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => setUnlocked(unlocked + 1)}
              className="block w-full cursor-pointer rounded-card border border-line px-4 py-3 text-left transition-colors duration-[180ms] hover:border-accent"
            >
              <span className="eyebrow">{tier.label}</span>
              <span className="mt-1 block text-sm text-secondary">{tier.nudge}</span>
            </button>
          )
        }
        return (
          <div key={tier.key} className="rounded-card border border-line bg-surface px-4 py-3">
            <p className="eyebrow">{tier.label}</p>
            {tier.key === 'skeleton' ? (
              <pre className="mt-2 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">
                {content}
              </pre>
            ) : (
              <div className="mt-2 space-y-2 text-[15px] leading-relaxed">
                {content.split('\n\n').map((para, pi) =>
                  para.startsWith('```') ? (
                    <pre key={pi} className="overflow-x-auto rounded-card bg-ink-950 p-3 text-sm leading-relaxed whitespace-pre-wrap text-bone-100">
                      {para.replace(/```r?\n?/g, '').replace(/```$/, '')}
                    </pre>
                  ) : (
                    <p key={pi}>{para}</p>
                  ),
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
