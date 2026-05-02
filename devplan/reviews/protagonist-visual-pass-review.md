# Protagonist Visual Pass Review

## What was built

Replaced generic protagonist capsules with character-specific procedural Canvas drawings based on public Angine de Poitrine persona anchors: huge papier-mache mask heads, stark black stage silhouettes, Khn's microtonal guitar/bass identity, and Klek's percussion identity.

## What works

- Khn now reads as a string player with long angled instrument neck and irregular microtonal fret marks.
- Klek now reads as a grounded percussion player with sticks, drum/cymbal forms, and radial impact language.
- Both retain anonymous mask-head abstraction rather than realistic likeness.
- Sparse dots remain protagonist costume accents only.

## What feels weak

- This is still procedural art, not hand-authored sprite animation.
- Exact mask/costume details are intentionally not copied from photos.

## Technical debt created

Player procedural drawing is now detailed and should be split into sprite metadata/helpers when real assets are introduced.

## Next recommendation

Manual visual QA in-browser, then either tune these silhouettes or replace with original sprite sheets generated from the updated model-sheet spec.
