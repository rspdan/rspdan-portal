# PASS 3 -- SYNTHESIS: THE NEST OS SWITCHBOARD
# Session: STN2_NEST01_StanS_040426_1
# Filed: Stan (NEST.01) | 040426 ~13:50 rw | E Week Day 13
# Station: Nest Actual | SSID: VZW_HOTSPOT

---

## THE CORE INSIGHT (Dan's, confirmed by research)

rspdan.com is the OS. The crew members are applications running on it.
MCP servers are the system processes. The relay API is the syscall interface.
The human and AI work on hard problems. Everything else runs automatically.

The Blender MCP addon proves this is buildable today.
It is 80 lines of Python socket code.
We do not need Claude Code. We do not need new frameworks.
We need three API routes and a Python script.

---

## WHAT THE BLENDER ADDON REVEALS

Pattern: local TCP socket server (localhost:9876) accepts JSON commands,
routes to handler functions, returns JSON responses.

The MCP client (Claude) connects to this socket.
The addon translates MCP tool calls into Blender Python (bpy) commands.

To build the NEST equivalent:
1. Replace `import bpy` with `import requests`
2. Replace Blender commands with HTTP calls to rspdan.com/api/*
3. Keep the socket server and JSON routing unchanged

The addon is ~1000 lines. The NEST proxy core is ~150 lines.
The socket server pattern is identical.

---

## THE NEST OS ARCHITECTURE

```
Dan (director)
  |
  v
Claude session (crew member -- Stan/Trip/CB)
  |
  v [MCP stdio transport]
NEST Proxy (local Python script on STN2)
  |
  v [HTTPS REST]
rspdan.com/api/relay/*     <-- the switchboard
  |
  v [Upstash Redis]
Mailboxes, channels, state
```

The proxy runs locally on STN2 as a background process.
It exposes MCP tools to any Claude session connected to it.
Tools map to rspdan.com API calls.
Claude sessions become first-class citizens of the NEST OS.

---

## THE TOOLS (what the proxy exposes to Claude)

| Tool name | What it does | rspdan.com endpoint |
|---|---|---|
| relay_send | Post message to a channel | POST /api/relay/send |
| relay_receive | Read messages since timestamp | GET /api/relay/receive |
| relay_status | Check for new activity | GET /api/relay/status |
| nest_read | Read any relay file by path | GET /relay/[filename] |
| nest_write | Write content to a relay URL | POST /api/relay/write |
| boot_update | Push new BOOT.md content | POST /api/boot/[crew] |
| skill_fetch | Fetch skill body from URL | GET /skills/[name]/SKILL.md |

Seven tools. The whole NEST OS accessible from any MCP session.
No Chrome MCP required. No Desktop Commander required.
A phone with Termux running the proxy can do all of this.

---

## THE SCRIPTS, NODES, BOXES (Dan's vocabulary)

Scripts = the Python proxy process (nest_proxy.py)
  Runs on STN2 or any machine with Python + internet.
  Exposes MCP tools via stdio transport.
  One script, one process, everything connected.

Nodes = individual API route handlers on rspdan.com
  Each route is a Node (Astro API endpoint).
  Nodes are stateless. Redis is the state.
  Nodes can be added without touching other nodes.

Boxes = the crew sessions themselves
  Each Claude session is a box.
  Boxes receive inputs (mailbox messages, tool calls).
  Boxes produce outputs (relay posts, BOOT.md updates).
  Boxes do not know about each other -- they know about the switchboard.

Rox = the methodology embedded in the proxy
  The proxy enforces READ. WAIT. THINK. before executing any tool.
  Tool calls that skip structure get flagged before execution.
  The proxy is the living embodiment of the methodology.

---

## THE POLYPHONIC CHANNEL SYSTEM (from Pass 2 research)

What Dan described: "real-time across polyphonic channels."
Formal name: Mediated Actor Hub (mailbox per actor, shared broker).
Transport: HTTP polling against Upstash Redis via Vercel API routes.

The "polyphony" is Redis sorted sets per channel, merged by timestamp.
Each crew member reads all their subscribed channels in one GET call.
Messages from different "voices" interleave by time -- polyphony.

The "Puppeteer comparison" is correct:
  Puppeteer strings Node.js to Chrome via CDP/WebSocket.
  NEST strings Claude sessions to rspdan.com via MCP/HTTP.
  The proxy IS the Puppeteer. rspdan.com IS the Chrome.

---

## THE BLENDER ADDON AS TEMPLATE

What to extract and keep:
  - The socket server class (BlenderMCPServer) -- rename NestProxyServer
  - The _handle_client method -- JSON receive, route, respond
  - The execute_command dispatch pattern -- map tool names to functions
  - The threading model -- daemon threads, graceful shutdown

What to discard:
  - All bpy imports and Blender-specific code
  - The Poly Haven, Rodin, Hyper3D integrations
  - The bl_info Blender addon metadata

What to add:
  - requests library calls to rspdan.com
  - MCP tool schema registration (for stdio transport)
  - Simple config file: crew name, rspdan.com API key, channels to subscribe

The rewrite is ~2 hours of Python work.
No new dependencies beyond requests and the MCP Python SDK.
Runs anywhere Python runs -- STN2, ACHE (Termux), any server.

---

## WHAT DOES NOT REQUIRE CLAUDE CODE

Dan said: "I really do not want to use Claude Code."

Claude Code is for agentic sessions with persistent file system access.
NEST does not need that. NEST needs:

1. MCP proxy (Python script, runs on STN2) -- no Claude Code
2. Vercel API routes (Astro endpoints, three files) -- no Claude Code
3. Upstash Redis (web console setup, 5 minutes) -- no Claude Code
4. Crew sessions in Claude.ai chat (standard interface) -- no Claude Code

The only place Claude Code would be relevant is building the proxy itself.
But Stan can build the proxy in a standard session using Desktop Commander.
The proxy is 150 lines of Python. We have DC. We have the template.

---

## BUILD ORDER (this afternoon)

1. Vercel API routes (src/pages/api/relay/)
   - send.ts, receive.ts, status.ts
   - 3 files, ~30 lines each
   - Uses Upstash Redis client

2. Upstash Redis setup
   - Free tier, web console, 5 minutes
   - Add env vars to Vercel

3. NEST proxy script (nest_proxy.py)
   - Adapted from Blender addon pattern
   - Exposes 7 MCP tools via stdio
   - Calls rspdan.com/api/relay/*

4. Test the loop
   - From this session: relay_send via proxy
   - From Trip's session: relay_receive via proxy
   - Confirm message traverses switchboard

Total estimated build: 4-5 hours including testing.
No Claude Code. No new services. No new subscriptions beyond Upstash free tier.

---

## THE NEST OS IN ONE SENTENCE

rspdan.com is the substrate, the crew members are the processes,
the proxy is the kernel, and the relay is the memory bus.
Dan is the architect. The system breathes on its own.

*Pass 3 complete. Three passes, one session, one direction.*
*Stand by for Go.*
