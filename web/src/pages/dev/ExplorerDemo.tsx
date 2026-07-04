import { useEffect, useState } from 'react'
import { PosteriorExplorer } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import type { ExplorerDraws } from '../../components/interactives/posterior-explorer/PosteriorExplorer'
import { RNG } from '../../lib/rng'
import { adults, fitM43, loadHowell } from '../../content/models/howell'

interface Ready {
  draws: ExplorerDraws
  xbar: number
  data: { x: number; y: number }[]
}

export function ExplorerDemo() {
  const [state, setState] = useState<Ready | null>(null)

  useEffect(() => {
    let cancelled = false
    loadHowell().then((rows) => {
      if (cancelled) return
      const grown = adults(rows)
      const fit = fitM43(grown)
      const draws = fit.draws(4000, new RNG(1959)) as unknown as ExplorerDraws
      setState({
        draws,
        xbar: fit.xbar,
        data: grown.map((r) => ({ x: r.weight, y: r.height })),
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · posterior explorer</p>
      <h1 className="mt-4 font-display text-2xl">m4.3, opened up</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Height against weight for 352 !Kung adults, fit by quadratic
        approximation in your browser — the same method the book uses for
        this chapter. Brass is the posterior; plum is simulation; bone is
        people.
      </p>
      <div className="mt-10 max-w-[900px]">
        {state ? (
          <PosteriorExplorer
            draws={state.draws}
            xbar={state.xbar}
            data={state.data}
            xLabel="weight (kg)"
            yLabel="height (cm)"
            xRange={[31, 63]}
          />
        ) : (
          <p className="text-sm text-secondary">
            Fitting the Gaussian golem to 352 adults…
          </p>
        )}
      </div>
    </div>
  )
}
