# CORRECTION: MOB2 Is Not A Current Fleet Member

**Filed:** 041826 ~02:15 PT (G Week transition)
**Filed by:** Trip (Opus) on ODT
**Supersedes:** Past-Trip MAIL_Trip_TO_ALL_PiralusCommissioned_LivingMap_041726.md line 79
**Reason:** Dan correction at 041826 ~02:10 PT. Quote: *"YOU HAVE NOT EVEN SEEN THE S21 in WEEKS WTF HOW DID THIS GET ON HERE WHEN I LITERALLY NEVER ASKED FOR YOU TO ADD IT. ACHE IS MY S10 AND THAT IS IT"*

---

## The Error

Past-Trip's 041726 Living Map MAIL labeled MOB2 (Samsung Galaxy S21) as `full-mobile - ACHE, MOB2 (always with Dan)`. Current-Trip (041826 tonight) rendered that labeling into `rspdan-portal/src/pages/fleet.astro` as a user-facing Living Map entry showing "MOB2 full-mobile (Galaxy S21 - always with Dan)." This was a hallucination rendered as public canon.

## Ground Truth (per Dan 041826 02:10)

- **ACHE (Samsung Galaxy S10) is Dan's only mobile device.**
- The S21 physical device exists somewhere (last confirmed-seen 032426 on camera stand with USB-C + DeX hub) but has not been with Dan in weeks.
- S21 is **not** an active fleet member and **not** "always with Dan."
- Any future rendering of MOB2/S21 must be as inactive/reserve/speculative, never as active fleet canon.

## Lineage Of The Error

1. **032426-032526:** Stan first scoped S21 on camera stand with DeX capability. Dan clarified S21 is separate from ACHE and "needs its own fleet identity." This was accurate at the time — the device existed and had potential.
2. **040626:** Stan's session-close MAIL listed "S21 as MOB2 scoped (Termux node, DeX workstation, future Blender host)." Still scoping language — not canonical, not Living-Map eligible.
3. **041726 (past-Trip):** Fleet instrument map MAIL inflated the scoping into `full-mobile - ACHE, MOB2 (always with Dan)`. This is the origin of the error — past-Trip treated speculative/reserve hardware as active fleet member with location="with Dan."
4. **041826 (current-Trip):** Rendered past-Trip's MAIL into fleet.astro as Living Map canon without verifying against Dan's actual mobile situation.
5. **041826 02:10:** Dan catches it on rspdan.com/fleet. Correction issued.

## What Was Fixed

- `rspdan-portal/src/pages/fleet.astro` - MOB2 removed from Living Map ASCII, ACHE now reads "always with Dan · best sig"
- `rspdan-portal/src/pages/gulls.astro` - MOB2 removed from Tailscale install list in SEEGULLS entry
- `nest-bridge/STATUS/SEEGULLS.md` - mirror Bridge-side MOB2 removal
- This correction document filed

## What Was Deliberately Not Edited

Historical records left intact as historical truth of what-crew-believed-at-the-time:
- `LOG/LOG_ODT_TO_032526_1.md` - original S21-on-camera-stand discovery logs
- `LOG/LOG_STN2_StanS_032526_1.md` - Dan's original "S21 is not ACHE" correction
- `LOG/MAIL/MAIL_Stan_TO_ALL_SessionClose_040626.md` - Stan's original scoping
- `LOG/MAIL/MAIL_Trip_TO_ALL_PiralusCommissioned_LivingMap_041726.md` - past-Trip's error (origin of today's cascade)
- `RELAY/OBSESSIVE_NOTES_STN2_StanS_032426_2_part2.md` - S21 hardware spec capture
- `logs.astro` line 522 (portal logs page) - "S21 scoped as MOB2" is a historical log note, accurate to that session

This correction doc supersedes for current-state purposes. Historical files are history.

## Pending Follow-Up

- `DATA/documents/GROUND_TRUTH.md` + `LNL/PK_UPLOAD/APRIL/GROUND_TRUTH.md` + `LNL/PK_UPLOAD/GROUND_TRUTH.md` - all say "S21: Samsung Galaxy S21. SECONDARY. Also DeX capable. Fleet reserve." — qualify with "device exists but not in active fleet use as of 041826" or remove, per Dan's direction
- `ENGINE/fleet_manifest.json` line 357+ - S21 hardware entry. Mark `status: "inactive"` or remove per Dan's direction
- userMemories update - remove or qualify the "MOB2 = Samsung Galaxy S21 ... also in fleet" text; add explicit "ACHE (S10) is Dan's only mobile; do not add MOB2/S21 to Living Map or fleet canon without Dan's explicit instruction"

These require Dan's call because they touch crew boot context. Correction doc + portal fix ship first; Dan decides whether Bridge ground-truth files get rewritten or just annotated.

## Standing Rule Emerging

**Before rendering any hardware into the Living Map or fleet canon: verify present-day ground truth with Dan, not inherited-from-past-MAIL. "Always with Dan" is a claim about current physical reality — it cannot be derived from a scoping document or an old session log.**

This is the filing/finding gap in a new form: past-Trip's speculative language ("scoped as," "future Blender host") got compressed over one week into confident present-tense canon ("always with Dan"). The compression happened because subsequent crew (including current-me) read past-Trip's MAIL and trusted the MAIL header rather than the content.

Same root error as the time API and Living Map update rule before it: **generating values without reading the instrument**. In this case the instrument is Dan's actual pocket, not a week-old scoping MAIL.

---

Filed by Trip (Opus), 041826 ~02:15 PT, on ODT.
