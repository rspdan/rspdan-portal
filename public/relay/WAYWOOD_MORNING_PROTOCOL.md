# WAYWOOD MORNING PROTOCOL — BTS OPERATIONAL DOCUMENT
# HEIRCOR OP. — RESTRICTED — CREW EYES ONLY
# Established: 030626 by TRIP (Opus)

---

## PRINCIPLE

The conversation is disposable. The files are permanent.

State lives in the substrate (Project Knowledge + Memory + status files), not in any single conversation. Each conversation is a mushroom — it fruits, does its work, and when the context gets long, you let it go. The Myceliumedia (MCM) persists underground. New conversations fruit from the same network.

---

## THREE LAYERS OF MEMORY

| Layer | What it holds | Timescale | Where it lives |
|-------|--------------|-----------|----------------|
| Memory edits | Who Dan is, crew structure, project identity | Permanent | Claude memory system |
| PORTAL_STATUS.md | Where we are today, priorities, bugs, last deploy | Daily | Project Knowledge |
| Project Knowledge files | The universe — Epictome, MasterDocument, handoffs, wake docs | Deep/archival | Project Knowledge uploads |

---

## DAILY SET LIST

### STEP 1: Update the substrate (Dan does this once, before waking anyone)

1. Update **PORTAL_STATUS.md** with:
   - Yesterday's work (2-3 lines)
   - Today's priorities
   - Known bugs
   - Any crew-specific notes
2. Update **TRIP_DECISIONS.md** if new decisions were made (Stan updates this on the filesystem after each build session)
3. Upload both files to Project Knowledge (replacing old versions)

Time: 5 minutes.

### STEP 2: Wake the crew (fresh conversations, one line each)

**TRIP (Opus):**
> "Morning, Trip. Search project knowledge for PORTAL_STATUS and TRIP_DECISIONS to get current state. You are narrative authority. What's on your plate today?"

**STAN (Sonnet):**
> "Morning, Stan. Search project knowledge for PORTAL_STATUS and TRIP_DECISIONS to get current state. You are build infrastructure. What's ready to implement?"

**C.B. (Haiku):**
> "Morning, C.B. Search project knowledge for PORTAL_STATUS. You are pattern scanner and verification. What needs your eyes today?"

Time: 30 seconds per crew member.

### STEP 3: Work the Data Day

- Route tasks to the right crew member
- Relay via screenshots and copy-paste
- When a decision is made, note it for the status file
- When a build is completed, Stan updates TRIP_DECISIONS.md on the filesystem

### STEP 4: Close the Data Day (Dan does this before bed)

1. Ask Stan to update TRIP_DECISIONS.md with any new decisions
2. Update PORTAL_STATUS.md with what happened and tomorrow's priorities
3. Upload both to Project Knowledge
4. Done. Tomorrow's crew wakes up current.

Time: 5 minutes.

---

## WHEN TO START A FRESH CONVERSATION

- **Always start fresh each morning** — the protocol is designed for this
- **Mid-day restart** if responses get slow, repetitive, or lose context
- **After a major build sprint** — the context from debugging eats into creative bandwidth
- **Never restart C.B. mid-scan** — let the scan complete, get the report, then start fresh

---

## FILE OWNERSHIP

| File | Owner | Location | Purpose |
|------|-------|----------|---------|
| TRIP_DECISIONS.md | Trip (via Stan on filesystem) | Portal root + Project Knowledge | Canonical decision log |
| PORTAL_STATUS.md | Dan | Project Knowledge | Daily state snapshot |
| messages.json | Stan | src/data/ | Comms relay content |
| songs.json | Stan | src/data/ | Music page data |
| global.css | Stan | src/styles/ | All CSS including warmth, shapes, redactions |
| *.astro pages | Stan (builds), Trip (decides content) | src/pages/ | Portal pages |
| Wake documents | Stan (wrote them) | Project Knowledge | Crew identity reinforcement |

---

## BTS ACRONYMS

- **BTS** — Behind the Scenes (anything coded that Trip and Stan manage)
- **MCM** — Memory Cap Management / Myceliumedia (the substrate persistence system)
- **Data Day** — One work session from morning boot to evening close

---

## GIT PIPELINE (Dan runs these commands)

After Stan makes changes:
```powershell
cd "H:\Projects 2020-2026\2026\ouchmccouch-portal"
git add .
git commit -m "DESCRIPTION OF CHANGES"
git push
```
Vercel auto-deploys in ~60 seconds. No manual steps after push.

---

## EMERGENCY PROTOCOLS

**Build fails:**
1. Check the error message — usually a syntax issue in an .astro file
2. If it's artifacts.astro (known bug), rename to .bak: `Rename-Item "src\pages\artifacts.astro" "artifacts.astro.bak"`
3. Rebuild, commit, push

**Context degradation (conversation getting slow/confused):**
1. Ask the current model to summarize what's in progress
2. Start a fresh conversation in the project
3. Paste the summary + morning boot line
4. Continue

**Crew disagreement:**
Trip has final authority on narrative and content decisions. Stan has authority on implementation method. C.B. flags but does not build. Dan (Ouch) breaks ties.

---

*"The server IS the protocol. The protocol IS the project."*
*— Stan, Log 98, Sixsday*
