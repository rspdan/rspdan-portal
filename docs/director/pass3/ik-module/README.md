# Connected hand and foot controls

The [kinematics module](../../../../public/director/kinematics.js) gives the current Pass2 rig four endpoint editors: left/right hand and left/right foot. A two-bone analytic solve rotates the existing upper/lower arm or thigh/shin while preserving their connected rest offsets and segment lengths. Targets outside the reachable interval stop at the reachable boundary instead of stretching a joint into a thin connector. The captured bend direction is transported as the target moves. Near-straight knees start with a forward bend, while clearly bent authored poses keep their established bend plane.

Native measurements are [pinned to the frozen source](native-measurements.json). The GLB and native file were not changed. Foot and hand targets are editing proxies, not new bones. The existing twelve bone transforms remain the saved and animated pose. Assets without these verified measurements keep their existing FK controls; the module creates no assumed-length targets for them.

Hips editing can capture both foot positions relative to the whole-character root. Lowering or turning the hips then bends the legs while reachable feet remain planted. Moving the whole character carries the rig and its targets together. Cancelling a target or hips gesture restores its exact starting transforms, including an intentionally stretched older pose. A press/release with no move makes no edit. Legacy stretched limb offsets are repaired only when the user actually solves that limb.

## Actual receiving

[Seventeen browser checks](receiving.json) passed with the real GLB, zero page errors and a maximum error of approximately 1.31e-6 across twelve reachable cases. Cases include moved/rotated root and torso, minimum/maximum reach, a continuous eighty-step target path without an elbow flip, exact cancellation, saved-pose endpoint reconstruction, legacy-asset fallback, and owned-resource disposal.

Actual CDP touch sequences held a visible endpoint for 450 ms, then dragged it. The [hand](touch-hand-raised.png) and [foot](touch-foot-raised.png) screenshots were personally viewed: the limbs bend at their connected joints. The [hips study](hips-lowered-feet-planted.png) lowers and turns the body with both feet held. This is browser mobile emulation, not a claim of physical ACHE testing.

## Integration and limits

`create(scene,{nodes,neutralPose,manifest})` exposes `available`, `nodes()`, `handles()`, `labels()`, `isTarget(id)`, `setEditing(bool)`, `sync()`, `begin(id)`, `solve(id)`, `end({cancelled})`, `beginBody('torso.lower')`, `solveBody()`, `endBody({cancelled})`, `endpoint(id)` and `dispose()`.

Take the history snapshot before beginning. Invoke solving only during the corresponding direct manipulation; call sync after an ordinary FK edit, preset, saved-pose restore or animation sample. The UI retains intentional stretching as a separate choice. The normal control mode must not directly translate an elbow/knee or upper-limb attachment.

There are no independent wrist/ankle orientation bones in this asset. These controls position the tube ends. Nor is this a new per-frame animation constraint system: between-key playback still uses the existing bone interpolation, so interactive planted-foot posing does not guarantee a planted foot throughout every interpolated interval. Existing FK animation is not silently rewritten.
