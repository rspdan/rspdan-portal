// Hidden Instructions (HI) registry — the single source of truth for every config/instruction
// box that shapes NEST operations. Inside-face governance data (Dan-direct 070126: "track them
// all down, list them, condense via common link to a rspdan.com page ... unified communication
// and data governance"). Grounded from STATUS/HIDDEN_INSTRUCTIONS_INVENTORY.md (the HI-inventory
// sweep). Descriptive, not manufactured: this lists what EXISTS, cited; it does not declare.

export const hi_registry = {
  updated: '070126',
  source_of_truth: 'nest-bridge/STATUS/HIDDEN_INSTRUCTIONS_INVENTORY.md',
  summary: {
    categories: 13,
    on_disk_files: '~220 instruction-carrying files + off-disk boxes',
    engine_scripts: 134,
    engine_accounted: 46, // 25 active + 21 declared-unwired; ~88 unaccounted
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
      title: 'Secrets in config',
      detail: 'nest_proxy_config.json carries an api_key in plaintext. Should move to a credential store / env, not sit in tracked-adjacent config.',
      class: 'security / access-control',
    },
    {
      rank: 2,
      title: '134 ENGINE scripts, 46 accounted',
      detail: '~88 scripts are neither declared-active nor declared-unwired in the constitution — the "read-not-fired" leak the policy itself names. Ungoverned instruction surface.',
      class: 'coverage / change-control',
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
    { name: 'MCP config/creds', count: 'several', influences: 'connector reach + auth', editable: '/root/.claude.json + settings allow-lists' },
    { name: 'Env / off-disk HI', count: '~10 + app boxes', influences: 'model, remote, effort, autocompact; the Claude-app system-prompt/memory/account boxes', editable: 'env vars + the Claude settings UI' },
  ],
  governance_principles: [
    'Single source of truth (this registry)',
    'Accountability + Transparency + Integrity (ARMA GARP)',
    'Change-control: who/when/why for every HI change',
    'Retention + disposition: retired HI shown RETRACTED, not deleted (NOTHING-GETS-LOST)',
    'Coverage: accounted-vs-present, layer-drift auto-surfaced',
  ],
};
