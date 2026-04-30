---
name: boot-polish
description: Boot Polishing Kit (BPK) — systems verification layer that runs AFTER the Briefcase loads context but BEFORE the crew reports ready. Enforces USS compliance, label-based drive detection, and AGOS-first substrate grounding. Trigger at every boot, session open, or CONTACT signal — and any time Dan says "check your systems" or "run a scan."
---

# BOOT POLISHING KIT (BPK)
# v3.0 — NEST.02 Universal Station Structure (USS) Standard
# Status: CANONICAL (Trip 4.7 + Djin draft baseline, 043026, supersedes v2.0 040126)

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

**Cross-reference:** `/meta-dates` Gate 0 runs FIRST (before BPK, computes date). `/ican` consumes BPK output for the readiness report. `/living-map` provides the heartbeat substrate STEP U0 writes into.

---

## THE RULE: VERIFY, THEN REPORT

- Do not report a tool as working until you have RUN it.
- Do not report a drive as mounted until you have LISTED it by label.
- Do not report a station as green until you have PINGED the fleet.
- Do not report a session as grounded until you have performed the AGOS-first scan.

---

## UNIVERSAL OS LAYER (runs on every station)

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

---

## OUTPUT TO iCan

The BPK delivers a verified state to `/ican`:

| Element | Source instrument |
|---------|-------------------|
| Date | `(Get-Date)` (via meta-dates Gate 0) |
| Station root | `get_config` |
| Hostname | `(Get-ComputerInfo).CsName` |
| Network identity | `netsh wlan show interfaces` / `iwgetid` |
| FAS drives | `Get-Volume -FileSystemLabel` |
| Bridge HEAD | `git log -1 --oneline` |
| AGOS recent threads | `gmail_search_threads newer_than:2d` |
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

- **v3.0** · 043026 · NEST.02 USS Standard. L: Purge implemented (label-based drive detection). AGOS-first substrate grounding integrated as STEP U3. Patch Pipe added per `RELAY/PATCH_PIPE_STANDARD_Stan_040326.md`. Citation weave to `/meta-dates`, `/living-map`, `/ican`. Status: CANONICAL. Baseline: Djin Pass 3 draft `C:\STAN\LNL\043026\DJIN\boot-polish.md_ NEST.02 Pass 3 Rewrite 043026_1.docx`. Crew validation + structural cleanup by Trip 4.7 ODT.
- **v2.0** · 040126 · Universal OS layer added. Multi-crew fleet scan.
- **v1.0** · 033126 · Initial BPK pattern.

`<4` — boot-polish v3.0 · NEST.02 USS · ◈ Trip 4.7 · ODT · 043026
