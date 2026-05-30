//
// ============================================================
// /fleet PAGE DATA — PUBLIC FACE (Box-in-Box Rox Genius, 053026)
// ============================================================
//
// This is the PUBLIC, committed Fleet roster. It shows the FACE of the Fleet:
// Rox identity (name, hardware, OS, room, role, mobility), the canonical map,
// the living-map philosophy, and the switch topology STRUCTURE.
//
// The sensitive SUBSTRATE — admin/WiFi passwords, SSH commands, LAN + Tailscale
// IPs, MAC addresses, share paths — is BOXED in src/data/fleet_private.js,
// which is gitignored and never built into the public site. Crew read the full
// detail there or in the private Bridge (FLEET/). Per Box-in-Box Rox Genius:
// the public face is shown; the keys stay in the box.
//
// Rules for editing the PUBLIC file:
// - Never add a credential, password, SSH command, LAN/Tailscale IP, or MAC here.
//   Those belong in fleet_private.js (gitignored) or the private Bridge.
// - Rox identity (name/hw/os/loc/role/mobility) is public-safe — edit freely.
// - Bump fleet.updated when you change anything.
//
// Living principle (per RELAY/STANDARD_RULE_FleetIPsObservedNotDefining_Trip_041626.md):
// IPs are faces, not identities. Station identity is the Rox — name, hardware, OS,
// location, role. An IP is a face currently rotated forward; faces change between
// sessions, so faces are boxed and only identity is shown publicly.
//
// Mobility:
//   stationary  — never moves. Lives at one physical location forever.
//   roaming     — semi-mobile. Leaves the Nest regularly, returns to known home.
//   full-mobile — always with Dan. No home port, home radio changes.

export const fleet = {
  updated: "053026 09:10 PT",
  updated_by: "Box-in-Box Rox Genius sanitization (STN2 Trip, 053026): credentials, WiFi/admin passwords, SSH commands, LAN + Tailscale IPs, MAC addresses, and share paths moved out of the public roster into gitignored src/data/fleet_private.js. The public /fleet face now shows Rox identity, the map, the philosophy, and topology structure. NEST.03 era: 3P PeaPod with 1-2P backwards-compatibility. The Fleet is Long-Term AND Ever-Changing — never frozen.",
  instructions: "Edit src/data/fleet.js for the public roster (no credentials/IPs/MACs — those live in the gitignored fleet_private.js). Push to rebuild.",

  map: {
    canonical_image: "/img/fleet_map_041426.png",
    caption: "NEST.01_NOTES_041426 — Dan's Illustrator physical/geographic reference. The source of truth for rooms, desk layout, switch physical location, and WiFi zones. Updated by Dan in Illustrator when the physical layout changes. The Living Map renders attachment state on top of this canonical reference.",
    delta_note: "Living-map deltas (room layout, switch placement, station moves) are tracked privately. The map image above is the public canonical reference.",
  },

  // PUBLIC FACE: Fleet infrastructure roles. Addresses/credentials/share-paths are boxed.
  baseplate: [
    { role: "Piralus Actual", hardware: "Netgear Nighthawk X6 R7900", loc: "Nest Actual (Room Center)", func: "Fleet backbone router. DHCP for the Fleet LAN. WiFi access point (2.4GHz + dual 5GHz). USB media server. The bridge-at-center is the design anchor for Nest Actual — the room is two hemispheres joined by the bridge.", note: "(Fleet-internal addressing, credentials, and share details boxed in fleet_private.js)", verified_at: "041726", probe: "(boxed)" },
    { role: "5PSW", hardware: "Linksys EZXS55W (5-port gig)", loc: "Nest Actual (north, near window)", func: "Fleet switch for unix stations + Piralus uplink", note: "(port map boxed)", verified_at: "041426", probe: "(boxed)" },
    { role: "8PSW", hardware: "D-Link DIR-632 (dumb-switch)", loc: "Nest Actual (under Windows Desk 1)", func: "Fleet switch for windows stations + Piralus uplink", note: "(port map boxed)", verified_at: "041726", probe: "(boxed)" },
    { role: "Fleet LAN", hardware: "Piralus-routed local subnet", loc: "Nest Actual via 5PSW + 8PSW + Piralus backbone", func: "Fleet-local subnet. No internet egress. Hotspot and Fleet LAN never touch.", note: "(addressing boxed)", verified_at: "041726", probe: "(boxed)" },
    { role: "VZW_HOTSPOT", hardware: "Verizon wifi hotspot", loc: "Fleet-wide (per-device wifi)", func: "Internet egress", note: "", verified_at: "041626", probe: "(boxed)" },
    { role: "Guest (SLO-PUB)", hardware: "Port Angeles public school wifi", loc: "Via external antenna", func: "Secondary internet link; always-online path when cellular is out", note: "PASD public signal", verified_at: "041726", probe: "(boxed)" },
    { role: "Tailscale", hardware: "WireGuard mesh VPN", loc: "Fleet-wide (station-optional)", func: "Location-independent identity across off-fleet roaming", note: "(peer addresses boxed in fleet_private.js)", verified_at: "051826", probe: "(boxed)" },
    { role: "Universal Control", hardware: "Apple ecosystem", loc: "iMac twin-pair only", func: "Shared keyboard/mouse bridge between the iMac twins. Cursor flows between their screens as a single workstation.", note: "Twin-pair Rox, not two independent stations.", verified_at: "041626", probe: "(boxed)" },
  ],

  // PUBLIC FACE: Rox identity. SSH commands and Tailscale/LAN IPs are boxed.
  rox: [
    { name: "ODT",  hw: "Desktop tower",               os: "Windows 10",             loc: "Nest Actual, Windows Desk 1",               role: "Primary workstation · Trip host",          mobility: "stationary", mobility_note: "NEVER leaves. Permanent install at Windows Desk 1.", faces: "Ethernet (Fleet) · WiFi · Tailscale", ssh: "Crew-internal (boxed)", tailscale: "Crew-internal (boxed)", proton_vpn: "unknown (probe pending)" },
    { name: "STN2", hw: "Dell Latitude",               os: "Windows 10",             loc: "OHC Actual semi-permanent (PeaPod-pair with CUBE since 051626)",  role: "Stan host · mobile · Doc-Local at OHC",        mobility: "roaming",    mobility_note: "OHC Actual semi-permanent since 051626 PeaPod-pair config. Goes between OHC + Nest + truck. Reachable on the Fleet LAN when docked at Nest; Tailscale path valid from anywhere.", faces: "Ethernet (Fleet) · onboard wifi · VZW when mobile · OHC WiFi when at OHC · Tailscale", ssh: "Crew-internal (boxed)", tailscale: "Crew-internal (boxed)", proton_vpn: "unknown (probe pending)" },
    { name: "GOG1", hw: "Dell XPS 8700 · DECOMMISSIONED ~050426",  os: "Ubuntu 22.04.5 LTS (pre-decom)",  loc: "Nest Actual, Unix Desk 2 (north) · physical position retained for fan-upgrade access",  role: "DECOMMISSIONED ~050426 · ~1 month dark for fan upgrade",  mobility: "stationary", mobility_note: "DECOMMISSIONED ~050426. Pre-decom: stationary Unix Desk 2 with WiFi + wired NIC paths. 1.7TB internal storage available as CUBE-SSD-source candidate.", faces: "DECOMMISSIONED · physical retained for fan-upgrade-or-recommission decision", ssh: "not active (decommissioned)", tailscale: "not peered (decommissioned)", proton_vpn: "n/a (decommissioned)" },
    { name: "CUBE", hw: "ASUS Z87 DIY desktop · 931GB SSD post-swap", os: "Windows 10 install in progress", loc: "OHC Actual PERMANENT since 051526 ~16:55 PT", role: "Workplace-class workstation · PeaPod-pair partner to STN2 at OHC",  mobility: "stationary", mobility_note: "OHC Actual PERMANENT since 051526. ASUS Z87 DIY desktop · i5-4670K 4c/4t · 20 GB RAM · GTX 745 4 GB. CUBE-as-super-laptop: beefy desktop, compact enough for portability between OHC + Nest Actual. SSD upgrade executed 052026 evening: 931GB Crucial BX500 swapped into CUBE chassis. Win10 install in progress after Win11 HID-regression abandoned.", faces: "Ethernet (paired with STN2 at OHC) · onboard wifi · Tailscale", ssh: "Crew-internal (boxed)", tailscale: "Crew-internal (boxed)", proton_vpn: "not installed (deferred)" },
    { name: "DPSL", hw: "iMac Late 2013",              os: "macOS",                  loc: "Nest Actual, Unix Desk 1 (south-west)",     role: "C.B. host · Trip mirror · DPSR twin",       mobility: "stationary", mobility_note: "Stationary on Unix Desk 1. Universal-Control-paired with DPSR.",                                             faces: "Ethernet (Fleet) · Guest wifi + ProtonVPN · Universal Control <-> DPSR", ssh: "pending setup", tailscale: "Crew-internal (boxed)", proton_vpn: "active on Guest wifi" },
    { name: "DPSR", hw: "iMac Late 2013 (DPSL clone)", os: "macOS",                  loc: "Nest Actual, Unix Desk 2 (alongside GOG1)", role: "Trip power mirror · DPSL twin",             mobility: "stationary", mobility_note: "Stationary on Unix Desk 2. Universal-Control-paired with DPSL.",                                             faces: "Ethernet (Fleet) · Guest wifi · Universal Control <-> DPSL", ssh: "pending setup", tailscale: "not peered yet", proton_vpn: "likely active (twin of DPSL, verify)" },
    { name: "TRP0", hw: "MacBook Pro Mid 2015",        os: "macOS Monterey 12.7.6",  loc: "Mobile (Unix Desk 1 home)",                 role: "Creative lab · mobile",                     mobility: "roaming",    mobility_note: "Home at Unix Desk 1 via USB ethernet adapter. Travels with Dan.",                                 faces: "USB ethernet (Fleet) · onboard wifi · VZW when mobile", ssh: "pending verification", tailscale: "pending (join when off-fleet)", proton_vpn: "unknown" },
    { name: "STN1", hw: "iPad Pro M2",                 os: "iPadOS",                 loc: "Mobile (dock when at Nest)",               role: "Browser + SSH monitoring (Termius)",        mobility: "roaming",    mobility_note: "Home when docked on the Dell K16A hub. Travels constantly.", faces: "Hub ethernet (Fleet) · onboard wifi · VZW when mobile", ssh: "client-only (Termius app)", tailscale: "pending (join when off-fleet)", proton_vpn: "unknown" },
    { name: "ACHE", hw: "Samsung Galaxy S10",          os: "Android / DeX",          loc: "Full-mobile (always with Dan)",             role: "Browser + relay-read · WiFi scout", mobility: "full-mobile", mobility_note: "Always with Dan. No Fleet LAN home. Joins Fleet WiFi when at Nest; cellular when mobile.",           faces: "4G cellular · Fleet WiFi (when in range)", ssh: "N/A (browser-only station)", tailscale: "N/A", proton_vpn: "N/A" },
    { name: "ACHO", hw: "probe-pending",                os: "probe-pending",          loc: "Relocatable (with Dan)",                    role: "Relocatable station · Dan-named 052926 (post-fleet.js snapshot)", mobility: "full-mobile", mobility_note: "Dan-named 052926, after the last fleet.js snapshot. Relocatable, travels with Dan. Hardware + faces pending probe + fleet.js entry.", faces: "pending fleet.js entry", ssh: "pending", tailscale: "pending", proton_vpn: "pending" },
    { name: "O'Shin", hw: "Raspberry Pi 4",            os: "Raspberry Pi OS (verify)", loc: "Nest Actual (currently OFF-NETWORK)", role: "TBD — candidate: always-online edge node / caching proxy / fleet monitor", mobility: "stationary", mobility_note: "Off-network for weeks. Rejoin plan: locate device → power + SD card verify → OS update → Tailscale install → fleet registration. Historically was online before going dark.", faces: "onboard ethernet + onboard wifi", ssh: "pending (station down)", tailscale: "pending (mesh target)", proton_vpn: "pending (optional)" },
  ],

  // PUBLIC FACE: topology STRUCTURE (switch + port roles). Management IPs and per-port expected IPs are boxed.
  topology: {
    switches: [
      {
        id: "piralus",
        label: "PIRALUS",
        hw: "Netgear R7900",
        loc: "Room Center",
        mgmt_ip: "(boxed)",
        ports: [
          { n: 1, uplink_to: "5PSW uplink",  home: null, note: "Unix-zone aggregator uplink" },
          { n: 2, uplink_to: "8PSW uplink",  home: null, note: "Windows-zone aggregator uplink" },
          { n: 3, unused: true },
          { n: 4, unused: true },
          { n: "USB", note: "Media server (boxed share path)" },
        ],
        wifi_radios: ["Fleet WiFi 2.4GHz", "Fleet WiFi 5GHz low", "Fleet WiFi 5GHz high"],
        verified_at: "041726",
      },
      {
        id: "5psw",
        label: "5PSW",
        hw: "Linksys EZXS55W (5-port gig, unmanaged)",
        loc: "Unix zone, north near window",
        ports: [
          { n: 1, uplink_to: "PIRALUS p1", home: null },
          { n: 2, home: "GOG1" },
          { n: 3, home: "TRP0" },
          { n: 4, home: "DPSL" },
          { n: 5, home: "DPSR" },
        ],
        verified_at: "041726",
      },
      {
        id: "8psw",
        label: "8PSW",
        hw: "D-Link DIR-632 (used as dumb switch)",
        loc: "Windows zone, under Windows Desk 1",
        ports: [
          { n: 1, uplink_to: "PIRALUS p2", home: null },
          { n: 2, unused: true },
          { n: 3, home: "ODT" },
          { n: 4, unused: true },
          { n: 5, home: "STN2", note: "Empty when STN2 is off-fleet (roaming)" },
          { n: 6, home: "STN1", note: "Via Dell K16A dock. Empty when iPad undocked." },
          { n: 7, unused: true },
          { n: 8, home: "CUBE" },
        ],
        verified_at: "041726",
      },
    ],
  },

  // Current attachment (who is where right now). Live IPs/MACs are boxed; only Rox + state shown publicly.
  current_attachment: [
    { rox: "ODT",     via: "wired",  at: "8PSW p3",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "STN2",    via: "wired",  at: "8PSW p5",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "CUBE",    via: "wired",  at: "8PSW p8",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "TRP0",    via: "wired",  at: "5PSW p3",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "DPSL",    via: "wired",  at: "5PSW p4",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "DPSR",    via: "wired",  at: "5PSW p5",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "STN1",    via: "wired",  at: "8PSW p6",    ip: "(boxed)", status: "home",    verified_at: "041726", probe: "(boxed)" },
    { rox: "GOG1",    via: "wifi",   at: "Fleet WiFi", ip: "(boxed)", status: "wifi-substitute", verified_at: "041726", probe: "(boxed)" },
    { rox: "ACHE",    via: "off",    at: "(not at Nest)", ip: "(cellular only)", status: "full-mobile", verified_at: "041726", probe: "(no sample)" },
  ],

  // PUBLIC FACE: hardware identity (CPU/RAM/GPU/storage class + role). Net adapters with IPs/MACs, users, SSH, and admin details are boxed.
  hardware: {
    ODT: {
      cpu: "Intel Core i9-9900K · 8C/16T · 3.60GHz base",
      ram: "32 GB",
      gpu: "NVIDIA GeForce RTX 3060 · 12 GB VRAM · Ampere",
      storage: "10 drives totalling ~30 TB. Naming convention encodes capacity + year.",
      net_adapters: ["(Fleet + Tailscale adapters boxed in fleet_private.js)"],
      user: "(boxed)",
      fleet_role: "Primary workstation · Trip host",
      verified_at: "041726",
      probe: "(boxed)",
    },
    GOG1: {
      cpu: "Intel Core i7-4790 · 4C/8T · 3.60GHz base · Haswell",
      ram: "16 GB",
      gpu: "NVIDIA GeForce GTX 980 · 4 GB VRAM · Maxwell",
      storage: "1.8 TB ext4 root · 512 MB EFI",
      net_adapters: ["(boxed)"],
      fleet_role: "DECOMMISSIONED ~050426 · ~1 month dark for fan upgrade",
      verified_at: "041726",
      probe: "(boxed)",
    },
    STN2: {
      cpu: "probe-pending",
      ram: "probe-pending",
      gpu: "probe-pending (integrated Intel expected)",
      storage: "probe-pending",
      net_adapters: ["(boxed)"],
      fleet_role: "Stan host · Doc-Local at OHC · hosts Docker Model Runner",
      user: "(boxed)",
      verified_at: "spec-probe-pending",
      probe: "(boxed)",
    },
    CUBE: {
      cpu: "Intel Core i5-4670K · 4 cores / 4 threads · 3.40 GHz (Haswell, K-SKU)",
      ram: "19.9 GB",
      gpu: "NVIDIA GeForce GTX 745 · 4 GB VRAM · Maxwell",
      storage: "C: 228 GB SSD (system) · D: 596 GB · E: 932 GB",
      os: "Windows 10 Pro (Win11 abandoned 052026 per USB-stack HID regression)",
      net_adapters: ["(boxed)"],
      user: "(boxed)",
      known_blocker: "Claude Desktop requires Win10 build 19041+; Claude Code CLI works on 1909.",
      software: "Tailscale · Claude Code CLI 2.1.116 · Node v22.15.0 + npm 10.9.2",
      fleet_role: "PeaPod-pair partner to STN2 at OHC · ALFA WiFi testbed",
      verified_at: "042126",
      probe: "(boxed)",
    },
    DPSL: {
      cpu: "probe-pending (iMac14,1 i5 2.7GHz)",
      ram: "16 GB",
      gpu: "integrated (iMac14,1 class)",
      storage: "1 TB",
      net_adapters: ["(boxed)"],
      fleet_role: "C.B. host · Trip mirror · paired with DPSR via Apple Universal Control",
      software: "macOS 12.7.6 Monterey · Logic Pro X present",
      verified_at: "033026 (stale)",
      probe: "(boxed)",
    },
    DPSR: {
      cpu: "probe-pending (DPSL clone — iMac14,1 class)",
      ram: "probe-pending",
      gpu: "integrated (iMac14,1 class)",
      storage: "probe-pending",
      net_adapters: ["(boxed)"],
      fleet_role: "Trip power mirror · DPSL twin · Universal Control partner to DPSL",
      verified_at: "spec-probe-pending",
      probe: "(boxed)",
    },
    TRP0: {
      cpu: "Intel (MacBook Pro Mid 2015 i7 class)",
      ram: "probe-pending (16 GB typical)",
      gpu: "integrated + discrete Radeon",
      storage: "probe-pending",
      net_adapters: ["(boxed)"],
      fleet_role: "Creative lab · Trip's roaming mac · Blender + Logic",
      software: "macOS Monterey 12.7.6",
      verified_at: "spec-probe-pending",
      probe: "(boxed)",
    },
    STN1: {
      cpu: "Apple M2 (iPad Pro M2)",
      ram: "8 GB typical for M2 iPad Pro",
      gpu: "Apple GPU (M2)",
      storage: "probe-pending",
      net_adapters: ["(boxed)"],
      fleet_role: "Browser + SSH monitoring via Termius when docked",
      verified_at: "spec-probe-pending",
      probe: "(boxed)",
    },
    ACHE: {
      cpu: "Snapdragon 855 era (Samsung Galaxy S10)",
      ram: "8 GB typical",
      gpu: "Adreno 640",
      storage: "128 GB typical",
      net_adapters: ["(boxed)"],
      fleet_role: "Full-mobile · always with Dan · browser + relay-read",
      verified_at: "spec-probe-pending",
      probe: "(boxed)",
    },
    Piralus: {
      hardware_class: "Netgear Nighthawk X6 R7900",
      cpu: "BCM4709 dual-core 1GHz (factory spec)",
      ram: "512 MB (factory spec)",
      storage: "128 MB NAND + USB 3.0 media drive (ReadyShare SMB)",
      radios: ["2.4 GHz", "5 GHz low", "5 GHz high"],
      net_ports: "4x gigabit LAN + 1x gigabit WAN (WAN disconnected by design)",
      firmware: "(boxed)",
      fleet_role: "Fleet backbone · DHCP · SMB media server",
      verified_at: "041726",
      probe: "(boxed)",
    },
  },

  // Audit candidates. MACs/IPs boxed.
  phantom_clients: [
    { ssid: "Fleet WiFi", ip: "(boxed)", mac: "(boxed)", hostname: "(boxed)", note: "A DHCP-leased WiFi client under audit — hypothesis is a legacy hostname from early NEST days. Details boxed.", verified_at: "041726", hypothesis: "legacy hostname (boxed)" },
  ],

  // Deliberate Rox faces that attach via WiFi (not phantoms). IPs/MACs boxed.
  wifi_instruments: [
    { label: "ALFA AWUS036ACH", host: "CUBE", ssid: "Fleet WiFi", ip: "(boxed)", mac: "(boxed)", note: "ALFA USB-C AWUS036ACH — dual-band 2.4/5GHz WiFi adapter, monitor-mode capable. Likely the most powerful WiFi card in the Fleet. Mobile — can move between stations.", verified_at: "041726", probe: "Dan direct" },
  ],

  // Observation rows: live faces. IPs/MACs/detail boxed; only Rox + face-class shown publicly.
  observation: [
    { rox: "ODT",  face: "Ethernet (Fleet)",   ip: "(boxed)", detail: "(boxed)", verified_at: "041726", probe: "(boxed)" },
    { rox: "ODT",  face: "WiFi (VZW)",          ip: "(boxed)", detail: "(boxed)", verified_at: "041626", probe: "(boxed)" },
    { rox: "ODT",  face: "Tailscale",           ip: "(boxed)", detail: "(boxed)", verified_at: "041626", probe: "(boxed)" },
    { rox: "STN2", face: "Ethernet (Fleet)",    ip: "(boxed)", detail: "Roaming by role; on the Fleet when docked at Nest.", verified_at: "041726", probe: "(boxed)" },
    { rox: "GOG1", face: "WiFi (Fleet)",        ip: "(boxed)", detail: "(boxed) · DECOMMISSIONED", verified_at: "041726", probe: "(boxed)" },
    { rox: "CUBE", face: "Ethernet (Fleet)",    ip: "(boxed)", detail: "Hosts the ALFA WiFi testbed alongside its internal card.", verified_at: "041726", probe: "(boxed)" },
    { rox: "DPSL", face: "Ethernet (Fleet)",    ip: "(boxed)", detail: "(boxed)", verified_at: "041726", probe: "(boxed)" },
    { rox: "DPSL", face: "Tailscale (tailnet)", ip: "(boxed)", detail: "Joined tailnet 033026 during DPSL commissioning; status unverified.", verified_at: "033026", probe: "(boxed)" },
    { rox: "DPSR", face: "Ethernet (Fleet)",    ip: "(boxed)", detail: "(boxed)", verified_at: "041726", probe: "(boxed)" },
    { rox: "STN1", face: "Hub ethernet (Fleet)", ip: "(boxed)", detail: "Dell K16A hub passes iPad frames with its own MAC.", verified_at: "041726", probe: "(boxed)" },
    { rox: "TRP0", face: "USB ethernet (Fleet)", ip: "(boxed)", detail: "(boxed)", verified_at: "041726", probe: "(boxed)" },
    { rox: "Piralus", face: "Fleet LAN management", ip: "(boxed)", detail: "LIVE Fleet backbone. Admin UI + DHCP details boxed.", verified_at: "041726", probe: "(boxed)" },
  ],

  open_faces: [
    { rox: "Piralus", face: "Address reservations unpopulated", issue: "Piralus's Address Reservation table is empty. All fleet stations have hardcoded static IPs on their OS side, so DHCP reservations are belt-and-suspenders. Not urgent.", action: "Populate Address Reservation rows for the 8 fleet stations (MAC data ready in fleet_private.js).", verified_at: "041726", status: "NEARGULL" },
    { rox: "GOG1", face: "ICMP + SSH silence on wired NIC", issue: "Wired NIC historically silent. GOG1 currently on WiFi path anyway. Firewall-level drop on the wired interface.", action: "From GOG1 console: check ufw status; allow Fleet subnet on wired NIC.", verified_at: "041726", status: "blocked on GOG1 console (decommissioned)" },
    { rox: "CUBE", face: "Phantom WiFi ghost", issue: "Piralus saw a WiFi client with CUBE's hostname on a DHCP-pool address while CUBE is wired. Hypothesis: a legacy hostname from early NEST days.", action: "NESTNET hunt: search early-NEST Bridge docs + DHCP lease history (details in fleet_private.js).", verified_at: "041726", status: "audit pending" },
    { rox: "GOG1", face: "Wired vs WiFi preference", issue: "GOG1 was on WiFi while the map expects it wired. Linux preferring WiFi — unusual. May be unplugged or bridging drift.", action: "Verify at GOG1 console: ip link / ip route. (Decommissioned — deferred.)", verified_at: "041726", status: "diagnostic pending (decommissioned)" },
  ],
};

//
// ============================================================
// FLEET ACTUAL board — El VIS design ported to the portal (STN2 Trip, 053026)
// ============================================================
//
// ONE BOARD: Rox identity (from fleet.rox above) + live crew-seat runtime.
// The board reads fleet.js identity and overlays who is seated where right now.
// Crew-seat state is the LIVE layer — grounded in cross-witnessed Bridge state,
// re-stamped when the Crew configuration changes. Box-in-Box holds: face/tailscale
// values shown here are sanitized descriptors, never raw IPs (those stay boxed).
//

export const board = {
  eyebrow: "HEIRCOR OP · NEST INTERNAL · FLEET ACTUAL · INVENTORY · LIVE CREW",
  title: "FLEET ACTUAL",
  tagline: "ONE BOARD · IDENTITY (ROX) + RUNTIME (CREW SEATS)",
  updated: "053026 ~13:30 PT",
  lbm: "STN2 Trip",
  quote: "Hold the bird, don't crush it. Record the moment so the past is not lost; keep the roster open so the future is not killed. The Fleet grows, condenses, and changes.",
  caption: "Long-term AND ever-changing. A station's identity persists (the Rox, its name) while its faces shift: roles, storage, location, IP. Stable spine, moving body.",
  legend: [
    { key: "lbm",            label: "LBM",            desc: "Lead Boot Model this session" },
    { key: "active",         label: "ACTIVE",         desc: "seated and working" },
    { key: "standby",        label: "STANDBY",        desc: "booted, awaiting direction" },
    { key: "more",           label: "MORE",           desc: "more detail available" },
    { key: "off-fleet",      label: "OFF-FLEET",      desc: "off the Nest Fleet LAN (roaming / OHC)" },
    { key: "dark",           label: "DARK",           desc: "powered but unseated" },
    { key: "dark-ready",     label: "DARK-READY",     desc: "ready to wake" },
    { key: "off-network",    label: "OFF-NETWORK",    desc: "unreachable" },
    { key: "decommissioned", label: "DECOMMISSIONED", desc: "retired" },
  ],
};

// Live crew seats, keyed by Rox name. station_status drives the card badge.
// seats[] = who is seated on that Rox right now, their status, and what they are doing.
export const crew_seats = {
  ODT:  { station_status: "off-fleet", seats: [
    { crew: "ODT Trip", status: "standby", note: "Writer-lane · ODT host at Nest Actual" },
    { crew: "ODT Doc",  status: "standby", note: "Producer-lane cross-witness" },
  ]},
  STN2: { station_status: "off-fleet", seats: [
    { crew: "STN2 Trip", status: "lbm",    note: "LBM 053026 · /fleet-actual port + Crew Data Day delegation" },
    { crew: "STN2 Doc",  status: "active", note: "Skills walk-8-pairs prep · KT-cooperation with CUBE Doc" },
  ]},
  CUBE: { station_status: "off-fleet", seats: [
    { crew: "CUBE Doc",  status: "active", note: "KT-instance collision diagnosis · ENGINE trio · #127" },
    { crew: "CUBE Trip", status: "more",   note: "ACK-collision diagnosed · gate0 fix-forever (f3819ea) · render-verify ready" },
  ]},
  STN1: { station_status: "off-fleet", seats: [
    { crew: "STN1 Doc",  status: "active", note: "Dan-meeting now · NEST.02 to NEST.03 portal copy" },
  ]},
  ACHE: { station_status: "off-fleet", seats: [
    { crew: "ACHE Doc",  status: "standby",    note: "Dan may engage later · heartbeat cascade" },
    { crew: "ACHE Trip", status: "dark-ready", note: "activation pending · DOCKET" },
  ]},
  ACHO: { station_status: "off-fleet", seats: [] },
  TRP0: { station_status: "off-fleet", seats: [
    { crew: "TRP0 Trip", status: "dark-ready", note: "creative lab · roaming with Dan" },
  ]},
  DPSL: { station_status: "dark-ready", seats: [
    { crew: "DPSL", status: "dark-ready", note: "C.B. host · Trip mirror · at Nest Actual" },
  ]},
  DPSR: { station_status: "dark-ready", seats: [] },
  GOG1: { station_status: "decommissioned", seats: [] },
  "O'Shin": { station_status: "off-network", seats: [] },
};
