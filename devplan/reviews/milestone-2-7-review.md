# Milestones 2-7 Review

## What was built

- Khn and Klek selectable from a character-select overlay.
- Distinct protagonist configs, stats, attacks, and procedural silhouettes.
- Expanded enemy roster through configurable archetype variants.
- Four-stage run progression.
- Boss encounters for Arena Promoter, Content Mill Hydra, and Grand Executive of Palatability.
- Boss phase escalation and summoned adds.
- Stage cards, updated HUD, win/lose/restart flow, README, and smoke-test coverage.

## What works

- The game has an end-to-end browser-playable structure with no external dependencies.
- Existing controls remain stable.
- Combat data is centralized in configs instead of being hardcoded throughout gameplay logic.
- Enemies no longer visually inherit the protagonists' polka-dot identity.

## What feels weak

- Art is still procedural placeholder work, not real sprite sheets.
- Bosses share the same base behavior with stat/phase variation.
- Enemy archetypes are currently stat/color/label variants, not deeply unique behaviors.
- There is no audio, hit stop, camera shake, or animation-frame pipeline yet.

## Technical debt created

- Entity drawing and gameplay behavior still live in the same classes.
- `WaveDirector` owns a lot of content data and sequencing; acceptable for the prototype but should be split if content grows.
- UI is immediate-mode Canvas text rather than a reusable menu/button system.

## Recommended cleanup before next feature

- Add hit stop and camera shake before adding more content.
- Split procedural drawing helpers from `Player` and `Enemy` when real sprites are introduced.
- Add simple browser automation when dependencies are allowed.
- Tune collision ranges after manual playtesting.

## Decision summary

The project remains Canvas-first and dependency-free. The visual direction is research-aligned: protagonists use oversized papier-mache heads and requested sparse dot motifs; enemies are fictional industry archetypes without default polka dots.

## Next milestone recommendation

Run manual QA and balancing, then start an asset pass with P2/P3 sprite sheets and audio/juice.
