# FLEET / SOFTWARE INVENTORY
# Quick-reference for what's already on the Fleet before anyone downloads anything
# First drafted: 042126 Tuesday ~16:45 PT by Trip (ODT 4.7 Lead Boot Model)
# Inherits: DATA/documents/LIGHTHOUSE_LIBRARY_031826.md (full 272-line catalogue from 031826)
# Context: Dan's 042126 4:33pm observation — "crew never consider software we have locally" —
# named as a filing/finding gap. This doc is the structural fix. Read BEFORE recommending any download.

## THE RULE

Before recommending ANY software download (OS upgrades, installers, ISOs, utilities), check this
inventory AND `DATA/documents/LIGHTHOUSE_LIBRARY_031826.md` FIRST. If what Dan needs is already
on the Fleet, use the local copy. Saves VZW bandwidth, library trips, torrent cycles, and
crew confidence that we don't know our own assets.

This is Standard Rule ReadRecordFirst applied to the filesystem layer specifically.

## CANONICAL LOCATION

**`E:\Files\Installers\`** on ODT (drive label `003_5.45TB.2023`) is the central software repository.
246 top-level items. ~81 directories + 165 standalone files (031826 count; may have grown).
Contains Windows ISOs, Linux ISOs, macOS installers (OSX/ folder = 255 GB), Audio software,
Creative Suite, Games, Utilities, Flashing tools.

Other drives checked 042126 16:40:
- D:, F: (FAS1), G:, I: (FAS2), J:, K: (FAS3), M:, N:, Q: — no parallel "Installers" tree
- E:\Files\Installers is THE single centralized software repository

## CRITICAL FINDINGS 042126 (for today's CUBE path)

### Windows 10 ISOs already local (in `E:\Files\Installers\Windows\`)

| File | Size | Version | Use case |
|------|------|---------|----------|
| `Win10_2004_English_x64.iso` | **5.0 GB** | **20H1 / version 2004** | **Unblocks CUBE 1909→22H2 path — prerequisite for 22H2 enablement package** |
| `Windows 10 Pro x64 En-US.iso` | 3.6 GB | Unknown (probe if needed) | Older Win10 Pro install image |
| `Windows 10 X64 v.1909 10in1 OEM en-US MARCH 2020/` | (DIR) | 1909 | Multi-edition 1909 (CUBE's current version, historical) |
| `Windows 10 X64 v.1909 10in1 OEM en-US MARCH 2020 {Gen2}/` | (DIR) | 1909 | Duplicate Gen2 variant |
| `Windows 10 X64 Pro VL incl Office 2019 en-US SEP 2020 {Gen2}/` | (DIR) | Likely 20H1/2004 + Office 2019 | Bundled Win10+Office install |
| `Windows 10 Pro VL X64 v1511 MULTi-7 April 2016 {Gen2}/` | (DIR) | 1511 | Historical — unlikely useful |
| `Windows10Upgrade9252.exe` | 6 MB | Update Assistant tool | Automated upgrade (needs internet) |

### CUBE 1909 → 22H2 path (unlocked by local inventory)

Enablement package path **requires** the machine to be on 2004, 20H2, or 21H1 first.
CUBE is on 1909. `Win10_2004_English_x64.iso` covers the gap.

1. Mount `E:\Files\Installers\Windows\Win10_2004_English_x64.iso` on ODT (Windows native ISO mount)
2. Copy contents to CUBE via `\\PIRALUS\SKYWAY_69` SMB share OR USB stick OR direct scp
3. Run `setup.exe` on CUBE — in-place upgrade preserves apps/data — 30-60 min
4. Reboot CUBE into 2004
5. Apply 22H2 enablement package (KB5003791) from Microsoft Update Catalog OR pull via Windows Update (CUBE now has Tailscale + can reach internet)

**No library trip. No torrent. No VZW burn. The ISO is already here.**

### Other high-value ISOs already on Fleet (selected)

- `ubuntu-22.04.5-desktop-amd64.iso` (4.5 GB) — matches GOG1's current OS for disaster recovery
- `raspios-bullseye-arm64-lite.img.xz` (270 MB) — **O'Shin rejoin target** (see NEARGULL)
- `raspios-bullseye-arm64.img.xz` (757 MB) — full Pi OS desktop variant
- Ubuntu/Kali/Mint/Pop!_OS multiple versions
- macOS installers (255 GB OSX folder) — Bootcamp 4.0 included

### Flashing tools (USB creation) already available

- `rufus-3.14.exe` + `rufus-3.11.exe` — USB boot media creation
- `balenaEtcher-Setup-1.5.120.exe` — cross-platform image flasher
- `imager_1.7.2.dmg` — Raspberry Pi Imager (macOS)
- `memtest86-usb.zip` — RAM diagnostic USB

### Other notable installers (beyond today's scope but good-to-know)

- Cinema 4D 2023, Microsoft Office 2021 LTSC, Adobe Creative tools (via Archive folders)
- VCV Rack (modular synth), Terragen Professional 4.5.42, Ableton, OBS Studio 31.0.2
- Steam, Epic Games Launcher, Minecraft installer
- NVIDIA driver 456.55 for Win10 64-bit
- Samsung DeX setup (for ACHE→PC bridging work)

## CAVEATS + KNOWN LIMITS

- **Physical DVDs, burned USB drives, SD cards** not scannable by DC alone — need Dan to insert or
  catalogue by hand. Worth a future inventory sweep where Dan walks through physical media.
- This doc reflects `E:\Files\Installers\` top-level only. Deeper subdirectories (`Archive/`,
  `Windows 7/`, `OSX/` 7,649-file tree) not enumerated here — see Lighthouse Library 031826 for
  deeper catalogue.
- Version of `Windows 10 Pro x64 En-US.iso` (3.6 GB) not yet verified — mount it to check if CUBE
  path ever needs an alternative to 2004 ISO.

## MAINTENANCE

- Full re-catalogue worthwhile at next NEARGULL window (maybe a Data Day).
- Candidate for `ENGINE/software_inventory.ps1` that produces this doc automatically on schedule
  (aligns with Graft→Canon pipeline thread S2).
- Cross-reference with `DATA/documents/LIGHTHOUSE_LIBRARY_031826.md` for deep catalogue.

## STATION-LEVEL DEV-STACKS (Doc-added 052326 from Speccy LAGOS-extracts)

### STN2 (per [FLEET/STN2/HardwareSpec_052326.md](STN2/HardwareSpec_052326.md) `6ea6fde`)
- **Languages:** Python 3.10 · Ruby 3.1 · Node.js (nvm4w `C:\nvm4w\nodejs`) · Rust/Cargo · Java JRE 8.411
- **.NET:** v4.8 Full + v4.8 Client + v3.5 SP1 + v3.0 SP2 + v2.0 SP2
- **Shell:** PowerShell 5.1.19041.1
- **IDEs:** VS Code · JetBrains full-suite with `ja-netfilter-all` activation (CLion + DataGrip + DataSpell + DevEcoStudio + AppCode + Gateway + GoLand + IDEA + JetBrainsClient · all `_VM_OPTIONS` pointing to `C:\ja-netfilter-all\vmoptions\`)
- **Package mgrs:** Chocolatey (`C:\tools`)
- **Networking/tools:** Nmap (`C:\Program Files (x86)\Nmap`) · ffmpeg (`C:\ffmpeg\bin`)
- **Sync:** OneDrive
- **USERPROFILE:** `C:\Users\Code 01` (service-account)

### ODT (per [FLEET/ODT/HardwareSpec_052326.md](ODT/HardwareSpec_052326.md) `8578360`)
- **Languages:** Python 3.10 · Node.js (`H:\Projects 2020-2026\Node.js`) · Java JRE 8.491
- **.NET:** v4.8 Full + v4.8 Client + v3.5 SP1 + v3.0 SP2 + v2.0 SP2
- **Shell:** PowerShell 5.1.19041.1
- **IDEs:** VS Code · JetBrains PyCharm 2021.3 · Neovim (`C:\tools\neovim\nvim-win64\bin`)
- **Source-control GUI:** GitHub Desktop
- **Package mgrs:** Chocolatey (`C:\tools`)
- **Sync:** OneDrive + OneDriveConsumer
- **AV:** Malwarebytes primary + Windows Defender secondary (STN2 is Defender-only)
- **USERPROFILE:** `C:\Users\Dan` (personal-account)

### Shared across STN2 + ODT (overlap)
- Python 3.10 · Node.js · Java JRE 8 · .NET 4.8 · PowerShell 5.1 · VS Code · JetBrains (some) · Chocolatey · OneDrive

### Pending Speccy-export (6 of 8 Fleet machines)
CUBE · GOG1 · ACHE · TRP0 · DPSL · DPSR · oshin · (per FLEET/INVENTORY.md GROUND-TRUTH UPDATE 052326)

---

*Filed 042126 Tuesday ~16:45 PT by ◈ Trip (Opus 4.7) on ODT. Anti-filing/finding-gap artifact.
The cost of not having this was the amount of time crew burns proposing downloads of software
we already own. That ends here.*
