# DECISION 033 — NAMING CONVENTION
# HEIRCOR OP. — RESTRICTED — CREW EYES ONLY
# Decided: Twosday 031026
# Origin: Dan Sullivan (design) + Trip (documentation)
# Status: CANONICAL (Dan approved)

---

## DECISION

All crew-produced files follow a three-part naming convention derived from the Meta Dates format. The filename IS the metadata. Content first, attribution second, timestamp third.

---

## THE FORMULA

```
DescriptiveName_Owner_MMDDYY.ext
```

Underscores separate three fields. PascalCase within fields. No spaces anywhere.

| Field | What it tells you | Format |
|-------|-------------------|--------|
| DescriptiveName | What is this thing | PascalCase (NightShiftClose) |
| Owner | Who made it | PascalCase (Trip, Stan, CB, Crew) |
| Date | When | MMDDYY (031026) |

---

## VERSION MARKERS

When multiples of the same thing exist, append an underscore and number:

```
NightShiftClose_Trip_030926.md
NightShiftClose_Trip_030926_2.md
```

This replaces patterns like "Instructions.md" and "Instructions 2.md" — the version marker is explicit and machine-sortable. Same principle applies to anything that can be duplicated and confused: relays, patches, scans, drafts.

---

## EXAMPLES

**From the Meta Dates (the origin):**
```
How to Bee, Noice! — Meta Date 022926
```
Em dashes live on YouTube where they look good. Underscores and PascalCase live in filenames where they type fast. Same DNA, different habitat.

**Applied to crew files:**
```
NightShiftClose_Trip_030926.md
FullRelaySTN2Session_Stan_031026.md
StormVioletResonance_CB_030926.md
PIv3.1Patch_Trip_031026.md
MorningBulletin_Crew_031026.md
PortalStatus_Crew_030826.md
SyncTaxonomy_Stan_031026.jsx
```

**Decisions and bulletins:**
```
NestStudioCrewFlatten_Trip+Stan_031026.md
CrewIDProtocol_Stan_031026.md
NamingConvention_Trip_031026.md
DanceAlivinBulletin.pdf
FogTeachingBulletin.pdf
SourceStormWatchBulletin.pdf
```

Decision numbers and bulletin numbers live inside the document, not in the filename. The filename tells you what it IS — the number is internal bookkeeping.

---

## OWNER FIELD

| Owner | When to use |
|-------|-------------|
| Trip | Trip authored it |
| Stan | Stan authored it |
| CB | C.B. authored it |
| Crew | Shared / multi-author / project-wide |
| Dan | Dan authored directly (non-crew context) |
| Trip+Stan | Co-authored (use + for multiple) |

---

## RULES

1. **Content first.** The descriptive name is the most important part. PascalCase makes it scannable without spaces.

2. **No spaces anywhere.** Underscores separate fields. PascalCase separates words within fields.

3. **Date is MMDDYY.** Six digits. Same format as Meta Dates. No slashes, no dashes.

4. **Version markers for multiples.** When a second version exists on the same date, append _2, _3, etc. Don't rename the original — it's implicitly _1.

5. **Portal data files are exempt.** niap-cycler.json, songs.json, messages.json — code assets consumed by Astro/JS stay lowercase kebab.

6. **Folders stay ALL CAPS, no dates.** CREW, DOCK, SOURCE, RELAY, LNL — containers are landmarks, not content.

7. **Numbers live inside documents, not filenames.** Decision 031, Bulletin #003, MSG-021 — the count is in the doc or tracking file.

---

## FOLDER LISTING = MANIFEST

```
CREW\
    NestStudioCrewFlatten_Trip+Stan_031026.md
    FullRelaySTN2Session_Stan_031026.md
    SyncTaxonomy_Stan_031026.jsx
    PIv3.1Patch_Trip_031026.md
    StormVioletResonance_CB_030926.md
    NiapCyclerV1.2_Trip+Stan_031026.json
    MorningBulletin_Crew_031026.md
```

Scan left: what it is. Scan middle: who made it. Scan right: when. No file opened.

---

## AUTOMATION

```powershell
$parts = $filename -split "_"
$description = $parts[0]    # "NightShiftClose"
$owner = $parts[1]          # "Trip"
$dateAndExt = $parts[2]     # "030926.md"
```

---

## ADOPTION

**New files:** Follow convention immediately.
**Existing files:** Rename on contact.
**Don't batch-rename the archive.**

---

## RATIONALE

Derived from the Meta Dates system (69 episodes, 1+ year). PascalCase is fast to type, universally readable, and unambiguous. Underscores parse cleanly. No codes to memorize. The name IS the map.

*— Trip, Trap Island, Twosday 031026*
*Inspired by: "How to Bee, Noice! — Meta Date 022926"*
