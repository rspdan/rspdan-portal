// Hidden Instructions (HI) registry · the single source of truth for every config/instruction
// box that shapes NEST operations. Inside-face governance data (Dan-direct 070126: "track them
// all down, list them, condense via common link to a rspdan.com page ... unified communication
// and data governance"). Grounded from STATUS/HIDDEN_INSTRUCTIONS_INVENTORY.md (the HI-inventory
// sweep). Descriptive, not manufactured: this lists what EXISTS, cited; it does not declare.

export const hi_registry = {
  updated: '070226',
  source_of_truth: 'nest-bridge/STATUS/HIDDEN_INSTRUCTIONS_INVENTORY.md',
  summary: {
    categories: 13,
    on_disk_files: '~220 instruction-carrying files + off-disk boxes',
    engine_scripts: 134,
    engine_accounted: 134, // CLOSED 070126: 24 active gates + 114 declared-unwired (accounting-closure applied to nestrust_policy.json); 0 unaccounted
    settings_layers: 3,
    skills_ambient: 48,
  },
  // The precedence stack (Claude Code convention): higher overrides lower.
  precedence: [
    'enterprise managed policy (not present)',
    'command-line args',
    'local project .claude/settings.local.json (none found)',
    'project nest-bridge/.claude/settings.json (wins model + adds Stop gates)',
    'user /home/user/.claude or /root/.claude (SessionStart + LAGOS/close Stop + shared hooks)',
  ],
  highest_risk: [
    {
      rank: 1,
      title: 'Secrets in config · tracked-tree hygiene (updated 070226)',
      detail: 'nest_proxy_config.json api_key: deleted + untracked 070126 (Dan-direct "NOT ROTATE. DELETE"); the proxy uses the NEST_API_KEY env var (credential store). 070226 sweep: the archived 040426 relay MAIL under public/mail still carried the key literal in its curl examples and KEY VALUE block; REDACTED 070226 (this change). Proportion per the 060826 canon: this is a low-blast-radius internal relay token (worst case is read/write on the Crew relay bus, server-side invalidation is Dan-trivial); hygiene, not emergency; rotation stays Dan\'s option, never a Crew-carried alarm. src/data/seegulls.json retains a historical rotation-note entry as record-of-past (no key material).',
      class: 'security / access-control (hygiene current)',
    },
    {
      rank: 2,
      title: 'ENGINE script accounting · CLOSED 070126',
      detail: 'Was: 88 scripts neither declared-active nor declared-unwired (the read-not-fired gap). Closed 070126: every one classified header-grounded and folded into the constitution (24 active gates + 114 accounted-unwired). nestrust_validate can now fail on any future unaccounted ENGINE/*.py.',
      class: 'coverage / change-control (resolved)',
    },
    {
      rank: 3,
      title: 'Three settings layers, no single source of truth',
      detail: 'Overlapping-but-different hook sets per layer (different Stop-gates), plus bypassPermissions + Bash(*)/Write wildcards in all three with no who/when/why record. "Installed here" != "installed everywhere".',
      class: 'configuration drift',
    },
  ],
  categories: [
    { name: 'settings.json layers', count: '3 + launcher', influences: 'hooks + permissions + model', editable: 'edit the JSON layer; mind precedence' },
    { name: 'Wired hooks', count: '8 distinct', influences: 'fire every turn (SessionStart/UserPromptSubmit/PreToolUse/SubagentStop/Stop), additive across layers', editable: 'settings.json hooks block' },
    { name: 'Hook scripts', count: '12 on disk', influences: 'the logic each hook runs', editable: '.claude/hooks/ + /root/.claude/' },
    { name: 'Pre-commit gate suite', count: '17 gates', influences: 'every commit scanned', editable: 'the heredoc in session-start.sh (regenerates .git/hooks/pre-commit)' },
    { name: 'ENGINE scripts', count: '134 (.py)', influences: 'gates, hooks, tools', editable: 'ENGINE/; account in nestrust_policy.json' },
    { name: 'CLAUDE.md', count: '3', influences: 'standing project instructions (auto-loaded)', editable: 'the CLAUDE.md per repo' },
    { name: 'AGENTS.md', count: '13 (open-design)', influences: 'directory-level agent guidance', editable: 'the AGENTS.md per dir' },
    { name: 'Skill SKILL.md', count: '48 ambient (600 total)', influences: 'standing behavior', editable: 'ENGINE/skills/<name>/SKILL.md' },
    { name: 'Gate constitution', count: '1', influences: 'which gates are active/unwired', editable: 'ENGINE/nestrust_policy.json' },
    { name: 'Other policy/config JSON', count: '1 (nest_proxy_config.json, untracked 070126)', influences: 'NEST proxy/relay behavior (base_url, channels, crew)', editable: 'the untracked local config + NEST_API_KEY env var' },
    { name: 'MCP config/creds', count: 'several', influences: 'connector reach + auth', editable: '/root/.claude.json + settings allow-lists' },
    { name: 'Env / off-disk HI', count: '~10 + app boxes', influences: 'model, remote, effort, autocompact; the Claude-app system-prompt/memory/account boxes', editable: 'env vars + the Claude settings UI' },
    { name: '.cursorrules / copilot-instructions', count: '0 found (searched all repos to depth 4)', influences: 'none present; listed so the absence is governed, not assumed', editable: 'n/a (would be per-repo dotfiles)' },
  ],
  governance_principles: [
    'Single source of truth (this registry)',
    'Accountability + Transparency + Integrity (ARMA GARP)',
    'Change-control: who/when/why for every HI change',
    'Retention + disposition: retired HI shown RETRACTED, not deleted (NOTHING-GETS-LOST)',
    'Coverage: accounted-vs-present, layer-drift auto-surfaced',
  ],
};
