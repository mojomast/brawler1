# Subagent Resume Next Handoff

## Date/time

2026-05-02

## Current branch/state summary

No git repository. Prototype has resumed development with subagent-guided QA, AI, and art/UI improvements.

## Goal of next focused session

Manual browser QA and tuning of feel values before new feature scope.

## Files most relevant

- `src/game/entities/Player.js`
- `src/game/entities/Enemy.js`
- `src/game/fx/Particles.js`
- `src/game/ai/WaveDirector.js`
- `src/game/scenes/GameScene.js`
- `src/game/ui/Hud.js`

## Constraints / do-not-break notes

- Keep enemies free of protagonist-style polka dots.
- Preserve anonymous/persona-only inspiration constraints.
- Avoid new subclasses until behavior genuinely requires them.

## Open bugs

- Manual browser playthrough still needed.
- Bosses need more unique attack shapes in a later pass.
- Procedural drawing should eventually give way to sprite sheets.

## Acceptance criteria

- `npm run check` passes.
- Dev server can serve modules on a free port.
- Khn/Klek can both start a run.
- Enemies steer into lanes and remain reachable.
- Boss phase changes show visual and add-spawn differences.

## Suggested subagent

QA/review subagent for manual playtest notes, then Gameplay/combat subagent for tuning.

## Suggested first commands or inspection steps

- `npm run check`
- `PORT=5180 npm run dev`
- Play Khn through Stage 1 and Klek through Stage 1.
- Use final boss run after tuning Stage 1 feel.
