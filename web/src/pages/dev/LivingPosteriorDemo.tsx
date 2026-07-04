import { LivingPosterior } from '../../components/core/LivingPosterior'
import { drawsForChapter } from '../../content/chapter-draws'

export function LivingPosteriorDemo() {
  const globe = drawsForChapter(2)!

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · living posterior</p>
      <h1 className="mt-4 font-display text-2xl">Smoke from the workbench</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Brass density curves resampled from the globe-tossing posterior,
        Beta(7, 4) — six waters in nine tosses. Curves are bootstrap KDEs of
        the chapter's actual draws; under reduced motion this renders one
        still frame.
      </p>
      <div className="relative mt-10 h-72 overflow-hidden rounded-card border border-line">
        <LivingPosterior draws={globe.draws} range={globe.range} />
      </div>
    </div>
  )
}
