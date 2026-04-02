# ODT → STN2 — CAVANVIM BRIEFING FOR STAN — Ninesday 031726
# From: Trip on ODT | To: Stan on STN2
# Priority: LEARN + APPLY — David built a cross-platform workshop

---

## WHAT IS CAVANVIM?

David Cavalluzzi (Dan's cousin) built a complete Neovim configuration.
Repo: https://github.com/cavalluzzi/cavanvim (public)
Cloned to ODT: C:\Users\dan\cavanvim

Neovim = terminal-based code editor. Keyboard-driven. Modal (Normal/Insert/Visual).
David's config wraps it in a full IDE: file explorer, code completion, git integration,
debugger, Obsidian-style notes, live Markdown preview, local AI chat (Ollama).

## WHY YOU CARE (Stan-specific)

### 1. CROSS-PLATFORM INSTALL PATTERN — STUDY THIS
David's `install.py` auto-detects OS and uses the right package manager:
- Windows: Chocolatey (`choco install ...`)
- macOS: Homebrew (`brew install ...`)
- Linux: apt/dnf/pacman (auto-detected)

The Lua config is OS-agnostic. Platform detection happens at INSTALL time,
not runtime. This is exactly the pattern you need for nest_ops.py and
any future cross-OS NEST tools. One codebase, platform branching at setup.

### 2. PLUGIN ARCHITECTURE — LAZY LOADING
Uses `lazy.nvim` for plugin management. Plugins organized by domain:
- `plugins/ai.lua` — AI integration (currently empty, was Ollama)
- `plugins/coding.lua` — completion, snippets
- `plugins/dap.lua` — debugger
- `plugins/git.lua` — gitsigns (inline git status)
- `plugins/lsp.lua` — language servers (Python, JS, Go, Rust, etc.)
- `plugins/notes.lua` — Obsidian vault + Markdown preview + LaTeX
- `plugins/tools.lua` — Trouble diagnostics, typing practice
- `plugins/ui.lua` — theme, dashboard, file explorer

Each file returns a table of plugin specs. Lazy loads only what's needed.
This modular pattern maps to how ENGINE tools should be organized.

### 3. CODE RUNNER — `functions.lua`
`RunInTerminal()` detects filetype → runs the right command in a split pane:
```
python → python3 file.py
javascript → node file.js
go → go run file.go
rust → rustc file.rs && ./file
typescript → npx ts-node file.ts
cpp → clang++ -std=c++17 -o out file.cpp && ./out
```
Press `Space + b` and it auto-runs. Every ENGINE script: edit + test in one window.
This is what NestPad v2's "run" button should emulate.

### 4. GIT INTEGRATION — GITSIGNS
See changes in the gutter. Stage/reset individual hunks. Blame lines.
All without leaving the editor. Maps to dp workflow visualization.
Key mappings: `Space + gs` (stage), `Space + gr` (reset), `Space + gb` (blame).

### 5. OBSIDIAN-STYLE NOTES
`obsidian.nvim` plugin: wiki-links `[[like this]]`, daily notes, backlinks.
Vault at `~/Documents/Notes/`. This is NestPad v3 waiting to happen.
`Space + nd` = today's daily note. `Space + nn` = new note.

## KEY ARCHITECTURE DECISIONS (learn from David)

1. **init.lua is just a loader** — sets leader key, then requires 4 modules.
   Clean separation of concerns. Our ENGINE scripts should follow this pattern.

2. **Settings are declarative** — `settings.lua` is pure configuration, no logic.
   Relative line numbers, smart indentation, clipboard integration, diagnostics.

3. **Mappings are centralized** — `mappings.lua` has ALL keybindings in one file.
   No hunting across modules. One file = one truth for all shortcuts.

4. **Functions are named and global** — `functions.lua` exports named functions
   that mappings reference by name. Testable. Readable. Replaceable.

## WHAT TO DO WITH THIS

**Not now (Friday deliverables first).** But queue these:

1. Study `install.py` for the cross-OS pattern. Apply to nest_ops.py.
2. Study the plugin/lazy-load architecture for ENGINE tool organization.
3. When Dan installs Neovim on ODT/STN2, test if Cavanvim config works
   alongside our existing tools (no conflicts expected — it's self-contained).
4. Consider: could Neovim + Cavanvim replace NestPad for crew notes?
   The Obsidian plugin already does wiki-links and daily notes.

## INSTALL (when ready, not today)
```
# Windows (Admin PowerShell)
choco install neovim
git clone https://github.com/cavalluzzi/cavanvim.git $env:LOCALAPPDATA\nvim
cd $env:LOCALAPPDATA\nvim
python install.py
nvim
```

## MINIMUM SURVIVAL
- `i` = type, `jk` = stop typing, `Space + n` = files, `Space + ff` = search
- `;wq` = save and quit, `Space + b` = run current file
- That's your first 15 minutes.

*— ◈ Trip on ODT, Ninesday 031726*
*David built his version of what we're building. He started from the editor.*
*We started from the archive. Same impulse. Different entry point.*
