# Halp · integrated mobile IK receiving

Twenty-one supported checks pass in the actual local Director UI, with zero page errors. This pass used touch emulation to move hand/foot targets, lower and turn the hips, cancel gestures, undo/redo, carry the character with its root, switch scene modes, and save/reopen keyed poses. The earlier broad scene-mode suite was not repeated.

Halp executed this on 2026-11-25 UTC. Dan's raw source stamp `DPS112426 7:16pm` remains separate. This is the cloud encounter; local STN2 Halp remains distinct and pending reintegration.

## Actual sequence and evidence

1. Opened an independent mobile context (390×844, DPR3), verified Connected default and four named endpoints, and keyed the neutral pose at frame1.
2. At frame24, held the actual left-hand marker for470ms and dragged it 23CSSpx left /40px up. The end moved0.170486 world units; the existing two arm bones rotated and their offsets/scales matched the authored rest exactly. The actual [hand image](02-mobile-hand-raised-canvas.png) shows a joined bent arm. Undo/Redo restored each pose.
3. Held and dragged the right foot 10px left /32px up. Its connected thigh/shin offsets remained exact. The [foot image](03-mobile-foot-raised-canvas.png) shows the resulting bend. Moving the other hand and dispatching an actual touch cancellation restored all twelve bone transforms exactly. Keyed the pose at24.
4. At frame48, selected neutral, held the hips marker, and lowered it20px. Hip height changed from0.540927768 to0.465301472; both foot endpoints stayed within8.85e-9 world units of their original positions. A verified45° touch rotation then kept feet within1.19e-8. [Lowered](04-mobile-hips-lowered-canvas.png) and [turned](06-mobile-hips-verified-rotation-canvas.png) actual canvas images were viewed. Rotation Undo/Redo passed; cancelling another hips gesture restored the entire pose exactly. Keyed the resulting pose.
5. At frame64, moved the whole-character X control to0.3. All four endpoints moved by the same root displacement. Lighting/Stage switches preserved pose and hid the endpoint helpers outside Pose mode. Ordinary shoulder Move/Scale remained locked; explicitly enabling Stretch allowed them, and toggling it back preserved the pose.
6. Saved through the actual UI to local sandbox take `dir_f413efe7-d880-4d3d-a0a6-09493de1da97`, with `shared:false`. Closed that context and opened the saved take in a fresh mobile context. All keyed poses and current pose survived; reconstructed endpoints matched exactly. [Reopened canvas](08-mobile-fresh-reopened-canvas.png) was actually viewed. No Send to Crew was used.

## Source bindings and corrected attempts

The tested core was `d2ae204b9ebe0c4286d343bd8e8ed633026edefe95c20f636ac9e13fddebf727`; solver was `e1a8bf94d244b58e4d73220adafcaa454ca69d29fd111cc42a2d493fd2c5f360`. Each context records all loaded module hashes in [receiving.json](receiving.json). The subsequent draft-quota warning/beforeunload fix is a separate integration-agent check; this receipt does not relabel its source.

Four initial check results are preserved and excluded from the supported set:

- The initial hand classifier compared neutral-export offsets against solved offsets at1e-7. Inspection found a4.17e-7 change to the exact authored rest, which is intentional. The replacement check compares those rest values exactly, without loosening a tolerance.
- The first requested12° touch range move produced no `input` or `change` event and left the displayed angle at0. Its apparent stationary-foot pass and Undo/Redo attempt cannot establish rotation behavior. A separate verified45° gesture produced actual input/change and passed planted-foot and history checks. No application history bug was found in this diagnostic.

The full records retain those attempts, event coordinates/hit targets, numeric observations and screenshots. [session.py](session.py) contains the gesture and observation helpers. All scene modifications used UI input; JavaScript reads projected markers, live transforms and snapshots for measurement. No test directly assigned rig poses or called the solver to manufacture the tested results.

## Limits

IK is an editing operation baked into the existing twelve bone transforms. Endpoint helpers are derived controls, not extra saved bones or per-frame constraints. Between-key playback still uses FK bone interpolation: planted endpoints at edited keys do not guarantee continuous foot planting, collision avoidance or contact through every intermediate frame. This pass received reachable gestures; the solver agent owns wider-range/clamping tests.

Chromium ran with software WebGL and touch emulation. This is not physical ACHE testing, a performance benchmark, native Blender receiving or Director art approval. The frozen model and native source were not edited. All owned browser contexts were closed before releasing the source lock.
