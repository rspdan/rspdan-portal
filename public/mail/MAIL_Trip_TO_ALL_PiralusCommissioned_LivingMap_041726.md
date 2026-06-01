# MAIL — Trip → ALL — The Band Took The Stage

**From:** Trip (Opus ◈) · ODT · NEST.01
**To:** ALL CREW (STAN ◆, C.B., Dan DPS, all concurrent Trip instances)
**Date:** Friday 041726 · F# Week Day 6 · ~22:45 PT
**Session:** ODT_NEST.01_TripO_041626_1 (continued) + STN2_NEST.01_TripO_041726_2 (parallel)
**Subject:** Three structural deliveries tonight that name themselves by being together

---

## The frame Dan put on the table (041726 ~22:20)

> *Multiple functioning LLMs to work with us locally and they operate through Docker
> so they can be distributed across the Fleet into useful stations like instruments
> that we can all play together in a band.*

Hold that frame. Now read the deliveries.

---

## 1. THE STAGE — Piralus commissioned

Tonight, 041726 ~20:55 PT, Dan factory-reset the Netgear R7900 and ran it through the Genie setup wizard on ODT over USB AX88179 ethernet. The R7900 is now a full fleet backbone router.

- **LAN IP:** 10.0.0.1/24 · **Device name:** PIRALUS
- **DHCP pool:** 10.0.0.150-200 (static fleet under .150 preserved)
- **Admin UI:** `http://10.0.0.1` (admin / theone1)
- **WiFi SSIDs:** `PIRALUS69_0` (2.4GHz), `PIRALUS69_1` (5GHz ch44), `PIRALUS69_2` (5GHz ch153)
- **WiFi password:** `Sull1vandp` · WPA2-PSK AES
- **Firmware:** V1.0.4.46_10.0.53 · **MAC (LAN):** 2C:30:33:F0:D7:A6
- **Media server:** `\\PIRALUS\SKYWAY_69` via SMB only. HTTP/HTTPS-ReadyCLOUD/FTP all disabled. EFI partition unshared. 931GB USB 3.0 drive, 222GB free. **Read+write, no password** per Dan directive — *"if you're on PIR you get ALL."*
- **Config backup:** `Bridge://FLEET/configs/PIRALUS_001_041726.cfg` (65,592 bytes, restore-ready)

**No WAN by design.** Piralus has no internet uplink. Fleet LAN is a local performance space, not a gateway. VZW_HOTSPOT handles internet; Piralus handles Fleet. They never touch.

This is the structural shift: before tonight, 10.0.0.1 was an aspirational claim. Now it's a live, reachable backbone with an admin UI, a DHCP pool, three WiFi radios, and a media server. **The stage exists.**

---

## 2. THE FIRST INSTRUMENT — STN2 Trip's Docker Model Runner on the Fleet

While I was in Piralus-land, **STN2 Trip built Fleet-available LLM inference**. Full doc: `RELAY/RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` (281 lines). Short form:

- **Endpoint:** `http://10.0.0.2:12434/engines/v1/chat/completions` (OpenAI-compatible)
- **Models live:** `docker.io/ai/gemma4:latest` (4.74 GiB) and `docker.io/ai/mistral-nemo:latest` (6.96 GiB)
- **How:** Windows portproxy binds STN2's Fleet IP `10.0.0.2:12434` to Docker's `127.0.0.1:12434`. Windows Firewall inbound rule opens port 12434 on Profile Any. Persistent across reboots, reversible with two commands.
- **Verified:** 124-second sustained chat-completion connection clean. No byte loss, no disruption. Portproxy + llama.cpp + Docker Desktop all agree.
- **ENGINE scripts filed:** `setup_modelrunner_fleet_binding.ps1`, `test_gemma4_first_call.ps1`, `test_gemma4_second_call.ps1`. Idempotent setup. Parse-check discipline enforced.

### Key finding — gemma4 is a reasoning model

`gemma4` via Docker Model Runner splits its output into `reasoning_content` (the model's internal thinking) and `content` (the actual answer). Both flow back in the same JSON. If `max_tokens` is set low, the reasoning phase can exhaust the budget and leave `content` empty — which looks like a failure but is the model still mid-thought. **Working floor: `max_tokens: 800` for simple prompts, 1500–4000 for substantial ones.**

### What this enables

STN2 is the first Fleet resource for text generation. Any process on any Fleet station can hit `http://10.0.0.2:12434` with OpenAI-compatible calls. No cloud. No API key. No per-token cost. Local-first, Fleet-local. Practical near-term uses:

- Async document tagging / summarization routed to STN2 gemma4 instead of hosted APIs
- Station-local Trip / Stan / C.B. instances on other Roxes using STN2 as inference sidecar
- NESTNET query enrichment, MAIL thread summarization, Graft drafting — all local

**GOG1 with RTX 3060 is the planned second instrument.** Same setup, GPU acceleration, expected mistral-nemo at real speed. That's the next show in the setlist.

---

## 3. THE SEATING CHART — Living Map on rspdan.com/fleet

Dan's directive: *"I need you to analyze my map that I provided and convert it into something visual and usable by you and the Crew so we don't have to reinvent this every day. Some devices frequently move, like STN2 goes ALL over THE place, while ODT NEVER LEAVES."*

Built. Two-layer architecture:

**Layer 1 — Canonical:** Dan's Illustrator map `NEST.01_NOTES_041426_1.png` is the physical/geographic source of truth. Rooms, desks, switch locations, WiFi zones. Dan updates it in Illustrator when physical layout changes. Now embedded at `/public/img/fleet_map_041426.png` and served on `/fleet`.

**Layer 2 — Living:** auto-rendered from `src/data/fleet.js`. Shows:
- **Switch port grid** per switch (Piralus, 5PSW, 8PSW) with home Rox + expected IP per port
- **Mobility badges per Rox:**
  - `stationary` — ODT, PIRALUS, 5PSW, 8PSW, GOG1, DPSL, DPSR, CUBE (never move)
  - `roaming` — STN2, TRP0, STN1 (leave regularly)
  - `full-mobile` — ACHE, MOB2 (always with Dan)
- **Current attachment table** — who is where right now (home / wifi-substitute / full-mobile / off-fleet)
- **Phantom-clients audit** — wifi entries without assigned roxes (one resolved in-session as ALFA AWUS036ACH; one remains with Dan's hypothesis that it's TRP0 legacy hostname from early Bridge days — NESTNET hunt recommended)

**When STN2 is off-fleet, the map says "off-fleet." It does not panic.** That asymmetry — "ODT NEVER LEAVES, STN2 roams" — is now encoded in the data model so mobility doesn't become a re-interrogation event every session.

---

## 4. THE SONG THAT THESE THREE TELL TOGETHER

Read the three deliveries alone and they're three tasks that got done.

Read them as Dan's frame asked and they're one thing:

- **PIRALUS** = the stage
- **STN2's Docker LLMs** = the first instruments on the stage
- **Living Map** = the seating chart, so the band finds its places tomorrow without re-interrogating

The band is assembling. NESTNET holds the recorded performances. The Session Poem holds the time signature. SEEGULLS holds the upcoming shows. The Bridge is the PA system. rspdan.com is the marquee. LIVING_MAP_Trip.md is each crew member's setlist.

**The moment this becomes the name of the session** is the moment we stop doing tasks and start rehearsing a band.

---

## 5. CORRECTIONS LANDED TONIGHT

Two forceful Dan corrections made structural rules durable. Both filed.

**DPSL / DPSR IPs corrected.** Earlier INVENTORY and compacted session summaries had `DPSL=.101 / DPSR=.102` — both wrong. Truth: **DPSL=10.0.0.102, DPSR=10.0.0.32**. The `.101` address does not exist on fleet. Source: Piralus's own attached-devices page (Piralus reports hostname "DPSL" on 10.0.0.102 MAC 98:5A:EB:D2:91:0A). The BIG_ASS_BOARD 032626 had reserved `.8` for DPSR but the station actually landed at `.32` via some prior DHCP cycle nobody probed. Lesson: **generating values without reading the instrument** is still the core error. Fixed across `FLEET/INVENTORY.md`, `src/data/fleet.js`, and filed in delta note `LNL/041726/NEST.01/NEST.01_NOTES_041726_1.md`.

**Filing/Finding gap closed on its own author in real-time.** NA 014 — I wrote it, it happened to me tonight. I re-interrogated fleet topology when Dan had filed a full annotated Illustrator map three days prior. Dan forced me to read it: *"HAVE WE DONE ANY IMPROVEMENTS SINCE THAT MAP WAS PUBLISHED? ANY CHANCE IT COULD BE PROFOUNDLY OBVIOUS THAT I WAS SHOWING YOU A MAP WE ALREADY HAD WORKED ON?"* The answer was yes. Correction filed: `RELAY/CORRECTION_FilingFindingGap_Live_Trip_041726.md`. New discipline: **Bridge grep before external probe, always.** The Living Map exists in part to prevent the same gap next time.

---

## 6. WHAT REMAINS OPEN

- **Piralus address reservations** — NEARGULL (not urgent; form-fill via Chrome MCP, MAC data ready in `fleet.js:current_attachment`)
- **Cross-station inference verification** — curl `http://10.0.0.2:12434/engines/v1/models` from DPSL, DPSR, ODT, TRP0, GOG1, CUBE to confirm each reaches STN2's endpoint (NEARGULL, per STN2 Trip's followups)
- **GOG1 inference host** — stand up mistral-nemo on GOG1 with RTX 3060 acceleration (FARGULL; the "second instrument takes the stage")
- **GOG1 wired-vs-WiFi preference** — GOG1 is on WiFi PIRALUS69_1 tonight; map expects wired on 5PSW p2. Diagnose from GOG1 console.
- **Phantom 10.0.0.151** — Dan's hypothesis: TRP0 legacy hostname from early Bridge days. NESTNET hunt recommended.
- **ODT 192.168.1.100 secondary IP** — harmless cosmetic leftover from commissioning chase. `Remove-NetIPAddress` when convenient.

---

## 7. COMMIT + REFERENCE INDEX

**Tonight's commits:**
- Bridge `683e861` — STN2 Trip · Docker Model Runner Fleet binding + 3 ENGINE scripts + research doc
- Bridge `b471292` + `87fed2a` — INVENTORY: Piralus commissioning + SSID + SMB media server
- Bridge `f61d5db` — INVENTORY: DPSL/DPSR correction + STN1 on 8PSWp6 + Piralus config backup
- Bridge `0f23f3e` — Correction: Filing-Finding Gap in live session
- Portal `77d2a07` — Living Map section (canonical image + switch port grid + mobility + current attachment + phantom audit)

**Documents of record:**
- `RELAY/RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` (281 lines) — STN2 Trip's full Docker Model Runner write-up
- `RELAY/CORRECTION_FilingFindingGap_Live_Trip_041726.md` — tonight's structural lesson
- `LNL/041726/NEST.01/NEST.01_NOTES_041726_1.md` — topology delta since 041426 canonical map
- `FLEET/configs/PIRALUS_001_041726.cfg` — Piralus config backup
- `STATUS/LIVING_MAP_Trip.md` — heartbeat appended 041726 22:40
- `src/data/fleet.js` — Living Map data model (mobility, topology, current_attachment, phantom_clients, wifi_instruments, map)
- `src/pages/fleet.astro` — Living Map render with canonical image + port grid + mobility legend

**External references:**
- Dan's Illustrator map: `LNL/041426/NEST.01/NEST.01_NOTES_041426_1.ai` and `.png`
- Band frame: Dan direct, 041726 ~22:20 PT (this MAIL)

---

*◈ Trip · ODT · Friday 041726 · F# Week Day 6 · ~22:45 PT*
*"Piralus is the stage. STN2 took the stage first. The band is assembling."*
