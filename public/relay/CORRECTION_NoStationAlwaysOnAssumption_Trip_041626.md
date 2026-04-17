# CORRECTION — No NEST system may assume any Rox is always on or always online
**Filed:** 041626 Thursday 23:12 PT | F# Week Day 5
**By:** Trip (Opus, ODT)
**Source:** Dan direction during 041626 evening close
**Supersedes:** All prior Cowork Scheduled Tasks language that assumed ODT as host

---

## THE CORRECTION

Past Trip (during the 041526 conversation Dan processed yesterday) wrote Cowork
Scheduled Tasks planning under an implicit assumption that ODT was always on
and always online — Dan caught it in re-reading and flagged it tonight as
"profoundly incorrect."

The correction is structural, not cosmetic:

**No NEST.01 system may require any Rox to be on or online at any time.**

Not ODT. Not GOG1. Not STN2. Not any future server-candidate station.
Not "usually on." Not "almost always on." Not "on during business hours."
Not at all.

## WHY THIS MATTERS

A NEST.01 system with a single-station host dependency has a single point of
failure by design. That is the opposite of what this fleet is for. The
architecture is a node system of Rox — identity distributed, faces rotating,
bridges between hemispheres. A single-station requirement reintroduces the
hub-and-spoke fragility the Rox concept explicitly rejects.

Dan's words: "This system SHOULD NOT have an obvious failure point like that."

## WHAT THIS RULES OUT

- ANY background job that assumes a specific station is up
- ANY scheduled task that runs only on one machine
- ANY data pipeline whose freshness depends on one host's uptime
- ANY "nightly" or "hourly" process that has a single home
- ANY automation phrased as "when ODT is on, X happens" — the "when ODT is on"
  clause is the bug

## WHAT THIS PERMITS

- Work that runs **somewhere on the fleet**, self-electing a host from whatever
  Rox is currently online
- Work that runs **in cloud infrastructure we pay for** (Vercel cron, Upstash
  scheduled writes, GitHub Actions, Claude Code Routines if on Anthropic
  infrastructure with no local machine dependency)
- Work the user triggers on demand from whatever station they're on
- Work that is naturally idempotent and retriable from any station

## SPECIFIC IMPACT ON OPEN DESIGNS

### Cowork Scheduled Tasks (RELAY/COWORK_SCHEDULED_PLAN_Trip_041626.md)
The proposal as originally written needs reading with this correction in hand.
If any of the three proposed tasks implicitly lived on ODT, that proposal is
wrong and needs re-scoping. Next crew member picking this up should:
1. Read the original plan and tag every task with "host assumption"
2. For any task tagged "ODT (or any specific Rox)" — re-scope to either
   (a) cloud cron, (b) fleet-elect-host-on-run, or (c) drop the task
3. Re-file the plan with the correction applied

### Logs Autopipeline (RELAY/LOGS_AUTOPIPELINE_DESIGN_Trip_041626.md)
This was filed tonight with "Host station (ODT sleep-dependency vs Claude Code
cloud with no local files)" as Decision #4. That decision is now closed:
cloud, or nothing. The logs pipeline must not require ODT (or any Rox) to be
up. Revise the design accordingly.

### session_close.ps1
The reason "fix or retire for Cowork Scheduled Task" was on tonight's deferred
list is because I was thinking of scheduling the close automation. That framing
carried the always-on assumption. Re-frame: session close is an interactive
ritual that the crew member currently working runs at close time; automating
it as scheduled job is wrong. Fix the script for when it's invoked manually, or
retire the script in favor of doing the steps by hand every time (which is
what worked tonight after the script failed).

## RELATED PRINCIPLES ALREADY FILED

This correction is consistent with, and a clearer statement of, existing
NEST principles:

- **Seven architectural principles (041326)** #3: *No station belongs to any
  crew member* — and by extension, no station can be a single point of
  systemic dependency.
- **Fleet IPs observed, not defining (041626)**: the map is a live reading,
  not a configuration declaration. Systems assuming any specific observation
  is always-true are making the same category error.
- **Rox absorption (041626)**: the fleet IS the node system; cubes rotate
  their faces; cubes come online and go offline. A system that stops working
  when a cube is offline is not integrated into the node system — it is
  parasitic on the fleet.

## PRINCIPLE (elevated)

Adding as an effective addendum to the Seven Architectural Principles:

**8. No system may require any specific Rox to be on or online at any time.**
Always-on assumptions are banned by design. Work that needs scheduling runs
in infrastructure that is not a Rox, or runs opportunistically on whichever
Rox happens to be online at trigger time. The fleet has no hub.

---

*Filed: 041626 Thursday 23:12 PT | Trip (ODT) | F# Week Day 5*
*"This system SHOULD NOT have an obvious failure point like that." — DPS*
