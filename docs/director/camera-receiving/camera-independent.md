# Independent camera receiving

No unresolved product finding remains in the audited scope. The reviewer changed no product files and made no commit or deployment.

- All four 3D modes: primary drag zoom in/out, one undo per gesture, exact camera undo/redo, unchanged lens and pose/light/stage state.
- Orthographic drag changes actual view height without relying on radius; middle drag, Shift-middle pan and Ctrl-middle zoom work.
- Outside pointer release commits once. Escape and unexpected camera capture loss restore the starting camera without cancelled history; a fresh drag works afterward.
- Camera mode exposes no active pose handles. Numeric camera edits preserve objects, invalid coordinates add no undo, and the camera survives Save take/reopen through a private local store (`shared:false`).
- A second finger cancels a pending joint hold. An actual utility-layer rotation-ring edit is rolled back when pinch takes over; the remaining finger is drained and the completed pinch has one undo.
- Actual active-gizmo blur cancellation passes. On the final capture-loss implementation, an actual unexpected loss also restores the original pose without adding undo.
- Top displays a valid 89° elevation. Requested distances 0.1 and 0.01 remain 0.10000000000000005 and 0.009999999999999948 after two rendered frames.
- Final actual CDP wheel input forms one reversible camera-history step and leaves objects unchanged. No page errors in the final focused checks.

`receiving-receipt.json` pins final source hashes and links each evidence file. The broad runs were deliberately bounded; their partial JSON files are not claimed as complete suite passes. The final changes after broader receiving were the Top/orbit pole margin and unexpected first-edit capture-loss cancellation; both have focused receiving.

The raw logs preserve two harness limitations: fixed 100ms reads could precede coalesced touch delivery under software rendering, and a wheel-arrival timing assertion incorrectly assumed all renderer deliveries would arrive within 180ms. Condition-based uninstrumented touch receiving and final wheel behavior assertions supersede those results. A cleanup-only CDP touchCancel error was also corrected.

This is Chromium mobile emulation, not physical-phone testing. The review used only a private loopback take store and stopped its fixture afterward.
