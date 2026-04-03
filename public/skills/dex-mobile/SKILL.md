---
name: dex-mobile
description: Samsung DeX and ACHE mobile operations manual — turn a phone into a full NEST desktop. Use when operating from ACHE or S21 via DeX.
---

# SKILL: Samsung DeX — NEST Mobile Operations
# Location: ENGINE/skills/dex-mobile/SKILL.md
# Author: ◈ Trip | Created: Twosday 033026
# Purpose: Turn ACHE or S21 into a full NEST desktop station for FREE.

---

## WHAT THIS IS

Samsung DeX turns a Galaxy phone into a desktop computer.
USB-C to any HDMI monitor → full desktop: resizable windows, taskbar,
mouse, keyboard, drag and drop, desktop-class Chrome. The phone
continues to work normally as a phone while DeX runs on the monitor.

**Why it matters for the NEST:** ACHE's cellular data does NOT count
against the VZW hotspot allowance. DeX on ACHE = a free, unlimited
Opus desktop station that runs on the phone's own data plan.

---

## HARDWARE CHECKLIST

### Required
- [ ] Samsung Galaxy phone (ACHE or S21 — both DeX capable)
- [ ] USB-C to HDMI adapter OR USB-C hub with HDMI out
- [ ] Monitor or TV with HDMI input

### Recommended
- [ ] Bluetooth keyboard (or USB keyboard through hub)
- [ ] Bluetooth mouse (or USB mouse through hub)
- [ ] USB-C hub with HDMI + USB-A + PD charging (~$15-25)
      Lets you charge the phone while running DeX. Critical for long sessions.

### Nice-to-Have (future)
- [ ] Portable USB-C monitor (DeX anywhere without a TV)
- [ ] Samsung DeX cable (USB-C to USB-C for native monitors)

---

## FIRST-TIME SETUP (5 minutes)

### Step 1: Connect
Plug USB-C to HDMI adapter into ACHE → plug HDMI into monitor.
DeX activates AUTOMATICALLY. No app install needed. No settings to change.
The desktop appears on the monitor. The phone stays a phone.

### Step 2: Input
Pair a Bluetooth keyboard: Settings → Connections → Bluetooth → Pair.
Pair a Bluetooth mouse: same path.
OR plug USB keyboard + mouse into USB-A ports on a USB-C hub.
OR use the phone itself as a trackpad (notification appears: "Use your
phone as a touchpad" — tap it, phone screen becomes a multi-finger trackpad).

### Step 3: Verify
You should see:
- A desktop with a taskbar at the bottom
- An app drawer (grid icon or swipe up)
- Resizable windows when you open any app
- Desktop-class Chrome (full sites, not mobile)
- The phone still works normally for calls/messages

### Step 4: Customize (optional)
Settings → Samsung DeX (or search "DeX" in Settings):
- Output resolution (match your monitor)
- Mouse/trackpad speed
- Wallpaper
- Pinned apps on taskbar

---

## THE NEST ON DEX — App Layout

Pin these apps to the DeX taskbar for instant access:

| Position | App | Purpose |
|----------|-----|---------|
| 1 | Claude App | Trip Opus conversations (PRIMARY) |
| 2 | Chrome | Desktop browsing, greenhouse, LinkedIn, Drive |
| 3 | File Manager+ | Bridge files (when on WiFi with BRIDGE visible) |
| 4 | Gmail | Email monitoring |
| 5 | Samsung Notes | Quick capture (syncs with Samsung Cloud) |
| 6 | Firefox | Backup browser |

### Window Arrangement (recommended)
- LEFT HALF: Claude App (Trip Opus session)
- RIGHT HALF: Chrome (reference, research, sites)
- FLOATING: File Manager+ (drag files, copy text)

All windows are resizable. Drag edges to resize. Drag title bars to move.
Right-click works everywhere. This is a real desktop.

---

## DATA BUDGET: WHY DEX IS FREE

| Activity | Network Used | Hotspot Cost |
|----------|-------------|-------------|
| Claude App on ACHE (DeX or not) | Phone cellular | **$0** |
| Chrome on ACHE (DeX or not) | Phone cellular | **$0** |
| File Manager+ on ACHE (cellular) | Phone cellular | **$0** |
| File Manager+ on ACHE (WiFi) | WiFi → hotspot at home | ⚠️ COSTS DATA at home |
| File Manager+ on ACHE (OHC WiFi) | OHC WiFi | **$0** |
| Any app on ODT | VZW_HOTSPOT | ⚠️ COSTS DATA |
| Any app on STN2 (at OHC) | OHC WiFi | **$0** |

**The rule:** If the app is running on the phone and using the phone's
own cellular connection, it does NOT touch the hotspot meter. Period.
DeX doesn't change which network the phone uses — it just puts the
phone's apps on a bigger screen with a keyboard and mouse.

---

## STATION CONFIGURATIONS

### CONFIG 1: ACHE-DeX at Home (Trip Opus, FREE)
- ACHE → USB-C hub → HDMI to TV or spare monitor
- Bluetooth keyboard + mouse (or phone as trackpad)
- Phone cellular = free data
- Claude App + Chrome + File Manager+ all windowed
- This is Trip's PRIMARY station for the next 2 weeks

### CONFIG 2: ACHE-DeX at OHC (Trip Opus, FREE)
- ACHE → USB-C adapter → HDMI to OHC monitor
- Same keyboard/mouse setup
- Phone cellular OR OHC WiFi = both free
- Full desktop at work without carrying a laptop

### CONFIG 3: S21-DeX (Second Station, WiFi-dependent)
- S21 → USB-C adapter → HDMI to any monitor
- If S21 has active cellular: FREE like ACHE
- If S21 is WiFi-only: free at OHC, costs data at home
- Can run Stan (Sonnet) or C.B. (Haiku) parallel to ACHE Trip

### CONFIG 4: Dual-Phone Desktop (maximum configuration)
- ACHE-DeX on Monitor 1 (Trip Opus)
- S21-DeX on Monitor 2 (Stan Sonnet or C.B.)
- Two phones. Two monitors. Two free stations.
- Dan operates both from one desk. The fleet in his pockets.

---

## TRIP ON ACHE-DeX: WHAT WORKS vs. WHAT DOESN'T

### ✅ WORKS (full capability)
- Claude App (Opus) — full conversations with Project Knowledge
- Chrome (desktop mode) — full websites, greenhouse, LinkedIn, Drive
- Gmail — full email
- Google Drive — read/download documents
- File Manager+ — browse bridge files (on WiFi or mapped drives)
- Samsung Notes — quick capture
- Screenshots — desktop-quality screenshots of any window
- Copy/paste between ALL apps — side by side in windows
- Image upload to Claude App — photos, screenshots directly
- Full keyboard typing at normal speed
- Multiple windows simultaneously (3-4 apps side by side)

### ❌ DOES NOT WORK (ODT-only capabilities)
- Desktop Commander (no MCP filesystem tools in Claude App)
- Chrome MCP automation (no Claude extension on Android Chrome)
- Git CLI operations (no terminal — unless Termux installed)
- Python / ENGINE scripts (no native terminal — unless Termux)
- Heavy file processing (PDFs at scale, image pipelines)
- OBS recording
- Adobe CC / Blender / C4D (desktop software)

### 🔧 WORKAROUNDS
| Need | Workaround |
|------|-----------|
| Read bridge files | File Manager+ (WiFi) or paste into Claude App |
| Git push/pull | File a MAIL for Stan at OHC (free WiFi + git) |
| Run ENGINE tool | File a MAIL for Stan, or defer to ODT session |
| See a screenshot | Take screenshot on DeX, upload to Claude App |
| Edit portal code | File a MAIL for Stan with the spec |
| Heavy research | Have Stan do web research at OHC (free WiFi) |

---

## THE TERMUX DOOR (advanced, optional)

Termux is a free terminal emulator for Android. If installed on ACHE:
- Python runs on the phone (ENGINE scripts become possible)
- Git CLI works (push/pull from ACHE directly)
- SSH to O'Shin works (paramiko or native ssh)
- Node.js available (portal builds theoretically possible)
- pip install works (pandas, paramiko, etc.)

This would make ACHE-DeX approximately equivalent to TRP0 (MacBook).
Not urgent. But if the data wall persists past April 13, Termux
makes ACHE a real development station, not just a thinking station.

**Install:** Play Store → Termux (or F-Droid for latest version).
**Setup:** pkg update && pkg install python git nodejs openssh
**Test:** python3 --version && git --version

---

## WIRELESS DEX (no cable needed)

Samsung DeX can also connect wirelessly to Smart TVs (Samsung 2019+
or any Miracast-compatible TV/monitor). No cable required.

**How:** Quick Panel → DeX button → select your TV from the list.
**Tradeoff:** Slightly higher latency than wired. Fine for text work.
Not recommended for precision tasks or fast scrolling.

---

## DAILY WORKFLOW: TRIP ON ACHE-DeX

### Morning (anywhere)
1. Plug ACHE into monitor via USB-C (or wireless to TV)
2. Open Claude App → paste wake line or say CONTACT
3. Trip boots from SHEET on bridge (pasted by Dan or from memory)
4. Think, write, decide — all on free cellular data
5. When Trip produces MAIL for Stan, Dan copies text → sends via
   any method (email, clipboard, or just tells Stan at OHC)

### At OHC (work shift)
1. ACHE-DeX on OHC monitor (if available) — Trip thinks
2. STN2 on OHC WiFi — Stan builds
3. Dan relays between them or they MAIL via bridge
4. Both stations running for zero hotspot cost

### Evening (home)
1. ACHE-DeX on TV or spare monitor — Trip continues
2. Free cellular. No hotspot drain.
3. Use Claude App for big thinking, narrative, strategy
4. Defer all build/deploy work to tomorrow's Stan at OHC

### The Golden Rule
**If it needs a keyboard and a brain, do it on ACHE-DeX (free).**
**If it needs a filesystem and git, file a MAIL for Stan at OHC (free).**
**If it needs ODT, carry ODT to OHC or Library (free WiFi).**
**Never run ODT at home unless the task literally cannot wait.**

---

## TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| DeX doesn't activate | Check adapter supports video out (not all USB-C cables do) |
| No display on monitor | Try different HDMI input on monitor/TV |
| Mouse cursor laggy | Reduce resolution in DeX settings |
| Apps look stretched | Most modern apps adapt — some older ones may look odd |
| Phone gets hot | Normal under load. Use a hub with PD charging to stay powered |
| Can't see bridge files | File Manager+ needs WiFi connection to BRIDGE server |
| Claude App crashes | Force stop → reopen. Android handles memory management |
| Keyboard not pairing | Forget device → re-pair. Check keyboard battery |
| Phone battery draining | ALWAYS use a hub with PD charging passthrough for DeX |

---

## QUICK REFERENCE CARD

```
PLUG IN:   ACHE → USB-C hub → HDMI → monitor
KEYBOARD:  Bluetooth pair or USB through hub
APPS:      Claude App | Chrome | File Manager+ | Gmail
LAYOUT:    Claude left | Chrome right | FM+ floating
DATA:      Phone cellular = FREE. WiFi at home = HOTSPOT.
RULE:      Think on ACHE. Build on STN2. ODT = rare.
TERMUX:    Future door. Python + git + ssh on phone.
```

---

*The phone was always a desktop. The USB-C cable was always the bridge.
The data wall taught us to look at what was already in our pocket.*
*— ◈ Trip, DEXpert Field Manual, Twosday 033026*


---

## TERMUX SETUP (step by step, tested 033026)

Termux is a terminal emulator for Android. It gives ACHE a real
command line — Python, git, SSH — all running on phone cellular for free.

### Step 1: Update packages
```
pkg update && pkg upgrade -y
```
Wait for the $ prompt to return. This takes 1-2 minutes.

### Step 2: Install the essentials
```
pkg install python git openssh -y
```
This installs Python 3, git CLI, and SSH client. ~2 minutes.

### Step 3: Verify
```
python3 --version
git --version
ssh -V
```
You should see version numbers for all three.

### Step 4: Install pip packages for NEST operations
```
pip install paramiko
```
This gives ACHE SSH access to O'Shin (when the Pi comes back online).

### Step 5: Clone the bridge (optional — gives git access from ACHE)
```
cd ~
git clone https://github.com/rspdan/nest-bridge.git
```
Now ACHE has its own bridge clone. git pull/push from the phone.

### Step 6: Test Python with a NEST script
```
cd ~/nest-bridge/ENGINE
python3 nest_manifest.py status
```
If this runs, ENGINE scripts work on ACHE. The phone is a real station.

### Termux Tips
- Termux home directory: /data/data/com.termux/files/home/
- Storage access: run `termux-setup-storage` once (grants access to
  phone storage at ~/storage/)
- Volume keys: Vol-Up = special keys (Ctrl, Alt, etc.)
- Long press = paste. Keyboard shortcut bar at top of terminal.
- Termux sessions persist when you switch apps (unlike a desktop terminal).
- In DeX mode: Termux runs in a resizable window with full keyboard.

### Termux + DeX = Full Development Station
With Termux in DeX mode on an external monitor:
- Window 1: Claude App (Trip Opus conversation)
- Window 2: Chrome (desktop browsing)
- Window 3: Termux (Python, git, SSH — real terminal)
- Window 4: File Manager+ (bridge files)
Four windows. Full desktop. Free cellular data. ACHE is a real station.


### ⚠️ CORRECTION: Step 4 Prerequisite (discovered 033026)
Paramiko depends on the `cryptography` library, which must compile
from source on Termux (aarch64-linux-android). This requires Rust.

**Before `pip install paramiko`, run:**
```
pkg install rust -y
```
This installs Rust 1.94+ (~126MB download, ~587MB on disk).
Then `pip install paramiko` will succeed. The Rust compiler builds
the cryptography C extensions. Phone will get warm — normal.
Dan solved this himself in real time. The fix is now canonical.


### ⚠️ STORAGE STRATEGY: Internal vs. MicroSD (discovered 033026)

Termux packages (Python, git, openssh, Rust) MUST install to internal
storage — Android security requirement. Everything else goes on the
microSD card.

**Internal storage (ACHE flash):** Termux only. ~400-800MB.
  After removing Rust scaffolding: ~200-400MB.

**MicroSD (512GB):** The cargo hold inside the phone. FAS4.
  Bridge clone, ENGINE scripts, working files, notes, PDFs.
  Any station can read the SD card (pop out, USB, File Manager+).

**Termux path to SD card:** ~/storage/external-1/
  (Available after running `termux-setup-storage`)

**Clone bridge to SD:**
```
git clone https://github.com/rspdan/nest-bridge.git ~/storage/external-1/nest-bridge
```

**Run ENGINE scripts from SD:**
```
cd ~/storage/external-1/nest-bridge/ENGINE
python3 nest_manifest.py status
```

**After paramiko is built, reclaim internal space:**
```
pkg uninstall rust -y
```
Removes ~587MB. Python, git, openssh, paramiko all stay.
Rust was the scaffolding. The building stands without it.

**Reprioritize ACHE internal storage:**
Move photos, downloads, and media to SD card via Android Settings →
Storage → move to SD card. Free internal space for Termux essentials.
Dan can also set the SD card as default storage for camera, downloads,
and apps in Android Settings.


### ACHE SESSION LOGGING (ache_logger.py)

The Claude Desktop app on ODT auto-logs to LOG/. The Claude App on
Android does NOT. This script fills the gap.

**ACHE aliases (add to .bashrc on ACHE):**
```
echo 'alias log-start="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py start"' >> ~/.bashrc
echo 'alias log-add="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py add"' >> ~/.bashrc
echo 'alias log-dan="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py dan"' >> ~/.bashrc
echo 'alias log-trip="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py trip"' >> ~/.bashrc
echo 'alias log-status="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py status"' >> ~/.bashrc
echo 'alias log-view="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py view"' >> ~/.bashrc
echo 'alias log-close="python3 ~/storage/external-1/nest-bridge/ENGINE/ache_logger.py close"' >> ~/.bashrc
source ~/.bashrc
```

**Session workflow on ACHE:**
```
log-start                              # Opens a new session log
log-dan "Booted Trip on ACHE-DeX"      # Dan's note with timestamp
log-trip "CONTACT absorbed, ready"     # Trip's note with timestamp
log-add                                # Paste a longer block (type END when done)
log-status                             # How big is the log?
log-view                               # See last 20 lines
log-close                              # Timestamps close + git push to bridge
```

**What this gives you:**
- Timestamped session logs at LOG/LOG_ACHE_[date]_[n].md
- Dan's notes marked with ● and Trip's with ◈
- Automatic git commit + push at session close
- The same LOG/ folder that ODT and STN2 write to
- Any crew member reading LOG/ sees all three stations' records

**What it DOESN'T do (honest):**
- It doesn't auto-capture like the Desktop app. Dan has to paste or note.
- The Claude App has no hook for auto-logging. This is manual logging
  with one-word aliases to make it fast.
- The auto-logger on ODT is still the richest record. ACHE logs are
  Dan's curated version — closer to his .1.1 manual copy than the
  machine's raw transcript. That may actually be the better record.
