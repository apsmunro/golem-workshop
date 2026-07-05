import { ZeroInflationMixer } from '../../components/interactives/zero-inflation-mixer/ZeroInflationMixer'

export function ZipDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Zero-inflation mixer</p>
      <h1 className="mt-4 font-display text-2xl">The drinking monks</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Mix a drinking probability with a work rate and watch the zero column
        outgrow what any plain Poisson can explain.
      </p>
      <div className="mt-10 max-w-[760px]">
        <ZeroInflationMixer />
      </div>
    </div>
  )
}
