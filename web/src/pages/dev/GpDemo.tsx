import { GpIslands } from '../../components/interactives/gp-islands/GpIslands'

export function GpDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · GP islands</p>
      <h1 className="mt-4 font-display text-2xl">A Gaussian process over the Pacific</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        One kernel decides how strongly any two societies pool. Reshape it with
        the η² and ρ² sliders and watch the correlations on the map brighten and
        fade.
      </p>
      <div className="mt-10 max-w-[760px]">
        <GpIslands />
      </div>
    </div>
  )
}
