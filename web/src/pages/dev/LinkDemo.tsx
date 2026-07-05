import { LinkMorpher } from '../../components/interactives/link-morpher/LinkMorpher'

export function LinkDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Link morpher</p>
      <h1 className="mt-4 font-display text-2xl">One line, two worlds</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Slide the morph and watch a straight line on the link scale become the
        logistic S on the outcome scale — gridlines and all.
      </p>
      <div className="mt-10 max-w-[760px]">
        <LinkMorpher />
      </div>
    </div>
  )
}
