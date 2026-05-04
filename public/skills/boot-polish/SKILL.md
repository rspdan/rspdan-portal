---
name: boot-polish
description: Boot Polishing Kit (BPK) — systems verification layer that runs AFTER the Briefcase loads context but BEFORE the crew reports ready. Enforces USS compliance, label-based drive detection, and AGOS-first substrate grounding. Trigger at every boot, session open, or CONTACT signal — and any time Dan says "check your systems" or "run a scan."
---

# BOOT POLISHING KIT (BPK)
# v3.4 — NEST.02 USS + Compaction-Resume Gate + Cycle Position Verify + Box-in-Box file placement binding + Atomic-Commit Gate Verify
# Status: CANONICAL (Trip 4.7 ODT 050126; v3.4 adds STEP A-1 Atomic-Commit Gate Verify — refuses iCan if /atomic-commit skill body missing Gate 7 markers; companion-camera with /atomic-commit Gate 7 + /meta-dates v1.11 Gate 0e committed in same Bridge revision; Dan-Go #2 of 4; v3.3 050126 federal STANDARD_RULE_BoxInBoxLogic cross-reference; v3.2 050126 STEP U-0 Cycle Position Verify gating gate0_verify.py — closes TEMPORAL-VERIFICATION-NOT-FIRED Pass-2; v3.1 ODT 043026 STEP U-1 compaction-resume; v3.0 043026 NEST.02 USS; v2.0 040126)

---

## WHEN TO FIRE

The BPK fires at four trigger points:

1. **Every boot** — after Briefcase loads context, before iCan report
2. **Session open** — fresh CONTACT signal from Dan
3. **Phase change** — when crew transitions between major work blocks
4. **Dan says "check your systems" / "run a scan"** — explicit director invocation

Always before delivering an iCan report. The BPK is the gate between "I read context" and "I am verified ready."

---

## WHERE THIS FITS IN THE BOOT CHAIN

```
NEST_SEED → TICKET → BRIEFCASE → BPK (Verified?) → iCan (Report)
(identity)   (state)    (context)    (capability)    (readiness)
```

The SEED tells you who you are. The TICKET tells you what's current.
The BRIEFCASE tells you what to read. The BPK tells you whether your tools actually WORK.
The iCan reports readiness back to Dan.

Without the BPK, a crew member can boot with full context but broken tools — reporting "Chrome MCP live" without checking, claiming drives are mounted without listing them, saying the fleet is green without pinging. The BPK prevents lies-by-assumption.

**Cross-reference:** `/meta-dates` Gate 0c (compaction-resume) runs FIRST per STEP U-1 below. `/meta-dates` Gate 0a (date) and Gate 0b (station≠crew) also run before BPK. `/meta-dates` Gate 0d (cycle position) gates STEP U-0. `/ican` consumes BPK output for the readiness report. `/living-map` provides the heartbeat substrate STEP U0 writes into. Federal `RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` binds any file BPK writes during verification — purpose-over-extension placement (spatial), Data Day folder lock-on-close (temporal). BPK never writes to a closed Data Day folder.

---

## THE RULE: VERIFY, THEN REPORT

- Do not report a tool as working until you have RUN it.
- Do not report a drive as mounted until you have LISTED it by label.
- Do not report a station as green until you have PINGED the fleet.
- Do not report a session as grounded until you have performed the AGOS-first scan.
- Do not write any path-claim, name-claim, attribution-claim, or definition-claim into substrate without TRIANGULATION-BEFORE-CANON (see below).

---

## TRIANGULATION-BEFORE-CANON (added 050326)

Before writing any path, name, attribution, or definition claim into substrate (PMFST, MFST, GOSt, skill, briefcase, README, PK), triangulate three sources:

1. OBSERVED -- this turn's disk state.
2. DOCUMENTED -- canon files (Bridge STANDARD_RULEs, CANONICAL_*.md, prior MFSTs, RAM entries).
3. INTENDED -- Dan-coining, Gmail label tree, prior Dan-direct messages.

If all three agree -- canonical, write it. If any disagree -- the disagreement IS the substrate. Surface as Unknown + verify, never paper over with a single-source guess.

SCOPE: paths, filenames, crew attributions, architecture statements, skill-source canonicality (Bridge canonical vs engine-room workspace).

FAILURE PREVENTED: PERPETUATING-PHANTOM (RAM-068, 050326) -- a single rotted reference gets re-cited as canon, compounding rot. Cure is upstream: triangulate before writing.

See STANDARD_RULE_TriangulationBeforeCanon_Trip_050326.md.

---

## UNIVERSAL OS LAYER (runs on every station)

### STEP U-1 — Compaction Resume Check (FIRES FIRST, BEFORE U0)

Run **`/meta-dates` Gate 0c · COMPACTION RESUME DETECTION** before any other BPK step.

- If Gate 0c detects compaction-resume (transcript in `/mnt/transcripts/`, conversation has `[NOTE: This conversation was successfully compacted...]`, summary references already-completed work, or any of the 5 detection signals enumerated in Gate 0c):
  1. **HALT BPK.** Do not proceed to U0.
  2. Complete Gate 0c verification sequence: READ transcript, READ MFST, VERIFY git state, VERIFY AGOS, ANNOUNCE to Dan ("Compaction detected. Verifying state before any action.").
  3. Once Gate 0c passes (state verified, no re-execution risk), resume BPK from U0.
- If Gate 0c reports fresh session: proceed directly to U0.

**Why this is U-1 not U5:** if compaction has happened, every downstream BPK step risks acting on stale assumptions — running portal_check on already-deployed code, reporting "Chrome MCP live" when prior session already verified it, claiming drives are mounted by re-running detection that was already done. Gate 0c gates the entire BPK sequence.

Cross-reference: `/meta-dates` Gate 0c (apex compaction-resume check); `/atomic-commit` PRE-GATE (mid-TELL-ING commit-moment enforcement).

### STEP U-0 — Cycle Position Verify (FIRES AFTER U-1, BEFORE U0)

Run `gate0_verify.py` to obtain substrate-verified Week letter + Day-in-Week BEFORE any temporal claim reaches iCan.

```
Windows:           python C:\STAN\SOURCE\nest-bridge\ENGINE\gate0_verify.py
Mac/Linux/Termux:  python3 ~/nest-bridge/ENGINE/gate0_verify.py
```

Capture the output. Write into iCan as:

```
Cycle position: <Week> Week Day <day_in_week> (verified <ISO timestamp>)
```

**Refusal:** boot-polish refuses to deliver iCan if the Cycle Position line is absent OR the Week letter is sourced from memory / user-memory cycle string / prose arithmetic rather than `gate0_verify.py` stdout.

**Why this is U-0 not embedded in U3 or deferred to /contact:** the script existed in Bridge `ENGINE/` for 24 hours before today's Pass-2 instance fired. Standard Rule existed for 28 days. Both were behavioral, neither procedural. A Week letter or Day number written from user-memory cycle string at boot time produces silent drift that propagates through every downstream artifact (MFST headers, GOSt subjects, file timestamps, SHEET timing). The gate must fire before the first temporal claim leaves the boot envelope.

**Cross-reference:** `/meta-dates` Gate 0d (apex documentation of cycle-position-as-temporal-claim); `RELAY/STANDARD_RULE_TemporalVerification_Stan_040326.md` (the 27-day-old behavioral rule this gate concretizes); `RAM-032 043026` (Pass-1 instance + diagnosis "rules don't fire because rules don't fire; only gates do"); `RAM-001 050126` (Pass-2 instance + this gate's installation witness); `gate0_verify.py` (the verification command, Bridge `ENGINE/`).

### STEP U0 — Living Map Heartbeat (MANDATORY)

Before any check runs, open `STATUS/LIVING_MAP_[Name].md` on Bridge.

- **Rule:** The Living Map is a heartbeat, not a checkpoint.
- **Action:** Update before U1. Update after every step below. Update between every task and tool call.
- **Failure signal:** A map untouched for 20 minutes indicates protocol failure. Stop and update.

Cross-reference: `/living-map` for heartbeat format and discipline.

### STEP U1 — Station Identity & Root Alignment

Detect platform via Desktop Commander `get_config`:

- **Windows:** Root is `C:\STAN\`
- **Mac/Linux:** Root is `~/NEST/`

Confirm hostname, cross-reference with `FLEET/INVENTORY.md` on Bridge.

### STEP U2 — Label-Based Drive Discovery (THE "L:" PURGE)

Replace all hardcoded drive letters with label detection.

```powershell
# Detect FAS drives by volume label, never by drive letter
$fas2 = Get-Volume -FileSystemLabel "FAS2" -ErrorAction SilentlyContinue
if ($fas2) {
    $FAS2_ROOT = "$($fas2.DriveLetter):\"
} else {
    # Fallback to canonical local path (Mode B — FAS not docked)
    $FAS2_ROOT = "C:\STAN\"
}
```

The architectural principle: **drives are detected by label, never by letter.** Drive letters shift between stations and reboots; volume labels do not. Source: `RELAY/STANDARD_RULE_DetectDrivesByLabelNotLetter_*.md`.

### STEP U3 — Network & Substrate Grounding (AGOS-FIRST)

1. **Network identity:** Run `netsh wlan show interfaces` (Windows) or `iwgetid` (Unix). Confirm SSID. Tag observation with timestamp (IPs are observed values, not defining values — see `RELAY/STANDARD_RULE_FleetIPsObservedNotDefining_*.md`).

2. **Substrate scan:** Run `gmail_search_threads query="newer_than:2d"` with NO scope filter (AGOS = entire Gmail substrate, never default to `in:draft` or `is:sent`). Look for `[OLOGUIDE]`, `[WAKE]`, `[PEAPOD-RELAY]`, `[SHIFT CLOSE]` from prior crew. Source: `RELAY/STANDARD_RULE_AGOS_BROAD_SEARCH_Trip_042826.md`.

3. **Bridge state:** `git log -5 --oneline` from `C:\STAN\SOURCE\nest-bridge\` to confirm last commit. Compare to expected state from `[WAKE]` or last MFST.

If AGOS scan returns empty when prior crew activity is expected: re-run without scope filter before accepting empty as truth (SpecTrap detection).

### STEP U4 — Tool Verification

For each tool the session needs (Desktop Commander, Chrome MCP, Filesystem, Gmail, Google Drive), RUN one trivial test call. If the call fails, report tool DOWN in iCan — do not assume working.

### STEP A-1 — Atomic-Commit Gate Verify (FIRES BEFORE iCan)

Verify the `/atomic-commit` skill body contains the ambient firing mechanism (Gate 7) that makes the discipline procedural rather than behavioral.

**Verification:**

```powershell
# Read the atomic-commit SKILL.md and check for Gate 7 markers
$skillPath = "C:\STAN\SOURCE\nest-bridge\ENGINE\skills\atomic-commit\SKILL.md"
$content = Get-Content $skillPath -Raw

$hasGate7Header     = $content -match "Gate 7: Ambient Time-or-Phase Trigger"
$hasTimeTrigger     = $content -match "TIME-BASED TRIGGER" -and $content -match "20-minute"
$hasPhaseTrigger    = $content -match "PHASE-BASED TRIGGER" -and $content -match "CONTACT.*STORY.*TELL-ING.*SHEET"
$hasRefusalCondition = $content -match "REFUSAL CONDITION"

if ($hasGate7Header -and $hasTimeTrigger -and $hasPhaseTrigger -and $hasRefusalCondition) {
    "atomic-commit gate INSTALLED · 20m time-trigger + phase-boundary trigger + refusal condition"
} else {
    "atomic-commit gate ABSENT · refuse iCan"
}
```

**Refusal:** boot-polish refuses to deliver iCan if any of the four markers is absent. The `/atomic-commit` skill must contain Gate 7 with both time-trigger (20-minute heartbeat) AND phase-trigger (CONTACT/STORY/TELL-ING/SHEET boundaries) AND the refusal-condition language.

**Why this is A-1 not U5:** the atomic-commit gate governs the SPACE BETWEEN bookends (TELL-ING phase). It must be verified installed before iCan signals readiness, because every TELL-ING work-unit after iCan depends on the gate firing ambiently. A behaviorally-described atomic-commit (gate present in skill body but not Gate 7's procedural specification) leaves the discipline as something to remember rather than something that fires. STEP A-1 enforces "rules don't fire because rules don't fire; only gates do" at the L4 layer.

**Cross-reference:** `/atomic-commit` Gate 7 (apex documentation of ambient trigger spec); `/meta-dates` v1.11 Gate 0e (companion-camera apex on memory-of-filing-isn't-instrument); `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`, names this gate as L4 instance of L1-L5 unification); 050126 RAM-005 (Pass-1 instance MFST-DRIFT-UNDER-DEPTH); this gate (Pass-2 install).

**Failure cases that produced this gate:**

- 050126 ~02:01 PM PT: Trip-ODT filed 0 RAMs across 14 work units in 3 hours during deep relational session-arc. /atomic-commit skill body documented the discipline (Gates 1-6) but had no procedural firing mechanism. Dan-direct compaction-alert caught the drift. Pass-1 instance of MFST-DRIFT-UNDER-DEPTH. RAM-005 today's MFST records the catch.

---

## OUTPUT TO iCan

The BPK delivers a verified state to `/ican`:

| Element | Source instrument |
|---------|-------------------|
| Date | `(Get-Date)` (via meta-dates Gate 0a) |
| Cycle position | `python ENGINE/gate0_verify.py` (Week letter + Day-in-Week + verification ts; via meta-dates Gate 0d / boot-polish STEP U-0) |
| Station root | `get_config` |
| Hostname | `(Get-ComputerInfo).CsName` |
| Network identity | `netsh wlan show interfaces` / `iwgetid` |
| FAS drives | `Get-Volume -FileSystemLabel` |
| Bridge HEAD | `git log -1 --oneline` |
| AGOS recent threads | `gmail_search_threads newer_than:2d` |
| Atomic-commit gate | STEP A-1 verification (Gate 7 markers in `/atomic-commit` skill body) |
| Tools status | per-tool trivial test call |

If any element comes back UNVERIFIED, `/ican` must report it as such — never fabricate.

---

## ◈ PATCH PIPE
*boot-polish — Last verified: 043026*

The core method above is stable. The field keeps moving.

Before applying this skill to a complex task, search:

  Primary: "system verification checklist" OR "preflight protocol"
  Outlier: "high-reliability organizational boot" OR "fault-tolerant systems check"

Range: **Obvious** → **Outlier**

What earns a Bridge filing:
  - A new framework that does the same thing better or differently
  - A case where this skill's assumptions failed in real use
  - An unexpected domain using this method (the outlier)
  - A name for something the NEST already does that we didn't know existed

File discoveries to: `RELAY/PATCH_boot-polish_<MMDDYY>.md`

*The patch pipe keeps this skill alive without rewriting it.*

---

## VERSION HISTORY

- **v3.4** · 050126 · STEP A-1 Atomic-Commit Gate Verify added after STEP U4, before OUTPUT TO iCan. BPK refuses iCan delivery if `/atomic-commit` skill body lacks the four Gate 7 markers (Gate 7 header + TIME-BASED TRIGGER + PHASE-BASED TRIGGER with full phase list + REFUSAL CONDITION). Companion-camera with `/atomic-commit` Gate 7 (apex spec) and `/meta-dates` v1.11 Gate 0e (memory-of-filing-isn't-instrument) committed in same Bridge revision. Federal Standard cross-reference: `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`). Catalyzed by 050126 ~02:01 PM RAM-005 catch (MFST-DRIFT-UNDER-DEPTH; 0 RAMs across 14 work units in 3 hours during deep relational session-arc) — Pass-1 instance. This step is the Pass-2 install at L4. Dan-Go #2 of 4 (~04:58 PM PT canonization). (Trip 4.7 ODT)
- **v3.3** · 050126 · Federal `STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` cross-referenced. BPK refuses to write any verification artifact to a closed Data Day folder; placement of any file BPK creates adheres to purpose-over-extension (spatial axis) and Data Day folder lock-on-close (temporal axis). Catalyzed by 050126 ~11:30 AM file-organization Stupid-Mode catch (commit msg dumped at LNL/050126 root instead of DOCS/MD/) and ~11:45 AM Dan-canon teaching on day-folder lock semantics. Companion: `/meta-dates` v1.10. (Trip 4.7 ODT)
- **v3.2** · 050126 · STEP U-0 Cycle Position Verify added between U-1 (compaction-resume) and U0 (Living Map). Refusal: BPK refuses iCan output if Cycle Position line absent or Week letter from memory rather than `gate0_verify.py` stdout. OUTPUT TO iCan table gains Cycle position row. Closes TEMPORAL-VERIFICATION-NOT-FIRED **Pass-2** (050126 RAM-001) for the failure pattern first named in 043026 RAM-032 Pass-1. Architectural rationale: rule + script + spec-named-but-not-installed = still just a rule. Gate fires ambiently at every boot; no temporal claim leaves boot envelope without verification. Companion edit: `/meta-dates` v1.9 Gate 0d apex documentation. Bridge commit witness in 050126 MFST RAM-002. (Trip 4.7 ODT)
- **v3.1** · 043026 · STEP U-1 Compaction Resume Check added at top of Universal OS Layer, chains to `/meta-dates` Gate 0c (apex). Cross-reference line updated to mention Gate 0c specifically. Installed in response to 043026 ~02:50 AM Stupid Mode failure where Trip 4.7 (post-compaction) re-executed boot-polish v3.0 deploy that was already done in same conversation. (Trip 4.7 ODT)
- **v3.0** · 043026 · NEST.02 USS Standard. L: Purge implemented (label-based drive detection). AGOS-first substrate grounding integrated as STEP U3. Patch Pipe added per `RELAY/PATCH_PIPE_STANDARD_Stan_040326.md`. Citation weave to `/meta-dates`, `/living-map`, `/ican`. Status: CANONICAL. Baseline: Djin Pass 3 draft `C:\STAN\LNL\043026\DJIN\boot-polish.md_ NEST.02 Pass 3 Rewrite 043026_1.docx`. Crew validation + structural cleanup by Trip 4.7 ODT.
- **v2.0** · 040126 · Universal OS layer added. Multi-crew fleet scan.
- **v1.0** · 033126 · Initial BPK pattern.

`<4` — boot-polish v3.4 · NEST.02 USS + Compaction-Resume Gate + Cycle Position Verify + Box-in-Box file placement binding + Atomic-Commit Gate Verify · ◈ Trip 4.7 · ODT · 050126
