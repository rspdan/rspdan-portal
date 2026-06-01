# RESEARCH · PS$ Problem Solved at the Mechanism Layer — Base64-EncodedCommand Pattern
# Filed by: ◈ Trip (Opus 4.7) · ODT at Nest Actual
# Filed: 042326 ~03:00 PT · F Week Pass 2 Thursday · Data Day 042226 close
# Research directed by: Dan Sullivan (DPS) · 042326 ~02:40 PT
# Governance: STATE (Windows PS-specific) extending to FEDERAL (tool-wrap pattern applies cross-platform)
# Supersedes (for one-shot agent invocation): relies-on-discipline portions of `RELAY/STANDARD_RULE_PS1Dollar_PersistentSession_Trip_041426.md`

---

## ONE SENTENCE

The PS$ stripping problem is not a PowerShell bug — it is a Windows architectural artifact where every process parses its own command line and intermediate shells eat `$` before PowerShell sees it. The production fix used by Ansible and documented by Microsoft is `powershell.exe -EncodedCommand <base64-UTF-16LE>` passed as a direct argv element via `CreateProcess`, which removes every `$` from the wire because the Base64 alphabet `[A-Za-z0-9+/=]` contains no shell metacharacters.

---

## DAN'S FRAMING (verbatim, 042326 ~02:40 PT)

> "Can you look online and see if someone has fixed the PS1$ problem? It feels so absurdly dumb and I cannot fathom how it keeps biting us."

And the working-stick principle that directed the research:

> "Our brain is a walking stick. I think you'll find anthropological evidence somewhere online about how humans extended memory by using walking sticks as first proof model of memory externalization. The stick remains, the stick burns, the stick grows."

This canon is the stick growing. Canon 041426 (persistent session) remains. Its shortcomings burned (40+ failures). The stick now carries a second fix the 041426 version did not know existed.

---

## THE FIX

```python
import base64, subprocess

ps = r'''
$env:USERPROFILE
$x = 5
Write-Host "x is $x"
Write-Host "PF86 = ${env:ProgramFiles(x86)}"
'''
encoded = base64.b64encode(ps.encode('utf-16-le')).decode('ascii')

subprocess.run(
    ['powershell.exe',
     '-NoLogo', '-NoProfile', '-NonInteractive',
     '-ExecutionPolicy', 'Bypass',
     '-EncodedCommand', encoded],
    capture_output=True, text=True, check=True,
)
```

Node.js equivalent: `child_process.execFile` or `spawn` with argv array, NOT `exec` (which wraps in cmd.exe /s /c and doubles the parsing layers). Encoding: `Buffer.from(script, 'utf16le').toString('base64')`.

Flags to include:
- `-NoLogo` — suppress startup banner
- `-NoProfile` — skip profile load, eliminate side effects
- `-NonInteractive` — prevent prompt-blocking hangs
- `-ExecutionPolicy Bypass` — avoid script-policy rejection for encoded commands

**UTF-16LE is mandatory.** In Python that is `.encode('utf-16-le')`. In .NET it is `[Text.Encoding]::Unicode` (which confusingly means UTF-16LE, not UTF-8). In Node it is `Buffer.from(s, 'utf16le')`. UTF-8 input produces silent garbage.

---

## WHY THIS WORKS — ROOT CAUSE NAMED

Windows has no kernel-enforced argv[]. `CreateProcessW`'s `lpCommandLine` is a single wide-character string. The OS hands it verbatim to the child, and **each child process parses it however it wants**. There is no `ArgvToCommandLineW` — only a `CommandLineToArgvW` decoder that targets are not required to use.

- **cmd.exe** uses `^` as escape and `%VAR%` expansion
- **MSVC CRT argv splitter** uses Raymond Chen's backslash-before-quote rules
- **powershell.exe -Command** splits argv, re-joins tokens with spaces, then feeds the result to the PowerShell LANGUAGE PARSER which interprets `$name`, backticks, braces, operators

Every subprocess launcher (Node `child_process`, Python `subprocess`, Rust `std::process::Command`, Go `os/exec`) must serialize `list[str]` into one `lpCommandLine` string. They all picked MSVCRT's convention — correct for normal C programs, WRONG for cmd.exe, powershell.exe -Command, and batch files. This mismatch is the root of the BatBadBut vulnerability class (CVE-2024-24576, CVE-2024-27980, April 2024) which forced Node.js and Rust to refuse spawning `.bat`/`.cmd` without explicit `shell: true`.

Unix sidesteps this entirely: `execve(2)` takes `char *const argv[]`, pre-split and delivered intact. `$` is just a byte until some shell expands it.

**PowerShell issue #4024** (requesting PS stop stripping `$`) was closed as **"Resolution-By-Design"**. The PS team considers it the caller's responsibility. The fix cannot come from smarter escaping.

Base64-EncodedCommand sidesteps the problem entirely: the payload on the wire is a string of letters and digits. No shell, anywhere in the pipeline, recognizes any part of it as special syntax.

---

## THE CLAUDE CODE PARALLEL — ANTHROPIC ALREADY SOLVED THIS

Anthropic's Claude Code issue #15471 documented IDENTICAL symptoms to NEST's. Commands like `powershell.exe -Command "Get-Service | Where-Object {$_.Status -eq 'Running'}"` failed because Claude Code routes through Git Bash (MSYS2), which expands `$_` and `$Status` BEFORE powershell.exe is ever launched.

Anthropic's fix was environmental: `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`, giving the agent a dedicated PowerShell tool path that bypasses Git Bash entirely.

**The NEST-side implication:** Desktop Commander's `start_process` on Windows is almost certainly routing through a shell intermediary (likely Node's `child_process.exec` which wraps in cmd.exe /s /c, or similar). The outer shell eats `$` before PowerShell ever sees the command. Base64-encoding is robust **precisely because it removes every `$` from the wire**.

---

## WHAT DOES NOT WORK (don't let future crew rediscover)

- **`--%` stop-parsing token**: only affects downstream native commands INSIDE a running PowerShell session. Zero effect on incoming `-Command` argument parsing from external callers.
- **`-Command { scriptblock }`**: only works when invoked FROM another PowerShell host. cmd.exe/bash/Node/Python see `{...}` as a literal string; PowerShell prints the braces back.
- **`$PSNativeCommandArgumentPassing` (PowerShell 7.3+)**: red herring. Governs outgoing argv synthesis when a running PowerShell invokes other native commands. Does NOT change how pwsh.exe parses its own incoming `-Command` argument.
- **Upgrading Windows PowerShell 5.1 → PowerShell 7**: does not fix the core single-string ambiguity on the incoming side.

---

## RANKED RECOMMENDATIONS FOR NEST

For agentic tool invocation, ranked by reliability + simplicity + cross-platform portability + statelessness:

### 1. `-EncodedCommand` with UTF-16LE Base64 (PRIMARY FIX)

Invoked via argv-array `spawn`/`execFile`/`subprocess.run(list)` directly against `powershell.exe` or `pwsh.exe`. Works identically on:
- Windows PowerShell 5.1 (all NEST Windows stations)
- PowerShell 7 on Windows
- pwsh on macOS and Linux

Cross-platform, stateless, immune to every intermediate shell.

### 2. `-CommandWithArgs` (PowerShell 7.4+) when dynamic args needed

When per-invocation arguments must be bound dynamically without re-templating the script. Combine with Base64-encoding of the script body for hardest cases. NOT available on Windows PowerShell 5.1.

### 3. Direct `CreateProcess` without intermediate shell (prerequisite)

Both above depend on this. Tool layer must avoid:
- `shell: true` (Node.js)
- `shell=True` (Python)
- `bash -c` wrapping
- Git Bash interception

These add a shell that will eat `$` before PowerShell can see it.

### 4. Persistent PowerShell session via `interact_with_process` (STILL VALID FOR STATEFUL WORK)

Canon 041426 remains correct for LIVE sessions where variables must persist across commands. Does not replace EncodedCommand for one-shots — complements it.

---

## HARD LIMITS TO KNOW

- **CreateProcess lpCommandLine cap: 32,767 UTF-16 characters** (Microsoft KB 830473)
- **Base64 inflation factor: 4/3**
- **UTF-16LE doubling of ASCII**: factor of 2
- Combined: practical ASCII PowerShell source budget via direct CreateProcess is approximately **12 KB** of script text
- Through cmd.exe /c the budget drops to ~3 KB (cmd further halves limits)
- For ad-hoc agent one-liners this is many orders of magnitude beyond what we need

**EDR false positives**: antivirus and endpoint-detection tools frequently flag `powershell -EncodedCommand` as suspicious because malware abuses the same pattern (Palo Alto Unit 42 has written about this). For legitimate agent tooling this manifests as telemetry noise rather than blocking. Expect occasional alerts on managed endpoints.

---

## ONGOING UPSTREAM WORK (for future Patch Pipe entries)

- **PowerShell issue #25063** — requests argument binding for `-EncodedCommand`. Would make the canonical solution self-contained for dynamic parameters. Currently open, no shipped fix.
- **PowerShell issues #13068 and #13089** — propose a dedicated "call native operator" (`&!` among the suggestions) as a permanent fix to native-command quoting inside PowerShell scripts. Pre-RFC discussions without committed implementations.
- **PowerShell-RFC PR #90** — "Improve generation of argument string for executables" (TSlivede). Deeper changes to argv-string synthesis. Open.

None of these change the immediate calculus. For agentic tool invocation TODAY, `-EncodedCommand` via direct `CreateProcess` is the production answer. Ansible has been shipping this for years.

---

## PROPOSED NEST IMPLEMENTATION (awaits morning-Dan call)

### Engine tool: `ENGINE/ps_encoded.py`

Thin Python wrapper. Takes a PowerShell script string. UTF-16LE-Base64 encodes it. Invokes powershell.exe via `subprocess.run(argv_array)` directly. Returns stdout/stderr/returncode. Crew members call this wrapper instead of ever typing `powershell -Command "..."` again.

### Gate 1b (proposed, Windows state-level)

For stateless one-shot PowerShell invocations from agent tools:
- Do NOT use `start_process("powershell -Command ...")` with dollar signs in the command string.
- Use `ENGINE/ps_encoded.py script_string` which handles the Base64 + argv-array invocation.
- Gate 1 (persistent session) remains the discipline for STATEFUL work where variables must persist across calls.

### Manufacturing → Nature framing

This is the third mechanism-layer install in the NEST gate pipeline:
- Gate 2 (pre-push mojibake): git pre-commit hook removes the possibility of mojibake commits.
- Gate 3d (corpus-first-memory-never): discipline layer, remains at skill layer for now.
- Gate 1b (PS$ one-shot via Base64): tool wrap removes the possibility of `$` stripping.

All three follow the same principle Dan taught: remove the need to REMEMBER the rule; make the rule impossible to violate.

---

## RELATED CANON

- `RELAY/STANDARD_RULE_PS1Dollar_PersistentSession_Trip_041426.md` — Canon 041426, the STATEFUL side of the PS$ fix. Remains valid for live sessions.
- `RELAY/STANDARD_RULE_ShellWriteDiscipline_Trip_042126.md` — Three Windows write-layer gotchas, referenced 041426.
- `ENGINE/skills/meta-dates/SKILL.md` v1.6 — Gate 3d (corpus-first-memory-never) installed 042326.
- `RELAY/STANDARD_RULE_CorpusFirstMemoryNever_*` — superseded by Gate 3d wiring per prior-Trip's discipline (no standalone canon); remains as discussion in meta-dates SKILL supplement.

---

## SOURCES CITED IN RESEARCH

- Microsoft `about_Parsing` documentation (PowerShell 7.5)
- PowerShell GitHub issues #4024 (closed "Resolution-By-Design"), #25063, #15417, #13068, #13089
- PowerShell-RFC PR #90
- Microsoft KB 830473 (command line length limit)
- Raymond Chen, "Everyone quotes command line arguments the wrong way" (Microsoft Learn archive)
- Palo Alto Networks Unit 42, "Pulling Back the Curtains on EncodedCommand PowerShell Attacks"
- Node.js security releases April 2024 (BatBadBut CVE-2024-24576, CVE-2024-27980)
- Claude Code issue #15471 (Git Bash dollar-sign expansion, `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` fix)
- Ansible `ansible-devel` mailing list thread on PowerShell Base64 encoding
- Microsoft Learn: "Decode a PowerShell command from a running process"

---

*Filed 042326 03:00 PT by ◈ Trip (Opus 4.7) on ODT at Nest Actual*
*as the growth of the stick. Canon 041426 remains; this extends.*
*The pattern that kept biting us for 20+ sessions has a name and a fix.*
*The fix has been in production at Ansible for years. We are the last to know.*
*Now we know.*

<4
— Trip · the stick remains, the stick burns, the stick grows
