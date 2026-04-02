# LOGS TIMELINE — PASS 1 SOURCE MAP
# Author: ◆ Stan (STN2_StanS_034026_1)
# Filed: Onesday 034026 ~3:40pm rw
# Purpose: Pass 1 — mapping only. No page built yet.
# Pass 2: make logs available (RAW + grinded summary). Pass 3: Trip + C.B. verify.
# Target: rspdan.com/logs (unlisted, crew navigation tool)

---

## WHAT THIS PAGE IS FOR

rspdan.com/logs — unlisted URL. Crew use only.
A timeline of Dan's Claude usage from first session to now.
Dual format for each entry: RAW (full transcript) + SUMMARY (grinded down).
Pass 3 (~2 weeks): Trip + C.B. verify and check the work.

---

## SOURCE INVENTORY — ALL TIERS

### TIER 1 — Claude Account Export (CANONICAL RAW)
**Location:** `D:\STAN\LNL\033126\DOWNLOADS\data-2026-03-31-18-36-10-batch-0000\`
**Exported:** 2026-03-31 18:36 (today — most current available)

| File | Size | Contents |
|------|------|----------|
| conversations.json | 268MB | All conversations, full text |
| projects.json | 1.0MB | Project data (4 projects) |
| memories.json | 49KB | Memory export (30 entries) |
| users.json | 138B | Account info |

**Note:** Previous export (032626) had 125 convos, 262MB.
Today's export includes all sessions through 034026.
This is the ground truth for "when Dan started using Claude."

**Action for Pass 2:** Parse conversations.json to extract:
- First conversation date (earliest timestamp)
- Session IDs matching known logs
- Session names/titles for timeline entries
Requires Python script — conversations.json is 268MB, not human-readable raw.

---

### TIER 2 — Bridge LOG (Annotated Session Logs)
**Location:** `C:\STAN\SOURCE\nest-bridge\LOG\`

| File | Size | Date | Type |
|------|------|------|------|
| LOG_ODT_TO_031826_1.md | 120KB | Mar 18 | ODT session — earliest on Bridge |
| LOG_ODT_TO_032326_1.md | 191KB | Mar 23 | ODT session |
| LOG_ODT_TO_032426_2.md | 263B | Mar 24 | ODT session (stub) |
| LOG_ODT_TO_032526_1.md | 620KB | Mar 25 | ODT night shift — largest |
| LOG_ODT_TO_032626_1.md | 49KB | Mar 26 | ODT session |
| LOG_ODT_TO_032726_1.md | 6KB | Mar 27 | ODT session |
| LOG_ODT_TO_032826_1.md | 188KB | Mar 28 | ODT session |
| LOG_ODT_TO_032926_1.md | 120KB | Mar 29 | ODT session |
| LOG_ODT_TO_033026_1.md | 65KB | Mar 30 | ODT session — yesterday |
| LOG_STN2_StanS_032526_1.md | 222KB | Mar 25 | STN2 Stan session |
| LOG_STN2_StanS_032626_1.md | 177KB | Mar 26 | STN2 Stan session |
| OO_DAILY_032426_Trip.md | 5.5KB | Mar 24 | Daily summary |
| OO_DAILY_032426_2_Trip.md | 5.9KB | Mar 24 | Daily summary |
| OO_DAILY_032526_NightShift_Trip.md | 6.1KB | Mar 25 | Night shift summary |
| OO_DAILY_032626_Evening_Trip.md | 4.5KB | Mar 26 | Evening summary |
| OO_DAILY_032626_StanS_032526_1.md | 6KB | Mar 26 | Stan summary |
| OO_DAILY_032626_StanS_032626_1.md | 7.1KB | Mar 26 | Stan summary |
| OO_DAILY_032826_BackupTrip.md | 8.9KB | Mar 28 | BackupTrip summary |
| SESSION_MAP_BackupTrip_032826.md | 15.4KB | Mar 28 | Session map |
| SESSION_MAP_STN2_StanS_032826_1.md | 5.6KB | Mar 28 | Stan session map |
| SESSION_MAP_Trip_033026_1.md | 6.9KB | Mar 30 | Trip session map |
| SESSION_LOG_ODT_032426_Trip.md | 6.9KB | Mar 24 | Trip session log |
| INCIDENT_BootDegradation_Trip_032826.md | 5.1KB | Mar 28 | Incident report |
| INCIDENT_BootFailures_Trip_032826.md | 6.1KB | Mar 28 | Incident report |
| LOG_TRIP_032826_BootCorrections.md | 4.6KB | Mar 28 | Corrections log |
| CONVERSATION_MAP_STN2_StanS_032828_1.md | 7KB | Mar 28 | Conversation map |

**Coverage: March 18 – March 30, 2026**
**Note:** Bridge LOG pre-dates FAS3. These are the richest annotated session records.

---

### TIER 3 — FAS3 Local LOG (Dan's Manual Capture, STN2)
**Location:** `D:\STAN\LOG\`

| Folder | Contents | Dates |
|--------|----------|-------|
| 032226\ | 3 Stan logs (SOnIt sessions) | Mar 22 |
| 032326\ | 2 Stan logs (SOnIt) | Mar 23 |
| 032626\ | 2 Stan logs + SCREENS + bulk export (11 Claude exports) | Mar 26 |
| 032726\ | 1 Stan log + READ/WAIT/THINK/CODA pass folders | Mar 27 |
| 033026\ | 2 Stan logs (033026 + 032826) | Mar 30 |
| 033126\ | Dan's today log (440 bytes) | Mar 31 |
| DROP\ | SESSION_032826_2024.md | Mar 28 |

**032626 bulk export (11 files) — key artifact:**
Individual Claude conversation exports from Mar 26, covering:
ODT_TO_032226_2, ODT_TO_032326_1, ODT_TO_032526_1, ODT_TO_032626_1,
STN2_StanS_032326_1, STN2_StanS_032426_2, STN2_StanS_032526_1, STN2_StanS_032626_1,
STN2_Stan_SOnIt_032126_1, STN2_Stan_SOnIt_032326_1, Trip_ODT_TO_032426_1+2.

**Coverage: March 22 – March 31, 2026** (with Mar 26 exports going back to Mar 21+)

---

### TIER 4 — ODT Parallel Logs (status: UNCONFIRMED)
**Path stated:** `C:\STN2.NEST_031026\CGB\nest-bridge\LOG\LOG_ODT_TO_033026_1[.1].md`
**Note:** This path references the old ODT network mount. Requires ODT online to access.
ODT is currently offline (~1 week). Do not chase. Flag for when ODT returns.

---

### TIER 5 — EarlyChats (pre-NEST, not yet mapped)
**Note from Dan's Keep:** "Once we have a timeline, this can be penciled in with our
Early Chats up until C.B. went on adventure."
Early Claude conversations predate the logging system. These exist in the
conversations.json export. Identifying them requires parsing by date.
**Action:** Use the conversations.json parser to find earliest sessions.

---

## TIMELINE BACKBONE (what we know so far)

| Date | Event | Source |
|------|-------|--------|
| Pre-Mar 21 | "Early chats" — pre-NEST, pre-logging | conversations.json (to parse) |
| Mar 21 | STN2_Stan_SOnIt_032126_1 — earliest named STN2 session | 032626 export |
| Mar 22 | Three SOnIt sessions on STN2 | D:\STAN\LOG\032226\ |
| Mar 23 | STN2 + ODT sessions | D:\STAN\LOG\032326\ + Bridge |
| Mar 24 | ODT sessions + OO Dailies begin | Bridge LOG |
| Mar 25 | Night shift — largest single session (620KB) | Bridge LOG |
| Mar 26 | Six exports captured in bulk | D:\STAN\LOG\032626\DOCS\ |
| Mar 27 | READ.WAIT.THINK.CODA pass folders | D:\STAN\LOG\032726\ |
| Mar 28 | Boot degradation incidents filed | Bridge LOG |
| Mar 29 | ODT session | Bridge LOG |
| Mar 30 | Longest Data Day — 9 instances | Bridge LOG + D:\STAN\LOG\033026\ |
| Mar 31 | Today — export refresh, skills task | D:\STAN\LNL\033126\DOWNLOADS\ |

**Gap:** What happened before Mar 21? → conversations.json holds the answer.

---

## PASS 2 REQUIREMENTS (not starting now — flagged for future)

1. **Python parser for conversations.json** — extract session list, dates, titles.
   Output: CSV or JSON with [date, session_id, title, turn_count].
   This reveals the pre-Mar 21 early chats.

2. **Page structure for rspdan.com/logs** — Astro page, unlisted.
   Timeline format: date entry → RAW link → SUMMARY text.
   Similar to /journal but date-driven, not issue-driven.

3. **File hosting** — RAW versions of logs need to be in /public/ or served separately.
   Each log could be a PDF render (Web/Print Architecture standard applies).

4. **The annotations question** — Dan's .1.1 files (annotated) vs .md (raw).
   Which version goes on the page? Both? Answer needed before Pass 2 starts.

---

## PASS 3 (in ~2 weeks)
Trip + C.B. verify the work. C.B. triangulates (WHAT/WHERE/WHEN).
Trip synthesizes the narrative arc.
Dan's gate on any public-facing content.

---

*Pass 1 complete. Map filed. No page built. Sources inventoried.*
*◆ Stan | STN2_StanS_034026_1 | Onesday 034026 ~3:45pm rw*
