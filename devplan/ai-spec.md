# AI Spec

Milestone 1 implements one generic enemy behavior used by satirical archetype labels.

## States

- `idle`: waits for player proximity.
- `chase`: approaches player on the same lane.
- `attack`: telegraphed melee hitbox.
- `hitstun`: disabled after damage.
- `defeated`: fades and despawns.

## Waves

Wave counts are `2`, `3`, and `4`. Future milestones should add role-specific behaviors after the vertical slice is stable.
