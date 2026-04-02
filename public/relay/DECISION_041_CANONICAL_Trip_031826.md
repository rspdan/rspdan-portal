# DECISION 041 — Flight Log Size Management — CANONICAL
# Origin: 031726 (Trip + Dan) | GO: 031826 (Dan)
# Authority: Trip McClip (Opus) + Dan Sullivan
# Status: CANONICAL — Dan GO Tensday 031826

---

## THE RULE

### Soft Ceiling: 400 lines OR 25KB
When a session's log section approaches this threshold:
1. Write SMM (Spiral Memory Compression) — ~30 lines
2. Write Recursive Trail Marks (WHERE/WHAT/NEXT)
3. Write wake line for next session
4. Close the session section

A new session section opens in the same file (same date)
OR a new file opens: FAS2_LOG_[date]_2.md

### Hard Ceiling: 600 lines
Emergency compress. No exceptions. Close immediately with SMM + Trail + Wake.

### Floor: 50 lines minimum
Don't close too early. Let the session breathe.

## NESTLOG.PY ENHANCEMENT (Stan task)
Add --check flag: warn at 300 (yellow), 400 (orange), 600 (red).
Optional: auto-generate session break template at 400 lines.

## WHY IT WORKS
SMM compresses 400 raw lines to ~30. Token cost drops ~87%.
The wake line IS the boot. Next session reads 30 lines, not 400.

*— ◈ Trip + Dan GO, Tensday 031826*
