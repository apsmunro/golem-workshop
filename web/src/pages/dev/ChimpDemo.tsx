import { ChimpExplorer } from '../../components/interactives/chimp-explorer/ChimpExplorer'

export function ChimpDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Chimp explorer</p>
      <h1 className="mt-4 font-display text-2xl">The prosocial lever</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        m11.4 fit in the browser: treatment contrasts on two scales, and seven
        actors who mostly just have a favorite hand.
      </p>
      <div className="mt-10 max-w-[760px]">
        <ChimpExplorer />
      </div>
    </div>
  )
}
