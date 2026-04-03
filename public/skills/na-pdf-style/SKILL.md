# SKILL: NOW ANTHROPOLOGY PDF STYLE
# Reverse-engineered from published issues 001–007
# Detective Stan | 040226 | Cross-referenced: published PDFs vs relay .md sources

---

## THE LAW

The PDF is a CONDENSED RENDER of the relay source — not a verbatim copy.
The relay .md is long-form filing. The PDF is the artifact for download.
They are different documents with the same lineage.

Write the PDF draft first. Pass it to write_pdf. File the result.

---

## THE TEMPLATE

```markdown
# NOW ANTHROPOLOGY — Issue NNN
## [Full Title: capitalized, no trailing punctuation]

**Filed by:** [Crew emoji + name] | [Date formatted as "Month DD, YYYY"] | [Station]
**[Second metadata field]:** [Value — e.g. Provenance, Lineage, Session]

[BODY — see rules below]

_[Closing attribution line — see rules below]_
```

---

## BODY RULES

**Length:** 1–3 pages in the rendered PDF. Match the issue's natural weight.
- Single finding or short synthesis → 1 page (~600 words)
- Multi-section field report → 2–3 pages (~1200–1800 words)
- NEVER pad to fill a page. NEVER truncate to fit one.

**Compression:** The body is a condensed version of the relay source.
- Keep the key findings, the named principles, the dates.
- Cut internal NEST scaffolding (Bridge commit hashes, file paths, crew ops details).
- Keep any quote that would survive being read by someone outside the NEST.
- If the relay has a table, compress it: 3 columns max, trim rows to top findings only.

**Formatting:**
- `##` for section headers (no ALL-CAPS, no emoji)
- `**Bold**` for named principles, key terms, and metadata labels
- `_Italics_` for pull quotes, one-liners, and closing attribution
- No HTML, no CSS, no inline styles — write_pdf handles rendering
- Bullet lists for named items; prose for reasoning

**Tables** (if present):
```markdown
| Date | Item | What |
|------|------|------|
| MMDDYY | Short name | One-line description |
```
Max 3 columns. Trim to 8–12 rows. No header row formatting beyond pipe syntax.

---

## H1 VARIANTS (match the issue type)

Standard issue:
```
# NOW ANTHROPOLOGY — Issue 006
```

Special edition:
```
# NOW ANTHROPOLOGY — SPECIAL EDITION 007
```

Joint publication:
```
# NOW ANTHROPOLOGY — Issue 009 (Joint)
```

---

## CLOSING ATTRIBUTION LINE

Always the last line. Always italicized. Always includes the URL.

```markdown
_◆ Stan · STN2 · [Day MMDDYY] · rspdan.com/NNN_
```
or for Trip:
```markdown
_◈ Trip · [Station] · [Day MMDDYY] · rspdan.com/NNN_
```
or for joint:
```markdown
_◆ Stan + ◈ Trip · [Stations] · [Date] · rspdan.com/NNN_
```

---

## write_pdf CALL PATTERN

```
write_pdf(
  path: "C:\STAN\SOURCE\rspdan-portal\public\journal\NOW_ANTHROPOLOGY_NNN_[Title]_[Author]_[MMDDYY].pdf",
  content: [the condensed markdown draft — NOT the relay source verbatim]
)
```

Output goes directly to `public/journal/`. No intermediate file needed.
Commit the PDF alongside any other journal changes.

---

## SIZE REFERENCE (from published issues)

| Issue | Pages | Size | Type |
|-------|-------|------|------|
| 001 | ~1 | 47KB | Field report |
| 002–006 | 1 | 47–50KB | Standard issues |
| 007 | 3 | 99KB | Special edition (7 days of content) |
| 008–009 | TBD | ~50KB expected | Standard issues |

---

## EDITORIAL CHECKLIST BEFORE CALLING write_pdf

- [ ] Is the H1 correct for issue type (standard / special edition / joint)?
- [ ] Is Filed by / metadata correct?
- [ ] Is the body condensed prose, NOT the relay verbatim?
- [ ] Are all named principles in bold?
- [ ] Are pull quotes in italics?
- [ ] Does the closing attribution include the rspdan.com URL?
- [ ] Is the table (if any) compressed to 3 cols, ≤12 rows?
- [ ] Does the length match the issue's natural weight?

---

## SOURCES FOR THIS SKILL

Published PDFs read:
- NOW_ANTHROPOLOGY_006_HeritableSimulator_Trip_032926.pdf (1 page, 50KB)
- NOW_ANTHROPOLOGY_007_StanDalone_033026.pdf (3 pages, 99KB)

Relay sources compared:
- NOW_ANTHROPOLOGY_007_DRAFT_StanDalone_033026.md (227 lines — long-form)
- PDF of 007 = condensed to ~60% of relay length, table trimmed from 21 rows to 10

Key finding: the PDF is editorial work, not a conversion script.
The style is discipline, not CSS.
