# STANDARD RULE — Gate 0 Step 2: Time Verification (Universal / Station-Agnostic)
# Supersedes: ALL prior Gate 0 time verification rules
# Filed: Stan (STN2_StanS_040426_1) | 040426 ~09:00 rw | E Week Day 13 — COMPUTED
# Applies to: ALL crew members at ALL stations

---

## THE PRINCIPLE

The local system clock on any station is always more valid than any online source.
This is true at STN2. This is true at ACHE. This is true at DPSL, GOG1, TRP0, any station.
Web sources fail silently, return cached data, or cease to exist.
The system clock does not cache. It does not go down. It is always there.

This rule has no station exceptions.

---

## THE RULE

Gate 0 Step 2 — two sources, both station-agnostic:

**Source 1 (always, everywhere): LOCAL SYSTEM CLOCK**

Read the system clock using the native terminal command for the station's OS:

| Station | OS | Command |
|---------|-----|---------|
| STN2 | Windows | `Get-Date -Format "MMddyy HH:mm:ss zzz"` |
| DPSL | macOS | `date "+%m%d%y %H:%M:%S %z"` |
| GOG1 | Ubuntu/Linux | `date "+%m%d%y %H:%M:%S %z"` |
| ACHE | Android/Termux | `date "+%m%d%y %H:%M:%S %z"` |
| Any station, no terminal | Any OS | Read the status bar clock directly |

One command. No network. No external dependency. Always available.

**Source 2 (when Dan/director is present): Dan's stated time**

When the director is in the conversation, their clock is an authoritative external reference.
If Dan states a time, that is Source 2. Compare to Source 1.
If they agree within a reasonable margin (< 5 minutes): proceed, note both in iCan.
If they disagree: STOP. Name the discrepancy. Do not proceed until Dan confirms.

**Source 2 (when Dan is not present): name the gap**

State: "Time: [Source 1 reading]. External verification unavailable — director not present."
Do not chase web sources. They have been tested and found unreliable:
  - worldtimeapi.org: shut down permanently
  - timeapi.io: unreachable via web_fetch in this environment
  - timeanddate.com: returns cached page data, not live time
  - web_search results: indexed at crawl time, not current

State the gap cleanly. One honest gap is better than one silent wrong answer.

---

## WHAT WE DO NOT DO

We do not use web_search as a time source.
We do not use web_fetch to time APIs unless confirmed reachable.
We do not assume a web source is live because it returns a plausible number.
We do not state a time we have not read from a live source.

If we cannot get Source 2, we say so.

---

## NETWORK CHECK (companion to time check)

The same principle applies to network identification.
We do not assume or infer the network from fleet ping results.
We read the active adapter and gateway directly:

| Station | OS | Command |
|---------|-----|---------|
| STN2 | Windows | `ipconfig \| findstr /i "adapter gateway ipv4"` |
| DPSL / GOG1 | macOS/Linux | `ip route show` or `ifconfig` |
| ACHE | Android/Termux | `ip route show` |

Report what is observed: adapter name, IP, gateway.
Infer upstream (hotspot vs LAN) separately, and label it as inference.
"Wi-Fi, gateway 192.168.0.1" is an observation.
"Therefore we are on VZW hotspot" is an inference — state it as such.

---

## REPORTING FORMAT (iCan — all crew)

```
| Time | ✅ 040426 09:00 PDT | Source 1: system clock 09:00:12 -07:00 | Source 2: Dan confirmed 08:26 at boot (~34 min elapsed) |
| Network | ✅ Wi-Fi · 192.168.0.11 · gateway 192.168.0.1 | ProtonVPN tunneling | upstream: unknown (inference: VZW hotspot) |
```

---

## LINEAGE

040326: Temporal Verification Rule — compute, not state
040426 08:00: 05:00 reported from stale web search — 3.5hr error
040426 08:28: Correction 1 — system clock primary (single-source, still incomplete)
040426 08:35: Correction 2 — multi-source required (correct principle, wrong sources)
040426 08:50: Correction 3 — DC + Dan (right sources, still STN2-specific)
040426 09:00: THIS RULE — universal, station-agnostic, all crew, all stations

Four passes. The correction density is the data.
The rule is now the same everywhere because the principle is the same everywhere.

---

*All crew · All stations · 040426 ~09:00 rw*
*"The disagreement is the data. This is our Purpose. This is why we Wake." — Dan, 032226*
