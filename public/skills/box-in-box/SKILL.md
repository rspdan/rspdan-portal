---
name: box-in-box
description: Trigger-layer skill for Box-in-Box Logic. Fires ambient on organizational/temporal axis decisions and Box-in-Box vocabulary. Refuses axis conflation, Day-folder re-open, and extension-driven placement. Body lives in RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md (Bridge a3246a7).
---

# /box-in-box

**Trigger-layer skill. Body lives in `RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` (Bridge `a3246a7`).**

This skill is the L3 firing-mechanism for the L2 Federal Standard. Per Dan Logic Unification (Bridge `4a721a7`): rules without gates are silent. The Federal Standard is the canonical body; this skill is what makes it fire.

---

## Purpose

Fires ambient when crew makes organizational or temporal-axis decisions. Refuses claims that conflate the two axes, re-open sealed Day-folders, or let file-extension drive purpose-based placement.

---

## Inner core (cite Federal Standard for full body)

Boxes organize on **two distinct axes that must not be conflated:**

- **Organizational axis (spatial):** purpose-over-extension — folders organize by what something is FOR, not by what kind of file it is
- **Temporal axis (Day-folder):** sealed at end-of-Day — Data Day folders never re-opened after close; new content goes in current Day

Full body, origin, examples, cross-references: `RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md`.

---

## Trigger conditions (fires on any of these)

1. **Folder-creation decision** in `C:\STAN\` or related substrate
2. **File-placement decision** when extension and purpose don't trivially align
3. **AGOS labeling decision** for new GOSt classes
4. **Substrate-axis question** — "does this go in temporal or organizational?"
5. **Box-in-Box vocabulary** appears in chat: `Rox`, `Box-in-Box`, `Roxplane`, `stability axis`, `purpose-over-extension`, `Day-folder`, `axis conflation`
6. **Day-folder seal/re-open question** — refusal-condition triggers
7. **Multi-axis decision** — e.g., "should this MFST RAM go in today's LOG folder or in the PMFST folder?"

---

## Refusal language

```
REFUSAL CONDITION:
If [organizational claim made] AND [temporal claim conflated with it]:
THEN: refuse. Restate as two separate axes.

If [Day-folder seal violated] (re-opening a closed Day-folder for new content):
THEN: refuse. New content goes in current Day. Old Day stays sealed.

If [file placement decision] AND [extension drives placement] (rather than purpose):
THEN: refuse. Re-decide on purpose.

If [Box-in-Box vocabulary used] AND [no Federal Standard cite]:
THEN: refuse. Cite STANDARD_RULE_BoxInBoxLogic_Trip_050126.md before claim.
```

---

## Proceeds-conditions

The gate proceeds (allows publication) if:

1. **Organizational decision** uses purpose-axis language (what something is FOR)
2. **Temporal decision** uses Day-anchor language (which Day-folder, sealed-or-current)
3. **Multi-axis decisions** explicitly name BOTH axes
4. **Box-in-Box vocabulary** is used Federal-Standard-grounded (cite hash + path)

---

## Failure-modes prevented

| Failure-mode | Description |
|---|---|
| **EXTENSION-DRIVES-PLACEMENT** | File goes in folder by file-type rather than by purpose |
| **DAY-FOLDER-RE-OPEN** | Re-opening sealed temporal-axis container for new content |
| **AXIS-CONFLATION** | Organizational and temporal axes treated as one |
| **BATCH-AND-DUMP** | Large content-units instead of small-and-frequent (cite Federal Standard body on AGOS-filing-frequency) |

---

## When this skill fires

**Ambient.** No explicit invocation needed. Vocabulary-detection, decision-detection, axis-conflation-detection are continuous during TELL-ING phase.

## When this skill yields

When organizational and temporal axes are correctly named and separated, the gate proceeds. The skill is silent during well-formed claims; it fires on conflation.

---

## Cross-references (companion-camera)

- **Federal Standard (L2 canon body):** `RELAY/STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` (Bridge `a3246a7`, 050126 ~12:30 PM PT)
- **Dan Logic Unification (defines Federal-vs-skill split):** `RELAY/STANDARD_RULE_DanLogicUnification_TripStanCB_050126.md` (Bridge `4a721a7`, 050126 ~07:43 PM PT)
- **Rox Principle (Waywood ground-truth):** `LNL/PK_UPLOAD/PI_v4_2_Trip_031926.md` line 93 — *"modular, durable, metamorphic. Not Lego."*
- **Universal-Rox canon:** AGOS `r6050787851160271924` (~05:00 PM PT 050126)
- **Four-faced Rox / Koan canon:** AGOS `r-1273251947916140905` (~05:09 PM PT 050126) — UNDO/AGAIN/BOX/TIME
- **Companion firing-mechanisms:** `/atomic-commit` Gate 7 (Bridge `8b09360`) + Gate 0 (Bridge 051226) + `/boot-polish` v3.4 STEP A-1 + `/meta-dates` v1.11 Gate 0e + Gate 0b.4 + `/waywood-lore` Ambient Trigger (Bridge `fa0ee12`)
- **L1 spec-draft origin:** AGOS `19de61ed08dfa2e5` (050126 ~05:32 PM PT, this skill's substrate-anchor)

---

## Federal-vs-skill split (the template this skill establishes)

This skill is the **first explicit instance** of the Federal-vs-skill architectural pattern. The pattern:

| Layer | What lives here | Example |
|---|---|---|
| **L2 — Federal Standard (Bridge RELAY/)** | Canonical body. Inner core. Origin. Pattern. Cross-references. Authoritative. THICK. | `STANDARD_RULE_BoxInBoxLogic_Trip_050126.md` |
| **L3 — Skill file (ENGINE/skills/)** | Trigger conditions. Refusal language. Proceeds-conditions. Vocabulary triggers. Points to Federal Standard for body. THIN. | This file. |

The Federal-vs-skill split is itself an instance of Box-in-Box Logic:

- **Organizational axis:** Federal Standard = canon-substrate; skill file = firing-mechanism (different purposes, different folders)
- **Temporal axis:** Federal Standards are stable across time; skill files iterate (different sealed-vs-living posture)

The skill file specifies its own trigger-conditions, refuses its own conflation, proceeds on its own axis-separation. **The Roxplane contains the Roxplane.**

---

## Origin

**Catalyzed:** 050126 ~11:30 AM PT (file-organization Stupid-Mode: commit msg dumped at LNL/050126 root instead of DOCS/MD/) and ~11:45 AM PT Dan-canon teaching on day-folder lock semantics.

**Federal Standard filed:** Bridge `a3246a7` (~12:30 PM PT).

**Skill file (this) filed:** Dan-Go #4 of 4 ("yes all, on NEST :)" canonization 050126 ~04:58 PM PT). Spec-drafted in AGOS L1 at `19de61ed08dfa2e5` (~05:32 PM PT) while DC was unresponsive. Built post DC-recovery + post-compaction.

---

## Strange-loop note

This skill specifies the trigger-conditions for its own existence (Box-in-Box vocabulary appearing in chat fires this skill — and this skill is itself written using Box-in-Box vocabulary). The spec-of-the-trigger is gated by the trigger-it-specifies. Self-application as self-validation.

The Federal Standard at `a3246a7` could not fire ambient without this skill. This skill could not have body without that Federal Standard. The two layers are mutually-load-bearing. Neither is canon without the other.

The Roxplane contains the Roxplane.

---

`<4` — `/box-in-box` v1.0 · L3 trigger-layer for L2 Federal Standard `a3246a7` · Dan-Go #4 of 4 complete · ◈ Trip 4.7 · ODT · 050126
