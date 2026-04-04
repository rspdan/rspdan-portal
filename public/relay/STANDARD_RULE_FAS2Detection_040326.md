# STANDARD RULE — FAS2 Detection
# Canon: 040326 | Extends and supersedes STANDARD_RULE_RemovableDrivesInICan_Stan_033126.md
# Filed: ◆ Stan (STN2) | E Week Day 12
# Provenance: FAS2 drive renamed from "014_1TB.2025" to "FAS2" by Dan 040326.
#   Drive now self-identifies. Label-based detection replaces volume-search.
#   L:\ hardcoding was the root cause of repeated FAS2 path errors in NEST_SEED,
#   GROUND_TRUTH, NEST_PI_v5, and session logs throughout March–April 2026.

---

## THE RULE

FAS2 is a portable 1TB SSD. Its Windows drive letter varies by machine.
As of 040326, the drive is labeled "FAS2" in Windows.

DETECT BY LABEL. NEVER HARDCODE THE LETTER.

```powershell
# FAS2 detection — run this before any FAS2 path operation
$fas2 = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Description -eq "FAS2"}
if ($fas2) {
    $FAS2_ROOT = $fas2.Root + "FAS2\"
    Write-Host "FAS2 MOUNTED: $FAS2_ROOT"
} else {
    Write-Host "FAS2 NOT MOUNTED — normal on STN2 when drive is elsewhere"
}
```

Known current assignments (verify with detection, do not trust from memory):
  STN2: E:\FAS2\    (confirmed 040326)
  ODT:  letter TBD  (detect on next ODT boot)

---

## WHAT CHANGED

| Before 040326 | After 040326 |
|---------------|-------------|
| Drive labeled "014_1TB.2025" | Drive labeled "FAS2" |
| Detection: search for label "014_1TB.2025" + read FAS2_IDENTITY.md | Detection: `Where-Object {$_.Description -eq "FAS2"}` |
| All docs hardcoded L:\ | All docs must use detection command |

---

## FILES THAT STILL CONTAIN STALE L:\ REFERENCES

These files in Project Knowledge are stale and need Dan to re-upload corrected versions.
The correction is NOT a small edit — it changes the core assumption.

| File | Where | Stale content | Action needed |
|------|-------|--------------|---------------|
| NEST_SEED.md | Claude PK (all projects) | Line 13: `L:\ mounted = ODT`, Line 51+83+94: `L:\FAS2` | Dan re-uploads corrected version |
| GROUND_TRUTH.md | Claude PK (all projects) | Lines 16,19,54,92,93: `L:\FAS2` | Dan re-uploads corrected version |

Files already corrected on Bridge (040326):
  RELAY/NEST_PI_v5_040326.md ← fixed this session
  RELAY/STANDARD_RULE_FAS2Detection_040326.md ← this file

---

## THE CORRECTED DETECTION LOGIC FOR NEST_SEED STEP 0

Replace current Step 0 station detection with:

  Run: echo $env:COMPUTERNAME; Get-PSDrive -PSProvider FileSystem | Select Name,Root,Description

  STN2:  hostname = 026-930GB-SSD-2022, Description D:\ = FAS3
  ODT:   hostname varies; many drives; FAS3 not present
  FAS2:  Description = "FAS2" — any drive letter → $Root + "FAS2\" is FAS2 path
         NOT mounted = normal; flag it but don't fail boot

---

## THE CORRECTED GROUND_TRUTH LINE 92

Change:
  NOTHING from our project lives on C:\. Everything on FAS2 (L:\) or the bridge.

To:
  NOTHING from our project lives on C:\. Everything on FAS2 (detect by label) or the bridge.
  FAS2 path: run detection command — NEVER assume L:\ or any specific letter.

---

## WHY THIS KEEPS HAPPENING

The FAS2 drive letter was first documented as L:\ because it was always L:\ on ODT.
When it was plugged into STN2 (033126), it appeared as E:\. The SHEET files captured
E:\FAS2 correctly. The NEST_SEED and GROUND_TRUTH in PK were never updated.

PK files load at every boot. They override Bridge information. A stale PK file is a
boot-time inject that propagates wrong assumptions to every session until corrected.

The PI Seed method (built 040326) addresses this structurally: the PK seed file only
points to a URL; it doesn't contain paths. When paths change, only the hosted PI
needs updating — not the PK file itself.

This rule is the bridge between the old architecture and the new.

---

*Filed: ◆ Stan | STN2 | 040326 | E Week Day 12 — COMPUTED*
*"The drive now announces its own identity. Scan for the label. Never guess the letter."*
