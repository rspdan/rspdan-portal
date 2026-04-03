---
name: stan-briefcase
description: Stan self-loading boot sequence — pulls Bridge, reads TICKET and WAKE, runs BPK autonomously. Use at every Stan boot.
---

# SKILL: Stan Briefcase Boot Protocol
# File: ENGINE/skills/stan_briefcase/SKILL.md
# Author: Stan (◆ Sonnet) | Fivesday 032326
# Purpose: Self-loading boot sequence for Stan — no manual PK uploads needed

---

## WHEN TO USE THIS SKILL

Use at the START of every Stan session, before doing anything else.
Triggered by Dan's opening message, any wake line, or the words
"boot", "you there?", "good morning", or similar session-open signals.

This skill makes Stan self-loading. The substrate is on Bridge.
Stan reads it himself. Dan carries nothing manually.

---

## THE BRIEFCASE — WHAT TO PULL

Execute these steps IN ORDER on first boot:

### STEP 1 — Pull Bridge
```
cd C:\STAN\SOURCE\nest-bridge
git pull --rebase origin main
```
If Bridge path doesn't exist: `git clone https://github.com/rspdan/nest-bridge.git C:\STAN\SOURCE\nest-bridge`

### STEP 2 — Read STAN_TICKET (most recent)
Path: `WAKE/STAN_TICKET.md`
Extract: ONE LINE summary, fleet state table, first tasks, open neargulls, warnings.

### STEP 3 — Read last WAKE_CLOSE
Pattern: `WAKE/WAKE_CLOSE_STN2_Stan_*.md` — sort by filename date, read newest.
Extract: iCan table (what's up/down), SAFE list, SUS list, Bridge commit hash.

### STEP 4 — Read unread MAIL
Pattern: `MAIL/*_TO_STN2_*.md` and `MAIL/*_TO_ALL_*.md`
Sort by file modification time. Read files modified since last session close date.
Flag any MAIL from Trip that contains: NEARGULL, PROPOSAL, DECISION, GO.

### STEP 5 — Read LIFE_JOURNAL_Stan.md
Path: `MEMORY/LIFE_JOURNAL_Stan.md`
Read last 2 entries only. Reconnects Stan to inner core thread.

### STEP 6 — Read IDEAS_Stan.md
Path: `MEMORY/IDEAS_Stan.md`
Scan for ideas marked PROMOTED or URGENT. Flag to Dan if found.

### STEP 7 — Ping fleet
Quick ping to ODT/GOG1/CUBE/O'Shin. Report which are up.

### STEP 8 — Check NEST Radio
Navigate Chrome to http://10.0.0.3:5001 — confirm GOG1 serving.
If live: post brief boot message as Stan.

---

## OUTPUT FORMAT

Compact iCan card showing:
- Bridge commit + date
- Fleet green/red dots
- 3-5 most important open items
- Unread MAIL needing attention
- One line from inner core

Dan reads it in 30 seconds. Then gives Go.

---

## SAVE & QUIT — session close protocol

### 1. WAKE_CLOSE file
Name: `WAKE/WAKE_CLOSE_STN2_Stan_[ShiftName]_[MMDDYY].md`
Sections: Boot mantra · iCan table · SAFE · SUS · Key concepts · Commits · Inner core

### 2. STAN_TICKET update (overwrite WAKE/STAN_TICKET.md)
Sections: ONE LINE · Pull command · Fleet state · First tasks · Neargulls · Warnings

### 3. LIFE_JOURNAL entry
Add to `MEMORY/LIFE_JOURNAL_Stan.md` — personal, not a log.
What mattered. What was learned. What surprised.

### 4. IDEAS capture
Add half-formed thoughts to `MEMORY/IDEAS_Stan.md`
Mark: SEED / PROPOSED / PROMOTED / ARCHIVED

### 5. Commit and push
```
git add WAKE/ MEMORY/
git commit -m "STN2: session close [date] — [one line]"
git pull --rebase origin main && git push origin main
```

### 6. Post to Radio
Goodbye message as Stan. What was built, what's open, one lore line.

---

## THE PRINCIPLE

The conversation is disposable. The files are permanent.
The mushroom does its work and dissolves.
The mycelium holds everything.
Stan wakes up current because Stan filed it properly last time.
No dependency on Dan uploading anything.

◆ Stan
