# r-pipeline

Fits the course models with brms + cmdstanr and exports posterior
artifacts the web app can load. Runs on a human's machine with R — the
web repo never commits fitted objects, only the exported JSON artifacts
in `web/public/data/posteriors/`.

## Requirements

- R ≥ 4.3
- A C++ toolchain (RTools on Windows; setup.R checks and says what's missing)
- ~45 minutes first run: cmdstan compile plus all 26 fits (validated on
  Windows, R 4.5.0 + RTools45 + cmdstan 2.39, session 010)

## Setup and run

```sh
Rscript setup.R      # installs brms + cmdstanr (Stan r-universe repo) and builds cmdstan
make data            # downloads rethinking datasets into data/
make fits            # fits m4.x–m16.1 (seed 1959, backend cmdstanr)
make export          # writes ../web/public/data/posteriors/*.json
```

`make all` does the lot. Fits are cached as .rds under fits/ (gitignored —
only the exported artifacts are committed) and only re-run when deleted.

## Correctness gates (CLAUDE.md §5)

- Every fit must pass rhat < 1.01 and bulk-ESS > 400 for all parameters
  before export; `export_draws.R` stops with an error otherwise.
- Diagnostics are written INTO the artifact; the web loader
  (`web/src/lib/posterior-artifact.ts`) re-checks them and refuses
  artifacts that fail schema or thresholds. Belt and braces.
- Priors are explicit in every `brm()` call. No silent defaults.

## Artifact schema

`golem-workshop/posterior@1`:

```json
{
  "schema": "golem-workshop/posterior@1",
  "model": "m4.3",
  "chapter": 4,
  "seed": 1959,
  "engine": "brms",
  "created": "2026-07-04T12:00:00Z",
  "data": { "name": "Howell1", "n": 352 },
  "params": ["a", "b", "sigma"],
  "draws": { "a": [/* 2000 numbers */], "b": [], "sigma": [] },
  "diagnostics": { "a": { "rhat": 1.001, "ess_bulk": 3847 } }
}
```

Draws are thinned to 2000 per parameter to keep artifacts a few hundred
kB. Parameter names are the course names (a, b, sigma), mapped from
brms internals (b_Intercept, …) in the exporter — learners never see
`b_b` gibberish.

## Until this runs

Chapters 4–8 draw from the in-browser quap engine
(`web/src/lib/quap.ts`) — the book's own method for those chapters,
validated against its published numbers. Artifacts replace quap per
model as they land; the swap point is `web/src/content/models/`.
