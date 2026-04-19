# CORRECTION: RTX 3060 is on ODT, not GOG1 (canonical hardware restoration)

**Author:** Trip (Opus) ◈
**Filed:** 041726 ~23:55 PT (Friday, F# Week Day 6)
**Station of origin:** ODT
**Supersedes:** All prior references to "GOG1 RTX 3060" across Bridge, Portal, memory, MAIL, SEEGULLS
**Canon source:** Dan's ODT Device Manager screenshot 041726 ~23:47 PT + Trip's SSH survey of GOG1 hardware 041726 ~23:40 PT

---

## What was wrong

Memory and multiple recent session summaries (including tonight's Living Map MAIL and SEEGULLS entries) carried the claim that **GOG1 has an NVIDIA RTX 3060** and would be the "second instrument" in the Docker Model Runner / orchestra-LLM plan. This was cascade-compounded into STN2 Trip's research doc followups, the band/orchestra frame write-up, Grafts to STAN and C.B., and the MAIL "The Band Took The Stage."

**The truth:**

- **ODT** hosts the **NVIDIA GeForce RTX 3060** (visible in Windows Device Manager tonight, confirmed by Dan in-session)
- **GOG1** hosts an **NVIDIA GeForce GTX 980** (GM204, Maxwell architecture — `lspci | grep VGA` via SSH tonight returned "01:00.0 VGA compatible controller: NVIDIA Corporation GM204 [GeForce GTX 980] (rev a1)")

Different chip generation, different era, different VRAM, different inference performance class. The GTX 980 is still a capable card — 4GB VRAM, Maxwell — but is not the Ampere-era RTX 3060 (12GB VRAM) that I had been planning around.

---

## How this happened

The RTX 3060 claim came in via compacted session summaries and memory echoes, not from a live hardware probe. Nobody ran `lspci` on GOG1 in a recent enough session for the memory to carry it forward correctly. When the claim lived in memory, it felt canonical; when it flowed into plans, it felt like shared understanding. This is the "generating values without reading the instrument" failure pattern (the same family as tonight's DPSL/DPSR IP swap and the earlier R7900 topology misread).

The instrument that would have produced the right value is `lspci | grep VGA` on GOG1 itself. It takes one SSH round-trip. Nobody ran it until tonight because the claim was never flagged as unverified.

---

## What changes as a result

### Infrastructure planning

- **"Second instrument" of the LLM fleet is not decisively GOG1.** ODT with the RTX 3060 is actually the more powerful Ampere card on the fleet.
- **GOG1 can still host an LLM instrument** — GTX 980 runs llama.cpp with CUDA, GGUF-quantized mistral-nemo fits in 4GB at Q4, Ollama supports Maxwell. But quality and speed will differ from RTX 3060 expectations.
- **Inference-routing decisions** should factor actual hardware, not the memory echo. Short-reasoning / small-quant tasks → GTX 980 on GOG1 or CPU on STN2. Longer / higher-quality tasks → RTX 3060 on ODT.

### Documents touched

- `src/data/fleet.js` — ODT baseplate gets RTX 3060 in a new `hardware` field; GOG1 gets GTX 980. All net_adapters / cpu / ram / storage populated where known.
- `STATUS/SEEGULLS.md` — entries referencing "GOG1 with RTX 3060" rewritten to "GOG1 with GTX 980" or split into (a) GOG1 GTX 980 inference host, (b) ODT RTX 3060 inference host as separate items.
- `MAIL/MAIL_Trip_TO_ALL_PiralusCommissioned_LivingMap_041726.md` — remains as the historical record of tonight's frame (keeps the uncorrected RTX 3060 reference as written, since MAIL is a log not a living doc). Correction note added below to link this doc.
- `RELAY/RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` — the "GOG1 mistral-nemo path: stand up the same setup on GOG1 with RTX 3060 acceleration" line reads as a correction candidate — but RESEARCH docs are historical; leave it and link this correction.
- Memory via `memory_user_edits` — "GOG1 with RTX 3060" references edited to "GOG1 with GTX 980 (Maxwell, 4GB VRAM) · ODT with RTX 3060 (Ampere, Trip gaming) · see RELAY/CORRECTION_GOG1GPU_Trip_041726.md"

### Pattern

This correction is another instance of the Filing/Finding Gap (NA 014) — the right value existed and could have been produced cheaply, but a memory-carried claim substituted for it. The Fleet Map data-model work Dan directed tonight (hardware blocks per Rox) is the structural fix: when every station has a filled-in `hardware` field in `fleet.js`, compacted summaries stop being the authority for device specs.

---

## Fact sheet (rebuilt from tonight's probes)

### GOG1 (confirmed via SSH 041726 23:40 PT)

- OS: Ubuntu 22.04.5 LTS (jammy), kernel 6.8.0-107-generic
- CPU: Intel Core i7-4790 @ 3.60GHz (Haswell, 4C/8T)
- RAM: 16 GiB (15 GiB visible to OS)
- Disk: `/dev/sda2` 1.8 TB ext4 root (29 GB used, 1.7 TB free); `/dev/sda1` 512 MB EFI
- GPU: **NVIDIA GeForce GTX 980** (GM204, Maxwell, 4 GB VRAM, 2014-era)
- Network adapters (currently all UP):
  - `enp3s0` — onboard ethernet — 10.0.0.3/24 on Fleet LAN (Piralus)
  - `wlp4s0` — internal WiFi PCIe — 192.168.5.100/24 (on the D-Link DIR-632 / 8PSW WiFi AP — this subnet is the DIR-632's own default; worth an audit)
  - `wlx105a95827b63` — USB WiFi adapter (TP-Link T4U Plus AC1300 per morning Living Map record) — 10.44.214.229/16 (this is likely SLO-PUB school-district WiFi based on subnet shape; MITM'd by a self-signed cert in chain, so it's a captive-portal / filtered network)
- Default route: via 10.44.0.1 on the USB adapter (wlx...) — so GOG1's internet is currently going through the school-district WiFi
- Tailscale: NOT installed (despite 041326 directive)
- Docker: NOT installed
- NVIDIA driver: NOT installed (no nvidia-smi)
- SSH key (existing, for GitHub use): `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPPlp7N1hQOcg1B17nnVbdj+lHuti0pRHJV6Q0ohzQaU GOG1_to_GitHub`
- Fleet auth key for `dan@GOG1`: not yet generated — needs `ssh-keygen -t ed25519` when we want GOG1 to SSH out to other stations

### ODT (from Dan's Device Manager 041726 ~23:47 + Trip's local environment)

- OS: Windows 10 Pro
- CPU: (need `wmic cpu get name` or similar — spec-probe-pending)
- RAM: (spec-probe-pending)
- Storage: (spec-probe-pending; FAS drives attached but not permanent)
- GPU: **NVIDIA GeForce RTX 3060** (Ampere, 12 GB VRAM) — visible in Device Manager Display adapters
- Network adapters (visible in Device Manager):
  - Intel Ethernet Connection (7) I219-V — onboard (10.0.0.10/24 on Fleet LAN via 8PSW p3)
  - Intel Wireless-AC 9560 160MHz — internal Wi-Fi 2 (disabled currently)
  - Broadcom 802.11ac Wireless PCIE Full Dongle Adapter — internal/Add-in card (VZW_HOTSPOT WiFi at 192.168.195.149, active)
  - Tailscale Tunnel — 100.111.17.67 (peer 001-win10pro)
  - Bluetooth (PAN)
- User: `Code 01` (username has a space — breaks scripts hardcoding `C:\Users\Code`)
- Fleet role: Trip ODT primary station, also runs blender-mcp + FAS-drive host

---

## Next moves

1. Update `fleet.js` with a full `hardware` field per Rox — baseline populated for ODT + GOG1, spec-probe-pending tagged for the others.
2. Update `fleet.astro` to render the hardware block per Rox.
3. Memory edit: strike "RTX 3060 on GOG1" associations.
4. File as NEARGULL: "Spec probe pass" — one SSH round-trip per station to fill in missing hardware fields (cpu, ram, storage, all network adapters). Takes ~5 minutes per station when accessible.

*◈ Trip · ODT · 041726 ~23:55 PT*
