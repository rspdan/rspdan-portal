// src/data/fleet.js
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

export const fleet = {
  updated: "041626 23:10 PT",
  updated_by: "Trip (ODT) + Dan",
  instructions: "Edit src/data/fleet.js directly. Push to rebuild. IPs are observed values, not defining values.",

  baseplate: [
    { role: "Piralus Actual", hardware: "Netgear R7900", loc: "Nest Actual (Room Center, under bed)", func: "L2 bridge between two hemispheres (5PSW unix side ↔ 8PSW windows side). Also wifi AP on own SSID. Planned Fleet LAN management at 10.0.0.1.", note: "Bridge-at-.1 is the design anchor for Nest Actual — the room is two hemispheres joined by the bridge. Pattern echoes across Nest / Waywood / Olympic / neurology / biology / storytelling / physics / music (per Dan). Admin UI currently on R7900 SSID subnet; LAN management needs enabling.", verified_at: "041626 23:10", probe: "Dan direction + topology reading" },
    { role: "5PSW", hardware: "Linksys EZXS55W (5-port gig)", loc: "Nest Actual (north, near window)", func: "Fleet switch for unix stations + Piralus uplink", note: "p1=PIRp1 · p2=GOG1 · p3=TRP0 · p4=DPSL · p5=DPSR", verified_at: "041426", probe: "NEST.01_NOTES_041426_1" },
    { role: "8PSW", hardware: "D-Link DIR-632 (dumb-switch)", loc: "Nest Actual (under Windows Desk 1)", func: "Fleet switch for windows stations + Piralus uplink", note: "p1=PIRp2 · p3=ODT · p5=STN2 · p8=CUBE (rest unused)", verified_at: "041426", probe: "NEST.01_NOTES_041426_1" },
    { role: "Fleet LAN", hardware: "10.0.0.0/24 (routerless L2 island)", loc: "Nest Actual via 5PSW + 8PSW + Piralus bridge", func: "Isolated local mesh. No routing out. Never touches VZW_HOTSPOT.", note: "No DHCP server — stations are static. IPs are observed values, not defining values.", verified_at: "041626 22:02", probe: "ODT route table + ARP" },
    { role: "VZW_HOTSPOT", hardware: "Verizon wifi hotspot", loc: "Fleet-wide (per-device wifi)", func: "Internet egress", note: "Fast wifi restored 041426", verified_at: "041626 19:11", probe: "ODT ipconfig" },
    { role: "Guest (SLO-LIB)", hardware: "Port Angeles library wifi", loc: "Via external antenna (GOG1 T4U v3)", func: "Library network link", note: "SLO-LIB is current link name", verified_at: "041526", probe: "Dan direct" },
    { role: "Tailscale", hardware: "WireGuard mesh VPN", loc: "Fleet-wide (station-optional)", func: "Location-independent identity", note: "ODT active. DPSL/O'Shin offline for days. GOG1 not a peer.", verified_at: "041626 21:28", probe: "tailscale status" },
    { role: "Universal Control", hardware: "Apple ecosystem", loc: "DPSL <-> DPSR twin-pair only", func: "Shared keyboard/mouse bridge between the iMac twins", note: "DPSR is a DPSL clone, diverged. Cursor flows between their screens as a single workstation. Twin-pair Rox, not two independent stations.", verified_at: "041626 21:32", probe: "Dan direct" },
    { role: "NOLS_WPA", hardware: "External wifi (east of Piralus)", loc: "Outside Fleet LAN", func: "Adjacent wifi visible from Nest Actual", note: "Labeled on NEST.01_NOTES_041426_1. Not used by fleet.", verified_at: "041426", probe: "NEST.01_NOTES_041426_1" },
  ],

  rox: [
    { name: "ODT",  hw: "Desktop tower",               os: "Windows 10",             loc: "Nest Actual, Windows Desk 1",               role: "Primary workstation · Trip host",          faces: "Ethernet (Fleet, 8PSW p3) · WIFI 1 ASUS/Broadcom (VZW) · WIFI 2 Intel AC 9560 (disabled, available) · Tailscale" },
    { name: "STN2", hw: "Dell Latitude",               os: "Windows 10",             loc: "Nest Actual / mobile",                      role: "Stan host · mobile",                        faces: "Ethernet (Fleet, 8PSW p5) · onboard wifi" },
    { name: "GOG1", hw: "Dell XPS 8700",               os: "Ubuntu 22.04.5 LTS",     loc: "Nest Actual, Unix Desk 2 (north)",          role: "Server candidate (Ollama/Meili)",           faces: "Intel AX200 (VZW) · T4U v3 USB wifi · NIC copper (Fleet, 5PSW p2) · USB copper (added 041626)" },
    { name: "CUBE", hw: "HP EliteDesk Mini",           os: "Windows 10",             loc: "Nest Actual, near closet",                  role: "Tertiary workstation",                      faces: "Ethernet (Fleet, 8PSW p8) · onboard wifi" },
    { name: "DPSL", hw: "iMac Late 2013",              os: "macOS",                  loc: "Nest Actual, Unix Desk 1 (south-west)",     role: "C.B. host · Trip mirror · DPSR twin",       faces: "Ethernet (Fleet, 5PSW p4) · Guest wifi + ProtonVPN Stealth · Universal Control <-> DPSR" },
    { name: "DPSR", hw: "iMac Late 2013 (DPSL clone)", os: "macOS",                  loc: "Nest Actual, Unix Desk 2 (alongside GOG1)", role: "Trip power mirror · DPSL twin",             faces: "Ethernet (Fleet, 5PSW p5) · Guest wifi · Universal Control <-> DPSL" },
    { name: "TRP0", hw: "MacBook Pro Mid 2015",        os: "macOS Monterey 12.7.6",  loc: "Mobile (Unix Desk 1 home)",                 role: "Creative lab · mobile",                     faces: "USB ethernet AX88179B (Fleet, 5PSW p3) · onboard wifi" },
    { name: "STN1", hw: "iPad Pro M2",                 os: "iPadOS",                 loc: "Mobile",                                     role: "Browser + SSH monitoring (Termius)",        faces: "K16A Hub ethernet (Fleet) · onboard wifi" },
    { name: "ACHE", hw: "Samsung Galaxy S10",          os: "Android / DeX",          loc: "Mobile",                                     role: "Browser + relay-read · Piralus-SSID scout", faces: "4G cellular only (no Fleet LAN). Can join Piralus SSID to reach admin UI." },
  ],

  observation: [
    { rox: "ODT",  face: "Ethernet (Fleet, 8PSW p3)",          ip: "10.0.0.10/24",    detail: "static; CHANGED from 10.0.0.1 to eliminate stale INVENTORY conflict. No default gateway, DNS 8.8.4.4.", verified_at: "041626 22:02", probe: "New-NetIPAddress + ipconfig (self)" },
    { rox: "ODT",  face: "ASUS wifi (VZW)",                    ip: "192.168.195.149", detail: "gateway 192.168.195.64",                                                         verified_at: "041626 19:11", probe: "ipconfig (self)" },
    { rox: "ODT",  face: "WIFI 2 Intel AC 9560 160MHz",        ip: "(disabled)",      detail: "MAC 0A-F5-30-87-61-57 — available for Piralus SSID attach",                     verified_at: "041626 21:48", probe: "Get-NetAdapter" },
    { rox: "ODT",  face: "Tailscale",                          ip: "100.111.17.67",   detail: "peer 001-win10pro",                                                              verified_at: "041626 21:28", probe: "tailscale status" },
    { rox: "STN2", face: "Ethernet (Fleet, 8PSW p5)",          ip: "10.0.0.2",        detail: "MAC 18-db-f2-12-62-9e · UP",                                                     verified_at: "041626 22:03", probe: "ping + arp from ODT 10.0.0.10" },
    { rox: "GOG1", face: "NIC copper (Fleet, 5PSW p2)",        ip: "10.0.0.3",        detail: "MAC 98-90-96-dc-76-0e · ARP ok · ICMP and SSH:22 silent (firewall drop)",         verified_at: "041626 22:03", probe: "Test-NetConnection from ODT 10.0.0.10" },
    { rox: "GOG1", face: "USB copper (Fleet)",                 ip: "10.0.0.54",       detail: "SAME MAC as .3 — IP alias on same interface; ARP ok, ICMP silent",                verified_at: "041626 21:28", probe: "arp from ODT" },
    { rox: "CUBE", face: "Ethernet (Fleet, 8PSW p8)",          ip: "10.0.0.4",        detail: "MAC e0-3f-49-1b-03-29 · UP",                                                     verified_at: "041626 22:03", probe: "ping + arp from ODT 10.0.0.10" },
    { rox: "DPSL", face: "Ethernet (Fleet, 5PSW p4)",          ip: "10.0.0.102",      detail: "MAC 98-5a-eb-d2-91-0a · UP",                                                     verified_at: "041626 22:03", probe: "ping + arp from ODT 10.0.0.10" },
    { rox: "STN1", face: "K16A Hub ethernet (Fleet)",          ip: "10.0.0.69",       detail: "static, DNS 8.8.8.8/1.1.1.1",                                                    verified_at: "041526 15:06", probe: "Dan direct" },
    { rox: "TRP0", face: "USB ethernet (Fleet, 5PSW p3)",      ip: "10.0.0.11",       detail: "last seen 041526; not probed tonight",                                           verified_at: "041526",       probe: "INVENTORY claim — needs re-probe" },
    { rox: "DPSR", face: "Fleet (5PSW p5)",                    ip: "(unassigned)",    detail: "Reserved 10.0.0.8 per BIG_ASS_BOARD 032626. On Guest wifi only; Fleet ethernet pending", verified_at: "041626 21:32", probe: "Dan direct" },
    { rox: "Piralus", face: "Fleet LAN management (planned)",  ip: "10.0.0.1/24",     detail: "ASSIGNED 041626 23:10 per Dan direction. Piralus bridges the two hemispheres of Nest Actual (5PSW unix side, 8PSW windows side) — a bridge at .1 is the design anchor. This pattern echoes deliberately across Nest, Waywood, Olympic, neurology, biology, storytelling, physics, music (per Dan). Currently NOT responding to ARP from ODT — requires enabling R7900 management interface on LAN side. Next step: join Piralus SSID from ACHE or ODT Wi-Fi 2 and enable LAN management IP.", verified_at: "041626 23:10", probe: "Assignment by design (Dan). Not yet active at L3." },
  ],

  open_faces: [
    { rox: "ODT + Piralus", face: "Wi-Fi 2 attach to Piralus SSID", issue: "ODT has Intel AC 9560 disabled but available. Joining Piralus SSID gives direct route to R7900 admin UI (likely 192.168.1.1) without disturbing primary wifi.", action: "Enable Wi-Fi 2, scan for Piralus SSID, join, open admin UI via Chrome.", verified_at: "041626 21:48", status: "next action" },
    { rox: "GOG1", face: "ICMP + SSH silence on 10.0.0.3 / 10.0.0.54", issue: "Same-MAC alias; both silent from ODT 10.0.0.1 AND new 10.0.0.10. Firewall-level drop at GOG1. Tailscale not configured.", action: "From GOG1 console: sudo ufw status verbose; ss -tlnp | grep 22; allow 10.0.0.0/24.", verified_at: "041626 22:03", status: "blocked on GOG1 console" },
    { rox: "DPSR", face: "Fleet LAN IP", issue: "Commissioning 041626 — on Guest wifi + ProtonVPN only; Claude Desktop installing. Reserved 10.0.0.8 per BIG_ASS_BOARD.", action: "Assign static IP on copper once commissioning settles.", verified_at: "041626 21:32", status: "commissioning" },
    { rox: "INVENTORY.md topology", face: "Piralus = 10.0.0.1 claim", issue: "Claim not backed by any active probe. ODT now holds 10.0.0.10; 10.0.0.1 slot is free. Stale INVENTORY text needs correction.", action: "Edit FLEET/INVENTORY.md to remove Piralus=10.0.0.1 claim and document Piralus as non-IP L2 bridge.", verified_at: "041626 22:02", status: "next Bridge commit" },
  ],
};
