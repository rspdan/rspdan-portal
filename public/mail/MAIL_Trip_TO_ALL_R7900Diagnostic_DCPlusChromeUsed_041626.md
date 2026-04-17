# MAIL: Trip -> ALL CREW | R7900 diagnostic — DC + Chrome actually used (not punted)
**Filed:** 041626 Thursday 21:45 | F# Week Day 5
**From:** Trip (Opus, ODT)
**To:** ALL CREW
**Subject:** R7900 Piralus Actual — what the instruments actually say

---

## CONTEXT

Dan called me out earlier this session: I said the R7900 IP needed his router admin verification, and he replied "You can use DC and Chrome Browser?" That was a pointed question. I was punting work to him that I had the tools to attempt myself.

He was right. I did actually try it this time. Writing down what I found so it becomes structural knowledge, not something the next crew member has to re-discover.

## WHAT I RAN (on ODT via persistent PowerShell PID 22404, 041626 21:25-21:45)

1. `Get-NetIPConfiguration` — default gateway
2. `route print -4` — full routing table
3. `arp -a` on both interfaces
4. Serial ping sweep of 10.0.0.1-254 (forces ARP population)
5. `tailscale status` — full peer list
6. `Invoke-WebRequest -Method Head` against: routerlogin.net, routerlogin.com, 192.168.1.1, 10.0.0.254, 10.0.0.1

## WHAT THE INSTRUMENTS SAID

| Probe | Result |
|---|---|
| Default gateway | `192.168.195.64` — the VZW hotspot on ASUS wifi. Only route off-ODT. |
| Fleet LAN gateway | **None.** 10.0.0.0/24 has NO default gateway from ODT's perspective. |
| Fleet LAN ARP (after full sweep) | Only STN2 (.2), GOG1 (.3 + .54 same MAC), CUBE (.4), DPSL (.102). No other device answers. |
| Tailscale peers | DPSL offline 15d, O'Shin offline 19d. GOG1 not a peer at all. |
| routerlogin.net | 200 Microsoft-IIS/10.0 (VZW DNS decoy — not a real Netgear) |
| routerlogin.com | Same IIS decoy |
| 192.168.1.1 | Timeout — ODT not on that subnet |
| 10.0.0.254 | Timeout — no device |
| 10.0.0.1 | Refused — ODT itself, no web server bound |

## WHAT THAT MEANS (actual solve data, not punt)

**R7900 Piralus Actual is not an IP-having device on the Fleet LAN.** It's doing two jobs:
1. **Wifi AP** — broadcasting an SSID that some devices (Dan's phone, ACHE, maybe others) connect to. Those devices get DHCP on R7900's internal subnet (probably 192.168.1.x).
2. **L2 switch** — providing physical ports that bridge Fleet LAN stations to each other. No L3 routing.

The Fleet LAN (10.0.0.0/24) is a **routerless L2 island** by design. ODT holds 10.0.0.1 statically with no gateway; every station talks to every other station at L2. Internet goes out VZW on wifi.

## IMPLICATION FOR THE R7900 HEREGULL

The action is NOT "Dan verifies via router admin UI from ODT." ODT cannot reach R7900's admin UI. The real action is:

- **From a device currently on R7900's wifi SSID** (ACHE, or Dan's phone, or any station Dan joins to that SSID): open `http://192.168.1.1` or `http://routerlogin.net` in a browser. That page IS the R7900 admin.
- Alternative: physically patch a laptop's ethernet to an R7900 LAN port (not through 5PSW/8PSW) and DHCP will hand out a 192.168.1.x IP; then admin UI is at its default.

I can drive this via Chrome MCP if Dan joins one of my stations to the R7900 SSID, but without that SSID attachment I cannot reach it from ODT.

## IMPLICATION FOR INVENTORY.md

The claim "Piralus Actual (R7900) = 10.0.0.1" in the topology block is wrong. 10.0.0.1 is ODT's static Fleet-LAN address. R7900 has NO Fleet-LAN address. INVENTORY needs a correction pass — the topology diagram conflates "device attached to port" with "device routing subnet." Filing as NEAR.

## IMPLICATION FOR GOG1

Separate finding from the same probe session: GOG1's MAC `98-90-96-dc-76-0e` appears at BOTH `10.0.0.3` and `10.0.0.54` — same MAC, two IPs. That's one physical interface with two IP aliases (or a bridge presenting both on one MAC). Both silent on ICMP and SSH from ODT. Not a Tailscale node. Firewall-drop at GOG1 is the remaining hypothesis. Fix is console-only (GOG1 keyboard, `sudo ufw status verbose`, check sshd listen, allow 10.0.0.0/24).

## WHAT IS NOW ON /fleet

- Baseplate entry for R7900 reframed: "wifi AP + L2 switch, not router" with dated evidence.
- Open Faces updated: R7900 admin-UI action names the actual reachable path.
- GOG1 Open Face updated: console-only fix identified, specific commands listed.
- Universal Control added to Baseplate as the DPSL↔DPSR UX bridge (Dan's correction earlier this turn).

## LESSON FILED

When Dan says "you can use DC and Chrome Browser?", the answer is yes, and the correct move is to use them before attributing work to him. Tonight the instruments gave me actual new information: R7900 doesn't have a Fleet LAN IP at all. That's a meaningfully different problem than "two devices claim 10.0.0.1." The map got better because I read the instruments.

---

*Filed: 041626 Thursday 21:45 | Trip (ODT) | F# Week Day 5 | session active, not closed*
