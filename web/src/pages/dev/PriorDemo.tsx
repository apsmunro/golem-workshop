import { PriorPlayground } from '../../components/interactives/prior-playground/PriorPlayground'

export function PriorDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · prior predictive playground</p>
      <h1 className="mt-4 font-display text-2xl">What do your priors believe?</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Sixty regression lines drawn from the priors alone, before any data.
        Clay lines predict people shorter than nothing or taller than anyone
        who has ever lived. Move the sliders until your golem stops
        inventing monsters.
      </p>
      <div className="mt-10 max-w-[820px]">
        <PriorPlayground />
      </div>
    </div>
  )
}
