import { densityStyle } from '../../lib/plot-theme'
import type { StatRole } from '../../lib/plot-theme'

const paletteRows = [
  { token: '--ink-950', cls: 'bg-ink-950', role: 'workshop ground' },
  { token: '--ink-800', cls: 'bg-ink-800', role: 'raised surfaces, cards' },
  { token: '--ink-600', cls: 'bg-ink-600', role: 'borders, hairlines' },
  { token: '--bone-100', cls: 'bg-bone-100', role: 'daylight ground / text on dark' },
  { token: '--bone-300', cls: 'bg-bone-300', role: 'secondary text on dark' },
  { token: '--brass-400', cls: 'bg-brass-400', role: 'primary accent, the posterior' },
  { token: '--brass-200', cls: 'bg-brass-200', role: 'brass highlight, small text' },
  { token: '--verdigris-400', cls: 'bg-verdigris-400', role: 'the prior, links' },
  { token: '--clay-500', cls: 'bg-clay-500', role: 'golem clay, danger' },
  { token: '--plum-500', cls: 'bg-plum-500', role: 'predictive simulation' },
]

const statRoles: { role: StatRole; label: string }[] = [
  { role: 'data', label: 'Data' },
  { role: 'prior', label: 'Prior' },
  { role: 'posterior', label: 'Posterior' },
  { role: 'predictive', label: 'Predictive simulation' },
  { role: 'danger', label: 'Danger' },
]

/** A small engraved density curve, drawn with the house treatment. */
function DensitySample({ role }: { role: StatRole }) {
  const s = densityStyle(role)
  // A smooth unimodal curve; purely decorative.
  const d =
    'M0,38 C25,38 35,34 45,22 C55,10 62,4 75,4 C88,4 95,12 105,24 C113,33 125,38 150,38'
  return (
    <svg viewBox="0 0 150 40" className="h-10 w-full" aria-hidden="true">
      <path
        d={`${d} L150,40 L0,40 Z`}
        fill={s.fill}
        fillOpacity={s.fillOpacity}
        stroke="none"
      />
      <path d={d} fill="none" stroke={s.stroke} strokeWidth={s.strokeWidth} />
    </svg>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-20">
      <h2 className="eyebrow border-b border-line pb-3">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

export function Specimen() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · specimen</p>
      <h1 className="mt-4 font-display text-3xl">Tokens &amp; type</h1>

      <Section title="Palette">
        <ul className="grid list-none grid-cols-1 gap-x-10 sm:grid-cols-2">
          {paletteRows.map((row) => (
            <li key={row.token} className="flex items-center gap-4 border-b border-line py-3">
              <span className={`h-8 w-14 shrink-0 rounded-card border border-line ${row.cls}`} />
              <code className="text-sm">{row.token}</code>
              <span className="ml-auto text-right text-sm text-secondary">{row.role}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The statistical palette — color teaches">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {statRoles.map(({ role, label }) => (
            <figure key={role}>
              <DensitySample role={role} />
              <figcaption className="mt-2 flex items-baseline justify-between">
                <span className="text-sm">{label}</span>
                <code className="text-xs text-secondary">stat("{role}")</code>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 max-w-[62ch] text-sm text-secondary">
          The same encoding in every chart of every chapter: data in bone,
          prior in verdigris, posterior in brass, simulation in plum, danger in
          clay. Three chapters in, a learner reads any plot from color alone.
        </p>
      </Section>

      <Section title="Type scale — Gloock · STIX Two Text · IBM Plex Mono">
        <div className="space-y-8">
          <div>
            <p className="font-display text-4xl">Golem IV</p>
            <p className="mt-1 text-xs text-secondary">
              Gloock · display, chapter numerals · never below 28px
            </p>
          </div>
          <div>
            <p className="font-display text-2xl">The Haunted DAG &amp; the Causal Terror</p>
            <p className="mt-1 text-xs text-secondary">Gloock · chapter titles</p>
          </div>
          <div className="max-w-[68ch]">
            <p className="eyebrow">Chapter IV · Geocentric Models</p>
            <p className="mt-3">
              The golem does not know what a line is. It knows a mean that
              drifts with a predictor, a spread that does not, and 1,000
              addresses in parameter space where both feel plausible. Ask it
              for the height of a person weighing 50 kg and it hands you not a
              number but a crowd of them — figures like 159.2, 160.1, 158.8 —
              each one a vote from the posterior.
            </p>
            <p className="mt-1 text-xs text-secondary">
              STIX Two Text 17px/1.65 · old-style figures in prose · 65–72ch measure
            </p>
          </div>
          <div>
            <code className="block max-w-[68ch] rounded-card border border-line bg-surface p-4 text-sm">
              m4.3 &lt;- brm(height ~ 1 + weight_c, family = gaussian, ...)
              <br />
              <span className="text-secondary"># rhat 1.001 · bulk-ESS 3847 · 2000 draws</span>
            </code>
            <p className="mt-1 text-xs text-secondary">
              IBM Plex Mono · code, axis ticks, diagnostics · tabular figures
            </p>
          </div>
        </div>
      </Section>

      <Section title="Surfaces & controls">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-64 rounded-card border border-line bg-surface p-5">
            <p className="eyebrow">Card</p>
            <p className="mt-2 text-sm text-secondary">
              2px corners, hairline border, raised ink.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-card border border-accent px-5 py-2 text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950"
          >
            Forge the golem
          </button>
          <button
            type="button"
            className="eyebrow cursor-pointer rounded-control border border-line px-4 py-1 transition-colors duration-[180ms] hover:border-accent"
          >
            Small control
          </button>
          <a href="#top">A link, in verdigris</a>
        </div>
      </Section>
    </div>
  )
}
