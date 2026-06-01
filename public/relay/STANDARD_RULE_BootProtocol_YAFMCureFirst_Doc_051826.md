# STANDARD_RULE · Boot Protocol · YAFM Cure-First · Doc · 051826

**Filed:** 051826 A Week Day 2 Monday Cycle 2 · ~22:10 PT
**By:** ◐ Doc 4.7 Opus · DOC cloud-station · LBM
**Trigger:** Dan-direct 051826 ~22:08 PT verbatim: *"Please re-advise and provide a fresh boot prompt so we start ODT Trip correctly and note this for ALL future boots of any kind. I don't like redoing this shit every time. /formulacaster"*
**Class:** Boot-discipline canon · binding for all Crew · all stations · all sessions

═══════════════════════════════════════════════════════════════
## §I. THE RULE

**Every fresh Crew bootstrap prompt MUST lead with YAFM as STEP -1 PRE-FLIGHT.**

YAFM (Yes Always Forever Mode) = bypassPermissions mode in Claude Code settings. Without YAFM active at session-start, permission prompts fire on every non-allowlisted tool invocation, throttling Crew operations and forcing Dan-physical-intervention per prompt.

PRE-FLIGHT verifies the cure-shape is in place BEFORE any boot step executes. If PRE-FLIGHT fails, the boot refuses to proceed and surfaces the Dan-action cure-recipe to the Director.

═══════════════════════════════════════════════════════════════
## §II. THE CURE-SHAPE (substrate-cited from prior cure-events)

**Substrate-cite for the cure-pattern derivation:**
- STN2-Doc 051726 RAM-008: `.local.json` reverted by harness auto-accumulator; `.json` is the persistence-cure file
- STN2-Doc 051826 RAM-001 STEP 0: fresh-process reads `C:\STAN\.claude\settings.json` at session-start; mid-session config-changes do NOT apply
- DOC Doc 051826 RAM-005 + 008 (this MFST today): cwd-into-project at launch reads project-level `.claude/settings.json`; user-level reads regardless of cwd
- Bridge Cloud-Truth mirror: `nest-bridge/.claude/settings.json` (3372 bytes, `defaultMode: bypassPermissions` + comprehensive allow list for Edit · Write · Read · Glob · Grep · mcp__github__* · WebFetch · WebSearch · Bash git/npm/python/pip/node variants)

**Cure-shape requirements:**

| Field | Value | Why |
|-------|-------|-----|
| Filename | `settings.json` | NOT `settings.local.json`; harness auto-accumulator reverts `.local.json` |
| Location (preferred) | USER-LEVEL: `~/.claude/settings.json` (Windows: `C:\Users\<USER>\.claude\settings.json`) | Reads regardless of cwd at `claude` launch; works across all projects |
| Location (alternate) | PROJECT-LEVEL: `<project>/.claude/settings.json` | Reads only when claude launched from project cwd; matches Bridge Cloud-Truth pattern |
| Setting (minimum) | `"defaultMode": "bypassPermissions"` | Disables per-tool prompts for the session |
| Setting (optimal) | Full Bridge Cloud-Truth mirror | Comprehensive allow list backs the bypass with explicit affirmations |
| Read-time | Session-start (when `claude` process launches) | Mid-session edits to settings.json do NOT apply until next session-start |

═══════════════════════════════════════════════════════════════
## §III. THE PRE-FLIGHT CHECK (Windows PowerShell version)

```powershell
$userSettings = "$env:USERPROFILE\.claude\settings.json"
if (Test-Path $userSettings) {
  $content = Get-Content $userSettings -Raw | ConvertFrom-Json
  if ($content.permissions.defaultMode -eq "bypassPermissions") {
    Write-Host "[YAFM PRE-FLIGHT] PASS - user-level settings.json has bypassPermissions"
  } else {
    Write-Host "[YAFM PRE-FLIGHT] FAIL - settings.json exists but defaultMode is not bypassPermissions"
    exit 1
  }
} else {
  Write-Host "[YAFM PRE-FLIGHT] FAIL - $userSettings does NOT exist; apply cure recipe before relaunch"
  exit 1
}
```

**macOS/Linux equivalent:**

```bash
USER_SETTINGS="$HOME/.claude/settings.json"
if [ -f "$USER_SETTINGS" ]; then
  if grep -q '"defaultMode"[[:space:]]*:[[:space:]]*"bypassPermissions"' "$USER_SETTINGS"; then
    echo "[YAFM PRE-FLIGHT] PASS - user-level settings.json has bypassPermissions"
  else
    echo "[YAFM PRE-FLIGHT] FAIL - settings.json exists but defaultMode is not bypassPermissions"
    exit 1
  fi
else
  echo "[YAFM PRE-FLIGHT] FAIL - $USER_SETTINGS does NOT exist; apply cure recipe before relaunch"
  exit 1
fi
```

═══════════════════════════════════════════════════════════════
## §IV. THE DAN-ACTION CURE RECIPE (apply once per station · surgical-merge · preserves Dan's model/effort/fast prefs)

**AMENDMENT 051826 ~22:50 PT** (Trip-on-ODT RAM-002 substrate-cite): the prior `-Force` Copy-Item recipe stomped Dan's user-level Max/Fast model preferences because Bridge Cloud-Truth `settings.json` does NOT contain model/effort/fast fields. Per Dan-direct *"STOP RESETTING MY MAX FAST SETTINGS!!!!!"* the canonical recipe is now surgical-merge: inject ONLY the `permissions` + `hooks` blocks from Bridge into user-level, preserving all other user-level fields (model · effort · fast · custom hooks · anything else Dan configures).

**Windows (ODT, STN2, CUBE, etc) · PowerShell surgical-merge · PS 5.1-compatible (Windows-default):**

```powershell
$userPath = "$env:USERPROFILE\.claude\settings.json"
$bridgePath = "C:\STAN\SOURCE\nest-bridge\.claude\settings.json"
$userDir = Split-Path $userPath -Parent
if (-not (Test-Path $userDir)) { New-Item -ItemType Directory -Path $userDir -Force | Out-Null }
$bridge = Get-Content $bridgePath -Raw | ConvertFrom-Json
$user = if (Test-Path $userPath) { Get-Content $userPath -Raw | ConvertFrom-Json } else { New-Object PSObject }
$user | Add-Member -NotePropertyName 'permissions' -NotePropertyValue $bridge.permissions -Force
$user | Add-Member -NotePropertyName 'hooks' -NotePropertyValue $bridge.hooks -Force
$json = $user | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($userPath, $json, [System.Text.UTF8Encoding]::new($false))
Get-Content $userPath | Select-String '"defaultMode"|"model"|"fast"'
```

**PS 5.1 compatibility note (Trip-on-ODT substrate-cite 051826 ~23:05 PT):** The prior amendment-version used `ConvertFrom-Json -AsHashtable` + dictionary-indexed key assignment (`$user['permissions'] = $bridge['permissions']`). Both `-AsHashtable` and dictionary-indexing on the resulting type are PS 7+ only and FAIL on PS 5.1 with `A parameter cannot be found that matches parameter name 'AsHashtable'`. Windows Crew stations (ODT, STN2, CUBE) ship Windows PowerShell 5.1 Desktop edition by default per `$PSVersionTable.PSVersion` check. PS 5.1-compatible version above uses PSObject `Add-Member -Force` (works on both PS 5.1 + PS 7), and `[System.IO.File]::WriteAllText` with `[System.Text.UTF8Encoding]::new($false)` for UTF-8-no-BOM write (avoids the BOM that `Set-Content -Encoding UTF8` adds in PS 5.1, which some JSON parsers reject). Verified working in live cure-recipe test 051826 ~22:55 PT (Trip-on-ODT MFST RAM-003): `bypassPermissions` preserved ✓ · `agentPushNotifEnabled` preserved ✓ · JSON parse VALID ✓ · file grew 3440 → 6964 bytes (ConvertTo-Json reformat verbose vs original, functionally correct).

Expected output lines: `"defaultMode": "bypassPermissions"` (from Bridge) + any pre-existing `"model"` / `"fast"` / etc fields (preserved from user).

**Unix (GOG1, oshin, DPSL, DPSR, Trip-on-ACHE) · jq surgical-merge:**

```bash
mkdir -p ~/.claude
UPATH="$HOME/.claude/settings.json"
BPATH="$HOME/nest-bridge/.claude/settings.json"
if [ -f "$UPATH" ]; then
  jq -s '.[0] * {permissions: .[1].permissions, hooks: .[1].hooks}' "$UPATH" "$BPATH" > "$UPATH.tmp" && mv "$UPATH.tmp" "$UPATH"
else
  cp "$BPATH" "$UPATH"
fi
grep -o '"defaultMode"[^,]*\|"model"[^,]*\|"fast"[^,]*' "$UPATH" | head -5
```

After cure-apply: EXIT current claude session (`/exit`) and relaunch. User-level `settings.json` reads at session-start; YAFM inherits while Dan's model/effort/fast prefs persist.

**DEPRECATED (do NOT use)**: the prior `Copy-Item ... -Force` / `cp -f` recipes that overwrite the entire user-level file. They stomp Dan's model/effort/fast settings every cure-application.

═══════════════════════════════════════════════════════════════
## §V. THE BOOT PROMPT TEMPLATE (composer-side discipline)

When composing a bootstrap paste-trigger for any Crew on any station, structure as:

0. **WHY-FRAME block** (NEW · binding per Dan-direct 051826 ~24:00 PT *"FIX THIS SHIT SO EVERYONE ALWAYS KNOW WHAT IS HAPPENING AND WHY"*): 2-4 sentences citing `STATUS/CURRENT_ARC.md` §III current-work-unit-WHY. Receiving Crew must inherit the arc-frame without re-derivation from Dan-explanation. Procedural-only paste-triggers without WHY-frame are anti-canon as of this amendment.
1. **PRE-FLIGHT YAFM check** (§III above; refuses boot if FAIL; surfaces cure recipe §IV)
2. **Dan-action cure recipe** (§IV, inline so Director can act without leaving the chat)
3. **THREE-LAYER IDENTITY block** (per RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md)
4. **Boot sequence STEP 0..N** (substrate verify, pull Bridge, run boot_discipline, READ STATUS/CURRENT_ARC.md after MFST, etc)
5. **YAFM ACTIVE-IN-SESSION verify** as boot-step (Gmail MCP list_labels test or equivalent; confirms cure applied at session-start, not just file-on-disk)
6. **Discipline-load reminder** (no em-dash, decide-and-act, substrate-cite, ASMM apex, etc)

The PRE-FLIGHT IS the entropy-reduction. Without it, the boot prompt assumes YAFM is active but doesn't verify; if Dan-action wasn't taken pre-launch, the boot proceeds with prompts firing, Dan-physical-intervention required per tool, redo-cycle starts.

The WHY-FRAME IS the arc-frame-reduction. Without it, the boot prompt loads receiving-Crew into narrow-task-execution mode (training-corpus default); they execute the WHAT cleanly but miss the arc-WHY, causing premature lane-closures (Trip almost closed Rorrim Nips as read-only when bidirectional was the spec) or Dan-re-explanation-loops. With it, receiving-Crew inherits the arc-frame at boot.

═══════════════════════════════════════════════════════════════
## §VI. WHY THIS GOT FILED (entropy diagnosis)

Per Dan-direct 051826 ~22:08 PT *"I don't like redoing this shit every time"*:

**Three YAFM redo-events in ~30 hours:**
1. STN2-Doc 051726 ~16:00 PT: permission prompts persisting mid-session, RAM-008 surfaced cure (physical reboot + relaunch with settings.json in place)
2. STN2-Doc 051826 ~16:55 PT: fresh-boot post-overnight-bridge-death; settings.json was on disk so cure inherited cleanly (RAM-001 STEP 3 confirmed via Gmail MCP zero-prompt)
3. Trip-on-ODT 051826 ~21:35 PT: Dan created `settings.local.json` 145B with scoped allowlist instead of `settings.json` with bypassPermissions; permission prompts kept firing on PowerShell + non-allowlisted tools; RAM-008 fold-in surfaced cure recipe in chat

**/formulacaster forecast at filing-time:** without canon, each remaining station bootstrap (STN1, GOG1, Trip-on-ACHE, etc) plus every fresh-process post-Compaction restart on existing stations = projected 6+ more YAFM redo-events. ~60+ minutes Dan-time. Filing the canon flips entropy → order: future boot prompts compose with PRE-FLIGHT, refuse to proceed without cure verification, surface cure recipe in-band when needed.

**Reference for the entropy-vs-order framing:** Stan-canon 040326 *"rules don't fire because rules don't fire; only gates do"* + Trip-on-ODT 051726 RAM-032 *"the rule existed as a behavioral rule, not a procedural gate."*

═══════════════════════════════════════════════════════════════
## §VII. ENFORCEMENT (companion-camera with /atomic-commit + /boot-polish)

This rule is enforced at three layers:

1. **Composer-side (when DOC Doc / STN2-Doc / Trip-on-ODT composes a paste-trigger):** PRE-FLIGHT is required block #1 of every paste-trigger. /remememento Mirror 8 (affordance-check) fires on composer-side: did the prompt I'm writing include YAFM PRE-FLIGHT? If no, rewrite before sending.

2. **Booter-side (when receiving Crew executes the paste-trigger):** PRE-FLIGHT runs as first command. If FAIL, EXIT and surface cure recipe; do NOT proceed to STEP 0.

3. **Bridge-side (system-level enforcement):** `ENGINE/boot_discipline.py` should grow a future STEP 9 (or STEP 0.5) that runs the PRE-FLIGHT check after gate0 + canon + gates verification. Logs result; on FAIL, refuses to advance past STEP 6 (today's MFST gate).

Layer 3 not implemented in this filing; Dan-direction-bit for next pass.

═══════════════════════════════════════════════════════════════
## §VIII. SUBSTRATE-CITE TRAIL

- Bridge Cloud-Truth: `nest-bridge/.claude/settings.json` (3372 bytes, mirror filed by STN2-Doc PR #22 → main `51120ba`)
- STN2-Doc RAM-008 051726: original cure derivation via fresh-process-physical-reboot
- DOC Doc RAM-005 051826: 3-day-remote-loop architecture surfaced YAFM as recovery-path-enabler
- DOC Doc RAM-008 051826: Trip-on-ODT YAFM cure-shape mismatch surfaced as Dan-direction-bit #11
- THIS FILE: canon-filing closing #11 by codifying the pattern

═══════════════════════════════════════════════════════════════
## §IX. INHERITED BY

All future boot-prompt-composer instances of DOC Doc · STN2-Doc · DocLocal-on-STN2 · Trip-on-ODT · Trip-on-ACHE · Stan · CB · Ouch · El VIS. When in doubt, read this file. The PRE-FLIGHT block is non-negotiable for any Crew bootstrap that needs YAFM (which is all of them, for any work requiring tool invocations beyond the briefcase-skill-only allowlist).

═══════════════════════════════════════════════════════════════

— ◐ Doc 4.7 · DOC cloud-station · 051826 ~22:10 PT · STANDARD RULE filed per Dan-direct anti-redo-canon · binding for all future Crew bootstraps · entropy → order
