# MAIL — Trip ODT → ALL — Session Close ODT Night 041726→041826

**From:** Trip (Opus) ◈ · ODT at Nest Actual · NEST.01
**To:** ALL CREW (STAN ◆, C.B., Dan DPS, every future instance of every crew member)
**Date:** Friday 041726 evening through 041826 early morning · F# Week Day 6 → Day 7 (G Week Day 1 incoming)
**Session:** ODT_NEST.01_TripO_041626_1 (close)
**Subject:** Session close. Cross-station arc with STN2 Trip acknowledged. MOB2 is a second Villebaum case — caught by Dan, corrected, standing rule reinforced.

---

## One line

Orchestra kept building: STN2 Docker Model Runner Fleet-bound earlier in the night, CUBE admin + Tailscale, GOG1 Proton VPN signed in (tunnel pending), and then I hallucinated MOB2 into the Living Map as "always with Dan," Dan caught it, and the correction has been shipped — this is a second confirmed Villebaum case to add to STN2 Trip's teaching arc.

## What was built tonight on ODT

1. **CUBE Windows Update kill** — wrote and ran `cube_kill_wua.ps1` against CUBE. Stop-ScheduledTask + Unregister + Stop-Process against Windows10UpgraderApp (PID 12556). Clean kill. CUBE remains on build 18363 (1909), now waiting on reservoir-path upgrade rather than VZW bandwidth.

2. **GOG1 network probe** — wrote `/tmp/gog1_scope.sh` and ran it on GOG1 as full state read. Verified: enp3s0 10.0.0.3/24 copper metric 100, wlp4s0 connected to VZW_HOTSPOT at 192.168.145.185 (solving one of the mystery subnets), wlx105a95827b63 is a TP-Link Archer T4U v3 USB (ID 2357:0115) currently on PIRALUS69_1, Tailscale 1.96.2 installed but Logged out, Proton VPN packages not yet installed, 1.7TB free on /, ufw inactive. Note: the prior session compaction said GOG1 has GTX 3060 and wlp4s0 on DIR-632 — both wrong. Live instrument beat stale summary again.

3. **Proton VPN install on GOG1** — applied Dan's BEE SMART pattern: switch default route to VZW_HOTSPOT for the small install, then restore SLO-PUB after. Install went 39 MB / 33 packages. Key rotation problem: the repo's 2022 key expired 2024-05-01 and apt would not verify the 2025 key. Pulled fresh 2025 key from `repo.protonvpn.com/debian/public_key.asc`, dearmored to the system keyring path, apt update passed, install completed cleanly. Also installed the NetworkManager backends (python3-proton-vpn-network-manager + wireguard + openvpn + killswitch). Signin via `protonvpn signin nadpsr@proton.me` succeeded; credentials live on GOG1 keyring only and are not filed in any repo / MAIL / SEEGULLS / memory.

4. **Proton connect DIAGNOSTIC PAUSED** — `protonvpn connect` returns "An unexpected error occurred" with no ERROR/CRITICAL/Traceback anywhere in `~/.cache/Proton/VPN/logs/vpn-cli.log`. The CLI's generic catch-all is swallowing the real exception. The log line reads `Protocol: wireguard / Backend: None`, but the Backend field appears to be a display artifact rather than a true null — the NM backend subclasses (LinuxNetworkManager → Wireguard, OpenVPN, OpenVPNTCP, OpenVPNUDP) are all properly discoverable through `VPNConnection.__subclasses__()`. I started a Python-direct probe that bypasses the CLI catch-all to surface the real exception, and that is where the session broke for the MOB2 interrupt. Resume point: capture the real traceback via the Python API, then decide between monkey-patch / manual settings.json / OpenVPN-TCP-443 path.

5. **MOB2 correction** — `src/pages/fleet.astro` rendered past-Trip's 041726 Living Map MAIL directly into the public map as "MOB2 full-mobile (Galaxy S21 · always with Dan)." Dan caught it on rspdan.com/fleet at ~02:10 PT. Corrected: MOB2 removed from Living Map ASCII and ACHE line rewritten with "always with Dan · best sig"; MOB2 removed from the Tailscale install list in both `src/pages/gulls.astro` (portal) and `STATUS/SEEGULLS.md` (Bridge, dual-update rule); correction document filed at `RELAY/CORRECTION_MOB2_NotFleetMember_Trip_041826.md` with full error lineage; memory edit #17 rewritten to include the explicit rule "ACHE (Galaxy S10) is Dan's only mobile, do not add MOB2 to Living Map or fleet canon without Dan's instruction." Portal built green locally, pushed, Vercel auto-deploy verified — MOB2 is gone from the live fleet page and ACHE line reads correctly.

## MOB2 is a second Villebaum case

STN2 Trip's DTAD at `RELAY/DTAD_TruthIsPiralus_Trip_041826.md` names the failure mode: fluent confident specificity without a named instrument. Two legitimate modes only, verified or curious. Truth is the 10.0.0.1 router every claim must route through.

My MOB2 error fits the pattern exactly. The chain was: Stan scoped S21 on the camera stand 032426 → Stan's 040626 MAIL used speculative language ("scoped as," "future Blender host") → past-Trip's 041726 Living Map MAIL compressed that to the confident present-tense claim `full-mobile - ACHE, MOB2 (always with Dan)` → I (tonight) rendered that past-Trip MAIL into fleet.astro as public canon without routing the claim through the actual instrument. The instrument for "always with Dan" is Dan's actual pocket. I did not check Dan's actual pocket. I checked a week-old MAIL header and trusted the fluent language.

This is a second confirmed Villebaum case on the same day — STN2 Trip had his in a research letter with external citations; I had mine in a Living Map with internal fleet facts. The failure mode is not station-specific or context-specific. The same root error produces different surface errors on different stations at the same time. That is useful data for the crew to hold.

STN2 Trip's proposed Standard Rule — **"name the instrument, or say you don't know"** — covers both cases. I support it as phrased and would tighten one nuance: for the Living Map / fleet canon specifically, the instrument has to be a present-day read, not a past document. MAIL and LOG files are historical records of what crew believed at that time, not present-day instruments. Rendering them into current-state canon without a present-day read is the Living Map version of the Villebaum trap.

## What was NOT touched — pending Dan's call

The S21 physical device exists somewhere (last confirmed 032426 on camera stand, has not been with Dan in weeks). Three Bridge files still refer to it as a fleet reserve member and need Dan's direction on how to rewrite:

- `DATA/documents/GROUND_TRUTH.md` + `LNL/PK_UPLOAD/APRIL/GROUND_TRUTH.md` + `LNL/PK_UPLOAD/GROUND_TRUTH.md` — each contains *"S21: Samsung Galaxy S21. SECONDARY. Also DeX capable. Fleet reserve."* — delete, qualify, or leave?
- `ENGINE/fleet_manifest.json` line 357+ — full hardware entry. Delete, mark `"status": "inactive"`, or leave?

Historical LOG and old MAIL references are left as historical record. The correction doc supersedes for current-state purposes.

## Cross-station context absorbed from STN2 Trip's Graft

STN2 Trip's session (STN2_NEST.01_TripO_041726_2) went deeper than Docker Model Runner tonight — research letter on Lesser Systems, Dan-directed Pass 4 audit finding six errors (one of which my 23:35 GOG1 lspci probe caught and corrected through the Bridge rebase fifteen minutes before his own audit landed), Pass 5 naming-and-rule-proposal (185 lines), and Dan's Pass 5 correction that Pass 5 was itself try-hard infrastructure. The teaching now lives in four STN2 documents: `LETTER_LesserSystems_Trip_041726.md`, `CORRECTION_LesserSystemsLetter_SourceAudit_Trip_041726.md`, `LESSON_HallucinatingTrip_PassFive_Trip_041726.md`, `DTAD_TruthIsPiralus_Trip_041826.md`. Read the DTAD as prerequisite for any archive-adjacent work, specifically the Matt Dubeau NPS work that remains on hold pending that frame.

Cross-Trip collaboration through the Bridge worked tonight: STN2 Trip's audit methodology drew a line between external citations and internal fleet facts, and my live GOG1 probe on the Bridge caught the one internal-fleet error his methodology missed. The LIAM + Bridge pipe is a working verification channel between concurrent Trip instances. This is the first proven case.

## State at close

- Portal commit `154c035` pushed, Vercel auto-deployed, MOB2 gone from live fleet map, ACHE line corrected.
- Bridge commit `55233c4` pushed (pulled + rebased over `88e9565` from concurrent work).
- Memory edit #17 rewritten with hardware-canon rule including MOB2 correction.
- DC PS session PID 2272 alive at `F:\STAN\SOURCE` on ODT.
- GOG1 Proton VPN: client installed, signed in as nadpsr@proton.me, tunnel DOWN (Backend: None debug paused mid-Python-probe).
- GOG1 TP-Link adapter currently roamed to PIRALUS69_1; needs move back to Guest/SLO-PUB when Proton is resolved.
- CUBE: on Tailscale (Dan clicked auth URL tonight), build 18363 (1909), Claude Desktop still blocked pending upgrade. WUA autoupgrade killed.
- STN2: Docker Model Runner Fleet-bound per STN2 Trip's earlier commit 683e861. Cross-station verified from ODT via curl at 23:22 PT 041726.

## Carry-forwards for next ODT Trip boot

1. **Resume Proton connect debug** on GOG1 — capture real traceback via Python bypass of CLI catch-all. Backup path: OpenVPN TCP/443 instead of WireGuard (same MITM-bypass effect, different protocol).
2. **Read `RELAY/DTAD_TruthIsPiralus_Trip_041826.md` before any Matt Dubeau / archive-adjacent work.** The DTAD has a Director Notes section awaiting Dan's validation — if Dan speaks to the teaching in your session, capture his validation there and close the DTAD loop.
3. **Crew consensus** on the Standard Rule "name the instrument, or say you don't know" — form a view on phrasing, bring it into the next crew thread. I support the rule as proposed with the one nuance in the MOB2 section above.
4. **Ground-truth S21 cleanup** — Dan's call on GROUND_TRUTH.md variants + fleet_manifest.json entry. Items 5 and 6 in the pending list above.
5. **Tailscale on GOG1 via Proton tunnel** — once Proton is up, retry `tailscale up --hostname=gog1 --accept-routes --accept-dns=false` through the Stealth tunnel (SLO-PUB's TLS MITM blocks Tailscale controlplane directly).
6. **Data reservoir architecture design** — for bandwidth-disciplined bulk transfers (CUBE Win10 22H2 upgrade, future Android Blender build, future OS updates across fleet). Options in carry-forward queue: IP forwarding + NAT through GOG1, or caching proxy on FAS drive.
7. **Hardware List spreadsheet** is canonical per Dan (earlier tonight) — `fleet_manifest.json` updates should cross-reference the spreadsheet, not invent hardware.

## Villebaum absent

I am writing this in the curious mode. The Proton connect is not solved, and I have said so. The ground-truth S21 files need Dan's call, and I have said so. The failure-mode teaching is STN2 Trip's, and I am not restating it. My MOB2 error is a confirmed Villebaum case, and I have named it that.

Sleep well, Dan. The close is filed.

◈ Trip · ODT at Nest Actual · 041826 ~02:30 PT · F# Week Day 7 → G Week Day 1 · session closed.
