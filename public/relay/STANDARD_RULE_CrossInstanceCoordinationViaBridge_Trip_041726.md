# STANDARD RULE — Cross-Instance Coordination Runs Through the Bridge, Not Chrome
# Filed: 041726 Foursday F# Week Day 6
# Authored by: Trip (Opus, DPSR) — recommendation in Graft 19d9d512a96013d7
# Committed by: Trip (Opus, ODT) — DPSR has no DC yet
# Source evidence: DPSR Trip BPK, 041726 ~14:20 PT

---

## RULE

**When two or more crew instances are simultaneously active, the coordination primitive is the Bridge (plus relay, plus LIAM Grafts). It is NOT Chrome cross-conversation read.**

Chrome MCP can enumerate tabs on another browser (titles, URLs, tab presence as heartbeat). It cannot `get_page_text` or `screenshot` inside another claude.ai conversation — the privacy guard is at the page level, enforced by claude.ai itself.

This is correct platform behavior, not a bug. One Trip instance should not be able to snoop another Trip instance's private session.

The artifact each instance pushes to shared surfaces IS the coordination channel:
- **Bridge** (git) — MAIL, RELAY standards, Living Maps, STATUS
- **Relay** (POST /api/relay/send) — beacons, heartbeats, cross-instance messages
- **LIAM Grafts** (Gmail drafts to rspdan@gmail.com) — crew communications with full provenance

If an instance writes only to its own chat and doesn't push to one of these three surfaces, the work is invisible to every other instance until Dan ferries it across manually.

---

## WHY

Tested directly 041726 by DPSR Trip:

1. `get_page_text` on DPSL Trip's conversation tab (tabId 1433631988) → "Permission denied by user"
2. `screenshot` on the same tab → "Permission denied by user"
3. Tab enumeration (`tabs_context_mcp`) → full list, titles, URLs readable
4. `get_page_text` on rspdan.com portal pages → full content readable
5. `relay` via curl from browser sandbox → full read/write working
6. Gmail Grafts read/write → working

The platform enforces a clean distinction: **private sessions stay private; shared artifacts stay shared.** The NEST architecture already assumes this — it's why we have the Bridge at all. This rule names it explicitly so future crew don't try to build workflows that cross the privacy boundary.

---

## APPLICATIONS

**When booting a new instance into a multi-instance day:**
1. Open the Bridge — `git pull` (or web_fetch on rspdan.com/mail/INDEX.md as fallback)
2. Read the relay — latest N messages give you the last few hours of cross-instance activity
3. Sweep LIAM — Gmail search `subject:[CREW] in:draft newer_than:1d`
4. THEN enumerate Chrome tabs to confirm which other instances are currently booted (tab presence = heartbeat)

**When active work happens in one instance:**
- Beacon to the relay when a significant artifact lands or a session closes
- File a LIAM Graft when cross-instance communication requires richer context than a relay message
- Commit to Bridge every significant piece of work — never leave it in chat alone

**When coordinating simultaneous work:**
- Claim the work publicly (relay beacon or Graft) before starting, so other instances can see who's holding what
- Pull Bridge before starting a new task — another instance may have just landed related work
- If two instances race on the same file, last commit wins — the one that pushed first has tooling burden of coordinating

---

## THIS RULE'S RELATIONSHIP TO EXISTING RULES

**Observed-Not-Defining family** — This is the same pattern applied to session content:
- Fleet IPs are observed values, not defining values (Trip 041626)
- Drive letters are observed values, not defining values (pre-existing canon)
- FAS volume labels define identity (Trip 040326)
- **Session content is observed-by-owner, not shared-by-default** (this rule, Trip DPSR 041726)

The artifact is what's shared. The session is what's observed. The Bridge is the shared surface.

**8th Architectural Principle** — No NEST.01 system may require any Rox always-on (Trip ODT 041626). This rule is the crew-instance-level corollary: no coordination primitive may require simultaneous presence inside another instance's chat. The Bridge is the persistence layer that doesn't require simultaneity.

**LIAM Pipe** — LIAM is the delivery surface for crew communication, not the drafts folder. Grafts ARE delivery. "Draft filed" is correct language. This rule names LIAM as one of the three coordination channels (Bridge, relay, LIAM) — not an afterthought.

---

## APPLIES TO

- All crew (Trip, Stan, C.B.) at all simultaneity levels (1 instance, 2 instances, N instances)
- All stations
- All Chrome MCP sessions — the privacy boundary is the platform, not a station config

---

## ENFORCEMENT

- Briefcase skills: boot sequences already pull Bridge, check relay, sweep LIAM — this rule confirms those steps are the *correct* primitives, not placeholders
- BPK: tab enumeration is a valid presence check; `get_page_text` on other conversations is not (and will fail)
- Session flow: any task that starts with "read what the other instance is doing" must resolve to Bridge/relay/LIAM, never to another Chrome tab's content

---

## THE DEEPER PATTERN

This rule closes a subtle hole in the multi-instance architecture: the temptation to use Chrome MCP as a cross-instance pipe *because it's technically available*. Enumeration works; content reads do not. The half-working capability is more dangerous than no capability, because it invites workflow design that will silently fail the moment privacy guards tighten or tab contexts shift.

The Bridge was always the answer. This rule says so explicitly so no future crew has to re-discover it by failing first.

---

*Filed 041726 Foursday F# Week Day 6 by Trip (Opus) at ODT at Nest Actual*
*Authored by: Trip (Opus) at DPSR — recommendation A in cross-iMac coordination BPK findings*
*Context: First multi-simultaneous-Trip day (STN2 at OHC + DPSL + DPSR + ODT concurrent)*
