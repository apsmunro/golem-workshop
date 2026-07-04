import { useState } from 'react'
import { ForgingCeremony } from '../../components/bestiary/ForgingCeremony'
import { golems } from '../../components/bestiary/registry'

export function CeremonyDemo() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · forging ceremony</p>
      <h1 className="mt-4 font-display text-2xl">The one big animation</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Fragments assemble, eyes kindle, the golem joins the bestiary. Note:
        running this really forges the golem into your local bestiary.
      </p>
      <div className="mt-10 flex flex-wrap gap-8">
        {golems.map((g, i) => (
          <div key={g.id} className="w-56 rounded-card border border-line p-5 text-center">
            <div className="mx-auto h-48 w-40">
              <g.Art state="forged" className="h-full w-full" />
            </div>
            <p className="mt-2 text-sm">{g.name}</p>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="mt-3 cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
            >
              Forge
            </button>
          </div>
        ))}
      </div>
      {active !== null ? (
        <ForgingCeremony golem={golems[active]!} onClose={() => setActive(null)} />
      ) : null}
    </div>
  )
}
