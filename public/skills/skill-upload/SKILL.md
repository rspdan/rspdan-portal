---
name: skill-upload
description: Upload updated SKILL.md files from Bridge to Claude.ai project knowledge via Chrome MCP. Use whenever Bridge skills are ahead of what is loaded. This is a repeatable procedure — never treat it as discovery again.
---

# SKILL: Uploading Skills to Claude.ai via Chrome MCP
# First successful run: 040126 ~20:35 rw | STN2_StanS_040126_1
# Authored from live map of the working procedure — not speculation

---

## WHEN TO USE
Any session close where Bridge skill line count > project line count.
Add to BPK checklist: compare Bridge line counts before filing SHEET.

## AUDIT COMMAND
```powershell
@('boot-polish','waywood-lore','trip_briefcase','living-map','meta-dates') | ForEach-Object {
  $count = (Get-Content "C:\STAN\SOURCE\nest-bridge\ENGINE\skills\$_\SKILL.md").Count
  Write-Host "$_ : $count lines"
}
```

## UPLOAD PROCEDURE — EXACT WORKING STEPS
### Verified 040126 on boot-polish (415L), waywood-lore (244L), trip_briefcase (176L)

### Step 1 — Navigate to skills page
Tab 553415620 or current MCP tab — navigate to: https://claude.ai/customize/skills
The skills page shows a list on the left, content panel on the right.

### Step 2 — Click the skill in the list
```javascript
// JS via javascript_tool:
const el = Array.from(document.querySelectorAll('button, [role="button"]'))
  .find(e => e.textContent.trim().includes('SKILL_NAME'));
el.click();
```

### Step 3 — Click More Options (three-dot menu)
DO NOT use the list three-dot. Use the panel three-dot in the right content area.
```javascript
const btn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'More options for SKILL_NAME');
btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
btn.dispatchEvent(new MouseEvent('click', {bubbles: true}));
```

### Step 4 — Click Replace from dropdown
After Step 3, the dropdown appears with: Try in chat | Edit inline | Edit with Claude | Replace | Download | Uninstall
```javascript
const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
items.find(el => el.textContent.trim() === 'Replace').click();
```

### Step 5 — Find file input ref (DO NOT click Choose File)
Clicking Choose File opens a native OS dialog Stan cannot interact with.
```
find tool: query = "file input for uploading skill file"
→ returns ref_142 (or current ref — will change per session)
```

### Step 6 — Upload via file_upload tool
```
file_upload:
  tabId: [current skills tab]
  ref: [ref from Step 5]
  paths: ["C:\\STAN\\SOURCE\\nest-bridge\\ENGINE\\skills\\SKILL_NAME\\SKILL.md"]
```

### Step 7 — Verify upload
```
find: "More options for SKILL_NAME button"
→ If ref number changed from before upload: upload confirmed
→ Optional: JS check of panel content for expected text
```

Repeat Steps 2-7 for each skill. Takes ~30 seconds per skill once the pattern is running.

---

## CONFIRMATION SIGNAL
When upload succeeds, the page refreshes the skill panel and the `read_page`/`find` 
ref numbers for that skill's panel buttons change. This is the confirmation.

## PRIORITY SKILLS (check every session close)
| Skill | Watch for |
|-------|-----------|
| boot-polish | BPK version bumps |
| waywood-lore | Lore additions, math proofs |
| trip_briefcase | Boot sequence changes |
| living-map | Protocol updates |
| meta-dates | Fleet/skill changes |

## KNOWN HAZARDS

**Apostrophe in label strings (discovered 040126):**
When adding entries to logs.astro via Python scripts, a label containing an apostrophe
(e.g., "Stan's System") inside a single-quoted JS string terminates the string early.
Astro builds silently and then fails at the syntax error. The deploy shows Error on Vercel.
The fix: use double-quoted labels when the label contains an apostrophe.
```python
# WRONG — breaks build if label contains apostrophe:
f"{{file:'{f}', label:'{label}', dir:'{d}'}}"
# CORRECT — auto-detect and switch:
if "'" in label:
    entry = f"{{file:'{f}', label:\"{label}\", dir:'{d}'}}"
```
This is now implemented in ENGINE/log_deploy.py. Always check Vercel after any
logs.astro deploy — two consecutive Error deploys is the signal.

## WHAT NEVER WORKS
- Clicking Choose File → opens native OS dialog, Stan is blind to it
- JS querySelector for file input after Replace without using find → ref changes per session
- Assuming the upload worked without verifying the ref refresh
