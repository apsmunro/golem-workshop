# DESIGN_NOTES.md — visual decision log

Append-only. Every UI-touching session adds an entry: what changed, screenshots, what was rejected and why.

## 001 — Founding direction (pre-code)
Direction: "The Astronomer's Workshop" — Prague golem mythology, Orloj, engraved instruments. Midnight ink ground, brass/verdigris/clay/plum accents, Gloock + STIX Two Text + IBM Plex Mono. Signature: LivingPosterior generative chapter headers (real draws as drifting brass curves) + one ceremonial forging animation. Semantic stat palette is load-bearing pedagogy: data=bone, prior=verdigris, posterior=brass, simulation=plum, danger=clay.
Rejected: cream+terracotta editorial serif look (generic AI default, and clashes with dark-workshop identity); neon-on-black tech aesthetic (wrong world — this is brass and candlelight, not cyberpunk); imitating McElreath's lecture-slide style directly (his identity, not ours).
Watchpoints for future sessions: brass on ink fails contrast at small sizes — use --brass-200 below ~16px; don't let "engraved" drift into skeuomorphic textures (no paper grain, no leather); density of instrument panels must never leak into reading pages.

## 002 — Phase 0: tokens, type specimen, home stub (2026-07-04)
Shipped: tokens.css (palette + semantic + stat variables, workshop/daylight via `data-theme`), Tailwind v4 theme mapped to the variables, fonts self-hosted via Fontsource, specimen page at `/dev/specimen`, home as a bench ledger (roman numerals in brass, hairline rows, status marks as tiny engraved circles).
Screenshots: `web/shots/dev-specimen-{desktop,mobile}.png`, `web/shots/home-{desktop,mobile}.png` (regenerate with `npm run shot -- /route`; gitignored).
Decisions:
- Semantic layer (`--ground`, `--surface`, `--text-primary`…) sits between palette and components so daylight is a variable swap, not a class swap. Daylight maps `--accent-bright` back to brass-400 — pale brass on bone fails contrast.
- Two hex values live outside the palette table, both documented in place: the `#0B1220` flash guard inline in index.html (first paint before CSS), and daylight `--surface` (#faf6ec), a half-step off bone-100 because ink-800 makes no sense on a bone ground.
- Density curves on the specimen use the exact house treatment from `densityStyle()` so the specimen is contract, not illustration.
Rejected (Chanel rule): "Statistical Rethinking · brms" eyebrow in the top nav — duplicated the hero eyebrow and wrapped to three lines at 390px. The nav is now wordmark + theme toggle only.
Watchpoints: unforged status circles in `--line` are nearly invisible at a glance — deliberate for now (quiet until forged), revisit when real golem SVGs land; daylight mood has no dedicated screenshot pass yet — do one when the first reading page exists.

## 003 — Phase 1: living posteriors, garden, ceremony (2026-07-04)
Shipped: LivingPosterior header (brass bootstrap-KDE curves rising like smoke over the ch 2–3 headers — the signature element works and reads as "this app" instantly); Garden of Forking Data (radial fan, withering branches in `--line` ghosts, posterior bars in brass, prior ticks in verdigris on round 2+); calibration sketch (guess in bone, truth in brass with the 8% house fill); chapter MDX with eyebrow h2s, KaTeX + italic gloss lines, webR cells framed as instruments; golem art (clay strokes, bone engraving, brass eyes) with the fragment-assembly forging ceremony; bestiary grid with empty plinths.
Screenshots: `web/shots/chapter-small-worlds-and-large-worlds-*.png` and preview captures during the session.
Decisions:
- Marble/data dots in the garden use bone (data), never verdigris/brass — the semantic palette stays clean: only the plausibility bars are brass because they *are* the posterior being born.
- Ceremony is a modal with one 1.1s fragment-assembly transition, nothing else moves. Reduced motion: golem appears already assembled.
- Golem bodies stroke in clay-500, engraving hatches in bone-300, eyes in brass-400; unforged state collapses everything to `--line` so the bestiary reads as etched-but-unfired clay.
Rejected: YouTube iframe embeds for lectures (heavy, off-palette chrome; link cards with timestamps instead); drawing the garden past 4^3 leaves (visual noise — the "too dense to draw" message carries the pedagogical point better).
Watchpoints: Sampler Sprite silhouette is the weakest art in the set (body reads bean-like) — redo in the Phase 7 art pass; LivingPosterior left-tail flat segments stack into horizontal hairlines when the posterior has long tails — acceptable engraving texture for Beta(7,4), recheck on multimodal draws; hint-ladder skeleton tier renders raw text, wants mono treatment matched to WebRRunner when the Rosetta toggle lands in Phase 2.

## 004 — Phase 2: DAG sandbox, explorer, ch 4–6 (2026-07-04)
Shipped: DAG sandbox (radial-free hand-placed nodes, brass = conditioned, live path classification with causal/back-door and open/blocked coloring, OLS bias readout on a truth-anchored number line); Prior Predictive Playground (verdigris prior lines, clay for red-zone violators, live "N of 60 predict impossible people"); Posterior Explorer (brass μ band strictly inside plum predictive band, counterfactual slider with its own plum density); Rosetta code toggle; three golems (Gaussian bell-crown, Multivariable three-node feed, Haunted-DAG ghost-over-collider using plum for the unobserved).
Decisions:
- The stat palette earns its keep in the explorer: μ-uncertainty (brass) vs person-uncertainty (plum) are the same distinction color-coded, and the engine test *enforces* the plum band containing the brass one. Color is load-bearing, not decoration.
- DAG unobserved nodes drawn as dashed `--line` circles that reject clicks — you cannot condition on what you did not measure, and the UI makes that physical.
- Bias readout uses clay for "still fooled" and brass for "honest" so the moral reads at a glance without prose.
- Haunted-DAG golem is the first to use plum in body art (the ghost/confounder), extending the "plum = the unseen simulated thing" logic from charts into illustration.
Rejected: auto-laying-out DAGs with a force sim (nodes drifted unpredictably and broke the hand-tuned compositions); showing numeric coefficients on DAG edges (clutter — the story is which doors are open, not the betas).
Watchpoints: Multivariable golem's three crown-circles crowd on mobile at 130px — check in the Phase 7 mobile pass; explorer PPC plot has ~350 data points drawn as open circles, fine on desktop but worth thinning on mobile; ForgeCTA needed a module-level EMPTY array to keep its zustand selector identity stable (getSnapshot loop) — remember this pattern for any selector returning `?? []`.
