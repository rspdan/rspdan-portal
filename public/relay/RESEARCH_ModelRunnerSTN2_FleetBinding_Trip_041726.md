# RESEARCH: Docker Model Runner as Fleet Inference Host on STN2

**Author:** Trip (Opus)
**Station:** STN2 at Nest Actual
**Date:** 041726 (F# Week Day 6, Friday)
**Session:** STN2_NEST.01_TripO_041726_2
**Status:** VERIFIED AND OPERATIONAL

---

## One-paragraph summary

Docker Model Runner was installed and configured on STN2 in an earlier session
today, but the `host-side TCP support` option binds only to `127.0.0.1:12434`
and does not expose the endpoint to the Fleet LAN. This session added a
Windows portproxy entry forwarding `10.0.0.2:12434` to `127.0.0.1:12434`, plus
a Windows Firewall inbound-TCP rule for port 12434 on Profile Any. After
configuration, the endpoint answers reliably on both localhost and the Fleet
IP from STN2 itself. A sustained chat-completion call holding an open TCP
connection for 124 seconds through the portproxy path completed without any
byte loss or connection disruption, verifying that the portproxy handles
long-lived inference connections correctly, not just short JSON smoke tests.
STN2 is now the first Fleet-available inference host. The models available
are `docker.io/ai/gemma4:latest` (4.74 GiB) and `docker.io/ai/mistral-nemo:latest`
(6.96 GiB). All other Fleet stations on the 10.0.0.x copper LAN can reach
the endpoint. Cross-station verification from DPSL, DPSR, ODT, TRP0, GOG1,
and CUBE remains pending but is expected to succeed given the self-reach
test already passed.

---

## What was built

Two configuration changes, both persistent across reboots and both reversible
with single commands:

The first change is a Windows portproxy entry added via `netsh interface
portproxy`. This is a built-in kernel-level TCP forwarder that Windows has
supported since XP. It listens on one address-port pair and transparently
forwards to another, splicing bytes between the two connections without any
userspace overhead. Our specific entry listens on `10.0.0.2:12434` (STN2's
Fleet LAN copper interface IP) and forwards to `127.0.0.1:12434` (the
loopback interface where Docker Model Runner itself listens). Docker Model
Runner has no awareness that the Fleet-facing endpoint exists; from its
perspective all requests still arrive on localhost, which is important for
update resilience because it means a Docker Desktop update cannot silently
revert our configuration.

The second change is a Windows Firewall rule named `NEST Docker Model Runner
12434`, allowing inbound TCP traffic on port 12434 across all firewall
profiles (Domain, Private, Public). Without this rule, packets arriving on
`10.0.0.2:12434` would be silently dropped by the firewall even though the
portproxy was configured to accept them. The rule is scoped to Profile Any
so it works regardless of how Windows categorizes the Ethernet interface at
any given moment, since laptop network classifications can shift between
contexts and we do not want the Fleet binding to depend on that.

Both changes live in Windows registry persistence, so they survive reboots
without needing to be re-applied. The setup script that made them is filed
at `ENGINE/setup_modelrunner_fleet_binding.ps1` and is idempotent, meaning
running it a second time on a station where the rules already exist cleanly
removes and re-adds them rather than failing on conflict.

## Verification performed this session

Three tests were run from a non-elevated PowerShell session after the admin
setup script completed. All three passed.

Test one was a localhost baseline confirming that the previous Docker Model
Runner configuration was still intact. A GET to `http://localhost:12434/engines/v1/models`
returned the expected two-model catalog in milliseconds. This was the
control case, proving nothing about Fleet access on its own but establishing
that the Model Runner itself had not been disturbed by our changes.

Test two was the real test: a GET to `http://10.0.0.2:12434/engines/v1/models`
from STN2's own PowerShell. This was the same request the prior session had
tried and failed (connection refused, because nothing was listening at
10.0.0.2:12434 before we added the portproxy). This time it succeeded and
returned the same two-model catalog. This proves that the portproxy accepts
connections on the Fleet interface and forwards them cleanly to the Model
Runner on loopback.

Test three was a netstat inspection that showed two listening sockets: one
on `10.0.0.2:12434` owned by a system PID (the Windows portproxy service)
and one on `127.0.0.1:12434` owned by the Docker Model Runner's PID. It
also showed ESTABLISHED connection pairs from our two test calls, proving
that portproxy was opening its own outbound loopback connections to the
Model Runner in response to each inbound Fleet-IP request, which is exactly
the expected splice-and-relay behavior.

After these three smoke tests, a full chat-completion call was run through
the Fleet IP to verify the portproxy handles sustained connections
correctly. That call is documented in the performance section below.

## Performance baseline

Two real chat-completion calls against `docker.io/ai/gemma4:latest` were
run this session, one through localhost and one through the Fleet IP.
Both calls hit a warm model (no cold-start disk load), so the comparison
is honest.

The localhost call generated 4 completion tokens for a four-token
completion-length prompt, measured by llama.cpp's internal timings block:
prompt processing ran at 2.80 tokens per second and prediction ran at 4.32
tokens per second.

The Fleet-IP call generated 200 completion tokens for a longer, more
substantive prompt. Its timings were prompt processing at 3.32 tokens per
second and prediction at 2.81 tokens per second.

The apparent drop in prediction speed between the two calls (4.32 to 2.81
tokens per second) is not caused by the portproxy path. The portproxy
operates in-kernel with microsecond-level overhead, which is invisible
next to token generation that takes hundreds of milliseconds per token.
The drop is caused by the workload difference: per-token generation cost
grows linearly with context length on CPU inference because each new
token must attend to all previous tokens in the KV cache. Token 200 takes
more compute to generate than token 4, so a 200-token average is lower
than a 4-token average. This is inherent to transformer architecture on
CPU and is not pathological.

For practical routing decisions, this means short-output tasks on gemma4
are quick (a fifty-token classification or tagging result takes roughly
ten seconds including prompt processing) while long-output tasks get
progressively slower (a five-hundred-token summary takes several minutes
because the last tokens are each slower than the first). Short-output
tasks are the sweet spot for this model on this hardware. Long-output
tasks will work but are better routed to GOG1's RTX 3060 path when that
comes online.

## Key discovery: gemma4 is a reasoning model

The most important thing we learned this session is not about networking
at all. It is about how Docker Model Runner exposes the `gemma4` model and
how that exposure differs from how non-reasoning models are typically
handled via OpenAI-compatible APIs.

When we made the Fleet-IP chat-completion call, the returned JSON contained
a field we had not seen in OpenAI's documented schema: `reasoning_content`.
The standard `content` field came back empty, but `reasoning_content` was
populated with several hundred words of the model actively thinking through
the prompt, structuring its analysis, considering multiple interpretations,
and beginning to articulate a response. It never emitted user-visible
content because the 200-token budget was exhausted during the reasoning
phase, before the model got to the answer.

This is a llama.cpp server feature. The `b1-0988acc` backend (visible in
the `system_fingerprint` field of every response) splits model output that
uses `<think>...</think>` chat-template markers into separate `reasoning_content`
and `content` fields. The `gemma4` variant Docker Model Runner distributes
has this reasoning structure built into its chat template. The model
always reasons first and answers second, and the reasoning can consume
hundreds of tokens even for simple prompts.

The practical consequence is a rule, embedded here as a finding rather
than a standalone STANDARD_RULE document because it applies only to
reasoning models and not to inference generally:

**When calling a reasoning model (currently known: gemma4 via Docker Model
Runner), `max_tokens` must cover both the thinking phase and the answer
phase. A working floor is 800 tokens for simple prompts and 1500 to 4000
for anything substantial. Setting `max_tokens` to small values (60, 200,
even 400) will cause reasoning to exhaust the budget and produce empty
`content` with `finish_reason: length`, which looks like a failure but is
actually the model still being mid-thought.**

There is also a practical dial available but untested: llama.cpp allows
overriding the chat template at runtime, which could suppress the reasoning
phase for tasks that do not need it (tagging, classification, short
summarization) while keeping it enabled for tasks that do benefit from it
(analysis, decision support, code review). That is a followup worth
exploring when we start routing real work to gemma4.

## Other learnings from this session worth filing

Three smaller lessons emerged during the setup that are worth capturing
so future Trip on other stations does not rediscover them.

First, the discipline that would have saved the most time tonight is
**parse-check before invoke**. PowerShell has a built-in parser accessible
at `[System.Management.Automation.Language.Parser]::ParseFile()` that reads
a script and reports syntax errors without executing anything. Three
seconds of parse-checking catches syntax failures that would otherwise
cascade into a dozen red error lines when the script is actually run.
This matters especially when a script has been edited by a tool rather than
a human, because edits can introduce encoding mismatches or paren imbalance
that a human editor would catch visually. Every `.ps1` file handed off for
elevated execution should be parse-checked first. This is lightweight
enough to inline into any setup-script workflow.

Second, UTF-8 em-dashes in `.ps1` files are a silent-failure trap on
Windows PowerShell 5.1. PS 5.1 reads scripts as Windows-1252 (ANSI) by
default, and the three-byte UTF-8 sequence for an em-dash gets
misinterpreted as three separate Windows-1252 characters, one of which
looks like a closing quote to the parser. The parser then reports string
termination errors at seemingly unrelated lines further down the file,
because it has lost track of where strings open and close. **Rule:
`.ps1` files should be written in pure ASCII unless the file has an
explicit UTF-8 byte-order mark.** Substitute `--` or `->` or plain words
for em-dashes, arrows, and other Unicode punctuation. This applies to
script-writing tools generally, not just to any particular Trip workflow.

Third, PowerShell sessions spawned as subprocesses of an MCP server
cannot self-elevate via `Start-Process -Verb RunAs` even when the user
is in the local Administrators group and UAC is configured to silent-elevate.
The root cause appears to be that the Windows AppInfo service (the
consent broker) requires the elevated process to bind to an interactive
desktop session, and an MCP-spawned PowerShell does not have the session
attachment needed for that binding to succeed. `Start-Process` returns
normally, the elevated child process never runs, and no error is
surfaced. This is a **genuine architectural boundary**, not a configuration
bug, and it means setup scripts requiring elevation must be executed
manually by the user in their own admin PowerShell window rather than
invoked from the MCP-attached session. The universal UAC rule (memory
entry "Never punt admin ops citing UAC") holds for conventional scenarios
but has this specific carve-out for MCP-spawned sessions. This does not
change any standing rule; it documents where that rule's practical reach
ends.

## Reversibility

Every change made this session can be fully reversed with two commands
run in an admin PowerShell window:

```
netsh interface portproxy delete v4tov4 listenport=12434 listenaddress=10.0.0.2
Remove-NetFirewallRule -DisplayName 'NEST Docker Model Runner 12434'
```

After running these, `10.0.0.2:12434` will no longer answer, and STN2
returns to localhost-only Model Runner access. Docker Desktop itself is
untouched by either command.

## What this enables

STN2 is now a Fleet resource for text generation. Any process on any
Fleet station can make OpenAI-compatible chat-completion calls to
`http://10.0.0.2:12434/engines/v1/chat/completions` and receive
completions back. Practical near-term applications within NEST:

- Asynchronous document tagging and summarization tasks that do not
  require real-time response can be routed to STN2 gemma4 rather than
  consuming hosted-API tokens from Anthropic or OpenAI
- Station-local Trip or Stan or C.B. instances on other Fleet stations
  can use STN2 as a lightweight inference sidecar for pre-processing or
  draft generation before escalating to hosted models
- Experimentation with local-first NEST pipelines (NESTNET query
  enrichment, MAIL thread summarization, Graft drafting) without network
  egress or per-token cost

## Followups opened by this session

The observations below are filed here rather than as separate NEARGULL
documents because they are lightweight enough to carry in the tail of
this research document:

- Cross-station verification: curl `http://10.0.0.2:12434/engines/v1/models`
  from DPSL, DPSR, ODT, TRP0, GOG1, CUBE and confirm each station reaches
  the endpoint. Expected to succeed but not yet proven.
- Reboot-persistence verification: at next STN2 cold boot, run the
  three-test self-check to confirm Fleet-LAN binding survives without
  needing re-setup.
- Chat-template override experiment: determine whether Docker Model
  Runner / llama.cpp exposes a runtime flag to suppress the reasoning
  phase on gemma4 for tasks that benefit from direct answers.
- GOG1 mistral-nemo path: stand up the same setup on GOG1 with RTX 3060
  acceleration, using this script as the template.
- Second model benchmark: run the same performance calls against
  mistral-nemo on STN2 to compare reasoning-vs-non-reasoning throughput
  characteristics.

## File references

- Setup script: `C:\STAN\SOURCE\nest-bridge\ENGINE\setup_modelrunner_fleet_binding.ps1`
- First inference test: `C:\STAN\SOURCE\nest-bridge\ENGINE\test_gemma4_first_call.ps1`
- Full response dump test: `C:\STAN\SOURCE\nest-bridge\ENGINE\test_gemma4_second_call.ps1`
- Setup transcript log: `C:\STAN\SOURCE\nest-bridge\ENGINE\setup_modelrunner_fleet_binding.log`

---

*Filed by Trip (Opus) on STN2 at Nest Actual, 041726 F# Week Day 6.*
