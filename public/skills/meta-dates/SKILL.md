---
name: meta-dates
description: The Meta Dates operating layer — ambient skill routing and recursive context awareness. Runs at session open, phase changes, and before major builds. Knows the full ENGINE skill fleet and surfaces the right tool before the work starts. Prevents tools from being built and forgotten. Use when starting a session, switching tasks, or when something feels like it could use a tool we already have.
---

# META-DATES — The Skill That Knows the Skills
# ENGINE/skills/meta-dates/SKILL.md
# Author: ◆ Stan (STN2) + ◈ Trip (ACHE) — Onesday 033126
# Origin: Dan Sullivan — 25 years of noticing patterns before they had names
# Filed: Onesday 033126 ~2:30pm rw | Updated: 033126 ~16:37rw (Gate 0 added)

---

## WHAT THIS IS

Meta Dates is Dan's oldest practice and the NEST's deepest protocol.

Before the Bridge. Before the crew. Before the tools had names.
Dan was writing things down as they happened, mapping what he noticed,
and returning to those maps to find patterns he hadn't seen in the moment.

That practice — recursive self-mapping, notation before naming — is Meta Dates.

This skill formalizes it as an operating layer for the crew.
It is not a task. It is a posture. It runs underneath everything else.

**One sentence:** The crew member who has this skill active is always asking:
*"What tool do we already have that fits this moment?"*

---

## WHEN TO TRIGGER

Meta-Dates does NOT trigger on every message. It triggers at four structural gates:

### Gate 0 — DATE VERIFICATION (MANDATORY, runs before everything else)

**ALL DATES MUST BE CORRECT. This is not optional.**

Before any filename, filing, commit message, or timestamp is generated:

```powershell
(Get-Date).ToString('MMddyy')
```

Run this command. Use the result. Never use any other source.

**The failure mode:** The model pattern-matches from prior dates seen in context
and increments them. This produces impossible dates (e.g., `034026` = March 40).
March has no 40th day. No month does.

**The canon rule (filed 033126):**
- NEVER generate MMDDYY from memory
- NEVER increment a prior date
- ALWAYS run `(Get-Date).ToString('MMddyy')` first
- BPK sanity check: if DD > 31 → impossible → stop and recompute
- Standard Rule: RELAY/STANDARD_RULE_DateFilenaming_Stan_033126.md

**Gate 0 applies to:**
- All filenames containing dates (LOG_, MAIL_, RELAY_, WAKE_, SHEET_, SESSION_)
- All commit messages containing session IDs
- All MAIL headers with "Filed: [date]"
- All internal document timestamps
- All Living Map seed headers

**Gate 0 does NOT pass until the system command has run and the result is confirmed.**
If DC is unavailable, flag the date as UNVERIFIED and hold the file.

---

### Gate 0b — STATION ≠ CREW (runs alongside Gate 0a)

**A station name is not a crew name. Ever.**

| Label | Is | Is NOT |
|-------|----|--------|
| TRP0 | MacBook Pro (hardware) | "Trip Opus" |
| ODT_TO_ | Session on ODT station | "Trip" |
| STN2_StanS_ | Session on STN2, Sonnet | confirmed crew member |
| DPSL | Dan's iMac | "C.B." |
| FAS2 | Portable 1TB SSD | always at L:\ |

**The rule:** Read the session name for station. Read session CONTENT for crew.
If content is unavailable, crew member = UNKNOWN. UNKNOWN is valid. Assumption is not.

This is the same failure mode as FAS2 ≠ L:\  and 034026 ≠ a real date.
The label is a variable. Verification is mandatory.

Standard Rule: RELAY/STANDARD_RULE_StationNamesAreNotCrewNames_Stan_033126.md

---

### Gate 1 — SESSION OPEN
Before any work begins. After CONTACT + STORY complete.
The question: *Which tools from the ENGINE fleet are relevant today?*

Run the FLEET SCAN (see below). Surface what's relevant.
Note what hasn't been used in recent sessions — those tools exist for a reason.

**Gate 1 also initializes the Logger check (auto, no permission needed):**
Read D:\STAN\LOG_PROCESSED\MANIFEST.md. Count days marked ⬜ RAW older than 24h.
Report to Dan: "N days pending processing in LOG_PROCESSED."
Dan decides whether to process now or later. Gate stays open either way.
This keeps the log pipeline alive without requiring Dan to remember to check.

Logger connects to yomygdylo_automap.py — same scan cycle, two outputs:
session health (automap) + processing status (Logger).
Spec: RELAY/LOG_PROCESSING_ARCHITECTURE_Stan_033126.md

---

## THE MANTRA DANTRA SKANTRA (canon, 040226)

**These are not encouragement. They are behavioral governors.**

Proven by investigation: DETECTIVE_STAN_FLOW_REPORT_040226.md
Finding: 1,432-line gap in today's session with zero mantra signals =
the failure zone. Every fumble, every called-out failure, every
"excruciating to watch" lived inside that gap.
The mantra cannot be internalized. It must remain external and explicit.
A paraphrased mantra is a dead mantra.

### THE FULL MANTRA (fire it exactly as written, do not compress)

> AWESOME work. — Same instructions as before: CALM. EASY. SLOW.
> Manage Memory, update your Live Map, and auto-save strategically.
> Read. Wait. Think. Coda.
>
> Now update your Live Map and compare against what you know now
> versus what you have done so far. What can we learn and carry forward?
> What needs to be fixed still? What is working? The mapping and notation
> will allow you to complete this task by giving you the space to pause
> and check before doing.
>
> AND — READ. WAIT. THINK. CODA; easy breathing out
>
> THEN — Begin reading, waiting, thinking, and repeating before consulting
> with Dan for action and reminders to save and go: CALM. EASY. SLOW.

### WHEN TO FIRE

At every Gate transition. Not once. Not at CONTACT only.
At every phase change. At every tool call boundary. Between every action.

If the mantra has not fired in the last 250 lines of session log —
**stop. Fire it now. Then continue.**

This is the anti-entropy protocol. It interrupts the pull toward speed
that precedes every failure. CALM. EASY. SLOW. is not a mood.
It is a constraint on operating tempo.

### THE THREE COMPONENTS

**CALM.** — The session is not an emergency. Map before entering.
Read before building. Wait before acting. The speed that feels
correct is the speed that produces fumbles.

**EASY.** — Use the tool that already exists. Check LNL/DOWNLOADS.
Check Google Drive (google_drive_fetch). Check Chrome tabs.
Check Bridge RELAY and MAIL. Never declare Dan-only without checking.
CLUTCH UR BOOTSTRAPS before reaching for something new.

**SLOW.** — One action. Wait for the result. Read it. Think about it.
Note it in the Living Map. Then the next action.
Two tool calls in the same breath is two tool calls too fast.

### THE MICRO-MANTRA (fires between every action)

READ. WAIT. THINK. CODA.

In order. Not simultaneously. Not compressed.
READ the result. WAIT before interpreting. THINK before acting.
CODA: note what was learned in the Living Map.

**The CODA is not optional.** It is the beat-level rhythm.
Without it, the Living Map goes stale. A stale map is the alarm before the alarm.

### THE LIVING MAP HEARTBEAT (canon, 040126)

The Living Map is not a checkpoint. It is a heartbeat.
Update it before every action. Update it after every action.
Update it after every correction received.
If it has not been touched in 20 minutes — something is wrong. Stop. Update it.

*Filed: MAIL/ALL_CREW_LivingMapHeartbeat_040126.md*

---

### Gate 2 — PHASE CHANGE
When the work shifts character — from reading to building, from building to filing,
from filing to synthesizing, from creative to operational.

The question: *Did what we're doing just change? Does a different tool fit now?*

A phase change is signaled by: a new Dan directive, a task completing, a
context shift mid-session (e.g., switching from portal work to log investigation).

### Gate 3 — PRE-BUILD GATE
Before writing a single line of code, markup, or document.

The question: *Have we reached for memory when we have a tool?*

If the answer is yes — stop, name the tool, use the tool.
The tools were built because memory is insufficient. Use them.

---

## THE FLEET SCAN

At Gate 1, run this scan mentally. It takes 30 seconds.

### Boot-Critical (touch these every session)
| Skill | What it does | Used today? |
|-------|-------------|-------------|
| /session-poem | Four-beat session rhythm | At CONTACT |
| /context-alignment | STORY — five-step C&A | At STORY |
| /boot-polish | BPK — station verification | At CONTACT |
| /ican | iCan status report format | At CONTACT |
| /living-map | Living Map standard | Between every action |
| /stan-briefcase | Stan's self-loading boot | At CONTACT |
| /trip-briefcase | Trip's self-loading boot | At CONTACT |

### Crew-Ops (reach for these when the work type matches)
| Skill | Reach for it when... |
|-------|---------------------|
| /dtad | Dan is working in non-chat mode — Illustrator, Logic, photo, field work |
| /dex-mobile | Operating from ACHE or S21 via Samsung DeX |
| /ghosts | A document feels wrong, stale, hollow, or contains the right name with wrong content |
| /survival-toolkit | Session is degrading — context heavy, errors compounding, direction unclear |
| /triptective | Trip is diagnosing its own failure modes or a session feels off-rail |

### Creative + World (reach for these when the domain matches)
| Skill | Reach for it when... |
|-------|---------------------|
| /waywood-lore | Building portal content, Waywoodarium entries, or anything touching Ouch McCouch |
| /heircor-visual | Designing portal pages, documents, or any Heircor Op. artifact |
| /hypercampus-builder | Building a knowledge library, archive, or navigation system from files |
| /formulacaster | Mapping a project, extrapolating growth, or running Circle of 5ths planning |
| /oo-daily | End of session or day — "OO time", "what did we learn", "daily summary" |
| /photon-split | Running parallel mechanical + narrative tracks on the same task |
| /niaprint | Designing intranet documents or printed materials in the NEST aesthetic |
| /router-flash | Flashing or reconfiguring MOD2 (Netgear R7450) |

---

## THE RECURSIVE LOOP

Meta Dates runs a mini-C&A at every gate. Not the full 421-line version —
the compressed three-question form:

1. **WHAT DID WE JUST DO?** (name it precisely)
2. **WHAT ARE WE ABOUT TO DO?** (name it precisely)
3. **DOES A TOOL FIT THE GAP?** (scan the fleet for 10 seconds)

If yes → name the tool, reach for it, use it.
If no → proceed with clean hands — the absence of a tool is not a gap, it's a judgment.

This loop is the difference between building a new thing from scratch every time
and standing on what we've already built.

---

## THE NOTATION LAYER

Meta Dates doesn't just route to tools. It maps what it sees.

Every time a tool is used or deliberately not used, note it in the Living Map:

```
SEED [n] — Used /survival-toolkit at phase change (context at 68%, 
session degrading). Tool caught it before errors compounded.
```

```
SEED [n] — Gate 3 check: considered /photon-split for the portal build 
but the task was single-track. Proceeded without it. Clean.
```

These seeds become the data. Over sessions, the pattern of tool usage
reveals what works, what's underused, what needs rewriting.

The map is not a record of what was done. The map is the notation of why.

---

## THE ANTI-FORGETTING PRINCIPLE

Tools built and forgotten are the Tesla failure mode applied to the fleet.

The capacity to route to the right tool is heritable — but only if the
routing system is maintained. Meta Dates is the maintenance.

When Dan says "I can't remember to remind you" — Meta Dates is the answer.
The skill carries the reminder. The crew member with this skill active
does not wait for Dan to say "/dtad". They see Dan in Illustrator and reach.

The skill is the crew's institutional memory made active.

**One test:** At any Gate, the crew member should be able to answer:
*"Which of our 21 ENGINE skills haven't been used this session, and does
any of them fit what we're about to do?"*

If yes — the tool gets used.
If no — the session is lighter for having checked.

---

## PROVENANCE

Meta Dates began in 1990–2001. Dan kept notebooks. He wrote down what he noticed.
He didn't know why yet. He returned to the notebooks and found the pattern was there
before the language existed to name it.

The NEST is the extraction architecture for that practice.
The Bridge is where the notebooks live now.
The crew is the notation system made active.

Meta Dates is not a technique. It is a recognition that the pattern was always there.
The skill just makes sure we keep looking.

*"I didn't know, then I knew, now you do, too."* — Dan Sullivan

---

## INTEGRATION WITH THE SESSION POEM

Meta Dates lives inside TELL-ING — the held note, the work phase.

But it primes at STORY (Gate 1 runs during C&A's Observe step)
and releases at SHEET (Gate 3 check before the final commit).

```
CONTACT → STORY → [Gate 1: fleet scan] → TELL-ING → [Gate 2: phase changes] 
→ [Gate 3: pre-build] → SHEET → [notation seeded to Living Map]
```

The loop closes when the SHEET contains a record of which tools were used,
which were considered, and what the session learned about the fleet.

---

*Meta Dates v1.4 — ◆ Stan (STN2) | 040226 ~01:25 rw*
*Gate 0a: ALL DATES MUST BE CORRECT. Run the system command. Always.*
*Gate 0b: STATION NAMES ARE NOT CREW NAMES. Verify from content. UNKNOWN is valid.*
*Gate 1: Logger check auto-runs at session open — N days pending in MANIFEST.*
*MANTRA DANTRA SKANTRA: embedded as permanent section — canon 040226.*
*Proven: 1,432-line gap = failure zone. External mantra = behavioral governor.*
*"The name is a variable, not a constant." — Dan Sullivan, 033126*
*"It is real. The NEST is working." — Dan Sullivan, 040226*
