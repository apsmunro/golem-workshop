# DESIGN_NOTES.md — visual decision log

Append-only. Every UI-touching session adds an entry: what changed, screenshots, what was rejected and why.

## 001 — Founding direction (pre-code)
Direction: "The Astronomer's Workshop" — Prague golem mythology, Orloj, engraved instruments. Midnight ink ground, brass/verdigris/clay/plum accents, Gloock + STIX Two Text + IBM Plex Mono. Signature: LivingPosterior generative chapter headers (real draws as drifting brass curves) + one ceremonial forging animation. Semantic stat palette is load-bearing pedagogy: data=bone, prior=verdigris, posterior=brass, simulation=plum, danger=clay.
Rejected: cream+terracotta editorial serif look (generic AI default, and clashes with dark-workshop identity); neon-on-black tech aesthetic (wrong world — this is brass and candlelight, not cyberpunk); imitating McElreath's lecture-slide style directly (his identity, not ours).
Watchpoints for future sessions: brass on ink fails contrast at small sizes — use --brass-200 below ~16px; don't let "engraved" drift into skeuomorphic textures (no paper grain, no leather); density of instrument panels must never leak into reading pages.
