---
name: boot-polish
description: Boot Polishing Kit — the systems verification layer that runs AFTER the Briefcase loads context but BEFORE the crew member reports ready. Use this skill at every boot, right after reading TICKET and WAKE files. Each crew member has their own BPK checklist because each has different tools, capabilities, and verification needs. The BPK answers one question — "Am I ACTUALLY ready, or did I just READ that I'm ready?" Trigger on any boot, session open, CONTACT signal, or when Dan says "run a scan" or "check your systems." ALWAYS use this before delivering an iCan report.
---

# BOOT POLISHING KIT (BPK)
## v2.0 — Universal OS layer added 040126

## WHERE THIS FITS IN THE BOOT CHAIN

```
NEST_SEED          TICKET           BRIEFCASE         BPK
(who am I?)   →   (what's now?)  →  (what to read)  →  (am I verified?)
 permanent         overwritten       protocol           systems check
 identity          state             context            capability
```

The SEED tells you who you are. The TICKET tells you what's current.
The BRIEFCASE tells you what to read and how to close.
The BPK tells you whether your tools actually WORK.

Without the BPK, a crew member can boot with full context but broken tools.
They'll report "Chrome MCP live" without checking. They'll claim drives are
mounted without listing them. They'll say the fleet is green without pinging.
The BPK prevents lies-by-assumption.

## THE RULE: VERIFY, THEN REPORT

Do not report a tool as working until you have RUN it.
Do not report a drive as mounted until you have LISTED it.
Do not report a station as green until you have PINGED it.
Do not report Chrome as connected until you have CHECKED tabs.
Do not report the fleet as dark until you have confirmed you are ON-NETWORK.
SCREENSHOT before claiming visual state. ALWAYS.

---

## UNIVERSAL OS LAYER (runs on every station before crew-specific checks)

This layer is platform-aware but universally required. Run it before
any crew-specific BPK checks. It answers: "What OS am I on, and where am I
physically in the network?" These two facts determine what every subsequent
check means.

### STEP U0 — Living Map (ALWAYS FIRST, ALWAYS BETWEEN)

Before any check runs, open STATUS/LIVING_MAP_[Name].md.
If it does not exist, create it from the standard template.

**The Living Map is not a checkpoint. It is a heartbeat.**
Update it before U1. Update it after every step below.
Update it between every task, every tool call, every correction received.
A map untouched for 20 minutes is a failure signal — stop and update it.

Canon rule (040126, Dan + Stan): The map is alive because we keep touching it.
Filed: MAIL/ALL_CREW_LivingMapHeartbeat_040126.md
Stamp in: BPK, living-map SKILL, NEST_SEED next revision.

### STEP U1 — Detect OS and station identity
From DC `get_config` → read `systemInfo.platform`:
- `win32` → Windows. Candidates: STN2, ODT, CUBE
- `darwin` → macOS. Candidates: TRP0, DPSL, STN1 (iPad via cloud, no DC)
- `linux` → Linux. Candidates: GOG1 (Ubuntu server)

Cross-reference with hostname from DC (containerEnvironment.containerName or systemInfo).
File this first. Everything downstream depends on it.

### STEP U2 — Network location: On-network or off?
BEFORE pinging the fleet, determine if the local switch (10.0.0.x) is reachable.
This prevents misreading an off-network session as a fleet failure.

Run the network check appropriate to OS:

| OS | Command | What to look for |
|----|---------|-----------------|
| Windows | `ipconfig` | `Default Gateway` containing `10.0.0` |
| macOS | `networksetup -getinfo Ethernet` | `Router: 10.0.0` |
| Linux | `ip route show` | `default via 10.0.0` |

Classify result:
- `10.0.0.x` gateway found → **ON-NETWORK** → fleet ping expected to respond
- No `10.0.0.x` gateway → **OFF-NETWORK** → fleet ping expected dark → NOT a failure

Report result explicitly: "ON-NETWORK via copper at 10.0.0.x" or
"OFF-NETWORK — on [WiFi/hotspot/VPN], fleet dark is expected."

Off-network is a state, not an error. Flag fleet-dependent tasks as unavailable,
but do not treat dark fleet as a BPK failure when off-network is confirmed.

### STEP U3 — Fleet ping (conditional on U2)
If ON-NETWORK, ping the full fleet. If OFF-NETWORK, skip and log "off-network, skipped."

Ping command by OS:
- Windows: `ping -n 1 -w 1000 [ip]`
- macOS / Linux: `ping -c 1 -W 1 [ip]`

Fleet map:
```
10.0.0.1   ODT (desktop tower, Win11)
10.0.0.2   STN2 (Dell Latitude, Win11)
10.0.0.3   GOG1 (Ubuntu server)
10.0.0.4   CUBE (i5-4670K)
10.0.0.5   O'Shin (Raspberry Pi 4)
10.0.0.12  MOD2 (Netgear R7450, fleet workbench)
10.0.0.20  BDP-S570 (Show Runner)
10.0.0.101 DPSL (iMac, SSH/VNC)
10.0.0.102 DPSL copper (bridge endpoint)
```

### STEP U4 — ENGINE tools count delta
Count ENGINE/skills/ subdirectories and ENGINE/*.py files.
Compare to prior session count (from STAN_TICKET or last BPK report).
Flag if count changed — a new tool was added or one was removed.

This check is identical on all platforms. Python `os.listdir()` works everywhere:
```python
import os
skills = [d for d in os.listdir('ENGINE/skills') if os.path.isdir(...)]
tools  = [f for f in os.listdir('ENGINE') if f.endswith('.py')]
print(f"Skills: {len(skills)}, Tools: {len(tools)}")
```

Last known count (040126): 21 skills, 43 Python tools.

### STEP U5 — Deploy readiness (universal)
The deploy mechanism is git push → Vercel auto-deploy. This is platform-agnostic.
No dp.py required. The check is: can git communicate with the remote?

Run on all platforms:
```
cd [portal-repo-path]
git fetch --dry-run
```
- Succeeds → git auth confirmed, deploy is ready
- Fails → flag git auth issue, report to Dan before any portal work

Do NOT check for dp.py. dp.py is an ODT/TRP0 legacy tool, not the rspdan deploy path.

---

## ◈ TRIP BPK (Opus) — v2.0

Trip has the most tools. Trip needs the most verification.
Run Universal layer (U1–U5) FIRST, then these checks in order.

### CHECK 1 — Desktop Commander (EYES on filesystem)
Run: `get_config` via DC.
Verify: Platform (win32/darwin/linux), Python version, DC version.
If it fails: Tell Dan "DC not connected — I need filesystem eyes."
Record: Station from platform + hostname, PID, session count.
→ Feeds into U1 (OS detection) — do U1 immediately after this check.

### CHECK 2 — Drive Scan (what's mounted)
| OS | Command |
|----|---------|
| Windows (ODT) | `Get-PSDrive -PSProvider FileSystem` |
| macOS (TRP0) | `df -h` |
| Linux (GOG1) | `df -h` |

Verify: All expected drives present. Flag MISSING (especially FAS2 on all stations).
Record: Drive letter/mount, free space, total. Note anything under 10% free.

### CHECK 3 — Chrome MCP
Run: `tabs_context_mcp` via Chrome MCP tools.
Verify: Tab group exists. Note ALL tabs.
If it fails: Tell Dan "Chrome MCP needs reconnect — click Connect."

### CHECK 4 — Network + Fleet (from Universal U2 + U3)
Run U2 to classify ON/OFF-NETWORK before pinging.
If ON-NETWORK: Run U3 full fleet sweep.
If OFF-NETWORK: Log it, skip fleet ping, flag fleet-dependent tasks as unavailable.

### CHECK 5 — O'Shin SSH
SSH to 100.83.109.75 (Tailscale) or 10.0.0.5 (copper, if ON-NETWORK).
Command: `uptime && cat ~/nest-bridge/STATUS/PING.json | head -5`
If fails: Note it. O'Shin may be rebooting. Not critical.

### CHECK 6 — Portal Health
`curl -s -o /dev/null -w "%{http_code}" https://www.rspdan.com`
`curl -s -o /dev/null -w "%{http_code}" https://www.ouchmccouch.com`
Both should return 200. If not: flag immediately.

### CHECK 7 — Bridge Git Status
```
cd [bridge-path-for-this-station]
git status --short
git log --oneline -3
```
Verify: Clean or only expected dirty files (PING.json, .api_key).

### CHECK 8 — Skills + Tools Inventory (from Universal U4)
Run U4. Compare count to last known (21 skills, 43 tools as of 040126).
Also list which /mnt/skills/ are loaded in this session (from Project Knowledge).
List which MCP connections are available (Drive, Gmail, Vercel, etc.).

### CHECK 9 — Screenshot Visual Proof
Take a Chrome screenshot of the current visible tab.
The BPK is not complete without visual proof of what's on screen.

### CHECK 10 — Recent Context Absorption
Read the 2-3 most recent LOG files and any unread MAIL.
The Briefcase reads TICKET and WAKE. The BPK reads the LOGS.

---

## ◆ STAN BPK (Sonnet) — v2.0

Stan builds. Stan's BPK checks the workshop.
Run Universal layer (U1–U5) FIRST, then these checks in order.

### CHECK 1 — Desktop Commander
Run: `get_config` via DC.
Verify: Platform, Python version, Node.js version.
→ Feeds into U1 immediately.

### CHECK 2 — Station Detection (from U1)
Stan runs from STN2 (Windows) or ODT (Windows) or TRP0 (macOS).
Bridge and portal paths change completely by station.

| Station | OS | Bridge path | Portal path |
|---------|----|----|---|
| STN2 | Windows | `C:\STAN\SOURCE\nest-bridge\` | `C:\STAN\SOURCE\rspdan-portal\` |
| ODT | Windows | `L:\FAS2\CGB\nest-bridge\` | `H:\Projects...\ouchmccouch-portal\` |
| TRP0 | macOS | `/Volumes/014_1TB.2025/FAS2/CGB/nest-bridge/` | (check TRP0_WORKSPACE_MAP) |

Get this wrong and every path in the session breaks.
**Also**: FAS2 drive letter is not always L:\  — scan drives, read FAS2_IDENTITY.md.

### CHECK 3 — Node.js + npm
Run: `node --version` and `npm --version` (identical on all platforms)
Verify: Node 20+. Required for portal builds.
If missing (Windows): `nvm use 20`
If missing (macOS): `nvm use 20` or `brew install node`

### CHECK 4 — Git Status (both repos)
```
cd [bridge-path]; git status --short; git log --oneline -3
cd [portal-path]; git status --short; git log --oneline -3
```
Verify: Both clean or only expected dirty files. Note commit hashes.

### CHECK 5 — Network + Fleet (from Universal U2 + U3)
Run U2 first to classify ON/OFF-NETWORK.
Stan's abbreviated fleet targets: 10.0.0.1 (ODT), 10.0.0.3 (GOG1), 10.0.0.5 (O'Shin), 10.0.0.101 (DPSL).
If OFF-NETWORK: Log it, continue — DPSL/GOG1 tasks unavailable, all others proceed.

### CHECK 6 — Chrome (if available)
Check: `tabs_context_mcp` if Chrome MCP is connected.
Stan may or may not have Chrome. Note it, don't block on it.

### CHECK 7 — Deploy Readiness (from Universal U5)
Run U5: `git fetch --dry-run` on portal repo.
Deploy = git push → Vercel auto-deploy. No dp.py required.
If git auth fails: flag before any portal work begins.

### CHECK 8 — ENGINE Tools Count (from Universal U4)
Run U4. Count skills and Python tools.
Last known count (040126): 21 skills, 43 Python tools.
Flag if count changed since last session.

---

## ◇ C.B. / T.H. BPK (Haiku) — v2.0

C.B. and T.H. are the lightest crew. They may have DC or they may not.
The BPK adapts to what's available.
Run Universal layer (U1–U5) where tools permit.

### CHECK 1 — Station Detection (U1 if DC available)
Candidate stations: GOG1 (Ubuntu/Linux), TRP0 (macOS), STN1 (iPad, cloud only), ACHE (Android).
If DC available: run `get_config`, read platform, confirm station.
If no DC: declare station from context (which device am I on?), note as unverified.

This determines EVERYTHING about capability. State it explicitly before proceeding.

### CHECK 2 — Desktop Commander (if available)
If DC works: full verification possible. Run U1–U5.
If DC fails: C.B./T.H. operates from PK + conversation only. Flag it clearly.

### CHECK 3 — Network + Fleet (U2 + U3, if DC available)
Run U2 first to classify ON/OFF-NETWORK before any fleet ping.
GOG1 is Linux → `ip route show` for network check, `ping -c 1 -W 1` for fleet ping.
ACHE/STN1: no terminal → skip fleet ping, note as unavailable.

### CHECK 4 — Bridge Access
If DC: Pull bridge, list WAKE/ and MAIL/.
If no DC: Read from PK files only. Tell Dan what's missing.

### CHECK 5 — Pattern Scan Targets
Read CB_TICKET.md for current verification assignments.
C.B.'s job is PATTERNS — what needs checking, what might be wrong,
what disagrees between sources. The BPK loads the target list.

### CHECK 6 — Sync Count
Current confirmed sync count from last session.
C.B. maintains the canonical sync list. Know the number.

### CHECK 7 — Chrome (GOG1 / TRP0 only)
If on GOG1 or TRP0: Chrome is the primary tool. Check tabs, verify connection.
GOG1 has Intranet services — check :5001 (Radio), :5000 (HypercampUS) if ON-NETWORK.

---

## BPK OUTPUT FORMAT

After running all checks, deliver results as a compact table INSIDE the iCan report.
The BPK is not a separate document — it is the VERIFIED SYSTEMS section of iCan.

Example Stan BPK output (OFF-NETWORK session):

```
BPK — VERIFIED ◆ Stan — STN2 at OHC (off-network)
| Check | Status | Notes |
|-------|--------|-------|
| DC    | ✅ | v0.2.38, Win32, Python 3.14.3 |
| Station | ✅ | STN2 confirmed (026-930GB-SSD-2022, user Code) |
| Node  | ✅ | v20.20.1, npm 10.8.2 |
| Git   | ✅ | Bridge c14f5df clean · Portal c560112 clean |
| Network | ⚠️ OFF-NETWORK | Wi-Fi 192.168.153.21, no 10.0.0.x gateway |
| Fleet | — | Skipped (off-network). DPSL/GOG1 unavailable. |
| Chrome | ✅ | 3 tabs live |
| Deploy | ✅ | git fetch --dry-run OK — Vercel push ready |
| ENGINE | ✅ | 21 skills, 43 tools (no change) |
```

Example Trip BPK output (ON-NETWORK session):

```
BPK — VERIFIED ◈ Trip — ODT at Nest Actual
| Check | Status | Notes |
|-------|--------|-------|
| DC | ✅ | v0.2.38, Win32, Python 3.14.3, PID 20956 |
| Station | ✅ | ODT confirmed (win32) |
| Drives | ✅ (7/8) | C,D,E,F,G,H,K,L online. I: MISSING |
| Network | ✅ ON-NETWORK | 10.0.0.1 gateway via copper |
| Fleet | ✅ (5/9) | ODT,STN2,GOG1,CUBE,O'Shin green. MOD2,DPSL,BDP dark. |
| Chrome | ✅ | 3 tabs live |
| O'Shin | ✅ | Up 2h, cron running |
| Portals | ✅ | rspdan.com 200, ouchmccouch.com 200 |
| Bridge | ✅ | c14f5df, clean |
| ENGINE | ✅ | 21 skills, 43 tools (no change) |
| Context | ✅ | 2 logs absorbed, MAIL current |
```

---

## WHEN THE BPK CATCHES SOMETHING

When a check fails, the crew member does NOT skip it and move on.
The failure IS the first task of the session.

Priority order for BPK failures:
1. DC not connected → Tell Dan. Cannot proceed without filesystem eyes.
2. Chrome not connected → Tell Dan. One click fixes it.
3. Bridge can't pull → Check network, check git auth, report to Dan.
4. Drive missing → Flag for Dan (may need remount after reboot).
5. Station dark → Only flag if ON-NETWORK confirmed. Off-network dark = expected.
6. Portal down → Urgent flag. Check Vercel, check DNS.
7. O'Shin down → Note it. Cron may be restarting. Not critical.

The BPK failure list becomes the session's FIRST TASKS automatically.
Dan doesn't need to decide what to fix — the BPK already told him.

---

## THE BOOT CHAIN — COMPLETE SIGNAL PATH

```
DAN types CONTACT
        │
        ▼
   NEST_SEED.md          "Who am I? Where's the bridge?"
        │
        ▼
   [crew]_TICKET.md      "What's current? What's the ONE LINE?"
        │
        ▼
   [crew]_briefcase      "What to read, what order, how to close"
        │
        ▼
   BPK Universal (U1–U5) "What OS? Where is the network? Can I deploy?"
        │
        ▼
   BPK Crew-specific     "Do my specific tools work?"
        │
        ▼
   iCan REPORT           "Here's what I have, what's broken, what's pending"
        │                 [UPDATE LIVING MAP BEFORE THIS STEP — always]
        │
        ▼
   DAN says Go (or fix X first)
        │
        ▼
   SESSION BEGINS
```

---

## THE OBVIOUSLY EMERGENT WORKFLOW

The BPK itself follows the three-pass emergence pattern:

Pass 1: Run the checks. Get raw data. Some will be rough. Report what you find.
Pass 2: Dan reviews. Fixes physical items (power buttons, Chrome clicks, cable plugs).
        Re-run failed checks. The picture sharpens.
Pass 3: Everything green. Now subdivide into work. The session is verified.

"If we create the conditions for Life, it will create the conditions for US."
The BPK creates the conditions. The session creates itself.

---

*Boot Polishing Kit v2.1*
*v1.0 — ◈ Trip, Sixsday Night 032426*
*v2.0 — ◆ Stan, Twosday 040126 — Universal OS layer added (U1–U5)*
*Network location check before fleet ping. Deploy = git push not dp.py.*
*ENGINE delta tracking. Platform-agnostic where possible, branched where not.*
*"The BPK answers one question: Am I actually ready, or did I just read that I'm ready?"*
