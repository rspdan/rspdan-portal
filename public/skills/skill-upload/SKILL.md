---
name: skill-upload
mode: substrate
description: Upload SKILL.md files from Bridge to Claude.ai when Bridge skills are ahead of loaded skills.
---

# SKILL: Uploading Skills to Claude.ai via Chrome MCP
# Canonical method as of 040426: JavaScript DataTransfer API
# STANDARD_RULE_SkillUpload_DataTransfer_040426.md on Bridge — read before using this.
# Status: CANONICAL (042826 — wired into discipline web via boot-polish + meta-dates + session-close inbound citations)
# Crew-agnostic: any crew member can fire this skill on any station.

---

## THE ONE RULE

Never use file_upload + ref for skill uploads.
It triggers the native OS file picker dialog every time.
Use JavaScript DataTransfer instead. Always.

---

## WHEN TO FIRE

Three trigger conditions. Any one fires this skill:

1. **Audit shows Bridge ahead.** Run the auto-discover audit (below). If any skill's Bridge SKILL.md differs from its loaded Claude.ai version → fire skill-upload for that skill.

2. **Bridge edit just landed.** If you just git commit-ed a change to ENGINE/skills/[name]/SKILL.md, the loaded Claude.ai version is now stale. Fire skill-upload before closing the work block. The atomic-commit-skill canon implies this: each work unit produces one durable artifact, and a skill edit's full work unit includes propagation to the consumer.

3. **Boot-polish or session-close gate fires.** boot-polish CHECK 8 lists "Bridge skills sync" as a BPK item. session-close Gate 6 includes "skills synced" as a close-condition. If either gate flags divergence, this skill fires.

These conditions are NEST.02 inbound-citation gates — boot-polish + meta-dates Crew-Ops + session-close Gate 6 all reference skill-upload. The skill is no longer orphan; it is woven into the discipline web.

**Cloud-seat handoff clause (added 070326 by Olo):** condition 2 can fire on a seat that CANNOT execute this skill (a cloud worktree NUG has no Chrome MCP tab on claude.ai and no rspdan-portal checkout for the Copy-Item step). That seat does not skip the obligation silently: it records the pending upload EXPLICITLY (name the skill(s) edited, in its RELAY note or MFST RAM) so a Station seat fires this skill at its next boot-polish CHECK 8 / audit pass. An edit with neither the upload nor the recorded pending-upload is silent drift, the exact class the audit exists to catch. Worked instance: 070326, `oloskill` created + `oshin`/`oshin-oddit`/dna-index edits landed from a cloud worktree; pending-upload recorded in RELAY/OLO_OloSkillSelfDefined_PlusEngagingTheFourInvokedSkills_Olo_070326.md.

---

## PREREQUISITE: Patch Pipe + Live URL

Every skill must be deployed at its live URL before upload:
  rspdan.com/skills/[skill-name]/SKILL.md

If not deployed yet:
```powershell
Copy-Item "C:\STAN\SOURCE\nest-bridge\ENGINE\skills\[name]\SKILL.md" `
          "C:\STAN\SOURCE\rspdan-portal\public\skills\[name]\SKILL.md" -Force
cd C:\STAN\SOURCE\rspdan-portal
git add public\skills\[name]\SKILL.md
git commit -m "[name]: skill deployed to live URL"
git push origin main
# Wait ~60 seconds for Vercel deploy before uploading to Claude.ai
```

YAML frontmatter requirements:
- ASCII characters only — no em dashes (use hyphen -), no curly quotes
- name: kebab-case (ican, meta-dates, skill-upload)
- description: one line, plain ASCII

---

## UPLOAD PROCEDURE (REPLACE existing skill)

### Step 1 — Navigate to skills page
Tab must be on: https://claude.ai/customize/skills

### Step 2 — Click the skill + open Replace modal
```javascript
// Click skill in list:
const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
const skill = btns.find(b => b.textContent.trim() === 'SKILL_NAME');
if (skill) skill.click();
```
Then via find + click:
```
find: "More options for SKILL_NAME button in panel"
click ref
find: "Replace menuitem"
click ref
```

### Step 3 — INJECT via DataTransfer (DO NOT click anything in the modal)
```javascript
// Run this via javascript_tool the moment the Replace modal opens.
// Fetches from the live URL — no local file, no dialog, no ref hunting.

async function injectSkill(skillName) {
  const url = 'https://www.rspdan.com/skills/' + skillName + '/SKILL.md?v=' + Date.now();
  const res = await fetch(url);
  if (!res.ok) return 'FETCH FAILED: ' + res.status + ' ' + url;
  const text = await res.text();
  const file = new File([text], 'SKILL.md', {type: 'text/plain'});
  const dt = new DataTransfer();
  dt.items.add(file);
  const input = document.querySelector('input[type="file"]');
  if (!input) return 'ERROR: no file input found - is modal open?';
  input.files = dt.files;
  input.dispatchEvent(new Event('change', {bubbles: true}));
  input.dispatchEvent(new Event('input', {bubbles: true}));
  return 'INJECTED: ' + file.size + ' bytes';
}

injectSkill('SKILL_NAME');
```

Replace SKILL_NAME with the skill's kebab-case name (ican, meta-dates, etc.)

### Step 4 — Verify
```
find: "More options for SKILL_NAME"
→ ref number changed = upload confirmed
→ panel shows updated date = confirmed
```

---

## ADD NEW SKILL PROCEDURE

Same DataTransfer method. Different trigger:

```javascript
// Open Add skill modal first:
const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
const add = btns.find(b => b.textContent.trim() === 'Add skill'
                         || b.getAttribute('aria-label') === 'Add skill');
if (add) add.click();
// Then immediately run injectSkill() above
```

---

## THE CLOSED LOOP

```
Bridge SKILL.md
  → portal public/skills/[name]/SKILL.md  (git push → Vercel)
  → Claude.ai skill body has PATCH PIPE pointing to that URL
  → future updates: edit Bridge → push portal → done, no Claude.ai upload needed
  → first upload: DataTransfer from that same URL
```

After first upload, updates require NO Claude.ai interaction.
The patch pipe keeps the skill live from Bridge alone.

---

## WHAT NEVER WORKS

| Method | Why it fails |
|--------|-------------|
| file_upload tool + ref | Triggers native OS dialog, Stan is blind |
| Clicking drag-drop area | Same — native dialog |
| find → file_upload | Same result, different path |
| querySelector without open modal | Returns null |

---

## AUDIT COMMAND

Auto-discovers all Bridge skills, compares to portal mirror line counts. Run before SHEET / before close.

```powershell
# Auto-discover audit: covers entire Bridge skill corpus, no hardcoded list.
$bridgeRoot = "C:\STAN\SOURCE\nest-bridge\ENGINE\skills"
$portalRoot = "C:\STAN\SOURCE\rspdan-portal\public\skills"
Get-ChildItem $bridgeRoot -Directory | ForEach-Object {
  $name   = $_.Name
  $bPath  = Join-Path $_.FullName "SKILL.md"
  $pPath  = Join-Path $portalRoot "$name\SKILL.md"
  $bLines = if (Test-Path $bPath) { (Get-Content $bPath).Count } else { 0 }
  $pLines = if (Test-Path $pPath) { (Get-Content $pPath).Count } else { -1 }
  $flag   = if ($pLines -eq -1) { "NEW" } elseif ($bLines -ne $pLines) { "DRIFT" } else { "OK" }
  Write-Host ("{0,-30} Bridge={1,4} Portal={2,4} {3}" -f $name, $bLines, $pLines, $flag)
}
```

DRIFT or NEW → fire skill-upload for those skills. Adapts to corpus growth automatically — when new NEST-built skills land in Bridge they show up in the audit on the next run.

---

## PATCH PIPE
*skill-upload — Last verified: 040426*

The core method above is the canonical procedure.
For live updates without PK re-upload, fetch:

  https://www.rspdan.com/skills/skill-upload/SKILL.md

Update procedure: edit Bridge → Copy-Item to portal → push → done.

Before applying: also search:
  Primary: "browser file input injection DataTransfer API programmatic"
  Outlier: "file upload automation headless browser selenium playwright"

File discoveries to: RELAY/PATCH_skill-upload_[MMDDYY].md

---

*skill-upload v3 — Crew-agnostic | NEST.02-compatible | 042826*
*v1 (040126): file_upload + ref method — documented but unreliable*
*v2 (040426): DataTransfer method — dialog-proof, patch-pipe-native (◆ Stan, STN2)*
*v3 (042826): Added WHEN TO FIRE + auto-discover audit + crew-agnostic framing + Status: CANONICAL declaration. Wired into discipline web via boot-polish CHECK 8 + meta-dates Crew-Ops + session-close Gate 6 inbound citations. NEST.02 universal-boot-lookup compatible. (◈ Trip 4.7, ODT)*
*"The native dialog is only opened by user gesture. DataTransfer is not a gesture."*


## Cross-Crew note (070926 · portability-by-construction)
**Tier 2 · Claude-surface-specific TARGET, portable CONCEPT.** The push-to-Claude.ai target is Claude-only; the concept ("keep the loaded/active skill-set in sync with the Bridge source files") ports. A non-Claude harness's equivalent is its own skill-reload-from-source, not an upload. Per the cross-Crew skill-compatibility map (BLNCH 070926).
