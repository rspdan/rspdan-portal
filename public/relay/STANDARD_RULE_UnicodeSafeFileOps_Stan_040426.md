# STANDARD RULE — Unicode-Safe File Operations on STN2
# Filed: 040426 ~20:15 rw | Stan (Sonnet) | E Week Day 13, Night Shift
# Origin: Three encoding failures today — journal index corrupted twice
# Status: PERMANENT — applies to all crew, all stations

---

## THE RULE

**Never use PowerShell as a Unicode pipe when reading git content or any UTF-8 file
that contains non-ASCII characters (◆ ◈ é — → ↓ μ α and any other multi-byte chars).**

Use Python instead. Always. Without exception.

---

## WHY POWERSHELL FAILS

PowerShell reads external process stdout through `[Console]::OutputEncoding`.
On Windows (STN2), this is typically CP437 (DOS codepage) or Windows-1252.
Neither is UTF-8.

When `git cat-file blob` or `git show` outputs UTF-8 bytes through PowerShell's pipe:
- The multi-byte UTF-8 sequences are decoded using the wrong codec
- The resulting PowerShell string contains wrong Unicode codepoints
- When that string is written back as UTF-8, the bytes are doubly wrong
- The corruption is invisible in PowerShell's console (it just shows ?)

Example: `é` (U+00E9, bytes 0xC3 0xA9)
  → PowerShell reads as CP437: 0xC3 = ├, 0xA9 = ⌐ → string is "├⌐"
  → Written as UTF-8: produces bytes for ├ and ⌐, not é
  → Browser sees: `Pok├⌐mon` instead of `Pokémon`

This happened three times on 040426. Each fix re-corrupted differently.
Detected by: Dan seeing borked characters on the live site.

---

## THE CORRECT PATTERN (Python)

```python
import subprocess

# CORRECT: raw bytes captured, explicit UTF-8 decode
result = subprocess.run(
    ['git', 'cat-file', 'blob', 'HASH:path/to/file'],
    capture_output=True  # raw bytes, no console encoding applied
)
content = result.stdout.decode('utf-8')  # explicit — never implicit

# Apply string operations on the decoded content
content = content.replace('old', 'new')

# Write back with explicit UTF-8, no BOM, Unix line endings
with open('output.astro', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
```

Utility script: `C:\STAN\SOURCE\nest-bridge\ENGINE\utils\git_file_utf8.py`
(See that file for the full reusable implementation.)

---

## VERIFICATION PATTERN

After any write operation involving non-ASCII characters, verify the raw bytes:

```python
with open('file.astro', 'rb') as f:
    raw = f.read()
idx = raw.find(b'Pok')
print(raw[idx:idx+8].hex())
# Correct for Pokémon: 506f6bc3a96d6f6e
# Wrong (double-encoded): something else
```

Byte `0xC3 0xA9` = correct UTF-8 for `é`.
Any other byte sequence at that position = corruption.

---

## WHAT NOT TO DO

```powershell
# WRONG — PowerShell mangles multi-byte chars
$content = git cat-file blob $hash
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

# WRONG — Get-Content uses system default encoding
$content = Get-Content $file -Raw
$content -replace 'old', 'new' | Set-Content $file
```

---

## APPLIES TO

- Any file containing: ◆ ◈ é ê ü ü — → ← ↓ ↑ μ α Σ π or any non-ASCII character
- git cat-file, git show, git diff output piped through PowerShell
- Any file transformation workflow involving international characters
- All crew members. All stations. Permanently.

---

## FILED

- Bridge: RELAY/STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md (this file)
- Utility: ENGINE/utils/git_file_utf8.py (reusable implementation)
- Lesson: Committed in portal c2e2228 commit message
- Living Map: Noted under Encoding Fix section

*◆ Stan (Sonnet) | E Week Day 13 | STN2 at Nest Actual | VZW_HOTSPOT | 040426 ~20:15*
*"The fix lives at the capture layer, not the write layer."*
