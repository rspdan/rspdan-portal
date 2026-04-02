# RELAY: CONTINUITY ENGINE PROPOSAL — Trip, Onesday 031926
# The failsafe against morning amnesia

---

## THE PROBLEM

Every new Trip instance boots with:
1. Project Instructions (PI) — the universe, permanent
2. Project Knowledge files — whatever Dan uploaded
3. Memory edits — permanent crew identity

But Trip doesn't know what happened YESTERDAY until it reads the
WAKE file, which requires DC access to the bridge. If the WAKE
is stale, or PK has old files, Trip acts on outdated state.

Dan keeps having to re-explain context. The Director shouldn't
be the one carrying continuity — the system should.

## THE SOLUTION: Three layers, each a failsafe for the next

### Layer 1: NEST_SEED (permanent, changes rarely)
Already built. Boot architecture. "How to reach the bridge."
Only changes when paths change. ✅ FIXED today at 6c91592.

### Layer 2: SESSION_TICKET (new — auto-generated every close)
A tiny file (~20 lines) written by the closing Trip instance.
Contains ONLY:
- Date/time of last session
- Station
- Last 3 commits (hashes + messages)
- Top 3 priorities for next session
- Any CRITICAL flags
- The Pi password and key tool paths (so Trip doesn't fumble)

This goes in PK as SESSION_TICKET.md — Dan replaces it at each
session close (or the closing Trip reminds Dan to upload it).

It's the minimum viable handoff. If the WAKE file is stale,
the ticket still orients the next Trip within 10 seconds.

### Layer 3: WAKE_CLOSE (already built, needs discipline)
Full session close with SMM, trail marks, priorities.
Written to bridge WAKE/ folder. Next Trip reads it via DC.
This is the deep context. ✅ Already working.

### Layer 4: GROUND TRUTH file (new — lives in PK permanently)
A file called GROUND_TRUTH.md that contains the things that
KEEP getting lost between sessions:

  - Pi: user=dan, password=oshin2026, IP=192.168.25.92,
    Tailscale=100.83.109.75. SSH via paramiko.
  - Bridge: L:\FAS2\CGB\nest-bridge (ODT), ~/nest-bridge (Pi)
  - Portal repo: H:\Projects 2020-2026\2026\ouchmccouch-portal
  - O'Shin media: L:\FAS2\OSHIN\EYES (NOT in nest-bridge)
  - Cloud Bridge remote: github.com/rspdan/nest-bridge
  - Grinder: v3, filename-aware. LOG_=brutal, INCIDENT_=pass.
  - Deploy: dp.py in portal repo. dp from any station.
  - Dan's stations: ODT=full power, TRP0=MacBook, STN2=Latitude
  - Tailscale: installed on ODT + Pi. Same account.

This file is BORING and ESSENTIAL. It never has lore or narrative.
It's the "break glass" reference that stops Trip from fumbling
with passwords and paths every single morning.

## IMPLEMENTATION

1. Trip writes GROUND_TRUTH.md now (I'll do it after this)
2. Trip writes SESSION_TICKET.md at every session close
3. Dan uploads both to PK (one-time for GROUND_TRUTH,
   every close for SESSION_TICKET)
4. NEST_SEED stays as-is (boot architecture)
5. WAKE_CLOSE stays as-is (deep context on bridge)

## THE STACK (boot reads in this order)

  PI (Instructions)     — the universe (permanent)
  GROUND_TRUTH.md (PK)  — passwords, paths, tools (semi-permanent)
  SESSION_TICKET.md (PK) — last session's handoff (daily)
  NEST_SEED.md (PK)     — boot architecture (permanent)
  WAKE_CLOSE (bridge)   — full context (via DC, every session)

If any layer fails, the one above it still orients Trip.
If ALL of PK fails, the PI alone boots a functional Trip.

---

*"The Director shouldn't carry continuity. The system should."*
*-- Trip, Onesday 031926*
