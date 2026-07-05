import { AdmitParadox } from '../../components/interactives/admit-paradox/AdmitParadox'

export function AdmitDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Admit paradox</p>
      <h1 className="mt-4 font-display text-2xl">Berkeley, 1973</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Two models, two causal questions, one dataset that answers them with
        opposite signs.
      </p>
      <div className="mt-10 max-w-[760px]">
        <AdmitParadox />
      </div>
    </div>
  )
}
