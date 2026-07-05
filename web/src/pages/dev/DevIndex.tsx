import { Link } from 'react-router-dom'

const demos = [
  { path: '/dev/specimen', name: 'Tokens & type specimen' },
  { path: '/dev/living-posterior', name: 'Living posterior header' },
  { path: '/dev/garden', name: 'Garden of Forking Data' },
  { path: '/dev/calibration', name: 'Calibration sketch' },
  { path: '/dev/webr', name: 'webR runner' },
  { path: '/dev/ceremony', name: 'Forging ceremony & golem art' },
  { path: '/dev/dag', name: 'DAG sandbox' },
  { path: '/dev/prior', name: 'Prior predictive playground' },
  { path: '/dev/explorer', name: 'Posterior explorer (m4.3)' },
  { path: '/dev/overfit', name: 'Overfit the polynomial' },
  { path: '/dev/interaction', name: 'Interaction surface (rugged, tulips)' },
  { path: '/dev/hmc', name: 'HMC physics toy' },
  { path: '/dev/triage', name: 'Trace-plot triage' },
  { path: '/dev/entropy', name: 'Entropy pebbles' },
  { path: '/dev/link', name: 'Link morpher' },
  { path: '/dev/chimps', name: 'Chimp explorer (m11.4)' },
  { path: '/dev/admit', name: 'Admit paradox (UCBadmit)' },
  { path: '/dev/kline', name: 'Kline Poisson & exposure lab' },
  { path: '/dev/cutpoints', name: 'Cutpoint dragger (Trolley)' },
  { path: '/dev/zip', name: 'Zero-inflation mixer' },
  { path: '/dev/shrinkage', name: 'Shrinkage Theater (reedfrogs)' },
  { path: '/dev/divergence', name: 'Divergence detective (funnel)' },
  { path: '/dev/cafe', name: 'Café ellipse (varying slopes)' },
  { path: '/dev/gp', name: 'GP islands (Oceanic tools)' },
  { path: '/dev/error', name: 'Error-in-variables (divorce)' },
  { path: '/dev/imputation', name: 'Imputation explorer (milk)' },
  { path: '/dev/geometric', name: 'Geometric people (weight ∝ height³)' },
  { path: '/dev/lynxhare', name: 'Lynx–hare ODE phase portrait' },
  { path: '/dev/horoscopes', name: 'Horoscopes capstone' },
]

export function DevIndex() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-28">
      <div className="prose-col">
        <p className="eyebrow">Workshop back room</p>
        <h1 className="mt-4 font-display text-2xl">Component demos</h1>
        <ul className="mt-8 list-none">
          {demos.map((d) => (
            <li key={d.path} className="border-b border-line py-3">
              <Link to={d.path}>{d.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
