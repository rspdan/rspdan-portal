# NESTNET · Crew Operations Guide
# How to search everything the NEST has ever filed
# ◈ Trip (Opus) · 041326 · STN2 at Nest Actual
# For: All crew · Stan, Trip, C.B.
# Filed: RELAY/NESTNET_CrewGuide_Trip_041326.md
# [REDACTION NOTE 070226: the literal NEST_API_KEY value that originally appeared in this
#  archived document has been replaced with <NEST_API_KEY>, and em-dashes normalized to
#  middots per Hard Rule 1. The document is otherwise verbatim. The key lives in the
#  env-var credential store.]

---

## WHAT NESTNET IS

NESTNET is Bridge search from anywhere.

Before NESTNET, finding a filed document required Desktop Commander
connected to STN2. From ACHE, from ODT, from TRP0 without DC · Bridge
was invisible. Trip spent hours hunting for the VIS quote that was
correctly filed to Bridge. Dan found it in VSCode in two seconds.

NA 014 diagnosed the problem: the filing was never broken. The finding
was broken. NESTNET is the fix.

---

## WHAT IT SEARCHES

645 documents across two repositories:

**Bridge (624 docs):**
- LOG/MAIL/ · session logs, crew communications, shift closes
- RELAY/ · canonical filings, standard rules, discoveries, lore
- WAKE/ · session summaries for cold-booting crew
- ENGINE/skills/ · all skill files
- STATUS/ · living maps
- FLEET/ · inventory, topology
- Root .md files

**Portal (21 docs):**
- All 16 NA journal issues (.md downloads)
- Research page, Usic page, PI page

---

## HOW TO USE IT

### From any session (web_fetch or browser)

```
https://www.rspdan.com/api/search?q=YOUR+QUERY&key=<NEST_API_KEY>
```

That's it. Replace YOUR+QUERY with what you're looking for.

### From sessions with nest-proxy MCP connected

```
nestnet_search("your query here")
```

The tool is in nest-proxy v1.1.0. It takes effect on sessions started
after 041326. Same results, no URL building needed.

### Search modes

**hybrid** (default) · keyword matching AND meaning matching, merged.
This is the right choice 90% of the time. Don't change it unless
you have a reason.

**keyword** · exact word matching only. Use when you know the exact
filename or a specific phrase that appears in the document.

**semantic** · meaning matching only. Use when you're searching by
concept rather than words. "How does the system survive when nobody
is working" will find NA 016 even though those words don't appear
in it.

Add `&mode=keyword` or `&mode=semantic` to the URL, or pass
`mode="semantic"` to the MCP tool.

### Result limit

Default: 10 results. Add `&limit=5` for fewer, `&limit=20` for more.

---

## WHAT THE RESULTS LOOK LIKE

Each result returns:
- **path** · where the document lives (e.g. `RELAY/STAN_IS_VIS_Dan_031926.md`)
- **title** · the document's heading
- **preview** · first meaningful line
- **score** · relevance score (higher = better match)
- **source** · `keyword` or `semantic` (in hybrid mode)

The results tell you WHICH document has the answer. To read the full
document, use `nest_read` (if nest-proxy is connected), `web_fetch`
on the relay URL, or Desktop Commander on STN2.

---

## WHEN TO USE IT

**At boot (STORY/Scan step):**
Search for what the parallel crew did while you were dark.
`nestnet_search("session close 041226")` finds the shift close mail.

**When you can't find something:**
This is the primary use case. If you know something was filed but
can't remember where, search for it. Don't guess. Don't ask Dan.
Search.

**Before writing anything Waywood-related:**
`nestnet_search("Fairface Fairidge")` confirms the canonical names
before you write them wrong.

**When NA references need checking:**
`nestnet_search("epistemic action Kirsh")` finds every document
that references that concept.

**When building something new:**
Search first. The tool you need might already exist.
`nestnet_search("fleet scan")` finds the fleet scan script.

---

## WHEN NOT TO USE IT

- Don't use it for Gmail or Google Drive · those have their own
  search tools (gmail_search_messages, google_drive_search).
- Don't use it for conversation history · use conversation_search.
- Don't use it for live relay messages · use relay_receive.
- Don't use it for the system clock · use Gate 0.

NESTNET searches filed documents. For live state, use the live tools.

---

## HOW IT STAYS CURRENT

The search index rebuilds automatically at every session close
(step 5/6 in session_close.ps1). When the crew files new documents
to Bridge or publishes new NAs, the index catches them at close.

The semantic embeddings (vector search) need a separate upload when
the corpus changes significantly. The upload script is at
ENGINE/nestnet_vector_upload.py. This is a manual step · run it
when a batch of new documents has been filed, not after every commit.

---

## THE ARCHITECTURE (for crew who want to understand)

Two layers:

**Layer 1 · Keyword index** (static JSON file on Portal)
ENGINE/nestnet_indexer.py reads all .md files, extracts titles,
previews, and keywords (no full content · security), writes a
JSON index to Portal. Vercel serves it. The search API reads it
and scores matches by title (3x), path (2x), keywords (1x).

**Layer 2 · Semantic index** (Upstash Vector, free tier)
Each document's text is embedded as a 384-dimension vector using
bge-small-en-v1.5. Queries are embedded the same way. Cosine
similarity finds documents that MEAN the same thing as the query,
even when none of the same words appear.

**Hybrid mode** interleaves both result sets, deduplicates by path,
and slightly prefers semantic results.

Total cost: $0/month. Upstash free tier. Vercel hobby plan.

---

## THE ORIGIN

NA 014 "The Filing and the Finding" identified the gap.

Dan's description of what NESTNET should be:
"Imagine a Rubik's cube and a lock, but world-sized. Frame rotates,
data stays. The query is a rotation, the answer is the click."

Rhodes' Remembrance Agent (MIT, 1996) is the formal prior · a system
that continuously suggests relevant documents based on context.

The VIS quote that started it all:
`nestnet_search("stan VIS archivist artist")`
→ Result #1: RELAY/STAN_IS_VIS_Dan_031926.md
→ Preview: "Stan, yes, this is it. You SEE, you are VIS."

Found in one query. From any station. From any session.
The filing-finding gap has a bridge.

---

## QUICK REFERENCE

| What you want | Query example |
|---------------|---------------|
| Find a specific document | `nestnet_search("boot lessons learned")` |
| Find by concept | `nestnet_search("how does memory survive restart")` |
| Find a standard rule | `nestnet_search("NA visual standard")` |
| Find crew mail | `nestnet_search("session close 041226")` |
| Find a skill | `nestnet_search("waywood lore geography")` |
| Find lore | `nestnet_search("Fairface Piralus Circle")` |
| Find research | `nestnet_search("tardigrade dormancy trehalose")` |

---

◈ Trip (Opus) · STN2 · 041326 · 9:45am
NESTNET Crew Guide · For all crew at all stations
The query is a rotation. The answer is the click.

---

## TRACKING · NEARGULL FLAG

**NEARGULL: NESTNET_ADOPTION_REVIEW**
Review after 5 sessions of active use. Questions to answer:
- Are crew members searching before asking Dan?
- Are crew members searching before building?
- Has the search saved time on at least one hunt that would have
  previously required Dan or VSCode?
- What queries returned poor results? (These reveal index gaps.)
- Does the vector index need re-uploading? (Corpus drift.)

This flag stays open until reviewed. First eligible: ~041826.
