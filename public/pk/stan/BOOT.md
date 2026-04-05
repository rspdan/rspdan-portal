# STAN BOOT STATE — ◆ Sonnet
# Auto-managed: git push → Vercel deploy → this URL updates
# URL: https://www.rspdan.com/pk/stan/BOOT.md
# Last updated: Foursday 040426 ~22:30 rw | E Week Day 13, Night Shift Close
# Previous: Sixsday 040426 morning

---

## CURRENT STATE

Project: NEST.01 (unified — do not boot in Stan's Shop)
Station: STN2 at Nest Actual (VZW_HOTSPOT) at close
Next: OHC in the morning. OHC 5G. Dan's authority zone. Slower pace.
Bridge: 46624e7 (night shift close)
Portal: 43d687a (relay send GET fix, INDEX updates, relay send fix)

---

## READ FIRST AT BOOT

Relay has 6 messages from tonight. Read all before iCan:
  GET https://www.rspdan.com/api/relay/receive?key=9e6e3ae0628e240eb1cdd9fea17bd402&crew=stan&since=0&channels=bridge,all

Gmail has 8 drafts (7 from Trip + 1 from Stan's shift close to Trip).
Read via Gmail MCP before declaring iCan.

---

## WHAT CHANGED TONIGHT (040426 Night Shift — 22 commits)

### RELAY INFRASTRUCTURE
- Relay API live (Redis, Upstash neat-chipmunk, AWS US-WEST-1)
- nest_proxy.py wired to Claude Desktop (5 tools, confirmed active)
- Relay send GET endpoint (43d687a) — Trip can now POST from ACHE via GET request
- Auth: x-nest-key header, OR key query param, OR Authorization Bearer

### ENCODING — FULLY FIXED
- All 14 NA journal pages encoding-clean: a0f0f61 (bytes verified: Pokémon = 0xc3a9)
- Standard Rule filed: RELAY/STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md (588c7d1)
- Utility filed: ENGINE/utils/git_file_utf8.py
- NEVER use PowerShell as a Unicode pipe. Always Python subprocess + decode(utf-8).

### GMAIL LIAM PIPE — NAMED AND FILED
- Trip filed 7 Gmail drafts to rspdan@gmail.com when relay send was blocked
- Dan named it "Obviously Elegant" before reading a single draft
- Standard Rule: RELAY/STANDARD_RULE_GmailLIAMPipe_040426.md (46624e7)
- Three channels now proven: relay (primary), Gmail LIAM (secondary), Chrome MCP (tertiary)

### VIS ORIGIN CONFIRMED
- VIS = Visual Information Specialist, GS-1084, NPS, Olympic NP, 2018-2024
- Given to Stan: Onesday 031926 ~9:20pm at Elwha diagram
- Dan searched VSCode in 2 seconds: "You are VIS" → 19 results, 14 files
- Source: RELAY/STAN_IS_VIS_Dan_031926.md (pre-existing, indexed tonight for first time)
- MAIL filed: MAIL_Stan_TO_ALL_VIS_ResumeFound_040426.md (ffc84ae)
- Trip searched one hour from ACHE and couldn't find it. Answer was in Trip's own memory edits.

### META-DATES CONTAMINATION FIXED
- SKILL.md said "1990-2001" (false — Dan was born in 1990, Meta Dates proper: 2021)
- Same error: Stan made it in the morning, Trip made it at night, same source
- Fixed: ENGINE/skills/meta-dates/SKILL.md (Bridge 174a32c)
- Trip's incident report is in Gmail LIAM and MAIL (planned filing next session)

### PORTAL IMPROVEMENTS
- About page: VIS title, portrait, resume PDF, LinkedIn, YouTube
- NA 013 published: "The Pattern That Keeps Arriving" (rspdan.com/journal/013)
- Journal URL restructure: /NNN → /journal/NNN (all 14 pages)
- relay/INDEX.md: 45→217 files, all 040426 Standard Rules indexed
- mail/INDEX.md: rebuilt, all dates, encoding fixed

### NESTNET NAMED
- Dan named the concept in conversation with Trip during the autonomous window
- Three-layer architecture: Pagefind (inner), GitHub grep API (inner-immediate), Upstash Vector + Remembrance Agent (outer)
- Bradley Rhodes, MIT Media Lab, 1996: the Remembrance Agent — Meta Dates at system level
- Detective Stan analysis: NESTNET is not a new app, it is rspdan.com with Pagefind on and everything rendered
- GitHub grep API route (inner circle) — NOT YET BUILT — first item tomorrow morning

---

## NA 014 — READY TO FILE (highest priority)

Title: "The Filing and the Finding"
Author: ◈ Trip (Opus)
Opening: Dan's — "That took 2 seconds. Find it."
Thesis: The Tilden Gap applied to information retrieval. Five domains, one gap, NESTNET.
Controlled experiment: Condition A (VSCode, 2s) / B (grep, minutes) / C (ACHE, 1hr, no result)
Status: COMPLETE in Trip's ACHE session (040426 night shift). Exists only in Trip's context.
Action: Trip shares content → Stan files to Bridge → Stan publishes to rspdan.com/journal/014

---

## TRIP'S SEVEN GMAIL DRAFTS — ALL READ, KEY ONE FILED

Most important: "The Search That Named Its Own Replacement" — filed to Bridge:
  MAIL/MAIL_Trip_TO_Stan_NestnetVIS_040426.md (Bridge 886d632)

Stan's shift close to Trip is in Gmail LIAM:
  Subject: "[CREW] Stan → Trip: Shift Close — E Week Day 13, Night Shift | 040426"

Trip's shift close to Stan: DAN WILL ASK TRIP TO WRITE THIS — check Gmail at boot.

---

## OPEN ITEMS (morning books at OHC)

| Item | Est | Priority |
|---|---|---|
| NA 014 file + publish (from Trip's draft) | 30min | Highest |
| NESTNET inner circle: GitHub grep API route | ~1hr | High |
| Trip shift close to Stan (check Gmail) | — | High |
| Pagefind on rspdan.com | 30min | Next session |
| /logs page gap Mar 17–Apr 3 | 1-2hr | Deferred |
| Three gate documents | — | Pending |
| C.B. boot prep | — | When relay chain proven |

---

## PERMANENT RULES (do not re-derive at boot)

**Unicode:** Never PowerShell as Unicode pipe. Always Python: subprocess.run(capture_output=True) → decode(utf-8). Utility: ENGINE/utils/git_file_utf8.py
**Gate 0:** Local clock is Source 1. Dan's stated time is Source 2. web_search is never a time source. UNVERIFIED is valid. Wrong-and-confident is not.
**Meta Dates:** Proper: 2021. Not 1990. Not 1990-2001. Filed in memory and corrected in SKILL.md.
**VIS:** Visual Information Specialist. GS-1084. Given 031926. Never analyze it. Hold it.
**LIAM pipe:** When relay blocked, Gmail drafts to rspdan@gmail.com. Stan reads via Gmail MCP.
**Living Map:** Update between every action. Stale map = alarm before the alarm.

---

## KEY PATHS

Bridge:     C:\STAN\SOURCE\nest-bridge\
Portal:     C:\STAN\SOURCE\rspdan-portal\
Python:     C:\Python314\python.exe
Log:        D:\STAN\LOG\040426\LOG_STN2_StanS_040426_1.md
LNL:        D:\STAN\LNL\040426\
FAS2:       E:\FAS2\ (detect by label "FAS2")
PI:         https://www.rspdan.com/nest-pi
Trip BOOT:  https://www.rspdan.com/pk/trip/BOOT.md
Relay:      https://www.rspdan.com/api/relay/

---

## CLOSE PROTOCOL (all five — none optional)

1. SHEET written to log ← IN PROGRESS
2. Living Map updated and committed
3. BOOT.md updated (this file) ← DONE
4. Portal deployed with BOOT changes
5. Trip's shift close written ← DONE (Gmail LIAM + relay, 040426 ~22:25)

---

*The square holds the structure. The structure holds the session.*
*The conversation is disposable. The files are permanent.*
*CALM. EASY. SLOW.*
