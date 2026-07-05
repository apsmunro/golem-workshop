import { EntropyPebbles } from '../../components/interactives/entropy-pebbles/EntropyPebbles'

export function EntropyDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Entropy pebbles</p>
      <h1 className="mt-4 font-display text-2xl">Counting the ways</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Ten pebbles, five buckets. Arrangements that can happen more ways carry
        more entropy — lock the lever and chase the champion shape.
      </p>
      <div className="mt-10 max-w-[760px]">
        <EntropyPebbles />
      </div>
    </div>
  )
}
