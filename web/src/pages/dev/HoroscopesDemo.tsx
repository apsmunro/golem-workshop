import { HoroscopesCapstone } from '../../components/interactives/horoscopes/HoroscopesCapstone'

export function HoroscopesDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Horoscopes capstone</p>
      <h1 className="mt-4 font-display text-2xl">The mirror at the end</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        The capstone reads your calibration history and bestiary from the store.
        With a fresh profile it invites you to go and make some guesses first.
      </p>
      <div className="mt-10 max-w-[720px]">
        <HoroscopesCapstone />
      </div>
    </div>
  )
}
