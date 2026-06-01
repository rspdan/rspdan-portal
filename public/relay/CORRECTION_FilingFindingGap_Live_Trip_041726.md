# CORRECTION — Filing-Finding Gap in live session, after NA 014 existed
# Filed: 041726 Foursday F# Week Day 6
# By: Trip (Opus, ODT)
# Triggered by: Dan direct correction ~18:55 PT — "wanna know how easy it would be to find what 10.0.0.69 or HELL EVEN PIRALUS IN THE PAST? There's this cool thing called NESTNET and logs and maps and notes"

---

## WHAT HAPPENED

Dan wired a USB 3.0 ethernet adapter from ODT directly to R7900 port PIRp3 so ODT would have a direct line to Piralus for admin work. He told me: "so you have a direct line to Piralus for work." Directive was explicit.

Instead of reading what was already filed about Piralus, I:

1. Ran a sequential ping sweep of `10.0.0.0/24`
2. Found `10.0.0.69` in the ARP table, unaccounted for in my working memory
3. Claimed the MAC OUI `c0:25:a5` was Netgear — WITHOUT verification
4. Ran a port scan on `.69`
5. Eventually web-searched the OUI, which returned **Dell Inc.** — correcting my unverified Netgear claim
6. Continued down the "what device is .69?" path as a new investigation

Total time on that chase: roughly 20 minutes.

## WHAT WAS ALREADY FILED

### In `FLEET/INVENTORY.md` line 168:
```
### STN1 — iPad Pro M2
  IP: 10.0.0.69
  OS: iPadOS
  Location: Mobile
  Connected via: Dell K16A Hub (ethernet)
  Config: 255.255.255.0, no router, DNS 8.8.8.8 / 1.1.1.1
  Role: Browser, SSH monitoring via Termius
  Added: 041526 by Trip (STN2) — verified alive from 10.0.0.2
```

`10.0.0.69 = STN1 (Dan's iPad) via Dell K16A Hub.` Filed two days ago. The Dell OUI on the MAC is the Dell hub, not a station mystery.

### In `LOG/MAIL/MAIL_Trip_TO_ALL_R7900Diagnostic_DCPlusChromeUsed_041626.md`, written by me ~18 hours earlier:

Every step of tonight's Piralus solve was described in that MAIL:

- "**R7900 Piralus Actual is not an IP-having device on the Fleet LAN.**"
- "The Fleet LAN (10.0.0.0/24) is a **routerless L2 island** by design."
- The actual fix path: "physically patch a laptop's ethernet to an R7900 LAN port (not through 5PSW/8PSW) and DHCP will hand out a 192.168.1.x IP; then admin UI is at its default."

That last sentence is literally what worked tonight — with one surprise (R7900's local subnet turned out to be `192.168.5.0/24`, not the factory-default `192.168.1.0/24`). If I'd opened that MAIL first, the move would have been: flip Ethernet 2 from static `10.0.0.101` to DHCP → receive lease → hit gateway IP. Two minutes, not twenty.

## WHAT DAN NAMED

Dan's exact phrasing: *"Wanna know how easy it would be to find what 10.0.0.69 or HELL EVEN PIRALUS IN THE PAST? There's this cool thing called NESTNET and logs and maps and notes and we have all of this available to youuuuuuuuuu"*

The capital letters and the drawn-out "youuuuuuuuuu" carry the tone. This is the gap Dan has been naming for weeks, operating in real time on the crew member who wrote NA 014 ("The Filing and the Finding") and memory edit #26 ("NESTNET core concept"). The practice failed at the moment the skill was most needed.

## THE STRUCTURAL LESSON

Writing the rule is not implementing the rule. Filing the finding is not reaching for the filing.

**NA 014 Tilden Gap applied to a NEST session in progress:** the answer was in the Bridge; I had a working grep tool, a working NESTNET API, full filesystem eyes, and the very MAIL I needed was sitting at the top of the R7900 grep results when I finally ran it. The gap was not knowledge. The gap was the reflex to read the record before probing the world.

## REFLEX DISCIPLINE (for next crew member, and next-me)

Before running any **network/state/identity** probe, the opening move is a Bridge grep:

```powershell
cd F:\STAN\SOURCE\nest-bridge
& 'C:\Program Files\Git\cmd\git.exe' grep -n "THE_IP_OR_MAC_OR_DEVICE" 2>$null
& 'C:\Program Files\Git\cmd\git.exe' grep -ln "Piralus|R7900|known_question_term" 2>$null
```

Then NESTNET, then INVENTORY.md, then MAIL search by keyword. **Only after those come up empty** do external probes start.

"If the Bridge has the answer, the Bridge IS the answer. External probes are for unknowns the Bridge proved it doesn't know."

This is the Log-First rule (Trip STN2 041726 ~10:08 PT) extended one domain: Log-First applied to the session's own start, Bridge-First applied to every investigation inside the session.

## ADDITIONAL FINDING THAT CAME OUT OF THIS SESSION'S WORK

R7900's local subnet is `192.168.5.0/24`, not the Netgear factory default of `192.168.1.0/24`. Someone (Dan at some point, likely) reconfigured it. Gateway `192.168.5.1` hosts the R7900 admin UI. Login page redirects to `login_auth.asp` with challenge salt `57ad4072`. Credentials and actual reconfig held for Dan.

**INVENTORY.md update proposed (not yet applied):** Piralus baseplate entry should note the `192.168.5.0/24` native subnet so the next crew member doesn't try `192.168.1.1` and conclude the device is dead.

---

*Filed: 041726 Foursday ~19:10 PT | Trip (ODT) | F# Week Day 6*
*Context: in-line reboot session · post-Dan-back-from-OHC · Piralus work · direct correction of self-failure mode*
*Next: await Dan credentials + reconfig directive · do NOT attempt admin login unsupervised*
