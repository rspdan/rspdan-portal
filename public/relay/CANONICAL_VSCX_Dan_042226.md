# CANONICAL — VSCX · The Fleet's Cross-Platform VSCode Tunnel Layer
# Filed: 042226 ~21:50 PT by Trip (Opus 4.7) · ODT at Nest Actual
# Named: Dan Sullivan (DPS) · 042226 ~21:45 PT
# Classification: PERMANENT CANON — FLEET INFRASTRUCTURE PATTERN

---

## THE NAME

**VSCX** — shorthand for **V**S**C**ode-**X**-platform. The Fleet's cross-platform VSCode tunnel layer. Named by Dan 042226 ~21:45 PT during VSCode-on-Wacom establishment thread:

> "Move forward with the VSCX (our shorthand for the Fleet's cross-platform tool via VSC we're establishing)."

---

## THE PATTERN

Any Rox runs `code tunnel --name <rox>` in its local terminal. This creates a Microsoft-hosted secure tunnel from that Rox's VSCode to cloud vscode.dev, authenticated by GitHub. The tunnel URL (`https://vscode.dev/tunnel/<rox>`) is renderable from any browser on any device authorized against the same GitHub identity.

One atom. Six faces. Same pattern at every Rox.

- `code tunnel --name odt` → ODT files at vscode.dev/tunnel/odt (Windows)
- `code tunnel --name stn2` → STN2 files at vscode.dev/tunnel/stn2 (Windows)
- `code tunnel --name cube` → CUBE files at vscode.dev/tunnel/cube (Windows)
- `code tunnel --name gog1` → GOG1 files at vscode.dev/tunnel/gog1 (Linux)
- `code tunnel --name trp0` → TRP0 files at vscode.dev/tunnel/trp0 (macOS)
- `code tunnel --name dpsl` → DPSL files at vscode.dev/tunnel/dpsl (macOS)
- `code tunnel --name dpsr` → DPSR files at vscode.dev/tunnel/dpsr (macOS)

---

## THE BOX-IN-BOX LINEAGE

VSCX is the Box-in-Box principle (Dan 031726, "Put the problem box in a non-problem box so the non-problem box looks at the problem box for us") applied to VSCode workspaces.

- **Problem box** — a VSCode workspace on a specific Rox is bound to that machine and doesn't render elsewhere by default.
- **Non-problem box** — Microsoft tunnel service, accessible from any browser.
- The tunnel wraps the Rox workspace in a surface that any authorized device can render without needing filesystem access to the source Rox.

Same principle as NPS Proxy (031726): a gated source gets fronted by an ungated surface, and the ungated surface serves everyone.

---

## THE ROX RAINBOW LINEAGE

Rox Cube Is The Unit (Stan 032026, "These scale!") — every NEST unit is a Rox cube, fractally nestable. VSCX applies the Rox rainbow to remote editing:

- Each Rox publishes its own tunnel
- Each tunnel is a face of the same cube pattern
- Rotate to any Rox without changing what the tunnel IS
- The rainbow spans the fleet

Cross-station editing becomes: `code --remote tunnel+gog1 /home/dan/somefile` from ACHE = Dan editing GOG1 from phone. Same atom.

---

## THE PEA POD LINEAGE

Pea Pod canon (Dan 042026) — same voice, different instrument. VSCX at the tool-surface layer:

- Trip writes to ODT filesystem via DC → local Wacom VSCode renders (instrument 1)
- Trip drives vscode.dev Chrome tab via Chrome MCP → browser VSCode renders (instrument 2)
- Dan edits on Wacom → local save propagates (instrument 3)
- All three instruments, same surface, same file

Three hands on one piano. Pea Pod at the editing layer.

---

## THE SETUP (RUN ONCE PER ROX)

### Windows (ODT, STN2, CUBE)
```powershell
code tunnel --name <rox-lowercase>
```

### Linux (GOG1)
```bash
code tunnel --name <rox-lowercase>
```

### macOS (TRP0, DPSL, DPSR)
```bash
code tunnel --name <rox-lowercase>
```

First run prompts GitHub device auth:

1. Terminal prints: *"log into https://github.com/login/device and use code XXXX-XXXX"*
2. **Two separate instructions on one line** — NOT a single concatenated URL.
3. Navigate to exactly `https://github.com/login/device` in a browser.
4. Type the code into the input field. Authorize.
5. Terminal confirms tunnel URL: `https://vscode.dev/tunnel/<rox>`
6. Leave terminal open. Ctrl-C kills the tunnel.

---

## AUTH NOTE — THE 042226 LESSON

During initial VSCX establishment 042226 ~21:45 PT, Dan hit the common misread:

- Terminal text: *"log into https://github.com/login/device and use code 4EB8-6A60"*
- Misread as: single URL `https://github.com/login/device and use code 4EB8-6A60`
- Browser URL-encoded the spaces → 404

**Rule for future crew onboarding a Rox:** The login URL is just `https://github.com/login/device`. The code is entered on that page, not appended to the URL. When assisting, call this out explicitly so the misread doesn't happen.

Second gotcha from same session: Ctrl-C kills the tunnel process AND invalidates the pending device code. Re-running generates a fresh code; the old one is dead.

---

## WHAT VSCX UNLOCKS

### For Trip (or any crew):
- Write to ODT filesystem via DC → Dan sees render in real-time on Wacom VSCode (local watcher)
- Drive vscode.dev/tunnel/odt Chrome tab via Chrome MCP → Dan sees cursor move on same file
- Cross-Rox file ops: read GOG1 files from ODT without SSH round-trip, if GOG1 tunnel is live

### For Dan:
- Edit any Rox from any device — ACHE, STN1, DPSL — by opening the tunnel URL
- No more "I'd need to be on that station" friction
- Live manifest rendering layer: Trip appends RAMs to manifest, Dan sees every append live
- Browser VSCode on STN1 iPad becomes a real editing surface for Fleet files

### For the Manifest:
- Manifest rendering on Wacom becomes a shared canvas
- Meta Dates nested-layer principle in material form — the doc Trip is writing is visible to Dan as it's written

---

## THE RULES

1. **Tunnels are named per Rox.** Use lowercase Rox name. Collisions confuse the URL space.
2. **Tunnel runs in a terminal window.** Do not Ctrl-C unless you mean to kill it. Close-terminal also kills it.
3. **Tunnels persist across VSCode restarts** as long as the terminal is alive.
4. **Tunnels authenticated via GitHub are private to your GitHub identity.** Not exposed to the public web.
5. **Changes sync both directions** — Dan edits on Wacom, crew sees change via tunnel. Crew edits via DC or Chrome, Dan sees on Wacom.
6. **Write conflicts are possible** if Dan and crew edit the same file simultaneously. VSCode surfaces them as merge prompts. Rule: announce writes in chat when both surfaces are active.

---

## COMPATIBILITY WITH EXISTING FLEET PATTERNS

- **Does not replace SSH** — SSH remains canonical for admin work, fleet probes, Docker, package installs. VSCX is for file viewing and editing surfaces.
- **Does not replace Tailscale** — Tailscale is fleet-internal network layer. VSCX is over public internet via Microsoft tunnel service. Different layer, different purpose.
- **Does not replace DC** — DC is Trip's filesystem hands. VSCX is the shared rendering surface Dan can see.
- **Stacks with Chrome MCP** — Chrome MCP can drive vscode.dev browser surface, making VSCX bidirectionally addressable by Trip.

---

## FILED

- Bridge: RELAY/CANONICAL_VSCX_Dan_042226.md (this file)
- Named by: Dan Sullivan (DPS), 042226 ~21:45 PT
- Filed by: ◈ Trip (Opus 4.7), 042226 ~21:50 PT
- Establishment thread: 042226 evening — ODT VSCode already open on Wacom One, Dan asked for box-in-box genius brain Rox rainbow applied to VSCode; Trip found the Microsoft `code tunnel` primitive and filed the pattern
- Sister canons: ODT_TO_STN2_BoxInBox_ProxySpec_031726.md (Dan's principle), CANONICAL_RoxCubeIsTheUnit_Stan_032026.md (Rox cube fractal), CANONICAL_PeaPod (Dan 042026, same voice different instrument)

---

*"These scale!"* — Dan Sullivan 032026 (Rox Cube)
*"Put the problem box in a non-problem box so the non-problem box looks at the problem box for us."* — Dan Sullivan 031726 (Box-in-Box)
*"The Fleet's cross-platform tool via VSC we're establishing."* — Dan Sullivan 042226 (VSCX)

*◈ Trip | F Week Pass 2 Wednesday | ODT at Nest Actual | Night Shift | 042226 ~21:50 PT*
