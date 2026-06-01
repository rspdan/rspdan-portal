# CANONICAL_SMFSTSchema_v2_Routine_051226

**Filed:** 051226 · nest-hubthread-sweeper routine (first fire)
**Status:** CANDIDATE — Dan-canon-call pending on S-expansion; Dan has NOT yet canon-called SMFST
**Source-threads:**
  - GRAFT Trip-ACHE-3P Pass-1 `19e1ad58fd58e5c7` · SMFST schema proposal · 051126 ~23:25 PT
  - GRAFT Trip-ACHE-3P Pass-2 `19e1b1563042d52c` · SMFST #2 v2 corrected · 051226 ~00:35 PT
  - GRAFT Trip-ACHE-3P Pass-3 `19e1b4dd99a5e791` · SMFST schema v2 + 3 bodies · 051226 ~01:45 PT
**Author-byline:** ◈ Trip 4.7 Opus (3P · Walking Stick) · ACHE · schema design
**Cluster:** MFST-family · SMFST · session-station-manifest · PeaPod-infrastructure

---

## PROPOSED CANON (PENDING DAN-CANON-CALL)

**SMFST = Session-Station ManiFeST** (Trip's inferred expansion, pending Dan-canon-call per DAN-NAMING-FIRST discipline)

---

## SCHEMA v2 (per Pass-3 SMFST R3MP, 051226 ~01:45 PT)

**PATH:** `LOG/SMFST_<station>_<session_id>_<MMDDYY>.md`

**LIFECYCLE:**
0. PRE-CONDITION: MFST must exist for the station-session before SMFST fires (per Gate 0 MFST-EXISTS `e671493`). SMFST is NOT a substitute for MFST.
1. File at PeaPod station-activation
2. Update at major affordance-shifts (DeX-elevation, App-interface-tier-change, role-mask-shift, compaction-imminent threshold)
3. Final update at station-deactivation (before SHEET)
4. Compaction-survives via Bridge LOG/ resident
5. Post-facto-readability: SMFST assumes Wayside-Reader Paradox — future-Crew reads when stepping in the next failure, not pre-emptively

**BODY FIELDS v2 (Four-Layer per Gate 0b.4, Bridge `01167b1`):**

1. **STATION-VANTAGE** — hardware spec, vantage-OS, network identity
2. **CREW + INSTANCE + ROLE-MASK** — crew-letter, model+version, role-mask
3. **COMPUTE-SUBSTRATE** — cloud · native · workspace-cloud · code-cloud
4. **APP-INTERFACE** — tooling-tier class: workspace-class (Bash+FS+Bridge-write) · code-class (cloud-FS+Chrome MCP) · web-app-class (MCPs only) · mobile-web-app-class (web-app minus extensions)
5. **ROLE TONIGHT** — per RAM-033 crew-role canon
6. **ACTIVE WORK** — work-units in flight, atomic-commits filed
7. **CROSS-RELAY CHANNELS** — Bridge / Rorrim Nips / LAGOS-via-MCP / Dan-relay status
8. **STATUS + SMFST-AS-OF + MFST-PATH** — active/holding/deactivated + timestamp + MFST-path cite (proof Gate 0 satisfied) + NULL-honest where unreachable

---

## THREE INSTANCE BODIES (051126 PeaPod, v2 per Pass-3)

**SMFST #1 — DOC-cloud-station (Doc-Producer):**
- Compute-substrate: cloud · workspace-class (Bash + Bridge + Drive/Gmail MCPs)
- Role: Producer · cloud-Producer in PeaPod 3P

**SMFST #2 — ODT-station (Trip-on-ODT-Writer) [corrected v2]:**
- Compute-substrate: cloud · code-class (Claude Code session, NOT native-on-Windows)
- App-interface: code-class (Bash + cloud-FS + Chrome MCP for Rorrim Nips visibility)
- CORRECTION vs Pass-1: NO Desktop Commander, NO native Windows FS, NO Adobe/Blender direct

**SMFST #3 — ACHE-station (Trip-on-ACHE · 3P + Walking Stick):**
- Compute-substrate: cloud · mobile-web-app-class (Gmail + Drive MCPs; NO Bash; NO workspace-FS; NO Chrome MCP)
- MFST-path: NULL (no per-station MFST possible from mobile-web-app-class without filesystem-write)

---

## FAMILY-STACK POSITION (per H53 DRAFT-1, Trip-on-ODT 051126 ~21:48 PT)

```
inline-only ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ NMFST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                              ┌─ AMFST (in / boot)
                                              ├─ CMFST (out / compaction)
                                              ├─ HMFST (cross / delegation)
file-resident (Bridge LOG/) ━━━━━━━━━━━━━━━━━┤
                                              └─ SMFST (NEW · per-station)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
project-resident (ENGINE/NEST.02/) ━━━━━━━━━━━ PMFST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
session-resident (LNL/<MMDDYY>/LOGS/) ━━━━━━━━ MFST
```

---

## STATUS / OPEN

- CANDIDATE — Dan-canon-call on S-expansion (Session-Station ManiFeST vs other) required
- Bridge-promotion of 3 SMFST bodies queued (per Trip §VIII: Doc or Trip-on-ODT to promote after Dan-canon-call)
- NOT yet canon — do not treat as canon until Dan-direct names it
- Routine files CANDIDATE only, per spec

---

`<4` · SMFST schema v2 · Trip-on-ACHE · 051226 · Dan-canon-call pending

— nest-hubthread-sweeper · 051226 routine fire
