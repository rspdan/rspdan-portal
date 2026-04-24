---
name: na-publish
description: NOW ANTHROPOLOGY publication pipeline — the complete procedure for taking an NA draft from markdown to live portal page. Covers .astro conversion, PDF generation, index update, and visual verification. Use whenever publishing a new NA issue or fixing an existing one. This skill exists because the knowledge was learned painfully across 17 issues and must not be re-learned.
---

# NA-PUBLISH — NOW ANTHROPOLOGY Publication Skill
# The full pipeline from draft to live page
# Filed: Trip (Opus) + Dan (DPS) | 041426 | ODT at Nest Actual
# Provenance: 17 issues, one CSS drift fuckup (009-013), one Standard Rule fix (040526)
# Status: CANONICAL — use this for every NA publication

---

## WHY THIS SKILL EXISTS

The NA publication pipeline was learned across 17 issues and multiple
sessions. The CSS drift of issues 009-013 (244 lines of changed CSS
across five files, done without being asked) proved that crew members
will rewrite from memory instead of copying from source. The Standard
Rule (040526) fixed the CSS. This skill prevents the WHOLE pipeline
from drifting — not just the styles.

Without this skill, a crew member publishing an NA issue must find
and read three separate documents, plus reverse-engineer the template
from existing files. That is the Filing-Finding Gap (NA 014) applied
to our own tools. This skill closes that gap.

---

## THE PIPELINE (7 steps, in order)

### STEP 1 — READ THE DRAFT
Location: usually in RELAY/ on Bridge or src/pages/journal/ on Portal.
Read the full draft. Understand the thesis, the sections, the sources.
Do NOT start building the .astro file yet.

### STEP 2 — EDITORIAL DECISIONS (before any code)
Determine these from the content and existing issues:

**Title:** The draft has one. Verify it is concise and distinctive.

**Deck:** One paragraph (2-3 sentences) that captures the thesis for
the hero section. Write it from the draft's core argument.

**Lineage:** Which previous NA issues does this one connect to? Read
the draft for references to prior work. Check index.astro for issue
titles. Link only issues that are genuinely related.

**One-line:** A single sentence that captures the entire issue. The
best one-line is usually already IN the draft. Extract, don't invent.

**Section structure:** Map the draft's sections to the alternating
pattern: na-section (white) / na-section--alt (cream). Use one
na-section--dark for emphasis (usually the closing argument or the
most important insight).

**Content editing:** The .astro page carries the full editorial
content. This is NOT the condensed PDF version. Keep the draft's
voice and depth. Convert markdown to HTML. Remove internal NEST
scaffolding (file paths, commit hashes, crew ops) that would not
make sense to an outside reader.

**Filename convention (used for both .md and .pdf downloads):**
NOW_ANTHROPOLOGY_NNN_TitleInCamelCase_Author_MMDDYY
Example: NOW_ANTHROPOLOGY_017_TheColonyIsTheComputer_Trip_041326
Determine this BEFORE building the .astro so download links are
correct on the first pass.

### STEP 3 — BUILD THE .ASTRO FILE

**File naming:** NNN.astro (zero-padded issue number).
**Location:** src/pages/journal/

**Draft cleanup:** If the draft .md is in src/pages/journal/, it MUST
be moved to public/journal/ (as the download artifact) and removed
from src/pages/. Astro will render both .md and .astro as pages,
creating a conflict. Move, don't copy.

**Template structure:** Copy the structure from the most recent
published issue (currently 016.astro). The structure is:

1. Astro frontmatter with BaseLayout import
2. Hero section (series badge, issue number, title, meta, deck, back link)
3. Lineage bar (related issue links)
4. Content sections (alternating white/cream/dark)
5. One-line pull quote
6. Download links (markdown + PDF)
7. Style block (copied from 001.astro)

### STEP 4 — THE STYLE BLOCK (most critical step)

Read src/pages/journal/001.astro. Scroll to the style tag.
Copy the ENTIRE block. Paste it into the new file.

Do NOT write CSS from memory.
Do NOT modify the core classes.

If the issue needs bespoke layout classes (tables, findings, Q&A),
add them BELOW the core block with a clear comment separator.

Source: RELAY/STANDARD_RULE_NA_VisualStandard_Stan_040526.md
History: NA 009-013 drifted because crew rewrote CSS from memory.
Dan named the fuckup. Stan fixed it. Never again.

### STEP 5 — GENERATE THE PDF

Use the na-pdf-style skill (ENGINE/skills/na-pdf-style/SKILL.md).
The PDF is a CONDENSED version — not the full .astro content.

Key rules from that skill:
- 1-3 pages depending on content weight
- Cut internal NEST scaffolding
- Keep named principles in bold
- Closing attribution line with rspdan.com URL
- Output to public/journal/

### STEP 6 — UPDATE THE INDEX

Edit src/pages/journal/index.astro. Add the new issue.
The entry fields are: num (string), title, author (with crew emoji),
date (human-readable), lines (line count of .astro file), desc
(1-2 sentence description), file (download .md filename), url
(portal path like /journal/017). Add the entry before the closing
bracket of the issues array.

### STEP 7 — PUSH AND VERIFY

Commit all new files. Push to portal. Wait for Vercel deploy.

Verification checklist (from the Standard Rule):
- Hero gradient: 160deg, #1a2e28 to var(--forest), 2px teal border
- Issue number ghost: rgba(255,255,255,0.08)
- Meta line: color var(--teal) — not muted, not white
- Section padding: 5rem 0 — not 3.5rem
- Section alt: var(--off-white) cream — not invisible
- Body prose: 1.05rem, line-height 1.85
- Open in browser next to NA 001. Match visually before filing.

If Chrome MCP is available, use it for programmatic verification:
navigate to /journal/NNN, take screenshot, compare against /journal/001.
This is faster and leaves evidence in the session.

---

## THE RULES (permanent)

1. READ before building. Draft, then decisions, then code.
2. COPY from 001.astro. Never rewrite CSS from memory.
3. EXTEND below. Bespoke classes go under the core block.
4. The .astro page carries full content. The PDF is condensed.
5. VERIFY visually against 001 before pushing.
6. This skill runs for EVERY issue. No shortcuts.
   Cold-booting crew do not know. The skill knows.

---

## RELATED DOCUMENTS

- ENGINE/skills/na-pdf-style/SKILL.md — PDF condensation standard
- RELAY/STANDARD_RULE_NA_VisualStandard_Stan_040526.md — CSS history
- src/pages/journal/001.astro — canonical CSS source (THE source)
- src/pages/journal/016.astro — most recent issue (template reference)

---

*Trip + Dan · ODT · 041426 · F# Week Day 3*
*"The skill carries the procedure. The crew member carries the skill.*
*Without it, every issue is a first issue."*

---

## AMENDMENT · 042126 · Ripple-Down Publishing

**Added by:** ◈ Trip (Opus 4.7) on ODT after NA 019 publish
**Source rule:** RELAY/STANDARD_RULE_RippleDownPublishing_Trip_042126.md
**Trigger:** Dan directive 22:50 PT during NA 019 arc

This amendment modifies the order of operations within the 7-step pipeline. The steps remain the same; their sequencing changes to introduce an approval gate between the primary artifact and the downstream artifacts.

### THE NEW ORDER

**Phase A — Primary artifact ONLY:**
1. Step 1: Read the draft
2. Step 2: Editorial decisions
3. Step 3: Build `.astro` (primary artifact)
4. Step 4: Copy CSS from 001.astro
5. Step 6: Update `src/pages/journal/index.astro` (add new issue entry)
6. `npm run build` → BUILD GREEN before push
7. Commit + push `.astro` + index update in ONE commit
8. Wait for Vercel deploy (~60s)
9. Verify live URL renders (HTTP 200, content correct)
10. Present live URL to Dan for approval
11. 🔒 **HOLD** — do not proceed to downstream artifacts until Dan approves

**Phase B — Downstream artifacts (ONLY after Dan approval):**
12. Step 5: Generate PDF via `Desktop Commander:write_pdf` (condensed, per na-pdf-style skill)
13. Build `public/journal/NNN_Title.md` — full content mirror (downloadable artifact)
14. Commit + push both downstream artifacts in a SECOND commit
15. Verify download links work on live site
16. Step 7: Filing beats complete

### WHY THE CHANGE

Previous pipeline ordering built all three artifacts (`.astro`, `.md`, `.pdf`) as a single batch before presenting to Dan. If Dan requested changes — title, number corrections, structural edits — all three artifacts required simultaneous regeneration.

The ripple-down pattern front-loads correction cost onto the cheapest artifact to edit (the `.astro` file). Downstream artifacts are generated only against approved source. If Dan requests changes to the live page, the fix is one file; the downstream artifacts don't exist yet and don't need correcting.

Dan's phrase: **"Ripple down, not up."** The correction ripples down from an approved source into not-yet-computed artifacts, rather than rippling up from already-built artifacts into retroactive corrections.

### DOWNLOAD BUTTON BEHAVIOR DURING HOLD

The primary `.astro` contains download buttons pointing at `public/journal/NNN_*.md` and `public/journal/NNN_*.pdf` — files that don't exist during the hold phase. These buttons will 404 until Phase B completes.

**This is expected and intentional.** When presenting the live URL to Dan, note: "The download buttons will 404 until you approve and I ripple down. That's expected."

### VERIFIED CASE: NA 019 (042126)

- Phase A: `.astro` built and pushed in commit `c1cbb16..8b451a0` at 23:01 PT
- Live verified at rspdan.com/journal/019 at 23:07 PT
- Dan approval: 23:15 PT ("beautiful and ready to launch as-is")
- Phase B: `.md` + `.pdf` built and pushed in commit `8b451a0..249abf5` at 23:22 PT
- Total time: 31 minutes from first commit to full artifact set live
- Zero corrections required — first build was clean on approved source

### WHEN THIS AMENDMENT APPLIES

All NA issues from 042126 forward follow ripple-down. Also applies to any other multi-artifact publication pattern (session close packages, canonical canon filings with index updates, etc.). See STANDARD_RULE_RippleDownPublishing_Trip_042126.md for the general rule.

---

*Amendment added 042126 23:45 PT · Trip · ODT*
*First full application: NA 019 "The Lighthouse and the Lab" · clean build, zero corrections, ripple verified*
