import { DagSandbox } from '../../components/interactives/dag-sandbox/DagSandbox'

export function DagDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · DAG sandbox</p>
      <h1 className="mt-4 font-display text-2xl">Doors, opened and closed</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Pick a story, condition on nodes, watch the back doors. Then simulate
        and see what the regression would tell you — and when it lies.
      </p>
      <div className="mt-10 max-w-[900px]">
        <DagSandbox />
      </div>
    </div>
  )
}
