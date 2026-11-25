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

The schema is `nest-director-take/v1`. Required fields:

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

`src/data/director-assets.json` is the server's asset/rig allowlist and is owned by the exporter. Preserve prior asset bytes and registry entries when adding an edition if existing takes must continue to replay. A saved take's hash never silently follows a newer model.

## Stores and configuration

Production requires configured `PSPT_SECRET` (at least 32 characters), `PSPT_CREDS`, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. `NEST_API_KEY` enables Crew API reading. The old temporary PSPT login and signing-secret fallbacks were removed; configured users and the signed-cookie format are unchanged.

Redis keeps the whole take and owner index in one Lua operation under `director:v1:*`. The send receipt and two existing relay channels are likewise written in one operation. Both paths preflight index types before writing. Version 1 saves are immutable; subsequent edits receive a new save ID. Store failures produce an explicit unconfirmed-operation response, never a false saved state. This first slice has no independent Blob mirror; Redis backup and retention remain the deployment's responsibility.

For development only, explicitly set `DIRECTOR_DEV_STORE_DIR` while running `astro dev`. This selects immutable filesystem records with atomic installation. It is never enabled in a production build and never activates merely because shared storage is missing. Responses are `storage: "local-workspace", shared: false`; sends are `delivery: "local-workspace-only"`. This does not contact any Crew or imply cross-device availability.

Session writes require a same-origin JSON request. The configured Crew key is accepted only for reads. Neither keys nor internal store errors are returned to the browser. Private editable notes are never written to public Blob URLs.

## Receiving and checks

Run:

```sh
node --test src/lib/pspt.test.mjs src/lib/director.test.mjs src/lib/director.http.test.mjs
```

The HTTP test starts actual Astro on loopback port 4327 using randomized test-only credentials and a disposable local store, logs in, saves, restarts the server, and compares the reopened take and hash. It also checks unauthenticated, cross-origin, malformed and oversized requests, and verifies that explicit local sending remains local. The test stops its own server and removes its temporary store.

Other checks cover owner boundaries, concurrent immutable-save conflicts, idempotent save/send retries, missing configuration, expired/invalid cookies, stable pagination and storage failure. The Redis adapter test verifies script/argument construction; **live Upstash persistence and Crew relay receiving have not been exercised by these local tests**. No deployment or production message was performed.

## Reused source entrances

- `src/pages/api/drw.ts`: existing authenticated browser persistence and explicit relay precedent. Director differs by requiring the editable artifact itself to be saved; a flat-image-only result cannot count as a saved take.
- `src/pages/api/relay/send.ts`, `receive.ts`: actual relay message shape and Crew read path.
- `src/lib/pspt.js`: configured authentication, retained cookie format.
- `src/pages/waywoodarium.astro`: existing portal-hosted WebGL precedent; that Gaussian-splat viewer is not the Ouch rig editor.
- C.B.'s November 22 Babylon demonstration already imported Blender GLB cameras and reference panels. The browser/exporter continuation owns those renderer and asset bindings.
- The recovered REPX `cad-viewer-main` study offers bounded-root and source/derived identity lessons. Its historical source fit is not a claim that its runtime or rig tools were imported into this implementation.
