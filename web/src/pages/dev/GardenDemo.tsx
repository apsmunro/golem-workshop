import { GardenOfForkingData } from '../../components/interactives/garden-of-forking-data/GardenOfForkingData'

export function GardenDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · garden of forking data</p>
      <h1 className="mt-4 font-display text-2xl">Counting is inference</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Pick a conjecture, draw data, watch the incompatible paths wither.
        The surviving counts, normalized, are the posterior. "Update again"
        carries this round's counts into the next as prior weights.
      </p>
      <div className="mt-10 max-w-[820px]">
        <GardenOfForkingData />
      </div>
    </div>
  )
}
