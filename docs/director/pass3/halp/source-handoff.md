# Halp · RepoWise to Trip source handoff

2026-11-25 UTC. Read-only research under C.B.; Bee owns the fresh pixel review. DTAD discipline applied from `nest-bridge/ENGINE/skills/dtad/SKILL.md`: retain observation, attribution, gaps and Director correction separately. No model/material/background/source edits and no index refresh were performed.

## Actual capability, not an installation proposal

`/workspace/nest-bridge/ENGINE/Repowise.md` and the art package's `REPOWISE.md` describe the installed0.62.0 CLI/stdio MCP. Current tool discovery has no native RepoWise namespace. `repowise-status.json` is a fresh actual CLI result: mapping valid, indexed commit `5463c84c14fd77a76497e9eb3980b0d8efb2e9bb` matches checkout HEAD, full-text available, semantic search unavailable, provider absent, embedder mock, two stale pages. Dirty/new files still require direct source inspection. No LLM/semantic capability is implied.

From the Bridge checkout, the direct server invocation is:

```sh
REPOWISE_TELEMETRY_DISABLED=1 repowise mcp /workspace/nest-bridge
```

`query_repowise.py` is a small read-only client adapted from Bee's retained Pass2 client. Its request batch and actual server inventory are retained in `repowise-requests.json` and `repowise-requests.surface.json`. The Python interpreter with MCP installed is `/home/agent/.local/share/uv/tools/repowise/bin/python`. The client refuses to overwrite receipts; use new receipt names for a new encounter.

Actual queries located `ENGINE/photo_migration/art_families.py` and returned the complete `Locations.resolve` body with a verified source skeleton. This is useful targeted code context. The graph also incorrectly labels several `pathlib.Path.resolve()` sites as callers of our `Locations.resolve`; the real self-call in `projected_links` is verified in current source. This concrete false-positive is preserved in `repowise-locations.json`. Finding a graph edge is not validation of a dependency or proof that a test ran.

## Followed into LIBX records

`Dan.Art.Style-study_112326_1.md` lines392/682 and the Part1 source manifest lead to:

| Occurrence | Original | SHA256 | Identity evidence |
|---|---|---|---|
| Part1/287 | Art Scans856.jpg | d8b368e34bbb9f7a913cd8a0dc0b2685534fc33807a9b77636cf1260d3011f34 | Dan names Trip McClip with this exact image. |
| Part1/243 | Art Scans731.jpg | 06376e6c201d3b2c9e4a70ea01e40c3a2d883e496afbce674a37f84a431756a6 | Existing study recognizes Trip against that named anchor. |

Actual filenames include spaces: **Art Scans 856.jpg**, **Art Scans 731.jpg**. Both full originals exist and their bytes match the manifest at:

`/workspace/Cloud.CB_112026_1/output/Dan.Art.Availability_112326_3/DPS-ART_112326_1.originals/DPS-ART_112326_1/`

The portable art package retains corresponding1024px thumbnails. Its `locations.json` resolves those thumbnails into the repo. Full originals are intentionally not inside the portable checkout; `Locations.projected_links` correctly routes their unavailable portable destinations to `ASSETS.md`, retaining the original historical paths alongside. `libx-locator-check.json` records the exact values from executing this existing resolver. `trip-original-existence.json` records independent byte checks. No filename or ingestion mtime is promoted to a making date.

The code index helped find the navigation machinery. The retained manifest/owner statement supplied the source identity. Bee then actually viewed the art. These are three different operations, and all three matter. Bee's source teachback is under `ShellGame.Development/ODK.Pass2/Bee/Trip-visibility-source-study`; Halp does not duplicate or claim that visual encounter.
