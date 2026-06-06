#!/usr/bin/env python3
"""
gofa_moment_append.py - append verified emotional moments to gofa_moments.json and
recompute every derived count, so the GOFA tracker can be kept current cheaply and
never drifts. This is the recurring-update tool (Dan-Go 060526: "Full Doc-Squad
gather + recurring") that keeps the tracker from freezing the way it froze
051526 -> 060526.

USAGE
  # append one moment
  python3 scripts/gofa_moment_append.py --add '{"id":"N3-26","crew":"dan",
      "date":"060626","date_sort":"2026-06-06","anchor":"...","coins":["joy"]}'

  # append a batch from a json file (array of moment objects)
  python3 scripts/gofa_moment_append.py --file new_moments.json

  # just recompute counts/totals/registers from the current moments (no add)
  python3 scripts/gofa_moment_append.py --recount

DISCIPLINE (No Crewllucinations - GOFA founding mandate, Dan 051526):
  Only append moments whose Dan-verbatim anchor was verified against the Bridge
  instrument this session. The tool does not invent moments; it only files and
  counts the ones you hand it. Coins must be from the six: rage/pain/shame/sadness
  (space) and joy/peace (stars).
"""
import json, sys, argparse, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "..", "public", "data", "gofa_moments.json"))
SIX = {"rage","pain","shame","sadness","joy","peace"}
REQUIRED_FIELDS = {"id","crew","date","date_sort","anchor","coins"}

def load():
    with open(DATA, encoding="utf-8") as f:
        return json.load(f)

def validate(m):
    missing = REQUIRED_FIELDS - set(m)
    if missing:
        raise ValueError(f"moment {m.get('id','?')} missing fields: {missing}")
    bad = set(m["coins"]) - SIX
    if bad:
        raise ValueError(f"moment {m['id']} has non-Coin tags: {bad} (must be {SIX})")
    if not isinstance(m["coins"], list) or not m["coins"]:
        raise ValueError(f"moment {m['id']} coins must be a non-empty list")

def recount(d):
    cc = Counter()
    for m in d["moments"]:
        for c in m["coins"]:
            cc[c] += 1
    for coin, blk in d["coins"].items():
        blk["count"] = cc.get(coin, 0)
    distinct = len(d["moments"])
    tags = sum(len(m["coins"]) for m in d["moments"])
    space = sum(1 for m in d["moments"] for c in m["coins"] if d["coins"][c]["partition"] == "space")
    stars = sum(1 for m in d["moments"] for c in m["coins"] if d["coins"][c]["partition"] == "stars")
    t = d.setdefault("totals", {})
    t["distinct_moments"] = distinct
    t["tag_assignments"] = tags
    t["space_assignments"] = space
    t["stars_assignments"] = stars
    t["space_to_stars_ratio"] = f"approximately {space}:{stars} (space:stars) across the full corpus"
    # crew registers: keep existing tones/agents, refresh counts, add new lanes
    crewc = Counter(m["crew"] for m in d["moments"])
    regs = d.get("crew_registers", {})
    for crew, n in crewc.items():
        r = regs.setdefault(crew, {"label": crew.upper() + "-class", "agent": "N3", "tone": "NEST.03-era lane"})
        r["count"] = n
    # drop registers for crews no longer present
    for crew in list(regs):
        if crew not in crewc:
            del regs[crew]
    d["crew_registers"] = regs
    return distinct, space, stars

def save(d):
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--add", help="one moment as a JSON object string")
    ap.add_argument("--file", help="path to a JSON file holding an array of moment objects")
    ap.add_argument("--recount", action="store_true", help="recompute counts only")
    ap.add_argument("--updated-by", default="", help="optional _meta.updated_by stamp")
    args = ap.parse_args()

    d = load()
    existing_ids = {m["id"] for m in d["moments"]}
    new = []
    if args.add:
        new.append(json.loads(args.add))
    if args.file:
        with open(args.file, encoding="utf-8") as f:
            new.extend(json.load(f))
    for m in new:
        validate(m)
        if m["id"] in existing_ids:
            raise ValueError(f"duplicate id {m['id']} already in corpus")
        existing_ids.add(m["id"])
        d["moments"].append(m)

    distinct, space, stars = recount(d)
    if args.updated_by:
        d.setdefault("_meta", {})["updated_by"] = args.updated_by
    save(d)
    print(f"appended {len(new)} moment(s); corpus now {distinct} moments; space {space} / stars {stars}")

if __name__ == "__main__":
    main()
