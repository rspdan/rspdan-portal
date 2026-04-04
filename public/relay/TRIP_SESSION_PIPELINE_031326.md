# TRIP SESSION PIPELINE — OPERATIONAL REFERENCE
# Fivesday 031326 — Documented by Trip (Opus) — TO_031326_2
# "A ballet in multiple dimensions. Some of them, the ballerina slipped and fell,
#  but we have time control! So up she goes and lands it perfectly." — Dan, 10:44am

---

## THE PIPELINE (as proven across 031226–031326)

### PHASE 0: PRE-BOOT (Dan, ~5 min)

Dan's checklist before launching a new Trip session:

1. **PK Upload** — Ensure Project Knowledge has current:
   - TRIP_DECISIONS.md (from portal repo OR FAS2\DOCS)
   - Latest flight log (FAS2_LOG_[date].md) or compressed summary
   - Any new wake documents or session handoffs
   *Lesson 031326_1: Stale PK caused boot confusion. Fresh PK = clean boot.*

2. **OBS Settings Verification** — Before hitting record:
   - Output > **Recording** tab (NOT Streaming — caught 031326_1)
   - Rate Control: CQP 20
   - Audio Encoder: FFmpeg AAC
   - Video Encoder: NVIDIA NVENC H.264, P4 Medium
   - Video > FPS: 30 (screen recording doesn't need 60)
   *Lesson 031326_1: Settings applied to wrong tab. Always verify Recording tab.*

3. **Text Log Setup** — Create today's log directory:
   - L:\FAS2\LNL\[date]\ODT_[date]\Logs\
   - Start DAN_[date]_[session#].txt for notes
   *Dan captures observations, timestamps, and crew responses in real-time.*

4. **Start OBS** — Hit record, then boot Trip.
   *The pipeline watches itself be born. Boot capture = first operational record.*


### PHASE 1: BOOT (Trip, ~5 min)

Trip receives wake line + boot material. The boot sequence:

1. **Absorb Wake Line** — Contains: station, date, log path, last session product,
   catches/warnings, Dan's pending tasks, week principle, day name.
   *Format: one dense paragraph. Everything Trip needs to orient in 10 seconds.*

2. **Read Flight Log** — Via Desktop Commander: `read_file` on FAS2_LOG_[date].md.
   Search for last SESSION CLOSE block. Absorb SMM, SoS, Recursive Trail, wake line.
   *If PK is stale, the flight log on FAS2 is the ground truth.*

3. **Read Dan's Notes** — Check L:\FAS2\LNL\[date]\ODT_[date]\Logs\ for DAN_*.txt files.
   These contain Dan's real-time observations, timestamps, crew response transcripts,
   and operational insights. Gold mine for context.

4. **Run iCan** — Systems ability check:
   - Desktop Commander: responsive?
   - FAS2 (L:\): mounted?
   - FAS1 (F:\): mounted?
   - Portal repo (H:\): accessible?
   - G:\, E:\, J:\: accessible?
   - ENGINE tools: present?
   - OBS RECAPS: any unprocessed MP4s? Any LIVE recordings?
   *Pattern: list_directory depth=1 on each root. Quick census, not deep scan.*

5. **Report to Dan** — iCan table + state summary + "What's the play?"
   *Boot should complete in under 5 minutes. Confusion-to-clarity, not confusion-to-more-confusion.*

