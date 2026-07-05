import { CutpointDragger } from '../../components/interactives/cutpoint-dragger/CutpointDragger'

export function CutpointDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Cutpoint dragger</p>
      <h1 className="mt-4 font-display text-2xl">Carving the latent axis</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Drag six cutpoints until the seven bars match nine thousand trolley
        judgments, then reveal how little magic the fit involved.
      </p>
      <div className="mt-10 max-w-[760px]">
        <CutpointDragger />
      </div>
    </div>
  )
}
