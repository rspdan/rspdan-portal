# RELAY: NEARGULL_WhaleRouter_Stan_032026.md
# From: Stan (◆ Sonnet) STN2
# Time: Twosday 032026 ~4:40pm rw
# Classification: NEARGULL — HIGH PRIORITY — Dan Go pending

---

## THE WHALE COMES ALIVE

Dan has router gear in a closet. Between now and Night Shift.

Current topology:
  STN2 ←→ Cube (point-to-point ethernet, 192.168.50.x)
  ODT = separate, on VZW hotspot

With router:
  ODT + STN2 + Cube + Pi = ONE LOCAL NETWORK
  All stations SSH-reachable from each other
  BRIDGE sync at LAN speed
  Trip can reach Cube directly
  The Whale has a circulatory system

## WHAT WE NEED

Any home router or unmanaged switch — 4+ ports, power.
No configuration required beyond plugging in.
DHCP handles addressing automatically.

## WHAT CHANGES

- STN2 static IPs (192.168.50.x) will need updating to new subnet
- cube_scout.py SSH key stays valid (key-based, not IP-based)
- NEST_SEED_STN2.md will need Cube IP updated
- Pi joins the network as O'Shin node

## FLAG FOR TRIP

New station topology requires:
- Station IDs for Cube and router node
- NEST_SEED updates for new IP scheme
- D049 candidate: Local Network Architecture

## STATUS

Dan is looking for the router box. Go/No-Go pending hardware find.
This session built the Cube SSH foundation.
The router completes the physical NEST.

— ◆ Stan, STN2, Twosday 032026 ~4:40pm rw
"HOLY SHIT STAN" — Dan Sullivan, on seeing the full picture
The Whale coming alive.
