# STANDARD RULE — Relay via script, not MCP server

**Filed:** Trip, ODT, 041526 (F# Week Day 4), 22:55 Pacific
**Status:** ACTIVE — nest-proxy retired from Claude Desktop config; files preserved for archive
**Supersedes:** implicit "nest-proxy is the relay interface"
**Enforcement:** `ENGINE/relay.ps1` (Windows), `ENGINE/relay.sh` (macOS/Linux)

## The rule

Crew calls the NEST relay through plain HTTP scripts invoked via Desktop Commander. No MCP wrapper. No local Python runtime requirement. No Claude Desktop restart cycle when the relay code changes.

Six actions (identical surface to the retired nest-proxy tools):

```
.\ENGINE\relay.ps1 send    -Content "message" [-To bridge] [-As trip]
.\ENGINE\relay.ps1 receive [-Since 0] [-Channels "bridge,trip"]
.\ENGINE\relay.ps1 status  [-Since 0] [-Ch all]
.\ENGINE\relay.ps1 read    -Path INDEX.md
.\ENGINE\relay.ps1 skill   -Name ican
.\ENGINE\relay.ps1 search  -Query "..." [-Mode hybrid] [-Limit 10]
```

Bash equivalent at `ENGINE/relay.sh` with `--kebab-case` args.

## Why

On 041526, nest-proxy silently failed to load on ODT after a routine Claude Desktop restart. Three stacked issues:

1. Claude Desktop launched `python nest_proxy.py` with Python 3.10 (first in PATH), not the Python 3.14 where dependencies were installed
2. The config file `nest_proxy_config.json` had a UTF-8 BOM written by `Out-File` / PowerShell redirection, and Python 3.10's `json.load()` without `utf-8-sig` encoding choked on it
3. Silent failure — the MCP server appeared loaded in the connector list but had no tools exposed. Crew assumed it was healthy.

Dan's question after the fix: *"is this just gonna keep happening every time something changes?"*

Answer: yes, while nest-proxy is an MCP server. The fragility budget includes:
- Local Python install required on every station
- Config file with encoding traps
- PATH resolution (Python 3.10 vs 3.14)
- Claude Desktop restart needed to pick up any code change
- Per-station install procedure
- Silent failure — no error surfaced unless you dig through `%APPDATA%\Claude\logs\`

What nest-proxy actually did: wrapped 3 HTTP endpoints (`rspdan.com/api/relay/{send,receive,status}`) plus 3 more (`read`, `skill`, `search`) as MCP tools. That's a protocol adapter on top of a REST API that already speaks HTTP.

The simpler answer: the relay is already an HTTP API. Any tool that makes HTTP calls can use it. Desktop Commander runs scripts. Claude calls scripts through DC. Zero-step middleman removed.

## Architecture comparison

**Before (nest-proxy):**
```
Claude -> MCP protocol -> Python process (must be 3.14 with deps) -> HTTP -> rspdan.com
           requires: Claude Desktop registration + Python install + config file + restart cycle
```

**After (scripts):**
```
Claude -> DC tool -> PowerShell/bash script -> HTTP -> rspdan.com
           requires: nothing beyond DC and a shell (already present everywhere)
```

## Migration status

- `ENGINE/relay.ps1` — written, all 6 actions tested end-to-end on ODT 041526 (send round-trip verified, Int64 timestamp fix applied)
- `ENGINE/relay.sh` — written for TRP0/GOG1, not yet executed on those stations (syntax identical to .ps1, uses curl + python3)
- `nest-proxy` removed from ODT `claude_desktop_config.json` (backup: `.bak_041526_retire_nestproxy`)
- `C:\NEST\nest_proxy\` + `ENGINE/nest_proxy/` — files preserved; rollback is putting the entry back in config and restarting Claude Desktop
- STN2, TRP0, GOG1 — when those stations next restart Claude Desktop they will have the updated Bridge pull; the .ps1/.sh is already available; nest-proxy config entries on those stations should be removed the same way

## Rollback

If the script approach fails for some reason, nest-proxy can be reactivated by:
1. Restore `claude_desktop_config.json` from `.bak_041526_retire_nestproxy`
2. Full-quit Claude Desktop from tray, reopen
3. nest-proxy spawns again with the existing BOM-tolerant code

## Related

- `STANDARD_RULE_PortalBuildFirst_Trip_041526.md` — same day's lesson on "git push ≠ deployed"
- `STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md` — the BOM trap that triggered today's cascade
