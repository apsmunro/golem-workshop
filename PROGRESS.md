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
- [ ] Prior Predictive Playground (config-driven, red-zone overlays)
- [ ] DAG engine (d-separation, adjustment sets) + property tests vs known DAGs
- [ ] DAG Sandbox UI + simulate-from-DAG bias demos; presets (waffles, milk, fungus, grandparents)
- [ ] r-pipeline scaffold (renv, Makefile, get_data.R) + fits/exports m4.x–m6.x
- [ ] Posterior Explorer v1 (densities, pairs, PPC overlays, counterfactual sliders)
- [ ] Rosetta toggle (quap/ulam ↔ brms) component
- [ ] Ch. 4–6 content, practice, golems

## Phase 3 — Ch. 7–9
- [ ] Overfit-the-polynomial game; LOO/WAIC comparison UI
- [ ] Interaction surface visualizer (tulips, rugged)
- [ ] HMC Physics Toy (leapfrog viz, ε/L knobs, divergence behavior)
- [ ] Trace-plot triage game
- [ ] Pipeline m7–m9; Ch. 7–9 content, practice, golems

## Phase 4 — Ch. 10–12
- [ ] Entropy pebble simulator; link-function morpher
- [ ] Binomial/Poisson explorers (chimpanzees, UCBadmit, Kline); offset slider
- [ ] Ordinal cutpoint dragger (Trolley); zero-inflation mixer
- [ ] Pipeline m11–m12; content, practice, golems (note: ch 10 has no practice section)

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
- 000: repo initialized with plan, CLAUDE.md, course data manifests, this file.
- 001 (2026-07-04): Phase 0 built. git init; web/ scaffold (Vite 6, React 18, TS strict, Tailwind 4); tokens.css + global.css; Layout/ChapterShell/Home/ChapterPage/dev specimen; workshop store (5 slices, persist v1, export/import) with 14 passing tests; plot-theme.ts; shot + prose-lint scripts; deploy workflow. Build, tests, prose-lint all green.
- 002 (2026-07-04): Phase 1 built, same session. rng (PCG32) + stats libs; LivingPosterior (bootstrap-KDE smoke, wired to ch 2–3 globe draws); Garden of Forking Data (counts verified 0/3/8/9/0 and sequential 0/3/16/27/0 in-browser); calibration sketch (94.2% on faithful trace, persists); practice system with 33 original hint ladders; webR runner (verified real R eval in browser); MDX + KaTeX pipeline with original ch 1–3 prose; golem art + forging ceremony + bestiary. 57 tests, build, prose-lint green. Chapter completion rule v1: all hint-laddered problems marked complete → ForgeCTA unlocks.
