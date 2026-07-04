import { TraceTriage } from '../../components/interactives/trace-triage/TraceTriage'

export function TriageDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · Trace-plot triage</p>
      <h1 className="mt-4 font-display text-2xl">The chain clinic</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Patients arrive three chains at a time. Name the ailment before the
        diagnostics confirm it.
      </p>
      <div className="mt-10 max-w-[760px]">
        <TraceTriage />
      </div>
    </div>
  )
}
