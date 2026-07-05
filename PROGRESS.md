# PROGRESS.md — build state

Claude Code: read this first each session. Tick items as completed. Log blockers and plan-§8 decisions under "Decisions needed". Keep entries terse.

## Phase 0 — Skeleton
- [x] Vite + React + TS + Tailwind scaffold in `web/`; strict TS config
- [x] tokens.css with full palette/type tokens from CLAUDE.md §2.2; fonts self-hosted (Gloock, STIX Two Text, IBM Plex Mono)
- [x] ChapterShell layout + router; ProgressMap stub home
- [x] Zustand stores (progress, bestiary, calibration, srs, settings) with localStorage persistence + export/import
- [x] plot-theme.ts with semantic stat palette helper
- [x] Playwright `npm run shot` script; `npm run lint:prose` from scripts/banned-words.txt
- [ ] GH Pages deploy workflow green — workflow written (.github/workflows/deploy.yml); needs a GitHub remote + Pages enabled to verify
- [x] DESIGN_NOTES entry 002: screenshots of tokens/type specimen page

## Phase 1 — Ch. 1–3 vertical slice
- [x] LivingPosterior header component (canvas, reduced-motion fallback)
- [x] Garden of Forking Data interactive (engine + tests + /dev route)
- [x] webR runner: lazy load, editable cells, seeded, loading-golem state
- [x] Ch. 1–3 MDX content (original prose; lecture links from lectures.json — link cards with timestamps, not iframes)
- [x] Hint ladder + practice UI wired to problems.json (ch 2–3, full original ladders for all 33 problems)
- [x] Calibration sketch v1 + scoring (1 − TV; ch02 globe prompt wired into chapter 2)
- [x] Globe-Tossing Golem + Sampler Sprite art; forging ceremony v1; /bestiary route + ForgeCTA gate

## Phase 2 — Ch. 4–6
- [x] Prior Predictive Playground (config-driven, red-zone overlays)
- [x] DAG engine (d-separation, adjustment sets) + property tests vs known DAGs
- [x] DAG Sandbox UI + simulate-from-DAG bias demos; presets (waffles, milk, fungus, grandparents)
- [x] r-pipeline scaffold (renv, Makefile, get_data.R) + fit/export scripts m4.x–m5.x; validating web loader. NOTE: scripts written but not executed here (needs R+cmdstan on a real machine); chapters run on the in-browser quap engine meanwhile.
- [x] Posterior Explorer v1 (densities, pairs, PPC overlays, counterfactual slider)
- [x] Rosetta toggle (quap/ulam ↔ brms) component
- [x] Ch. 4–6 content, practice (full ladders 4E–4H4, 5E–5H4, 6E–6H5), golems (Gaussian, Multivariable, Haunted-DAG)

## Phase 3 — Ch. 7–9
- [x] Overfit-the-polynomial game; LOO/WAIC comparison UI (exact LOO by refitting; ModelComparison table reusable for T3)
- [x] Interaction surface visualizer (tulips, rugged; OLS engine with honest bands; quote-aware CSV parser)
- [x] HMC Physics Toy (leapfrog viz, ε/L knobs, divergence behavior; funnel preset ready for ch 13)
- [x] Trace-plot triage game (real split-R̂ + ESS computed per round)
- [x] Pipeline m7–m9 scripts; Ch. 7–9 content, practice (46 ladders), golems. NOTE: like Phase 2, fit scripts written but not executed (needs R+cmdstan); ch 8 interactives run on the in-browser OLS engine meanwhile.

## Phase 4 — Ch. 10–12
- [x] Entropy pebble simulator (exact multiplicities, maxent tilt); link-function morpher (logit/log, live morph)
- [x] Binomial/Poisson explorers: chimp (m11.4 quap in-browser), admit paradox (m11.7/m11.8 total vs direct), Kline (m11.10) + monastery offset lab
- [x] Ordinal cutpoint dragger (Trolley aggregate, closed-form reveal); zero-inflation mixer (drinking monks, cause-split zeros)
- [x] Pipeline m11–m12 scripts (fit + export param maps); ch 10–12 content, practice (ch10 = 3 workshop drills, ch11 18, ch12 15), golems (GLM Prism, Integer Golem, Monster Mixer). NOTE: fit scripts written not executed (no R+cmdstan); explorers run on the in-browser quap/JS engines meanwhile.

## Phase 5 — Ch. 13–14
- [ ] Shrinkage Theater (reedfrogs, animated pooling morph)
- [ ] Funnel preset in HMC toy + divergence detective; non-centered explainer
- [ ] Correlated varying-effects ellipse explorer; GP kernel playground (islands)
- [ ] Pipeline m13–m14; content, practice, golems

## Phase 6 — Ch. 15–17
- [ ] Measurement-error propagation sim; imputation before/after explorer
- [ ] Scientific-model builder (Howell weight ~ height^3); Lynx–Hare ODE phase portrait (RK4 in JS over posterior draws)
- [ ] Horoscopes capstone: calibration report + bestiary review
- [ ] Pipeline m15–m16; content, practice, golems

## Phase 7 — Polish
- [ ] SRS decks authored for all chapters (YAML)
- [ ] Bestiary art pass; a11y audit; Lighthouse ≥ 90 all routes
- [ ] Mobile pass on every interactive; export/import progress tested

## Decisions needed
- (plan §8 items land here when reached)
- No GitHub remote configured yet. Deploy workflow is committed but unverified; create the repo, push main, enable Pages (Source: GitHub Actions) to close the last Phase 0 box.

## Session log
- 005 (2026-07-05): Phase 4 built. Ch 10: entropy pebbles (exact W matches book table 1/90/1260/37800/113400, maxent by exponential tilt; verified E→113,400 in browser) + link morpher (verified straight line at t=0 morphs to logistic S at t=1, η gridlines bunch, probe reads η=1.80→p=0.858 slope 0.146). Ch 11: chimp explorer (m11.4 fit by 11-param quap in-browser, matches book b1..b4; partner contrasts straddle zero, actor 2 pinned ~1.0), admit paradox (m11.7/m11.8 total +0.61 vs direct ≈−0.1, clay→brass on conditioning), Kline Poisson (m11.10 curves + monastery offset lab, exact 7× inflation). Ch 12: cutpoint dragger (Trolley 9,930-judgment aggregate, reveal → 100% match via closed-form logit-of-cumulative, book m12.4 cutpoints ±0.03) + zero-inflation mixer (P(0) decomposition 0.20+0.29=0.49 verified, naive λ̂ estimates (1−p)λ). Three golems in house style; ch10 forge unlocks via 3 original workshop drills (no book practice). r-pipeline extended m11.4/7/8/10, m12.1/3/4/5 with export param maps. 211 tests (was 144), build, prose-lint green. New watchpoint: chimp contrast labels moved to fixed top-left corners to avoid peak-overlap collision.
- 004 (2026-07-04): Phase 3 built. Overfit game (OLS polys + exact LOO, verified reveal flow + comparison table in browser); interaction surface (verified rugged sign flip −0.15 → +0.14 and tulips water slope +0.21 in browser; fixed rugged.csv quoted-semicolon parsing); HMC toy (leapfrog + Metropolis + |ΔH|>50 divergences, verified 100% acceptance at ε=0.18 and 8/9 divergences at ε=2.6; smooth bitmap density background); trace triage (5 ailments, split-R̂/ESS engines); ch 7–9 MDX + 46 hint ladders + 3 golems (compass/manatee/engine core); ch 9 living posterior runs the toy's own HMC; r-pipeline extended m8.1–m8.5, m9.1, ch7 loo criteria + comparison artifact. 144 tests, build, prose-lint green.
- 000: repo initialized with plan, CLAUDE.md, course data manifests, this file.
- 001 (2026-07-04): Phase 0 built. git init; web/ scaffold (Vite 6, React 18, TS strict, Tailwind 4); tokens.css + global.css; Layout/ChapterShell/Home/ChapterPage/dev specimen; workshop store (5 slices, persist v1, export/import) with 14 passing tests; plot-theme.ts; shot + prose-lint scripts; deploy workflow. Build, tests, prose-lint all green.
- 003 (2026-07-04): Phase 2 built. DAG engine (d-sep + minimal backdoor sets, validated: waffles → {S},{A,M}; milk → {M}; fungus/grandparents); DAG sandbox with linear-Gaussian simulate + OLS bias readout (verified waffles unadjusted 1.52 → adjusted-on-S 0.01 in browser); quap engine (Nelder-Mead MAP + numeric Hessian + Cholesky MVN, matches m4.1/m4.3 published numbers); Prior Predictive Playground; Posterior Explorer (m4.3, verified a/b/sigma marginals + 50kg→159cm counterfactual); Rosetta toggle; r-pipeline scaffold + posterior-artifact loader with rhat/ESS gates; ch 4–6 MDX + 3 golems + hint ladders. 104 tests, build, prose-lint green. Fixed ForgeCTA selector identity churn and Gloss <p>-nesting warnings.
- 002 (2026-07-04): Phase 1 built, same session. rng (PCG32) + stats libs; LivingPosterior (bootstrap-KDE smoke, wired to ch 2–3 globe draws); Garden of Forking Data (counts verified 0/3/8/9/0 and sequential 0/3/16/27/0 in-browser); calibration sketch (94.2% on faithful trace, persists); practice system with 33 original hint ladders; webR runner (verified real R eval in browser); MDX + KaTeX pipeline with original ch 1–3 prose; golem art + forging ceremony + bestiary. 57 tests, build, prose-lint green. Chapter completion rule v1: all hint-laddered problems marked complete → ForgeCTA unlocks.
