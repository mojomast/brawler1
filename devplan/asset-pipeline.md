# Asset Pipeline

## Current Strategy

Milestone 1 uses procedural Canvas placeholders, not external image files.

## Placeholder Tiers

- P0: debug boxes and labels.
- P1: readable silhouette and color block.
- P2: handmade theatrical placeholder with mask heads, props, and rough costume motifs.
- P3: final sprite sheets.

## Naming

Use lowercase kebab-case:
- `player-khn-idle-right-000.png`
- `player-klek-slam-right-000.png`
- `enemy-algorithm-executive-walk-left-000.png`
- `boss-content-mill-hydra-idle-000.png`

## Fallback Rule

No gameplay feature should depend on final art. If a sprite is missing, draw a procedural silhouette with role label.
