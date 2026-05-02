# Scrolling And Visual Identity Handoff

## Date/time

2026-05-02

## Current branch/state summary

No git repository. Prototype now has scrolling stages, camera follow, encounter gates, world-coordinate enemy entry, and improved protagonist procedural art.

## Goal of next focused session

Manual QA of scrolling stages and visual readability, then tune gate widths, camera follow, and encounter pacing.

## Files most relevant

- `src/game/levels/stageData.js`
- `src/game/ai/WaveDirector.js`
- `src/game/scenes/GameScene.js`
- `src/game/entities/Enemy.js`
- `src/game/entities/Player.js`
- `devplan/reviews/scrolling-levels-visual-identity-review.md`

## Constraints / do-not-break notes

- Keep all protagonist inspiration public-persona-only.
- Do not copy exact photographed mask shapes, costumes, logos, or real likenesses.
- Enemies should remain separate music-industry archetypes and should not inherit protagonist costume dots.
- Do not reintroduce screen-edge timed wave spawning.

## Open bugs

- Manual browser playtest needed for every encounter gate.
- Gate and camera tuning may need adjustment after real play.
- Stage transitions are functional but not cinematic.

## Acceptance criteria

- Player can scroll through each stage and trigger authored encounters.
- Enemies enter into gates and fight locally.
- Defeating enemies unlocks scrolling.
- Boss adds stay inside the active fight gate.
- Khn/Klek remain distinguishable at gameplay scale.

## Suggested subagent

QA/review subagent, then Gameplay/combat subagent for tuning.

## Suggested first commands or inspection steps

- `npm run check`
- `PORT=5182 npm run dev`
- Play Stage 1 with Khn and Stage 2 with Klek.
- Jump to later stages only after verifying gates and camera in early stages.
