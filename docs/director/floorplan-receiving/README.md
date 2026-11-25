# Floor-plan editor receiving

Received in isolated local Director on 2026-11-25 with Chromium and software WebGL. Authentication was supplied privately; neither credentials nor production storage were used. Browser dev-server hot reload was intercepted to keep concurrent source edits from navigating the test page.

## Functional results

- [Desktop workflow](desktop-results.json): **25/25 passed** at 1440 × 1000. Real pointer drawing made adjacent rooms, a shared-wall door and an exterior window. Numeric corner editing, corner dragging, keyboard and button history, two levels, stairs/elevator markers, package export/import, malformed-import retention, 3D preview, browser reload, local Save take and reopening all passed.
- [Tablet/mobile touch workflow](responsive-results.json): **16/16 passed** at 820 × 1180 and 390 × 844. Tablet touchscreen dragging created a room. Mobile used the dimension-based creation path. Both exercised naming, touch undo/redo, 3D preview and return. Neither viewport had horizontal document overflow.
- [Trip/Stage regression](stage-regression-results.json): **7/7 passed**. Generic Stage prop creation and placement preserve the canonical floor plan; plan edits preserve props. Trip's pose is byte-for-byte unchanged across those edits. The scene frame counter advances after returning from overhead to 3D.
- [Final application smoke](final-smoke-results.json): **7/7 passed** after the shadow adjustment. The real UI imports and previews the plan, preserves the pose, returns to overhead, and undoes the import. Removing the generated plan restores the original shadow normal bias from 0.05 to 0.
- [Mobile viewport receiving](mobile-viewport-results.json): repeated the mobile path to capture actual viewport screenshots, avoiding full-page screenshot artifacts caused by the existing sticky mobile stage.

All floor-plan inspector inputs/selects have associated labels or an explicit accessible name. The saved take response was HTTP 200 with `shared: false`; reopening restored the exact plan and character pose. No application runtime exception occurred. The local Astro development toolbar emitted an unrelated missing audit-module import error, retained in the result files.

## Visually inspected evidence

- [Adjacent rooms, shared doorway and window](desktop-adjacent-rooms.png)
- [Upper-level stair and elevator planning footprints](desktop-upper-level.png)
- [Completed overhead plan](desktop-complete-plan.png)
- [Tablet after touch drawing](tablet-room.png)
- [Mobile overhead viewport](mobile-room-viewport.png)
- [Mobile inspector viewport](mobile-inspector-viewport.png)
- [Final 3D preview with clean wall shading](final-3d-preview.png)

The room labels and wall/opening marks are legible. The shared doorway remains visually open even when the neighboring room is selected. On mobile the drawing stage stays visible while the inspector scrolls below it. Stair/elevator graphics are editable planning footprints, not completed traversable geometry.

## Rendering follow-up

Initial 3D receiving exposed diagonal shadow striping on broad wall faces. Temporary runtime comparisons confirmed shadow acne: 0.02 normal bias reduced it; 0.05 removed it while keeping cast shadows. The integration owner applied 0.05 only while floor-plan meshes are present. The final unmodified-runtime screenshot was visually inspected: the broad walls are clean and cast shadows remain. Undoing the import restored the prior bias. The `shadow-*.png` comparisons retain the diagnosis evidence.

[Source SHA-256 values](tested-source-sha256.json) identify the files received by the final application smoke. Functional workflows above were completed before that scoped rendering fix; the final smoke checks its behavior without injecting renderer changes.

## Reproduction

Run `python docs/director/floorplan-receiving/session.py`, `responsive.py`, and `stage-regression.py` with the private local test configuration available at `/workspace/scratch/floorplan-test-env.json`. These scripts operate the real UI; they do not inject plan changes through application internals. Diagnostics are read-only assertions. `shadow-probe.py` is the explicit exception: it temporarily adjusts renderer shadow options in its disposable browser session for diagnosis.

The [exported package](ui-export.floorplan.json) came from the UI-created plan. Its names and dimensions are test data, not canonical Nest Island architecture.
