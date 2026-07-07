# CLAUDE.md — The Golem Workshop

Working conventions for Claude Code. Read `GOLEM_WORKSHOP_PLAN.md` first for scope, architecture, and phases. This file governs *how* you work: design, code, content, and quality gates. Where the two conflict on visual matters, **this file wins** — visual excellence is a first-class requirement of this project, equal to statistical correctness.

---

## 1. The one-liner

An interactive web course for *Statistical Rethinking* (2nd ed.) with brms as the engine. A workshop where learners forge model-golems: predict, simulate, get feedback. Static site, React + Vite + TS, D3/canvas interactives, webR for early chapters, precomputed brms posteriors for the rest.

---

## 2. Design North Star

**This app must be stunning.** Not "clean SaaS with nice defaults" — memorable, with a specific point of view. The bar: a screenshot of any page should be identifiable as *this* course and no other product.

### 2.1 Concept: *The Astronomer's Workshop*

The aesthetic world is drawn from the book's own mythology: the Golem of Prague, and Prague itself — the Orloj astronomical clock, alchemists' benches, engraved scientific instruments, candlelit study. Old-world instrument-making meets modern computation. Precision brass on midnight ink. Uncertainty rendered as luminous, drifting density curves — the "smoke" of the workshop.

Two moods, one system:
- **Workshop (default, dark):** deep midnight ink, candlelight brass, instrument engravings. The site's identity.
- **Daylight (toggle):** warm bone/parchment for long reading sessions. Same accents, inverted ground.

### 2.2 Tokens

Define these once in `web/src/styles/tokens.css` and consume everywhere (Tailwind theme extends from CSS variables). No raw hex anywhere else in the codebase.

**Palette**

| Token | Hex | Role |
|---|---|---|
| `--ink-950` | `#0B1220` | Workshop ground (page background, dark) |
| `--ink-800` | `#16223A` | Raised surfaces, cards |
| `--ink-600` | `#2B3A57` | Borders, hairlines, muted UI |
| `--bone-100` | `#F3EDDF` | Daylight ground / primary text on dark |
| `--bone-300` | `#D8CFB8` | Secondary text on dark |
| `--brass-400` | `#C9A227` | Primary accent: actions, highlights, the posterior |
| `--brass-200` | `#E8CE7A` | Brass highlight / hover glow |
| `--verdigris-400` | `#3E8E7E` | Secondary accent: the prior, links |
| `--clay-500` | `#B4552D` | Golem clay: bestiary, warnings, divergences |
| `--plum-500` | `#6E4A7E` | Tertiary: predictive simulation, rare emphasis |

**Semantic statistical palette (sacred — never violate).** Every chart in all 17 chapters uses the same encoding, so color itself teaches:

- **Data** → bone points/bars (`--bone-100` on dark, `--ink-950` on light)
- **Prior** → verdigris
- **Posterior** → brass
- **Posterior/prior predictive simulation** → plum
- **Danger** (divergences, absurd priors, bias) → clay

A learner who has done three chapters should be able to read any later plot's meaning from color alone.

**Typography**

- Display: **Gloock** — high-contrast Didone with engraved-plate character. Chapter titles, golem names, big numerals. Use with restraint; never below 28px.
- Body: **STIX Two Text** — the typeface of scientific publishing; prose and inline math share one voice (pairs with KaTeX/STIX math rendering).
- Code & data: **IBM Plex Mono** — all code panes, axis ticks, tables of draws, diagnostic readouts.
- Scale: 1.25 ratio; body 17px/1.65 on reading pages; generous measure (65–72ch max for prose).
- Details that sell it: old-style figures in prose, tabular figures in tables; small-caps eyebrows (`font-variant-caps`) for section labels like "CHAPTER IV · GEOCENTRIC MODELS"; hairline rules `--ink-600` at 1px, never heavier.

**Layout**

- 12-col grid, max content 1200px; prose column narrow and centered, interactives allowed to break wide (full-bleed with inset padding).
- Space is the luxury: sections breathe (96–128px vertical rhythm on chapter pages). Density is for instruments (explorers, tables), not for reading flow.
- Corners: 2px radius on cards (near-square, instrument-like), full-round only on small controls. No soft blobby 16px+ radii anywhere.

### 2.3 The signature element

**Living posteriors.** Every chapter header is a generative canvas: thin, luminous density curves drawn from that chapter's *actual* model draws, slowly drifting and re-sampling like smoke rising from the workbench — brass curves on midnight ink. Chapter 2's header breathes with globe-tossing posteriors; Chapter 13's with tadpole tank intercepts. The ornament *is* the statistics. Implement once as `<LivingPosterior draws={...} />` (canvas, ~60fps, pauses off-screen, static frame under `prefers-reduced-motion`).

Second signature, used sparingly: **the forging ceremony**. Completing a chapter triggers one orchestrated moment — the chapter's golem SVG assembles from scattered engraved fragments, eyes kindle brass, and it walks into the bestiary. This is the only "big" animation in the app. Everything else is micro (150–250ms ease-out, subtle brass glow on focus/hover).

### 2.4 Illustration & chart style

- Golems and decorative art: **single-style inline SVG** — engraved/woodcut line work, 1.5px strokes in bone/brass on ink, no gradients-as-crutch, no emoji, no stock icon sets for illustrative purposes (Lucide allowed for functional UI icons only, stroke width matched to hairlines).
- Charts (Observable Plot / D3): one shared theme module `web/src/lib/plot-theme.ts` — fonts, hairline axes, no chart borders, no gridline clutter (x-grid only when needed), semantic palette enforced by helper (`stat("posterior")` returns brass). Direct labels over legends when feasible. Every chart must look like it was engraved for this app, not exported from a notebook.
- Density curves everywhere get the house treatment: 1.5px stroke + 8% opacity fill of the same hue.

### 2.5 Design quality gates (every PR that touches UI)

1. Screenshot the change (Playwright screenshot script `npm run shot -- /route`) and *look at it*. Critique against this section before committing. Remove one accessory (Chanel rule).
2. No raw hex, no off-scale font sizes, no default-blue links, no unthemed Plot output.
3. Keyboard focus visible (brass ring), `prefers-reduced-motion` respected, contrast ≥ 4.5:1 for text (check brass-on-ink for small text — use `--brass-200` when small).
4. Mobile (390px) and desktop (1440px) both composed deliberately — interactives get a designed mobile fallback, never a squished desktop view.
5. If a screen would look at home in a generic dashboard template, it fails. Redesign.

Keep `DESIGN_NOTES.md` at repo root: a running log of visual decisions, rejected directions, and screenshots. Future sessions read it before touching UI.

---

## 3. Code conventions

- TypeScript strict; no `any` in `lib/`, `models/`, or `interactives/` engines.
- Each interactive lives in `web/src/components/interactives/<name>/` with: `README.md` (pedagogical goal + interaction spec), `engine.ts` (pure logic, no React), `<Name>.tsx` (view), `engine.test.ts`, and a demo route registered under `/dev`.
- Engines are pure and deterministic under a seeded RNG (`lib/rng.ts`, PCG32). All samplers/statistical code tested against known quantiles (tolerance stated in test file header).
- State: Zustand slices (`progress`, `bestiary`, `calibration`, `srs`, `settings`); persisted to localStorage with versioned migrations; export/import as JSON.
- Heavy assets lazy: webR only on routes that use it; posterior files fetched on demand with long-cache headers; route-level code splitting.
- Commits: small, one concern; update `PROGRESS.md` checklist (mirrors plan §6) as tasks complete.

## 4. Content rules (legal + voice)

- **Never reproduce book or solutions-manual text, figures, or code.** All prose original. Problems referenced by ID only (e.g., "4H2 — book p. 121") plus at most an original one-line paraphrase. Solutions are fresh brms translations with original commentary, validated against the manual's *numerical results* only.
- Datasets from the open `rethinking` package repo; lectures embedded from the official YouTube playlist via `lectures.json`, never re-hosted.
- Voice: warm, precise, slightly wry — a master craftsman explaining, never a textbook droning. Second person. Short sentences for key moves. UI copy: plain verbs, sentence case, buttons say what they do ("Forge the golem", "Draw 1,000 samples"), consistent vocabulary across the whole app.
- Math: KaTeX with STIX; every equation gets a plain-language gloss on hover or beneath.

### 4.1 No AI-tells in the writing

All text in this project — chapter prose, UI copy, hints, solutions, READMEs, commit messages — must read as if written by a sharp human author. Before committing any prose, reread it hunting for the patterns below and rewrite what you find.

**Banned vocabulary.** Never use: delve, dive into, deep dive, crucial, vital, essential (as filler emphasis), robust, seamless, leverage (as a verb), utilize, harness, unlock, unleash, empower, elevate, supercharge, streamline, game-changer, cutting-edge, landscape (figurative), journey (figurative), realm, tapestry, treasure trove, myriad, plethora, holistic, synergy, foster, facilitate, navigate (figurative), embark, testament to, underscore(s), pivotal, comprehensive (as praise), rich (figurative), powerful (as filler), stunning/beautiful in our own copy about our own visuals.

**Banned phrases and moves.**
- "It's important to note / worth noting / keep in mind that…" — just say the thing.
- "Let's explore / Let's dive in / In this chapter, we will…" — no throat-clearing openers; start inside the idea.
- "In conclusion / To summarize / Overall / Ultimately" — end sections on a concrete point, not a wrap-up.
- "Not just X, but Y" and "It's not about X; it's about Y" constructions.
- "Whether you're a beginner or an expert…" audience-flattering setups.
- Rhetorical-question openers ("Ever wondered why…?").
- The reflexive rule of three ("fast, flexible, and fun") — use lists of three only when there really are three things.
- Empty intensifier + adjective pairs ("incredibly powerful", "truly remarkable").
- Apologetic hedging stacks ("It may perhaps be somewhat…"). Hedge once, precisely, only when the statistics genuinely warrant it.

**Structural tells to avoid.**
- Bold-led bullet lists ("**Speed:** it is fast") as a default explanatory mode — prefer prose; use lists only for genuinely enumerable things.
- Uniform paragraph lengths and uniform sentence rhythm; vary both. Short sentences are allowed to stand alone.
- A summary paragraph that restates what was just said.
- Em-dash overuse — fine occasionally, but if two appear in one paragraph, recast one.
- Emoji anywhere. Exclamation marks almost anywhere (the forging ceremony toast may have one).
- Title Case Headings for section titles inside prose; use sentence case.
- Every concept introduced with a definition sentence of the form "X is a technique that…". Vary the entry point: an example, a failure, a question the model can't answer yet.

**Positive direction.** Write like a good science essayist: concrete nouns, active verbs, specific numbers, opinions held plainly. When a sentence could appear unchanged in any other stats course, sharpen it until it could only belong to this one. McElreath's own register — plainspoken, a little mischievous, hostile to ritual — is the north star, but do not imitate his sentences; earn the tone with our own material.

**Read `VOICE.md` (repo root) before writing or editing any prose.** It carries the calibrated before/after pairs — the *positive* examples this section can only gesture at — plus the human-review checklist for the tells a regex can't catch (figurative `rich`, self-praising `beautiful`, em-dash density). The banned lists here are the floor; `VOICE.md` is how you clear the bar. When you catch a new generic-but-clean sentence in review, add the fixed pair to `VOICE.md`, the way you'd add a pattern to `banned-words.txt`.

**Gate.** Add `npm run lint:prose` — a script scanning `content/`, UI string files, and hint/solution YAML for the banned vocabulary and phrases above (simple regex list in `scripts/prose-lint.ts`, maintained as new tells are noticed). CI fails on hits; legitimate exceptions get an inline `prose-lint-disable` comment with a one-line justification.

## 5. Statistical correctness gates

- r-pipeline: every fit passes rhat < 1.01 and bulk-ESS > 400 before export; exporter writes diagnostics into the artifact; the web loader refuses artifacts that fail schema or thresholds.
- brms conventions: `backend = "cmdstanr"`, `seed = 1959`, model names mirror the book (`m5.3`, `m13.2`), priors stated explicitly in every `brm()` call shown to learners (no silent defaults in teaching code).
- Any JS reimplementation (densities, link functions, d-separation) is property-tested; the d-sep engine is validated against a table of known adjustment sets from the book's DAGs.

## 6. Session workflow

1. Read `PROGRESS.md` → find current phase/task (phases defined in plan §6).
2. If touching UI, read `DESIGN_NOTES.md` and §2 above.
3. Build → test (`npm test`, engine tests must pass) → screenshot → self-critique → commit → tick `PROGRESS.md`.
4. End each session with the app deployable (`npm run build` green).
5. Log open questions for the human in `PROGRESS.md` under "Decisions needed" rather than guessing on plan §8 items.

## 7. Definition of done — any chapter page

- [ ] Living posterior header wired to real chapter draws
- [ ] Original MDX prose, lecture links with timestamps, Rosetta code toggle
- [ ] Signature interactive(s) shipped with engine tests + `/dev` demo
- [ ] Practice problems with full hint ladders; completion feeds bestiary + SRS
- [ ] Golem art in house SVG style; forging ceremony triggers on completion
- [ ] Design gates (§2.5) pass on mobile + desktop; Lighthouse ≥ 90
