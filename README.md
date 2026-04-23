# ✦ Stellar Journey v2 — Restore the Constellations

A calm, cinematic, third-person 3D constellation-collection experience.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Controls (active after prologue)

| Key / Input | Action |
|-------------|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A / ← | Strafe left |
| D / → | Strafe right |
| Space | Ascend (fly up) |
| Shift | Descend (fly down) |
| Click + drag | Rotate camera (yaw) |
| Click star | Collect it |

---

## Journey

1. **Cinematic Prologue** — 5-section scroll story with falling stars animation
2. **Forest** (start) — Dense box-trees, 6 green stars
3. **Ocean** (fly deeper) — Wide open water, floating spheres, 6 blue stars
4. **Sky** (fly deepest) — Floating platforms, open vertical space, 6 violet stars
5. **Transcendence** — Cosmic space, Mother Whale appears, all constellations reunite

---

## Phases Implemented

| Phase | Description |
|-------|-------------|
| 1 | Render stability — debug cube, render loop confirmation |
| 2 | Cinematic prologue — 5 scroll sections, whale SVG, falling stars canvas, parallax |
| 3 | World structure — 3 biomes along Z-axis |
| 4 | WASD / Arrow key movement (frame-rate independent, delta-based) |
| 5 | Third-person camera — lerp follow, cinematic lag, player mesh visible |
| 6 | Flight system — Space ascend, Shift descend, no gravity |
| 7 | Biome scale expansion + fog depth simulation |
| 8 | Star collection — pulsing, float animation, click to collect, fade out |
| 9 | Constellation completion — line drawing, biome lighting shift |
| 10 | StringTune integration — safe async, isolated, logs status |
| 11 | Scroll for narrative only (prologue progression) |
| 12 | Transcendence sequence — particles, Mother Whale, cinematic camera ascent |

---

## Debug Console Logs

- `[PHASE 1]` — render loop confirmation
- `[Canvas]` — canvas creation
- `[StringTune]` — audio init status
- `[Star]` — each star collected with name
- `[Biome]` — constellation completions
- `[Movement]` — player position + delta (throttled)
- `[Transcendence]` — final sequence trigger
