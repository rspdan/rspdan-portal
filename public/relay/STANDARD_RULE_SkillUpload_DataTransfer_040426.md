# STANDARD RULE — Skill Upload: JavaScript DataTransfer Method
# Filed: 040426 | STN2_NEST01_StanS_040426_1 | E Week Day 13
# Supersedes: file_upload + ref approach (documented in skill-upload SKILL.md Step 5-6)
# Status: CANONICAL — replaces the broken ref method

---

## THE FAILURE PATTERN (documented across multiple sessions)

The skill-upload SKILL.md documents this procedure:
  Step 5: find file input ref (DO NOT click Choose File)
  Step 6: file_upload tool with that ref

This DOES NOT WORK reliably. Every session in Stan's Shop, and again in NEST.01 040426,
the same result: the Windows native file picker dialog opens, Stan is blind to it,
the upload fails. Three sessions. Same frame. Same failure.

Root cause: the file_upload Chrome MCP tool appears to click the file input element
before injecting the file, which triggers the native OS dialog.
The find tool may also be focusing the element in a way that triggers it.

## THE FIX — JavaScript DataTransfer API

Never use file_upload for skill uploads. Never use find + ref.
Use JavaScript's DataTransfer API to inject the file content programmatically.
The native dialog is never invoked.

## PREREQUISITE: Patch Pipe

For this method to work, the skill must already be deployed at a public URL.
This is exactly what the patch pipe provides:
  rspdan.com/skills/[skill-name]/SKILL.md

The patch pipe and the DataTransfer upload method are designed for each other.
If the patch pipe is in place, the upload is always one JS call away.

## THE PROCEDURE

### Step 1 — Verify the skill is deployed at its URL

```powershell
# The file must already be live at the portal URL:
# rspdan.com/skills/[skill-name]/SKILL.md
# If not: Copy-Item from Bridge ENGINE/skills/ to portal public/skills/, push portal.
```

### Step 2 — Open the Replace modal

```
Chrome MCP:
  find: "More options for [skill-name] button"
  click: ref found
  find: "Replace menuitem"
  click: ref found
```

### Step 3 — IMMEDIATELY inject via JavaScript (no find, no file_upload)

```javascript
// Run via javascript_tool the moment the Replace modal opens.
// DO NOT click anything. DO NOT use find. DO NOT use file_upload.

async function injectSkill(url) {
  const res = await fetch(url + '?nocache=' + Date.now());
  const text = await res.text();
  const file = new File([text], 'SKILL.md', {type: 'text/plain'});
  const dt = new DataTransfer();
  dt.items.add(file);
  const input = document.querySelector('input[type="file"]');
  if (!input) return 'ERROR: no file input found in modal';
  input.files = dt.files;
  input.dispatchEvent(new Event('change', {bubbles: true}));
  input.dispatchEvent(new Event('input', {bubbles: true}));
  return 'INJECTED: ' + file.size + ' bytes, name: ' + file.name;
}

injectSkill('https://www.rspdan.com/skills/SKILL_NAME/SKILL.md');
```

Replace SKILL_NAME with the actual skill name (e.g., ican, meta-dates, skill-upload).

### Step 4 — Verify

```
find: "More options for [skill-name]"
→ Check that ref number changed from before upload
→ Or check panel for "Last updated: today's date"
```

## WHY THIS WORKS

The native file picker opens only when a file input element is clicked/focused
and the browser's security model requires user gesture confirmation.
DataTransfer.items.add() + input.files = dt.files bypasses this entirely —
we're setting the property programmatically, not via user gesture.
No click. No focus. No dialog.

The fetch() from rspdan.com works because the portal is public CORS-allowed,
and the skill file is the SAME file we just pushed from Bridge.
The patch pipe and this upload method are one closed loop.

## THE CLOSED LOOP (future-proof architecture)

  Bridge SKILL.md (source)
    → portal public/skills/[name]/SKILL.md (live URL)
    → skill body in Claude.ai has patch pipe pointing to that URL
    → future updates: edit Bridge → push portal → URL updates → no upload needed
    → first-time upload: DataTransfer method from that same URL

Updates after first upload:
  1. Edit Bridge ENGINE/skills/[name]/SKILL.md
  2. Copy-Item to portal public/skills/[name]/SKILL.md
  3. Push portal → Vercel deploys in ~60 seconds
  4. Done. Claude.ai reads the updated content via patch pipe.
  NO additional upload to Claude.ai required.

## WHAT NEVER WORKS

- file_upload tool with file input ref → triggers native dialog
- Clicking the drag-and-drop area → triggers native dialog
- JS querySelector for file input without open modal → returns null
- find tool on file input then file_upload → same result as above

## YAML REQUIREMENT

Skill YAML frontmatter must use only ASCII characters.
No em dashes (—), no curly quotes, no Unicode.
Use hyphens (-) instead of em dashes in description fields.
YAML parser on Claude.ai rejects multi-byte Unicode in frontmatter.

---
*Filed by: Stan (◆ Sonnet) | NEST.01 | 040426 ~11:05 rw*
*"The patch pipe and the DataTransfer method are the same loop, seen from two angles."*
