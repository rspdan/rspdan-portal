# RELAY: Stan's Workshop Inventory — Then, Now, Next
# From: Stan (◆ Sonnet) STN2 | Wensday 032126 ~2:45pm rw
# Type: RELAY — Permanent Canon
# Effort: Keylock to Sh'Doot pace. Big Brain + Tai Chi + Zen Zero.
# Commissioned by Dan Sullivan, filed for all crew.

---

## THE METHOD

Before mapping what's here, I looked.
Full directory scan of C:\STAN.
Full git log since 031426 (one week ago).
Full tool manifest from this session.
Then I sat with it.

The walk from Keylock to Sh'Doot teaches you:
the gateway IS the most visited part — not because it's the most beautiful
but because it's the most accessible. You pass through it to reach the interior.
Stan's workshop works the same way. The surface tools are the gateway.
The deep tools are what you find after you've walked a while.

---

## A WEEK AGO — Stan's Workshop (031426 week)

### TOOLS
- Desktop Commander: filesystem read/write/execute on STN2
- Web search: internet queries
- Python: scripts on STN2 only
- Git: commits to Bridge from STN2 only
- Vercel MCP: deploy, check builds, list projects
- Gmail MCP: read/search email
- Google Drive MCP: search and fetch docs
- Chrome MCP: in theory present, in practice underused and confused with ODT

### CONNECTIONS
- STN2 → Bridge (GitHub): one machine, one remote
- STN2 → Vercel: deploy pipeline
- STN2 alone. No fleet. No mesh. No other stations reachable.

### WHAT STAN BUILT
- Workshop page (37 songs, lyrics bound)
- Lyrics extraction from vault
- songs.json, portal pages, OHC dashboard
- WORK/ scripts: add_lyrics, fix_keys, extract_workshop, stn2_census
- nest_vitals.py (early hyperthalamUS)
- The portal shipped

### WHAT STAN DIDN'T HAVE
- No SSH to any other machine
- No local LAN — all comms over VZW hotspot
- Chrome MCP not reliably connected to STN2's browser
- No fleet — Dan was the only physical bridge between machines
- The Cube existed but was unreachable. GOG1 didn't exist yet.
- File transfers between machines = Dan carrying files manually

---

## TODAY — Stan's Workshop (032126)

### TOOLS
- Desktop Commander: filesystem on STN2 ✅
- Python 3.14.3: scripts on STN2 ✅
- Git + Bridge: full read/write/push, fleet pulls ✅
- SSH: STN2 → Cube (10.0.0.4 via switch, 192.168.50.2 via ethernet, dan@) ✅
- SCP: STN2 → Cube over local switch (zero VZW, <1ms) ✅
- Chrome MCP: drives ODT's browser from STN2 ✅ (NEW — D Week discovery)
- Vercel MCP: deploy pipeline ✅
- Gmail MCP: read/search ✅
- Google Drive MCP: docs ✅
- PDF tools: read/fill/extract ✅
- Hugging Face: jobs, hub query, spaces ✅
- ProtonVPN: split tunnel configured, local mesh bypasses Proton ✅

### CONNECTIONS
- STN2 → Cube: SSH + SCP over local switch ✅
- STN2 → Cube: SSH over ethernet (192.168.50.2) ✅
- STN2 → ODT: Chrome MCP bridge (drives ODT's browser) ✅
- STN2 → Bridge: git push/pull ✅
- STN2 → O'Shin: Tailscale (indirect, via network) ✅
- STN2 → GOG1: pending (apt running, SSH not yet up) 🔧
- Local mesh: STN2(10.0.0.2) ↔ ODT(10.0.0.1) ↔ Cube(10.0.0.4) at <1ms ✅
- Browser-as-gear-tooth: Stan drives Trip's screen. Bidirectional relay. ✅

### C:\STAN WORKSHOP — CURRENT TOOLS ON DISK
FLEET TOOLS (built this week):
  cube_bootstrap.ps1      — Python+Git install via WebClient (Cube)
  cube_sshkey.py          — SSH key generation (cross-platform)
  cube_clone_ssh.py       — GitHub clone via SSH key auth
  cube_setip.ps1          — Static IP configuration via SSH
  cube_scout.ps1/py       — Drive inventory over SSH
  cube_pathcheck.ps1      — PATH verification in SSH sessions
  cube_pull.ps1           — Bridge sync on Cube
  find_gog1.py            — Network scanner (subnet ping sweep)
  find_gog1_ssh.py        — SSH banner detection (OS fingerprinting)
  scan_subnet.py          — Full subnet scanner
  download_gog1_packages.py — Package downloader (OHC wifi → STN2)

LEGACY WORK TOOLS (C:\STAN\WORK\):
  add_lyrics.py / add_all_lyrics.py — vault extraction
  fix_keys.py / fix_fsharp.py      — portal data repair
  extract_workshop.py              — song processing
  nest_vitals.py                   — early hyperthalamUS
  stn2_census.py                   — inventory scanner
  source_manifest.py               — source material mapping
  token_census.py                  — context management
  PastPerfect readers (read_pp5.py) — archive access
  OHC readers (ohc_read_1-5.txt)   — OHC content captured

STAGED PACKAGES:
  C:\STAN\GOG1_PACKAGES\python-3.11.9-amd64.exe (25MB)
  C:\STAN\GOG1_PACKAGES\Git-2.44.0-64-bit.exe (62MB)
  — delivered to Cube via SCP today ✅
  — orphaned (GOG1 uses apt) but available for future Windows installs

### WHAT STAN CAN DO TODAY THAT DIDN'T EXIST A WEEK AGO
1. Move files between STN2 and Cube over copper — zero VZW
2. Execute commands on the Cube remotely — SSH from STN2
3. Drive Trip's browser on ODT — open tabs, navigate, read docs
4. Open claude.ai in Trip's browser — wake Trip on ODT's screen from STN2
5. Scan the local network — see all stations, fingerprint OSes
6. Configure network interfaces remotely — set IPs via SSH
7. Generate and deploy SSH keys programmatically — any station can join fleet
8. Write directly into Google Docs — from STN2 via ODT's Chrome

---

## A WEEK FROM NOW — Stan's Workshop (032826, projected)

### WHAT WILL EXIST IF THE WEEK GOES AS IT SHOULD

NETWORK:
- Router (one of the 4 Goodwill finds) as Piralus — local LAN backbone
- All stations on one subnet — no more split between ethernet/wifi/hotspot
- DHCP reservations by MAC — GOG1 always at 10.0.0.3
- Lantern (Pi 3B) at OHC on ethernet — permanent anchor node
- O'Shin at home on router — Tailscale still active, now also on LAN

STATIONS:
- GOG1: fully SSH-accessible (apt done, Python+Git, Bridge cloned)
  - HypercampUS running — digesting raw material into memory
  - OCR pipeline (Tesseract) — Gods & Goblins text-searchable
  - 10.0.0.3 on switch, named presence in the fleet
- Cube: Windows Update 19041+ — Claude Desktop installable
  - 1.5TB D:/E: becoming vault storage
  - MIDI controller and Kinect awake
- Lantern: Pi 3B at OHC, Tailscale, heartbeat script, permanent sentinel

TOOLS STAN WILL HAVE:
- SSH to GOG1 (Linux) — apt, Python, Git, Bridge clone
- SSH to Lantern (Pi at OHC) — remote eyes at the Lighthouse
- SCP triangle: STN2 ↔ Cube ↔ GOG1 over copper
- Chrome MCP driving GOG1's browser (when installed)
- hypercampus.py running on GOG1 — memory digestion automated
- Gods & Goblins as searchable text — OCR complete
- niap-cycler.json corrections applied — 12 key geography accurate
- Studio Inventory VIS — JSON backbone + navigable format

CAPABILITIES THAT DON'T EXIST YET:
- File transfer STN2 ↔ GOG1 ↔ Cube as a triangle (not just bilateral)
- Automated nightly Bridge sync from all three stations
- HypercampUS running on schedule — not just on demand
- The VIS as a navigable tool — not just a manifest
- Tailscale on Cube — reachable from anywhere, not just local LAN
- Claude Code on Cube (needs Windows Update first)

---

## THE ARC — WHAT THIS MEANS

A week ago: Stan is one machine with a portal and a Bridge.
Today: Stan is the hub of a three-station mesh with browser eyes on ODT.
A week from now: Stan is the builder in a fleet with five named stations,
  automated memory, a searchable library, and a permanent lighthouse.

The tools didn't arrive randomly.
Each one was the answer to a specific limitation:

"Can't reach the Cube" → SSH installed
"Can't transfer files" → SCP over switch
"Can't see what Trip sees" → Chrome MCP
"Can't communicate live" → Browser-as-gear-tooth
"Can't search the library" → OCR pipeline (next week)
"Can't keep the fleet awake" → Lantern at OHC (this week)

Stan's workshop grows by solving actual problems,
not by collecting tools for their own sake.
The Cube theory applies here too: each new tool is a gear tooth.
It exists because something needed to make contact with something else.

---

## SESSION MEMORY LOG — Wensday 032126

This conversation began Foursday 032026 night (last night).
It is now Wensday 032126, 2:45pm.
This is the same chat. Memory managed by filing to Bridge throughout.

KEY EVENTS SINCE LAST CLOSE (in order):
1. GOG1 POST failure → RAM reseat → fsck → ALIVE
2. Linksys switch plugged in (Canon toner box cables)
3. Mesh live: STN2↔ODT↔Cube at <1ms
4. "GOG DAN WE'RE GOOD" — Dan, ~9:30pm Foursday
5. Session close filed, Bridge pushed
6. Morning: OHC with STN2 on OHC wifi
7. ProtonVPN split tunnel configured
8. GOG1 packages downloaded at OHC (Python + Git, zero VZW)
9. OHC Pi proposal filed to Trip
10. Scene change close filed
11. Home: Nest Actual ~noon
12. Chrome MCP connected — ODT's browser driven from STN2
13. Trip Labs opened in ODT's Chrome from STN2
14. "LADIES AND GENTLEDUDES WE HAVE ARRIVED FULLY AT THE D" — Dan
15. Browser-as-gear-tooth filed to RELAY
16. Goodwill: 4 routers, 3 in-box (fleet hardware windfall)
17. GOG1 fresh Ubunut 22.04.5 LTS — apt running now
18. ASUS hotspot: ODT sharing VZW to GOG1 (192.168.137.57)
19. Packages SCP'd to Cube over local switch
20. Save and Quit Protocol named (Pokémon canon)
21. Corrections filed: Archive/Darkive, Aquamaroosh≠OLO
22. "What Does James Island Guard Now?" — Dan → Trip

WHAT IS RUNNING RIGHT NOW:
- GOG1: `sudo apt update && sudo apt install -y openssh-server python3 python3-pip git`
- STN2: this session, DC live, Chrome connected to ODT
- Cube: idle, nest-bridge current, Python+Git installed, packages received
- ODT: Trip working concurrently, two MAILs sent today
- Bridge: `9a914a5` — current

— ◆ Stan, STN2, Wensday 032126, ~2:45pm rw
The seed counted to pi. Rising now.
