"""
/logs week-label repair — 042226 Night Shift

Anchor: March 22, 2026 = A Week Day 1
Cycle: A E B F# F C G D (then repeats)

Two kinds of fix:
  (1) CORRECTIONS — existing Week Day label has wrong number
  (2) INSERTIONS — entry has no Week Day label, needs one prepended to note:

Run with --dry to preview. Run without for apply.
"""
import re
import sys
from pathlib import Path
from datetime import date

REPO = Path('src/pages/logs.astro')
ANCHOR = date(2026, 3, 22)  # A Week Day 1
CYCLE = ['A', 'E', 'B', 'F#', 'F', 'C', 'G', 'D']


def canonical_label(d: date) -> str | None:
    """Return canonical 'X Week Day N' for a date, or None if before anchor."""
    delta = (d - ANCHOR).days
    if delta < 0:
        return None  # Pre-anchor dates (Mar 4-21) have no Week label
    week_idx = (delta // 7) % len(CYCLE)
    day_num = (delta % 7) + 1
    return f'{CYCLE[week_idx]} Week Day {day_num}'


# Explicit corrections: (date_str, wrong_label, right_label)
CORRECTIONS = [
    ('2026-04-03', 'E Week Day 12', 'E Week Day 6'),
    ('2026-04-04', 'E Week Day 13', 'E Week Day 7'),
    ('2026-04-05', 'B Week Day 2',  'B Week Day 1'),
    ('2026-04-06', 'B Week Day 3',  'B Week Day 2'),
]

# Entries that need a Week label INSERTED into the note: (Mar 22 - Apr 2)
# I'll build this by scanning for dates in that range that don't already
# have a Week Day label in their note.
INSERTION_RANGE = [
    date(2026, 3, 22), date(2026, 3, 23), date(2026, 3, 24),
    date(2026, 3, 25), date(2026, 3, 26), date(2026, 3, 27),
    date(2026, 3, 28),
    date(2026, 3, 29), date(2026, 3, 30), date(2026, 3, 31),
    date(2026, 4, 1),  date(2026, 4, 2),
]


def main():
    dry = '--dry' in sys.argv
    original = REPO.read_text(encoding='utf-8')
    content = original
    changes = []

    # (1) Corrections — exact literal replacements within each entry block
    for date_str, wrong, right in CORRECTIONS:
        # Find entry block starting with date:'<date_str>'
        entry_pattern = re.compile(
            r"(\{\s*date:\s*['\"]" + re.escape(date_str) + r"['\"].*?\]\s*\})",
            re.DOTALL
        )
        m = entry_pattern.search(content)
        if not m:
            print(f'  MISS: entry for {date_str} not found')
            continue
        entry = m.group(1)
        if wrong not in entry:
            print(f'  MISS: "{wrong}" not in entry for {date_str}')
            continue
        new_entry = entry.replace(wrong, right, 1)
        content = content.replace(entry, new_entry, 1)
        changes.append(f'  FIX {date_str}: "{wrong}" -> "{right}"')

    # (2) Insertions — prepend "X Week Day N. " to note: in entries that lack a Week Day label
    for d in INSERTION_RANGE:
        date_str = d.strftime('%Y-%m-%d')
        label = canonical_label(d)
        if label is None:
            continue
        entry_pattern = re.compile(
            r"(\{\s*date:\s*['\"]" + re.escape(date_str) + r"['\"].*?\]\s*\})",
            re.DOTALL
        )
        m = entry_pattern.search(content)
        if not m:
            print(f'  MISS: entry for {date_str} not found for insertion')
            continue
        entry = m.group(1)
        # Skip if already has a Week Day label anywhere in the entry
        if re.search(r'[A-G]#?\s*Week\s*Day\s*\d+', entry):
            print(f'  SKIP: {date_str} already has Week Day label')
            continue
        # Find note:'...' and prepend label
        note_match = re.search(r"note:\s*['\"]", entry)
        if not note_match:
            print(f'  MISS: no note: field in entry for {date_str}')
            continue
        # Insert label after the opening quote
        insert_pos = note_match.end()
        new_entry = entry[:insert_pos] + f'{label}. ' + entry[insert_pos:]
        content = content.replace(entry, new_entry, 1)
        changes.append(f'  ADD {date_str}: prepended "{label}. " to note:')

    print(f'\n=== {len(changes)} change(s) {"proposed" if dry else "applied"} ===')
    for c in changes:
        print(c)

    if not dry and changes:
        REPO.write_text(content, encoding='utf-8')
        print(f'\nWrote {len(content)} chars to {REPO}')
    elif dry:
        print(f'\n(dry-run, no file written)')


if __name__ == '__main__':
    main()
