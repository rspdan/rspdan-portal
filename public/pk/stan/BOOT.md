# STAN BOOT STATE — ◆ Sonnet
# Auto-managed: git push → Vercel deploy → this URL updates
# URL: https://www.rspdan.com/pk/stan/BOOT.md
# Last updated: Sixsday 040426 | Filed by Stan in NEST.01

---

## CURRENT STATE

Project: NEST.01 (Stan's Shop is an artifact — do not boot there)
Station: OHC or STN2 — SCAN, never assume.
  netsh wlan show interfaces | findstr SSID
  OHC 5G → Dan's authority zone. Fleet (10.0.0.x) dark = expected.
  VZW_HOTSPOT → Nest Actual. Fleet reachable.
Bridge: 72614e2 (last confirmed 040426 morning)
Portal: dc1b84e deployed

## READ THIS FIRST

RELAY/OBSESSIVE_NOTES_Stan_040426.md — on Bridge.
Read before anything else. Full arc of what went wrong 040426 boot
and how to do it correctly. The patch pipe mechanism is explained there.

## WHAT CHANGED SINCE 040226 (32+ commits)

- NA 012 live: rspdan.com/012
- PI v5.0 live: rspdan.com/nest-pi (this IS the PI — read at boot)
- FAS2 drive labeled "FAS2" — detect by label, never hardcode drive letter
    $fas2 = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Description -eq "FAS2"}
- Temporal Verification Rule: week names + time deltas = COMPUTE. Never state from memory.
- Gate 0 Universal: local system clock is Source 1. Dan's stated time is Source 2.
  web_search is NEVER a time source. worldtimeapi.org is shut down.
- meta-dates v1.5 with patch pipe: uploaded to Claude.ai skills
- iLevel Grid Sifter: new skill, uploaded to Claude.ai skills
- SKILL_REGISTRY.md: 22 skills catalogued at Bridge ENGINE/SKILL_REGISTRY.md
- iCan v2 (329 lines): at Bridge ENGINE/skills/ican/SKILL.md
  NO patch pipe yet. NOT in Claude.ai PK.
  To update: add patch pipe → deploy URL → upload once. No Chrome MCP loop.
  Working model: meta-dates v1.5 lines 395-421.
- NA PDFs 008-011 regenerated clean

## ACTIVE PROTOCOLS

- Gate 0 Step 1: (Get-Date).ToString('MMddyy') + week computation from anchor
- Gate 0 Step 2: SSID check (netsh wlan) + timeapi.io or system clock
  Agreement required. UNVERIFIED is valid. Wrong-and-confident is not.
- meta-dates v1.5 (patch pipe active)
- iCan v2 on Bridge (see above — needs pipe before PK upload)
- Living Map: STATUS/LIVING_MAP_Stan.md — write → commit → push. Every action.
- ATOMIC COMMIT: SHEET + Living Map in same commit. Always.
- BOOT.md: write → commit → push at EVERY close. All five close steps. Not four.

## OPEN TICKETS

- iCan v2: add patch pipe, deploy URL, upload once to Claude.ai PK
- 009 merge: Trip Part 2+3 in ACHE session 040226 — assembly next session
- /logs Step 1: 37 files at E:\FAS2\S2S\SOURCE\030826 — Go given, never started
- nest_sleep.py Path A: Dan's Go
- VBS launcher (YomygdylO from boot): Dan's Go
- Batch patch pipe rollout (20 remaining skills): next session

## KEY PATHS

Bridge:  C:\STAN\SOURCE\nest-bridge\
Portal:  C:\STAN\SOURCE\rspdan-portal\
FAS3:    D:\STAN\
FAS2:    E:\FAS2\ (label "FAS2" — detect by label, not drive letter)
LNL:     D:\STAN\LNL\
Log:     D:\STAN\LOG\
Mail:    C:\STAN\SOURCE\nest-bridge\MAIL\
Relay:   C:\STAN\SOURCE\nest-bridge\RELAY\
Wake:    C:\STAN\SOURCE\nest-bridge\WAKE\

## CLOSE PROTOCOL (explicit — all five required)

1. SHEET written to log
2. Living Map updated and committed
3. STAN_TICKET updated
4. BOOT.md updated — write current state, commit, push portal (dp)
5. WAKE file written for next session
BOOT.md is not optional. A stale BOOT.md is a blindfolded next boot.

---
*The Square holds the structure. The structure holds the session.*
