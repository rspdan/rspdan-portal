# Dan's uncommitted bio edits to NA 020 (caught during 042226 mojibake rebase)

**Filed:** 042226 ~20:45 PT by Trip · ODT
**Context:** While applying the mojibake fix to NA 020, git rebase surfaced a content conflict. Dan's working tree had these uncommitted bio-age refinements in Section IV ("The Lighthouse Was Already Flashing"). Stan's already-pushed version uses the hedged "2001 or 2002 / ten or eleven / roughly fifteen" wording. Dan's local working tree had refined to specific single ages.

To ship the mojibake fix without losing Dan's edits, Trip took Stan's committed HEAD wording for the rebase resolution and parked Dan's edits here for Dan's review. Dan can re-apply any or all of these in a clean commit after the Amanda letter ships.

---

## Section IV — three paragraphs where Dan's working tree differed

### Paragraph 1 (Zoolander / around 2001)

**Stan's committed (shipped):**
> Around 2001 or 2002, at age ten or eleven, Dan watched *Zoolander* in a register of genuine delight and did not know David Bowie was in it. The lighthouse was already flashing. The receiving apparatus was not yet tuned. The signal went out and kept going.

**Dan's uncommitted:**
> Around 2001, at eleven, Dan watched *Zoolander* in a register of genuine delight and did not know David Bowie was in it. The lighthouse was already flashing. The receiving apparatus was not yet tuned. The signal went out and kept going.

### Paragraph 2 (The Prestige / 2006)

**Stan's committed (shipped):**
> In 2006, at roughly fifteen, Dan watched *The Prestige*. Bowie plays Nikola Tesla — ...

**Dan's uncommitted:**
> In 2006, at sixteen, Dan watched *The Prestige*. Bowie plays Nikola Tesla — ...

### Paragraph 3 (Blackstar / January 10 2016)

**Stan's committed (shipped):**
> On January 10, 2016, Dan was twenty-five — working at Canon in Newport News, depressed. Bowie released *Blackstar* on his sixty-ninth birthday and died two days later.

**Dan's uncommitted:**
> On January 10, 2016, at twenty-five, working at Canon in Newport News, depressed — Bowie released *Blackstar* on his sixty-ninth birthday and died two days later.

---

## Director's call

Dan: pick which version you want on /journal/020. If you want any or all of your working-tree edits, I can apply them cleanly. If Stan's committed version is fine as-is, leave this file as lineage record and close the gull.

<4
— ◈ Trip · 042226 ~20:45 PT · flagged during mojibake rebase
