import { Link } from 'react-router-dom'

const demos = [
  { path: '/dev/specimen', name: 'Tokens & type specimen' },
  { path: '/dev/living-posterior', name: 'Living posterior header' },
  { path: '/dev/garden', name: 'Garden of Forking Data' },
  { path: '/dev/calibration', name: 'Calibration sketch' },
  { path: '/dev/webr', name: 'webR runner' },
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
