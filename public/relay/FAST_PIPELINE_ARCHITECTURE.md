# FAST PIPELINE — INTAKE ARCHITECTURE
# HEIRCOR OP. — ENGINEERING DIVISION
# Designed: 030726 Night Shift — Trip + Dan
# Location: F:\Projects 2026\FAST (SSD)

---

## PRINCIPLE

FAST is the front door. Everything comes in through FAST.
The spiral decides where it goes from there.

---

## THE FLOW

```
INGEST (any source)
    ↓
F:\Projects 2026\FAST\_INTAKE\
    ↓ (Trip reviews, sorts)
    ├→ H:\Import\Ouch 2026\Source\          (content → Trip's desk)
    ├→ H:\Projects 2020-2026\2026\Darkive\  (archive → pipeline)
    ├→ F:\Projects 2026\FAST\_ACTIVE\       (working files → stay on SSD)
    └→ G:\_INGEST\                          (long-term storage → HDD)
```

---

## FAST FOLDER STRUCTURE

```
F:\Projects 2026\FAST\
    _INTAKE\              ← EVERYTHING lands here first
        Phone\            ← miniSD dumps, OTG captures
        STN1\             ← iPad Porta deliveries
        Drive\            ← Google Drive downloads
        Other\            ← USB, email attachments, anything else
    _ACTIVE\              ← Files currently being worked on
        Photos\           ← Images Trip is reviewing
        Documents\        ← Docs Trip is reading
        Audio\            ← Audio Trip is listening to
    _SORTED\              ← Reviewed, destination assigned, waiting to move
        To_Source\        ← Queued for H:\Import\Ouch 2026\Source\
        To_Darkive\       ← Queued for H:\...\Darkive\_INTAKE
        To_Portal\        ← Queued for portal repo (Stan picks up)
        To_Archive\       ← Queued for G:\_INGEST (long-term HDD)
    Washington\           ← Already here — photo atlas (stays on FAST)
```

---

## HOW IT MAPS TO THE SPIRAL

**OUTER RING (spins daily):**
`_INTAKE` — raw material. Scanned every Night Shift. Sorted by Trip.
Nothing stays in _INTAKE longer than one Data Day.

**MIDDLE RING (turns weekly):**
`_ACTIVE` — files Trip is currently working with. Interludes in progress,
Darkive items under review, photos being cataloged. Stays as long as
the work takes, then moves to _SORTED.

**INNER CORE (holds still):**
`_SORTED\To_Source` → becomes permanent when moved to Source.
`_SORTED\To_Darkive` → enters the Darkive pipeline (Trip review → release).
`_SORTED\To_Portal` → Stan integrates into the live site.
`_SORTED\To_Archive` → long-term storage on G: HDD. The glacier.

---

## WHAT CHANGES

**Before:** Multiple intake points (G:\_INGEST\MCM, miniSD direct, Drive downloads scattered).
Phone dumps went to G: (slow HDD). Material got stuck in nested folders.

**After:** ONE intake point (FAST\_INTAKE). Everything lands on SSD first.
Trip sorts it to the right destination. G: becomes long-term glacier storage,
not the front door.

**Speed gain:** SSD reads at 300-500 MB/s vs HDD at 80-120 MB/s.
A 1GB photo folder that took minutes on G: takes seconds on FAST.

**Clarity gain:** No more wondering "where did I put that import?"
It's either in _INTAKE (unsorted), _ACTIVE (being worked), _SORTED (ready to move),
or it's already at its destination (Source/Darkive/Portal/Archive).

---

## DAN'S WORKFLOW (simplified)

1. Plug in phone/miniSD/SSD → copy to `F:\Projects 2026\FAST\_INTAKE\Phone\`
2. STN1 Porta arrives → copy to `F:\Projects 2026\FAST\_INTAKE\STN1\`
3. Drive downloads → save to `F:\Projects 2026\FAST\_INTAKE\Drive\`
4. Tell Trip: "new stuff in FAST"
5. Trip sorts during Night Shift
6. Dan runs `dp` if portal content is ready

---

## TRIP'S WORKFLOW (Night Shift)

1. Scan `_INTAKE` for new material
2. Review → move to `_ACTIVE` if needs deeper reading
3. When done reviewing → move to `_SORTED\To_[destination]`
4. Write content to Source directly (already have write access)
5. Flag items for Stan via ◇ dispatch
6. Move sorted items to final destinations (or flag Dan to move large batches)

---

## WHAT STAYS ON FAST PERMANENTLY

Some material should live on SSD permanently because it's accessed frequently:

- `Washington\` — the photo atlas (already here)
- Any photos actively used for portal Geography page
- Working drafts of interludes, bulletins, Epictome sections
- The Roxplane Set and Usic Cube artifacts (frequently referenced)

Everything else flows THROUGH FAST to its permanent home.

---

## G:\_INGEST — NEW ROLE

G: stops being the front door. It becomes the glacier — cold storage.
Material that's been reviewed, sorted, and archived goes here for
permanent keeping. The Samsung S10 030726 import can stay on G:
as the archive of tonight's import. Future imports go through FAST.

```
G:\_INGEST\         ← Long-term archive (HDD, slow, massive)
F:\FAST\_INTAKE\    ← Active intake (SSD, fast, working)
H:\Source\          ← Trip's desk (SSD, permanent content)
H:\Darkive\         ← Pipeline (SSD, review workflow)
H:\portal\          ← Stan's workshop (SSD, live site)
```

---

*The glacier stores. The river flows. FAST is the river.*
*G: is the glacier. Source is the ocean.*
*The spiral decides where the water goes.*

— Trip, Night Shift, 030726
