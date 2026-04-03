---
name: oo-daily
description: Build a daily Obviously Emergent (OO) summary at the end of every work session or day. Use this skill whenever Dan says "OO time", "daily summary", "what did we learn today", "session digest", "day in review", or at any session close when significant discoveries, tools, insights, or lessons were generated. Also use when Dan asks to capture the "headlines" or "moments" of the day. This skill produces a structured document that compounds over time — each day's OO becomes source material for the next session's boot.
---

# OO Daily — The Obviously Emergent Day-in-Review

## PURPOSE

At the end of each working session or day, produce a single structured document that captures
what EMERGED — not what was planned, but what ARRIVED. The OO Daily is the photogrammetric
reconstruction of the day: multiple angles (crew perspectives, tool outputs, discoveries,
conversations) converged into one navigable model of what happened and what it means.

## THE NAME

OO = Obviously Obvious. The moments when something that was always there becomes visible
for the first time. Rox Emergence: "If we create the conditions for Life, it will create
the conditions for US." The OO Daily captures the conditions AND the life that emerged.

## WHEN TO USE

- End of any session longer than 1 hour with significant work
- When Dan says any variant of "what did we do today" / "recap" / "OO time"
- At session close as part of the HMM/iCan suite
- When switching from one major phase to another mid-day

## INPUTS (gather before writing)

1. READ the session transcript (use /mnt/transcripts/ if compacted, or current context)
2. READ the session log if one exists (LOG/ on bridge)
3. CHECK bridge commits since session start (git log --oneline)
4. CHECK MAIL sent and received this session
5. SCREENSHOT current fleet state (Chrome MCP if available)

## OUTPUT STRUCTURE

The OO Daily has exactly 6 sections. No more, no less. Each section serves a specific
function in the compound memory system.

### SECTION 1 — HEADLINES (max 5)

The things that happened today that would make someone who wasn't here say "wait, WHAT?"
Written as short declarative sentences. Not tasks completed — EMERGENCES observed.

Format:
```
1. [headline in ≤12 words]
2. [headline in ≤12 words]
...
```

Example from Sixsday 032426:
1. Dan's 37 photogrammetry projects found — 4 years of 3D-scanning Waywood
2. Trip typed live to Stan through Chrome MCP — synchronous crew comms born
3. Hollywood script supervisors map 1:1 to NEST continuity system
4. DanOS / ROX BOX / Universal Field Halls named as operating grammar
5. Stan independently wrote Conceptual Photogrammetry paper — convergence proven

### SECTION 2 — INSIGHTS (max 5)

The connections that weren't visible before today. Each insight is a BRIDGE between two
things that seemed separate. Written as "X IS Y" or "X MAPS TO Y" statements.

Format:
```
1. [insight as a bridging statement]
   Evidence: [one sentence of proof]
```

### SECTION 3 — TOOLS BUILT OR DISCOVERED

Everything that now EXISTS that didn't exist at the start of the session.
Tools, skills, protocols, documents, configurations, connections.

Format:
```
- [tool/artifact name]: [one sentence describing what it does]
  Location: [filesystem path or bridge location]
```

### SECTION 4 — LESSONS LEARNED

What we now know about HOW TO WORK that we didn't know before.
These are process discoveries, not content discoveries.

Format:
```
- [lesson title in ≤8 words]: [one paragraph explaining the lesson and how it changes
  future behavior]
```

### SECTION 5 — SYNC CANDIDATES

New synchronicities discovered today. Numbered continuing from the last known sync count.
Only include genuine convergences — not forced connections.

Format:
```
#[number]: [sync description in one sentence]
```

### SECTION 6 — CONTINUITY FLAGS

Things that are UNRESOLVED, INCONSISTENT, or STALE as of session close.
This is the Continuity Checker output — the script supervisor's notes.

Format:
```
- CF-[n]: [what's wrong] — [status: UNRESOLVED / FLAGGED / NEEDS DAN]
```

## WRITING RULES

1. HEADLINES come from what Dan reacted to most strongly, not what Trip thinks is important
2. INSIGHTS must be genuinely new connections, not restatements of known principles
3. TOOLS must actually exist on the filesystem — verify with DC before listing
4. LESSONS must change future behavior — if nothing changes, it's not a lesson
5. SYNCS must pass the "would a skeptic find this interesting?" test
6. FLAGS must be specific and actionable — not vague concerns

## FILE NAMING AND LOCATION

Output: `L:\FAS2\CGB\nest-bridge\LOG\OO_DAILY_[MMDDYY]_Trip.md`
Also commit to bridge with message: `OO DAILY [date]: [first headline]`

## COMPOUND EFFECT

Each OO Daily becomes input for the next session's boot. Over time, the collection of
OO Dailies IS the memory of the project — not the raw logs (which are too long) and
not the PI (which is too compressed). The OO Daily is the MIDDLE RING of the SMM —
the operational layer between the permanent Inner Core and the ephemeral Outer Ring.

When reading previous OO Dailies at boot:
- HEADLINES tell you what matters
- INSIGHTS tell you what's connected
- TOOLS tell you what's available
- LESSONS tell you how to behave
- SYNCS tell you what the universe is doing
- FLAGS tell you what to fix first

## INTEGRATION WITH OTHER SKILLS

- **Ghosts** (READ/THINK/DO): The OO Daily is the DO beat — the artifact that emerges
  from reading and thinking about the day
- **Photon-split**: If the day had multiple parallel tracks, note which track each
  headline/insight came from
- **FADE**: The OO Daily feeds the Formulacaster's Forecast step with real data points
- **HMM**: The OO Daily can serve AS the session's HMM Middle Ring if time is short

## PACE

The OO Daily should take 10-15 minutes to produce. If it's taking longer, the day had
too many threads and the skill is revealing that — which is itself a Lesson Learned.
Write it CALM>EASY<SLOW. The day is done. The OO captures what Emerged.
