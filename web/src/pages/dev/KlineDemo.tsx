import { KlinePoisson } from '../../components/interactives/kline-poisson/KlinePoisson'

export function KlineDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Kline Poisson</p>
      <h1 className="mt-4 font-display text-2xl">Tools, people, ledgers</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        The Oceanic tool kits under m11.10, and the monastery ledger that
        teaches offsets by nearly selling you a bad monastery.
      </p>
      <div className="mt-10 max-w-[760px]">
        <KlinePoisson />
      </div>
    </div>
  )
}
