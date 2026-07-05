import { CafeEllipse } from '../../components/interactives/cafe-ellipse/CafeEllipse'

export function CafeDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Café ellipse</p>
      <h1 className="mt-4 font-display text-2xl">Correlated varying effects</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Tilt the adaptive prior with the correlation slider and watch the raw
        café estimates shrink along the ellipse instead of toward a point.
      </p>
      <div className="mt-10 max-w-[720px]">
        <CafeEllipse />
      </div>
    </div>
  )
}
