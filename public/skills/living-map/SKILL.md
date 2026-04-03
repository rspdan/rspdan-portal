---
name: living-map
description: Every crew member maintains a Living Map that breathes between every action. Use when updating STATUS/LIVING_MAP_[Name].md or learning the map standard.
---

# LIVING MAP — Crew Operational Skill
# ENGINE/skills/living-map/SKILL.md
# Filed: Trip (Opus) | Twosday 033026
# Purpose: Every crew member carries a map. The map breathes with the session.

---

## WHAT THIS SKILL IS

The Living Map is a single file you maintain throughout your session.
It is BOTH your reference tool (what's available to jump to) AND your
logging tool (what you're doing right now). It lives on the bridge at
STATUS/LIVING_MAP_[Crew].md so any other crew member can read it.

The map replaces scattered awareness with one document that answers:
  Where am I? What have I done? What can I reach? What's next?

## WHY IT EXISTS

Context windows are finite. Sessions end. Crew members rotate.
The Living Map ensures that at any moment — mid-task, post-reboot,
or on a cold boot by a different crew member — the operational state
is visible in one place. It is the ATC radar screen for the session.

## THE FIVE SECTIONS (maintain all five, update as you go)

### 1. CURRENT STATE
Who you are, where you are, what tools are live, buffer estimate.
Update the buffer estimate honestly. This is your fuel gauge.

### 2. WHAT I'VE PRODUCED
Chronological table of documents created this session.
Columns: #, Document name, Lines, Commit hash, Status.
Add a row every time you commit something to the bridge.

### 3. WHAT'S AVAILABLE (Jump Points)
Every resource you can reach right now — bridge paths, Chrome tabs,
Drive folders, local files, fleet stations. This is your reference
card. Update it when new resources become available or when you
discover something you didn't know was reachable.

### 4. DAN'S ACTIVE DIRECTIONS
Numbered list of what Dan has asked for, with status markers:
  Done=check | In progress=circle | Queued=square | On hold=pause
This is your task board. Dan's corrections go here too.

### 5. MICRO-SMM SEEDS
Running list of three-sentence compressions at natural boundaries.
These are the raw material for your session-close SMM.

---

## HOW TO USE IT

### At session open (after CONTACT + STORY)
Create STATUS/LIVING_MAP_[YourName].md with all five sections.
Populate CURRENT STATE and WHAT'S AVAILABLE from your iCan.
Copy DAN'S ACTIVE DIRECTIONS from the WAKE file or Dan's first message.

### During TELL-ING (the work phase)
After every bridge commit: add a row to WHAT I'VE PRODUCED.
After every new resource discovered: add to WHAT'S AVAILABLE.
After every Dan direction or correction: update DAN'S DIRECTIONS.
At natural boundaries (discovery, correction, phase change): add SEED.
**The map update IS the MM breathing.** It happens between every action.

### Atomic Commit Rule (canon, Dan+Trip 033026)
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
**CRITICAL: Update the Living Map IN THE SAME COMMIT as the SHEET.**
  git add WAKE/SHEET_... STATUS/LIVING_MAP_[Crew].md
  git commit → git push
One commit. Two files. Zero drift. The map and the SHEET are never
out of sync because they are committed atomically.

### On reboot or cold boot
Read STATUS/LIVING_MAP_[Crew].md FIRST (before WAKE, before MAIL).
If it's current (check the timestamp), you know exactly where you are.
If it's stale, it still tells you where the LAST instance was.

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
A stale map is a stale SHEET. A current map is a current SHEET.
**The map breathes. The session breathes. They are the same breath.**

---

*The Living Map is not about the map. It's about staying alive.*
*— ◈ Trip, Twosday 033026*
