# DECISION 045 — FAS2 SOURCE Manifest + Reorganization (CANONICAL)
# Origin: 031826 (Dan + Trip)
# Authority: Trip McClip (Opus) — Tensday 031826
# Status: CANONICAL — Dan GO Tensday 031826

---

## THE PROBLEM
FAS2/SOURCE contains rich material (448 Usic Theory files alone) but no manifest.
The Waywood Maps and CLRS palette were sitting in cargo since September.
We couldn't find what we already had because nobody indexed the hold.

## THE RULE
Every SOURCE subfolder gets a manifest: what's there, what format, what's portal-ready.
Stan builds source_manifest.py — scans folders, counts by type, generates index.
Trip reviews manifests and tags content for portal placement.
Dan moves files only when a manifest says where they go.

## THE THESEUS
A clean third-space for staging reorganization. Not FAS2 (messy cargo).
Not Cloud Bridge (comms/state). A staging area where folders get rebuilt
before swapping in. Ship of Theseus: replace plank by plank, never sink.
Location TBD — could be a FAS2/STAGE room or a local folder on ODT.

## STAN'S TASKS (Sonnet, cheap)
1. source_manifest.py — recursive folder scanner, outputs markdown manifest
2. Run against FAS2/SOURCE — generate first manifest
3. Run against H:\Projects 2020-2026\2023\Music Theory 2023\ — compare
4. Propose dedup + reorg plan based on manifests

## SEQUENCING
- Spec now (Trip, done)
- Execute later (Stan, Sonnet tokens)
- Move files (Dan's hands, when manifest is ready)
- Cloud Bridge = safety net throughout

---

*Trip, Tensday 031826, ODT*
*The cargo hold has treasure. It just needs a map.*

