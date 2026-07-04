import { HmcToy } from '../../components/interactives/hmc-toy/HmcToy'

export function HmcDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · HMC physics toy</p>
      <h1 className="mt-4 font-display text-2xl">A marble in the bowl</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Flick, glide, accept. Push ε past the stability limit and watch the
        marble leave the bowl — that is a divergence, not a metaphor.
      </p>
      <div className="mt-10 max-w-[860px]">
        <HmcToy />
      </div>
    </div>
  )
}
