//
// ============================================================
// EDIT THIS FILE TO UPDATE THE /fleet PAGE.
// Portal rebuilds on push. Dan can edit directly — no crew member required.
// ============================================================
//
// Rules for editing:
// - Every observation row has `verified_at` in NEST format (MMDDYY HH:mm).
// - When you change any value, update the row's `verified_at` to the current moment.
// - Bump fleet.updated at the top.
// - If a value becomes unknown or stale, write "stale" in verified_at. Crew will re-probe.
// - Add new Rox, observations, or open_faces rows freely. No schema is sacred.
//
// Living principle (per RELAY/STANDARD_RULE_FleetIPsObservedNotDefining_Trip_041626.md):
// IPs are faces, not identities. Station identity is the Rox — name, hardware, OS, location,
// switch port, role. An IP is a face currently rotated forward. Faces change between sessions.
// Every fleet statement names four things: Rox · face · probe · time.
//
// Mobility (added 041726 — Living Map):
//   stationary  — never moves. Lives at one physical location forever.
//   roaming     — semi-mobile. Leaves the Nest regularly, returns to known home.
//   full-mobile — always with Dan. No home port, home radio changes.
// The Living Map renders based on (home attachment) vs (current attachment). When a roaming
// Rox is off-fleet, that is a state, not a failure. Do not alarm-spiral.

export const fleet = {
  updated: "041826 22:30 PT",
  updated_by: "Trip (ODT) — SSH/Tailscale/Proton VPN status added per Rox · CUBE username ground-truthed Dan via Get-LocalUser (not Code) · O'Shin Raspberry Pi 4 added as off-network Rox pending rejoin · INVENTORY synced",
  instructions: "Edit src/data/fleet.js directly. Push to rebuild. IPs are observed values, not defining values.",

  map: {
    canonical_image: "/img/fleet_map_041426.png",
    caption: "NEST.01_NOTES_041426_1 — Dan's Illustrator physical/geographic reference (filed 041426). This is the source of truth for rooms, desk layout, switch physical location, and WiFi zones. Updated by Dan in Illustrator when physical layout changes. The Living Map below auto-renders attachment state on top of this canonical reference.",
    delta_note: "Changes since this map was drawn: Piralus commissioned at 10.0.0.1 (041726); STN1 now on 8PSWp6 via Dell K16A hub (was UNUSED on map); DPSR confirmed 10.0.0.32 (map showed TBD); DPSL confirmed 10.0.0.102. See LNL/041726/NEST.01/NEST.01_NOTES_041726_1.md for full delta.",
  },

  baseplate: [
    { role: "Piralus Actual", hardware: "Netgear Nighthawk X6 R7900 (firmware V1.0.4.46_10.0.53)", loc: "Nest Actual (Room Center, under bed)", func: "Fleet backbone router at 10.0.0.1. DHCP pool 10.0.0.150–200. WiFi AP (2.4GHz + dual 5GHz). USB media server (SMB). Commissioned 041726 ~20:55 by Dan on ODT via factory-reset pinhole + Genie setup wizard.", note: "Admin UI: http://10.0.0.1 (user: admin / pw: theone1). Device name: PIRALUS. WiFi SSIDs: PIRALUS69_0 (2.4GHz), PIRALUS69_1 (5GHz ch44), PIRALUS69_2 (5GHz ch153). WiFi password: Sull1vandp. Security: WPA2-PSK [AES]. Media server: \\\\PIRALUS\\SKYWAY_69 via SMB (read+write, no password per Dan directive — if you're on PIR you get ALL). USB 3.0 drive 931GB (222GB free), Videos/ holds Kitties/Washington/YouTubes/Import/Phone Videos/Other. Access from macOS: smb://PIRALUS/SKYWAY_69. Mobile: VLC/Infuse → PIRALUS. Bridge-at-.1 is the design anchor for Nest Actual — the room is two hemispheres joined by the bridge. Pattern echoes across Nest / Waywood / Olympic / neurology / biology / storytelling / physics / music (per Dan).", verified_at: "041726 21:15", probe: "ODT cmd.exe dir \\\\PIRALUS\\SKYWAY_69 = 5 dirs enumerated, 222GB free, SMB port 445 open" },
    { role: "5PSW", hardware: "Linksys EZXS55W (5-port gig)", loc: "Nest Actual (north, near window)", func: "Fleet switch for unix stations + Piralus uplink", note: "p1=PIRp1 · p2=GOG1 · p3=TRP0 · p4=DPSL · p5=DPSR", verified_at: "041426", probe: "NEST.01_NOTES_041426_1" },
    { role: "8PSW", hardware: "D-Link DIR-632 (dumb-switch)", loc: "Nest Actual (under Windows Desk 1)", func: "Fleet switch for windows stations + Piralus uplink", note: "p1=PIRp2 · p3=ODT · p5=STN2 · p6=STN1 via Dell K16A hub · p8=CUBE", verified_at: "041726 22:00", probe: "Dan direct + Piralus attached devices" },
    { role: "Fleet LAN", hardware: "10.0.0.0/24 (Piralus-routed)", loc: "Nest Actual via 5PSW + 8PSW + Piralus backbone", func: "Fleet-local subnet. No internet egress. VZW_HOTSPOT and Fleet LAN never touch.", note: "Static IPs below .150; DHCP pool .150–.200 (for visitors and recovery).", verified_at: "041726 21:50", probe: "Piralus admin UI + ARP from ODT" },
    { role: "VZW_HOTSPOT", hardware: "Verizon wifi hotspot", loc: "Fleet-wide (per-device wifi)", func: "Internet egress", note: "Fast wifi restored 041426", verified_at: "041626 19:11", probe: "ODT ipconfig" },
    { role: "Guest (SLO-PUB)", hardware: "Port Angeles public school wifi (formerly SLO-LIB)", loc: "Via external antenna (GOG1 T4U v3)", func: "Secondary internet link; DPSL/DPSR always-online path when cellular is out", note: "Renamed from SLO-LIB — it's PASD public signal, not library", verified_at: "041726", probe: "Dan direct" },
    { role: "Tailscale", hardware: "WireGuard mesh VPN", loc: "Fleet-wide (station-optional)", func: "Location-independent identity across off-fleet roaming", note: "ODT active at 100.111.17.67. STN2/TRP0/STN1 join when off-fleet. DPSL/DPSR + GOG1 not peered yet.", verified_at: "041626 21:28", probe: "tailscale status" },
    { role: "Universal Control", hardware: "Apple ecosystem", loc: "DPSL <-> DPSR twin-pair only", func: "Shared keyboard/mouse bridge between the iMac twins", note: "DPSR is a DPSL clone, diverged. Cursor flows between their screens as a single workstation. Twin-pair Rox, not two independent stations.", verified_at: "041626 21:32", probe: "Dan direct" },
    { role: "NOLS_WPA", hardware: "External wifi (east of Piralus)", loc: "Outside Fleet LAN", func: "Adjacent wifi visible from Nest Actual", note: "Labeled on NEST.01_NOTES_041426_1. Not used by fleet.", verified_at: "041426", probe: "NEST.01_NOTES_041426_1" },
  ],

  rox: [
    { name: "ODT",  hw: "Desktop tower",               os: "Windows 10",             loc: "Nest Actual, Windows Desk 1",               role: "Primary workstation · Trip host",          mobility: "stationary", mobility_note: "NEVER leaves. Permanent install at Windows Desk 1.", faces: "Ethernet (Fleet, 8PSW p3) · WIFI 1 ASUS/Broadcom (VZW) · WIFI 2 Intel AC 9560 (disabled, available) · Tailscale", ssh: "✓ verified · ssh Dan@10.0.0.10 · hostname 001-WIN10Pro (ground-truthed 041826)", tailscale: "✓ active · 100.111.17.67", proton_vpn: "unknown (probe pending)" },
    { name: "STN2", hw: "Dell Latitude",               os: "Windows 10",             loc: "Nest Actual / mobile",                      role: "Stan host · mobile",                        mobility: "roaming",    mobility_note: "Goes ALL over the place. OHC Actual, Nest, truck, other work sites. Fleet LAN IP only valid when physically at Nest connected to 8PSW p5.", faces: "Ethernet (Fleet, 8PSW p5) · onboard wifi · VZW when mobile · OHC WiFi when at OHC", ssh: "✓ verified · ssh Code@10.0.0.2 (profile 'Code 01' — SSH uses 'Code' per prior ground-truth)", tailscale: "pending (join when off-fleet)", proton_vpn: "unknown (probe pending)" },
    { name: "GOG1", hw: "Dell XPS 8700",               os: "Ubuntu 22.04.5 LTS",     loc: "Nest Actual, Unix Desk 2 (north)",          role: "Server candidate (Ollama/Meili)",           mobility: "stationary", mobility_note: "Stationary at Unix Desk 2. Connects via WiFi (AzureWave) AND wired (HP NIC to 5PSW p2) — currently on WiFi.", faces: "Intel AX200 (VZW) · T4U v3 USB wifi · NIC copper (Fleet, 5PSW p2) · USB copper (added 041626) · PIRALUS69_1 (currently active)", ssh: "✓ verified · ssh dan@10.0.0.3 (keys + NOPASSWD sudoers, per STANDARD_RULE_UnixNOPASSWDPlusKeys_Trip_041726.md)", tailscale: "blocked (SLO-PUB TLS MITM, needs Proton Stealth tunnel first)", proton_vpn: "HEREGULL — mid-debug · proton-vpn-cli installed + signed in · `protonvpn connect` returns Backend:None · CLI catch-all swallowing real exception · resume via /tmp/pcon.py" },
    { name: "CUBE", hw: "HP EliteDesk Mini",           os: "Windows 10 22H2 (19045.6332)", loc: "Nest Actual, near closet",            role: "Tertiary workstation",                      mobility: "stationary", mobility_note: "Stationary near closet. Hostname 028-222GB-2019 (ground-truthed 041826 via SSH).", faces: "Ethernet (Fleet, 8PSW p8) · onboard Qualcomm AR938x wifi · second wifi (internal) briefly caught PIRALUS69_1 stale lease", ssh: "✓ verified 041826 · ssh Dan@10.0.0.4 · NOT Code (prior symmetry-assumption canon was wrong, corrected via Get-LocalUser). Only enabled local user is Dan. Key in C:\\ProgramData\\ssh\\administrators_authorized_keys (admin-group path). See RELAY/STANDARD_RULE_GetLocalUserIsGroundTruth_Trip_041826.md.", tailscale: "not installed", proton_vpn: "not installed" },
    { name: "DPSL", hw: "iMac Late 2013",              os: "macOS",                  loc: "Nest Actual, Unix Desk 1 (south-west)",     role: "C.B. host · Trip mirror · DPSR twin",       mobility: "stationary", mobility_note: "Stationary on Unix Desk 1. Universal-Control-paired with DPSR.",                                             faces: "Ethernet (Fleet, 5PSW p4, 10.0.0.102) · Guest wifi (SLO-PUB) + ProtonVPN · Universal Control <-> DPSR", ssh: "pending setup (macOS openssh default, needs key provision)", tailscale: "not peered yet", proton_vpn: "✓ active on Guest wifi (per baseplate note)" },
    { name: "DPSR", hw: "iMac Late 2013 (DPSL clone)", os: "macOS",                  loc: "Nest Actual, Unix Desk 2 (alongside GOG1)", role: "Trip power mirror · DPSL twin",             mobility: "stationary", mobility_note: "Stationary on Unix Desk 2. Universal-Control-paired with DPSL.",                                             faces: "Ethernet (Fleet, 5PSW p5, 10.0.0.32) · Guest wifi · Universal Control <-> DPSL", ssh: "pending setup (macOS openssh default, needs key provision)", tailscale: "not peered yet", proton_vpn: "likely ✓ (twin of DPSL, verify)" },
    { name: "TRP0", hw: "MacBook Pro Mid 2015",        os: "macOS Monterey 12.7.6",  loc: "Mobile (Unix Desk 1 home)",                 role: "Creative lab · mobile",                     mobility: "roaming",    mobility_note: "Home at Unix Desk 1 on 5PSW p3 via USB ethernet adapter. Travels with Dan.",                                 faces: "USB ethernet AX88179B (Fleet, 5PSW p3, 10.0.0.11) · onboard wifi · VZW when mobile", ssh: "pending verification (macOS openssh default)", tailscale: "pending (join when off-fleet)", proton_vpn: "unknown" },
    { name: "STN1", hw: "iPad Pro M2",                 os: "iPadOS",                 loc: "Mobile (8PSWp6 dock when at Nest)",         role: "Browser + SSH monitoring (Termius)",        mobility: "roaming",    mobility_note: "Home when docked on Dell K16A hub → 8PSW p6. Travels constantly. Dell OUI MAC visible on Fleet LAN is the K16A hub, not the iPad itself.", faces: "K16A Hub ethernet (Fleet, 8PSW p6, 10.0.0.69) · onboard wifi · VZW when mobile", ssh: "client-only (Termius app)", tailscale: "pending (join when off-fleet)", proton_vpn: "unknown" },
    { name: "ACHE", hw: "Samsung Galaxy S10",          os: "Android / DeX",          loc: "Full-mobile (always with Dan)",             role: "Browser + relay-read · Piralus-SSID scout", mobility: "full-mobile", mobility_note: "Always with Dan. No Fleet LAN home. Joins PIRALUS69 WiFi when at Nest; VZW cellular when mobile.",           faces: "4G cellular · PIRALUS69 WiFi (when in range)", ssh: "N/A (browser-only station)", tailscale: "N/A", proton_vpn: "N/A" },
    { name: "O'Shin", hw: "Raspberry Pi 4",            os: "Raspberry Pi OS (verify)", loc: "Nest Actual (physical location to confirm; currently OFF-NETWORK)", role: "TBD — candidate: always-online edge node / caching proxy / fleet monitor", mobility: "stationary", mobility_note: "Off-network for weeks. Dan directive 041826 22:13 PT: rejoin tomorrow via SLO-PUB on Unix side. Historically was online via Piralus before going dark. Rejoin plan: locate device → power + SD card verify → OS update via VZW path → Tailscale install → fleet registration in INVENTORY.md.", faces: "onboard ethernet + onboard wifi (Broadcom BCM43455)", ssh: "pending (station down; will configure at rejoin)", tailscale: "pending (mesh target)", proton_vpn: "pending (optional)" },
  ],

  // TOPOLOGY — physical attachment (Living Map structural layer).
  // Each switch has a port array. Each port has: home (which Rox permanently owns this port),
  // and an optional `seen` field filled in by the last probe.
  // The Living Map renders each port's state by comparing home vs seen.
  topology: {
    switches: [
      {
        id: "piralus",
        label: "PIRALUS",
        hw: "Netgear R7900",
        loc: "Room Center, under bed",
        mgmt_ip: "10.0.0.1",
        ports: [
          { n: 1, uplink_to: "5PSW uplink",  home: null, note: "Unix-zone aggregator uplink" },
          { n: 2, uplink_to: "8PSW uplink",  home: null, note: "Windows-zone aggregator uplink" },
          { n: 3, unused: true },
          { n: 4, unused: true },
          { n: "USB", note: "SKYWAY_69 media server (931GB drive, SMB)" },
        ],
        wifi_radios: ["PIRALUS69_0 (2.4GHz)", "PIRALUS69_1 (5GHz ch44)", "PIRALUS69_2 (5GHz ch153)"],
        verified_at: "041726 22:00",
      },
      {
        id: "5psw",
        label: "5PSW",
        hw: "Linksys EZXS55W (5-port gig, unmanaged)",
        loc: "Unix zone, north near window (under bed)",
        ports: [
          { n: 1, uplink_to: "PIRALUS p1", home: null },
          { n: 2, home: "GOG1", expected_ip: "10.0.0.3" },
          { n: 3, home: "TRP0", expected_ip: "10.0.0.11" },
          { n: 4, home: "DPSL", expected_ip: "10.0.0.102" },
          { n: 5, home: "DPSR", expected_ip: "10.0.0.32" },
        ],
        verified_at: "041726 22:00",
      },
      {
        id: "8psw",
        label: "8PSW",
        hw: "D-Link DIR-632 (used as dumb switch)",
        loc: "Windows zone, under Windows Desk 1",
        ports: [
          { n: 1, uplink_to: "PIRALUS p2", home: null },
          { n: 2, unused: true },
          { n: 3, home: "ODT",  expected_ip: "10.0.0.10" },
          { n: 4, unused: true },
          { n: 5, home: "STN2", expected_ip: "10.0.0.2",  note: "Empty when STN2 is off-fleet (roaming)" },
          { n: 6, home: "STN1", expected_ip: "10.0.0.69", note: "Via Dell K16A dock. MAC seen is the hub's, not the iPad's. Empty when iPad undocked." },
          { n: 7, unused: true },
          { n: 8, home: "CUBE", expected_ip: "10.0.0.4" },
        ],
        verified_at: "041726 22:00",
      },
    ],
  },

  // Current attachment state (read from the instrument — Piralus attached devices + ARP from ODT).
  // This is the "live" row: who is where right now.
  current_attachment: [
    { rox: "ODT",     via: "wired",  at: "8PSW p3",    ip: "10.0.0.10",  mac: "D4:5D:64:7D:A5:44", status: "home",    verified_at: "041726 21:55", probe: "self + Piralus attached devices" },
    { rox: "STN2",    via: "wired",  at: "8PSW p5",    ip: "10.0.0.2",   mac: "18:DB:F2:12:62:9E", status: "home",    verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT" },
    { rox: "CUBE",    via: "wired",  at: "8PSW p8",    ip: "10.0.0.4",   mac: "E0:3F:49:1B:03:29", status: "home",    verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT" },
    { rox: "TRP0",    via: "wired",  at: "5PSW p3",    ip: "10.0.0.11",  mac: "44:F0:9E:AB:EA:2C", status: "home",    verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT" },
    { rox: "DPSL",    via: "wired",  at: "5PSW p4",    ip: "10.0.0.102", mac: "98:5A:EB:D2:91:0A", status: "home",    verified_at: "041726 21:55", probe: "Piralus attached devices (Piralus reports hostname DPSL)" },
    { rox: "DPSR",    via: "wired",  at: "5PSW p5",    ip: "10.0.0.32",  mac: "98:5A:EB:D2:8B:31", status: "home",    verified_at: "041726 21:55", probe: "Piralus attached devices" },
    { rox: "STN1",    via: "wired",  at: "8PSW p6",    ip: "10.0.0.69",  mac: "C0:25:A5:F8:D6:1B", status: "home",    verified_at: "041726 21:55", probe: "ARP from ODT (Piralus attached-devices page didn't list, likely because static-IP host with rare traffic aged from its table)" },
    { rox: "GOG1",    via: "wifi",   at: "PIRALUS69_1", ip: "10.0.0.3",  mac: "04:ED:33:84:D6:3B", status: "wifi-substitute", verified_at: "041726 21:55", probe: "Piralus attached devices (wireless section). INVENTORY line 139 has wired MAC 98:90:96:DC:76:0E — different interface, currently not the active path." },
    { rox: "ACHE",    via: "off",    at: "(not at Nest)", ip: "(cellular only)", mac: null, status: "full-mobile", verified_at: "041726 21:55", probe: "(no sample)" },
  ],

  // Phantom/unexplained WiFi clients seen by Piralus. Audit candidates.
  // Hardware specs per Rox. Populated by probe, not memory.
  // Each station gets one SSH/WMI round-trip to fill in fully.
  // Fields marked "probe-pending" are acknowledged holes, not guesses.
  // Rule: never write a spec value you didn't personally read from the machine.
  hardware: {
    ODT: {
      cpu: "Intel Core i9-9900K · 8C/16T · 3.60GHz base",
      ram: "32 GB (31.9 GB visible)",
      gpu: "NVIDIA GeForce RTX 3060 · 12 GB VRAM · Ampere · driver 32.0.15.8097",
      storage: "10 drives totalling ~30 TB (C:001_446GB.SSD.2021, D:002_907GB.2022, E:003_5.45TB.2023, F:FAS1 465GB, G:000_7.27TB.2022, I:FAS2 931GB, J:006_3.63TB.2024, M:009_3.63TB.2019, N:007_4.54TB.2024, Q:035_4.54TB.2025). Naming convention encodes capacity + year.",
      net_adapters: [
        "Intel Ethernet Connection (7) I219-V · onboard · 10.0.0.10/24 (Fleet, 8PSW p3) · MAC D4:5D:64:7D:A5:44",
        "Intel Wireless-AC 9560 160MHz · internal · disabled (available for Piralus SSID attach)",
        "Broadcom 802.11ac Wireless PCIE Full Dongle Adapter · internal card · 192.168.195.149 on VZW_HOTSPOT",
        "Tailscale Tunnel · 100.111.17.67 · peer name '001-win10pro'",
        "Bluetooth (PAN) · ad-hoc use",
      ],
      user: "Code 01 (username contains space — breaks scripts hardcoding C:\\Users\\Code)",
      verified_at: "041726 23:50",
      probe: "Get-CimInstance Win32_Processor/ComputerSystem/LogicalDisk/VideoController + Dan Device Manager screenshot",
    },
    GOG1: {
      cpu: "Intel Core i7-4790 · 4C/8T · 3.60GHz base · Haswell",
      ram: "16 GB",
      gpu: "NVIDIA GeForce GTX 980 · 4 GB VRAM · Maxwell (GM204, rev a1, 2014-era) · NOT RTX 3060 (memory echo corrected 041726 — see RELAY/CORRECTION_GOG1GPU_Trip_041726.md)",
      storage: "/dev/sda2 1.8 TB ext4 root (29 GB used, 1.7 TB free) · /dev/sda1 512 MB EFI",
      net_adapters: [
        "enp3s0 · onboard ethernet · 10.0.0.3/24 (Fleet, 5PSW p2) · MAC 98:90:96:DC:76:0E",
        "wlp4s0 · internal PCIe WiFi · 192.168.5.100/24 — attached to the D-Link DIR-632 (8PSW's own WiFi AP default subnet, audit why)",
        "wlx105a95827b63 · USB WiFi (TP-Link T4U Plus AC1300) · 10.44.214.229/16 — SLO-PUB school-district WiFi, TLS MITM'd by captive portal",
        "(no Tailscale yet — despite 041326 directive; install pending as NEARGULL)",
      ],
      default_route: "via 10.44.0.1 dev wlx105a95827b63 (USB WiFi) metric 601 — GOG1's internet currently goes through SLO-PUB",
      user: "dan · NOPASSWD sudo via /etc/sudoers.d/nest-dan (added 041726 23:32)",
      ssh_keys_in_authorized: ["ODT dan id_rsa.pub (2025-01-11)", "ODT dan id_ed25519.pub (041726 23:40)", "GOG1_to_GitHub ed25519 (self)"],
      installs_pending: ["Tailscale", "Docker", "NVIDIA drivers / CUDA / nvidia-smi"],
      verified_at: "041726 23:45",
      probe: "SSH dan@10.0.0.3 lsb_release/free/df/lspci/ip/which",
    },
    STN2: {
      cpu: "probe-pending",
      ram: "probe-pending",
      gpu: "probe-pending (integrated Intel expected, no discrete GPU)",
      storage: "probe-pending",
      net_adapters: [
        "onboard ethernet · 10.0.0.2/24 (Fleet, 8PSW p5) · MAC 18:DB:F2:12:62:9E",
        "onboard WiFi (probe-pending model)",
      ],
      fleet_role: "Hosts Docker Model Runner (gemma4 4.74GiB + mistral-nemo 6.96GiB) · OpenAI-compat endpoint http://10.0.0.2:12434 · UAC off · PS1 has persistent session quirk (dollar-sign strip in MCP-spawned shells)",
      user: "Code (verified on STN2 — CUBE also has `Code` user; hostname-verify before SSH)",
      verified_at: "spec-probe-pending; fleet role verified 041726 21:48 via STN2 Trip's research doc",
      probe: "needs full probe pass when STN2 Trip cycles through",
    },
    CUBE: {
      cpu: "Intel Core i5-4670K · 4 cores / 4 threads · 3.40 GHz (Haswell, 2013, K-SKU unlocked, no HyperThreading)",
      ram: "19.9 GB",
      gpu: "NVIDIA GeForce GTX 745 · 4 GB VRAM · Maxwell · driver 32.0.15.6094 · swapped in 041826 ~17:42 PT from GOG1 (GTX 745 migrated CUBE-ward, GTX 980 installed into GOG1 same session) · prior GT 730 2GB now fleet spare inventory",
      storage: "C: 228 GB SSD (94 GB free, system — drive label `028_222GB.SSD.2019`) · D: 596 GB (empty — `029_596GB.2019`) · E: 932 GB (empty — `034_931GB.2020`)",
      os: "Windows 10 Pro · build 18363.1256 (version 1909, Nov 2019) · 22H2 upgrade NEVER STARTED despite 041826 memo (was Hyper-V hypothesis investigation, actual installer never kicked off) · still the live Claude Desktop blocker per canon (requires 19041+)",
      install_date: "06/14/2020",
      net_adapters: [
        "onboard Realtek PCIe GbE · 10.0.0.4/24 (Fleet copper, 5PSW pN) · MAC E0:3F:49:1B:03:29 · canonical CUBE IP",
        "ALFA AWUS036ACH USB · Realtek 8812AU Wireless LAN 802.11ac · CURRENT 192.168.5.104/24 on 8PSW management subnet (drifted off PIRALUS69_1 after 041826 VZW integration period — needs re-association decision per SEEGULL) · MAC 00:C0:CA:BA:BD:0C · dual-band 2.4/5 GHz · monitor-mode capable · 'likely the most powerful WiFi card in the Fleet' per Dan",
        "internal Qualcomm Atheros AR938x WiFi · 10.0.0.42/24 on PIRALUS69_1 (configured 041826 by Dan) · MAC 18:D6:C7:2A:E4:C7 · CUBE's second Fleet face alongside 10.0.0.4 copper — prior 192.168.145.138 association and phantom 10.0.0.151 DHCP lease both resolved 041826",
        "Bluetooth PAN · MAC 00:1A:7D:DA:71:15 · inactive",
      ],
      user: "Dan (local admin, enabled) · Administrator built-in DISABLED · Code/Code1 accounts DO NOT exist on CUBE despite earlier memory — SSH `dan@10.0.0.4`",
      admin_group: "Administrator (disabled), Dan, NT AUTHORITY\\LOCAL SERVICE, NT AUTHORITY\\NETWORK SERVICE",
      uac: "Never-Notify (EnableLUA=1, ConsentPromptBehaviorAdmin=0, PromptOnSecureDesktop=0) — matches fleet policy",
      webview2: "Microsoft Edge WebView2 Runtime 114.0.1823.67 installed",
      dotnet: ".NET 4.8 (release 528040)",
      powershell: "5.1.18362.1171",
      installed_software: {
        tailscale: "1.96.3 · service Running · StartType Automatic · BackendState=NoState (auth URL 041826 expired) — fresh installer download queued 042126 01:15 PT (pkgs.tailscale.com/stable/tailscale-setup-latest.exe) to clear wedged state",
        claude_desktop: "BLOCKED until Win10 upgrade completes — installer log shows 'Claude requires Windows 10 version 2004 or later (build 19041+). Current build: 7600' (installer mis-detects as Win7 due to missing Win10 compat manifest; real gate is 19041+ which CUBE's 18363 doesn't meet). NOTE: Claude Code CLI works on 1909 without this upgrade — demoted HEREGULL → NEARGULL 042126 01:12 PT",
        claude_code_cli: "2.1.116 installed 042126 01:12 PT via `npm install -g @anthropic-ai/claude-code` · Dan verified login 'Welcome back Dan · Opus 4.7 (1M context) · Claude Max · rspdan@gmail.com · C:\\windows\\system32 · xhigh · /effort' — universalization peer on Win10 1909 (third station after GOG1 Linux + ODT Win11)",
        node_npm: "Node v22.15.0 + npm 10.9.2 installed 042126 01:10 PT via node-v22.15.0-x64.msi (Invoke-WebRequest from nodejs.org + Start-Process -Wait, new PS session for PATH refresh)",
        windows_claude_code_prereq: "REQUIRED first-time: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` — default policy blocks npm.ps1 from loading. Without this, `npm install -g` fails with UnauthorizedAccess SecurityException. Applies to any Windows station running Claude Code CLI (STN2 prereq for Stan tomorrow)",
        docker: "not installed",
      },
      fleet_role: "Claude Desktop station (blocked pending upgrade) · ALFA WiFi testbed · 192.168.145.x network audit target · not an LLM node (GPU too weak)",
      form_factor: "MiniATX desktop (NOT HP EliteDesk mini as earlier memory claimed — Hardware List confirms MiniATX · drive `028_222GB.SSD.2019` canonical name)",
      verified_at: "042126 01:15 PT · CUBE HEREGULL resolved at 01:12 PT — Claude Code 2.1.116 running native on Win10 1909 (22H2 upgrade NOT required after all, demoted to NEARGULL) · ExecutionPolicy prereq discovered and documented · prior probe 042126 00:10 PT via probe_cube_042126.ps1 reconciled 041826 GPU drift (GTX 745 4GB, Trip-CUBE Graft thread 19da3359845aba21)",
      probe: "probe_cube_042126.ps1 (C:\\STAN\\ENGINE\\) · predecessors cube_probe.ps1 + cube_claude_diag.ps1 + cube_tailscale_up.ps1 scp'd 041826",
    },
    DPSL: {
      cpu: "probe-pending (iMac14,1 is i5 2.7GHz per 033026 record)",
      ram: "16 GB (per 033026 Stan record)",
      gpu: "integrated (iMac14,1 class)",
      storage: "1 TB (764 GB free per 033026 Stan record)",
      net_adapters: [
        "onboard ethernet · 10.0.0.102/24 (Fleet, 5PSW p4) · MAC 98:5A:EB:D2:91:0A",
        "onboard WiFi (currently on SLO-PUB)",
        "Tailscale · 100.90.109.17 (per 033026 Stan commissioning record; unverified tonight)",
      ],
      fleet_role: "C.B. host · Trip mirror · paired with DPSR via Apple Universal Control (shared kbd/mouse)",
      software: "macOS 12.7.6 Monterey · Logic Pro X present · Homebrew pending",
      verified_at: "033026 (stale); needs tonight's probe",
      probe: "Stan 033026 DPSL commissioning MAIL",
    },
    DPSR: {
      cpu: "probe-pending (DPSL clone originally — same iMac14,1 class, diverged since)",
      ram: "probe-pending",
      gpu: "integrated (iMac14,1 class)",
      storage: "probe-pending",
      net_adapters: [
        "onboard ethernet · 10.0.0.32/24 (Fleet, 5PSW p5) · MAC 98:5A:EB:D2:8B:31",
        "onboard WiFi (SLO-PUB likely)",
        "Tailscale (probe-pending)",
      ],
      fleet_role: "Trip power mirror · DPSL twin (diverged clone) · Universal Control partner to DPSL",
      verified_at: "spec-probe-pending",
      probe: "needs probe pass from DPSR Trip cycle",
    },
    TRP0: {
      cpu: "Intel (MacBook Pro Mid 2015 i7 class — probe-pending exact SKU)",
      ram: "probe-pending (16 GB typical for MBP15 high-end)",
      gpu: "integrated + discrete Radeon (MBP15 2015 dGPU)",
      storage: "probe-pending",
      net_adapters: [
        "USB ethernet AX88179B · 10.0.0.11/24 (Fleet, 5PSW p3) · MAC 44:F0:9E:AB:EA:2C",
        "onboard WiFi (probe-pending)",
      ],
      fleet_role: "Creative lab · Trip's roaming mac · runs Blender and Logic when on Unix Desk 1",
      software: "macOS Monterey 12.7.6",
      verified_at: "spec-probe-pending",
      probe: "needs probe pass from TRP0 Trip cycle",
    },
    STN1: {
      cpu: "Apple M2 (iPad Pro M2)",
      ram: "8 GB typical for M2 iPad Pro",
      gpu: "Apple GPU (M2)",
      storage: "probe-pending (likely 256/512 GB)",
      net_adapters: [
        "Dell K16A dock ethernet · 10.0.0.69/24 (Fleet, 8PSW p6) · Dell OUI MAC C0:25:A5:F8:D6:1B is the hub, not the iPad",
        "onboard WiFi (probe-pending)",
        "Cellular (probe-pending)",
      ],
      fleet_role: "Browser + SSH monitoring via Termius when docked; travels constantly",
      verified_at: "spec-probe-pending",
      probe: "needs iPad-direct probe (System Settings) when docked",
    },
    ACHE: {
      cpu: "Snapdragon (Samsung Galaxy S10 - Snapdragon 855 era)",
      ram: "8 GB typical",
      gpu: "Adreno 640",
      storage: "128 GB typical",
      net_adapters: [
        "Cellular 4G (VZW)",
        "WiFi (PIRALUS69 when at Nest)",
      ],
      fleet_role: "Full-mobile · always with Dan · browser + relay-read · Piralus-SSID scout · by the window at Nest",
      verified_at: "spec-probe-pending",
      probe: "needs direct Galaxy S10 about-phone read",
    },
    Piralus: {
      hardware_class: "Netgear Nighthawk X6 R7900",
      cpu: "BCM4709 dual-core 1GHz (factory spec)",
      ram: "512 MB (factory spec)",
      storage: "128 MB NAND + USB 3.0 media drive 931 GB (ReadyShare SMB)",
      radios: [
        "2.4 GHz (PIRALUS69_0 · channel auto)",
        "5 GHz low (PIRALUS69_1 · channel 44)",
        "5 GHz high (PIRALUS69_2 · channel 153)",
      ],
      net_ports: "4x gigabit LAN + 1x gigabit WAN (WAN disconnected by design — Fleet LAN has no internet egress through Piralus)",
      firmware: "V1.0.4.46_10.0.53",
      fleet_role: "Fleet backbone · DHCP .150-.200 · SMB media server",
      verified_at: "041726 21:55",
      probe: "Piralus admin UI (Chrome MCP)",
    },
  },


  // Phantom/unexplained WiFi clients seen by Piralus. Audit candidates.
  phantom_clients: [
    { ssid: "PIRALUS69_1", ip: "10.0.0.151", mac: "18:D6:C7:2A:E4:C7", hostname: "028-222GB-2019", note: "Leased from DHCP pool (>.150) — not a static claim. Dan hypothesis 041726: possibly TRP0 legacy hostname from early NEST days when TRP0 served as Bridge. NESTNET hunt recommended (search early-NEST hostnames, TRP0 history). If confirmed, this is a ghost beacon from TRP0's earlier era answering on its current WiFi card.", verified_at: "041726 21:55", hypothesis: "TRP0 legacy per Dan 041726 22:30" },
  ],

  // Known wifi-side instruments (identified after Piralus commissioning).
  // These are NOT phantoms — they are deliberate Rox faces that attach via WiFi.
  wifi_instruments: [
    { label: "ALFA AWUS036ACH", host: "CUBE", ssid: "PIRALUS69_1", ip: "10.0.0.44", mac: "00:C0:CA:BA:BD:0C", note: "ALFA USB-C AWUS036ACH — dual-band 2.4/5GHz WiFi adapter (Realtek RTL8812AU). Capable of monitor mode + packet capture. Currently attached to CUBE for testing alongside its internal PCIe WiFi card. Per Dan 041726 22:46: 'likely the most powerful wifi card in the Fleet now.' Mobile device — can move between stations. Identified by Dan 041726 ~22:25.", verified_at: "041726 22:25", probe: "Dan direct" },
  ],

  observation: [
    { rox: "ODT",  face: "Ethernet (Fleet, 8PSW p3)",          ip: "10.0.0.10/24",    detail: "static; CHANGED from 10.0.0.1 to eliminate stale INVENTORY conflict. No default gateway, DNS 8.8.4.4. Onboard Intel I219-V MAC D4:5D:64:7D:A5:44.", verified_at: "041726 21:55", probe: "self + Piralus attached devices" },
    { rox: "ODT",  face: "ASUS wifi (VZW)",                    ip: "192.168.195.149", detail: "gateway 192.168.195.64",                                                         verified_at: "041626 19:11", probe: "ipconfig (self)" },
    { rox: "ODT",  face: "WIFI 2 Intel AC 9560 160MHz",        ip: "(disabled)",      detail: "MAC 0A-F5-30-87-61-57 — available for Piralus SSID attach",                     verified_at: "041626 21:48", probe: "Get-NetAdapter" },
    { rox: "ODT",  face: "Tailscale",                          ip: "100.111.17.67",   detail: "peer 001-win10pro",                                                              verified_at: "041626 21:28", probe: "tailscale status" },
    { rox: "STN2", face: "Ethernet (Fleet, 8PSW p5)",          ip: "10.0.0.2",        detail: "UP on Piralus at 041726 21:55 — STN2 is at Nest Actual tonight on the desk with Dan. MAC 18:DB:F2:12:62:9E. Goes off-fleet frequently (OHC, travel) — roaming by role, stationary on weeks like this.", verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT" },
    { rox: "GOG1", face: "WiFi (PIRALUS69_1)",                 ip: "10.0.0.3",        detail: "Currently on WiFi. MAC 04:ED:33:84:D6:3B (AzureWave). Multi-homed: GOG1 simultaneously pulls Public WiFi (SLO-PUB), VZW_HOTSPOT, and has copper NIC available. Per Dan 041726 22:46: 'robust anchor for the UNIX side of NEST.' Wired NIC (HP 98:90:96:DC:76:0E) is a different interface — see open_faces.", verified_at: "041726 21:55", probe: "Piralus attached devices (wireless)" },
    { rox: "CUBE", face: "Ethernet (Fleet, 8PSW p8)",          ip: "10.0.0.4",        detail: "MAC E0:3F:49:1B:03:29 · UP. CUBE hosts the ALFA AWUS036ACH USB-C WiFi adapter (10.0.0.44) alongside its internal PCIe WiFi card — testing bed for the Fleet's most powerful WiFi card per Dan 041726 22:46.",                                                       verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT + Dan direct" },
    { rox: "DPSL", face: "Ethernet (Fleet, 5PSW p4)",          ip: "10.0.0.102",      detail: "MAC 98:5A:EB:D2:91:0A · UP · Piralus reports hostname 'DPSL'.",                                                     verified_at: "041726 21:55", probe: "Piralus attached devices" },
    { rox: "DPSL", face: "Tailscale (tailnet)",                 ip: "100.90.109.17",   detail: "Joined tailnet 033026 by Stan during DPSL commissioning (see MAIL/DPSL_TO_STN2_Stan_DPSLCommission_033026.md). Current status unverified tonight — needs cycle-through from DPSL Trip or Stan to confirm still active.", verified_at: "033026 (filed); unverified 041726", probe: "Bridge MAIL record (2 weeks old)" },
    { rox: "DPSR", face: "Ethernet (Fleet, 5PSW p5)",          ip: "10.0.0.32",       detail: "MAC 98:5A:EB:D2:8B:31 · UP. CORRECTED 041726 ~21:50 — earlier INVENTORY / compacted summaries had DPSR=.102 / DPSL=.101, both wrong. DPSL=.102, DPSR=.32. BIG_ASS_BOARD 032626 had reserved .8 for DPSR but the station landed at .32 via some prior DHCP cycle.", verified_at: "041726 21:50", probe: "Piralus attached devices" },
    { rox: "STN1", face: "K16A Hub ethernet (Fleet, 8PSW p6)", ip: "10.0.0.69",       detail: "Dell K16A hub passes iPad-originated frames through with its OWN MAC (Dell OUI C0:25:A5:F8:D6:1B). Piralus attached-devices page doesn't list this entry — probably aged from the table because static-IP host with infrequent traffic. Reachable via ARP + ping from ODT.", verified_at: "041726 21:55", probe: "ARP + ping from ODT (Piralus table was silent on this one)" },
    { rox: "TRP0", face: "USB ethernet (Fleet, 5PSW p3)",      ip: "10.0.0.11",       detail: "MAC 44:F0:9E:AB:EA:2C · UP on Piralus.",                                          verified_at: "041726 21:55", probe: "Piralus attached devices + ping from ODT" },
    { rox: "Piralus", face: "Fleet LAN management",            ip: "10.0.0.1/24",     detail: "LIVE. Admin UI reachable at http://10.0.0.1 (admin / theone1). DHCP pool .150–.200. Static fleet under .150. Commissioned 041726 ~20:55 (factory reset + Genie wizard + manual LAN-IP assignment).", verified_at: "041726 21:55", probe: "Chrome MCP + ODT Test-NetConnection port 80" },
  ],

  open_faces: [
    { rox: "Piralus", face: "Address reservations unpopulated", issue: "Piralus's Address Reservation table is empty. All 8 fleet stations have hardcoded static IPs on their OS side, so DHCP reservations are belt-and-suspenders — if any station ever lost its static config it would DHCP into the .150-.200 range, not catch its home IP. Belt-and-suspenders is worth it; not urgent.", action: "Via ADVANCED → Setup → LAN Setup → Address Reservation → Add. Populate with 8 rows: STN2/GOG1/CUBE/ODT/TRP0/STN1/DPSL/DPSR. MAC data is ready in fleet.js current_attachment.", verified_at: "041726 22:00", status: "NEARGULL" },
    { rox: "GOG1", face: "ICMP + SSH silence on wired NIC", issue: "Wired NIC (HP 98:90:96:DC:76:0E) historically silent from ODT. GOG1 currently on WiFi path anyway. Firewall-level drop at GOG1 on the wired interface.", action: "From GOG1 console: sudo ufw status verbose; ss -tlnp | grep 22; allow 10.0.0.0/24 on wired NIC.", verified_at: "041726 21:55", status: "blocked on GOG1 console" },
    { rox: "CUBE", face: "Phantom WiFi ghost at 10.0.0.151", issue: "Piralus sees a WiFi client with hostname '028-222GB-2019' (CUBE's hostname) at 10.0.0.151 — but CUBE is wired at 10.0.0.4 and hosts the ALFA at .44. The .44 ghost resolved to ALFA AWUS036ACH per Dan 041726 22:46. The .151 ghost remains: Dan hypothesis 041726 22:30 is that it may be TRP0 legacy hostname from early NEST days when TRP0 was the Bridge.", action: "NESTNET hunt: search early-NEST Bridge docs for hostname '028-222GB-2019' and cross-reference TRP0 history. Also check Piralus DHCP lease history for this MAC (18:D6:C7:2A:E4:C7).", verified_at: "041726 22:46", status: "audit pending · Dan hypothesis staged" },
    { rox: "GOG1", face: "Wired vs WiFi preference", issue: "GOG1 is on WiFi right now (PIRALUS69_1 / 04:ED:33:84:D6:3B). Map expects it wired at 5PSW p2. If the wired interface is plugged in, Linux is preferring WiFi — unusual. May be unplugged or bridging config drift.", action: "Verify at GOG1 console: ip link show; ip route show. If wired is expected, fix route metric.", verified_at: "041726 21:55", status: "diagnostic pending" },
  ],
};
