"""
Detect and fix the `â€"` mojibake in Astro journal files.

Pattern: the original em dash U+2014 (—) was encoded as UTF-8 bytes E2 80 94,
then at some point interpreted as Windows-1252 (→ 'â€"'), then re-encoded as
UTF-8. The file now contains the 8-byte mojibake sequence:
    C3 A2  E2 82 AC  E2 80 9C  (â + € + U+201C left-double-quote)
Fix: replace with &mdash; HTML entity so the rendered <title> tag shows —.

Per STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md: Python only, explicit UTF-8,
raw bytes, no PowerShell pipe.

Usage:
    python scripts/fix_mojibake.py                 # fix all .astro in src/pages/
    python scripts/fix_mojibake.py --dry           # dry-run, show hits without writing
    python scripts/fix_mojibake.py path/to/file.astro
"""
import os, sys

# The mojibake from em-dash U+2014 (UTF-8: E2 80 94) read as Windows-1252
# then re-encoded UTF-8. CP1252: 0xE2=â, 0x80=€, 0x94=U+201D (" right double quote).
# Re-encoded bytes: C3 A2  E2 82 AC  E2 80 9D.
# Defense-in-depth: also match the en-dash variant (0x93 -> U+201C left double quote).
MOJIBAKE_EMDASH = b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9d'  # â€" from — (U+2014)
MOJIBAKE_ENDASH = b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9c'  # â€" from – (U+2013)
REPLACEMENTS = [
    (MOJIBAKE_EMDASH, b'&mdash;'),
    (MOJIBAKE_ENDASH, b'&ndash;'),
]

def scan(path):
    with open(path, 'rb') as f:
        data = f.read()
    hits = []
    for moji, repl in REPLACEMENTS:
        i = 0
        while i < len(data) - len(moji) + 1:
            if data[i:i+len(moji)] == moji:
                line_no = data[:i].count(b'\n') + 1
                hits.append((i, line_no, moji, repl))
                i += len(moji)
            else:
                i += 1
    hits.sort()
    return data, hits

def fix(path, dry_run=False):
    data, hits = scan(path)
    if not hits:
        print(f'  CLEAN: {path}')
        return False
    print(f'  {len(hits)} mojibake hit(s) in {path}:')
    for offset, line_no, moji, _ in hits:
        context = data[max(0,offset-30):offset+20].decode('utf-8', errors='replace')
        print(f'    line {line_no} [{moji.hex()}]: ...{context!r}')
    if dry_run:
        return True
    new_data = data
    for moji, repl in REPLACEMENTS:
        new_data = new_data.replace(moji, repl)
    for moji, _ in REPLACEMENTS:
        if moji in new_data:
            print(f'  ERROR: still contains mojibake {moji.hex()} after replace')
            return False
    with open(path, 'wb') as f:
        f.write(new_data)
    with open(path, 'rb') as f:
        check = f.read()
    for moji, _ in REPLACEMENTS:
        if moji in check:
            print(f'  POST-VERIFY FAIL on {path}: {moji.hex()} still present')
            return False
    print(f'  FIXED + VERIFIED: {path} ({len(hits)} replacements)')
    return True

if __name__ == '__main__':
    dry = '--dry' in sys.argv
    targets = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not targets:
        targets = []
        for root, _, files in os.walk('src/pages'):
            for fn in files:
                if fn.endswith('.astro'):
                    targets.append(os.path.join(root, fn).replace('\\', '/'))
    print(f'Scanning {len(targets)} file(s)...')
    dirty = 0
    for t in targets:
        if fix(t, dry_run=dry):
            dirty += 1
    print(f'\nSummary: {dirty} file(s) with mojibake {"(dry-run, no changes)" if dry else "fixed"}')
    sys.exit(1 if dry and dirty > 0 else 0)
