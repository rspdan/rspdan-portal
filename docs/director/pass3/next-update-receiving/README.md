# Halp · Director modes receiving

Actual desktop and emulated-touch UI receiving supports the new scene workflow. The final supported checks pass; the receipt retains two initial unsuccessful touch attempts separately. These were replaced by centered touches whose actual hit targets were recorded. No application failure is inferred from the unverified initial taps.

Execution: 2026-11-25 UTC. Dan's raw source stamp remains `DPS112426 7:16pm`; it is not converted into an execution time. Halp performed this cloud receiving; local STN2 Halp remains distinct and pending reintegration.

The desktop sequence created a warm spotlight, changed its position/rotation/intensity, switched modes and undid/redid the light edit, added/rotated/scaled/deleted/restored a box, uploaded a synthetic raster background, and saved/reopened the scene. The touch sequence opened that saved take, edited a light, exercised shared history, added a sphere, changed appearance, switched Ouch/Trip, and saved/reopened again. Actual canvas readback retained the uploaded magenta/cyan raster before and after reopening; this was not merely a CSS background check. The synthetic fixture is test evidence, not Dan's art.

Temperature Undo/Redo was exercised on desktop, glow on touch mobile, and outline on the final touch check. Ouch/Trip switches retained those values. Scene fields and poses survived reopen within1e-6. The existing v1 take retained its pose, keyframes and hold behavior without rewriting its stored record.

Two local-only saves (`shared:false`):

- Desktop `dir_db002eb2-e648-403b-8a97-06183a39304e`
- Touch `dir_d0a3e75f-5880-492a-9cd3-2c1726f815a8`

The main scene pass used core `849659805ab8300884769dee0217229eaf7710bdef8943613a372ce6d1db08ec`. Final Timing/control-order checks used `1769b32c5c3231f211b4927c9174ad62607e7c2b79d96d39c3d5ab1707386c92`. Every context records all five module hashes in [receiving.json](receiving.json). Later IK changes are outside this receipt. Lighting helper visibility calibration remains the lighting agent's separate receiving; this pass does not claim its minimum screen size.

[receiving.json](receiving.json) records checks, source hashes, actual touch targets, UTC events and limits. [session.py](session.py) preserves the UI driver/scenarios. Numbered UI, raw-canvas and snapshot files preserve evidence. `receiving-before-centered-touch.json` retains the initial mobile attempts. `11-mobile-centered-delete-undo-viewport.png` shows the restored scene. `12-final-mobile-timing-viewport.png` caught the scroll in transit; `13-final-mobile-timing-settled.png` shows the actual timing controls after the scroll settles.

Desktop was1440×1000; mobile390×844 with touch emulation andDPR3 (renderer applies its own cap). Chromium used software WebGL. No physical-device, continuous-playback performance, Blender rendering parity or Director art approval is claimed. No live Send to Crew was used.
