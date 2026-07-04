import { OverfitGame } from '../../components/interactives/overfit-game/OverfitGame'

export function OverfitDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Overfit the polynomial</p>
      <h1 className="mt-4 font-display text-2xl">Fit is not skill</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Twelve points, six golems of rising ambition. Commit to the degree you
        trust before new data arrives to settle it.
      </p>
      <div className="mt-10 max-w-[760px]">
        <OverfitGame />
      </div>
    </div>
  )
}
