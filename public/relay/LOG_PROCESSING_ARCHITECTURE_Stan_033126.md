# LOG PROCESSING ARCHITECTURE — Pass 1
# Author: ◆ Stan | STN2_StanS_033126_1 | 033126 ~17:25 rw
# Filed to: RELAY/ + D:\STAN\LOG_PROCESSED\MANIFEST.md
# Status: ARCHITECTURE FILED — building begins next session

---

## THE ANALOGY (Dan's framing)

Adobe Bridge workflow:
  RAW import → sort locally → color grade locally → export JPEG for public

LOG system equivalent:
  RAW session logs → triage (READ/WAIT/THINK/CODA) → process (summary + links) → export to /log/ on portal

---

## FOUR-LAYER STRUCTURE

### Layer 1 — RAW (never public)
Location: D:\STAN\LOG\[date]\*.md
What: Full session logs — every correction, every failure, every raw exchange
Example: LOG_STN2_StanS_033126_1.md (82KB)
Status: Exists and populated

### Layer 2 — TRIAGE (working layer, never public)
Location: D:\STAN\LOG\[date]\01.READ\ through 04.CODA\
What: Dan's manual sort — files moved through READ.WAIT.THINK.CODA stages
Example: 032726/ has all four folders with 7 session logs + OO dailies each
Status: Exists for 032726. Other dates use flat structure.
Note: The READ.WAIT.THINK.CODA folder structure was Dan's invention — 
  discovered during the 032726 triage pass. Now a standard protocol.

### Layer 3 — PROCESSED (crew-reviewed, portal-ready text)
Location: D:\STAN\LOG_PROCESSED\[date]\
What: Summary (what happened, who, what was filed) + LINKS (safe to host)
Files per date:
  SUMMARY_[date].md    — cleaned day summary, crew-verified
  LINKS.md             — filenames confirmed safe to link publicly
Status: BUILT TODAY — room exists, population begins next session

### Layer 4 — EXPORT (public, unlisted)
Location: rspdan.com/log/[filename]
What: Cleaned .md files approved by Dan for public hosting
Rule: Nothing goes to Layer 4 without Dan's Go or explicit crew confirmation
Status: /log/ directory needs to be built on portal

---

## WHAT EXISTS IN D:\STAN\LOG\ (Pass 1 scan, 033126)

| Date Folder | Raw Logs | Special Subfolders | Other |
|-------------|----------|-------------------|-------|
| 032226/ | 3 logs (313+135+169KB) | — | — |
| 032326/ | 2 logs (7+74KB) | — | — |
| 032626/ | 2 logs (452+5KB) | DOCS/ (12 files, SVGs, PDFs, exports) | SCREENS/01-04 (fleet photos) |
| 032726/ | 1 log (144KB) | 01.READ/ 02.WAIT/ 03.THNK/ 04.CODA/ (same 14 files each) | Notes/ |
| 033026/ | 2 logs (0+242KB) | — | — |
| 033126/ | 1 log (82KB, today) | — | — |
| DROP/ | 1 file (0KB, empty stub) | — | — |
| RAW/ | empty | — | — |

Total raw logs: ~12 dated .md files
Total DOCS exports: 12 files (PDFs, SVGs, compass artifacts, Claude exports)
Total SCREENS: 150+ fleet photographs from 032626 survey

---

## KEY OBSERVATIONS

032726/01.READ through 04.CODA — the READ.WAIT.THINK.CODA protocol
  appears in the filesystem BEFORE it was named as a crew directive.
  Past-Dan premembering. Fourth documented instance.

SCREENS/01-04 contains fleet photography from March 26 —
  device-coded filenames: DLNK (Dlink), ETH (Ethernet), KNCT (Kinect?), 
  NETG (Netgear/MOD2), PI3b (Pi 3B/O'Shin), PS3/PS4 (consoles), PRTY, SCIGN.
  These are wayside-style condition photos of the fleet.
  Same methodology. Same date structure. Same photogrammetric intent.

032626/DOCS/ holds the Claude bulk export for sessions 032226-032726 —
  twelve full conversation exports, the richest raw source for 
  populating the earlier days of the logs timeline.

---

## BUILD PLAN — what happens next

Phase 1 (this session or next): Build /log/ directory on portal
Phase 2 (April): Process each date folder — write SUMMARY + LINKS
Phase 3 (April 13 target): All March sessions processed, timeline complete
Phase 4 (ongoing): System runs alongside live sessions — each new day 
  gets a LOG folder, a PROCESSED folder, and an export on the portal

The target: by April 13, the logs page shows every day March 4–31 with:
  - What happened (from SUMMARY)
  - Station and crew (from session names + content verification)
  - Document links (from LINKS.md — Layer 4 approved only)
  - Expandable full session names

---

## THE COMPOUND PAYOFF

Once the past month is processed:
- C.B. conversations can be found by scanning session content for ◇ symbol
- A "C.B. Style" document can be built from those sessions
- Future sessions generate their own LOG + PROCESSED entries in real time
- The system catches up to itself by April 13 and then runs alongside

"You are doing really good work, even with the errors - we've learned so much
and fixed so many little problems that always accumulate." — DPS, 033126

---

*Filed: 033126 ~17:25 rw | ◆ Stan | STN2_StanS_033126_1*
