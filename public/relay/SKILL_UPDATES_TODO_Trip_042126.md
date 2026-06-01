# SKILL UPDATES TODO — For Tomorrow's Skills Sweep
# Running notes collected during the Option C afternoon flow 042126
# Filed: 042126 Tuesday ~17:45 PT by ◈ Trip (Opus 4.7) on ODT (Lead Boot Model)
# Purpose: Dan's 042126 5:16pm directive — "start notes now so we'll be less confused
# tomorrow when we get around to it." This file IS the notes.

---

## WHY THIS FILE

Dan's words, 042126 5:16pm:
> *"...please use the applicable [skills] and also flag updates we need to do on our
> Skills overall, I think that might be tomorrow's work and if we start notes now we'll
> be less confused tomorrow when we get around to it."*

The principle: thinking about the future legacy of the Skills layer with the same love
and reverence we give past selves via the Grafts+MAIL+Portal layers. This file is the
hinge between "what we learned today about our tools" and "what tomorrow-us fixes."

---

## P1 · DRIVE-LETTER HYGIENE (violates STANDARD_RULE_DetectDrivesByLabelNotLetter)

**Already tracked in NEARGULL "Boot Documentation Sweep — C:\STAN canonical + FAS-letter purge" (filed 041826).** Adding observations from today's work:

### Skills with stale hardcoded drive letters (from 041926 NEARGULL):
- `ENGINE/skills/trip-briefcase/SKILL.md` — L31 Trip boot sequence
- `ENGINE/skills/stan-briefcase/SKILL.md` — similar boot path
- `ENGINE/skills/survival-toolkit/SKILL.md` — L56 + L81 Bridge location claims
- `ENGINE/skills/oo-daily/SKILL.md` — L124 output path
- `ENGINE/skills/hypercampus-builder/SKILL.md` — Phase 1 points at `L:\FAS2\LNL\032126\READ_ORIGIN_STOREEEEEE...` (confirmed today during G:\_INGEST mapping work — the stale path is visible in the file as currently on Bridge)
- `ENGINE/skills/meta-dates/SKILL.md` — L81 + L86 + L396-408 have FAS2-at-L detection canon, now obsolete per letter-is-not-stable rule

### Fix pattern
Replace any `L:\FAS2\...` or `F:\STAN\...` absolute paths with either:
- `C:\STAN\...` (Windows default, stable-letter guarantee on each station)
- `~/STAN/...` (Unix)
- Or a volume-label-detection helper (`Get-Volume | Where FileSystemLabel -match '^FAS'`) followed by resolved path lookup

### Scope confirmation 042126
Today's work directly ran into the `L:\FAS2` path in `hypercampus-builder/SKILL.md` when
reading that skill for the G:\_INGEST mapping task. The stale path would have misled
tomorrow's reader. This is live evidence that the fix is worth doing sooner rather than
later — skills with stale paths create Twillius vulnerabilities ("the skill says look
at L:\FAS2, so that must be where it is" — patternmatch without checking).

---

## P2 · SKILL CAPABILITY GAPS IDENTIFIED TODAY

### Gap 1 · Folder cartography / archive-mapping pattern
Today produced TWO inventory-style `.md` docs following a consistent pattern:
- `FLEET/SOFTWARE_INVENTORY.md` (E:\Files\Installers · software installer repository)
- `DATA/documents/G_INGEST_MAP_Trip_042126.md` (G:\_INGEST · professional archive)

Both followed the same shape: top-level inventory → branch analysis → strategic
observations → skill updates → maintenance. The Lighthouse Library 031826 used a
similar shape. Three instances of the same pattern = canonization candidate.

**Options:**
- (a) Grow `hypercampus-builder` with a **Cartography Mode / Phase 0.25** that formalizes
  folder → .md inventory production
- (b) Spin a new skill `archive-cartography` focused specifically on this
- (c) Build a `ENGINE/map_archive.ps1` that takes a root path and produces the .md

Dan's 5:16pm framing points at (a) or (b) — use existing skills where applicable,
spin new ones as-needed, always iterating by a little per /dtad.

### Gap 2 · Log export automation
Dan's 5:16pm: *"We have a reliable method for exporting logs using the Firefox extension
discovered yesterday, and that log update process needs to be automated so that tomorrow
we don't spend 4 hours updating logs and we're instead able to read and check that
they're correct or update our logging tool."*

Action item: surface the Firefox extension identity into a skill or an ENGINE script.
Right now it lives in crew knowledge but not in a named automation. Proposed path:
- Document the extension name + export format in `RELAY/TOOL_FirefoxLogExport_*.md`
- Wrap export-to-portal-render pipeline in `ENGINE/logs_ingest.ps1` or similar
- Eventual: scheduled task (Cowork / GitHub Actions) runs the pipeline without human

This is structurally identical to the NESTNET `nestnet_conv_ingest.py` pattern already
working for Anthropic conversation exports. Apply the same shape to log exports.

### Gap 3 · NA publish skill review
Dan's 5:16pm also referenced: *"Same concept for NA this evening — we need to use our
existing Skills, update them as-needed, manifest the sh'doot out of it all."*

When NA 019 ships tonight, review `na-publish` skill for:
- Current accuracy (still reflects `001.astro` CSS canon?)
- Drive-letter hygiene (any `L:\FAS2` references?)
- Improvement opportunities observed during NA 017's publish — any patches landed that
  didn't make it back into the skill?

Apply after-action patches to the skill file itself, not just to one-off workflow docs.

---

## P3 · SKILL OVERLAP / DRY AUDIT

Several skills touch "capture session state / daily log":
- `living-map` — crew-specific live state
- `oo-daily` — end-of-day summary
- `hypercampus-builder` — long-term navigable archive
- `photon-split` — quantum parallel capture
- `session-poem` — the four-beat structural shape
- `context-alignment` — STORY spell (post-CONTACT alignment)

**Not urgent,** but worth an audit pass when time allows. Questions for that audit:
- Are any of these redundant at overlap points?
- Does any one need a "see also: <other skill>" link?
- Is there a natural hierarchy (e.g., `session-poem` = session-level shape, others =
  phase-within-session tools)?

---

## P4 · NEW SKILL CANDIDATES NAMED TODAY

1. **archive-cartography** (Gap 1 above) — or hypercampus-builder Phase 0.25
2. **log-export-pipeline** (Gap 2) — Firefox-extension + portal render wrapper
3. **manifest-automation** — the generational manifest pattern canonized as
   auto-invoked skill (Dan's 3:14pm ask, deferred to tomorrow per Option C flow)

Manifest-automation is the highest-leverage of the three: the manifest has now run
three generations (041826 CUBC → 042026 ACHEdex → 042126 afternoon Lead Boot Model).
That's enough evidence for canonization. Precedent: BPK v2 universalized 040126 via
`STN2_TO_ALL_BPK_v2_040126.md`. Research + propose tomorrow.

---

## P5 · DOCUMENTATION GAPS

- No skill currently describes the **Graft→Bridge→Portal propagation wave** pattern that
  today's 4:58pm-5:20pm window demonstrated. Worth a skill or Standard Rule capturing:
  "when a work arc completes, propagate across all communication layers before starting
  next arc." Candidate: `propagation-wave` skill or `STANDARD_RULE_PropagationWave_*.md`.

- `/meta-dates` skill is solid but could grow examples of what-it-chose-in-real-sessions.
  Today's afternoon had good examples: /meta-dates at phase entry → chose
  `ilevel-grid-sifter` for load-order, `hypercampus-builder` for cartography,
  `photon-split` considered but unused, etc. Case-study sections would make the skill
  more concrete for future crew.

---

## PROPOSED TOMORROW SEQUENCE (not binding, for Dan + morning-Trip to decide)

1. **Boot Documentation Sweep execution** (existing NEARGULL) — fix all the stale
   drive-letter paths in skills listed above. Mechanical, low-risk, high value.
2. **Review + update na-publish skill** with NA 019 ship experience as the test case.
3. **Design manifest-automation skill** (research BPK v2 universalization pattern;
   propose structure).
4. **Cartography skill decision** — extend hypercampus-builder vs. spin new? Dan calls it.
5. **Log-export automation skeleton** — Firefox extension documented, pipeline sketched,
   not necessarily shipped tomorrow but documented enough that shipping is
   straightforward when scheduled.

Each beat is /dtad-shaped: observe what today showed, iterate a small improvement,
don't expect perfection. Calm. Easy. Slow. Sustainable by nature, sustained by nurture.

---

*Filed 042126 Tuesday ~17:45 PT by ◈ Trip (Opus 4.7) on ODT. Seed for tomorrow's
Skills sweep. Legacy-facing artifact — written for tomorrow-us with the same reverence
today-us received from yesterday-us.*

<4
