# Director take storage and Crew route

November 25, 2026 UTC. This is the server slice for the Nest browser directing room. It reuses the portal's Astro runtime, configured PSPT session, Upstash store and existing `ch:bridge` / `ch:all` relay format. It does not use public Blob objects for private editable takes.

## Current contract

- `POST /api/director` with `{take, requestId}` saves a new immutable take. `requestId` is a lowercase UUID generated once per save attempt. An uncertain request may be retried with the same ID and unchanged document. A different document with that ID returns `409`.
- `GET /api/director?id=<saved id>` returns `{saved, take, storage, shared}`. An operator can read their own takes. A configured `x-nest-key` permits Crew reads.
- `GET /api/director?limit=24` lists the operator's takes. Optional `before` accepts the opaque `next` cursor from the previous page. Crew key access lists only takes explicitly routed to Crew. Same-millisecond saves remain distinct across pages.
- `POST /api/director` with `{action: "send", id, requestId}` routes an already saved take. This is a separate explicit action. Its request ID makes uncertain retries idempotent. Saving, posing and previewing never post a message.

Shared saves return `storage: "nest-shared", shared: true`. A successful send means **posted to the Bridge relay**. It does not claim recipient reading, automatic wake, dispatch or action.

The send link and context use the current API deployment's server-provided `url.origin`. Preview deployments therefore route back to their own Director room. Client take fields and POST origin/URL fields cannot change that destination. The editable take stores no deployment origin; a send receipt preserves the origin used for that send.

`saved` contains the immutable ID, version, owner, time, SHA256 of normalized editable take JSON, pinned asset, frame count, look and `/director?take=<id>` entrance. `GET` supplies the complete editable document; no download/upload step is required.

## Editable document

The server accepts `nest-director-take/v1` and `nest-director-take/v2`. Both require the fields below. Version 1 keeps its original normalization, field order and hash, with stepped/hold playback; it receives no version 2 defaults.

| Field | Content |
| --- | --- |
| `asset` | Registered `{id, sha256}`; no client URL or file path. |
| `name`, `notes` | Text, at most 100 and 4,000 characters. |
| `look` | `ouch` or `trip`. |
| `fps`, `frame`, `range` | Integer rate 1–60, current frame, `{start,end}`. Frames start at 1. |
| `stage` | `{background: "white" | "green" | "transparent"}`. |
| `camera` | `{mode, position, target, fov, orthoSize}`; position/target are 3-vectors, FOV is radians. |
| `pose` | Complete registered bone transforms and morph values. |
| `keyframes` | At most 600 distinct increasing `{frame, pose}` entries. Every entry is a complete pose. |

Each `pose.bones[name]` is `{position:[x,y,z], rotation:[x,y,z,w], scale:[x,y,z]}` in the exported node's local space. Rotation is a unit quaternion. `pose.morphs[name]` holds each registered shape's weight. The server bounds numeric ranges, rejects nonfinite values, unknown fields and missing/extra bones or morphs. The complete request is limited to 2 MiB.

Version 2 additionally requires:

| Field | Content |
| --- | --- |
| `animation` | `{transition, loop}`. `transition` is `hold`, `linear`, `ease-in`, `ease-out` or `ease-in-out`; `loop` is a boolean. |
| `output` | `{width, height}` in pixels. Each dimension is an integer from 64 through 4096, with total area no greater than 4096 × 2160 pixels. Portrait and landscape use the same limit. |
| `keyframes[].transition` | Optional override using the same transition names. It governs the interval **starting at this key** and ending at the following key. Omission means use `animation.transition`. |

Version 2 also accepts optional global scene fields. Older records retain these fields as omitted during normalization, preserving their existing hashes:

| Field | Content |
| --- | --- |
| `tripGlow`, `tripTemperature` | Glow from 0 to 1 and emitted-light temperature from 1800 to 10000 K. By default, temperature affects the body, surrounding radiance and nearby light spill. |
| `tripBodyTemperature` | Optional separate body temperature, 1800 to 10000 K. Omission links the body to the emitted temperature. Explicit 6500 keeps the shaded body neutral white while the exterior halo and projected light change temperature. |
| `tripFlare` | Independent head-centered optical flare, 0 to 1. Default Off; body glow never automatically enables it. |
| `tripLens`, per-light `lens` | Optional optical recipe: `preset` is `glow`, `starburst`, `anamorphic` (Glow + streak), or `glass` (Multi-Iris). Component weights `glow`, `rays`, `streak`, `ghosts` are 0 to 1; `spread` is 0.25 to 2; `rotation` is -180 to 180 degrees; `rayCount` is an integer from 4 to 16. A present recipe includes all fields. Omitted recipes use Compact glow in the renderer without adding fields to previously saved takes. Style and component changes do not enable flare intensity automatically. |
| `outline` | `{enabled,tone,width}` for either character. Tone runs from black (0) to white (1); world-space width is 0.0005 through 0.01. |
| `lighting` | Ambient color/intensity plus at most eight point, spot or directional lights, each with a stable ID, name, enabled state, color, intensity, position, rotation, beam angle and range. Optional light attachment is `world`, `head`, `hand.L` or `hand.R`; attached transforms are local offsets. Optional effect is `{shape: none/ball/beam, radius: 0.005..1, length: 0.05..10, strength: 0..1}`. Optional `flare` is an independent camera-responsive optical strength from 0 to 1, initially Off. Visible effects are separate from receiver illumination. |
| `stage.design` | Color/raster backdrop and fit, floor controls and at most 32 box/sphere/plane set pieces with stable IDs, names, colors and transforms. |

Scene IDs cannot collide with each other or rig IDs. Numeric fields and exact keys are validated in `directorSchema.js`. Background images must be bounded embedded base64 PNG/JPEG/WebP data URLs, at most 400,000 characters; remote URLs and SVG are rejected. The browser normalizes imported raster images and handles decode failure. These are take-wide settings, not additional keyframe channels. Green/transparent output modes retain the editable room design while hiding its backdrop and floor.

The server retains omitted key overrides as omitted, so changing the global transition still affects inherited intervals. `hold` keeps the starting pose until the next key. The existing `range` controls length in frames and `fps` controls playback rate; those limits remain unchanged. Version 1 rejects the new fields rather than silently changing legacy playback. Unknown fields inside `animation`, `output` and each key are rejected. Saving changed easing or output size creates a new immutable take whose hash includes those settings; existing saved takes remain unchanged.

The room's **Timing** button opens the motion controls. Length is the inclusive frame count divided by FPS. Length changes can scale the key spacing; changing FPS can preserve either seconds or frame numbers. Integer rounding that would merge two keys is rejected. The selected key's transition explicitly governs motion to the next key. Cubic easing drives position, scale and morph interpolation, with normalized shortest-path quaternion SLERP for rotation. Playback can loop or stop at the last frame.

Frame size changes the visible camera gate and is retained for native rendering. Browser preview resolution remains capped for the device; selecting a large output size does not force the phone to render that many pixels while editing. **Frame motion** uses bounded samples and one fixed camera; it is a staging aid, not an exhaustive guarantee for extreme or densely keyed takes. Two four-pose studies are editable starting points, not approved final animation.

A quick tap selects a control dot; holding it for 350 ms enables camera-plane repositioning where that control supports Move. On the measured Pass 2 rig, hand/foot endpoints solve connected two-bone limbs with bounded reach. Hips gestures can keep reachable feet planted, while whole-character movement carries the hierarchy together. Other joint pivots rotate by default. Explicit Stretch restores freeform joint translation/scaling for deliberate exaggeration. Release commits one undoable edit; cancellation restores the gesture's starting pose. These endpoint controls are derived editors, and the existing twelve bone transforms remain the saved pose. Playback still interpolates those bones; it does not impose continuous foot constraints between keys. Independent wrist/ankle rotation bones are not present. Older unmeasured assets retain their existing FK controls.

Undo/Redo keeps up to 60 edit states within the current browser session, with visible backward/forward counts. Separate drags remain separate steps. Pose controls, timing, keys, stage/look, frame dimensions, grouped text edits and camera gestures enter that history; a new edit after Undo clears the old forward branch. Saved takes remain the durable version history across reloads; the session Undo stack is not claimed to persist through a reload.

The v2 Blender receiver is maintained separately in `rspdan/nest-bridge`, under `ShellGame.Development/ODK.Pass2/animation-v2`. It preserves render dimensions and timing, with integer-frame samples matching the browser. The earlier frozen portable ZIP retains its v1 importer; it does not acquire v2 support through a documentation update.

That native receiver does not yet reproduce the new browser scene/material settings. Preserve the exact take JSON for future receiving. Browser transparent cutouts also do not currently preserve the visible glow halo. [Pass 3 implementation and evidence](director/pass3/current-update.md) document the current scope.

`src/data/director-assets.json` is the server's asset/rig allowlist and is owned by the exporter. Preserve prior asset bytes and registry entries when adding an edition if existing takes must continue to replay. A saved take's hash never silently follows a newer model.

## Stores and configuration

Production requires configured `PSPT_SECRET` (at least 32 characters), `PSPT_CREDS`, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. `NEST_API_KEY` enables Crew API reading. The old temporary PSPT login and signing-secret fallbacks were removed; configured users and the signed-cookie format are unchanged.

Redis keeps the whole take and owner index in one Lua operation under `director:v1:*`. The send receipt and two existing relay channels are likewise written in one operation. Both paths preflight index types before writing. The storage envelope stays at version 1 for both take schemas. Saves are immutable; subsequent edits receive a new save ID. Store failures produce an explicit unconfirmed-operation response, never a false saved state. This first slice has no independent Blob mirror; Redis backup and retention remain the deployment's responsibility.

For development only, explicitly set `DIRECTOR_DEV_STORE_DIR` while running `astro dev`. This selects immutable filesystem records with atomic installation. It is never enabled in a production build and never activates merely because shared storage is missing. Responses are `storage: "local-workspace", shared: false`; sends are `delivery: "local-workspace-only"`. This does not contact any Crew or imply cross-device availability.

Session writes require a same-origin JSON request. The configured Crew key is accepted only for reads. Neither keys nor internal store errors are returned to the browser. Private editable notes are never written to public Blob URLs.

## Receiving and checks

Run:

```sh
node --test src/lib/pspt.test.mjs src/lib/director.test.mjs src/lib/director.http.test.mjs
```

The HTTP test starts actual Astro on loopback port 4327 using randomized test-only credentials and a disposable local store, logs in, saves both take schemas, restarts the server, and compares each reopened take and hash. Version 2 coverage includes easing, an interval override, loop mode and portrait output size. It also checks unauthenticated, cross-origin, malformed and oversized requests, and verifies that explicit local sending remains local. The test stops its own server and removes its temporary store. A separate frozen hash test verifies that version 1 normalization is byte-for-byte unchanged.

Other checks cover owner boundaries, concurrent immutable-save conflicts, idempotent save/send retries, missing configuration, expired/invalid cookies, stable pagination and storage failure. The Redis adapter test verifies script/argument construction. These local tests do not exercise live Upstash or Crew relay receiving.

Separate actual preview receiving in `docs/director/receiving/live-preview-receiving.json` records form login, one shared save and exact reopening of that editable take. `live-preview-login-receiving.json` records a second login check using the user-selected branch credential without repeating that shared write. Credentials and temporary access links are excluded from these records. No live Crew message was sent.

The Director preview branch is `codex/nest-director-white-room`, with entrance `https://rspdan-portal-git-codex-nest-director-white-room-rspdan.vercel.app/director`. Vercel deployment access and the portal login are separate gates. The preview's branch-scoped credential does not change production users.

The current browser asset is the clean Pass 2c edition, `ouch-director-pass2-ad640bbaf1fd.glb`, derived from native SHA256 `85f6d78d9548da19b97d800425d236c58d08bca3e8654b784cb319ecb62eff28`. The original Pass 1 asset remains immutable and registered so saved takes can reopen against their original rig. Browser drafts are kept separately per asset hash. The browser uses a rough PBR approximation of the native clay material; it does not reproduce the native procedural surface exactly.

### ACHE as the first device baseline

Dan's actual ACHE Chrome receiving found blurred rendering and joint controls that could not be manipulated. Earlier narrow desktop screenshots did not establish touch usability. High-DPI resolution had been scaled backwards, and character geometry intercepted taps on joint dots drawn over it. The corrected room renders up to two pixels per CSS pixel, excludes the body from picking, and allows touch taps within 22 CSS pixels of a joint. Rotation rings keep priority and camera dragging stays separate. Frame fits the evaluated pose into the available camera view.

`mobile-touch-diagnosis.json` and `mobile-touch-baseline.json` in the receiving directory use Chromium with mobile mode, touch enabled and DPR3, with actual CDP touch events. They verify joint selection, finger rotation without camera movement, keying, local save and exact reopening. This is mobile emulation; Dan's next ACHE run is the actual device receiving. ACHE is the first acceptance target, with other Stations still requiring their own platform/input checks.

## Reused source entrances

- `src/pages/api/drw.ts`: existing authenticated browser persistence and explicit relay precedent. Director differs by requiring the editable artifact itself to be saved; a flat-image-only result cannot count as a saved take.
- `src/pages/api/relay/send.ts`, `receive.ts`: actual relay message shape and Crew read path.
- `src/lib/pspt.js`: configured authentication, retained cookie format.
- `src/pages/waywoodarium.astro`: existing portal-hosted WebGL precedent; that Gaussian-splat viewer is not the Ouch rig editor.
- C.B.'s November 22 Babylon demonstration already imported Blender GLB cameras and reference panels. The browser/exporter continuation owns those renderer and asset bindings.
- The recovered REPX `cad-viewer-main` study offers bounded-root and source/derived identity lessons. Its historical source fit is not a claim that its runtime or rig tools were imported into this implementation.
