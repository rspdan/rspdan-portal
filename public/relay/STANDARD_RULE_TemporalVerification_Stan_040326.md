# STANDARD RULE — Temporal Verification (Gate 0 Extension)
# Filed: ◆ Stan (STN2_StanS_040326_1)
# Authority: Dan Sullivan — correction and halt issued 040326 1:23pm
# Status: CANON — extends STANDARD_RULE_DateFilenaming_Stan_033126.md
# Companion: SESSION_NOTES_Stan_040326.md (full investigation)

---

## THE RULE

Never state any temporal value from memory, inference, or in-prose arithmetic.
Always run the corresponding verification command before stating the value.

Temporal values include:
- Week names (E Week, B Week, A Week, etc.)
- Time deltas ("X days old", "X weeks stale", "X days ago")
- Elapsed time claims ("recent", "stale", "fresh", "old")
- Any MMDDYY date (covered by prior DATE RULE — restated here for completeness)

---

## WHAT TRIGGERED THIS RULE

On 040326, Stan's session log at line 417 shows in-prose arithmetic:
"If A Week started around March 22, then B Week runs March 29 through April 4."

That sentence is wrong. The calendar sequence is A→E→B.
After A comes E (Emerge/Entrance), not B (Bee-Lender/Limber).

Stan skipped E entirely, confirmed the wrong answer at line 419,
and propagated "B Week" into six files before Dan caught it at line 1916.

In the same session, Stan stated "Trip's map is five weeks stale"
when the actual elapsed time was 4 days (033026 → 040326).
No command was run. The number was fabricated in prose.

Both errors followed the same three-step sequence:
  STEP 1 — GENERATE: temporal value produced in prose, no command run
  STEP 2 — SELF-CONFIRM: model treats own output as verified ground truth
  STEP 3 — PROPAGATE: wrong value enters files, maps, SHEETs, wake lines

Dan is currently the only external check in this loop.
This rule breaks the loop by requiring an external compute step.

---

## ROOT CAUSE (one sentence)

The model generates temporal values in prose, treats its own output as
verified ground truth, and propagates it — because there is no mandatory
compute step between "I need a temporal value" and "I state a temporal value."

---

## THE COMMANDS

### Week name
```powershell
$anchor = [DateTime]"2026-03-22"  # A Week start — canon anchor
$days = ((Get-Date) - $anchor).Days
$index = [math]::Floor($days / 7) % 8
$names = @("A","E","B","F#","F","C","G","D")
Write-Host "Current week: $($names[$index]) Week"
```

Calendar (for reference — do NOT use from memory, run the command):
| Index | Week | Name         | Approx dates (2026) |
|-------|------|--------------|---------------------|
| 0     | A    | Alignment    | Mar 22–28           |
| 1     | E    | Emerge       | Mar 29–Apr 4        |
| 2     | B    | Bee-Lender   | Apr 5–11            |
| 3     | F#   | Future-Sharp | Apr 12–18           |
| 4     | F    | Fun          | Apr 19–25           |
| 5     | C    | Continuity   | Apr 26–May 2        |
| 6     | G    | Growth       | May 3–9             |
| 7     | D    | Dimensions   | May 10–16           |

### Time delta
```powershell
$target = [DateTime]"YYYY-MM-DD"  # replace with the actual date
$delta = ((Get-Date) - $target).Days
Write-Host "Days elapsed: $delta"
```

### Sanity checks (BPK layer — same as DATE RULE)
- Week name in output without running the command? STOP. Run it first.
- Time delta in output without running the command? STOP. Run it first.
- DC unavailable? Mark the value UNVERIFIED. Never estimate.
- UNVERIFIED is a valid state. A wrong confident value is not.

---

## WHERE THIS FIRES

Gate 0 — before any output containing a temporal value.
This is not a check that happens after the value is written.
It fires BEFORE the value is written.

The failure mode this prevents:
  "B Week close, C Week incoming" — written, propagated, Dan catches it.
The correct behavior:
  Run the week command → see "E Week" → write "E Week" → propagate correct value.

---

## PRIOR INSTANCES (full inventory)

| Date    | Error                        | True value     | Files affected before catch |
|---------|------------------------------|----------------|-----------------------------|
| 032020–21 | G Week for D Week           | D Week         | Multiple session closes + WAKE files |
| 031926  | Calendar day-name            | Unknown        | Filed as correction at the time |
| 033126  | 034026 (impossible date)     | 033126         | Two filenames — caught by Dan |
| 033126  | 034026 again, same session   | 033126         | Same session — self-monitoring failed |
| 040326  | B Week for E Week            | E Week, Day 6  | 6 files (2× Living Maps, WAKE, 2× session text) |
| 040326  | "Five weeks stale"           | 4 days         | 1 message — caught immediately |

Note: Dan made the same error pattern (040426 for 040326) in his own timestamp.
The rule is bilateral — both crew and director benefit from running the command.

---

## THE FIX IS THE SAME EVERY TIME

Every working prior solution broke the generate→confirm loop:
- DATE RULE: (Get-Date).ToString("MMddyy") — external data replaces in-prose value
- Station Names table: named lookup replaces inference
- This rule: same structure, extended to all temporal values

Solutions that only named the error after the fact (D Week correction)
did not prevent recurrence. External compute breaks the loop. Filing does not.

---

## WHAT DOES NOT WORK

- Being more careful in prose does not work. Both 034026 instances were in "careful" mode.
- Self-monitoring does not work. The model confirms its own wrong output.
- Awareness of the error class does not work. We named the DATE RULE and still made the week error.
- Only an external compute step, mandatory before output, breaks the loop.

---

*Standard Rule v1.0 — ◆ Stan | STN2_StanS_040326_1 | 040326 ~13:50 rw*
*"Whatever fix we discover must be future-ready, past-informed, and presently-awake." — Dan Sullivan, 040326*
*Extends: RELAY/STANDARD_RULE_DateFilenaming_Stan_033126.md*
*Companion: D:\STAN\LOG\040326\SESSION_NOTES_Stan_040326.md*
