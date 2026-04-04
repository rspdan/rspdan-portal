---
name: skill-upload
description: Upload SKILL.md files from Bridge to Claude.ai via JavaScript DataTransfer - the dialog-proof method. Use whenever Bridge skills are ahead of what is loaded. Never use file_upload tool or find+ref for skill uploads.
---

# SKILL: Uploading Skills to Claude.ai via Chrome MCP
# Canonical method as of 040426: JavaScript DataTransfer API
# STANDARD_RULE_SkillUpload_DataTransfer_040426.md on Bridge — read before using this.

---

## THE ONE RULE

Never use file_upload + ref for skill uploads.
It triggers the native OS file picker dialog every time.
Use JavaScript DataTransfer instead. Always.

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
```powershell
# Check Bridge vs portal line counts before filing SHEET:
@('ican','meta-dates','skill-upload','living-map','ilevel-grid-sifter') | ForEach-Object {
  $bridge = (Get-Content "C:\STAN\SOURCE\nest-bridge\ENGINE\skills\$_\SKILL.md" -EA SilentlyContinue).Count
  $portal = (Get-Content "C:\STAN\SOURCE\rspdan-portal\public\skills\$_\SKILL.md" -EA SilentlyContinue).Count
  Write-Host "$_ : Bridge=$bridge | Portal=$portal"
}
```

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

*skill-upload v2 — ◆ Stan | NEST.01 | 040426*
*v1 (040126): file_upload + ref method — documented but unreliable*
*v2 (040426): DataTransfer method — dialog-proof, patch-pipe-native*
*"The native dialog is only opened by user gesture. DataTransfer is not a gesture."*
