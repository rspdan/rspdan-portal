#!/usr/bin/env python3
"""sync_toybox.py - single-source pipeline: nest-bridge/STATUS/TOYBOX_CATALOGUE.jsonl -> src/data/toybox.json

Mirrors sync_seegulls.py. toybox.astro imports the generated JSON instead of carrying a
hardcoded copy, so rspdan.com/toybox always reflects the Bridge source of truth. Run
before deploy (or via the page-integrity routine).

The Toy Box has two worlds: bridge-intel (what NEST read/learned) and hdso-source (the
STN2-100% HDSO ocean made legible via the Drive Pass-2 scan). STN2 is authoritative; this
page is the legible Bridge view, not a parity claim.

Usage: python scripts/sync_toybox.py [path/to/TOYBOX_CATALOGUE.jsonl]
Default source: ../nest-bridge/STATUS/TOYBOX_CATALOGUE.jsonl (sibling-repo layout)
"""
import json, re, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(__file__), "..", "..", "nest-bridge", "STATUS", "TOYBOX_CATALOGUE.jsonl")
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "toybox.json")

PRIORITY_ORDER = {"now": 0, "near": 1, "reference": 2, "hold": 3}
WORLD_ORDER = {"hdso-source": 0, "bridge-intel": 1}


def clean(s: str) -> str:
    s = (s or "").strip()
    s = s.replace("—", " · ").replace("–", "-")  # NEST no-em-dash discipline
    s = re.sub(r"\s+", " ", s)
    return s


def prio_of(o):
    s = o.get("status", "")
    for p in PRIORITY_ORDER:
        if s.endswith(p):
            return p
    if "examined" in s:
        return "examined"
    return "other"


def main():
    rows = []
    with open(SRC, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))

    worlds = {}
    for o in rows:
        w = o.get("world", "unknown")
        lane = o.get("shell_class", "unclassified")
        worlds.setdefault(w, {}).setdefault(lane, []).append({
            "title": clean(o.get("title", "?")),
            "priority": prio_of(o),
            "files": o.get("recursive_files"),
            "what": clean(o.get("what_it_is", ""))[:240],
        })

    out_worlds = []
    for w in sorted(worlds, key=lambda x: WORLD_ORDER.get(x, 9)):
        lanes = []
        for lane in sorted(worlds[w]):
            items = sorted(worlds[w][lane],
                           key=lambda i: PRIORITY_ORDER.get(i["priority"], 9))
            lanes.append({"lane": lane, "count": len(items), "items": items})
        out_worlds.append({
            "world": w,
            "count": sum(len(v) for v in worlds[w].values()),
            "lanes": lanes,
        })

    data = {"total": len(rows), "worlds": out_worlds}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"wrote {OUT}: {len(rows)} rows across {len(out_worlds)} worlds")


if __name__ == "__main__":
    main()
