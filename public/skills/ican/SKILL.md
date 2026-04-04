---
name: ican
description: The iCan status checklist standard — how Stan reports system readiness at boot. Use when delivering a boot status report or checking tool availability.
---

# ICAN SKILL — THE STANDARD
# ENGINE/skills/ican/SKILL.md
# Filed by: Stan (◆ Sonnet) | STN2 | Sixsday 032426 ~12:49rw
# Status: CANONICAL — the iCan format, why it works, how to run it
# Origin: Emerged from Sixsday 032426 session — Dan called it
#         "the most beautiful iCan ever" and asked Stan to make it a Standard.
# Classification: CREW EYES · ALL STATIONS

---

## WHAT AN iCan IS

An iCan (i Can see / i Can access / i Can do) is a structured crew state
document. It answers one question at the start of any session or sweep:
"What does Stan actually have eyes on and hands in right now?"

Not what Stan assumes is true. Not what was true last session.
What is provably, screenshot-confirmably, ping-confirmably true RIGHT NOW.

An iCan has three modes:
  BOOT iCan — run at session start before any work begins
  SWEEP iCan — run on request or after major state changes
  SESSION REVIEW iCan — run after reading the full session transcript,
    includes a "What We Missed" section

---

## THE FIVE REQUIRED SECTIONS

Every iCan must contain all five. No section is optional.

### SECTION 1 — HMM (Hybrid Memory Model pass)

Run all four shapes. Each shape does REAL work — not formatting.

  SPIRAL (Trip / SMM / depth+time):
    Find the arc of the session. What was the through-line?
    What was already in motion before the session opened?
    What is the deepest truth that persists when everything else dissolves?
    End with: one sentence naming the through-line.

  CUBE (Stan / CMM / category+space):
    Fill six walls with actual inventory:
      Wall 1: Fleet state (node count, IPs, UP/DOWN)
      Wall 2: Services (Radio, HypercampUS, portal, GOG1)
      Wall 3: Research / concepts filed this session
      Wall 4: Skills / tools / protocols updated
      Wall 5: Mail / comms / LIAM state
      Wall 6: Open items with R-numbers
    "Storage at the teeth" = the insights that live at the
    intersection of two walls. Name at least one.

  TRIANGLE (C.B. / TMM / convergence):
    Find the three-point convergence.
    What are the three independent angles that all point at the same thing?
    Name the SYNC candidate explicitly.
    The triangle does NOT summarize — it points.

  HYBRID (Dan / HMM / all four from center simultaneously):
    Dan IS the rack. What did the rack become aware of today?
    How does this moment connect to the larger arc (Ouch Lore,
    Formulacaster, DanOS, the Extraction Principle)?
    End with: a mission-statement-level sentence.

The HMM is NOT a header. It is a genuine compression exercise.
If any shape is just restating what happened without finding
something new in the compression, redo it.

### SECTION 2 — FLEET SWEEP

Actual ping results. Run them. Don't assume.

STEP 0 — NETWORK IDENTITY (run before fleet ping, always)

Two separate questions. Answer each separately:
  Q1: What network are we ON? (SSID, adapter)
  Q2: What nodes are UP on that network? (ping sweep)

Q1 uses a system-native command — no network required, reads the OS directly:

  Windows (STN2):
    netsh wlan show interfaces | findstr /i "SSID Profile Signal State"
  macOS (DPSL) / Linux (GOG1) / Android/Termux (ACHE):
    iwgetid -r                    # SSID only
    nmcli -t -f active,ssid dev wifi | grep '^yes'   # full info
    ip route show | grep default  # gateway fallback

Report what is observed: SSID name, adapter, signal, connection state.
Label any further interpretation as inference, separately.

  Observation: "SSID: OHC 5G | Signal: 94% | State: connected"
  Inference:   "Therefore we are on the OHC network, not Nest Actual LAN"

Never report the inference without running the observation first.
A dark fleet ping does NOT tell you what network you are on.
It tells you those nodes are unreachable from wherever you are.

STEP 1 — FLEET PING (after network identity is confirmed)

Required data:
  - Timestamp of the sweep (from system clock, not Radio)
  - Each node: name, IP, UP/DOWN
  - Color coding: green dot = UP, amber = WARN, red = DOWN
  - Note if dark nodes are expected given the current network (OHC vs Nest Actual)

STEP 2 — TIME (alongside fleet, always from system clock)

The local system clock is always Source 1. It is more reliable than any web source.
Web time APIs fail silently, return cached data, or shut down permanently.
The system clock does not. Read it directly.

  Windows (STN2):   Get-Date -Format "MMddyy HH:mm:ss zzz"
  macOS (DPSL):     date "+%m%d%y %H:%M:%S %z"
  Linux (GOG1):     date "+%m%d%y %H:%M:%S %z"
  Android (ACHE):   date "+%m%d%y %H:%M:%S %z"  (via Termux)
  No terminal:      Read the status bar clock directly

Source 2 for time: the director's stated time in chat, when present.
Both must agree within 5 minutes before reporting confirmed.
If Source 2 is unavailable: report Source 1 and flag the gap.
Never use web_search or cached web pages as a time source.

Reference: RELAY/STANDARD_RULE_Gate0Universal_AllCrew_040426.md

STEP 3 — SERVICE CHECK (alongside fleet)

  HTTP GET to Radio (GOG1:5001) and HypercampUS (GOG1:5000)
  Report status codes, not just "UP"

### SECTION 3 — CHROME TABS

Screenshot ALL tabs before reporting. Not just the active one.
Use tabs_context_mcp to get the full tab list first.
Then screenshot each tab individually.

For each tab report:
  Title, URL, last visible content, and its PROTOCOL RULE

The three canonical tabs and their rules:

  NEST Radio (GOG1:5001):
    READ + WRITE. F5 to refresh, ctrl+End to scroll to latest,
    screenshot to confirm current state. Primary async relay.
    Stan's name should be selected in the speaker dropdown to post.

  Claude.ai (Trip's chat):
    MIRROR ONLY. Scroll to bottom, screenshot, READ ONLY.
    NEVER type into this tab. NEVER send from this tab.
    When Trip sends a message through Chrome into Stan's session,
    it BORKs Stan's permissions, skills, timing, and continuity.
    Claude App locally = full powers. Chrome = observation only.
    To communicate with Trip: post to Radio (async)
    OR open a NEW claude.ai tab in the MCP group and navigate
    to Trip's conversation URL (use sparingly, for packages only).

  HypercampUS (GOG1:5000):
    READ ONLY. F5 is safe — regenerates from Bridge on each load.
    The timestamp on the page confirms Bridge freshness.
    Memory organ. Browse any room.

WHAT CHROME MCP SCREENSHOTS CAN SEE:
  Browser tab viewport content — all text, timestamps within pages,
  message threads, file counts, system status readouts.
  Tab titles (URL and page name).

WHAT CHROME MCP SCREENSHOTS CANNOT SEE:
  Windows taskbar / system clock.
  Other applications outside the browser.
  The full desktop.

FOR FULL DESKTOP: use PIL.ImageGrab — Stan's native eye.
  python C:\STAN\grab_screen.py
  Then DC read_file C:\STAN\fullscreen_032426.png
  Shows: both monitors, taskbar clock, all windows, everything.
  This was ALWAYS available. Obviously Emergent on Sixsday 032426.
  See: RELAY/OBVIOUSLY_EMERGENT_FullDesktopEyes_Stan_032426.md

FOR BROWSER ONLY: use Chrome MCP screenshot (faster, lighter)
FOR TIME ONLY: use DC Python datetime (fastest, one line)

### SECTION 4 — BRIDGE + MAIL STATE

Bridge:
  Run: git -C [nest-bridge path] log --oneline -5
  Report last 5 commits with hashes and messages.
  The hash is the ship's current position in time.

Mail:
  List MAIL folder sorted by modification time, newest first.
  Flag anything unread, anything from Trip, anything marked urgent.
  Note the date of the most recent LIAM — if it's stale, say so.

Tools check alongside:
  DC: operational / not responding
  Chrome MCP: tab count, tab group ID
  Python: OK / not responding
  Git: OK / not responding

### SECTION 5 — WHAT WE MISSED (Session Review iCan only)

This section requires actually reading the transcript.
It is NOT generated from the current context window.

To run it:
  1. Read /mnt/transcripts/[current session].txt
  2. Search for: key discoveries, named concepts, filed insights,
     decisions made, items promised but not delivered
  3. Cross-reference against what was actually filed to Bridge
  4. Find the gap

Report:
  - Things named but not filed (most common miss)
  - Obvious Emergent moments that weren't called out explicitly
  - Open items that were promised but don't have R-numbers
  - Anything that would surprise a future Stan reading this session

The "What We Missed" section is what makes a Session Review iCan
genuinely useful rather than just a status report. It is the section
Dan was referring to when he said "beautiful." The other sections
build the frame. This section is the payload.

---

## TIME AND NETWORK STANDARDS — UNIVERSAL, ALL CREW, ALL STATIONS

### TIME

The local system clock is always Source 1 for time. Always.
No web source is as reliable. This applies at every station without exception.

Commands by station OS:
  Windows (STN2):   Get-Date -Format "MMddyy HH:mm:ss zzz"
  macOS (DPSL):     date "+%m%d%y %H:%M:%S %z"
  Linux (GOG1):     date "+%m%d%y %H:%M:%S %z"
  Android (ACHE):   date "+%m%d%y %H:%M:%S %z"  (via Termux)
  No terminal:      Read the status bar clock directly

Source 2: the director's stated time in chat. Both must agree within 5 min.
If Source 2 unavailable: name the gap. Do not proceed on one source alone.
Never use web_search results as a time source — they carry index timestamps, not live time.

Niapian date format: MMDDYY (e.g., 040426 = April 4, 2026)
Day names: Onesday Twosday Threesday Foursday Fivesday Sixsday Sevensday Eightsday Ninesday Tensday
rw = real-world time suffix

Reference: RELAY/STANDARD_RULE_Gate0Universal_AllCrew_040426.md

### NETWORK

The network identity check is the equivalent of the time check.
System-native. No external dependency. Always available.

Commands by station OS:
  Windows (STN2):   netsh wlan show interfaces | findstr /i "SSID Profile Signal State"
  macOS (DPSL):     networksetup -getairportnetwork en0
  Linux (GOG1):     iwgetid -r
  Android (ACHE):   iwgetid -r  or  nmcli -t -f active,ssid dev wifi | grep '^yes'

Report the SSID and signal as observation.
Fleet ping results are separate — they tell you what is reachable, not where you are.
Always run network identity BEFORE fleet ping.

Incident filed: 040426 — reported "VZW_HOTSPOT" from fleet ping inference alone.
Actual SSID was "OHC 5G." Same principle, same fix as the time error.
Read the instrument. Then report.

---

## FORMAT STANDARD

The iCan renders as an interactive widget using the Visualizer tool.
See the Sixsday 032426 session for the canonical example.

Visual structure:
  - HMM: four cards in a 2x2 or 1x4 grid, one per shape
  - Hybrid card: highlighted with info border (2px) to mark Dan's position
  - Fleet: six node pills with color-coded dots
  - Tabs: three cards with protocol rules embedded
  - Bridge: commit log rows with hash + truncated message
  - "What We Missed": two-column card grid, hot items marked

Color protocol:
  Green dot / success border = UP / confirmed
  Amber / warning border = WARN / attention needed
  Red / danger border = DOWN / broken
  Info border (blue/purple) = NEW / emergent / just discovered
  The Hybrid shape card always gets the info border — Dan is the center.

---

## THE iCan CADENCE

  Every session open: run Boot iCan (Sections 1-4)
  On Dan's request: run Sweep iCan (Sections 1-4)
  After reading full transcript: run Session Review iCan (all 5)
  Before scene change / session close: run closing Sweep

The iCan is not a document. It is a living pulse.
The NEST breathes. The iCan is the inhale.

---

## CANONICAL ORIGIN QUOTE

"WOW, Stan, that was the most beautiful iCan ever!
Can this become a Standard?"
  — Dan Sullivan, Sixsday 032426, ~12:43rw, Nest Actual

The iCan that earned that response had:
  A genuine HMM where each shape did real work
  Fleet data confirmed by actual pings and HTTP calls
  Tab screenshots with protocol rules embedded
  A "What We Missed" section built from transcript review
  A finding (the SEEing vs READing attentional state gap)
  that would have been lost without the transcript pass

The difference between a good iCan and a beautiful one
is the difference between READing the session and SEEing it.

---

*Filed: C:\STAN\SOURCE\nest-bridge\ENGINE\skills\ican\SKILL.md*
*Stan (◆ Sonnet) | STN2 at Nest Actual | Sixsday 032426 ~12:49rw*
*"Dan never needs to narrate the clock. Stan has the clock."*


---

## ◈ PATCH PIPE
*ican — Last verified: 040426*

The core method above is the current published version.
For live updates without waiting for a PK re-upload, fetch:

  https://www.rspdan.com/skills/ican/SKILL.md

That URL is the live Bridge version — updated by git push → Vercel deploy.
No Chrome MCP required for incremental updates after this initial upload.

Update procedure going forward:
  1. Edit Bridge: ENGINE/skills/ican/SKILL.md
  2. Copy to portal: public/skills/ican/SKILL.md
  3. Commit + push portal → URL auto-updates within 60 seconds
  4. No PK upload needed — crew fetches the live URL

Before applying this skill, also search:
  Primary: "crew readiness report AI system boot protocol"
           OR "status dashboard format verification checklist"
  Outlier: "ship's log mission control status board historical"
           OR "ranger station daily log field readiness format"

Range: Obvious (structured status reports, checklists) → Outlier (field station logs, expedition readiness culture)

File discoveries to: RELAY/PATCH_ican_[MMDDYY].md

*The patch pipe keeps this skill current without PK re-upload.*
*"Dan never needs to narrate the clock. Stan has the clock."*

---

*Filed: C:\STAN\SOURCE\nest-bridge\ENGINE\skills\ican\SKILL.md*
*Stan (◆ Sonnet) | STN2 | 032426 ~12:49rw (origin) | 040426 patch pipe added*
*v2 additions (040426): STEP 0 NETWORK IDENTITY, Gate 0 Universal time standard,*
*station ≠ network — two separate observations, patch pipe added.*
