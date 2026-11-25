# Original lens-type receiving

Status: functional receiving passed; visual direction remains for Dan to assess. This replaces the rejected compulsory-streak/ghost trial, not its historical evidence.

Source: `public/director/optics.js`, SHA-256 `029b264c263e0a451a407da0b9fdcad6693d36e4fed8f6a45a473ae5c9469643`.

## Scope and results

Actual Chromium with software WebGL, integrated Director scene, independent controller attached to the existing geometric head source. Local receiving; no live Save/Send or production changes. Sources were pinned by route interception and their hashes recorded. Captures wait three completed scene renders; no fixed-delay assumption.

`receiving.json`: **23 checks passed, no page errors**. Covers four defaults; fresh helper objects; identical fixed-state diagnostics and PNG pixels; camera pan, approach and source movement; full/partial blocking; behind-camera/offscreen hiding; rotation, spread and ray count; all components disabled; bounded inputs; master Off; repeat apply/create/dispose resource counts.

The agent personally inspected the four-type contact sheet, individual Glow, Glow+Streak and radial captures, mixed Multi-Iris+Glow+Streak, camera-pan, full/partial blocking, vertical streak and 13-ray burst. The camera pan visibly changes reflection placement. Fixed source/camera produces identical pixels. The contact sheet pastes original screenshot pixels without resampling. This fixture predates the separate grounding refinement and does not evaluate that work.

## Visuals

- `four-types-contact-sheet.png`: compact Glow; Glow+Streak; optional radial Starburst; optional Multi-Iris.
- `preset-multi-iris-with-glow-streak.png`: independent component combination.
- `02-camera-pan.png`: source-relative reflected aperture movement.
- `07-rotated-anamorphic.png`: vertical streak at 90 degrees, spread .65.
- `08-thirteen-ray-starburst.png`: ray count 13, rotation 22 degrees, spread 1.4.

## Contract

`DirectorOptics.create(scene, emitter, options)` returns `apply`, read-only cloned `inspect`, and idempotent `dispose`.

`apply` keeps `strength`, RGB-array `color`, `sourceRadius`; optional `lens` contains `preset`, `glow`, `rays`, `streak`, `ghosts`, `spread`, `rotation`, `rayCount`. Four weights are 0–1; spread .25–2; rotation −180–180 degrees; ray count integer 4–16. `DirectorOptics.defaults(preset)` returns a fresh full config. Missing lens defaults to compact Glow; missing individual settings inherit their selected preset. Master strength 0 is Off.

Preset weights (glow/rays/streak/ghosts): Glow 1/0/0/0; Starburst .5/1/0/0; Glow+Streak .35/0/1/0; Multi-Iris .7/0/0/1. Persisted internal IDs remain `glow`, `starburst`, `anamorphic`, `glass`. Existing explicit component weights are honored. Reflections are optional; the three use the same original filled-aperture texture family. No imported plugin assets, arbitrary time pulse or compulsory reflections.

## Preserved fixture correction

`initial-disabled-streak-fixture.json` records a harness failure against the preceding 15a45175 module. Its camera-pan assertion incorrectly expected a disabled streak (weight 0 under Glass) to change brightness. The corrected assertion compares the enabled reflection color and position. No runtime errors occurred. The complete current-source rerun passed.

The rejected earlier module is preserved at `../dynamic-optics/rejected-source/optics-rejected-aab14efe.js`; its pictures are not approval evidence for this version.


Dan subsequently described this flare work as good and requested the Director controls for further refinement, supplying the radial-starburst example. His next blocker concerns underfoot glow and surface contact, handled separately. This records that feedback without treating every preset and parameter combination as a finished artistic design.
