# Next-pass receiving scope

Use isolated local Director with real mouse, touch and keyboard input. Preserve all earlier receiving evidence. Wait for editor/overview candidate readiness, and record exact served source bytes after the owners freeze changes.

## Workflow

1. Open the empty Building view and return without changing the document or undo history.
2. Import `multi-level-fixture.json` through the real file input. Compare the canonical document before/after overview toggles; assert overview sorting does not reorder saved levels.
3. Verify all four IDs remain represented: a negative floor, two floors with the same name and elevation, an empty floor, and long labels. Verify three named connections remain distinct even when two names match.
4. Choose an empty or duplicate-name level by its ID through overview navigation. This changes `activeLevelId` in one undo step. Merely toggling Plan/Building does not.
5. On a 390px touch viewport, select a room/connection and edit its name or destination through nearby controls. Exercise Selected/Level/Plan tabs and keyboard access. The matching visible selection should survive a view-only round trip; unrelated level selection may clear it.
6. Compare Plan viewport and selection before and after a Building round trip. Verify readable labels, usable controls and no horizontal page overflow with actual screenshots.
7. Focused drag smoke: one successful Door, Window, Passage, Stairs and Elevator placement, one undo each; one polygon completion. Do not repeat the prior 218-case matrix.
8. Undo/Redo updates both the drawing and its local hint. Preview/save/reload/export retain the plan and character pose. Exported plan contents should not acquire UI-only tab or view state.

The fixture is test geometry, not canonical Nest Island architecture. All storage writes go to the isolated local take store; no Crew messages or production data writes.
