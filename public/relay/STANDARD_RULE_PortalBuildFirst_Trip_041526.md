# STANDARD RULE — Portal commits build locally first

**Filed:** Trip, ODT, 041526 (F# Week Day 4), 22:50 Pacific
**Status:** ACTIVE — applies to all commits to `rspdan-portal`
**Supersedes:** nothing
**Enforcement:** `ENGINE/portal_check.ps1` (pre-push), session_close Vercel verification (post-push, pending)

## The rule

Any commit to `rspdan-portal` MUST pass `npm run build` locally before `git push`. Verify with:

```
F:\STAN\SOURCE\nest-bridge\ENGINE\portal_check.ps1
```

If the script says `BUILD GREEN — SAFE TO PUSH`, push. If it says `BUILD FAILED — DO NOT PUSH`, fix the error before pushing. No exceptions.

## Why

On 041526, two portal commits (PI v5.3 and SEEGULLS sync) were pushed to GitHub without local build verification. Both failed on Vercel with the same Astro error:

```
Expected "}" but found "'FAS'"
Location: src/pages/nest-pi.astro:39:55
```

Astro parses `{ ... }` as JavaScript expressions inside any HTML element, including `<pre><code>` blocks. The PowerShell snippet `Get-Volume | Where-Object { $_.FileSystemLabel -match 'FAS' }` looked fine in source but broke Astro's parser when it encountered `-match 'FAS'` inside the braces (`-match` isn't a JS operator, `'FAS'` was unexpected).

Result: production rspdan.com ran yesterday's code (commit c9c5ccc) for approximately 8 hours while the crew assumed PI v5.3 was live. The session summary claimed "PI v5.3 shipped" based on a successful `git push`, not a verified deploy.

**Git push success ≠ deploy success.** The build runs on Vercel, and only Vercel's build output tells you the truth. Running `npm run build` locally catches the exact same error at the source, where the fix is seconds away.

## The fix (when it catches you)

Astro content with brace-heavy code (PowerShell, TypeScript generics, CSS-in-JS, JSX in a code block):

- Wrap the `<pre>` with `is:raw`: `<pre is:raw><code>...</code></pre>` — Astro skips expression parsing inside the element
- Or escape each brace with HTML entities `&#123;` / `&#125;`
- Or use `<Fragment set:html="..."/>` for a whole block

## Mechanism

`portal_check.ps1`:
1. Detects portal path by FAS label (no hardcoded drive letters)
2. Runs `npm run build` in that directory
3. Exits 0 on success, 1 on failure
4. Prints big green or big red banner

## Gate order

Any portal commit workflow now reads:

1. Edit file → 2. `git add` → 3. `git diff --cached` (review) → 4. **`.\ENGINE\portal_check.ps1`** → 5. `git commit` → 6. `git push` → 7. verify Vercel READY (via session_close script when that lands)

Step 4 is non-negotiable.

## Related

- `STANDARD_RULE_PS1Dollar_PersistentSession_Trip_041426.md` — another case of "generating values without reading the instrument"
- `STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md` — encoding traps from PowerShell defaults
