# Tightening Pass Review

## What was built

Fixed the player vertical physics bug that made the character rise at spawn. Added mouse-driven Canvas menu buttons for title, character select, pause, retry, and title return.

## What works

- Player no longer gains upward height from gravity at spawn.
- Jump uses positive upward velocity and returns to ground through downward gravity.
- Mouse clicks are converted from browser coordinates to internal Canvas coordinates.
- Existing keyboard menu flow remains available.

## What feels weak

Buttons are immediate-mode Canvas UI, not a full UI framework. This is sufficient for the prototype.

## Recommended cleanup before next feature

Manual browser test menu clicking across desktop and Tailscale client viewports.
