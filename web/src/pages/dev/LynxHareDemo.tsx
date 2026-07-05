import { LynxHareOde } from '../../components/interactives/lynx-hare-ode/LynxHareOde'

export function LynxHareDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Lynx–hare ODE</p>
      <h1 className="mt-4 font-display text-2xl">A model you have to integrate</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Tune the four rates and watch the predator–prey loop tighten, drift, and
        cycle. The phase portrait is the orbit the golem solves for.
      </p>
      <div className="mt-10 max-w-[760px]">
        <LynxHareOde />
      </div>
    </div>
  )
}
