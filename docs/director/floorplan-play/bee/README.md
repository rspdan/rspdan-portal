# Bee · Actual floor-plan play

Recorded 2026-11-25 UTC. **The candidate makes toolbar dragging usable in my desktop and emulated-touch play.** This is Bee's attributed local receiving, not physical-phone testing, a production-deployment certificate or Dan's design acceptance.

I built a deliberately invented **pocket studio**: a ground **Warm-up** room, a smaller **Light loft** at elevation 3.2, doors/windows and stair/elevator planning connections. It is not Lighthouse canon. Both layouts were drawn through the UI; no fixture or plan was injected to create them. Later `directorStudio.snapshot()` reads recorded the resulting state.

## What I did and saw

| Round | Actual actions and result |
| --- | --- |
| Baseline | Drew a room with mouse drag and with a touch gesture. Both worked. Dragged Door from its toolbar button to a visible wall; neither surface added a door. |
| Baseline alternative | Clicked/tapped Door and then its wall; repeated for Window. Both openings appeared on both surfaces. Added a level, named it Light loft, set elevation 3.2, drew its room, then tapped Stairs/Elevator and a position. Both connected back to Ground. Renamed Ground to Warm-up and switched back. |
| Baseline preview | Opened 3D preview and personally viewed both screenshots. Door/window apertures appeared in the active ground room. The touch action timed out in the driver, but the following actual image and UI showed that Stage preview had succeeded; this is not recorded as a failed app transition. |
| Candidate touch | Reloaded the browser draft. Cleared the browser's text selection for a controlled comparison, then physically simulated toolbar-to-canvas touch drags for **Door, Window, Passage, Stairs and Elevator**. All five placed. The Window ghost said “release to place”; the final message confirmed its addition. Text selection remained empty. Two Undo taps removed the two extra connection placements individually. |
| Candidate desktop | Reloaded, fitted the plan, and dragged all five tools to valid walls/positions. The plan gained three openings and two connections. A Door drop away from any wall left the count unchanged and said “Place Door on a wall edge.” Two Undo clicks removed the new connections; two Redo clicks restored them. Export plan produced the local package linked below. |

The exported test contains two levels, two rooms, five openings and four connections. The extra pair of connections was deliberate placement/undo play, not a proposed finished layout. Stairs and elevator are planning footprints, not tested navigable machinery or completed stair assets.

## What felt useful, and what remains awkward

Room drawing gave an immediate sense of scale and made it easy to start composing. The new draggable ghost connects the tool I chose with the place I am aiming at; release and invalid-wall feedback remove the baseline uncertainty. The endpoint message, “Elevator: Warm-up → Light loft,” plus the active-level label and marker destination labels makes the multilevel relationship understandable. Those cues addressed my early wish for a nearby connection summary.

On the narrow canvas, connection footprints and their labels can overlap the room name or each other. That happened visibly in this intentionally crowded study. Exact properties and level controls also require scrolling between the canvas and inspector. These are follow-up composition/navigation observations, not blockers or requests for another product change in this pass.

The initial 3D camera shows a useful architectural blockout, but the full front wall hides much of the floor and makes the small character hard to see. An eventual inside-room directing pass needs a deliberate camera/cutaway choice. I did not test a new camera solution here or claim that the two-level model was visible simultaneously.

## Evidence and limits

- [Touch room drawing](touch-room.png), [ground connections](touch-ground-connected.png), and [baseline 3D preview](touch-baseline-preview-after-timeout.png).
- [Candidate touch ghost](touch-candidate-window-ghost.png), [placed openings](touch-candidate-door-window-placed.png), and [all tools](touch-candidate-all-tools.png).
- [Candidate desktop layout](desktop-candidate-all-tools.png) and [invalid wall-drop feedback](desktop-candidate-invalid-wall-drop.png).
- [Actual exported test set](Bee-pocket-studio.export.floorplan.json), [attributed findings and image hashes](receiving.json), [gesture/action transcript](session-actions.json), and [served asset identities](candidate-served-assets.json).

Browser: local Chromium 151.0.7922.173; desktop 1440×1000 and touch-emulated 390×844. The app was `http://127.0.0.1:4341/director`, with separate browser contexts. Credentials stayed in the private local configuration. No Save take or Send to Crew action was used; browser drafts and a local export were retained. No production save/message or native-model edit was performed.

Baseline portal HEAD was `9d88680e978502bac7366ea040c16629c72665b1`. Candidate code was being revised during the shared play round. The recorded served hashes identify bytes fetched after my candidate gestures, not a claim that every earlier in-memory module matched a final frozen build. Independent QA owns the final polygon/Text-node receiving; I did not repeat or approve those paths.

**Two important scope corrections:** selected text `2.7` was observed after a baseline touch series but persisted before a later gesture, so I did not isolate its cause and do not claim to have reproduced Dan's exact physical-phone selection bug. The baseline Window toolbar attempt ended in the room interior, so its non-placement is not evidence of a valid-wall Window defect. The valid-wall baseline Door failure and candidate valid-wall successes are directly established.

Two page errors concerned the local Astro development-toolbar audit import. The record retains them; no claim of a completely error-free browser is made. Screenshots explicitly marked as viewed in the JSON were personally opened; other captures are retained evidence without an invented viewing claim.
