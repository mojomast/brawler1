# Scrolling Levels And Visual Identity Review

## What was built

Added side-scrolling stage architecture with world-coordinate encounters, camera follow, encounter gates, authored stage props, and stronger second-pass protagonist procedural art.

## What works

- Stages are wider than the viewport and render in world space.
- Camera follows the player and clamps to stage bounds.
- Encounters trigger at authored `triggerX` positions.
- Active fights lock player movement to encounter gates until enemies are cleared.
- Enemies enter from authored world positions and local fight bounds, rather than spawning continuously at screen edges.
- Khn and Klek now have more distinct public-persona-inspired silhouettes and props.

## What feels weak

- Encounters are still instantly spawned when triggered, with a simple `entering` walk-in rather than a curtain animation.
- Stage transitions reset the player into the next stage rather than showing a transition card beyond existing stage card behavior.
- Protagonists are still procedural Canvas drawings, not sprite sheets.

## Technical debt created

- Stage content data is now richer and lives in `stageData.js`; future content should keep that file organized or split per stage.
- `Player.js` contains detailed procedural drawing helpers that should eventually move to an art module or sprite renderer.

## Recommended cleanup before next feature

- Manual browser QA at high world coordinates around each boss gate.
- Tune camera follow and gate widths after playtesting.
- Add small curtain/door entrance animations for encounter starts.
- Consider replacing procedural protagonists with generated original sprite sheets based on the current model-sheet spec.

## Next milestone recommendation

Manual Tailscale/browser playtest, then tune encounter pacing and camera before adding more content.
