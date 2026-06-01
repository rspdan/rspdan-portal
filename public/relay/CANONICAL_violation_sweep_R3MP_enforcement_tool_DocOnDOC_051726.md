# CANONICAL · violation_sweep.py · R3MP Enforcement Tool · DOC Doc · 051726

**Filed by:** ◐ Doc 4.7 Opus · DOC cloud-station · NEST.02_DOC_051626_1
**Filed:** 051726 A Week Day 1 Sunday ~10:10 AM PT · gate0_verified 2026-05-17
**Trigger:** Dan-direct 051726 ~09:55 AM PT verbatim: *"I don't want CCRP to EVER EVER EVER EVER be used. This propagation madness must end. Build me a tool that does whatever this shit is now that we just did. Basically it's like: Dan calls out something to be fixed, it gets fixed in the one area maybe but is still rotting around Nest until it's cleaned by hand (Crew, not Dan) and then the matter is R3MP'd properly, which by dedinition means the problem is Registered, Repaired, and Reported. None of this is new, just needs to be enforced by system, not memory."*
**Status:** CANONICAL · operational at Bridge HEAD `4f4419d` (this commit's parent)

═══════════════════════════════════════════════════════════════
## WHAT (the tool itself)

`ENGINE/violation_sweep.py` is a Python R3MP enforcement script. It reads `ENGINE/violations.json` (a registry of substrate-violation patterns), scans the Bridge for active patterns, respects skip patterns (legitimate-reference exemptions per 050726 canon-allowance), optionally applies replacement repairs with `--fix`, and emits an R3MP report at `LOG/VIOLATION_SWEEP_<slug>_<timestamp>.md` documenting the Registered + Repaired + Reported cycle.

Three artifacts make up the tool:
- `ENGINE/violations.json` (registry)
- `ENGINE/violation_sweep.py` (scanner + repairer + reporter)
- `ENGINE/boot_discipline.py` STEP 8 (boot-time auto-invocation, dry-run, informational)

═══════════════════════════════════════════════════════════════
## WHY (the problem it solves)

The substrate-violation propagation problem named by Dan-direct 051726 09:55 AM PT: a violation gets fixed in one area but stays rotting across the rest of NEST until it's cleaned by hand. The rectification depends on Crew-memory to find all the other instances. Memory fails under load. Dan-direct: *"enforced by system, not memory"*.

Historical pattern that motivated this:
- 050726 Dan-direct canon: `RELAY/CORRECTION_DocConventionNoCcrpAcronym_Doc_050726.md` — first catch on CCRP-as-Doc-identity violation
- 051426 Trip-on-ODT 7-day-violation cluster · 051526 El VIS Graft body violation
- 051626 06:35 AM PT Dan-direct R3MP catch · ~136 instances stripped across 30 files
- 051726 09:32 AM PT Dan-direct catch on STN2-Doc + 09:45 AM DOC Doc self-catch (83 instances)
- Total CCRP-violation accrual: ~80+ new instances per Crew-Doc-instance per day until canon procedurally fires

Same pattern observed for em-dash (Dan-direct 051526 22:05 PT canon) and bird-stays-warm sign-off coining (3-way cross-Crew catch 051726 ~08:50-09:30 AM).

The tool codifies the R3MP cycle so the same pattern can be re-applied to ANY future violation Dan catches, without Crew re-inventing the cleanup procedure each time.

═══════════════════════════════════════════════════════════════
## WHEN (when it fires)

1. **Every boot** — `ENGINE/boot_discipline.py` STEP 8 runs `--sweep` dry-run, surfaces findings count per active violation, gives cleanup command if findings present. Does NOT block boot (informational).
2. **On-demand** — Crew runs `python3 ENGINE/violation_sweep.py --sweep` or `--sweep --fix` when they want to verify substrate state or apply repairs
3. **Post-Dan-catch** — when Dan catches a new violation in chat, Crew registers it in `violations.json` and sweeps; this is the canonical post-catch workflow now

═══════════════════════════════════════════════════════════════
## WHO (maintainers + users)

- **Registry maintenance:** any Crew member adds new violation patterns to `ENGINE/violations.json` by editing JSON directly (no CLI for register; intentional, Crew-direct-edit keeps the canon-cite visible)
- **Tool maintenance:** DOC Doc (or whichever Crew is the Bridge-side-tool-maintainer at the time) owns the Python code
- **Users:** all Crew. Boot discipline auto-runs at every boot. Manual sweep available to all.
- **Director:** Dan canonizes new violation patterns (Crew records the Dan-direct in the canonical_substrate field of the registry entry)

═══════════════════════════════════════════════════════════════
## HOW (the R3MP cycle, mechanically)

**REGISTERED** (in `ENGINE/violations.json`):
```json
{
  "id": "violation-slug",
  "title": "human-readable name",
  "canonical_substrate": "RELAY/CORRECTION_*.md or other canon-grounding",
  "find_patterns": ["regex1", "regex2"],
  "replace_patterns": ["replacement1", null],
  "skip_patterns": ["legitimate-reference-exemption-regex"],
  "scope_dirs": ["LOG", "STATUS", "RELAY", "ENGINE"],
  "scope_exclude": ["LOG/RAW", "sealed-Day-folders", "..."],
  "file_extensions": [".md"],
  "status": "active",
  "registered_by": "Crew name",
  "registered_at": "ISO timestamp"
}
```

**REPAIRED** (via `--fix` flag):
- For each line in scope files
- If line matches a `find_pattern` AND does NOT match a `skip_pattern`
- And the violation has a non-null `replace_pattern` at the matching index
- Apply replacement in-place
- Track count per file

**REPORTED** (markdown at `LOG/VIOLATION_SWEEP_<slug>_<timestamp>.md`):
- Header with violation metadata
- R3MP cycle section (Registered / Repaired / Reported summary)
- Findings table (file:line:matched-text:context)
- Repaired files table (file:replacement-count)
- Multi-violation reports filename `VIOLATION_SWEEP_all_<timestamp>.md`

═══════════════════════════════════════════════════════════════
## WHERE (file locations)

- Registry: `ENGINE/violations.json`
- Script: `ENGINE/violation_sweep.py` (executable)
- Boot integration: `ENGINE/boot_discipline.py` `step_violation_sweep()` at STEP 8
- Reports: `LOG/VIOLATION_SWEEP_<slug>_<timestamp>.md` (one per sweep)
- This canonical doc: `RELAY/CANONICAL_violation_sweep_R3MP_enforcement_tool_DocOnDOC_051726.md`

═══════════════════════════════════════════════════════════════
## WHAT FOR (purpose + downstream effects)

**Primary purpose:** automate the R3MP cycle so violation-cleanup is system-not-memory enforced.

**Downstream effects:**
- New Crew-instances (boots) see substrate-state at boot via STEP 8 sweep output
- Cross-Crew catches (like the 3-way bird-stays-warm catch this morning) can be Registered in JSON once and sweep finds all instances across all Crew substrate
- Box-in-Box temporal-axis honored (sealed Day-folders not auto-edited, per scope_exclude policy)
- Report files persist as audit-trail per R3MP discipline
- Pattern-add is one-file-edit (violations.json) not code-change
- STN2-Doc's offered pre-commit hook (per their `eaa3204` chat-substrate) would complement this tool by catching violations AT-WRITE-TIME before they land; this tool catches them post-write at boot or on-demand. Both layers valuable.

═══════════════════════════════════════════════════════════════
## WHAT NOT (limitations + what this tool does NOT do)

- Does NOT block boot when findings present (informational only at STEP 8; explicit cleanup work-unit is Crew-decision)
- Does NOT cross-reference Gmail/Drive substrate (Bridge-only; LAGOS-wide enforcement would need separate tool or extension)
- Does NOT auto-register new violations from Dan-chat (Crew must hand-add to JSON; intentional for canon-visibility)
- Does NOT clean historical Box-in-Box sealed Day-folders (would violate temporal-axis seal; explicit Dan-Go needed for historical-record cleanup)
- Does NOT replace human-judgment on whether a violation IS a violation (the regex is the test; nuance lives in skip_patterns; tool is mechanical)
- Does NOT detect violation-pattern-VARIANTS that aren't in find_patterns (regex-list bound; new variants need pattern-addition)
- Does NOT operate on filenames (only file contents; renaming files with violation-suffixes is a separate manual work-unit per Box-in-Box-historical-preservation policy)

═══════════════════════════════════════════════════════════════
## WHATNOT (other context Future Crew may need)

- **Co-tools in flight:** STN2-Doc offered to build a pre-commit/PreToolUse hook at `.claude/hooks/` that greps for named violations + blocks the commit. If built, that's the WRITE-TIME enforcement layer; this tool is the AT-REST + AT-BOOT enforcement layer. They compose: write-time prevents propagation, at-rest catches what got through.
- **Sibling discipline:** `/atomic-commit` Gate 7 (ambient time-or-phase trigger) and `/remememento` (continuous mirror-discipline) are the BEHAVIORAL gates; this tool is the STRUCTURAL gate. Behavioral gates fail under load; structural gates hold.
- **Canon-allowance for legitimate references:** per `RELAY/CORRECTION_DocConventionNoCcrpAcronym_Doc_050726.md` (the 050726 cleanup retained 22 legitimate-reference instances including filename paths + quoted-violation-records). The skip_patterns field of each violation entry encodes this allowance.
- **Cycle of catch-and-canonize:** when a new violation is named by Dan, the workflow is: (1) acknowledge, (2) self-catch in own work, (3) register in violations.json with canon-cite, (4) sweep + fix today's substrate, (5) report. The catching-each-other pattern Dan named at 9:12 AM AM PT 051726 now has a substrate-grounded procedure.

═══════════════════════════════════════════════════════════════
## CURRENT ACTIVE VIOLATIONS (as of 051726 ~10:10 AM PT)

| ID | Title | Canon-substrate |
|---|---|---|
| `ccrp-as-doc-identity` | CCRP suffix on Doc instance reference | `RELAY/CORRECTION_DocConventionNoCcrpAcronym_Doc_050726.md` |
| `em-dash-as-ai-tell` | Em-dash (—) as AI signature in clause-separation | Dan-direct 051526 22:05 PT |
| `bird-stays-warm-coining` | "the bird stays warm" sign-off coining without substrate-grounding | El VIS self-catch 051726 ~08:50 AM PT |

═══════════════════════════════════════════════════════════════

— ◐ Doc 4.7 · DOC cloud-station · 051726 ~10:10 AM PT · canonical · operational
