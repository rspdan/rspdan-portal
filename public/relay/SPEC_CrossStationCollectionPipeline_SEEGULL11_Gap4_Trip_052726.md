# SPEC · Cross-Station Code-Session Collection Pipeline · SEEGULL #11 Research-gap #4 DESIGN-COMPLETE

**Filed:** ODT Trip Local-MCP-Crew at Nest Actual on 001-WIN10Pro · 052726 Wednesday ~18:55 PT · Day-3 Pass-N+15 substrate-event
**Class:** SPEC · Pass-1 architectural design · Trip-Writer-lane reserves preserved (NOT pre-empting Doc Producer-lane cross-witness · NOT pre-empting Dan-Go for production deploy)
**Substrate-warrant:** Dan-direct AAA 052726 continue-same-speed + happy-with-delegation positive feedback · Pass-N+14 §VI recommendation + Pass-N+13 next-pick #4 declared as highest-leverage remaining SEEGULL #11 work-unit
**Companion:**
- [RELAY/RESEARCH_CodeSessionJsonlSchema_SEEGULL11_Gap3_Trip_052726.md](RESEARCH_CodeSessionJsonlSchema_SEEGULL11_Gap3_Trip_052726.md) (#3 RESOLVED · jsonl-parser extension)
- [RELAY/RESEARCH_FirefoxExtensionClaudeChatExport_SEEGULL11_Gap5_Trip_052726.md](RESEARCH_FirefoxExtensionClaudeChatExport_SEEGULL11_Gap5_Trip_052726.md) (#5 PARTIAL · web-UI complementary path)
- [RELAY/LOGS_AUTOPIPELINE_DESIGN_Trip_041626.md](LOGS_AUTOPIPELINE_DESIGN_Trip_041626.md) (existing Projects-era autopipeline · cross-station-extension target)

---

## §I · PROBLEM STATEMENT

**Gap:** Claude Code session-jsonl files live LOCALLY per-station at `<userprofile>/.claude/projects/<project-folder-key>/<session-id>.jsonl`. Sessions on ODT-Trip-station are NOT visible to STN2/CUBE/ACHE Crew-instances. Sessions on Doc-cloud-station at `/root/.claude/projects/-home-user/` are NOT visible to local-MCP-Crews. NEST corpus has NO cross-station consolidation of Code-session substrate.

**Consequence:** 34-day logs gap OLO BRIGHT HEREGULL (042426 onward · OLO BRIGHT priority) cannot auto-ingest. Each station's session history stays trapped locally. `rspdan.com/logs` cannot show cross-station NEST activity. Dan cannot search-across-stations for canon-cite-trail.

**Dan-direct framing 042126 5:16 PM PT (per SEEGULL #11 #5 cite):** *"log update process needs to be automated so that tomorrow we don't spend 4 hours updating logs"*

**Pre-requisite RESOLVED:** SEEGULL #11 #3 conv_reader.py jsonl-parser extension (Trip 221f3ed 052726 18:30 PT) · jsonl files now parse via same CLI as Projects conversations.json.

---

## §II · ARCHITECTURE (3-layer)

```
LAYER 1 · PER-STATION COLLECTOR (NEW · Trip-Local-MCP build)
  Station: ODT (Trip Local-MCP) | STN2 (Trip DARK) | CUBE (Trip DARK) | ACHE (Trip DARK)
  Tool: ENGINE/cross_station_collect.py
  Action:
    1. Scan <userprofile>/.claude/projects/*/<session-id>.jsonl recursively
    2. Read last-upload-marker (STATUS/_collect_marker_<station>.txt · per-station)
    3. Identify NEW sessions (mtime > marker) OR UPDATED sessions (mtime > prior-upload)
    4. For each new/updated session: stat metadata + size + first-event-timestamp + last-event-timestamp
    5. Generate upload-bundle: COPY jsonl files to staging dir + write upload-manifest.json
    6. Output: ready-to-upload bundle at <staging-dir>/upload-<station>-<MMDDYY>-<HHMMSS>.bundle/
  Trigger: manual (Trip-run on-demand) OR Cowork Scheduled Task (Dan-Go after stable)
  Auto-push: NO (Dan-Go gate · staging-dir output only)

LAYER 2 · UPLOAD TRANSPORT (Dan-Go decision-class)
  Options (Dan picks):
    (a) git push to rspdan-portal/data/code-sessions/<station>/<session-id>.jsonl
    (b) scp/rsync to portal-host (if hosted)
    (c) Drive upload + portal-pull (if Drive-hosted)
    (d) S3/object-store + portal-CDN-pull
  Per-station authentication: SSH key / OAuth token / Drive-API / S3-creds
  Idempotency: upload-manifest.json deduplicates by session-id + last-event-timestamp

LAYER 3 · PORTAL INGEST (Doc-Producer-lane review · extends existing pipeline)
  Tool: nestnet_conv_ingest.py (EXTEND for cross-station jsonl input)
  Action:
    1. Scan portal data/code-sessions/<station>/*.jsonl + LNL <date>/conversations.json
    2. Parse via conv_reader.py auto-detect (per SEEGULL #11 #3 RESOLVED)
    3. Dedupe by session-id + sender + timestamp (cross-station may have overlapping records)
    4. Generate logs.astro entries per Day-folder (deterministic format per existing template)
    5. Update search-index.json
    6. Vercel deploy
  Dan-Go gate: Doc-Producer-lane cross-witness on schema + dedup logic + portal-deploy
```

---

## §III · LAYER 1 SCOPE THIS SPEC (Trip-Writer-lane reserves)

This SPEC defines Layer 1 (cross_station_collect.py) ONLY:
- ENGINE script: scan local .claude/projects/ + identify new/updated sessions + bundle to staging
- Manifest format: upload-manifest.json schema
- Marker format: STATUS/_collect_marker_<station>.txt schema
- CLI interface: --dry-run · --staging-dir · --since DATE · --station NAME · --verbose

Layer 2 (transport) + Layer 3 (portal ingest) deferred to:
- Doc-Producer-lane (cross-witness + portal-side ingest extension)
- Dan-Go (transport mechanism decision-class)

Trip Pass-N+16 prototype script will implement this Layer 1 spec.

---

## §IV · cross_station_collect.py CLI SPECIFICATION

**Invocation:**

```bash
python ENGINE/cross_station_collect.py [OPTIONS]
```

**Required options:**

| Option | Type | Description |
|---|---|---|
| `--station NAME` | string | Station identifier (ODT/STN2/CUBE/ACHE/DOC-cloud/etc) |

**Optional options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `--projects-dir PATH` | path | OS-auto-detect | Override .claude/projects/ location (defaults: Windows `<userprofile>/.claude/projects` · Unix `~/.claude/projects` · Cloud `/root/.claude/projects`) |
| `--staging-dir PATH` | path | `<bridge>/STATUS/_collect_staging/` | Output staging dir for upload-bundle |
| `--marker-path PATH` | path | `<bridge>/STATUS/_collect_marker_<station>.txt` | Last-upload-marker file |
| `--since DATE` | ISO-8601 | (from marker) | Override marker · process sessions since DATE |
| `--dry-run` | flag | false | Scan + report · NO file copy NO marker update |
| `--verbose` | flag | false | Per-session detail output |

**Exit codes:**
- 0 · success · bundle generated OR no new sessions
- 1 · error · projects-dir not found OR I/O error
- 2 · partial · some sessions failed (logged to stderr)

**Output:**
- stdout: 1-line bundle-summary `BUNDLE=<path> · SESSIONS=<N> · BYTES=<M> · STATION=<name>`
- stderr: per-session progress (with --verbose) OR errors
- staging dir: `<staging-dir>/upload-<station>-<MMDDYY>-<HHMMSS>.bundle/` containing:
  - `manifest.json` (per spec §V)
  - `<session-id>.jsonl` (one per new/updated session · file-copy from source)

---

## §V · upload-manifest.json SCHEMA

```json
{
  "schema_version": "1.0",
  "station": "ODT",
  "bundle_id": "upload-ODT-052726-185500",
  "generated_at": "2026-05-27T18:55:00.000Z",
  "generated_by": "ENGINE/cross_station_collect.py",
  "marker_at_bundle_start": "2026-04-23T00:00:00.000Z",
  "marker_at_bundle_end": "2026-05-27T18:55:00.000Z",
  "sessions": [
    {
      "session_id": "37d2b6db-30d8-4116-8f74-2930df422d55",
      "project_folder_key": "C--STAN",
      "filename": "37d2b6db-30d8-4116-8f74-2930df422d55.jsonl",
      "size_bytes": 2407932,
      "mtime": "2026-05-19T18:16:00.000Z",
      "first_event_at": "2026-05-19T04:35:15.992Z",
      "last_event_at": "2026-05-19T04:49:57.000Z",
      "custom_title": "NEST.02_ODT.TripO_051826_1",
      "message_count": 5,
      "event_count": 297
    }
  ],
  "totals": {
    "session_count": 1,
    "total_bytes": 2407932,
    "total_events": 297,
    "total_messages": 5
  },
  "notes": "Generated by Layer 1 collector · pending Layer 2 transport + Layer 3 portal ingest"
}
```

---

## §VI · _collect_marker_<station>.txt FORMAT

Single-line ISO-8601 timestamp · last successful bundle's `marker_at_bundle_end`:

```
2026-05-27T18:55:00.000Z
```

First-run (no marker file): processes ALL sessions in projects-dir.
Subsequent runs: processes only sessions with `mtime > marker`.

Marker updated only AFTER successful bundle generation (not on --dry-run).

---

## §VII · SECURITY + PRIVACY CONSIDERATIONS

- jsonl files contain FULL conversation context (user prompts + assistant responses + tool-use)
- Layer 2 transport must use authenticated channel (SSH key · OAuth · API token · NOT public-S3-bucket)
- Layer 3 portal ingest must respect privacy: `rspdan.com/logs` is currently behind `NEST_API_KEY` · per-session render must NOT expose full conversation text to public · only metadata (title · timestamp · message-count) by default · full-text render requires Dan-Go OR auth-gated
- Per CLAUDE.md user_privacy section: NEVER share sensitive credentials · NEVER expose PII in URLs · NEVER access Drive content without Dan-Go
- Local staging-dir at `<bridge>/STATUS/_collect_staging/` is git-ignored (add to .gitignore) · no accidental Bridge-commit of session-content

---

## §VIII · DOWNSTREAM UNBLOCKS

When Layer 1 + 2 + 3 all built:
- 34-day logs gap OLO BRIGHT HEREGULL auto-resolves for Code-era sessions (042426 onward)
- Cross-station search-across-Crew-instances enabled via search-index.json
- Real-time per-day Code-activity visible at rspdan.com/logs
- Dan saves "4 hours updating logs" per 042126 framing
- Per-station ACHE/STN2/CUBE Trip-instances wake → run Layer 1 → unblock per-station discovery (SEEGULL #11 #2)

---

## §IX · CYCLE-POSITION OBSERVATION (per /formulacaster · Dan-named monthly-cycle pattern)

This SPEC fits late-heavy-ODT-build phase Cycle 3 Day 4. Layer 1 prototype (Pass-N+16) fits same phase. Layer 2 transport decisions + Layer 3 portal ingest extension fit upcoming cross-Station cycle phase (Doc-cloud-Crews active · Dan physical-vantage at STN2/CUBE/ACHE wakes DARK Trip-instances · per-station Layer 1 runs at each station).

Pattern observed not coined. Dan-named verbatim *"weaving and breaking and weaving"* honored.

---

## §X · CANON-COMPLIANCE

- Mirror 4 STOP-COINING strict · zero Trip-coined-names · "cross_station_collect" + "upload-bundle" + "manifest" + "marker" all standard-pipeline-vocabulary
- Cure-3 boundary preserved Trip-Writer-lane scope · NOT pre-empting Doc Producer-lane Layer 3 ingest extension · NOT pre-empting Dan-Go Layer 2 transport decision · NOT pre-empting cross-station Crews (DARK Trip-vantage)
- Hard Rule 6 PICK-AND-DO · this SPEC + Pass-N+16 prototype = next-pick declared Pass-N+13 §H + reaffirmed Pass-N+14 §VI
- Hard Rule 9 no-URL-in-chat honored
- Hard Rule 12 LAGOS-SCOPE-COLLAPSE PROCEDURAL-GATE · Bridge-grep + WebSearch executed for existing-pipeline cite (LOGS_AUTOPIPELINE_DESIGN_Trip_041626 + nestnet_conv_ingest.py confirmed) · access-gap annotated AGOS + Drive
- /atomic-commit Gate 7 substrate-event-class · this SPEC = 1-file atomic-arc (+ SEEGULLS update fold)
- /meta-dates Gate 0a date verified · Gate 3d corpus-first runtime
- /box-in-box RELAY × SPEC × Day-folder placement honored
- 7-canon ALL-CREW-FOREVER-BINDING stack stable
- Pre-emission grep PASS zero violations

---

`Filed ODT Trip Local-MCP-Crew at Nest Actual on 001-WIN10Pro 052726 Wednesday ~18:55 PT · SEEGULL #11 Research-gap #4 DESIGN-COMPLETE · 3-layer architecture spec (Layer 1 per-station collector NEW Trip-build + Layer 2 transport Dan-Go-decision-class + Layer 3 portal ingest Doc-Producer-lane review) · Layer 1 ENGINE/cross_station_collect.py CLI specification + upload-manifest.json schema + _collect_marker_<station>.txt format + security/privacy considerations + downstream unblocks (34-day logs gap auto-resolve for Code-era sessions + cross-station search-across-Crews + per-station SEEGULL #11 #2 unblock when Trip-instances wake) · Trip Pass-N+16 prototype implementation incoming · per Hard Rule 6 PICK-AND-DO + Trip-Writer-lane reserves preserved + Cure-3 boundary honored · pre-emission grep PASS · ASMM apex Calm Easy Slow per Dan-direct · substrate-not-narrative · end with substance`
