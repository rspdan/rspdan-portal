# CORRECTION — FAS and ODT acronym expansions
# Filed: 041726 Foursday F# Week Day 6 · 12:08 PT · Trip (Opus) · STN2 at OHC
# Source: DPS direct correction 041726 ~12:00 PT

---

## THE CORRECTION

Past-Trip's 041326 NEARGULLs invented backronym expansions that are NOT what Dan said.

### WRONG (appearing in filed 041326 documents)

- "FAS = Fleet Attached Storage" (in `RELAY/NEARGULL_FAS_Restructure_041326.md`, `NEARGULL_FAS_Unification_041326.md`)
- "ODT = Origin Data Truth" or "Local Ground Truth" (in same)

### RIGHT (per Dan, 041726)

- **ODT = On DeskTop.** The desktop PC at Nest Actual. Literal, descriptive. Not an acronym loaded with architectural meaning.
- **FAS = FAST.** A speed designation — FAS drives are the FAST ones. Companion to SLO = SLOW.

### THE SLO / FAS PAIR

FAS and SLO are a pair that describe speed class, not role or architecture:

- **FAS devices** — the fast storage (FAS1/FAS2/FAS3 — NVMe SSDs)
- **SLO devices / connections** — the slow ones (examples below)

Dan's playful observation 041726: **SLO-LIB → SLO-PUB.** We've been calling the library WiFi connection "SLO-LIB" but we're actually pulling the school district's public WiFi (not the library's), so it really should be SLO-PUB. Same category either way — slow public link versus the Fleet LAN.

---

## WHY THIS MATTERS

The original NEARGULL framing ("Fleet Attached Storage" / "Origin Data Truth") loaded architectural meaning onto letters that just describe speed + location. That loading then drove a proposal to treat FAS drives as "go-betweens not homes" and ODT as "the archive anchor" — which Dan has not fully endorsed:

> Dan 041726 ~12:00 PT: *"I'm not sure how I feel about the FAS and ODT renaming."*

The functional proposal (consolidate to ODT, uniform FAS structure, etc.) may or may not still be right — but it should be argued on its own merits, not on invented acronym expansions.

---

## ACTION ITEMS

1. Update `RELAY/NEARGULL_FAS_Restructure_041326.md` and `RELAY/NEARGULL_FAS_Unification_041326.md` to stop claiming "Fleet Attached Storage" and "Origin Data Truth" as definitive expansions — either strike those lines or mark them as past-Trip's invention.
2. When the FAS/ODT design conversation resumes, anchor on the actual shared meaning (FAS = FAST, ODT = On DeskTop) and argue the architecture separately.
3. Flag SLO-LIB → SLO-PUB rename as its own small task.

---

## RELATED OPEN QUESTIONS (unresolved, carry forward)

- What design IS current for FAS drive folder structure? (4-folder uniform, 6-face FAS1-specific, or something else.) 041426 chat likely has the conversation; Bridge doesn't.
- Should there be a STANDARD RULE naming the acronyms explicitly so crew stops inventing expansions? Possibly file `STANDARD_RULE_AcronymInventory_Trip_041726.md` if the pattern repeats.

---

*Filed by Trip (Opus) at Dan's direct correction. The correction stands regardless of what the filed 041326 documents still say. When in doubt, FAS = FAST, ODT = On DeskTop, SLO = SLOW, and everything else is inference until Dan confirms.*
