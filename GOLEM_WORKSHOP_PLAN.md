# The Golem Workshop — Build Plan

An interactive web course companion for *Statistical Rethinking* (2nd ed., McElreath), rebuilt around **brms** as the modeling engine. This document is the master plan for Claude Code. Read it fully before writing code. Work phase by phase; each phase ends with a working, deployable state.

---

## 1. Vision & Pedagogy Principles

The app is a **workshop, not a textbook**. The user already owns the book and watches the lectures. The app's job is the part a book can't do: manipulate, simulate, predict, and get feedback.

Design principles (enforce these in every component):

1. **Predict before reveal.** Wherever a result can be shown, first ask the learner to guess (sketch a posterior, pick a direction of bias, estimate an interval). Score calibration over time.
2. **Every model is a golem.** Chapter progress = golems forged. Golems are collectible, revisitable, and re-fittable with new powers learned in later chapters.
3. **brms is the native language.** All code shown is idiomatic brms/tidyverse. Book code (`quap`/`ulam`) appears only in a collapsible "book dialect" toggle for cross-reference.
4. **Simulation over derivation.** Prefer sliders + live simulation to equations. Equations available on demand.
5. **Struggle is scaffolded, not removed.** Practice problems reveal help in tiers (concept → strategy → code skeleton → full solution). Never show the answer first.

### Copyright constraints (hard requirements)

The book and solutions manual are copyrighted. The app will be hosted publicly, so:

- **Do NOT reproduce book prose, figures, or solution text.** All explanations must be original writing.
- Practice problems are **referenced by ID** (e.g., "4M1 — see book p. 120") with an original one-line paraphrase of the task at most; the learner works from their own copy of the book.
- Solutions in the app are **original brms translations and original commentary**, not the manual's text or its `rethinking`-package code.
- Datasets: use the versions published in the open-source `rethinking` R package repo (they are distributed freely there); ship as CSV in `/data`.
- Lecture videos: **embed/link the official YouTube lectures** (Statistical Rethinking 2023/2024 playlists) with timestamps. Never re-host.
- Optional cross-links to Solomon Kurz's open online brms translation of the book for readers who want prose depth.

---

## 2. Architecture

**Static-first.** No server. Hostable on GitHub Pages / Netlify / Cloudflare Pages for free.

```
┌──────────────────────────────────────────────────────┐
│  React + Vite + TypeScript SPA (static site)          │
│  ├─ Interactive components (D3 + custom canvas)       │
│  ├─ webR (WASM R) — runs real R in-browser for        │
│  │   grid approximation / simulation chapters (2–4)   │
│  └─ Posterior Explorer — loads precomputed brms       │
│      draws (Apache Arrow / compressed JSON)           │
└──────────────────────────────────────────────────────┘
             ▲
             │ build-time artifacts
┌──────────────────────────────────────────────────────┐
│  R pipeline (runs locally / in CI, NOT in browser)    │
│  ├─ /r-pipeline: fits every course model with brms    │
│  ├─ exports thinned posterior draws + summaries       │
│  └─ exports prior-predictive grids for sliders        │
└──────────────────────────────────────────────────────┘
```

Why: brms requires Stan (C++ compilation) and cannot run in a browser. But the *pedagogy* rarely needs live MCMC — it needs live **exploration of posteriors** and live **simulation from priors**. Both work from precomputed draws or pure-JS/webR simulation.

Three execution tiers, used per-component:

| Tier | What runs | Used for |
|------|-----------|----------|
| T1: Pure JS/TS | jStat/custom samplers, D3 | Sliders, garden of forking data, DAG logic, HMC toy, all animations |
| T2: webR (WASM) | Real R in browser | Ch. 2–4 grid approximation, `rbinom`/`rnorm` simulation, letting learners edit & run real R |
| T3: Precomputed | brms fits done offline | Every `ulam`-era model (Ch. 9+), posterior explorer, LOO/WAIC comparisons |

Every T3 model page also has a **"Run this yourself"** panel: a complete, copyable brms script + a `renv.lock`-pinned setup snippet, so the learner can reproduce locally.

### Tech stack

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Zustand (state), React Router.
- **Viz:** D3 for bespoke interactives; Observable Plot for standard charts; HTML canvas for the HMC physics toy and garden animation.
- **R runtime:** webR loaded lazily only on pages that need it (it's ~15MB; show a loading golem).
- **Data format:** posterior draws as gzipped column-oriented JSON (or Arrow IPC if size demands), one file per model, thinned to ≤2,000 draws/parameter. Target ≤300KB per model file.
- **Persistence:** localStorage for progress, calibration scores, bestiary, spaced-repetition schedule. Export/import as JSON so nothing is lost.
- **Testing:** Vitest + React Testing Library; R pipeline validated with `testthat` sanity checks (rhat < 1.01, ESS thresholds).

### Repo structure

```
golem-workshop/
├── GOLEM_WORKSHOP_PLAN.md        # this file
├── CLAUDE.md                     # working notes / conventions for Claude Code
├── web/                          # Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── core/             # layout, nav, ChapterShell, ProgressMap
│   │   │   ├── interactives/     # one folder per interactive (see §4)
│   │   │   ├── code/             # CodePane, RosettaToggle, WebRRunner
│   │   │   └── practice/         # ProblemCard, HintLadder, CalibrationSketch
│   │   ├── content/              # chapter content as MDX (original prose only)
│   │   ├── models/               # TS types + loaders for posterior artifacts
│   │   ├── store/                # Zustand slices: progress, bestiary, srs
│   │   └── lib/                  # samplers, dag-engine, stats utils
│   └── public/
│       ├── posteriors/           # gzipped draw files from r-pipeline
│       └── data/                 # course datasets (from rethinking pkg repo)
├── r-pipeline/
│   ├── fits/                     # one script per chapter: fit_ch04.R ...
│   ├── export/                   # draws → JSON/Arrow exporters
│   ├── renv.lock
│   └── Makefile                  # `make ch04` etc.
└── .github/workflows/deploy.yml  # build web/ → Pages
```

---

## 3. Course Map

Full chapter/section structure (2nd edition). Each chapter gets: an MDX content page, its interactives, a golem to forge, practice problems with hint ladders, and lecture links.

| Ch | Title | Key sections | Signature interactive(s) | Golem forged |
|----|-------|--------------|--------------------------|--------------|
| 1 | The Golem of Prague | Statistical golems; rethinking; tools | Intro tour; bestiary opens | — (workshop key) |
| 2 | Small Worlds and Large Worlds | Garden of forking data; building a model; components; making it go | **Garden of Forking Data** tree (T1); grid-approx lab (T2) | Globe-Tossing Golem |
| 3 | Sampling the Imaginary | Sampling posteriors; summarizing; simulating prediction | Sampling playground (T2); interval-picker game | Sampler Sprite |
| 4 | Geocentric Models | Normal dists; model language; height model; linear prediction; curves | **Prior Predictive Playground** (T1/T2); spline bender | Gaussian Golem |
| 5 | The Many Variables & The Spurious Waffles | Spurious association; masked relationships; categorical vars | **DAG Sandbox** v1 (T1); waffle-house spuriousness sim | Multivariable Golem |
| 6 | The Haunted DAG & The Causal Terror | Multicollinearity; post-treatment; collider; confounding | DAG Sandbox v2: colliders open/close paths live; backdoor hunt game | Haunted DAG charm |
| 7 | Ulysses' Compass | Parameters problem; entropy & accuracy; regularization; predictive accuracy; comparison | Overfit-the-polynomial game; LOO/WAIC comparison table from real fits (T3) | Compass of Ulysses |
| 8 | Conditional Manatees | Building interactions; symmetry; continuous interactions | Interaction surface visualizer (tulips/rugged data, T3) | Manatee Golem |
| 9 | Markov Chain Monte Carlo | King Markov; Metropolis; HMC; ulam→brm; chain care | **HMC Physics Toy** (T1); trace-plot triage game (diagnose bad chains) | MCMC Engine core |
| 10 | Big Entropy and the GLM | Max entropy; GLMs; maxent priors | Entropy pebble simulator; link-function morpher | GLM Prism |
| 11 | God Spiked the Integers | Binomial; Poisson; multinomial | Chimp-experiment posterior explorer (T3); offset/exposure slider | Integer Golem |
| 12 | Monsters and Mixtures | Over-dispersion; zero-inflation; ordered categorical (out & in) | Zero-inflation mixture visualizer; cutpoint dragger for ordinal models | Monster Mixer |
| 13 | Models With Memory | Multilevel tadpoles; under/overfitting trade-off; multiple clusters; divergences; predictions | **Shrinkage Theater** (pool none/partial/complete, animated); divergence detective | Memory Golem |
| 14 | Adventures in Covariance | Varying slopes; advanced; instruments; social relations; Gaussian processes | Correlated varying-effects ellipse explorer; GP kernel playground (islands) | Covariance Hydra |
| 15 | Missing Data and Other Opportunities | Measurement error; missing data; categorical errors | Error-bar propagation sim; imputation before/after explorer | Phantom Golem |
| 16 | Generalized Linear Madness | Geometric people; hidden minds; ODE nut cracking; population dynamics | Scientific-model builder (height³ weight); Lynx-hare ODE phase portrait | Mad Scientist Golem |
| 17 | Horoscopes | Course capstone/reflection | Final calibration report; bestiary review; "what your golems can't do" essay prompts | Workshop Master seal |

Practice problems: reference IDs per chapter from the book (2.x, 3.x, … 16.x; solutions manual covers Ch. 2–9 and 11–16 — note Ch. 10 has no practice section). Each problem gets an original brms-based solution written fresh (validated against the manual's *results*, not its text).

Lecture mapping: use the *Statistical Rethinking 2023* playlist (20 lectures) — maintain a `lectures.json` mapping `{chapter, section} → {videoId, timestamp}`.

---

## 4. Interactive Component Specs

Build each as an isolated folder with its own README, types, and tests. Priority order below matches build phases.

### 4.1 Garden of Forking Data (Ch. 2) — T1
- Canvas/SVG tree of possible data paths for the marble/globe example.
- Learner clicks observed data; incompatible branches wither (animated); path counts update; bar of plausibilities normalizes into a posterior.
- Modes: marbles (4 marbles, W/B), globe tossing (W/L sequences).
- "Update again" button chains observations to show sequential Bayesian updating.

### 4.2 Prior Predictive Playground (Ch. 4, reused everywhere) — T1/T2
- Left: model spec with sliders for prior hyperparameters (e.g., β ~ Normal(μ, σ)).
- Right: 100 simulated regression lines / outcome histograms, re-drawn live.
- Red-zone overlays for absurd implications ("4m humans", "negative heights").
- Component API takes a model config object so later chapters reuse it (Poisson rates, log-odds scales — include the logit-scale prior trap demo from Ch. 11).

### 4.3 DAG Sandbox (Ch. 5–6, reused in 14–15) — T1
- Node/edge editor (click to add, drag to connect, tap edge to flip/delete).
- Engine implements d-separation: computes open/blocked paths, minimal adjustment sets (port the logic, not the code, of daggity's algorithm; write our own TS implementation with tests).
- "Simulate" button: generates synthetic data from the DAG's structural equations and shows the regression coefficient you'd get under different conditioning choices — the collider bias *appears in front of you*.
- Preset scenarios: divorce/waffles, milk/neocortex, grandparents-education (Ch. 6), post-treatment fungus.

### 4.4 HMC Physics Toy (Ch. 9) — T1
- Canvas: 2D posterior surface (correlated Gaussian; funnel for Ch. 13 reuse).
- A marble given random momentum flicks; leapfrog integration visualized step by step.
- Knobs: step size ε, number of leapfrog steps L, mass. Show divergences (marble flies off) when ε too big — foreshadows Ch. 13's non-centered priors, where the funnel preset shows divergences clustering in the neck.
- Side panel: trace plot + acceptance rate building up live.

### 4.5 Posterior Explorer (Ch. 7+) — T3
- Loads a precomputed brms fit artifact: draws, summary, LOO.
- Views: marginal densities, pair plots (hex), trace plots, posterior predictive overlays vs. raw data, counterfactual sliders (set predictor values → push draws through link function live in JS).
- Every explorer shows the exact `brm()` call that produced it + "Run this yourself" script.

### 4.6 Shrinkage Theater (Ch. 13) — T3 + T1 animation
- Tadpole tanks (reedfrog data): three columns — no pooling, partial pooling, complete pooling.
- Animated morph between estimates; point size = tank sample size; lines show shrinkage toward grand mean, stronger for small tanks.
- Slider: fake "prior tightness" to feel the under/overfit trade-off.

### 4.7 Calibration Sketch + Guess-the-Posterior — T1
- Freehand-draw a density over a labeled axis before any reveal; app scores overlap (e.g., 1 − total variation distance vs. truth) and logs it.
- Cross-app calibration dashboard: "your intervals are too narrow 68% of the time" style feedback.

### 4.8 Hint Ladder / Practice System — T1
- Per problem: tiers = [Concept nudge] → [Strategy] → [brms code skeleton with blanks] → [Full worked solution + interpretation].
- Tier unlock is click-gated with a gentle "try first" timer suggestion; all original content.
- Marks problem complete → feeds progress map + spaced repetition deck.

### 4.9 Spaced Repetition (global) — T1
- Card types: concept (front/back), trap identification (show a scenario, name the bias), code reading (what does this `brm()` fit?).
- SM-2 scheduling in localStorage; daily review page; cards authored in YAML per chapter.

### 4.10 Bestiary & Progress Map — T1
- Home screen: the workshop. Chapters as benches on a winding path; golems appear as SVG creatures with states (unforged/forged/upgraded).
- Golem detail page: the model family, its brms formula signature, chapters where it evolved, links back to its explorers.

---

## 5. R Pipeline Spec (`r-pipeline/`)

- One script per chapter (`fit_ch05.R` …) that: loads dataset(s) → fits every named model in brms (mirror book model names: `m5.1`, `m11.4`, etc.) → runs diagnostics (`rhat`, `ess_bulk`, LOO) → exports.
- Export format per model (`export/export_fit.R`):
  ```json
  {
    "id": "m13.2", "chapter": 13,
    "formula": "surv | trials(density) ~ 1 + (1 | tank)",
    "family": "binomial", "priors": [...],
    "data_file": "reedfrogs.csv",
    "draws": {"b_Intercept": [...], "sd_tank__Intercept": [...]},
    "summary": [...], "loo": {...}, "diagnostics": {...}
  }
  ```
- Thin to ≤2,000 draws; gzip; verify each file ≤300KB (drop pair-plot-only params if needed, keep a manifest).
- brms conventions: `backend = "cmdstanr"`, `seed = 1959` (Golem of Prague film year — a nice touch), `adapt_delta` raised where the book flags divergences, non-centered handled by brms defaults (note this explicitly in Ch. 13 content).
- `Makefile` targets per chapter; CI does **not** refit (too slow) — artifacts are committed.

Datasets: pull CSVs from the `rethinking` package GitHub repo data folder (Howell1, WaffleDivorce, milk, rugged, tulips, chimpanzees, UCBadmit, Kline, Trolley, reedfrogs, chimpanzees, KosterLeckie, islandsDistMatrix, Primates301, Lynx_Hare, etc.). Script: `r-pipeline/get_data.R`.

---

## 6. Build Phases (Claude Code milestones)

Each phase must end green: builds, tests pass, deployable.

**Phase 0 — Skeleton (½ day):** Vite + TS + Tailwind + Router scaffold; ChapterShell layout; progress store; deploy workflow to Pages; lectures.json stub; CLAUDE.md with conventions.

**Phase 1 — Chapters 1–3 vertical slice:** Garden of Forking Data; webR runner component (lazy-load, editable code cells with expected-output checks); Ch. 2–3 content in MDX; hint ladder + first practice problems (2E1–2M7, 3E1–3H5 referenced by ID); calibration sketch v1. *This slice proves every core pattern.*

**Phase 2 — Ch. 4–6 (the regression heart):** Prior Predictive Playground; DAG Sandbox + d-separation engine (heavy testing here — property-based tests against known adjustment sets); r-pipeline for m4.x–m6.x; Posterior Explorer v1; Rosetta toggle (quap → brm).

**Phase 3 — Ch. 7–9:** LOO/WAIC comparison UI; overfitting game; interaction surfaces; HMC Physics Toy; trace-triage game; pipeline for m7–m9.

**Phase 4 — Ch. 10–12:** GLM link morpher; Poisson/binomial explorers; ordinal cutpoint dragger; zero-inflation mixer; pipeline m10–m12.

**Phase 5 — Ch. 13–14:** Shrinkage Theater; funnel preset in HMC toy + divergence detective; correlated effects ellipse; GP kernel playground; pipeline m13–m14 (watch fit times; cache aggressively).

**Phase 6 — Ch. 15–17:** measurement-error and imputation explorers; scientific-model builder; ODE phase portrait (solve in JS with RK4 against posterior parameter draws); Horoscopes capstone + calibration report.

**Phase 7 — Polish:** spaced-repetition deck authoring for all chapters; bestiary art pass (inline SVG, no external assets); a11y audit (keyboard for all interactives, reduced-motion mode); Lighthouse ≥90; export/import progress.

---

## 7. Conventions for Claude Code

- TypeScript strict; no `any` in `lib/` or `interactives/`.
- Every interactive: `README.md` (pedagogical goal + interaction spec), unit tests for its engine logic (samplers, d-sep, scoring), Storybook-style demo route under `/dev`.
- Original prose only in `content/` — when drafting chapter text, write from understanding of the concepts; cite the book by section number for the learner to read alongside. Run a "no long verbatim strings from PDFs" check in CI against a keyword list.
- Statistical correctness gates: any JS re-implementation of a distribution or sampler gets tested against known quantiles; posterior-artifact loaders validate schema + diagnostics thresholds.
- Performance: lazy-load webR and heavy draw files per route; interactives target 60fps on mid-range laptop; posterior files fetched with cache headers.
- Commit style: one phase-task per PR-sized commit; update a `PROGRESS.md` checklist derived from §6.

## 8. Open Decisions (ask the user when reached)

1. Arrow IPC vs. gzipped JSON for draws (decide when first file exceeds 300KB).
2. Host learner progress purely local vs. optional GitHub Gist sync.
3. Whether to add a Colab/Binder "live fit" button per model (nice-to-have, Phase 7).
4. 2023 vs. 2024 lecture playlist as the canonical mapping.
