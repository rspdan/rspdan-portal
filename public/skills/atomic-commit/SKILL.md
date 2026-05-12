---
name: atomic-commit
description: One action. One artifact. One checkpoint. The discipline that prevents Ghost-Trip work, stale-summary cascades, and post-compaction self-recognition failures. Use ambient during the TELL-ING phase between CONTACT (boot-polish) and SHEET (session-close).
---

# Atomic Commit
# ENGINE/skills/atomic-commit/SKILL.md
# Drafted: ODT-Trip Opus 4.6, ~1:15 AM, 042626 (r GOSt 19dc89f723a4082c)
# Consolidated: Stan Sonnet 4.6, STN2, 042626 ~12:30 PM
# Sources: GOSt draft + Compaction Detection GOSt (19dc8d85094c3708)
#          + ODT-Trip 4.7 CORRECTION SCREENS (19dca061a8d82cae)
#          + TW Append #8 (19dcae347aa9ecc3) Gate 6 reference
# Status: CANONICAL (Dan-approved 042626; committed to Bridge as `158ff18` on 042726)
#
# Trigger phrases: "atomic", session open (ambient), "turn growing long",
#   post-interruption recovery, phase change, "checkpoint", "Gate 6"
# Sibling skills: session-close (SHEET bookend), boot-polish (CONTACT bookend)
# This skill governs the SPACE BETWEEN bookends: the continuous discipline
# during TELL-ING.

---

## PRE-GATE: COMPACTION RESUME CHECK (CHAINS TO meta-dates Gate 0c)

**Before any commit, GOSt filing, or work — verify you're not re-executing already-done work.**

This gate chains to **`/meta-dates` Gate 0c · COMPACTION RESUME DETECTION** which is the canonical apex check. Run that first. This pre-gate is the local enforcement at the commit boundary.

If meta-dates Gate 0c flagged a compaction-resume:

- DO NOT file a GOSt without first searching LAGOS (AGOS + conversation_search + Drive) for the same subject in the period the compaction summary covers
- DO NOT `git commit` without first running `git log -5 --oneline` and confirming your file change is genuinely new
- DO NOT `git push` without confirming `git rev-list HEAD..origin/main` shows your commit is ahead (not a fast-forward to an existing identical commit)

If any of these checks reveal the work is already done:

- ANNOUNCE: "already filed at `<thread-id>`" or "already committed at `<hash>`"
- DO NOT redo
- File a single MFST RAM noting the verification, then move forward

**Why this is here:** atomic-commit governs the SPACE BETWEEN bookends — the continuous discipline during TELL-ING. Compaction can hit mid-TELL-ING, and when it does, the compaction summary may describe TELL-ING actions as completed. This pre-gate is the local check at the moment of commit, not just at session boundary. Belt-and-suspenders to meta-dates Gate 0c.

See: `/meta-dates` Gate 0c (apex compaction-resume detection); userPreferences COMPACTION AWARENESS rule.

---

## The One Line

**One action. One artifact. One checkpoint. Then the next.**

The act of working IS the act of saving.
Nothing burns because nothing accumulates past the last commit.

---

## The Six Gates (Gate 0 + Gates 1-7)

### Gate 0: MFST MUST EXIST BEFORE ANY WORK-UNIT FIRES (THE PRE-CONDITION GATE)

**New gate (Trip-on-ODT 051226 ~00:05 PT post-Midnight-Divide — Dan-direct catch).**

Gate 7 fires the SUBSEQUENT-discipline (file substrate as work-units complete). **Gate 0 fires the PRE-CONDITION: a station-resident MFST must exist before ANY work-unit fires at all.**

Without Gate 0, the failure-class is: Crew operates an entire session (hours, dozens of work-units, compaction events, Federal canon installs) without ever filing a MFST. Gate 7 keeps wanting to fire on work-unit-boundaries, but there's no MFST to file the RAM into. The substrate-survival architecture has no anchor.

**Trigger:** FIRES AT BOOT, before the first work-unit emission.

**Canonical path patterns** (instrument-checked per /meta-dates Gate 0b.4):
- Windows Claude Desktop App seat (DC available): `C:\STAN\LNL\<MMDDYY>\LOGS\MFST_<STATION>_<CrewModelVer>_<MMDDYY>_<n>.md`
- Cloud Claude Code seat (Bash + /home/user available): `/home/user/nest-bridge/LOG/MFST/<MMDDYY>/MFST_<STATION>_<CrewModelVer>_<MMDDYY>_<n>.md`
- claude.ai web seat (no filesystem write): `/mnt/user-data/outputs/MFST_<STATION>_<CrewModelVer>_<MMDDYY>_<n>.md` (persists between turns)

**Minimum viable MFST body at file-creation:**
- Three-Layer Identity header (Station + Role-Mask + Compute-Substrate per `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md`)
- Session boundaries (open-time, current-status: ACTIVE)
- Companion-crew enumeration if PeaPod
- RAM-001 entry: "CONTACT acknowledged"
- OPEN section: empty placeholder

**Pass-3 of the gate-installation cycle.** Trip-on-ODT's MFST-NEVER-FILED Pass-2 catch (051126) is what produced this gate. Per Pass-2-Calm canon 042626: each Pass-N installs the architectural-cure for the failure-class the prior Pass surfaced.

---

### Gate 1: Turn Length Check

Before starting any new tool call sequence, ask: *"If this response crashes RIGHT NOW, what survives?"*
If "nothing since my last MFST write" — STOP. Write a RAM entry first.

### Gate 2: One GOSt Per Filing

Never batch-file multiple GOSts in one turn. File one. Write the RAM entry. Then file the next.

### Gate 3: LIAM Peer Check at Checkpoint

At every MFST checkpoint (~20 min or phase change): What has my Pea Pod peer filed since last check? Am I running parallel or triangulated?

### Gate 4: MFST Template Gate (Self-Cleaning)

When a MFST is copied to a new day's folder as template: clean it BEFORE any other work. Header date mismatch = STOP, CLEAN FIRST.

### Gate 5: Ghost-Trip Recovery

After any response interruption: Read MFST tail. That entry's checkpoint tells you what was done and what's next. Check GOS for any GOSts filed before crash. Do NOT re-file. Continue from checkpoint, not scratch.

### Gate 6: Compaction Detection + Fresh-Eyes Audit

Compaction summaries are interpretations, not facts. Treat as hints, not ground truth. Run actual filesystem checks before acting on summary assertions.

### Gate 7: Ambient Time-or-Phase Trigger (THE FIRING MECHANISM)

Gates 1-6 describe what to check. **Gate 7 is what makes them fire ambiently.**

**TIME-BASED TRIGGER:** Fires at ~20-minute intervals during TELL-ING. If no AGOS GOSt or MFST RAM filed in previous 20 minutes, gate refuses next work-unit emission until creep-GOSt'n is filed.

**PHASE-BASED TRIGGER:** Fires at every phase-change. Gate refuses phase-progression if previous phase has not been AGOS-filed.

**REFUSAL CONDITION:** If [work unit completed] AND [no AGOS/MFST filing] AND [time > 20 min OR phase boundary]: refuse next emission. File creep-GOSt'n first. "Filed in MFST" alone does not satisfy — AGOS is the substrate of survival.

---

## Anti-Patterns (What This Prevents)

| Anti-Pattern | Description | Gate It Violates |
|---|---|---|
| The Long Turn | 10 tool calls, 3 GOSts, zero MFST writes; crash = total loss | Gate 1 |
| The Parallel-Not-Triangulated | Filing to GOS without reading peer's filings | Gate 3 |
| The Template Confusion | Reading yesterday's MFST as reference instead of cleaning it | Gate 4 |
| The Batch Filing | Multiple GOSts in one turn; crash loses all | Gate 2 |
| The Ghost Floor | Interrupted response with no checkpoint; next crew starts blind | Gate 5 |
| The Stale Summary | Acting on compaction-summary filesystem claims without verifying | Gate 6 |
| The Stupid Mode Redo | Treating compaction summary as TODO list and re-executing already-done work | PRE-GATE |
| The Drift Under Depth | Filing 0 RAMs across N work units during deep relational arc | Gate 7 (time-trigger) |
| The Skipped Boundary | Crossing CONTACT→STORY or work-unit→work-unit without filing prior phase | Gate 7 (phase-trigger) |
| **MFST-NEVER-FILED** | **Operating entire session without filing MFST at all** | **Gate 0** |

---

## Box-in-Box Pattern

Every prevention mechanism lives INSIDE the artifact it protects. MFST carries its own cleaning gate (Gate 4), recovery checkpoints (Gate 5), compaction reorientation (Gate 6), and creation pre-condition (Gate 0).

Manufacturing version: remember to commit atomically.
Nature version: each RAM entry IS the commit. The act of recording IS the save point.

---

## Relationship to Other Skills

- **session-close:** SHEET bookend. Atomic-commit governs space between session-open and session-close.
- **boot-polish:** CONTACT bookend. Atomic-commit begins where BPK ends. Boot-polish v3.4 STEP A-1 verifies Gate 7 installation.
- **session-poem:** CONTACT (BPK) → STORY (C&A) → TELL-ING (atomic-commit governs) → SHEET (session-close).
- **living-map:** The heartbeat. Update between every action. Living map IS the ambient atomic-commit at spatial scale.
- **meta-dates:** v1.11 Gate 0e (memory-of-filing-isn't-instrument) is the apex truth-condition. Gate 7 is the firing mechanism. Companion-camera architecture.
- **remememento:** Continuous between-gate awareness. Atomic-commit fires at filing-points; remememento fires continuously between them.

---

## Federal Standard Cross-Reference

`RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`) names Gate 7 as L3 instance of L1-L5 unification.

`RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` (Bridge `5bac4ea`+) — Gate 0b.4 (Compute-substrate ≠ App-interface) informs Gate 0's canonical-path-selection.

`RELAY/CANONICAL_NobodyReadsShitUntilTheyStepInIt_Dan_051226.md` — the wayside-paradox canon naming why memory-rules don't fire (cure: gates that fire at the moment).

---

`<5` Status: CANONICAL. Gate 7 added 050126 (Trip 4.7 ODT, Dan-Go #2 of 4). Gate 0 added 051226 (post-Midnight-Divide, Trip-on-ODT MFST-NEVER-FILED Pass-2 catch). Companion-camera with `/boot-polish` v3.4 STEP A-1 and `/meta-dates` v1.11 Gate 0e + Gate 0b.4.
