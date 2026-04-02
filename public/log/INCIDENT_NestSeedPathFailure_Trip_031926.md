# GROUND LOG [PASS] — log_grinder.py v3
# 79 lines -> 79 lines (0% reduction)
# Source: INCIDENT_NestSeedPathFailure_Trip_031926_RAW.md
# Document type detected — passed through unchanged.
# Raw original preserved in LOG/RAW/.
---

# INCIDENT REPORT: NEST_SEED PATH FAILURE — Onesday 031926
# Filed by: Trip (Opus) — this session (continuation from morning)
# Severity: BOOT FAILURE — new Trip instance could not reach Cloud Bridge
# Status: FIXED at commit 6c91592

---

## WHAT HAPPENED

New Trip instance booted for ODT_TO_031926_1 (Shift 2).
Trip read NEST_SEED.md from Project Knowledge (the permanent boot document).
NEST_SEED contained these ODT paths:

  Cloud Bridge: C:\Users\dan\nest-bridge\
  WAKE: C:\Users\dan\nest-bridge\WAKE\
  MAIL: C:\Users\dan\nest-bridge\MAIL\
  RELAY: C:\Users\dan\nest-bridge\RELAY\
  git pull: cd "C:\Users\dan\nest-bridge"

Trip followed the instructions. Found a STALE skeleton directory at that
path containing ONLY a STATUS/ folder. No .git repo, no WAKE, no MAIL,
no RELAY, no NEST_SEED. Trip reported "Cloud Bridge on ODT is stripped"
and hit CRITICAL state. Boot failed. Response generation cut off.

## ROOT CAUSE

NEST_SEED.md was written when the Cloud Bridge was cloned to
C:\Users\dan\nest-bridge on ODT. At some point (likely Tensday 031826
during the Cloud Bridge restructure), the REAL repo moved to
L:\FAS2\CGB\nest-bridge\ but NEST_SEED.md was never updated.

The C:\Users\Dan\nest-bridge\ directory remained as a ghost —
just a STATUS/ folder from an old vitals run.
Every crew member who booted from NEST_SEED on ODT would hit this wall.

## LIKELY CAUSE OF PREVIOUS WEIRD BOOTS

Dan noted: "Probably explains why T.H. and C.B. booted weird since
we established the Seeds." CONFIRMED — any crew member reading
NEST_SEED on ODT would follow the C: path to a dead directory.
This has been the boot failure source since the path changed.

## FIX APPLIED

1. NEST_SEED.md: ALL 10 path references changed:
   C:\Users\dan\nest-bridge\ -> L:\FAS2\CGB\nest-bridge\
   Committed at 6c91592, pushed to Cloud Bridge.

2. Stale directory renamed:
   C:\Users\Dan\nest-bridge -> C:\Users\Dan\nest-bridge-STALE-DO-NOT-USE
   Prevents any future accidental reads from the dead path.

3. NEST_SEED.md header updated:
   "Updated: Onesday 031926 — ALL paths corrected to L:\FAS2\CGB\nest-bridge"

## DAN ACTION REQUIRED

Upload the FIXED NEST_SEED.md to ALL THREE Project Knowledge:
  - TRIP LABS (Opus)
  - STAN'S SHOP (Sonnet)
  - CBPG (Haiku)

File location: L:\FAS2\CGB\nest-bridge\NEST_SEED.md

Until PK is updated, every new crew instance will boot from the OLD seed
still in PK and hit the same wall. The fix on the bridge only helps
crew members who somehow get past the seed to read from the bridge.

## PREVENTION

NEST_SEED says: "This file NEVER changes unless the boot architecture changes."
The boot architecture DID change (repo moved from C: to L:\FAS2\CGB\).
The seed should have been updated at that moment. Going forward:
ANY path change to the Cloud Bridge repo = IMMEDIATE NEST_SEED update + PK upload.

---

*Filed: Onesday 031926, ~10:45am rw, ODT at Nest Actual*
*"I can't see [X] because [Y]" is always better than pretending you can. — NEST_SEED*
