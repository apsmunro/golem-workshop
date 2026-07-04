# PROGRESS.md — build state

Claude Code: read this first each session. Tick items as completed. Log blockers and plan-§8 decisions under "Decisions needed". Keep entries terse.

## Phase 0 — Skeleton
- [ ] Vite + React + TS + Tailwind scaffold in `web/`; strict TS config
- [ ] tokens.css with full palette/type tokens from CLAUDE.md §2.2; fonts self-hosted (Gloock, STIX Two Text, IBM Plex Mono)
- [ ] ChapterShell layout + router; ProgressMap stub home
- [ ] Zustand stores (progress, bestiary, calibration, srs, settings) with localStorage persistence + export/import
- [ ] plot-theme.ts with semantic stat palette helper
- [ ] Playwright `npm run shot` script; `npm run lint:prose` from scripts/banned-words.txt
- [ ] GH Pages deploy workflow green
- [ ] DESIGN_NOTES entry 002: screenshots of tokens/type specimen page

## Phase 1 — Ch. 1–3 vertical slice
- [ ] LivingPosterior header component (canvas, reduced-motion fallback)
- [ ] Garden of Forking Data interactive (engine + tests + /dev route)
- [ ] webR runner: lazy load, editable cells, seeded, loading-golem state
- [ ] Ch. 1–3 MDX content (original prose; lecture embeds from lectures.json)
- [ ] Hint ladder + practice UI wired to problems.json (ch 2–3)
- [ ] Calibration sketch v1 + scoring
- [ ] Globe-Tossing Golem + Sampler Sprite art; forging ceremony v1

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

## Session log
- 000: repo initialized with plan, CLAUDE.md, course data manifests, this file.
