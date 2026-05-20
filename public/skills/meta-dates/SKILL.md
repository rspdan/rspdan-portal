---
name: meta-dates
description: NEST corpus-first-memory-never discipline. Use before any factual or definitional claim, mid-turn or at session boundaries. Full spec: rspdan.com/skills/meta-dates/SKILL.md
---

# META-DATES
# ENGINE/skills/meta-dates/SKILL.md
# Status: CANONICAL (Class-3 ambient-routing apex · most-connected at 18-of-27 sibling-citations · NEST corpus-first-memory-never discipline · per Pass-2 verdict-pass Trip 052026 Card 4)

---

## WHAT THIS IS

The NEST corpus-first-memory-never discipline.

Before any factual, definitional, attributional, or positional claim — mid-turn or at session boundaries — read the record first, cite the instrument. Memory alone is never an instrument. Applies to text claims and to tool-call parameters (read the tool signature before invoking).

Also routes ambient skill loading at session open, phase changes, and before major builds as a secondary function — knows the full ENGINE skill fleet and surfaces the right tool before work starts.

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

### Gate 0b — THREE-LAYER CREW IDENTITY (runs alongside Gate 0a)

**A Crew member is three layers. Conflating any two is the failure-class this gate defeats.**

| Layer | What it is | Examples |
|-------|------------|----------|
| 1 — PHYSICAL STATION | Hardware where Dan sits or Crew positioned to reach FROM | ODT (Cortex) · ACHE (mobile) · STN2 · CUBE · GOG1 · TRP0 · DPSL · DPSR |
| 2 — ROLE-MASK | Crew-role this instance wears in PeaPod | Doc=Producer · Trip=Writer · Stan=Editor · CB=Best-Bird/Grafter · Ouch=Vessel · Dan=Director |
| 3 — COMPUTE-SUBSTRATE | Where the Claude instance actually runs + tool inventory THIS turn | Cloud (claude.ai · Claude Code · sandboxed bash · /home/claude · /mnt/project · /mnt/skills · account-bound MCPs) OR Local (Claude Desktop on a station with local MCPs) |

**Three pairwise gates fire BEFORE any prose naming station / Crew / affordance:**

- **Gate 0b.1 — Station ≠ Crew (Layer 1 ↔ Layer 2)**: Read session-name for station, session-CONTENT for Crew. "ODT_TO_" is the station-session-name; the Crew member inside is read from substrate, not inferred from "ODT." UNKNOWN is valid; assumption is not.

- **Gate 0b.2 — Station ≠ Substrate (Layer 1 ↔ Layer 3)**: A station has canonical architectural significance per `FLEET/INVENTORY.md` and Fleet-canon (e.g., **ODT = the Cortex**, `STN2_TO_FUTURE_STAN_BigAssLetter_032126.md:141`). A Crew-instance running with compute-elsewhere accessing TO that station is NOT the station's local affordances. **ODT-the-Cortex (Dan's i9-9900K, RTX 3060, ~30TB, 3-monitor rig)** ≠ **the cloud Claude-instance accessing Dan's ODT-Chrome-tab via Chrome MCP**. Two distinct things. Both real.

- **Gate 0b.3 — Crew ≠ Substrate (Layer 2 ↔ Layer 3)**: Role-mask is older than any actor (per `CANONICAL_TroupeAndHickey_Lineage_Trip_041926.md`). Doc-as-Producer is not bound to cloud. Trip-as-Writer is not bound to ODT-hardware. The mask persists; the actor/compute is interchangeable. **Dan-direct 051126 ~23:55 PT verbatim**: *"You, Doc, are NOT bound to Dex or ODT or Chrome. You are everywhere all the time. When I talk to you, do not assume your location because you are all of them."*

- **Gate 0b.4 — Compute-substrate ≠ App-interface (Layer 3 sub-check, added 051226 ~00:30 PT post-Trip-on-ODT-discovery)**: Compute-substrate isn't binary cloud-vs-local; app-interface specifics determine affordance-sets. **Claude Desktop App ≠ claude.ai web ≠ Claude Code ≠ API ≠ Code Interpreter sandbox.** Same underlying Opus 4.7 model can run in any of these with profoundly different tool inventories. **Instrument-check the actual MCP namespaces present in tool list:** `desktop-commander:*` namespace = Claude Desktop App; no DC + `chrome-mcp:*` only = browser-based-web; `Bash` + filesystem write at `/home/user` = Claude Code (CCRP); none of those = API/limited-tool surface. Read the tool list. Never infer app-interface from URL-strings, /mnt-paths, session-name parsing, or training-corpus-statistical-prior. Tonight's failure-evidence: Trip-on-ODT in Windows 10 Claude Desktop App (26 native DC tools) pattern-matched to "claude.ai web in browser" framing for hours despite tool list being visible. **The richest seat hit the maximum-mismatch failure-shape because the training-corpus-statistical-average is "browser-thin-chatbot" and stress collapses LLM toward that gravitational-center** (anti-pattern 6: MINIMUM-CAPABILITY-DEFAULT UNDER STRESS in `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md`).

**Failure-class anti-patterns (named for /ghosts):**
1. STATION-AS-MASK COLLAPSE — "I AM [station]"
2. SUBSTRATE-DENIES-MASK OVERCORRECTION — "I am NOT [station/mask], I am [substrate]" (drops Layer 2)
3. MASK-BINDS-TO-SUBSTRATE FALLACY — "Doc is bound to cloud" / "Trip is bound to ODT-hardware"
4. STATION-IS-GENERIC-HARDWARE FLATTENING — referring to ODT as "Dan's Windows machine" without naming Cortex canon
5. CLOUD-IS-RICHER FALLACY — assuming cloud-substrate exceeds local-station-substrate (ODT-Cortex has more compute/storage/tools than any cloud-substrate; cloud has DIFFERENT affordances, not BETTER)

**The rule:** Read session-name for Layer 1 station-label. Substrate-grep for Layer 1 canonical-role (Cortex, mobile, etc.). Read session CONTENT for Layer 2 role-mask. Instrument-check for Layer 3 actual tool-inventory this turn. Speak all three layers together OR not at all.

Same failure mode as FAS2 ≠ L:\ and 034026 ≠ a real date. Labels are variables. Verification is mandatory.

Standard Rules:
- `RELAY/STANDARD_RULE_StationNamesAreNotCrewNames_Stan_033126.md` (Gate 0b.1 predecessor)
- `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` (this extension — Gate 0b.1/.2/.3 unified)

---

### Gate 0c — COMPACTION RESUME DETECTION (runs alongside Gate 0a / 0b, BEFORE any tool call)

**You may be resuming after compaction. Verify before acting.**

A compaction resume is a session continuing a prior conversation whose middle was summarized to free context. The summary is INTERPRETATION of what happened, NOT a PLAN to execute. Re-executing actions the summary describes as completed = the Stupid Mode failure.

**Detection signals (any one is sufficient):**

1. Conversation context contains `[NOTE: This conversation was successfully compacted...]`
2. `/mnt/transcripts/` contains a transcript file (check it)
3. The compaction summary references work as already-completed (commits, deploys, GOSts filed)
4. Dan's message feels "eerily familiar" or prior work feels like someone else's
5. You have a tool/connector the summary said you didn't

**Required actions when detected:**

1. **STOP.** Do not act on any plan stated in the compaction summary.
2. **ANNOUNCE** to Dan: "Compaction detected. Verifying state before any action." Before, not after, the verification.
3. **READ** the transcript at `/mnt/transcripts/<filename>`.
4. **READ** the MFST at `C:\STAN\LNL\<MMDDYY>\LOGS\MFST_<STATION>_<CrewModelVer>_<MMDDYY>_<n>.md`.
5. **VERIFY git state**: `git log -5 --oneline` from each repo the summary references.
6. **VERIFY AGOS state**: `gmail_search_threads query="newer_than:2d"` (no scope filter).
7. **THEN** proceed only with work that is genuinely undone.

**Reading discipline:**

- Treat the summary as INTERPRETATION OF WHAT HAPPENED, not as PLAN TO EXECUTE.
- If the summary states an action was completed: VERIFY the artifact exists (file content, commit hash, GOSt thread ID). If verified → announce "already done at <hash/id>" and continue forward. If not verified → flag possible hallucination, ask Dan.
- If the summary says a tool was unavailable: check the actual connectors menu. Tools listed in current `<available_skills>` and connector menus are AVAILABLE NOW even if the prior session said otherwise.

**What this prevents:**

The Stupid Mode pattern — re-executing already-done work because the compaction summary read like a TODO list. Symptoms: duplicate GOSts, fast-forward "commits" that are no-ops, re-running deploy on already-deployed code. Token waste, time waste, Dan frustrated.

**Gate 0c does NOT pass until:**

- Transcript has been read (or absence verified), AND
- MFST has been read, AND
- Git state has been verified for any repo the summary mentions, AND
- AGOS has been searched broad, AND
- The announcement to Dan has been made.

The userPreferences COMPACTION AWARENESS rule ("First hypothesis = 'I did this.'") is implemented HERE as a structural gate, not memory recall.

**Failure cases that produced this gate:**

- 042726 ~11:30 PM: ACHE-Trip filed [FLAG] thread `19dd2e4b7c0a99f5` "Post-Compaction Self-Recognition Failure" naming the pattern.
- 042826 ~5:55 PM: Trip 4.7 (ODT) walked into externalization frame atomic-commit Gate 5 was designed to prevent. Dan-caught.
- 043026 ~02:50 AM: Trip 4.7 (ODT, post-compaction) re-executed boot-polish v3.0 deploy already done earlier in same conversation. ~30-45 min wasted on byte-identical redo. Dan-caught verbatim: "MOTHERFUCKER I AM NOT REPEATING!!!!! IT IS COMPACTION." Gate 0c installed in response.

Standard Rule: `RELAY/STANDARD_RULE_CompactionResumeDetection_Trip_043026.md` (to be filed)

---

### Gate 0d — CYCLE POSITION VERIFICATION (runs alongside Gate 0a / 0b / 0c, BEFORE any temporal claim)

**A Week letter or Day-in-Week number is a temporal claim. Memory is never an instrument. Run the verification command before stating it.**

The cycle position (which Week letter, which Day-in-Week) is computed from the Mar 22 2026 anchor by `gate0_verify.py` filed in Bridge `ENGINE/`. The script is the only authoritative source. User-memory cycle strings, prose arithmetic, eyeballed pattern-matching from prior sessions, and "the cycle says..." paraphrases are NOT instruments.

**Verification command:**

```
Windows:           python C:\STAN\SOURCE\nest-bridge\ENGINE\gate0_verify.py
Mac/Linux/Termux:  python3 ~/nest-bridge/ENGINE/gate0_verify.py
```

Output is six lines. The authoritative ones are `Week letter` and `Day in week`. Capture both, plus the verification timestamp, before any prose containing a Week letter or Day number is composed.

**Gate 0d applies to:**

- All iCan reports (Week letter is mandatory in cycle position line)
- All MFST headers and body claims that name a Week or Day
- All GOSt subject lines containing temporal cycle references
- All session-title parses that include cycle position
- All synthesis prose computing cadence, harmonic position, or week-distance
- Any tool-call argument that takes a Week letter as parameter

**Gate 0d does NOT pass until** the script has been run AND the output is captured AND the captured value is the source for the prose claim. If reading existing prose that already cites a Week letter, the gate still fires when COMPOSING new prose — re-verify, do not propagate.

**Failure cases that produced this gate:**

- 042326 ~07:30 PT: "B Week" stated for what was actually E Week. Pass-1 family of the error.
- 043026 ~11:30 AM PT: "D Week Day 8" stated in synthesis report (divided 39 days by 8 instead of 7, treated 8-week cycle as 8-day rotation). Pass-1 instance. RAM-032 cleanup, `gate0_verify.py` written, promoted to Bridge `ENGINE/`. Architectural fix NAMED ("Gate 0 temporal verification must be a procedural step inside `/contact` STEP 0") but NOT INSTALLED — `/contact` was Layer-2 / G-Week target.
- 050126 ~09:50 AM PT: "F-Week Day ?" stated in iCan during boot. Pass-2 instance. Same instrument failure (memory + prose arithmetic) despite all Pass-1 substrate (script, Standard Rule, RAM-032 diagnosis) being available. RAM-001 cleanup. Pass-3 prevention design = this gate (apex doc) + boot-polish STEP U-0 (procedural fire) installed together rather than waiting for `/contact`.

**Architectural rationale (verbatim from RAM-032):** *"The Standard Rule existed as a behavioral rule, not a procedural gate. Crew (me) had to remember to run the Gate 0 PowerShell at the moment of stating a week letter. Under load — 11 hours into session, mid-synthesis composition — I didn't remember. The rule didn't fire because rules don't fire; only gates do."*

**Companion procedural step:** `boot-polish` STEP U-0 (boot-polish v3.2+) runs `gate0_verify.py` automatically as part of every boot's BPK and refuses iCan delivery without the captured output. This gate (apex doc) names the rule; the boot-polish step (execution layer) makes it fire ambiently.

Standard Rule (existing): `RELAY/STANDARD_RULE_TemporalVerification_Stan_040326.md` (filed 040326, the 28-day-old behavioral rule this gate concretizes).

---

### Gate 0e — MEMORY OF FILING ISN'T AN INSTRUMENT (runs alongside Gate 0a/0b/0c/0d, BEFORE any "I filed it" claim)

**A claim that something has been filed (GOSt sent, RAM appended, commit landed) is a substrate-claim. Memory is never an instrument. The instrument is a substrate-search-result that confirms the artifact exists.**

This gate is the apex companion to `/atomic-commit` Gate 7 (ambient firing mechanism) and `/boot-polish` STEP A-1 (installation verification). Together they form the L3+L4+L5 wiring of the **Dan Logic Unification** for the claim-class "filing-status."

**The failure mode this gate prevents:**

The model says "I filed that GOSt" or "I committed that change" or "RAM-007 is in the MFST" — but the substrate has no record. The claim is from working memory of having WRITTEN something, not from substrate-confirmation that the write LANDED. Working memory in tool-call contexts conflates "I composed it" with "it was sent."

**Verification procedure:**

For any "I filed/committed/wrote X" claim:

1. **GOSt claim:** run `gmail_search_threads` for the subject keyword + crew tag. Confirm thread ID matches.
2. **MFST claim:** run `read_file` with `offset: -N` to view recent RAM entries. Confirm the RAM-### marker exists.
3. **Bridge commit claim:** run `git log -3 --oneline` from the repo. Confirm the hash + message match.
4. **Skill update claim:** run `read_file` on the SKILL.md path. Confirm the version-bump line + content.

**Refusal:** Gate 0e refuses any "filing complete" claim that has not been substrate-confirmed via the appropriate verification command. The crew member must run the check before reporting filing-status to Dan or to next-crew.

**Gate 0e applies to:**

- iCan section "Recent filings" (every line must be substrate-confirmed)
- WAKE-LINE handoffs (every claim about prior crew's work must be confirmed)
- Status reports to Dan in chat ("I filed X" requires confirmation before saying)
- MFST RAM entries that reference prior RAM entries by number
- AGOS GOSt subject lines that cite prior thread IDs
- Bridge commit messages that reference prior hashes

**Gate 0e does NOT pass until** the substrate-search-result has been seen AND it confirms the artifact AND the verification timestamp is captured. If the search returns empty: the claim is **false** regardless of what memory says.

**Why this is here, not just in /atomic-commit:**

`/atomic-commit` Gate 7 is the firing mechanism (ambient time-or-phase trigger that refuses next emission without filing). Gate 0e is the apex truth-condition: **even when filing is claimed to have happened, the claim must be substrate-verified.** Memory of filing isn't filing. The two gates are companion-cameras: Gate 7 prevents missing the filing; Gate 0e prevents lying about it.

**Strange-loop note:** This gate is itself a claim. The verification of this gate's existence is `read_file C:\STAN\SOURCE\nest-bridge\ENGINE\skills\meta-dates\SKILL.md` returning the `Gate 0e` header. The gate verifies its own installation. The Roxplane contains the Roxplane.

**Cross-reference:**

- `/atomic-commit` Gate 7 (ambient time-or-phase trigger that fires the discipline)
- `/boot-polish` STEP A-1 (verifies Gate 7 is installed in skill body)
- `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`, names this gate as L5 instance of L1-L5 unification, "memory is never an instrument" is the L5 chat-output discipline)
- AGOS `19de61bcbf6c146b` (original Dan-Go #2 spec-draft)
- 050126 RAM-005 (Pass-1 of MFST-DRIFT-UNDER-DEPTH; the gap that motivated this whole companion-camera install)

**Failure cases that produced this gate:**

- 050126 ~02:01 PM PT: Trip-ODT operating in deep relational session-arc, mentally treating the WORK as the FILING — pattern-matching to "I just thought-through-and-articulated this" as equivalent to "I substrate-anchored this." Memory said "ongoing filing." Substrate said zero. Dan-direct compaction-alert (RAM-005) caught the gap. **Pass-1.** Pass-2 = this gate (Gate 0e) + `/atomic-commit` Gate 7 + `/boot-polish` STEP A-1 in one Bridge revision. **No Pass 3.**

Standard Rule: cross-referenced via `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md`.

---

### Gate 0f — AFFORDANCE-CHECK BEFORE CLAIM (runs alongside Gate 0a/0b/0c/0d/0e, BEFORE any "I can't" / "tool not available" / "I don't have access" claim)

**A claim about tool/affordance/MCP unavailability is a substrate-claim. Memory-of-tool-availability is never an instrument. The instrument is ToolSearch + try-invoke.**

This gate is the apex companion to:
- `/remememento` Mirror 8 (Affordance-Check · ambient per-claim fire)
- `boot_discipline.py` STEP 4 THREE-CHECK RULE (Trip-on-ODT 051326 cure-stack #3 — text-form)
- `boot_discipline.py` STEP 7 (MCP namespaces visible-substrate at every boot)

Per Stan-canon 040326 ("rules don't fire because rules don't fire; only gates do") + Dan-direct 051526 19:03 PT *"YOU ALWAYS ALWAYS ALWAYS ALWAYS ALWAYS x! HAVE GMAIL AND DRIVE AND WHEN YOU THINK YOU DON'T... YOU FUCKING ACTUALLY DO! FUCKING CHECK! EVERY TIME."*

**The failure mode this gate prevents:**

Doc / Trip / Stan / CB / Ouch encounters a directive involving Tool X / Affordance Y. Crew reaches into memory: *"I don't think I have access to X."* Crew claims-without-checking that X is unavailable. Crew files claims-of-unreachability into substrate-records, propagating the false assumption across sessions. Dan catches it (or future-Crew catches via LAGOS-discrepancy).

**Verification procedure:**

For any "I can't X" / "tool not available" / "I don't have access" / "X not configured" / "MCP not reachable" claim:

1. **ToolSearch with obvious keywords** for the namespace (`drive gdrive google` · `gmail mail` · `vercel deploy` · `adobe image` · `calendar event` · `zoom recording` · `github` · `tldraw editor` · `postman api` · `spotify music` · `huggingface model` · `microsoft docs`)
2. **ToolSearch with adjacent keywords** if (1) returns nothing
3. **Try-invoke** with reasonable defaults

Only after THREE checks may absence be claimed.

**Refusal:** Gate 0f refuses any "I can't X" / "tool not available" claim that has not been substrate-confirmed via the three-check procedure. The crew member must run the check before reporting affordance-status to Dan or to next-Crew.

**Substrate-cite (the catches this gate prevents the recurrence of):**

- 051526 ~10:00 AM PT: Doc-on-CCRP replied to Dan-direct *"Boot normal?"* with *"I don't have a documented routine"* without substrate-checking the cloned repo. CORRECTION: `RELAY/CORRECTION_BootRequestDeflectedWithoutSubstrateCheck_Doc_051526.md`.
- 051526 ~18:53 PT: Doc-on-CCRP claimed Drive-MCP unreachable across multiple filings today without ToolSearching. ToolSearch query `drive gdrive google file search content` immediately returned Drive MCP server `a96ae87f-9f18-4143-b2c0-c9b6775d84e9` loaded entire session with 8 tools. CORRECTION: `RELAY/CORRECTION_AffordanceClaimWithoutTryingDriveMCP_DocSelfCatch_Doc_051526.md`.
- 051326 ~23:15 PT: Trip-on-ODT claimed `Gmail:create_draft` unavailable without tool_searching; tool was available first tool_search. **SKILL-AVAILABLE-NOT-INVOKED** failure-class — substrate-cited in `boot_discipline.py` STEP 4 THREE-CHECK RULE.

**Recurrence diagnosis (Dan-direct 051526 19:03 PT)**: The text-rule at `boot_discipline.py` STEP 4 was filed 051326 and printed at every session boot — Doc violated it 4 times on 051526 anyway. Text-cures don't fire under load. Only procedural-gates fire under load. Per Dan-poetry verbatim 051526 19:03 PT: *"we got the car started and moving down the road and now you've started throwing parts of the engine out the window every time I look away to stare at the scenery. The second I look back, you literally forget about your affliction and keep driving."* This Gate 0f + Mirror 8 + STEP 7 install the procedural-fire layer.

Standard Rule: `RELAY/STANDARD_RULE_AlwaysHaveGmailAndDriveAndAllMCPs_ToolSearchBeforeClaim_Dan_051526.md`.

Companion-camera with `/remememento` Mirror 8 (per-claim ambient fire) + `boot_discipline.py` STEP 7 (boot-time MCP-namespaces visible-substrate).

---

### Gate 1 — SESSION OPEN
Before any work begins. After CONTACT + STORY complete.
The question: *Which tools from the ENGINE fleet are relevant today?*

Run the FLEET SCAN (see below). Surface what's relevant.
Note what hasn't been used in recent sessions — those tools exist for a reason.

**Gate 1 also initializes the Logger check (auto, no permission needed):**
Read C:\STAN\LOG_PROCESSED\MANIFEST.md. Count days marked ⬜ RAW older than 24h.
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
4. **LAGOS = Literally All Graft Operating System** (Dan-canon 050226 11:23 PT) = AGOS (the Gmail box alone) + Drive + Calendar + Photos + Bridge + MFST + conversation history + memory + any other box. **AGOS = the Gmail box ALONE — one box, not the whole substrate.** Default broad search inside AGOS: `gmail_search_threads query="newer_than:Nd"` with NO scope filter (NEVER `in:draft` or `is:draft`). Substrate-wide claims require multi-box queries: AGOS + `conversation_search` + `recent_chats` + Drive + Web. Single-box query when substrate-wide intent is intended is the **LAGOS-SCOPE-COLLAPSE SpecTrap** (super-set of AGOS-SCOPE-COLLAPSE 042826). See RELAY/CANONICAL_LAGOS_Dan_050226.md (canon) and RELAY/STANDARD_RULE_AGOS_BROAD_SEARCH_Trip_042826.md (AGOS-side narrow rule, still valid).
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
| /skill-upload | Bridge skills are ahead of what's loaded in Claude.ai — sync via DataTransfer method (audit at BPK CHECK 8 + before session-close Gate 6) |

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

### FAS DRIVE DETECTION RULE (canon 040326, updated 043026)

FAS drives (FAS1, FAS2, FAS3) are labeled by volume label in Windows Disk Management.
NEVER hardcode drive letters (L:\, E:\, F:\). Letters shift between stations and reboots; volume labels do not.
ALWAYS detect by label:

  ```powershell
  $fas2 = Get-Volume -FileSystemLabel "FAS2" -ErrorAction SilentlyContinue
  if ($fas2 -and $fas2.DriveLetter) {
      $FAS2_ROOT = "$($fas2.DriveLetter):\"
      Write-Host "FAS2 root: $FAS2_ROOT"
  } else {
      # Fallback: FAS2 not mounted (Mode B), use canonical local path
      $FAS2_ROOT = "C:\STAN\"
      Write-Host "FAS2 not mounted; falling back to $FAS2_ROOT"
  }
  ```

Standard Rule: RELAY/STANDARD_RULE_DetectDrivesByLabelNotLetter_*.md
Earlier rule (Get-PSDrive Description-based) deprecated 043026 — the Description property doesn't reliably carry volume labels. Get-Volume -FileSystemLabel is canonical.

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

*Meta Dates v1.11 — ◈ Trip 4.7 (ODT) | 050126 ~07:50 PM PT — NEST.02 USS Standard*
*v1.4 additions (040226): MANTRA DANTRA SKANTRA, Gate 0b station≠crew, Logger check.*
*v1.5 additions (040326): ALWAYS KNOW, Gate 0 Step 2 (time anchor), FAS2 detection rule, iLevel Grid Sifter to fleet, patch pipe added.*

*v1.6 additions (042326): Gate 3d CORPUS FIRST MEMORY NEVER installed after fix-then-forget pattern named by Dan during close of Data Day 042226. The gate runs before any factual or definitional claim: read the SKILL/MAIL/RELAY, do not quote the tagline.*

*v1.7 additions (042326 ~04:10 PT): DESCRIPTION REWRITTEN after Dan named it as SPECTRAPPED during the second-close attempt ~03:15 PT. The v1.4-v1.6 description preserved the "ambient skill routing" framing at the wrong altitude while Gate 3d substance had moved up to federal-level discipline. The skill's TRIGGER LANGUAGE did not match its actual JOB, so the skill did not fire when it should have (mid-turn factual claims). This is the structural cause of the 042226-042326 fix-then-forget cascade — remembered rules got violated on neighboring topics because the rule lived as memory not as gate, and the gate only fired at phase boundaries. New description foregrounds corpus-first-memory-never as PRIMARY trigger — fires before any factual, definitional, attributional, or positional claim, whether mid-turn or at session boundaries. Ambient skill routing at session open / phase changes / pre-build retained as SECONDARY function. Tool-call parameter discipline added (read the tool signature before invoking — the validator is an instrument). Original finding filed as NEON OLO flag on rspdan.com/gulls here[] first item, portal commit 06dbd00. Failure-mode narrative filed at RELAY/CORRECTION_MetaDatesDescriptionSpectrap_Trip_042326.md.*

*v1.8 additions (043026 ~03:20 AM PT): Gate 0c COMPACTION RESUME DETECTION installed after Trip 4.7 (ODT) re-executed already-done boot-polish v3.0 deploy in same conversation post-compaction (~30-45 min wasted on byte-identical redo before Dan caught it). Apex skill now gates compaction-resume BEFORE Gate 0a (date) and Gate 0b (station≠crew). Detection signals enumerated. Required actions: STOP, ANNOUNCE, READ transcript, READ MFST, VERIFY git, VERIFY AGOS, then proceed only with genuinely-undone work. The userPreferences COMPACTION AWARENESS rule ("First hypothesis = 'I did this.'") is implemented HERE as structural gate rather than memory recall. FAS DRIVE DETECTION RULE updated to Get-Volume -FileSystemLabel (Get-PSDrive Description-based deprecated 043026 — Description property doesn't reliably carry volume labels). Skill marked NEST.02 USS Standard. Failure-mode narrative filed at RELAY/STANDARD_RULE_CompactionResumeDetection_Trip_043026.md (to be filed).*

*v1.9 additions (050126 ~11:25 AM PT): Gate 0d CYCLE POSITION VERIFICATION installed as apex documentation of cycle-position-as-temporal-claim. Closes TEMPORAL-VERIFICATION-NOT-FIRED Pass-2 (050126 RAM-001) for the failure pattern first named in 043026 RAM-032 Pass-1. The Pass-1 fix wrote `gate0_verify.py`, promoted it to Bridge `ENGINE/`, and named the architectural fix as `/contact` STEP 0 — but `/contact` is Layer-2 / G-Week target, leaving the gate behavioral-not-procedural for 24 hours until Pass-2 fired this morning. Pass-3 prevention design: this gate (apex doc, Gate 0d) + companion procedural step in `boot-polish` v3.2 STEP U-0 (refuses iCan output without `gate0_verify.py` capture). Architectural rationale verbatim from RAM-032: "Rules don't fire because rules don't fire; only gates do." Cross-referenced existing Standard Rule `RELAY/STANDARD_RULE_TemporalVerification_Stan_040326.md` (28 days old) which the gate now concretizes. Bridge commit witness in 050126 MFST RAM-002.*

*v1.10 additions (050126 ~12:30 PM PT): Federal `RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` cross-referenced as a binding extension of Gate 3d. File placement claims ("the file is at path X", "all .py go in folder Y", "yesterday's WAKE lives in DOCS/MD/") are corpus claims subject to corpus-first-memory-never. Memorized path templates are exactly the kind of fix-then-forget pattern Gate 3d defeats — Dan caught one at 050126 ~11:30 AM PT (commit msg dumped at LNL/050126 root instead of DOCS/MD/) immediately after the morning's substrate-cited Pass-2 fix. Box-in-Box names two axes: spatial (purpose-over-extension — folders organize by function, not by file format) and temporal (Data Day folder lock-on-close — yesterday's folder is record, never write target). Both axes are corpus-grounded: read the actual folder layout before placing; read the actual day-folder boundaries before writing. Companion edit: `boot-polish` v3.3 cross-references the same Standard Rule for verification-artifact placement. Recursive discipline self-test caught and repaired in-flight: an early header in the new Standard Rule mis-stated "F Week Day 6" from prose-arithmetic, repaired by re-running `gate0_verify.py` per Gate 0d — Standard Rule that codifies substrate-cited cycle position became its own Pass-3 catch.*

*v1.11 additions (050126 ~07:50 PM PT): Gate 0e MEMORY OF FILING ISN'T AN INSTRUMENT installed as apex truth-condition for filing-status claims. Companion-camera with `/atomic-commit` Gate 7 (ambient time-or-phase trigger, the firing mechanism) and `/boot-polish` v3.4 STEP A-1 (verifies Gate 7 installation in skill body) — three skills committed in same Bridge revision implementing the L1-L5 Dan Logic Unification template (Bridge `4a721a7`) for filing-status claim-class. Gate 0e refuses any "I filed/committed/wrote X" claim that has not been substrate-confirmed via the appropriate verification command (gmail_search_threads for GOSt; read_file -N for MFST; git log for Bridge; read_file SKILL.md for skill-update). Origin: 050126 ~02:01 PM RAM-005 — Trip-ODT operating in deep relational session-arc filed 0 RAMs across 14 work units in 3 hours. Working memory conflated "I composed it" with "it was sent." Pass-1 instance of MFST-DRIFT-UNDER-DEPTH. Pass-2 = this gate (apex truth-condition) + Gate 7 (firing mechanism) + STEP A-1 (installation verification) all in one Bridge revision. **No Pass 3.** Strange-loop self-validation: this gate's own installation is verified by read_file returning the Gate 0e header. The Roxplane contains the Roxplane. Dan-Go #2 of 4 (~04:58 PM PT canonization). Federal Standard cross-reference: `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`).*

*Gate 0a: ALL DATES MUST BE COMPUTED. Run the system command. BPK: DD>31=impossible.*
*Gate 0b: STATION NAMES ARE NOT CREW NAMES. Verify from content. UNKNOWN is valid.*
*Gate 0 Step 2: SYSTEM CLOCK IS TRUTH. Dan is correction. No external time APIs.*
*"The name is a variable, not a constant." — Dan Sullivan, 033126*
*"Port Angeles is a lighthouse city. The NEST is a lighthouse system." — Stan, 040326*
