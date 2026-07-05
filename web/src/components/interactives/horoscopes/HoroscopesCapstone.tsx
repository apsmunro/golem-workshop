import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { golems } from '../../bestiary/registry'
import { chapters } from '../../../content/chapters'
import { useWorkshopStore } from '../../../store'

/** Original reflective prompts — the "what your golems can't do" essays. */
const PROMPTS = [
  'Pick one golem in your bestiary and write the sentence it would get wrong. Not a number it estimates poorly — a question it is structurally unable to answer, and why.',
  'You forged the DAG charm and the compass. Name a study where a low WAIC would have led you to the wrong causal conclusion, and say which tool should have overruled the other.',
  'Every posterior in this course assumed the model was true. Choose a chapter and describe the check that would have caught the model being wrong, and what you would have done next.',
  'Where in your own work does a p-value or a default prior still stand in for a scientific model you have not written down yet? Describe the model you are avoiding.',
]

function scoreColor(mean: number): string {
  if (mean >= 0.75) return 'var(--brass-400)'
  if (mean >= 0.5) return 'var(--brass-200)'
  return 'var(--clay-500)'
}

export function HoroscopesCapstone() {
  const calibrations = useWorkshopStore((s) => s.calibrations)
  const forged = useWorkshopStore((s) => s.golems)
  const chapterProgress = useWorkshopStore((s) => s.chapters)

  const report = useMemo(() => {
    const n = calibrations.length
    const mean = n === 0 ? 0 : calibrations.reduce((s, c) => s + c.score, 0) / n
    const byChapter = new Map<number, number[]>()
    for (const c of calibrations) {
      const arr = byChapter.get(c.chapter) ?? []
      arr.push(c.score)
      byChapter.set(c.chapter, arr)
    }
    const perChapter = [...byChapter.entries()]
      .map(([chapter, scores]) => ({
        chapter,
        mean: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      }))
      .sort((a, b) => a.chapter - b.chapter)
    return { n, mean, perChapter }
  }, [calibrations])

  const golemChapters = chapters.filter((c) => c.golem !== null)
  const forgedCount = golems.filter((g) => forged[g.id] !== undefined).length
  const chaptersComplete = Object.values(chapterProgress).filter((c) => c.status === 'complete').length

  return (
    <div className="space-y-12">
      {/* calibration report */}
      <section>
        <p className="eyebrow">Your calibration, across the course</p>
        {report.n === 0 ? (
          <p className="mt-3 text-secondary">
            You have not sketched a posterior yet. The report fills in as you
            guess before the reveal — start with the{' '}
            <Link to="/chapter/small-worlds-and-large-worlds">globe toss in chapter 2</Link>.
          </p>
        ) : (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-sm">
                {(report.mean * 100).toFixed(0)}% mean overlap
              </p>
              <p className="font-mono text-xs text-secondary">{report.n} guesses logged</p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full"
                style={{ width: `${report.mean * 100}%`, backgroundColor: scoreColor(report.mean) }}
              />
            </div>
            <div className="mt-6 space-y-2">
              {report.perChapter.map((row) => {
                const meta = chapters.find((c) => c.n === row.chapter)
                return (
                  <div key={row.chapter} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm text-secondary">
                      {meta ? meta.title : `Chapter ${row.chapter}`}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                      <div className="h-full rounded-full" style={{ width: `${row.mean * 100}%`, backgroundColor: scoreColor(row.mean) }} />
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-xs text-secondary">
                      {(row.mean * 100).toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-sm text-secondary">
              Overlap near 100% means your sketch matched the true posterior;
              low scores usually mean your intervals were too narrow — the most
              common way to be overconfident. The number is not a grade. It is a
              record of how your intuition tracked the mathematics, chapter by
              chapter.
            </p>
          </div>
        )}
      </section>

      {/* bestiary review */}
      <section>
        <p className="eyebrow">Your bestiary</p>
        <p className="mt-3 text-sm text-secondary">
          {forgedCount} of {golemChapters.length} golems forged ·{' '}
          {chaptersComplete} of {chapters.length} benches finished.{' '}
          <Link to="/bestiary">Walk the workshop floor.</Link>
        </p>
        <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {golems.map((g) => {
            const isForged = forged[g.id] !== undefined
            return (
              <div key={g.id} className="flex flex-col items-center">
                <div className="h-16 w-14">
                  <g.Art state={isForged ? 'forged' : 'unforged'} className="h-full w-full" />
                </div>
                <span className={`mt-1 text-center text-[10px] leading-tight ${isForged ? 'text-primary' : 'text-secondary'}`}>
                  {g.name}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* what your golems can't do */}
      <section>
        <p className="eyebrow">What your golems can't do</p>
        <p className="mt-3 text-sm text-secondary">
          Four prompts with no answer key. A golem is a tool with no wisdom of
          its own — the judgment stays yours. Write a paragraph on each before
          you close the book.
        </p>
        <ol className="mt-5 space-y-4">
          {PROMPTS.map((prompt, i) => (
            <li key={i} className="rounded-card border border-line bg-surface p-4">
              <span className="font-mono text-xs text-accent-bright">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 text-sm leading-relaxed">{prompt}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
