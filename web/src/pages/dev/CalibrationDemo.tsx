import { useMemo } from 'react'
import { CalibrationSketch } from '../../components/interactives/calibration-sketch/CalibrationSketch'
import { drawsForChapter } from '../../content/chapter-draws'
import { kde } from '../../lib/stats'

export function CalibrationDemo() {
  const truth = useMemo(() => {
    const globe = drawsForChapter(2)!
    return kde(globe.draws, { lo: 0, hi: 1, n: 128 })
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · calibration sketch</p>
      <h1 className="mt-4 font-display text-2xl">Guess before you look</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Six waters in nine tosses of the globe, flat prior. Sketch the
        posterior for the proportion of water before revealing it. The score
        is the overlap between your shape and the truth.
      </p>
      <div className="mt-10 max-w-[680px]">
        <CalibrationSketch
          id="dev-globe-posterior"
          chapter={2}
          truth={truth}
          axis={{ left: '0', label: 'proportion water p', right: '1' }}
        />
      </div>
    </div>
  )
}
