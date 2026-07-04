import { WebRRunner } from '../../components/code/WebRRunner'

const GRID_CODE = `p_grid <- seq(0, 1, length.out = 20)
prior <- rep(1, 20)
likelihood <- dbinom(6, size = 9, prob = p_grid)
posterior <- likelihood * prior
posterior <- posterior / sum(posterior)
round(posterior, 3)`

const SAMPLE_CODE = `p_grid <- seq(0, 1, length.out = 1000)
posterior <- dbinom(6, size = 9, prob = p_grid)
posterior <- posterior / sum(posterior)
samples <- sample(p_grid, prob = posterior, size = 1e4, replace = TRUE)
mean(samples)
quantile(samples, c(0.055, 0.945))`

export function WebRDemo() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="eyebrow">Workshop back room · webR runner</p>
      <h1 className="mt-4 font-display text-2xl">Real R, in the page</h1>
      <p className="mt-4 max-w-[62ch] text-secondary">
        Editable cells running R compiled to WASM. The engine loads once on
        first run and is shared by every cell on the page. The session is
        seeded with 1959 so draws reproduce.
      </p>
      <div className="mt-10 max-w-[760px] space-y-8">
        <WebRRunner
          caption="Grid approximation, 20 points, globe 6 of 9"
          code={GRID_CODE}
          expect={['0.000']}
        />
        <WebRRunner
          caption="Sampling the posterior"
          code={SAMPLE_CODE}
          rows={7}
        />
      </div>
    </div>
  )
}
