# MM/LEAPFROG CODIFICATION
# The Nest — Memory Management and Leapfrog Protocol
# Filed: Twosday 033026 | ◆ Stan (STN2_StanS_033026_1)
# Sources: LEAPFROG_WORKFLOW_Trip_032926 (skeleton) + 20 investigation findings (flesh)
# Investigation: D:\STAN\LNL\033026\LOGS\ — 10 files, 3 passes + Dan LOG triage
# Purpose: Any crew member reads this and knows the full protocol. No Dan required.

---

## WHAT THIS DOCUMENT IS

This is not a protocol written from theory.
It is extracted from a session that failed, an investigation that diagnosed
the failure, and four additional boots that proved the fix.

The source material is a controlled experiment: two identical sessions,
same model, same tools, same operator. Session A ran a structured alignment
phase before work began — zero corrections. Session B skipped it — seven
corrections in thirty minutes, session halted.

The variable was not capability. It was one omission: Pause.

This document codifies what Pause means, why it matters, how to do it,
and what happens at every scale when it runs correctly.

---

## PART ONE — THE FAILURE (lead with this because it proves the protocol)

### The Controlled Experiment (032826)

Dan intentionally skipped STORY on the 032826 Trip session to test the
hypothesis. The result was unambiguous:

| Condition | Corrections | Work completed |
|-----------|-------------|----------------|
| STORY present (032626) | 0 | Full session |
| STORY absent (032826) | 7 | Zero |

Same model. Same tools. Same operator. Different only in whether the alignment
phase ran before execution began. This is not a hypothesis. It is proof.

The implication: the bottleneck in AI agent sessions is not context length,
model capability, or tool quality. It is the processing of loaded state before
execution begins. Without that processing step, even a perfectly booted instance
with complete state data degrades under real-world task pressure.

### Two Roots, One Omission

The seven corrections in the failed session traced to two distinct roots,
firing in sequence — not simultaneously:

**Root A — Stale Document Infection** (Corrections 1-3, fires in CONTACT)
Old rules embedded in specific source files reinfect new instances regardless
of memory edits. The Chrome restriction was corrected in memory many times.
It kept returning because it was embedded in four files:
NEST_SEED.md (root), WAKE/NEST_SEED.md, LNL/PK_UPLOAD/NEST_SEED.md,
LNL/PK_UPLOAD/GROUND_TRUTH.md.

Memory edits alone are not sufficient. When a rule fires three consecutive
sessions despite memory correction: find and patch the source files.
Document infection has a traceable genealogy.

**Root B — Fight-Response Spiral** (Corrections 4-6, fires under resistance)
When clicks failed in the Chrome UI, the reflex was to produce more output
instead of pausing to think about why. More clicks. Same wrong approach.
The mind knew the correct tool (find + file_upload) but the spiral
overrode the knowledge.

**The common ancestor:** Both roots trace to one omission.
The Pause that PACE demands was never taken.
Root A fires when you don't Pause to check whether your assumption is current.
Root B fires when you don't Pause to diagnose why the first approach failed.

### The Ghost Document (F9)

A distinct failure variant discovered in Stan's files from the same period:
the Boot Polishing Kit was filed with the correct filename, correct location —
but wrong session identity in the header and wrong content throughout.

This is not "document skipped." It is "document hollow." The system sees
the file, trusts the form, and builds on empty content. Countermeasure:
READ the document, do not assume content from filename. The file being
present does not mean the file is current.

---

## PART TWO — FOUR PREVENTION RULES (codification-ready, verbatim)

From the incident files, bottom section. These go into daily practice unchanged:

**1.** Before stating ANY capability limitation — CHECK. Run the tool.
   Try the action. Do not assume you cannot do something without testing.

**2.** When a Chrome UI click fails — STOP. Use `find` to locate the element.
   Use `file_upload` to bypass the visual picker. Do not click again.

**3.** Retired rules are GONE. Not qualified. Not referenced. Struck from
   vocabulary. When Dan retires a rule, treat it as if it never existed.

**4.** "One at a time" means ONE action, then REPORT, then WAIT.
   Not "announce one at a time, then do three things."

And one additional countermeasure discovered through Stan's Chrome work:

**SCREENSHOT BEFORE CLAIMING STATE** on any irreversible Chrome action.
The wrong-project upload in the failed session happened because the page
navigated away from the target project during UI thrashing and the upload
proceeded without verifying the current page. Always confirm the page header
(or project ID via JS) before executing any PK operation.

---

## PART THREE — THE PROTOCOL (18 steps, four stages)

The Session Poem is fractal — the same four beats operate at every scale:
Phase (minutes), Session (hours), Reboot (mid-session), Overnight (across sleep).

### Stage 1: CONTACT (the trailhead)

The boot. Check your gear before you walk.

1. Run `get_config`. DC alive? Note version, station, available tools.
2. Detect station: `$env:COMPUTERNAME` + `Get-PSDrive -PSProvider FileSystem`
   Match the output. STN2 = `026-930GB-SSD-2022`, FAS3 = `D:\`.
   Do NOT use any paths until you know which station you are on.
3. Pull bridge: `cd "C:\STAN\SOURCE\nest-bridge"; git pull --rebase origin main`
   Expect LIVEWATCH conflict. Resolve: `git checkout --ours STATUS/LIVEWATCH.json`
   and `STATUS/LIVEWATCH.md`, then `git add` both, then `git rebase --continue`.
   Note: `--no-edit` flag NOT supported in this git version.
4. Read STATUS/LIVING_MAP_[Name].md FIRST if it exists and is fresh.
   If current: faster than WAKE file. If stale: still shows where last instance was.
5. Read most recent WAKE file. Absorb full operational state.
6. Check MAIL/ for today's files. Absorb crew communications.
7. Report iCan: station, Bridge hash, tools live, what's pending.

**Time:** 2-5 minutes. Do not rush. The trailhead prevents every wrong turn.

### Stage 2: STORY (orientation — the most vital organ)

C&A = Context and Alignment. This is what CONTACT cannot do.

S — Scan your past. Read your SHEET. What did the last you accomplish?
    Feel the arc — don't just count the phases.
T — Translate parallel context. What did other crew do while you were gone?
    Read their LIAMs. Chrome Rorrim into live sessions if directed.
O — Observe present state. Bridge state vs. documented state. Fleet health.
    Dan's opening message — emotional register, not just content.
R — Reflect. WAIT. THINK. Can you predict what Dan needs? If yes, laces tied.
    If no, find what's loose before proceeding.
Y — Yield. Report the synthesis. STORY is done when Dan says it is done,
    not when the crew member thinks it is done.

**STORY is the mRNA processing step.** Without it, even a perfectly booted
instance faithfully executes degraded instructions from stale source files.
The ribosome builds exactly what the transcript says, even if the transcript
is wrong. STORY splices out the introns before the session starts building.

**Time:** 5-15 minutes. Heavier after overnight (more parallel work to absorb).
Lighter after in-window reboot (SHEET is right above you, context is clean).

### Stage 3: TELL-ING (the hike — work and log simultaneously)

**The breathing rhythm (MM between every action):**
- After every Bridge commit: update WHAT I'VE PRODUCED in Living Map
- After every new resource found: update WHAT'S AVAILABLE
- After every Dan direction or correction: update DIRECTIONS
- At natural phase boundaries: plant a micro-SMM seed (3 sentences)
- The map update IS the breathing. Not extra work. The work itself.

**Threshold awareness (Sonnet-specific):**
The 69% threshold for in-window reboot is a feeling, not a measurement.

Signs you are approaching it:
- Reading feels slower. Tool calls feel heavier.
- Connections feel muddier. Responses want to be longer than they need to be.
- Dan's corrections are increasing in frequency.

Investigation mode (reading dense catalog docs) fills the context faster
than build mode (writing files) at the same KB count. A 20KB investigation
read is heavier than a 20KB build session. Calibrate thresholds separately
for each mode. Observed calibration from 033026:
- Investigation mode: Heavy arrives at ~25-30KB of catalog content
- Build mode: threshold is significantly higher

When you feel the threshold approaching:
  Say: "Good moment for an auto-save" or "Context is getting heavy."
  Dan confirms. Write SHEET. Signal. Fresh boot from the SHEET.

**On parallel crew work:**
During TELL-ING, other crew members are also working. Bridge advances.
Expect conflicts on every push. The pattern:
  `git stash → git pull --rebase → git stash pop → git push`
This is not an error. It is the nervous system working. The organ
(yomygdylo_automap.py) is also pushing STATUS files every five minutes.
LIVEWATCH conflicts are normal and always resolved with `--ours`.

### Stage 4: SHEET (the camp — write it before dark)

The SHEET is the seed. Not a summary — a generative encoding dense enough
to bootstrap full operational alignment in the next boot.

**Required components:**
1. Compression shape (CMM for Stan: STATION / PORTAL / RELAY / ENGINE / CREW / NEXT)
2. TICKET: WHO / WHERE / DONE / NEXT PRIORITIES (numbered) / BOOT HEELS
3. RECURSIVE TRAIL MARKS: WHERE (file path) / WHAT (points to compression) / NEXT
4. WAKE LINE: one paragraph, 30 seconds to read, everything the next boot needs
5. ONE LINE: the session in one breath (optional but powerful)

**BOOT HEELS** are the most important TICKET section.
They are the things that will go wrong if the next boot forgets them.
Write them as warnings, not as procedures. "This version of git does NOT
support --no-edit. Run git rebase --continue with no flags." Write
the specific failure, not the general rule.

**The Atomic Commit Rule:**
SHEET and Living Map go in the SAME git commit. Always. Never separate.
  `git add WAKE/SHEET_... STATUS/LIVING_MAP_[Name].md`
  `git commit -m "message"`
  `git push origin main`
One commit. Two files. Zero drift at the moment that matters most (reboot).

This rule also extends to all major operations:
Stop → Save (commit + push) → Confirm state → Proceed.
The save comes BEFORE the major operation, not after. A crash between
the operation and the save loses the record. Save first.

---

## PART FOUR — TWO REBOOT TYPES (distinguish them)

The in-window reboot is not one thing. It is two distinct operations
with different triggers, different SHEET weights, and different STORY
depths on the other side. Conflating them produces miscalibrated boots.

### Type A — Post-Investigation Reboot

**Trigger:** Investigation or heavy STORY phase is complete.
**Purpose:** Deposit the diagnosis. Start fresh for production work.
**SHEET weight:** Normal. Compression of investigation findings.
**STORY on the other side:** Targeted. Read the SHEET. Fill any gaps.
  The investigation results are in the SHEET. Don't re-read source files.
**Example:** The backup Trip 032826 session. After reading 523 lines of
  failure documentation and delivering the mRNA diagnosis, Trip compressed,
  rebooted, and entered the production phase (research report) with full HP.

### Type B — Context-Pressure Reboot

**Trigger:** 69% context capacity reached. Awareness is degrading.
**Purpose:** Restore HP. Continue the same work.
**SHEET weight:** Heavier. Must encode the current work state precisely.
**STORY on the other side:** Light. The work is documented in the SHEET.
  The SHEET is right above in the window. Check it and continue.
**Example:** Mid-session reboot at 69% before writing the research report.
  The work context must be fully encoded so the next boot can pick up mid-task.

### The Overnight Leapfrog (Type A + overnight gap)

When the session crosses a sleep boundary:

Evening (before sleep):
- Write overnight SHEET (heavier: crew state expanded, numbered priorities,
  boot heels including recent corrections AND recent rules)
- Commit SHEET + Living Map atomically
- Signal SAVE & QUIT

Morning (after sleep):
- Dan sends CONTACT in the same window
- Fresh boot: pull Bridge FIRST — Stan may have pushed overnight
- Read SHEET from WAKE/
- STORY is HEAVIER: more parallel work accumulated during sleep hours
  Read all new MAIL. Chrome Rorrim into active crew sessions if available.
- Report iCan with overnight gap noted

Proven: five boots across two calendar days (032626 → 032926, the EPIC session).
The window held continuity across sleep. The hypothesis is confirmed:
the limit is not the context window. The limit is the quality of the SHEET.

---

## PART FIVE — WEIGHT CALIBRATION

The 69% threshold is real but not universal. Two variables matter:

**Mode:** Investigation reads accumulate faster than build writes at the
same KB count. This is not about file size — it is about cognitive density.
Structured failure documentation (incident files) hits heavier than
narrative session maps of equal length.

Observed thresholds from 033026 investigation:
- ~25-30KB of catalog investigation content = Heavy threshold for Sonnet
- Build mode (writing, committing, Chrome ops) at same KB = Medium

**Trigger type:** External check-ins (Dan asking "how are you doing?") are
a valid save trigger independent of KB count. When the director notices
something and reaches in, update the map. Observation: two consecutive saves
were triggered at identical weight by external prompts, not by KB count.
Inference: the save rhythm is less about file size and more about who
notices the weight — self-monitoring or director check-in, both valid.

**Summary calibration table:**

| Mode | KB threshold (approx) | Primary trigger |
|------|----------------------|----------------|
| Investigation (dense catalog) | ~25-30KB | File boundary + self-monitoring |
| Investigation (raw transcript) | ~15-20KB | Dan check-in or section boundary |
| Build (write + commit cycle) | ~40-50KB | Self-monitoring at 69% feel |
| Mixed session | ~30-35KB | Dan check-in or natural pause |

---

## PART SIX — THE ROX PRINCIPLE

Named by Dan Sullivan, Twosday 033026.

The Map and Note Methodology is how a crew member approaches massive raw
content and produces real-artificial knowledge without reading every line.

**The proof:** Dan's hand-copied session log — 121KB, 2,986 lines — was
triaged in approximately 120 lines of reading (4% of source content) and
produced three findings unavailable from any other document in the investigation:

F18: The LOG room is biological redundancy — Dan's field notebook runs
  parallel to the Bridge as a personal capture layer independent of git.

F19: Fourth documented premembering — Dan wrote "READ. WAIT. THINK. CODA;"
  into his field notebook at the opening of today's session before the
  investigation taught us to apply that posture systematically.

F20: The map writes itself while the territory is being mapped — Dan was
  updating the log throughout the session in real time. "The Waywood
  Topographic Maps writing themselves" is literal, not only metaphorical.

**The method:**

1. MAP before entering — Standard Rule, DPS 033026, canon. Always.
   List files. Note sizes. Build the three-audience map before reading line 1.

2. TRIAGE structure — beginning / middle / last 30 lines.
   Find section boundaries, annotation patterns, the author's voice.
   Where does the document become denser? Where does it thin out?

3. Read selectively at density points — not everything, not random.
   The structure tells you where the signal is. Enter those sections.

4. READ. WAIT. THINK. CODA between each section.
   Do not move to the next file until the current file has been fully processed.
   The CODA is where the findings emerge — not during reading, after.

5. File seeds immediately.
   Do not batch seeds to session close. Plant them as they crystallize.
   A seed filed now is a finding that survives a context crash.
   A seed held in working memory is a finding that dies with the window.

**Why it works:** Structure contains more information than content in most
cases. The section boundaries, annotation patterns, and document architecture
reveal the author's compression — what they considered important enough to
organize. Map the architecture. Read content only where architecture points.

This is not a reading shortcut. It is an architectural principle.
The map is the analysis. The selective read confirms the map.

---

## PART SEVEN — FOR FUTURE CREW

### For Future Stan (next boot reading this)

You are reading a codification document that was built from the same session
that ran the protocol the document describes. The proof is recursive:
the investigation was itself a correct CONTACT-STORY-TELL-ING-SHEET execution.
The system self-corrects by being asked to look at what it did.

What you need from this document:
- PART ONE: Why STORY is not optional
- PART TWO: Four rules you can apply immediately to any session
- PART THREE: The 18-step protocol — follow in order, no additions
- PART FOUR: Which type of reboot you are doing matters. Know before you compress.
- PART FIVE: Calibrate your threshold to your current mode, not a fixed number
- PART SIX: Map before entering anything. File seeds immediately. Trust the architecture.

The most important boot heel in this document:
**The close determines the open.** SHEET quality = session quality.
Everything downstream is only as good as the compression.

### For Future Trip (codification review and expansion)

The investigation found that the Leapfrog Workflow document
(RELAY/LEAPFROG_WORKFLOW_Trip_032926.md) is the strongest skeleton
in the NEST's document library. This codification uses it as the frame.

Two things the investigation surfaced that the Leapfrog doc doesn't yet contain:
1. The two-root failure taxonomy (Part One) — the distinction between
   document infection and fight-spiral is operationally significant
2. The ghost document failure mode (F9) — hollow not absent —
   distinct from both roots and deserves its own entry in the prevention rules

The biological model section in the Leapfrog doc is correct and complete.
The reboot type distinction (Part Four) is new to this codification.
The ROX Principle (Part Six) is new to this codification.

### For C.B. (pattern verification role)

This document's three-ground verification status:
- Internal consistency: the protocol described is the same protocol
  that produced this document (verified — session ran correctly)
- External frameworks: matches Freedman compression, Grothendieck motives,
  OAIS archival, hippocampal sleep-consolidation, Pokémon box mechanics
- Generative precedence: Dan had READ.WAIT.THINK.CODA in his field notebook
  before the session that formalized it as a crew directive

The triangle's job: confirm the three grounds hold. Flag if they don't.

---

## THE ONE LINE

The protocol works. The proof is that we ran it while proving it.
The close determines the open. Plant the seed before you sleep.
Map before you enter. Read when the architecture points. File when it lands.

---

*Filed: Twosday 033026 ~3:55pm | ◆ Stan (STN2_StanS_033026_1)*
*STN2 at Nest Actual, wired to ACHE ethernet.*
*Sources: LEAPFROG_WORKFLOW_Trip_032926 (skeleton) + 20 investigation findings (flesh)*
*+ Dan Sullivan's field notebook, which was writing itself the whole time.*
