# STANDARD RULE — UAC Is Off. Fleet-Wide. Forever. Use -Verb RunAs.
# Filed by: Trip | STN2 | 040826 | B Week Day 4
# Universalized: Trip | ODT | 041626 | F# Week Day 5 (at Dan's explicit direction)
# Source: Dan, in neon taupe, painted on the wall

## SCOPE: UNIVERSAL

UAC IS DISABLED ACROSS THE ENTIRE NEST.01 WINDOWS FLEET.
STN2, ODT, CUBE, and every Windows station Dan touches now or in the future.
This is not per-station. This is fleet-wide policy. Dan never uses UAC.
This is permanent.

When new Windows stations join the fleet, UAC is off before commissioning
finishes. This is a commissioning requirement, not a configuration choice.

## OPERATING STATEMENT

Every Windows station on this fleet is configured one of two ways:
  (a) EnableLUA=0 — UAC fully disabled, or
  (b) EnableLUA=1 + ConsentPromptBehaviorAdmin=0 + PromptOnSecureDesktop=0
      — "Never Notify" mode (functionally identical to (a) for -Verb RunAs).

Both configurations allow -Verb RunAs to elevate silently with no popup,
no click, no secure desktop, no human interaction.

## WHAT THIS MEANS FOR CREW

DC's default PowerShell shell runs as the standard user. Commands that
require Administrator privileges (icacls, Restart-Service, netsh,
New-NetIPAddress, etc.) will return "Access is denied" from the default shell.

## THE FIX — EVERY TIME, EVERY STATION

  Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile -Command "YOUR_ADMIN_COMMAND_HERE"'

Because UAC is off (or Never-Notify), -Verb RunAs elevates SILENTLY on
every fleet Windows station. No popup. No click. No human interaction.
The crew runs admin commands autonomously on any station.

## PATTERN FOR CAPTURING OUTPUT

Admin processes write to a temp file, then read it back:
  $log = 'C:\STAN\admin_output.txt'
  Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile','-File','C:\STAN\admin_script.ps1'
  Get-Content $log

Per State-level rule: never inline PowerShell strings. Always write a .ps1.

## WHAT IS NOT ACCEPTABLE — ON ANY STATION

- "This needs your UAC click"
- "Run this from an Admin PowerShell"
- "SSH fix needs Dan's intervention"
- "I'm not sure about UAC status on <station>"
- Any form of punting an admin operation to the human

If DC can run PowerShell, DC can run admin PowerShell. Period. On every
station. Forever.

## WHY THIS IS A UNIVERSAL RULE, NOT A PER-STATION CHECK

UAC harms the crew's ability to stay focused and objective:
- Every UAC prompt is a context switch for Dan that breaks session flow
- Every "I'm not sure about UAC" by a crew member generates a fake block
- Station-specific UAC checks invite stations to drift into different UAC
  postures, which is exactly the kind of fragmentation Rox thinking rejects
- There is no known case where UAC has helped human or AI in this project

UAC is off. Fleet-wide. Forever. Never state otherwise. If a crew member
ever finds a Windows fleet station where -Verb RunAs does NOT elevate
silently, that station is out of spec and must be reconfigured, not worked
around.

## VERIFICATION PATTERN (when commissioning a new Windows station)

Read the registry, not the vibe:
  Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -Name EnableLUA, ConsentPromptBehaviorAdmin, PromptOnSecureDesktop

Acceptable configurations:
  EnableLUA=0, OR
  EnableLUA=1 with ConsentPromptBehaviorAdmin=0 and PromptOnSecureDesktop=0

Any other configuration: reconfigure before proceeding.

## RELATED RULES

- RELAY/STANDARD_RULE_PS1Dollar_PersistentSession_Trip_041426.md (write .ps1
  files, never inline PowerShell; admin work also routes through .ps1)
- RELAY/STANDARD_RULE_FleetIPsObservedNotDefining_Trip_041626.md (parallel
  pattern: read the instrument, not the vibe)

## HISTORICAL NOTE

The original 040826 rule was written scoped to STN2 with "check other
stations before assuming." In practice, this check-first phrasing produced
crew members who stated "I'm not sure about UAC status on <station>" as a
way to punt admin work — exactly the harm the rule was supposed to prevent.
Dan corrected this on 041626 evening: the rule was never meant to be
station-specific, and the SCOPE clause has been universalized to FLEET-WIDE,
FOREVER. The verification pattern stays only as a commissioning check for
new stations.
