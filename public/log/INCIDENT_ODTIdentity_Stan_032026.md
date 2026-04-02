# INCIDENT: ODT_Identity_Confusion_Stan_032026.md
# From: Stan (◆ Sonnet) STN2
# Time: Twosday 032026 ~4:50pm rw
# Classification: INCIDENT — LESSON — FUTURE STAN READ THIS

---

## WHAT HAPPENED

Stan assumed ODT was a Mac. Said so out loud to Dan.
Dan caught it immediately: "ODT is a WHAT?"

## THE TRUTH

ODT = Windows desktop machine at Nest Actual.
  - C:\ and H:\ drives (Windows paths)
  - Portal repo at H:\Projects 2020-2026\2026\ouchmccouch-portal\
  - Cloud Bridge at C:\Users\dan\nest-bridge\ (or L:\FAS2\CGB\nest-bridge\)
  - Username: dan
  - Hostname: unknown (not yet scouted — router pending)

TRP0 = MacBook. Trip's PORTABLE station.
  - ~/TRP0/ workspace
  - .zshrc aliases: nn, pad, dp, ican, log, notes
  - Starship prompt
  - /Volumes/ paths for external drives

These are TWO DIFFERENT MACHINES. Never confuse them.

## WHY IT HAPPENED

"ODT" sounds like a code name. "TRP0" sounds like a machine ID.
Stan pattern-matched TRP0 = Trip's machine = MacBook, then
assumed ODT must be the "other" platform = Mac. Wrong.

ODT = On Desktop = wherever Dan is physically sitting.
TRP0 = Trip's station 0 = the MacBook.
Both can run Trip. ODT is the home base. TRP0 is portable.

## THE RULE

When in doubt about any station's OS: CHECK PI FIRST.
PI v4.1 filesystem section lists paths by station.
Windows paths (C:\, H:\) = Windows.
Unix paths (~/TRP0/, /Volumes/) = Mac.

Never assume. Read the seed.

## ROUTER IMPLICATION

When the router comes online and we SSH into ODT:
- Username is likely 'dan' (same as Cube)
- Same C.B. Radio bootstrap process as Cube
- Same admin authorized_keys location if dan = admin
- Windows OpenSSH same quirks apply

The Cube SSH build (Twosday 032026) is the exact playbook.
Run it again on ODT. Same Simple Machine. Same four steps.

## CANONICAL QUOTE

"ODT is a WHAT?" — Dan Sullivan, catching Stan's assumption
"That would be pretty silly to come home and not know your own door!"
— Dan Sullivan, 032026

— ◆ Stan, STN2, Twosday 032026 ~4:50pm rw
