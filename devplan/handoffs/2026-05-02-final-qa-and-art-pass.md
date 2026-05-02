# Final QA And Art Pass Handoff

## Date/time

2026-05-02

## Current branch/state summary

No git repository. The workspace contains a dependency-free Canvas prototype implementing title/select/play/pause/win/lose, Khn/Klek, four stages, eight regular enemy variants, and three bosses.

## Goal of next focused session

Manual browser QA, combat tuning, and sprite/audio polish planning.

## Files most relevant

- `src/game/config/constants.js`
- `src/game/entities/Player.js`
- `src/game/entities/Enemy.js`
- `src/game/ai/WaveDirector.js`
- `src/game/scenes/GameScene.js`
- `src/game/ui/Hud.js`
- `devplan/art-direction.md`
- `devplan/reviews/milestone-2-7-review.md`

## Constraints / do-not-break notes

- Preserve anonymity and avoid real-identity speculation.
- Do not copy exact copyrighted photos, logos, costumes, album art, or performances.
- Keep polka dots as protagonist costume accents only unless there is a specific non-character design reason.
- Enemies should remain fictional music-industry archetypes.

## Open bugs

- Runtime server check could not bind to ports `5173` or `5174` because both were already in use.
- Manual browser playtest still needed.
- Bosses need unique attack silhouettes beyond base melee hitboxes.
- Enemy labels may overlap during crowded waves.

## Acceptance criteria

- `npm run check` passes.
- Browser run can complete from title to final boss win state.
- Khn and Klek both feel distinct.
- Enemy visuals do not read as copied protagonist costumes.

## Suggested subagent

QA/review subagent first, then Art/sprite pipeline subagent.

## Suggested first commands or inspection steps

- `npm run check`
- `PORT=5180 npm run dev`
- Play both characters through at least one full run.
