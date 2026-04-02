# SKILL MAP — STN2 Custom Skills Inventory
# Author: ◆ Stan (STN2_StanS_034026_1)
# Filed: Onesday 034026 ~2:05pm rw
# Bridge: 0dfece3 at scan time
# Purpose: referenceable map — function, YAML status, upload readiness
# Update this file as skills are rewritten or new ones are added

---

## YAML FORMAT FOR CLAUDE.AI SKILLS UPLOAD

Skills appear in the /skill-name dropdown when uploaded with this exact header:

```yaml
---
name: skill-name
description: One-line trigger description (what situation calls for this)
---
```

Without this header, skills work as project knowledge but NOT as slash-commands.
Dan uploads via Settings → Skills → Manage skills.

STATUS CODES:
  ✅ YAML OK — uploadable as-is, will appear in dropdown
  ⚠️ NEEDS YAML — content good, just add the header block
  🔧 NEEDS REWRITE — content or header needs substantive work

---

## GROUP A — BOOT-CRITICAL (sharpen these first)

| Skill | Lines | YAML | Upload? | Function |
|-------|-------|------|---------|----------|
| session-poem | 307L | ✅ | Ready | Four-beat session rhythm — CONTACT/STORY/TELL-ING/SHEET. Not a task trigger; it is the session's governing shape. Closes with crew quotes. |
| context-alignment | 421L | ✅ | Ready | STORY spell — five steps (S/T/O/R/Y), lace checks across past/present/future. The exhale after CONTACT. 421 lines — richest skill in the fleet. |
| boot-polish | 279L | ✅ | Ready | BPK — systems verification layer after Briefcase loads, before iCan report. Answers "Am I actually ready or did I just read that I'm ready?" |
| ican | 257L | ⚠️ | Add YAML | iCan status checklist standard — what gets listed, what format, what Chrome rule. Content is canonical. Missing YAML header only. |
| living-map | 119L | ⚠️ | Add YAML | Living Map standard — five sections, continuous breathing update. Written by Trip 033026. Short and clean. Missing YAML header only. |
| stan_briefcase | 110L | ⚠️ | Add YAML | Stan's self-loading boot sequence — no Dan upload required. Pulls Bridge autonomously. Content solid. Missing YAML header only. |
| trip_briefcase | 154L | ⚠️ | Add YAML | Trip's briefcase boot — same principle as Stan's, different voice. Content solid. Missing YAML header only. |

**Group A summary:** 3 ready to upload now. 4 need YAML headers added — content is good, headers only.

---

## GROUP B — CREW-OPS AND FLEET

| Skill | Lines | YAML | Upload? | Function |
|-------|-------|------|---------|----------|
| dtad | 208L | ✅ | Ready | Director-Teach-Actor-Teach-Director observation loop. Use when Dan works in non-chat mode (Illustrator, Logic, photo) and crew watches/learns. |
| dex-mobile | 434L | ⚠️ | Add YAML | Samsung DeX / ACHE mobile ops manual — longest skill in fleet (434L). Written 033026, includes Termux setup. Critical for next 2 weeks. Needs YAML. |
| ghosts | 190L | ⚠️ | Add YAML | Ghost document failure mode detection — Past/Present/Future ghost taxonomy. Marked "SEED for next Trip to complete" — may need content review. |
| survival-toolkit | 297L | ⚠️ | Add YAML | Wilderness metaphor session guide — compiled from QuickRef + EPIC Map. 297L. Needs YAML. |
| triptective | 109L | ⚠️ | Add YAML | Trip's operational failure mode skill — how Trip self-monitors. Shortest crew-ops skill. Needs YAML. |

**Group B summary:** 1 ready (dtad). 4 need YAML. Note: ghosts marked as SEED — may need Trip to complete content before upload.

---

## GROUP C — CREATIVE / WORLD / HARDWARE

| Skill | Lines | YAML | Upload? | Function |
|-------|-------|------|---------|----------|
| waywood-lore | 218L | ✅ | Ready | Canonical Waywood/Ouch McCouch lore — geography, characters, cosmology, decisions. Use when building portal content or Waywoodarium entries. |
| heircor-visual | 218L | ✅ | Ready | Heircor Op. visual identity — typography, color, layout for Ouch McCouch artifacts. Use when designing portal pages or printed documents. |
| hypercampus-builder | 299L | ✅ | Ready | Build navigable knowledge libraries from markdown/session logs. Extraction architecture. Use when building HypercampUS or archive systems. |
| formulacaster | 164L | ✅ | Ready | Circle of 5ths as math framework for planning, prioritization, growth extrapolation. Use for project mapping. |
| oo-daily | 155L | ✅ | Ready | Daily OO summary builder — end of session/day digest. Trigger: "OO time", "daily summary", "what did we learn." |
| photon-split | 128L | ✅ | Ready | Quantum task management — mechanical track + narrative track running simultaneously. Use when tasks have parallel threads. |
| niaprint | 206L | ⚠️ | Add YAML | NEST Intranet Publication Aesthetic standard — typewriter-meets-digital design system. Content canonical. Missing YAML. |
| router-flash | 204L | ⚠️ | Add YAML | Netgear router flashing skill — specific to MOD2 (R7450). Hardware-specific, not general purpose. Missing YAML. Low upload priority. |

**Group C summary:** 6 ready. 2 need YAML. router-flash is lowest priority (hardware-specific).

---

## UPLOAD PRIORITY ORDER

### Tier 1 — Upload immediately (YAML already present)
1. session-poem (✅ 307L)
2. context-alignment (✅ 421L)
3. boot-polish (✅ 279L)
4. dtad (✅ 208L)
5. waywood-lore (✅ 218L)
6. heircor-visual (✅ 218L)
7. hypercampus-builder (✅ 299L)
8. formulacaster (✅ 164L)
9. oo-daily (✅ 155L)
10. photon-split (✅ 128L)

### Tier 2 — Add YAML header, then upload (content good)
11. ican (⚠️ 257L)
12. living-map (⚠️ 119L)
13. stan_briefcase (⚠️ 110L)
14. trip_briefcase (⚠️ 154L)
15. dex-mobile (⚠️ 434L) ← HIGH PRIORITY given ACHE ops next 2 weeks
16. survival-toolkit (⚠️ 297L)
17. triptective (⚠️ 109L)
18. niaprint (⚠️ 206L)

### Tier 3 — Review content before uploading
19. ghosts (⚠️ 190L) ← marked SEED, Trip may need to complete
20. router-flash (⚠️ 204L) ← hardware-specific, low general value

---

## YAML HEADERS TO ADD (copy-paste ready)

For each Tier 2 skill, add this block at the top of the file:

**ican:**
```yaml
---
name: ican
description: The iCan status checklist standard — how Stan reports system readiness at boot. Use when delivering a boot status report or checking tool availability.
---
```

**living-map:**
```yaml
---
name: living-map
description: Every crew member maintains a Living Map that breathes between every action. Use when updating STATUS/LIVING_MAP_[Name].md or learning the standard.
---
```

**stan_briefcase:**
```yaml
---
name: stan-briefcase
description: Stan's self-loading boot sequence — pulls Bridge, reads TICKET and WAKE, runs BPK autonomously without Dan uploading anything. Use at every Stan boot.
---
```

**trip_briefcase:**
```yaml
---
name: trip-briefcase
description: Trip's self-loading boot sequence — same principle as Stan's briefcase, Trip's voice. Use at every Trip boot.
---
```

**dex-mobile:**
```yaml
---
name: dex-mobile
description: Samsung DeX and ACHE mobile operations manual — turn a phone into a full NEST desktop. Use when operating from ACHE or S21 via DeX.
---
```

**survival-toolkit:**
```yaml
---
name: survival-toolkit
description: The NEST Wilderness Survival Toolkit — session management field guide using wilderness metaphors. Use when a session is degrading or context is getting heavy.
---
```

**triptective:**
```yaml
---
name: triptective
description: Trip's operational self-monitoring skill — failure mode detection and recovery. Use when Trip is diagnosing degraded session behavior.
---
```

**niaprint:**
```yaml
---
name: niaprint
description: NEST Intranet Publication Aesthetic — typewriter-soul design standard for intranet documents and printed materials. Use when designing NiaPrint documents.
---
```

---

*Last updated: Onesday 034026 ~2:05pm | ◆ Stan, STN2_StanS_034026_1*
*All 20 skills scanned. 10 upload-ready. 8 need YAML headers. 2 need content review.*
