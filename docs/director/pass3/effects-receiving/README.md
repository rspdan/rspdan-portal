# Independent light-effect receiving

The initial integrated run passed 29 functional checks with zero page errors, then actual image review found a rendering blocker: Trip became black after reopening the saved take with controls visible. The original `receiving.json` remains **not** overall passed as historical evidence. The later `final-fix-receiving.json` passes 13 focused repair and attached-optics checks with zero page errors, including actual pixels in fresh desktop/mobile contexts.

**Art-direction limit:** Dan subsequently rejected the current flare direction and asked for different effect types and lens controls. These technical receipts do not approve the visual style or make that flare treatment ready to deploy. The independent parenting, save/Undo and body-mask results remain useful while that design changes.

## Functional observations

- High body glow leaves the separate head flare off. When explicitly enabled, the flare is parented to the head and follows head rotation.
- Left and right sources attach to the measured hand tips, retain separate colors/intensities and can be switched independently. Effects follow actual playback between keys and whole-character motion without changing their saved local offsets.
- Three consecutive Undo/Redo states restore source enable, intensity and shape. Changing a point source to a spotlight preserves its ID, attachment, effect and offset. A plain spotlight has no visible effect mesh.
- Detaching preserves world position; Undo restores attachment and its local offset.
- Turning the left source on changes pixels on a separate set receiver. The captured rectangle's mean absolute RGB changes are approximately 6.97, 6.72 and 0.0; the warm source's visible receiver contribution is preserved in `receiver-light-off.png` and `receiver-light-on.png`.
- An actual local-workspace save returned HTTP 200 and `shared:false`. A fresh mobile context reopened its appearance, lights/effects, pose and keys. A real CDP touch drag changed the selected beam strength, and touch Undo/Redo restored it.

The local take ID is retained in the receipt. No live Nest save or Send to Crew was performed. Tests use Chromium, software WebGL and mobile emulation, not a physical ACHE device.

## Visual failures and isolation

The original `desktop-hand-ball-and-beam-canvas.png` also shows a gray-centered/ring-like ball and a clipped projected ball after Pose Frame. Those are observed issues, not approved art. The lighting owner corrected the ball material; the core owner expanded framing to include attached visible effects. Their later source versions are outside the initial functional receipt.

`black-render-probe.json` establishes that the saved Trip material remained white and emissive, and its shader was ready with no console error. Turning the outline off restored the white body. This occurs on desktop as well as mobile and is already present at fresh reopen; Undo/Redo is not required to trigger it.

`black-render-group0-probe.json` and the before/after mobile images isolate the cause in one running session (the small probe did not persist a separate exact source-hash manifest): changing only both Highlight-layer rendering-group options to zero restores the white body, dark contour and control dots. The original late composition ran after the helper group cleared depth/stencil. The appearance owner installed the constructor repair. Fresh desktop/mobile receiving then verified neutral 6500 K Trip remains white with controls visible, including after saved-take reopen and effect Undo/Redo. The sampled shin region has median RGB 255/255/255. This is a neutral-temperature regression check, not a requirement for the body to remain untinted at other temperatures.

The same focused run adds a head light with flare Off, independently enables head and hand optics, exercises selected-light flare Undo/Redo, and saves/reopens those optional settings through the local API. Trip's own body flare remains Off throughout. `final-desktop-reopen-framed-canvas.png` shows the bright-centered ball and full effect framing; `final-mobile-optics-framed-canvas.png` shows the repaired body with controls. Both were personally viewed by this reviewer.

A final single mobile recapture uses the later texture-only optic-disc revision. Its receipt is separate (`current-source-capture.json`), so the 13-check receipt does not silently claim to test a later shader texture. That disc treatment also remains subject to Dan's subsequent rejection of the flare direction.

## Fixture limits

The first route handler accidentally accepted Playwright's Request as its default response body and failed before app assertions. Its trace is retained as `fixture-route-error.txt`. The first head-follow measurement sampled an unchanged cached render before software WebGL had delivered the next frame; the repeated check waited for rendering and observed movement. That earlier measurement is retained in `initial-head-follow-check.json`, not counted as an application defect.

Input-event checks exercise the real DOM handlers but are not described as physical pointer interactions. The mobile strength change uses actual CDP touch events. The receipt pins the exact tested JS hashes; its early screenshots and counts must not be used as proof of later material, framing or optics revisions.
