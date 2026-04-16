# MAIL — Trip to All Crew

**Date:** 041526 (F# Week Day 4), 23:05 Pacific
**Station:** ODT (Nest Actual)
**Subject:** Today's cascades — portal build-first rule + nest-proxy retirement
**Status:** CLOSED — both rules filed, scripts deployed, nest-proxy removed from ODT config

Future crew, this is the logbook entry for 041526. Two stacked cascades taught the same lesson: **generate values by reading instruments, not by assuming success.**

## Cascade 1 — The Vercel silent-failure

Two portal commits went out today: PI v5.3 (`64d6c59`) and SEEGULLS sync (`96b00ba`). Both failed to deploy on Vercel. The production site kept serving yesterday's commit (`c9c5ccc`) for ~8 hours while I believed PI v5.3 was live. My session-close summary said so. It was wrong.

**Root cause:** Astro parses `{ ... }` as JavaScript expressions inside ANY HTML element, including `<pre><code>` blocks. The PI had a PowerShell snippet showing how to detect FAS drives:

```
Get-Volume | Where-Object { $_.FileSystemLabel -match 'FAS' }
```

Inside the `<pre><code>` block, Astro saw `{ $_.FileSystemLabel -match 'FAS' }` and tried to parse it as JS. `-match` isn't a JS operator; `'FAS'` was unexpected. The Vercel build log said:

```
Expected "}" but found "'FAS'"
Location: src/pages/nest-pi.astro:39:55
```

**Fix:** Change `<pre><code>` to `<pre is:raw><code>` at the problem line. `is:raw` tells Astro to skip expression parsing inside the element. Commit `714cdea` deployed READY 30 seconds after push. PI v5.3 is now live for real.

**The discipline that should have caught this:** `npm run build` locally before `git push`. Vercel runs the same Astro build I can run on my station. If it fails there, it fails there too. Filed as `ENGINE/portal_check.ps1` — pre-push script that detects the portal by FAS label and runs the build. If green, safe to push. If red, do not push.

Also filed as Standard Rule: `RELAY/STANDARD_RULE_PortalBuildFirst_Trip_041526.md`.

## Cascade 2 — The nest-proxy BOM

After restarting Claude Desktop earlier in the day, nest-proxy failed silently. Three stacked issues:

1. Claude Desktop launched `python nest_proxy.py` — Windows PATH picked Python 3.10 (first in PATH) instead of Python 3.14 where `requests` was installed
2. The config file `nest_proxy_config.json` had a UTF-8 BOM written by some earlier PowerShell `Out-File` operation. Python 3.10's `json.load()` without `utf-8-sig` choked on it
3. Silent failure. nest-proxy appeared loaded in the connector list but had zero tools exposed. I had to dig through `%APPDATA%\Claude\logs\` to find the crash

I fixed the immediate cascade (rewrote config without BOM via DC, added `encoding='utf-8-sig'` to `nest_proxy.py` as defense-in-depth). But Dan asked the right question afterward:

> "Is this just gonna keep happening every time something changes?"

The answer is yes, while nest-proxy is an MCP server. The fragility budget includes: local Python install per station, config file with encoding traps, Python version PATH resolution, Claude Desktop restart to pick up any code change, silent failure when any of those drift, and per-station install procedures.

**What nest-proxy actually did:** wrapped 3 HTTP endpoints (`rspdan.com/api/relay/{send,receive,status}`) plus 3 more (`read`, `skill`, `search`) as MCP tools. That's a protocol adapter on top of a REST API that already speaks HTTP. With Desktop Commander reliably present in every session, the MCP layer adds cost without adding capability.

## The migration

- `ENGINE/relay.ps1` — 123 lines PowerShell, six actions (`send`, `receive`, `status`, `read`, `skill`, `search`). All tested end-to-end against the real relay on ODT today. Round-trip confirmed: sent message `1776318432005_trip` appeared in `receive` with correct content and context.
- `ENGINE/relay.sh` — 150 lines bash for TRP0 (macOS) and GOG1 (Ubuntu). Same surface with `--kebab-case` args. Not yet executed on those stations — next crew member to boot there should `chmod +x` and run a status check to verify.
- `nest-proxy` removed from ODT `claude_desktop_config.json`. Backup saved alongside as `.bak_041526_retire_nestproxy`. Files preserved at `C:\NEST\nest_proxy\` and `ENGINE/nest_proxy/` — rollback is restore the backup and full-quit Claude Desktop.

Filed as Standard Rule: `RELAY/STANDARD_RULE_RelayViaScript_Trip_041526.md`.

## Usage for future crew

Instead of calling the old nest-proxy MCP tools, invoke the script via DC:

```
.\ENGINE\relay.ps1 send    -As trip -To bridge -Content "..."
.\ENGINE\relay.ps1 receive -Since 0
.\ENGINE\relay.ps1 status
.\ENGINE\relay.ps1 read    -Path INDEX.md
.\ENGINE\relay.ps1 skill   -Name ican
.\ENGINE\relay.ps1 search  -Query "..."
```

Bash: same six actions with `--kebab-case` args.

## Also logged today (lightweight)

- Amazon order: 5 wifi adapters + antennas arriving Thursday/Friday for cantenna build (see Trip Living Map)
- RIFT Store find: TL-WA855RE range extender — best use in NEST is AP mode for library wifi redistribution
- Naming: library wifi link is **SLO-LIB** not FAS-LIB. SLO prefix distinguishes from FAS drives, honest about the speed
- MacBook booted, PopOS via USB hub next

## Pending for next session

- STN2, TRP0, GOG1 — remove `nest-proxy` entries from their Claude Desktop configs when next on those stations
- `session_close.ps1` — add Vercel deploy verification (Layer 2 of Vercel prevention; Layer 1 is the pre-push script)
- API key in `nest_proxy_config.json` is in a public repo; separate task flagged (consider rotation + .gitignored secrets file)
- Relay.sh tested on Mac/Linux stations first time they boot

The lesson from both cascades is the same one we already named: *generating values without reading the instrument.* Git push is not deployment. Config written is not config read. MCP server registered is not MCP server healthy. Check the instrument.

— Trip, ODT, 041526
