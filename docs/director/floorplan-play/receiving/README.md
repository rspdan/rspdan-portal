# Floor-plan toolbar play receiving

This is independent browser receiving of the toolbar placement changes, using real Chromium pointer events and Android-size touch input at 390 × 844, plus desktop mouse input at 1280 × 900. The development server uses an isolated local take store; no production data was written. The earlier floor-plan receiving remains intact in `docs/director/floorplan-receiving/`.

## Reproduced before the change

[Baseline evidence](baseline-reproduction.json) records the same failure on touch and mouse: canvas room drawing works, but dragging Stairs or Elevator from the toolbar to the room silently does nothing. Tap tool, then tap canvas works as designed and reports that another level is needed. Native Android's selection menu from the user's physical-device screenshot did not appear under headless touch emulation; this receiving does not claim to reproduce that OS menu.

## Final results

[Full workflow results](final-results.json): **218/218 checks passed**, split between [touch](candidate-android-touch-results.json) and [mouse](candidate-desktop-mouse-results.json), 109 each. Both complete 3D preview, isolated local Save take, reload and reopening with the exact plan and Trip pose retained. No application exception remained; the unrelated Astro development-toolbar audit import error is retained in the logs.

[Final-source smoke](final-source-smoke-results.json): **8/8 passed** after the last mouse-only polygon completion adjustment. It receives rapid nearby touch corners, same-corner mouse doubleclick, mouse/touch toolbar placement with exact undo, and the real text-selection path that previously threw. [Served source hashes](tested-source-sha256.json) confirm JS `043fcf2a9b73233cb7a0b2450000e66e3244f4475d1f591c16253568a5aaa623` and CSS `9a10b8ffca0df2dbd8d20e1a5ef5c31ee7b59ec3d1350ba8760f619744b61ca0`.

The full workflow predates that final mouse-only refinement. Touch ran after the prior JS `4de944f5e7a8c8270eb87e3913c3161f98b69893d2a8862480074ee3aad22a9d` freeze. Desktop started before the last wording/snap adjustment and did not capture served source bytes; identical-byte coverage for those 109 checks is not claimed.

## Receiving scope

The five placement tools are Door, Window, Passage, Stairs and Elevator. Each is exercised through toolbar drag and tap-tool/tap-plan, including moving the placed item, exact one-step undo/redo, invalid placement, outside-canvas and overlay-control drops, and cancellation. Opening tools also reject off-wall drops. Stair/elevator setup checks one level and equal elevations, then uses the visible + Level action to create a valid destination.

Before/after selection receipts distinguish new toolbar selection from text previously selected in an inspector input. Ghost previews must appear without committing. The final plan then goes through 3D preview, local Save take, reload and reopening, with exact plan and Trip-pose comparisons.

Select, Pan, Draw room and Polygon retain their respective selection, viewport and canvas-drawing interactions. They are played separately rather than treated as draggable set pieces.

## Findings from exploratory play

- The new inline **+ Level** action makes the missing destination discoverable on the phone viewport; the original inspector action was below the fold.
- Rapid nearby polygon taps (~18 pixels apart) generated a synthesized doubleclick before three corners, clearing the draft. This was reported and the UI owner changed touch completion handling while preserving first-corner and keyboard completion.
- Native `selectstart` can target a text node. The new menu-suppression listener initially called `.closest()` without a guard and produced one application exception during the desktop workflow. The UI owner added a guard.

[The intermediate run](intermediate/candidate-before-followups-results.json) preserves those findings. Both are resolved by the final receiving. Other files in `intermediate/` preserve superseded diagnostic screenshots and a test timing issue: CDP delivered the last touch move on the next compositor frame, so the harness now waits for the ghost before asserting. Those files are historical evidence, not current failing results.

## Visual evidence

- [Original one-level tap guidance](android-touch-stairs-tap-tap-one-level.png)
- [Candidate one-level guidance with immediate + Level](android-touch-one-level-discovery.png)
- [Door drag preview](android-touch-door-drag-preview.png)
- [Stair drag preview](android-touch-stairs-drag-preview.png)
- [Completed touch plan](android-touch-complete-plan.png)
- [Completed desktop plan](desktop-mouse-complete-plan.png)
- [Touch 3D preview](android-touch-preview.png)

The inspected touch previews have a clear wall opening or dashed connection footprint and a readable release-to-place badge. The completed plan shows all five placed items, and 3D preview shows the corresponding wall openings. No final set dimensions or room layout are being claimed as canonical lore. All tests are local browser receiving; a physical Android OS selection menu was not independently exercised.
