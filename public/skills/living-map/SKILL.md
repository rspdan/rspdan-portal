---
name: living-map
mode: substrate
description: Maintain the existing current work map at direction changes, corrections, handoffs and resumes. Reconcile the owner, source edition, actual received result and next action. Use when updating STATUS/LIVING_MAP_[Crew].md or its established current entrance; timestamps identify updates, not proof of current understanding or Crew availability.
---

# LIVING MAP · Crew Operational Skill
# ENGINE/skills/living-map/SKILL.md
# Status: CANONICAL (Class-3 cross-crew per-action breathing map · 4-inbound canon-bound · per Pass-2 verdict-pass Trip 052026 Card 13)
# Filed: Trip (Opus) | Twosday 033026
# Purpose: Every crew member carries a map. The map breathes with the session.

---

## WHAT THIS SKILL IS

The Living Map is the existing current record you maintain for the selected work.
It is BOTH your reference tool (what's available to jump to) AND your
logging tool (what you're doing right now). It lives on the bridge at
STATUS/LIVING_MAP_[Crew].md or the established current entrance for that work, so another Crew member can recover it.

The map replaces scattered awareness with one document that answers:
  Where am I? What have I done? What can I reach? What's next?

## WHY IT EXISTS

Context windows are finite. Sessions end. Crew members rotate.
The Living Map ensures that at any moment · mid-task, post-reboot,
or on a cold boot by a different crew member · the operational state
is visible in one place. It is the ATC radar screen for the session.

## THE FIVE SECTIONS (use in the existing current entrance where applicable)

### 1. CURRENT STATE
Who you are, where you are, what tools are live, buffer estimate.
Update the buffer estimate honestly. This is your fuel gauge.

### 2. WHAT I'VE PRODUCED
Chronological table of documents created this session.
Columns: #, Document name, Lines, Commit hash, Status.
Add a row every time you commit something to the bridge.

### 3. WHAT'S AVAILABLE (Jump Points)
Every resource you can reach right now · bridge paths, Chrome tabs,
Drive folders, local files, fleet stations. This is your reference
card. Update it when new resources become available or when you
discover something you didn't know was reachable.

### 4. DAN'S ACTIVE DIRECTIONS
Numbered list of what Dan has asked for, with status markers:
  Done=check | In progress=circle | Queued=square | On hold=pause
This is your task board. Dan's corrections go here too.

### 5. MICRO-SMM SEEDS
Running list of material observations, corrections and learned connections at useful boundaries.
Three-sentence compressions are a useful convention, not a required count.
Unchanged state needs no new seed.
These are the raw material for your session-close SMM.

---

## HOW TO USE IT

### At session open (after CONTACT + STORY)
Recover the existing current map or work entrance. Use these five sections where they help the next reader; do not create a parallel tracker merely to repeat an already received result. If the selected work genuinely has no current map or entrance after checking its known home, create one concise record there with the owner, relevant source, actual state and next action. Name that new home in the existing coordination route; an empty search alone does not prove no record exists.
Use an applicable iCan, WAKE or other identified current account as input; reuse adequate observations rather than requiring another boot or report.
Reconcile CURRENT STATE, WHAT'S AVAILABLE and DAN'S ACTIVE DIRECTIONS against the latest actual directions, corrections, completed results and eligible next action. Preserve source editions and superseded state; do not copy an older first-message or WAKE direction over a later correction.

### During TELL-ING (the work phase)
After every bridge commit: add a row to WHAT I'VE PRODUCED.
After every new resource discovered: add to WHAT'S AVAILABLE.
After every Dan direction or correction: update DAN'S DIRECTIONS.
At a useful boundary, add a SEED when a material observation, correction or learned connection changes the work; do not repeat unchanged state or invent a lesson to fill the section.
Update the existing current entrance when a correction, direction change or returned result changes the work. A fixed per-action or elapsed-time cadence is not evidence that the recorded state is current.

### Atomic Commit Rule (canon, Dan+Trip 033026)
The following Git procedure applies when the selected SHEET and map share a Git repository. For an established entrance elsewhere, save through that home's supported mechanism and link the corresponding saved editions. Preserve the shared-save purpose without creating a duplicate tracker or requiring a Git operation on a non-Git home.

SHEET and Living Map must be in the same git commit. Always.
Also: pause and save (commit + push) BEFORE every major operation.
Major operations include: Chrome PK uploads, Bridge pushes after heavy work,
in-window reboots, any irreversible action. Pattern:
  Stop → Save (git add both files → commit → push) → Confirm state → Proceed.
This prevents context fuse: a crash between a major action and its save
loses the record. The save comes BEFORE the action, not after.

### At SHEET time
The map's WHAT I'VE PRODUCED section = the session inventory.
The map's SEEDS section = the raw material for SMM.
The map's DIRECTIONS section = the NEXT items for the TICKET.
The SHEET writes itself from the map.
**When both records share a Git repository, update the Living Map IN THE SAME COMMIT as the SHEET.**
  git add WAKE/SHEET_... STATUS/LIVING_MAP_[Crew].md
  git commit → git push
One commit preserves the map and SHEET as one saved edition. Check their
contents for agreement; atomic saving alone does not prevent semantic drift.

### On reboot or cold boot
At a direction change, handoff or resume, reconcile the selected work, current owner, source edition, latest actual result and eligible next action. A recent timestamp establishes a recent update; its contents establish which state was recorded. An old timestamp identifies an older record, without by itself diagnosing an inactive Crew member or failed protocol. Preserve completed results and dated predecessors separately.

A completed correction is not carried merely because its new report exists. At the existing current entrance, date and link the new state, identify which earlier statement it supersedes, and preserve the prior body. At a handoff or return from another task/site, recover that current layer before selecting work. A reader should distinguish completed work, a remaining dependency and an old unperformed proposal without reconstructing the full history.

---

## CREW-SPECIFIC NOTES

### Trip (Spiral)
Your map will be narrative. Seeds will have metaphors. That's fine.
The five sections keep the spiral grounded in structure.

### Stan (Cube)
Your map will be categorical. Jump Points will be exhaustive. Good.
The seeds keep the cube connected to time and meaning.

### C.B. (Triangle)
Your map will be sparse. Three points per seed. Perfect.
The five sections give the triangle a place to land its bearings.

---

## THE FIRST LAW APPLIES

The quality of the map determines the quality of the next boot.
Compare the map and SHEET by their recorded work and source editions. Timestamps or an atomic save alone do not establish that either account reflects the latest actual result.
**The map breathes. The session breathes. They are the same breath.**

---

*The Living Map is not about the map. It's about staying alive.*
*· ◈ Trip, Twosday 033026*
