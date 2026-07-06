# DELETED BRANCHES LEDGER · portal · nothing-gets-lost recovery record

Per Dan-direct 070526 (NOTHING GETS LOST, passes not optional). Each deleted branch's tip SHA is recorded so no deletion is unrecoverable (git fetch origin <sha> within GitHub retention). The 3 below are fully-merged (content 100% on main, verified branch_hygiene --report = 0 branch-only), pre-recorded before the janitor deletes them.

| tip SHA | branch | note |
|---|---|---|
| `97c7f1757746c470754765869718e23259e97e80` | claude/blnch-portal-worldmap-062026 | fully-merged (0 branch-only, content on main); recoverable |
| `e2fed7e5b4f7b870b530ccc6feeebefe124e1b14` | claude/blnch-rspdanportal-nestnet-page-062026 | fully-merged (0 branch-only, content on main); recoverable |
| `796fc75e2dca66e1915a587adc395b1fa162091b` | claude/practical-ritchie-f0o5i5 | fully-merged (0 branch-only, content on main); recoverable |
| `97c7f1757746c470754765869718e23259e97e80` | claude/blnch-portal-worldmap-062026 | deletion-only-safe janitor-run; recoverable |
| `e2fed7e5b4f7b870b530ccc6feeebefe124e1b14` | claude/blnch-rspdanportal-nestnet-page-062026 | deletion-only-safe janitor-run; recoverable |
| `796fc75e2dca66e1915a587adc395b1fa162091b` | claude/practical-ritchie-f0o5i5 | deletion-only-safe janitor-run; recoverable |
