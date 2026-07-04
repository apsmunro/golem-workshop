/**
 * Course-specific wrappers used inside chapter MDX. Keeps the MDX prose
 * clean of setup code.
 */
import { useMemo } from 'react'
import { CalibrationSketch } from '../../components/interactives/calibration-sketch/CalibrationSketch'
import { drawsForChapter } from '../chapter-draws'
import { kde } from '../../lib/stats'

/** Guess the globe-tossing posterior (6 W in 9) before seeing it. */
export function GlobeCalibration() {
  const truth = useMemo(() => {
    const globe = drawsForChapter(2)!
    return kde(globe.draws, { lo: 0, hi: 1, n: 128 })
  }, [])
  return (
    <CalibrationSketch
      id="ch02-globe-posterior"
      chapter={2}
      truth={truth}
      axis={{ left: '0', label: 'proportion water p', right: '1' }}
    />
  )
}
