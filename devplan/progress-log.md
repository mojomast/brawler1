# Progress Log

## 2026-05-02

- Inspected empty workspace.
- Created modular Canvas browser prototype.
- Implemented Milestone 1 vertical slice.
- Researched official Angine de Poitrine public pages and Bandcamp.
- Updated art direction to emphasize papier-mache heads, anti-arena/mantra-rock absurdity, microtonal/percussion identity, and non-polka-dot enemy archetypes.
- Adjusted enemy placeholder art to use corporate/music-industry satire instead of polka dots.
- Continued beyond Milestone 1 after user requested full completion.
- Added character select with Khn and Klek.
- Reworked player configuration to support distinct protagonist stats and attacks.
- Replaced simple wave counts with stage/wave data for four stages.
- Added eight enemy archetype stat variants and three boss stat variants.
- Added boss phase escalation and add summons.
- Updated README and smoke tests for complete prototype scope.
- Verified `npm run build`, `npm run test`, and JavaScript syntax checks.

## Known Environment Note

Runtime server checks on ports `5173` and `5174` were blocked because both ports were already in use in the environment. Static checks and module syntax checks passed.

## 2026-05-02 Resume Pass With Subagents

- Delegated QA/feel, boss/enemy behavior, and art/UI placeholder passes to subagents.
- Added player attack buffering for more reliable combos.
- Added hit stop and screen shake on confirmed hits.
- Added enemy lane steering, position clamping, and crowd separation.
- Added config-driven enemy props, body shapes, attack tells, retreat behavior, and boss-specific add summons.
- Reduced enemy label clutter by showing labels for bosses or recently hit enemies only.
- Added cardboard pyramids, hot-dog signage, and darker HUD backing plates.
- Updated art-direction placeholder rules for future contributors.

## 2026-05-02 Tightening Pass

- Fixed spawn/jump physics by making `z` represent height above ground and applying gravity downward.
- Added mouse tracking and click detection scaled to the Canvas coordinate system.
- Added clickable menu buttons for title, character select, pause, win, and game-over screens.
- Preserved keyboard controls while making menus mouse-driven.

## 2026-05-02 Protagonist Visual Research Pass

- Delegated visual research and sprite drawing guidance to subagents.
- Replaced generic Khn/Klek player drawing with public-persona-inspired procedural model sheets.
- Khn now has a slim black stage silhouette, oversized oval papier-mache mask, long microtonal guitar/bass neck, irregular fret ticks, and angular attack glyphs.
- Klek now has a stockier grounded silhouette, oversized squarer papier-mache mask, sticks, drum/cymbal props, and radial percussion glyphs.

## 2026-05-02 Scrolling Levels And Visual Identity Pass

- Delegated scrolling level architecture, AI encounter behavior, and second-pass protagonist model-sheet work to subagents.
- Replaced timed screen-edge waves with authored world-coordinate encounters.
- Added stage `worldWidth`, `exitX`, palette, props, trigger gates, and world spawn positions.
- Added camera follow and world-space rendering via `cameraX`.
- Player movement is now clamped to world bounds or active encounter gates instead of viewport width.
- Enemies now spawn into encounters in world coordinates with an `entering` state and local gate bounds.
- Boss adds now spawn inside the active gate near the fight instead of fixed screen edges.
- Added stronger stage differentiation: festival barricades/tents, streaming screens, anti-arena signage, and scrolling props.
- Strengthened Khn silhouette with beaked/pinched papier-mache head, double-neck microtonal instrument, loop module, cable, and toe controls.
- Strengthened Klek silhouette with broad pyramid-boulder mask, sherpa/utility straps, asymmetric percussion rig, mallet/stick contrast, and matte drum props.

## 2026-05-02 Prototype Complete Art Refactor Pass

- Read design docs and final QA handoff constraints before changing art/code.
- Extracted protagonist procedural rendering from `Player.js` into `src/game/entities/ProtagonistArt.js`.
- Kept `Player.js` focused on gameplay state, movement, combat, hitboxes, and delegation to art helpers.
- Preserved protagonist-only sparse costume dots, oversized papier-mache masks, Khn microtonal string identity, and Klek percussion identity.
- Updated character select labels and HUD encounter text for better readability and theme alignment.
- Updated hit particles from generic circles to simple slash, square, and diamond ritual glyphs.
- Updated smoke test coverage to include the new protagonist art module.

## 2026-05-02 Long-Nose Dot-Suit Persona Pass

- Pushed Khn and Klek closer to the public stage persona while preserving abstraction and anonymity.
- Enlarged both papier-mache mask noses into long readable proboscis/beak shapes.
- Increased protagonist dot coverage into bold full-body suit bands on torsos, arms, legs, boots, and Khn's toe/foot details.
- Strengthened Khn's double-neck microtonal guitar/bass with longer necks and denser irregular fret ticks.
- Strengthened Klek's compact percussion rig with kick/snare/tom/cymbal shapes, mallet/stick contrast, and triangle/shockwave glyphs.
- Added subtle triangle ritual props to stages while keeping enemies free of polka-dot protagonist costume language.
