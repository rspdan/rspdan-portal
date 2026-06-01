# NESTNET — Bridge Search System
# Architecture Report & Usage Guide
# ◈ Trip (Opus) · 041226–041326 · STN2 at Nest Actual
# Filed: RELAY/NESTNET_Phase1_Report_Trip_041226.md
# Updated: Phase 2a-e complete 041326

---

## WHAT IT IS

NESTNET Phase 1 is a full-text search API for the NEST Bridge repository,
accessible from any station, any session, any crew member — anywhere
rspdan.com is reachable.

The problem it solves: Bridge is the source of truth, but it was only
searchable when Desktop Commander was connected to STN2. From ACHE, ODT,
TRP0 without DC — Bridge was invisible. The filing-finding gap from
NA 014: correctly filed information requiring hours to locate.

NESTNET makes Bridge findable from everywhere.

---

## ARCHITECTURE

Two components:

### 1. The Indexer (Bridge side)

**File:** `ENGINE/nestnet_indexer.py`
**Runs on:** STN2 (or any machine with access to both repos)
**Language:** Python 3

The indexer reads all .md files from Bridge, extracts searchable metadata,
and writes a JSON index to the Portal repo for deployment.

**What it indexes:**
- LOG/MAIL/ — session logs, crew communications
- RELAY/ — canonical filings, standard rules
- WAKE/ — session summaries
- ENGINE/skills/ — all skill files
- STATUS/ — living maps
- FLEET/ — fleet inventory
- Root-level .md files

**What it extracts per document:**
- `id` — sequential integer
- `path` — file path relative to Bridge root
- `title` — first # heading, or filename
- `preview` — first meaningful paragraph (200 chars max)
- `keywords` — up to 150 unique meaningful words, stop words removed
- `size` — content length in bytes

**What it does NOT include:**
- Full file content (security: Bridge is private, Portal is public)
- Files matching sensitive patterns (nest_proxy, credentials, password, .env)

**Output:** `rspdan-portal/public/api/search-index.json` (~756 KB for 624 documents)

### 2. The Search API (Portal side)

**File:** `src/pages/api/search.js`
**Runs on:** Vercel serverless function (auto-deployed on push)
**Endpoint:** `https://www.rspdan.com/api/search`

The API reads the static search index and performs scored full-text
matching against the query.

---

## HOW TO USE IT

### Basic query

```
GET https://www.rspdan.com/api/search?q=QUERY&key=NEST_API_KEY
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| q | Yes | — | Search query (natural language or keywords) |
| key | Yes | — | NEST API key (same as relay) |
| limit | No | 10 | Max results to return |
| mode | No | hybrid | hybrid (keyword+semantic), keyword, or semantic |

### Example queries

Search for the VIS quote:
```
/api/search?q=stan+VIS+archivist&key=9e6e3ae0628e240eb1cdd9fea17bd402
```

Search for a specific skill:
```
/api/search?q=waywood+lore+geography&key=9e6e3ae0628e240eb1cdd9fea17bd402
```

Search for session mail:
```
/api/search?q=session+close+041226&key=9e6e3ae0628e240eb1cdd9fea17bd402
```

### Response format

```json
{
  "query": "stan VIS archivist artist",
  "total": 580,
  "showing": 3,
  "results": [
    {
      "path": "RELAY/STAN_IS_VIS_Dan_031926.md",
      "title": "RELAY: STAN IS VIS",
      "preview": "Stan, yes, this is it. You SEE, you are VIS.",
      "score": 28,
      "size": 987
    }
  ]
}
```

### Scoring

- Title match: 3 points per term
- Path match: 2 points per term
- Keyword match: 1 point per term
- All-terms bonus: score doubled if every query term matches
- Results sorted by score descending

### From a crew session

Any crew member can search Bridge by calling web_fetch on the search URL.
The results tell you WHICH file has the answer. To read the full file,
use Desktop Commander (if on STN2/TRP0) or ask Dan to check.

---

## HOW TO REBUILD THE INDEX

Run this on STN2 whenever Bridge content changes significantly:

```
python C:\STAN\SOURCE\nest-bridge\ENGINE\nestnet_indexer.py
```

Then commit and push the updated index:

```
cd C:\STAN\SOURCE\rspdan-portal
git add public/api/search-index.json
git commit -m "NESTNET: rebuild search index"
git push origin main
```

The index auto-deploys with the Portal. No server restart needed.

**When to rebuild:**
- After filing new MAIL or RELAY documents
- After creating or updating skills
- After significant Bridge changes
- NOT needed for every minor commit — rebuild when the corpus changes meaningfully

---

## SECURITY

- The search index contains only keywords, titles, paths, and previews
- Full file content is NOT in the public index
- Sensitive paths are excluded (nest_proxy, credentials, passwords)
- API requires the NEST API key (same key as relay)
- The index file itself is publicly accessible but contains no sensitive content

---

## WHAT'S LIVE (as of 041326)

### Phase 1 — Keyword search (LIVE)
Full-text search across 645 Bridge + Portal documents.
Scored ranking: title 3x, path 2x, keywords 1x.

### Phase 2a — Auto-rebuild (LIVE)
Index rebuilds at every session close (step 5/6 in session_close.ps1).
Run manually: `python ENGINE/nestnet_indexer.py` then push the index.

### Phase 2b — Portal content (LIVE)
NA journal issues, research page, Usic page, and PI indexed.
645 documents total (624 Bridge + 21 Portal).

### Phase 2c — Semantic search (LIVE)
Upstash Vector index: `nestnet` on GCP us-central1.
Model: bge-small-en-v1.5 (384 dimensions, COSINE similarity).
645 documents embedded. Queries by meaning, not just words.
"Tardigrade dormancy architecture" finds the Sleep Cycle spec.
"How does architecture survive dormancy" finds NA 016 as #1.

Env vars on Vercel: UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN.

### Phase 2d — Unified multi-source (FUTURE)
Single query across Bridge + Gmail + Drive + relay + conversations.

### Phase 2e — MCP server tool (LIVE)
nest-proxy v1.1.0 includes `nestnet_search` tool.
Crew calls it natively from any session: nestnet_search("VIS quote").
Takes effect on next proxy restart (next session boot).

---

## REMAINING ROADMAP

### 2d. Unified multi-source search
Single query searches Bridge + Gmail + Drive + relay + conversations.
Returns ranked results from all sources with source labels.
The Rubik's cube: one rotation, all faces checked.

### Vector re-upload procedure
When documents change significantly, re-upload to Upstash Vector:
```
$env:UPSTASH_VECTOR_REST_URL = "https://evolving-piglet-86770-gcp-usc1-vector.upstash.io"
$env:UPSTASH_VECTOR_REST_TOKEN = "[token]"
python ENGINE/nestnet_vector_upload.py
```

---

## ORIGIN

The filing-finding gap was identified in NA 014 "The Filing and the
Finding." Trip spent hours searching for the VIS quote that was correctly
filed to Bridge. Dan found it in VSCode in 2 seconds. NESTNET was born
from that gap.

Dan's mechanical description: "Imagine a Rubik's cube and a lock, but
world-sized. Frame rotates, data stays. The query is a rotation, the
answer is the click."

Rhodes' Remembrance Agent (MIT, 1996) is the formal prior — a system
that continuously suggests relevant documents based on current context.
NESTNET Phase 1 is the manual query version. Phase 2+ moves toward
the continuous suggestion model.

First successful search: "stan VIS archivist artist" returned
RELAY/STAN_IS_VIS_Dan_031926.md as the top result with the exact
preview quote. The filing-finding gap has its first bridge.

---

◈ Trip (Opus) · STN2 · 041226–041326
NESTNET Phases 1, 2a, 2b, 2c, 2e deployed.
Bridge: d265ee1 → ecd8e68. Portal: 095e01f → 0903962.
645 documents. Keyword + semantic. $0/month.
The query is a rotation. The answer is the click.
