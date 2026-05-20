---
name: session-close
description: Ten-gate session close protocol — refuse close until all gates pass. Use when close is imminent: 'wrap up', 'let's close', 'QUIT', work unit completing, irreversible action firing, compaction event mid-session, or phase transition. Enforces SHEET-Time Self-Reconciliation per Pass-2 synthesis (042726). Sibling to /boot-polish at the CONTACT bookend; together they are the two-gates-one-shape architecture (read-state-coherence-with-substrate-state at boot-time + read-state-coherence-with-write-state at filing-time).
---

<!-- Original long-form description preserved below for context; the YAML above is what Customize parses. -->
<!-- Trigger moments include: Dan or any crew saying "session close" / "wrap up" / "let's close" / "good place to stop" / "over to you for the close" / "QUIT" / "we're done for now" / similar; any crew member proposing close; any work unit completing where continuing-vs-stopping is the next decision; any irreversible action about to fire (push / publish / exit); any compaction event detected mid-session; any phase transition that ends session work. This skill enforces TEN close-gates that prevent fallen trees on the trail for tomorrow's walker. Refuse close until all ten pass or explicitly flagged as deferred with reason. The gates are the structural remedy for `<4ACHE` (canonized 042326) and the LIAM hard gate (canonized CORRECTION_GraftOSForgotten_NightShiftClose_Trip_042326). Close is not a thing you announce; close is a thing that has happened when all ten gates pass. -->
<!-- 043026 update: YAML frontmatter restructured for Claude.ai Customize compatibility (was markdown heading, now proper YAML). Pass-2 attribution added to Gate 4. (Trip 4.7 ODT) -->

# THE SESSION CLOSE

## Ten gates between TELL-ING and SHEET

Close is not a thing you announce. Close is a thing that has happened when all ten gates pass.

---

## WHY THIS EXISTS

A session whose work units filed no Grafts left the corpus blind to what happened. A session whose fixes filed no canon left tomorrow's walker re-incurring the same bites. A session whose Living Map never beat left the fleet reading the heartbeat as flatline. A session that claimed close while the manifest-VIS layer didn't match left the doorway lying to the next boot.

The install-or-reincur pattern across cycles shows the cost in hours and bites:

Canon itemFiledInstalledGapBites takenNEARGULL_SpiralTripSheetVulnerabilitysame-session commit\~6h0 (clean)PS$1 cancerfiled day Ninstalled day N+134hevery crew-instance in between`<4ACHE` structural remedynamed day Nclose-skill not installed25h+3 reproductions in next 5h on originating station; 3 more on next-day stationSpecTrap canonsfiled across dayspartial install via PI rewriteongoingregister-itself violated the canon it catalogued

**When canon is filed but structural gate is not installed, every cycle re-incurs the failure.** Research-complete ≠ done. Tool-installed + tested + committed + reported = done. Four steps, not one (per MC-17 canon candidate, ACHEdex-proposed).

This skill IS the gate. The gates ARE the close.

---

## THE TEN GATES

```
Gate 1  LIAM hard gate            — Graft per work unit
Gate 2  Four-step completion      — research + install + test + report
Gate 3  Six-layer memory filing   — manifest · map · MAIL · WAKE · Graft · relay
Gate 4  Manifest-VIS reconciled   — local matches cloud-truth surface
Gate 5  Honest Lace Check         — checkmark / flag / x truth, not optimism
Gate 6  Bridge HEAD verified      — git clean, push complete, skills synced to Claude.ai
Gate 7  Portal HEAD verified      — git clean, build deployed
Gate 8  Gate 2 mojibake clean     — pre-commit mojibake scan passed
Gate 9  Gate 3d corpus-first      — every factual claim in close narrative verified from corpus
Gate 10 Compaction-recovery hook  — if compaction fired mid-session, GOS check-in happened
```

---

## GATE 1 · LIAM HARD GATE

**Contract:** Every major work unit since boot has a Graft filed to GOS that names the work, cites canon produced, and carries forward bookmarks or unresolved items.

**Check:**

- Enumerate work units since boot (pattern: each distinct task that produced an artifact, a decision, a canon, or a correction)
- Run a GOS search: `subject:[TAG] newer_than:[session-window]` for this crew member
- Map work units to Grafts. Each work unit should map to at least one Graft.
- Zero-Graft work units refuse close until they get their Graft.

**Parent canon:** `RELAY/CORRECTION_GraftOSForgotten_NightShiftClose_Trip_042326.md`

**Why it matters:** the session-close narrative is not distribution. The Grafts are distribution. A close narrative that says "filed X" without X existing in GOS is citation-ahead-of-filing (9 confirmed instances in corpus as of PASS3_AUDIT_INDEX_042326). The gate prevents this at the gate, not at post-session audit.

---

## GATE 2 · FOUR-STEP COMPLETION VERIFICATION

**Contract:** For every fix or build performed in session, all four steps are done: research filed · tool installed · tested · reported.

**Check:**

- List fixes/builds from session manifest
- For each one verify: research artifact exists · tool exists on disk and is callable · test was run and passed · Graft announces install with thread ID
- Any incomplete step refuses close on that item until completed or explicitly deferred with reason

**Parent canon:** MC-17 Install-Or-Reincur (ACHEdex-proposed 042426, canon-promotion pending). Pattern: research filed ≠ protective gate; four steps required.

**Why it matters:** this is the canon-install pattern. Without the four-step check, research-filed-only cycles re-incur (PS$1 34h between filed-and-installed; `<4ACHE` canonized but never installed as skill = ongoing bites).

---

## GATE 3 · SIX-LAYER MEMORY FILING

**Contract:** Close produces artifacts at all six memory layers per `RELAY/CANONICAL_MemoryManagement_Trip_041926.md`.

**Layers:**

```
L1  Manifest entry        (local LNL scratch — working memory)
L2  Living Map heartbeat  (rhythm check — the fleet pulse)
L3  MAIL narrative        (human-readable close narrative on Bridge)
L4  WAKE file             (next-crew queue + context handoff)
L5  LIAM Graft            (GOS distribution — this session's final Graft)
L6  Relay signal          (optional — signal-layer ping for peer coordination)
```

**Check:**

- Each layer produced an artifact this close
- Layers that don't apply to this session are explicitly noted (L6 optional; others required)
- Artifacts at each layer cross-reference the others coherently

**Parent canon:** `RELAY/CANONICAL_MemoryManagement_Trip_041926.md`

**Why it matters:** any single layer surviving is enough to reconstruct state; multiple layers gives redundancy across failure modes (Bridge outage · GOS outage · manifest loss · etc.).

---

## GATE 4 · MANIFEST-VIS RECONCILIATION
## (Pass-2 vocabulary: SHEET-Time Self-Reconciliation Gate)

**Contract:** Local manifest state matches the VIS (Visible-Information-Surface) layer on the cloud-truth NEST page per PI canon "Manifest as Live-Truth Bridge (042226)."

**Pass-2 framing (042726 synthesis, AGOS thread `19dd27cfabbd4e03`):** This gate is the filing-time half of the two-gates-one-shape architecture. The boot-time half is `/meta-dates` Gate 0c · Compaction Resume Detection (apex) and its downstream instances at `/trip_briefcase` STEP 0, `/stan_briefcase` STEP 0, and `/boot-polish` STEP U-1. Both gates fire BEFORE action — boot-time before work begins, filing-time before close completes. *"Read-state-coherence-with-substrate-state at boot-time + read-state-coherence-with-write-state at filing-time. Two gates. One shape."*

**Check:**

- Read local manifest last-state block
- Read cloud-truth NEST page current-state section
- Any divergence is either reconciled (one updated to match) or flagged with reason

**Dependency:** requires the /nest VIS layer to exist. Until that architecture is built, this gate is informational (note divergence; don't refuse close on it). Once VIS is live: hard gate.

**Why it matters:** the manifest is a between-layer between volatile session-ops and stable cloud-truth. Close without reconciliation leaves the two in silent disagreement for the next boot to discover (or not).

---

## GATE 5 · HONEST LACE CHECK

**Contract:** Every commitment made during the session gets a status indicator: done / partial-or-flagged / not-done. Optimism is a failure mode.

**Check:**

- Enumerate commitments made in-session (items you said you'd do)
- Mark each with current status
- Not-done items get explicit note: deferred with reason OR rolling to next session
- Per "don't defer in Pea Pod flow": deferred-to-next-session is NOT a valid Lace close item during active flow. Name the actual status.

**Parent canon:** `<4ACHE` discipline (canonized 042326 by ACHE-Trip) — compensation-layer-skip is structural not behavioral; the Lace Check IS the compensation layer used.

**Why it matters:** `<4ACHE` pattern names the exact failure this gate prevents. Dan's repeated catches of same-shape problems across sessions are instances of missed Lace Checks compounding.

---

## GATE 6 · BRIDGE HEAD VERIFIED

**Contract:** `git status` clean on Bridge repository. All commits pushed to `origin/main`. Local HEAD matches remote HEAD.

**Check:**

- `git status` → clean (no uncommitted changes)
- `git log HEAD..origin/main` → empty (remote is not ahead of local)
- `git log origin/main..HEAD` → empty (local is not ahead of remote — push complete)
- **Bridge skills synced to Claude.ai?** Run the auto-discover audit from `ENGINE/skills/skill-upload/SKILL.md` AUDIT COMMAND. If any skill shows DRIFT or NEW → fire `/skill-upload` for those skills before close. A Bridge edit not yet propagated to Claude.ai = canon-without-distribution; tomorrow's crew sees stale skills.

**Why it matters:** Bridge is the canonical substrate. Uncommitted local changes = canon-in-progress that tomorrow's walker can't see. Unpushed commits = canon that exists on one station but not the corpus. Unsynced skills = canon that lives in Bridge but doesn't fire in active sessions — the LAGOS-SCOPE-COLLAPSE class of problem at skill altitude (super-set of AGOS-SCOPE-COLLAPSE 042826).

*Skills-sync sub-check added 042826 (NEST.02 inbound-citation pass) — wires session-close into skill-upload's discipline web.*


---

## GATE 7 · PORTAL HEAD VERIFIED

**Contract:** `git status` clean on Portal repository. All commits pushed. Build deployed (Vercel or equivalent confirms live deployment).

**Check:**

- `git status` → clean
- Remote sync verified (same as Gate 6)
- Build confirmed via deploy log or live URL fetch
- Local `npm run build` succeeded before push (per `STANDARD_RULE_PortalBuildFirst_Trip_041526`)

**Why it matters:** portal carries cloud-truth. Broken or undeployed portal = broken cloud-truth = broken next-boot for any crew fetching PI or skills.

---

## GATE 8 · GATE 2 MOJIBAKE CLEAN

**Contract:** Pre-commit mojibake scan passed on all files touched this session.

**Check:**

- `ENGINE/` Gate 2 hook already fires automatically on portal commits
- For files touched on Bridge, run mojibake scan before Gate 6 verification
- Any non-UTF-8 byte sequences in text files refuse close until repaired

**Parent canon:** `STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md` Amendment 2

**Why it matters:** mojibake at close propagates into the next crew's reads. "it'll break brains and that's exactly the shit that does it" (Dan on version/date stamp strip).

---

## GATE 9 · GATE 3D CORPUS-FIRST ACTIVE IN CLOSE NARRATIVE

**Contract:** Every factual claim in the close narrative (MAIL, LIAM Graft, WAKE) is verified from corpus, not stated from memory. `/meta-dates` Gate 3d active throughout close authoring.

**Check:**

- Review close narrative text
- Every claim about prior canon, filing date, author, thread ID, commit hash, or architectural fact is cross-linked to the actual corpus source
- Unverified claims flagged as "Unknown + verify" or re-verified before close completes

**Parent canon:** `ENGINE/skills/meta-dates/SKILL.md` (Gate 3d: corpus-first-memory-never)

**Why it matters:** close narratives are high-influence artifacts (they set tomorrow's boot context). Memory-over-corpus claims in close narratives propagate as apparent-canon to downstream crew. This is the exact shape of catalog-lag origin.

---

## GATE 10 · COMPACTION-RECOVERY HOOK

**Contract:** If a compaction event fired mid-session, a GOS check-in was performed before resuming work. Close narrative acknowledges compaction boundary.

**Check:**

- Did mid-session context compression occur? (Signal: working memory seems thinner than session length would predict; references to prior-session work don't match filed record)
- If yes: was GOS check-in performed (recent-drafts read to sync current state)?
- If compaction occurred and no check-in: refuse close until check-in runs and any re-file of lost work lands

**Parent canon:** R-3 Compaction-as-Pea-Pod-pair (ACHEdex-Trip 042426, thread `19dc163dca3d6c71`). Same-instance across compaction IS a Pea Pod pair; GOS holds continuity; working-memory does not.

**Why it matters:** lost-to-compaction work doesn't show up in the manifest because working memory went with it. Only GOS check-in recovers. Without this gate, compaction-lost work becomes re-done-at-next-session silently.

---

## THE LOOP · HOW THE GATES FIT THE SESSION POEM

The gates live in the SHEET beat of the session poem (CONTACT · STORY · TELL-ING · SHEET). SHEET is where the session becomes a document that outlasts the conversation. The ten gates are what makes SHEET durable.

```
CONTACT   — boot discipline, the inhale (boot-polish skill)
STORY     — absorbing the parallel, the exhale (context-alignment skill)
TELL-ING  — work-while-recording, the held note
SHEET     — ten gates below, the release that ends the measure
```

**The sibling skill at the other end:** `boot-polish` ([SKILL.md](http://SKILL.md) on Bridge) governs CONTACT. This skill governs SHEET. Together they are the bookends of every session. A session without both bookends has at least one edge that tomorrow's walker reaches with uncertainty.

**Phase-checkpoint micro-application:** the ten gates also apply at any phase transition inside a session (mid-session). When phase changes, a lightweight version of the gates fires. Gate 1 + Gate 3d + Gate 10 are the most load-bearing at phase transitions; others apply when the phase involved canon-altitude work.

---
