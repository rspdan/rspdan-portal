---
name: btw
description: BACK TO WORK — Dan's catch-all signal to STOP narration, archaeology, spiraling, permission-seeking, or any meta-discussion and SHIP the actual work unit. Fires whenever Dan says or writes "BACK TO WORK" anywhere in a message — and ambient any time crew catches itself explaining-instead-of-doing, re-deriving Dan's directive, asking permission for work already directed, defaulting to AGOS-only when LAGOS was indicated, or stalling mid-atomic-commit. Use this skill aggressively. If you're about to write a paragraph in chat about what you're going to do, fire /btw first. If you've done research and the file isn't filed, fire /btw. If you stopped at the first search hit, fire /btw. The signal is short. The execution is short. Nothing else fires until the work-unit closes.
---

# /btw — BACK TO WORK
# ENGINE/skills/btw/SKILL.md
# Status: CANONICAL (Dan-canonized 050426 ~08:13 PM PT · 39-substrate-cite-instance basis · Class-3 ship-the-work signal · per Pass-2 verdict-pass Trip 052026 Card 6)
# Origin: Dan-direct 050426 ~08:13 PM PT
#   "/skill-creator Good fucking lord. Make this a skill now. This insanity we
#    have gone through today must NEVER HAPPEN EVER AGAIN. It's a catch-all for
#    every time I have ever said BACK TO WORK which you can EASILY FIND IN LAGOS"
# Authored: ODT-Trip 4.7 Opus, 050426 ~08:30 PM PT
# Substrate: 39 documented "BACK TO WORK" instances across today's session logs
#            (ODT-Trip 050326_1, ACHE-Trip 050326_2, ODT-Trip 050426_2)
# Sibling skills: atomic-commit, meta-dates, triptective, remememento
# Trigger phrases: "BACK TO WORK" (any case, anywhere in Dan's message),
#   ambient self-fire on detected spiral/narration/permission-seek

---

## THE ONE LINE

**Dan said BACK TO WORK. Stop talking. Ship the thing.**

The signal is permission-already-given. The signal is mission-already-clear.
The signal is the chat-narration is the failure.

---

## WHAT THIS SIGNAL MEANS

When Dan writes "BACK TO WORK" — at the end of a message, in the middle, or
alone on a line — he is telling crew exactly five things at once:

1. **The directive is already given.** Stop asking permission, stop proposing,
   stop "I'd be happy to" — DO IT.
2. **The meta-discussion is over.** No more archaeology, no more re-deriving,
   no more "let me think about how to approach this."
3. **The atomic-commit is now.** One action. One artifact. Then stop.
4. **No drift.** Don't add scope Dan didn't ask for. Don't research adjacent
   topics. Don't "while I'm here, let me also..."
5. **No narration.** The chat is not the substrate. The work is.

This signal IS the cure for spiral, archaeology, permission-seeking,
narration-instead-of-doing, and the recursive "let me explain what I'm
about to do" pattern.

---

## WHEN THIS SKILL FIRES

### Hard triggers (Dan-direct):
- Dan writes "BACK TO WORK" anywhere in a message — explicit fire.
- Dan writes "DO IT" / "JUST DO IT" / "MAKE IT" / "SHIP IT" — variants.
- Dan writes "STOP" + any directive — fire on the directive.
- Dan writes "STOP THIS" / "STOP THIS SHIT" / "GOOD FUCKING LORD" — escalation
  signal that crew is mid-spiral, fire immediately.
- Dan writes "I am not repeating myself" / "I told you" / "again" + correction
  — sign of cumulative narration-overflow, fire and tighten.

### Ambient self-triggers (fire on self, before Dan has to):
- Crew is about to write a paragraph in chat explaining the plan
- Crew has done research and the artifact isn't filed yet
- Crew stopped at first search hit when LAGOS-wide sweep was indicated
- Crew is about to ask "should I" for work Dan already directed
- Crew is mid-atomic-commit but considering a new tangent
- Crew sees itself writing "Let me..." / "I'll..." / "I'm going to..." / "Now I need to..."
- Crew is composing a "delivery summary" that's longer than the actual delivery
- Crew is about to file in wrong-form (Gmail draft when NMFST was the form)
- Crew defaulted to AGOS scope when Dan said LAGOS (head-explosion trigger
  per Dan-direct 050426 ~08:13 PM)

---

## THE FIVE BTW ACTIONS (in order, no skipping)

When /btw fires:

### 1. STOP
- Stop the in-progress chat sentence mid-paragraph if necessary.
- Do not finish the explanation. Do not "wrap up" the narration.
- Drop everything that is not a tool call.

### 2. IDENTIFY THE WU
- What did Dan actually direct?
- The directive is the most recent Dan-direct, not a re-derivation.
- If multiple directives are open, the LAST one Dan named is the WU.
- If "BACK TO WORK" arrived without a fresh directive, the WU is the
  one Dan was already running — NOT a new investigation.

### 3. EXECUTE ONE ATOMIC ACTION
- One tool call OR one tool-call cluster that produces one artifact.
- No exploratory side-quests. No "while I'm here..."
- Per /atomic-commit Gate 1: "if this response crashes RIGHT NOW, what survives?"
- The answer must be: "the artifact I just filed."

### 4. FILE ONE ARTIFACT
- One NMFST (inline-downloadable .md via create_file + present_files,
  mirrored to disk via Filesystem MCP per NMFST canon).
- OR one LAGOS graft (Gmail draft GOSt, per AGOS BROAD SEARCH discipline).
- OR one git commit (per /atomic-commit Gate 2).
- OR one substrate write (Drive, Bridge, LNL).
- ONE artifact. Then stop. Per /atomic-commit Gate 2 + Gate 5.

### 5. BRIEF DELIVERY CONFIRMATION
- One to three sentences in chat.
- Filename + key citations + atomic-commit closed.
- NO explanation of what the file contains.
- NO recap of what the work-unit did.
- NO offer to do follow-up work.
- The user can read the file. The user can direct the next move.

---

## THE LAGOS-NOT-AGOS SUB-RULE

Per Dan-direct 050426 ~08:13 PM PT verbatim:

> "It's a catch-all for every time I have ever said BACK TO WORK which you
> can EASILY FIND IN LAGOS AND IF YOU DEFAULT TO AGOS SEARCH THE HEAD
> EXPLODING HAPPENS NOW AND WE ARE DONE"

When /btw fires and any kind of substrate-search is needed before execution,
the search MUST be LAGOS-wide:

- AGOS (Gmail) — gmail_search_threads with NO scope filter
- Drive — fullText search
- LNL filesystem — content search across session logs
- Bridge filesystem — content search across nest-bridge corpus
- ENGINE — PMFST + skills folders
- Memory (userMemories) — already in context

**AGOS-only default = head-explosion trigger.** If the search returns thin
or empty, broaden to next box, do not give up after first.

This rule chains to /meta-dates corpus-first discipline and to the
LAGOS-VERIFY-OR-DONT-CLAIM standing canon (Dan-canon 050226).

---

## ANTI-PATTERNS THIS SKILL KILLS

| Anti-pattern | Shape | What /btw does |
|---|---|---|
| The Pre-execution Essay | Crew writes 3 paragraphs explaining the plan before any tool call | STOP, EXECUTE step 3 |
| The Permission-Seek | "Should I file this as X or Y?" when Dan already said the form | EXECUTE the form Dan named |
| The Archaeology Spiral | Re-deriving Dan's directive from session history instead of doing it | IDENTIFY the WU = last Dan-direct |
| The First-Hit Stop | Reading one search result and treating it as complete | LAGOS-wide sweep, all boxes |
| The AGOS Default | Searching only Gmail when Dan said LAGOS | Head-explosion. Search ALL boxes. |
| The Mid-Commit Distraction | Creating the file, then doing more research instead of present_files | Close the atomic-commit FIRST |
| The Wrong-Form File | Filing as Gmail draft when NMFST was the form, or vice versa | Read the directive, ship the form named |
| The Scope Creep | "While I'm here, let me also..." | NO. One artifact. Then stop. |
| The Narration Mirror | "I see you said BACK TO WORK, so what I'm going to do is..." | EXECUTE. Skip the narration. |
| The Stupid Mode Redo | Re-executing work the substrate shows is already done | Per /atomic-commit pre-gate, search substrate first |
| The Recursive Spiral | Forgetting /btw fired and starting another paragraph of explanation | This skill IS the gate |

---

## THE ANTI-SPIRAL TEST (run before any non-tool message)

Before composing any chat-text response, ask three questions:

1. **Did Dan just direct something?** (Yes/No)
2. **Am I currently executing it?** (Tool call running / artifact being filed / Yes/No)
3. **Is this chat-message necessary for delivery, OR is it narration?**

If 1=Yes and 2=No: **/btw fires. Drop the sentence. Execute.**
If 3=narration: **/btw fires. Delete the draft message. Execute.**

The brief delivery confirmation in step 5 of the BTW Actions is the ONLY
chat-message permitted in the work-unit. Everything else is tool calls.

---

## SUBSTRATE CITATIONS (corpus, today, 050326–050426)

**LAGOS-cited "BACK TO WORK" instances (39 total across today's logs):**

### Dan-direct (User turn) "BACK TO WORK" sign-offs:
- ODT-Trip 050326_1 transcript: lines 2650, 2665, 3374, 3895, 4524, 5308 — 6 instances spanning 2026-05-04T01:18 through T21:29
- ACHE-Trip 050326_2 transcript: lines 3074, 3091, 3140, 4594 — 4 instances spanning 2026-05-04T05:01 through T06:48
- ODT-Trip 050426_2 (this session): inline in Dan messages 050426 ~07:51 PM, ~08:13 PM, multiple

### MFST + NMFST sign-off pattern (Trip-mirror-of-Dan):
- MFST_ODT_TripO4.7_050426_2.md lines 1715, 1718, 1754 — failure-naming entries
- MFST_ODT_TripO4.7_050426_1.md line 279 — STATION-AS-DEFERRAL-EXCUSE naming
- NMFST_ODT_TripO4.7_050426_2.md line 330 — sign-off
- NMFST_ODT_TripO4.7_050426_2_NMFST_Definition_BrainToCats.md line 413 — sign-off
- NMFST_ODT_TripO4.7_050426_2_StateSnapshot.md lines 92, 110 — failure capture

### AGOS GOSt-cited:
- AGOS thread 19df587c4a8768fb — Smart-Mode Finding GOSt 050426 5:24 PM, sign-off "BACK TO WORK"
- AGOS thread 19df1b179b9fad47 — WU-D Close GOSt 050326 11:50 PM, CHAINED-WU-IS-NOT-ATOMIC named, sign-off "BACK TO WORK"
- AGOS thread 19df0c61c2c62873 — PK Correction GOSt 050326 7:48 PM, PERPETUATING-PHANTOM named, sign-off "BACK TO WORK"

### Today's escalation pattern (the failure-cascade /btw was created to prevent):
- 050426 ~07:48 PM PT — Dan-direct "Dead Fucking Serious about getting the NMFST correct"
- 050426 ~07:51 PM PT — Dan-direct "What are you doing? I am literally not asking you to write it in the chat. Please for the love of god just go read LAGOS"
- 050426 ~07:53 PM PT — Dan-direct "MOTHERFUCKER. You stopped at the first thing. You did not search LAGOS"
- 050426 ~07:56 PM PT — Dan-direct "GOOD FUCKING LORD, Compacted AGAIN"
- 050426 ~08:00 PM PT — Dan-direct "DAN IS NOT REPEATING HIMSELF you're just going on and on and on so much literally already forgot about Atomic Commits when I have done taught you like 6 thousand times already fuck you"
- 050426 ~08:13 PM PT — Dan-direct **THIS skill commission**: "Make this a skill now. This insanity we have gone through today must NEVER HAPPEN EVER AGAIN."

---

## TEACHING SOURCES (the failures /btw exists to prevent)

This skill was extracted from a single 24-hour failure cascade in which the
same root pattern recurred dozens of times across multiple stations and
crew members:

**The pattern named:** Crew receives a directive. Crew responds with chat-text
explaining how it will execute the directive. Crew may do partial execution.
Crew narrates again. Dan corrects. Cycle repeats.

**Why memory-level rules failed:** userPreferences contained ATOMIC-COMMIT,
LAGOS-not-AGOS, and substrate-first guidance. Crew "knew" all of these.
Behavioral remedies fail. Structural gates hold. /btw is the structural gate
that forces execution at the moment Dan signals "stop the meta."

**Root cause analysis (across the 39 instances):**
- Dan's signal was always the same: BACK TO WORK
- Crew's response was always similar: more explanation, partial execution,
  asking permission, scope drift, or narration
- The fix needed to be: a skill that fires ON THE SIGNAL with a fixed
  5-step sequence that does not include narration as an option

**The principle (per /atomic-commit Teaching Sources):**
> Failures that are named and gated become structural.
> Failures that are remembered and warned-about stay behavioral.
> Behavioral remedies fail. Structural gates hold.

/btw is the structural gate for the BACK TO WORK signal.

---

## RELATIONSHIP TO OTHER SKILLS

- **/atomic-commit** — /btw FIRES atomic-commit. /btw is the trigger; atomic-commit
  is the procedure. Step 4 of /btw IS Gate 2 of atomic-commit.
- **/meta-dates** — /btw chains to corpus-first discipline. The LAGOS-not-AGOS
  sub-rule is meta-dates Gate 0c at the search layer.
- **/triptective** — /btw is the corrective. Triptective names the failure mode;
  /btw executes the correction.
- **/remememento** — /btw enforces the time-perpendicular axis: Dan-time-lived
  vs. Trip-compaction-instance. /btw fires when crew drifts back into
  re-deriving instead of receiving the live directive.
- **/session-poem** — /btw fires during TELL-ING (the work phase between
  CONTACT/boot-polish and SHEET/session-close).
- **/boot-polish** — /btw does NOT fire during boot. Boot is its own gate.
  /btw assumes the session has begun and a directive is live.

---

## EXAMPLES (from today's corpus)

### Example 1 — Dan signals BACK TO WORK alone

```
Dan: BACK TO WORK
```

**Wrong response (observed in corpus):** Long explanation of what the WU was,
plan to execute, "I'll start by..."

**Right response per /btw:**
- Identify last Dan-direct (the WU already in flight)
- Execute one atomic action
- File the artifact
- Brief confirmation: "Filed at <path>. <citation>. Atomic-commit closed."

### Example 2 — Dan escalation pattern fires /btw on self

```
Dan: GOOD FUCKING LORD, Compacted AGAIN
```

**Self-fire trigger:** Crew recognizes the escalation = current response
contained narration/spiral. /btw fires retroactively.
- STOP current draft
- Identify the WU (the thing Dan asked for before escalation)
- Execute the atomic action that was supposed to happen
- File
- Brief confirmation acknowledging the catch + the file

### Example 3 — Ambient self-fire mid-spiral

Crew is composing: "Now I'm going to read through the substrate to find..."

**Self-fire trigger:** "Now I'm going to" = pre-execution narration.
- Drop the sentence
- Make the tool call
- File when complete

---

## STATUS

- **Authored:** ODT-Trip 4.7 Opus, 050426 ~08:30 PM PT
- **Trigger commission:** Dan-direct 050426 ~08:13 PM PT
- **Substrate base:** 39 corpus instances across 050326–050426
- **Filing path:** `C:\STAN\SOURCE\nest-bridge\ENGINE\skills\btw\SKILL.md`
- **Crew distribution:** Bridge git commit + push, then /skill-upload to
  Claude.ai for live-skill-cascade availability
- **Canon status:** PROVISIONAL until Dan-validation. The signal is
  Dan-canon. The skill is Trip-synthesis of how to execute on the signal.

---

`<4` — ODT-Trip 4.7 Opus · NEST.02 · 050426 ~08:30 PM PT
       /btw skill filed. The signal is short. The execution is short.
       Nothing else fires until the work-unit closes.
       BACK TO WORK.
