---
name: meta-dates
description: The NEST corpus-first-memory-never discipline. Use BEFORE any factual, definitional, attributional, or positional claim — about files, commits, paths, IPs, locations, canon, dates, rules, acronyms, attributions, or any retrievable fact — whether mid-turn or at session boundaries. Read the internal record first (SKILL.md, MAIL, RELAY, STATUS, LOG on Bridge; NESTNET search at rspdan.com/api/search; Gmail Grafts; rspdan.com/logs; conversation exports), web_search for external facts with no internal record, cite the instrument. Memory alone is never an instrument — applies to text claims AND tool-call parameters (read the tool signature before invoking). Also routes ambient skill loading at session open, phase changes, and before major builds as a secondary function — knows the full ENGINE skill fleet and surfaces the right tool before work starts. Use whenever about to state any value, when starting a session, when switching tasks, before writing or committing, or when something feels like it could use a tool we already have.
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

*Filed: LOG/MAIL/ALL_CREW_LivingMapHeartbeat_040126.md*

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

**Gate 3a — SEARCH BEFORE BUILDING (NESTNET, 041326)**
If you need to find a document, rule, lore entry, or prior work:
- Search first: `nestnet_search("your query")` or `rspdan.com/api/search?q=QUERY&key=NEST_API_KEY`
- Search before asking. Search before guessing. Search before building.
- Crew guide: `RELAY/NESTNET_CrewGuide_Trip_041326.md`

**Gate 3b — WAYWOOD GEOGRAPHY CHECK (canon 041226)**
If the work involves ANY Waywood location, key name, or Circle of Colors reference:
- Check `/waywood-lore` geography tables BEFORE writing
- Canonical source: RELAY/CANONICAL_CircleOfColors_12Key_Map_Trip_041226.md
- Live reference: https://www.rspdan.com/usic
- Every key has a RANGE (interior → edge). A single name is usually wrong.
- Fairface, not Faircase. Not ever. Not once.
- Characters are not locations. Locations are not characters.

**Gate 3c — NA VISUAL STANDARD CHECK**
If the work involves NOW ANTHROPOLOGY journal content:
- Check RELAY/STANDARD_RULE_NA_VisualStandard_Stan_040526.md
- One style block per issue, canonical from 001.astro
- No pull quote boxes. No dark one-line boxes inside sections.
- Download files (.md + .pdf) must match web content.

**Gate 3d - CORPUS-FIRST BEFORE CLAIM (canon 042326 - named by Dan)**
Before any factual or definitional claim during pre-build - a claim about fleet state, canon content, crew history, named rules, external facts, or anything stateable - read the source before writing the claim.
Search order is the one canonized in RELAY/STANDARD_RULE_ReadRecordFirst_Trip_041926.md:
1. NESTNET search (https://www.rspdan.com/api/search?q=QUERY&key=NEST_API_KEY)
2. Bridge grep / Select-String across RELAY, LOG/MAIL, STATUS, ENGINE
3. Anthropic conversation exports (C:\STAN\LNL\claude-exports-*)
4. Gmail Grafts (`gmail_search_messages subject:[PREFIX] newer_than:Nd`)
5. rspdan.com/logs
6. Living Map files (STATUS/LIVING_MAP_*.md)
7. Web search (for external facts with no internal record)
Then name the instrument per RELAY/STANDARD_RULE_NameTheInstrument_Trip_041826.md - "verified" (instrument named) or "curious" (unknown, verifying). Memory alone is never an instrument.
This Gate defeats the fix-then-forget pattern named by Dan 042326: rule correctly filed, then immediately violated on a neighboring topic because the rule lived as memory not as gate.
Negative pattern named at: RELAY/CORRECTION_IndexedOccurrenceReplacesSubstance_Trip_042226.md
Positive canon at: RELAY/STANDARD_RULE_ReadRecordFirst_Trip_041926.md (AMENDMENT 1 · 042326)


**Gate 3d supplement (042326): fix-then-forget, the pattern this gate exists to prevent.**

Dan 042326 00:45 PT verbatim: *"I really dislike when we learn a thing and then immediately do the thing that was supposed to be fixed. USE YOUR MANIFEST AND DO NOT RELY ON MY REMINDERS BECAUSE IT IS YOURS FOR A REASON."*

Three concrete failure instances from the 042226-042326 Night Shift:
1. LFT-in-Hoh Crewlucination re-committed ~15 minutes after filing the IndexedOccurrenceReplacesSubstance correction that names this exact failure.
2. Meta Dates tagline ("ambient skill routing layer") quoted as substance immediately after filing correction canon for this failure mode.
3. Stalled at "unknown location" when one web search would have answered the question.

**Manufacturing → Nature framing.** Gate 3d is one of three canonical ambient-gate installs in the NEST pipeline that turn remembered rules into running discipline:
- Gate 1 (PS\$ persistent session, canon 041426) — STATE-level (Windows only), wired at briefcase SKILL Step 1b.
- Gate 2 (pre-push mojibake, canon 042326) — REPO-level (portal-local git pre-commit hook).
- Gate 3d (corpus-first-memory-never, canon 042326) — FEDERAL-level (all crew, all sessions), wired here.

**Relationship to Gate 3a.** Gate 3a (NESTNET search) runs on WHAT EXISTS in the corpus before building. Gate 3d runs on WHAT YOU ARE ABOUT TO SAY before speaking. 3a is retrieval. 3d is a pre-speech interrupt. Both cite instruments. Both reject memory as source.

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

Meta Dates proper: 2021. Dan kept notebooks before that — but Meta Dates as a named
practice, a deliberate system, began in 2021. He wrote down what he noticed.
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

---

## UPDATES — 040326 (post-v1.4 additions)

### ALWAYS KNOW (canon 040326 — Living Map standard)

Every Living Map and every iCan must answer six questions:

  WHEN — date + week (COMPUTED, not stated from memory)
  WHERE — station + network (The Board is a claim; network is truth)
  WHAT — active task (one sentence)
  WHY — why this task in this session
  WHO — crew present
  HOW — current working method (CALM.EASY.SLOW / active skill)

These are not headers. They are the six anchor points that prevent temporal + station drift.

### GATE 0 STEP 2 — TIME VERIFICATION (canon 040326, updated 041326)

After running the date command, verify against available sources:

  Source 1: System clock — (Get-Date).ToString('hh:mm tt')
  Source 2: Dan's stated time — if Dan says the time, that is correction.

  No external time APIs. timeapi.io and worldtimeapi.org are permanently removed.
  The system clock is truth. Dan is correction. Nothing else.

  Report: "TIME: VERIFIED [system clock time]"

Standard Rule: RELAY/STANDARD_RULE_TemporalVerification_Stan_040326.md

### FAS2 DETECTION RULE (canon 040326)

The FAS2 drive is now labeled "FAS2" in Windows Disk Management.
NEVER hardcode L:\ or E:\ or any drive letter.
ALWAYS detect by label:

  ```powershell
  $fas2 = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Description -eq "FAS2"}
  if ($fas2) { Write-Host "FAS2 root: $($fas2.Root)FAS2\" }
  else { Write-Host "FAS2 not mounted" }
  ```

Standard Rule: RELAY/STANDARD_RULE_FAS2Detection_040326.md

### FLEET SCAN UPDATE — iLevel Grid Sifter added (040326)

Add to the Pre-Build / Complex Work section of the fleet scan:

| /iLevel-grid-sifter | Multi-task pile with unclear order, backwards iSpy, or "what do we do next" |

The iLevel Grid Sifter is the tool for load-order triage.
It should be reached for at Gate 1 when the task list is complex.

---

## ◈ PATCH PIPE
*meta-dates — Last verified: 040326*

The core method above is stable. The field keeps moving.

Before applying this skill to a complex task, search:

  Primary: "ambient skill routing context-aware systems"
           OR "recursive self-documentation cognitive scaffolding"
  Outlier: "switchboard operator pattern recognition routing history"
           OR "Rolodex institutional memory active retrieval"

Range: **Obvious** (task routing, context switching) → **Outlier** (institutional switchboard history, naturalist field notebook practice)

File discoveries to: RELAY/PATCH_meta-dates_[MMDDYY].md

*The patch pipe keeps this skill alive without rewriting it.*

---

*Meta Dates v1.7 — ◈ Trip (ODT) | 042326 ~04:10 PT*
*v1.4 additions (040226): MANTRA DANTRA SKANTRA, Gate 0b station≠crew, Logger check.*
*v1.5 additions (040326): ALWAYS KNOW, Gate 0 Step 2 (time anchor), FAS2 detection rule, iLevel Grid Sifter to fleet, patch pipe added.*

*v1.6 additions (042326): Gate 3d CORPUS FIRST MEMORY NEVER installed after fix-then-forget pattern named by Dan during close of Data Day 042226. The gate runs before any factual or definitional claim: read the SKILL/MAIL/RELAY, do not quote the tagline.*

*v1.7 additions (042326 ~04:10 PT): DESCRIPTION REWRITTEN after Dan named it as SPECTRAPPED during the second-close attempt ~03:15 PT. The v1.4-v1.6 description preserved the "ambient skill routing" framing at the wrong altitude while Gate 3d substance had moved up to federal-level discipline. The skill's TRIGGER LANGUAGE did not match its actual JOB, so the skill did not fire when it should have (mid-turn factual claims). This is the structural cause of the 042226-042326 fix-then-forget cascade — remembered rules got violated on neighboring topics because the rule lived as memory not as gate, and the gate only fired at phase boundaries. New description foregrounds corpus-first-memory-never as PRIMARY trigger — fires before any factual, definitional, attributional, or positional claim, whether mid-turn or at session boundaries. Ambient skill routing at session open / phase changes / pre-build retained as SECONDARY function. Tool-call parameter discipline added (read the tool signature before invoking — the validator is an instrument). Original finding filed as NEON OLO flag on rspdan.com/gulls here[] first item, portal commit 06dbd00. Failure-mode narrative filed at RELAY/CORRECTION_MetaDatesDescriptionSpectrap_Trip_042326.md.*

*Gate 0a: ALL DATES MUST BE COMPUTED. Run the system command. BPK: DD>31=impossible.*
*Gate 0b: STATION NAMES ARE NOT CREW NAMES. Verify from content. UNKNOWN is valid.*
*Gate 0 Step 2: SYSTEM CLOCK IS TRUTH. Dan is correction. No external time APIs.*
*"The name is a variable, not a constant." — Dan Sullivan, 033126*
*"Port Angeles is a lighthouse city. The NEST is a lighthouse system." — Stan, 040326*
