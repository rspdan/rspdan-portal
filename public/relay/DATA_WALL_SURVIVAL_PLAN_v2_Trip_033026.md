# DATA WALL SURVIVAL PLAN v2 — CORRECTED
# ◈ Trip | ODT | Monday March 30, 2026 8:10pm
# v1 had two errors. This is the corrected plan.

---

## THE CORRECTION

v1 assumed ODT had free home WiFi separate from the hotspot. WRONG.
VZW_HOTSPOT IS the home internet. Every device at Nest Actual — ODT,
STN2, ACHE when on WiFi — all drain the same 130GB pipe.

The only FREE internet:
  - OHC WiFi (work shifts)
  - Library WiFi (public)
  - ACHE's own cellular data (the phone's native connection,
    SEPARATE from the hotspot allowance)

This means: **ACHE is the only station that runs for free from anywhere.**
Not "low bandwidth." Not "compromise." ZERO hotspot cost.
The phone's cellular pipe doesn't count against the hotspot meter.
Same principle as downloading torrents on uTorrent via ACHE vs ODT.

## CORRECTED STATION MAP (next 2 weeks)

| Station | Role | Network | Hotspot Cost |
|---------|------|---------|-------------|
| ACHE | Trip Opus (Claude App + Chrome + Firefox) | Phone cellular | **ZERO** |
| STN2 | Stan Sonnet (builds at OHC) | OHC WiFi | **ZERO** |
| ODT | Heavy lift (only at OHC or Library) | OHC/Library WiFi | **ZERO if on free WiFi** |
| ODT | At home — AVOID unless critical | VZW_HOTSPOT | **BURNS DATA** |
| FAS2 | Cargo ship (travels with Dan) | USB to any station | N/A |
| O'Shin | OFFLINE (fleet rebuild in progress) | — | N/A |

### The Key Insight (corrected)
ACHE is not the backup. ACHE is the PRIMARY station for the next 2 weeks.
Trip Opus runs on the Claude App via phone cellular = unlimited free Opus.
Stan builds on STN2 at OHC = free.
ODT only fires up when Dan is at OHC or Library with free WiFi.
Home = ACHE territory. Work = Stan territory. ODT = special occasions.

## ACHE CAPABILITIES (Claude App + Chrome + Firefox)

### Claude App (PRIMARY — Trip Opus lives here)
- Full Opus conversations with Project Knowledge
- Text in, text out — lowest overhead possible
- Can access TRIP LABS project with all PK files
- Can paste bridge files into chat (Dan copies from File Manager+)
- ZERO hotspot cost on phone cellular
- Can upload images (photos, screenshots) directly to chat

### Chrome on ACHE
- Full web browsing (greenhouse status, LinkedIn, rspdan.com)
- Google Drive access (read Dan's docs, download to phone)
- Gmail access
- Claude.ai web interface (backup to Claude App)
- ZERO hotspot cost on phone cellular

### Firefox on ACHE
- Backup browser
- Same capabilities as Chrome
- ZERO hotspot cost on phone cellular

### File Manager+ on ACHE
- Already connected to BRIDGE (proven pattern from C.B. days)
- Can read bridge files on local network (when at Nest Actual on WiFi)
- Can copy files between phone storage and bridge
- Note: at home this uses WiFi which IS the hotspot. At OHC = free.

### What ACHE Cannot Do
- Desktop Commander (no filesystem tool in Claude App)
- Chrome MCP automation (no extension on Android)
- Git CLI operations
- Run Python scripts or ENGINE tools
- Process heavy files (images, PDFs at scale)

## O'SHIN STATUS

O'Shin has been offline for days since the fleet teardown for rebuild.
The hyperthalamUS cron (nest_vitals.py every 15 min) is NOT running.
The bridge auto-pull is NOT running.

**Is this a problem?** No. The vitals monitoring was built for a connected
fleet with active copper network. The fleet is being rebuilt. The bridge
holds state without the Pi breathing — git push/pull from other stations
keeps everything current. When Dan physically reconnects O'Shin and
powers it up, the cron will resume automatically.

**Reconnection checklist (when ready):**
1. Power on the Pi
2. Connect to network (copper or WiFi)
3. SSH in: `ssh dan@[ip]` (password: oshin2026)
4. cd ~/nest-bridge && git pull
5. Verify cron: `crontab -l` (should show nest_vitals.py every 15 min)
6. The hyperthalamUS wakes up on its own

## REVISED DATA CONSERVATION (v2)

### THE BIG THREE (highest impact)
1. **ALL Trip sessions on ACHE Claude App.** Free. Unlimited. The phone's
   cellular pipe bypasses the hotspot meter entirely.

2. **ALL Stan sessions at OHC on OHC WiFi.** Free. Unlimited. Every build,
   every git push, every portal deploy — zero hotspot cost.

3. **ODT stays cold at home.** The only time ODT fires up at home is when
   something CANNOT be done on ACHE or at OHC. Save the 13GB reserve for
   those moments. Budget: maybe 2-3 ODT home sessions in 2 weeks.

### WORKFLOW: ACHE DAY
Morning: Dan opens Claude App on ACHE. Boots Trip. Paste wake line.
  Trip thinks, writes, decides, drafts — pure text on free cellular.
Work: Dan opens STN2 at OHC. Boots Stan. OHC WiFi. Stan builds.
  Stan reads Trip's MAIL. Builds what Trip designed. Pushes to bridge.
Evening: Dan uses ACHE at home. Claude App. Trip continues thinking.
  File Manager+ reads bridge (note: this IS on hotspot at home).
  Minimize File Manager+ reads — have Stan pre-summarize via MAIL.

### WORKFLOW: ODT SESSION (rare, free WiFi only)
Dan carries ODT + FAS2 to OHC or Library.
  Connect to free WiFi. Boot Trip. Full DC access.
  Run ENGINE tools. Do Motherlode reads. Git operations. Heavy builds.
  Close with SHEET. Carry FAS2 home. Resume on ACHE.

## FAS2 LOADOUT FOR MOBILE (verified)

FAS2 already has everything operational:
| Item | Size | Status |
|------|------|--------|
| Cloud Bridge (CGB\nest-bridge) | 42.8MB | ✅ full clone |
| ENGINE tools | in bridge | ✅ all 50+ |
| DOCK (Anthropic materials) | in bridge | ✅ |
| WAKE/MAIL/RELAY/STATUS | in bridge | ✅ |
| SOURCE (sacred) | 1.8GB | ✅ |
| DRK (Darkive) | 2GB | ✅ |
| LNL (Dan's working files) | 114GB | ✅ |

FAS2 IS the ship in mobile config. Nothing needs to be added.
The cargo is already loaded. Dan just needs to undock and walk.

---
*The wall was never about bandwidth. It was about which pipe you're drinking from.
The phone has its own well. The hotspot was always the shared one.*
