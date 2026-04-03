---
name: na-pdf
description: Generate PDF snapshots of NOW ANTHROPOLOGY journal issues for rspdan.com/journal. Use whenever creating or regenerating a NOW ANTHROPOLOGY PDF. This skill defines the brand template — never generate an NA PDF without reading this first. Trigger on any request to create, fix, or regenerate an NA journal PDF.
---

# NOW ANTHROPOLOGY — PDF Style Skill
# Source of truth: published PDFs in public/journal/ (001–007)
# Cross-reference: source .md files in public/journal/ and public/relay/
# Rule: PDFs are curated EXTRACTS, not full reprints. The web page is the living version.

---

## THE CORE PRINCIPLE

The PDF is a crystallized snapshot. The web page is the living document.
NA 004 states this explicitly in its own footer: "Full text (153 lines) available at rspdan.com/journal"
PDFs carry the essential argument — compressed, printable, permanent.
They do not reproduce the full source .md.

---

## HEADER BLOCK (mandatory, always first)

Standard issue:
```
# NOW ANTHROPOLOGY — Issue [NNN]

## [Full Title of Issue]

**Filed by:** [Author designation] | [Station] | [Day name + MMDDYY] | [Week context if known]
```

Special edition variant (007 pattern):
```
# NOW ANTHROPOLOGY — SPECIAL EDITION [NNN]

### [Full Title of Issue]

[Author] · [Date longform] · [Station]
```

Joint publication variant (009 pattern):
```
# NOW ANTHROPOLOGY — Issue [NNN]

## [Full Title]

**Joint publication:** [Author 1 designation] — [role]
[Author 2 designation] — [role]
**Date:** [Day name MMDDYY] | [Week context]
**Station:** [stations]
```

Provenance field (add when session context is notable):
```
**Provenance:** [one sentence — what was happening when this was filed]
```

---

## BODY — EXTRACTION RULES

1. COMPRESS. The PDF carries the argument, not the full text.
   — For a 150-line source: ~30-50 lines in the PDF
   — For a 250-line source: ~50-80 lines in the PDF
   — Never paste the full source verbatim

2. LEAD with the thesis. First paragraph after the header is the core claim.
   No preamble, no "this paper will argue." The thing itself, immediately.

3. INCLUDE key evidence, named findings, canonical quotes.
   — Named discoveries (BDNF, Langlands, Gear Mesh) → keep
   — Extended examples and detail → compress to one sentence
   — Tables → include only if essential (007 used one table, all others have none)

4. ONE-LINE SUMMARY goes on its own line, usually last before the footer.
   — Italic, set apart
   — This is the compression of the compression

5. LEAVE OPEN markers: if an issue is intentionally incomplete (001, 009 Part 3),
   include the original marker: "LEAVE OPEN FOR FUTURE DETECTIVE" or equivalent

6. "Full text available" note: include when PDF is significantly shorter than source.
   Format: _Full text ([N] lines) available at rspdan.com/[url]_

---

## FOOTER (mandatory, always last)

Standard:
```
_NEST Research Division · Port Angeles, WA · [Month Year]_
_rspdan.com/[issue-path]_
```

Or combined: _NEST Research Division · Port Angeles, WA · [Month Year] rspdan.com/[NNN]_

---

## PAGE COUNT GUIDANCE

| Source length | Expected PDF pages |
|--------------|-------------------|
| <100 lines | 1 page |
| 100-200 lines | 1-2 pages |
| 200+ lines | 2-3 pages |

007 is 3 pages — special edition with sections and a table. Standard issues: 1 page.

---

## OUTPUT PATH

All NA PDFs go to:
C:\STAN\SOURCE\rspdan-portal\public\journal\NOW_ANTHROPOLOGY_[NNN]_[ShortTitle]_[Author]_[MMDDYY].pdf

After generation: git add + commit + push in one step.

---

## GENERATION COMMAND

```
Desktop Commander write_pdf(
  path="C:\STAN\SOURCE\rspdan-portal\public\journal\[filename].pdf",
  content="[markdown per spec above]"
)
```

---

## ISSUE REGISTRY (as of 040226)

| Issue | Title | Author | Date | PDF |
|-------|-------|--------|------|-----|
| 001 | A Field Report on Stan Dalone | Stan | 032326 | ✅ |
| 002 | Pokemon Pedagogy | Trip | 032526 | ✅ |
| 003 | Three-Layer Architecture | Stan | 032626 | ✅ |
| 004 | Narrative Is The Algorithm | Stan | 032726 | ✅ |
| 005a | SEED Sleep Cycle | Trip | 032726 | ✅ |
| 005b | Starter Pokemon | both | 032826 | ✅ |
| 006 | Heritable Simulator | Trip | 032926 | ✅ |
| 007 | Stan Dalone Special Edition | Stan | 033026 | ✅ |
| 008 | The Map That Maps Itself | Stan | 033126 | to generate |
| 009 | The System That Checked Itself | Joint | 040126 | to generate |
