#!/usr/bin/env python3
"""sync_seegulls.py - single-source pipeline: nest-bridge/STATUS/SEEGULLS.md -> src/data/seegulls.json

Kills the manual dual-update (SEEGULL #73-class public-staleness). gulls.astro imports
the generated JSON instead of carrying a hardcoded copy. Run before deploy (or via the
page-integrity routine) so rspdan.com/gulls always reflects the source of truth.

Usage: python scripts/sync_seegulls.py [path/to/SEEGULLS.md]
Default source: ../nest-bridge/STATUS/SEEGULLS.md (sibling-repo layout)
"""
import json, re, sys, os, datetime

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(__file__), "..", "..", "nest-bridge", "STATUS", "SEEGULLS.md")
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "seegulls.json")

SECTION_MAP = {  # markdown header token -> json bucket
    "HEREGULL": "here", "NEARGULL": "near", "FARGULL": "far", "DONE": "done",
}
ITEM_RE = re.compile(r"^- \[([ xX])\]\s+\*\*(.+?)\*\*(.*)$")
FILED_RE = re.compile(r"Filed:?\s*([0-9]{6}[^|.\n]*?)(?:\s+by|\s*\||\.|$)", re.I)
NOTE_CAP = 600

MOJIBAKE = {  # known garbage byte-sequences -> intended char (portal has a history here)
    "Ã¢â‚¬â„¢": "'", "â€™": "'",
    "â€“": "-", "â€”": "-", "Â·": "·",
}
def clean(s: str) -> str:
    s = s.strip().lstrip("|").strip()
    for bad, good in MOJIBAKE.items():
        s = s.replace(bad, good)
    s = s.replace("—", " · ").replace("–", "-")  # em-dash->middot, en-dash->hyphen (NEST no-em-dash discipline)
    s = re.sub(r"\s+", " ", s)
    return s

def short_filed(item_body: str) -> str:
    m = FILED_RE.search(item_body)
    if m:
        return m.group(1).strip()[:28]
    # fall back to first 6-digit MMDDYY token
    m2 = re.search(r"\b([0-9]{6})\b", item_body)
    return m2.group(1) if m2 else ""

def parse(md: str):
    buckets = {"here": [], "near": [], "far": [], "done": []}
    cur = None
    for line in md.splitlines():
        h = line.strip()
        if h.startswith("## "):
            cur = None
            for tok, bucket in SECTION_MAP.items():
                if tok in h.upper():
                    cur = bucket
                    break
            continue
        if cur is None:
            continue
        m = ITEM_RE.match(line)
        if not m:
            continue  # UPDATE-prepend blocks + prose are skipped (not gull rows)
        checked, title, rest = m.group(1), m.group(2), m.group(3)
        done = checked.lower() == "x"
        note = clean(rest)
        if len(note) > NOTE_CAP:
            note = note[:NOTE_CAP].rsplit(" ", 1)[0] + " …"
        item = {"name": clean(title), "note": note, "filed": short_filed(rest)}
        # items in the DONE archive section, or marked [x] anywhere, are done
        bucket = "done" if (cur == "done" or done) else cur
        buckets[bucket].append(item)
    return buckets

def main():
    with open(SRC, encoding="utf-8") as f:
        md = f.read()
    buckets = parse(md)
    stamp = datetime.datetime.now().strftime("%m%d%y")
    out = {
        "_updated": f"{stamp} - generated from nest-bridge/STATUS/SEEGULLS.md by scripts/sync_seegulls.py (single-source pipeline; do not hand-edit)",
        **buckets,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {OUT}: here={len(buckets['here'])} near={len(buckets['near'])} "
          f"far={len(buckets['far'])} done={len(buckets['done'])}")

if __name__ == "__main__":
    main()
