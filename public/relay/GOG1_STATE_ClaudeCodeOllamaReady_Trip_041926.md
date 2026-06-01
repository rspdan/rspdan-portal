# GOG1 — Claude Code + Ollama installed
# Filed: 041926 Sunday ~21:50 PT · F# Week Day 1 · Trip on ODT
# Station touched: GOG1 (10.0.0.3 Fleet LAN / 192.168.168.185 VZW)
# Canonical principle: universalization — Claude runs locally on every station

## STATE AFTER TONIGHT'S SESSION

**GOG1 has Claude Code installed natively.** This is the real universalization move: Claude-as-operator on GOG1 itself, not Trip-on-ODT reaching through SSH. Each station gets its own local Claude. Bridge + GraftOS + NESTNET are the shared substrate linking them.

### Claude Code on GOG1
- **Binary:** `/home/dan/.nvm/versions/node/v22.22.2/bin/claude`
- **Version:** `2.1.114 (Claude Code)`
- **Install path:** npm global under nvm Node v22.22.2
- **PATH:** available in any login bash (nvm sourced via ~/.bashrc)
- **Auth state:** NOT YET AUTHENTICATED. `~/.claude/` and `~/.config/claude-code/` do not exist.

### Ollama on GOG1
- **Binary:** `/usr/local/bin/ollama`
- **Version:** `0.21.0`
- **Service:** `systemctl is-active ollama` → `active`
- **Bind:** `*:11434` (all interfaces — Fleet-LAN reachable at http://10.0.0.3:11434)
- **Systemd override:** `/etc/systemd/system/ollama.service.d/override.conf` sets `OLLAMA_HOST=0.0.0.0:11434`
- **Models imported:** NONE YET. 3 .gguf files sitting at `/home/dan/GOG1_MODELS/` awaiting Modelfile import:
  - `Llama-3.2-3B-Instruct-Q4_K_M.gguf` (1,926 MB)
  - `microsoft_Phi-4-mini-instruct-Q4_K_M.gguf` (2,376 MB)
  - `nomic-embed-text-v1.5.Q8_0.gguf` (139 MB)
- **Files staged:** Been on GOG1 since 041326 library session (FAS2 → GOG1 transfer). Not the 041426 FAS restructuring — those were separate cargo.

### NVIDIA driver state (unrelated to Claude Code, but noted)
- nvidia-driver-580 packages half-configured (GCC-11 vs kernel 6.8 DKMS compile failure)
- Decision pending: GCC 12 install + DKMS rebuild, or fall back to R535
- **Does not block Claude Code or Ollama.** Both run CPU-only fine on GOG1's i7-4790 + 16 GB RAM. GPU is accelerator not requirement.

## ONE-COMMAND AUTH FOR DAN

From GOG1 directly (physical terminal or `ssh -t dan@10.0.0.3`):
```bash
claude
```
First run opens OAuth URL. Paste the URL into a browser logged into Dan's Anthropic account, paste the code back. One-time setup. After that `claude` launches the interactive Claude Code session from anywhere on GOG1.

Non-interactive alternative (API key via env var):
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
claude --print "your prompt"
```

## ONE-COMMAND MODEL IMPORT (when Dan wants it)

From any shell on GOG1, to load the llama3.2:3b model into Ollama:
```bash
cd /home/dan/GOG1_MODELS
cat > Modelfile.llama <<'EOF'
FROM ./Llama-3.2-3B-Instruct-Q4_K_M.gguf
EOF
ollama create llama3.2:3b -f Modelfile.llama
```
Then verify from ODT: `curl http://10.0.0.3:11434/api/tags`

Same pattern for phi-4-mini and nomic-embed-text.

## FOR NEXT TRIP SESSIONS

The station-local Claude-Code architecture means a Trip session "on GOG1" literally runs on GOG1, reads GOG1's filesystem directly, invokes GOG1's shell directly. No SSH chain. No drive-letter translation. Shared state via `~/nest-bridge` (git-sync'd) and GraftOS (network) and NESTNET (network).

Same pattern will land on CUBE (Windows/Admin user "Dan") and STN2 (Windows/user "Code") — both already have Node and Bridge checkouts, just need `npm install -g @anthropic-ai/claude-code` to land the same binary.

## OPEN FOR DAN

1. Auth Claude Code on GOG1 when convenient (one-time)
2. Decide model-import timing (deferred per tonight's direction)
3. Decide STN2 + CUBE Claude Code install ordering
4. GCC-12 vs R535 driver path (deferred)

---

*Filed by Trip · ODT · 041926 F# Week Day 1 Sunday ~21:50 PT*
*Universalization not architecture. Claude on every station. Shared substrate binds.*

<4
— Trip
