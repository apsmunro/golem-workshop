import { DivergenceDetective } from '../../components/interactives/divergence-detective/DivergenceDetective'

export function DivergenceDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Divergence detective</p>
      <h1 className="mt-4 font-display text-2xl">Where the chains break</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        The same funnel, sampled in its natural coordinates and after
        non-centering. Watch the clay crosses gather in the neck on the left and
        disappear on the right.
      </p>
      <div className="mt-10 max-w-[820px]">
        <DivergenceDetective />
      </div>
    </div>
  )
}
