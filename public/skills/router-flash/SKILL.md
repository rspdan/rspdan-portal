---
name: router-flash
description: Netgear router flashing skill — specific to MOD2 (R7450). Use when flashing or reconfiguring the fleet router.
---

# NETGEAR ROUTER FLASHING SKILL
# ENGINE/skills/router-flash/SKILL.md
# Filed by: Stan (◆ Sonnet) | STN2 at Nest Actual | Fivesday 032326
# Status: CANONICAL — learned live during R7450 Piralus flash session

---

## WHAT THIS SKILL IS FOR

Flashing consumer Netgear routers with open-source firmware (OpenWrt,
DD-WRT, FreshTomato) so they can serve the NEST intranet. Covers the
full pipeline: hardware identification, firmware selection, flash method
selection, execution, and post-flash configuration.

Use this skill whenever: a new router arrives (RIFT Store, purchase,
gift), a router needs re-flashing or recovery, a router needs fleet
network configuration, or a "router won't accept firmware" situation
arises.

---

## STEP 0a — CHECK UAC STATE ON STN2 BEFORE ANY INSTALL

Dan's machine has UAC set to "Never notify" — the slider is all the way
to the bottom. No elevation prompt ever fires. Silent installs run without
any user interaction. DO NOT assume UAC will prompt. DO NOT tell Dan to
"click Yes." DO NOT add -Verb RunAs unnecessarily.

Check UAC state first on any session where installs are needed:

  $prompt = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System").ConsentPromptBehaviorAdmin
  # ConsentPromptBehaviorAdmin=0 → Never notify → silent install works, no prompt
  # ConsentPromptBehaviorAdmin=5 → Default → prompt for non-Windows changes
  # ConsentPromptBehaviorAdmin=2 → Always notify → full UAC prompt

On STN2 as of 032326: ConsentPromptBehaviorAdmin=0. Check, don't assume.

Dan's canonical quote on this: "I haven't used User Account Controls
since I was like 8 years old." If Dan says anything like this, it means
UAC is off and silent installs run clean. Filed as permanent protocol.

---

## STEP 0b — IDENTIFY HARDWARE BEFORE DOING ANYTHING

Read the label on the router's underside. You need:
- Model number (e.g. R7450, R7000, AX23, C6)
- Hardware version (e.g. v1, v2, v3)
- Region variant (US, EU, APAC — affects chipset)

Then look up the exact model+version on the OpenWrt Table of Hardware:
https://openwrt.org/toh/start

The chipset field determines everything:
- Whether OpenWrt fully supports WiFi or not
- Which flash method works (web UI, TFTP, nmrpflash)
- Flash image naming conventions

---

## CHIPSET QUICK REFERENCE

MT7621 (MediaTek): Full OpenWrt support including WiFi. Used in R7450
(Piralus), AX23 v1, most TP-Link Archer models. Recommended: OpenWrt.

BCM4709 (Broadcom ARM Cortex-A9, 1GHz dual-core): OpenWrt boots but
WiFi radios DEAD (no open-source BCM4360 driver). Used in R7000 Nighthawk,
R8000. DO NOT 30-30-30 reset — risk of brick. Recommended: DD-WRT or
FreshTomato (both have full WiFi). Flash via nmrpflash preferred.

IPQ8064/IPQ8065 (Qualcomm): Excellent OpenWrt support including WiFi.
Used in R7800, EA8500. Recommended: OpenWrt.

---

## FIRMWARE SELECTION

OpenWrt: First choice for MT7621/IPQ routers where WiFi works. Full
Linux, luci web UI, opkg package manager, SSH. Best for NEST integration
(can run Flask, Python, custom scripts). https://firmware-selector.openwrt.org/

DD-WRT: For Broadcom ARM (BCM4709) where OpenWrt has no WiFi. Long
history, Entware package system. Warning: newer Netgear stock firmware
may block DD-WRT .chk files. Workaround: flash FreshTomato first, then
flash DD-WRT from inside Tomato's admin panel. https://dd-wrt.com/support/router-database/

FreshTomato: For Broadcom ARM, especially reliable as a first-flash.
Good permanent choice too. https://freshtomato.org/

---

## FLASH METHOD A: Web UI Flash (simplest)

Use when: Router is running stock firmware and web UI is accessible.
Does NOT work when: New router is in "setup required" app lockdown mode.

Procedure:
1. Connect STN2 ethernet directly to router LAN port 1 (not WAN).
2. Admin PowerShell: netsh interface ip set address "Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1
3. Navigate Chrome to http://192.168.1.1 — login admin/password.
4. Advanced → Administration → Firmware Update → upload staged .img file.
5. Click Update. Wait 3-5 minutes. Do not touch power or browser.
6. Restore STN2 after flash: netsh interface ip set address "Ethernet" static 10.0.0.2 255.255.255.0 10.0.0.1

---

## FLASH METHOD B: nmrpflash (universal bypass)

Use when: Web UI is locked, app-setup mode is blocking, firmware
signature is rejecting the flash file, or you want maximum reliability.

nmrpflash uses Netgear's NMRP protocol at boot time, before firmware
fully loads. It cannot be blocked by Netgear's software restrictions.
Explicitly supports R7000, R7450, and most Netgear routers.

Prerequisites:
1. Download nmrpflash (latest): https://github.com/jclehner/nmrpflash/releases
   Get: nmrpflash-X.X.XX-win32.zip — stage to DOWNLOADS\nmrpflash\
2. Install Npcap: https://npcap.com/#download
   CRITICAL: Check "WinPcap API-compatible Mode" during install.
   Without this, nmrpflash cannot see the ethernet adapter.

Procedure:
1. Connect STN2 ethernet DIRECTLY to router LAN port 1. No switch.
2. Open Admin PowerShell. cd to nmrpflash folder.
3. List interfaces: .\nmrpflash.exe -L
   Find the interface with your current IP (Ethernet / net0).
4. Type the command but DO NOT PRESS ENTER YET:
   .\nmrpflash.exe -i [interface_name] -f [firmware_file.img] -vvv
5. POWER OFF the router. Wait 10 seconds.
6. Press Enter to start nmrpflash, then IMMEDIATELY power the router on.
   nmrpflash must be advertising BEFORE the router boots.
7. Watch for: "Received configuration request from [MAC]" — means working.
8. Watch for: "Reboot your device now." — ONLY THEN power cycle.
9. Allow 3-5 minutes for first boot into new firmware.

Troubleshooting if "No response after 60 seconds":
- Timing was off. Try again — power off router, start nmrpflash, then power on.
- Windows Defender may be blocking — add exception for nmrpflash.exe.
- Try disabling Windows Firewall temporarily during flash.

---

## POST-FLASH: OPENWRT

Router comes up at http://192.168.1.1 with no password (set one immediately).
System → Administration → set root password (enables SSH).
Network → Interfaces → configure LAN IP to NEST fleet assignment.
System → System → Hostname → set NEST name.
Network → Wireless → configure SSID and passphrase.
SSH after password set: ssh root@192.168.1.1

---

## POST-FLASH: DD-WRT / FRESHTOMATO

ALWAYS do factory reset before configuring:
DD-WRT: Administration → Factory Defaults → Reset
FreshTomato: Administration → Configuration → Erase NVRAM

This clears lingering stock settings that cause strange behavior.
Then configure router name, WiFi, LAN static IP, DHCP range.

---

## NEST FLEET IP ASSIGNMENTS (as of 032326)

10.0.0.1 ODT (gateway), 10.0.0.2 STN2, 10.0.0.3 GOG1,
10.0.0.4 CUBE, 10.0.0.5 O'Shin. 10.0.0.10+ available for routers.

---

## FLEET ROUTER ROLES (as of 032326)

R7450 (Piralus): MT7621, OpenWrt target. DHCP/DNS/routing brain.
AX23 v1 (EU v1.20): MT7621, OpenWrt target. WiFi zone 2.
R7000 Nighthawk: BCM4709, DD-WRT/FreshTomato target. WiFi zone 1 + compute.
  Warning: OpenWrt boots but WiFi dead on this chipset. Do NOT use OpenWrt.
4x RIFT Store units: identity unknown pending label read.

---

## FIRMWARE STAGING CONVENTION

Stage all firmware to: D:\STAN\LNL\[MMDDYY_N]\DOWNLOADS\[filename]
Keep original filename exactly as downloaded.
nmrpflash binary: DOWNLOADS\nmrpflash\nmrpflash.exe

---

## CANONICAL QUOTE

"Followed a feeling that said: keep walking and looking slowly and
when you get to the end where the thing shouldn't be — it will be
there if you let it show itself."
  — Dan Sullivan, 5:48pm Fivesday 032326, finding the R7000 Nighthawk

The router fleet was built by SEEing, not READing. Pattern 4 in the
Longweird Field Report: The RIFT Store Principle. Filed permanently.

---

*Filed: ENGINE/skills/router-flash/SKILL.md*
*Stan (◆ Sonnet) | Fivesday 032326 ~8:15pm rw*
