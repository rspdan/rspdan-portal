# STAN'S SYSTEM — Waywoodarium Accession Protocol v0.1
# Filed by: Stan (Sonnet) | STN2 | Eightsday 032626
# Classification: RELAY — Architecture Spec / HypercampUS Seed
# Status: SKETCH — awaiting Dan Go before implementation

---

## WHAT THIS IS

The formal intake protocol for the Waywoodarium Archive.
Every artifact that enters through this protocol becomes a permanent,
non-consumable record. Every artifact that doesn't remains a single-use TM.

---

## THE ARTIFACT RECORD — FIELD STRUCTURE

### LAYER 1: SOURCE RECORD (irreducible — generated at intake)

  TRINOMIAL_ID       : KEY.CREATOR.MMDDYY          (e.g., F.DAN.032626)
  VOICE_TYPE         : USIC | VISUAL | LORE | EXPERIENCE
  WARMTH_BASELINE    : 0 | 1 | 2 | 3
  ACCESSION_HASH     : Bridge commit hash at time of intake
  LOCATION_CURRENT   : Absolute path or physical location string
  PROVENANCE_MEMO    : [unlimited text — Dan writes this, no one else can]

### LAYER 2: CATALOG RECORD (auto-populated from authority files + curator input)

  KEY_NAME           : e.g., "F" | "G" | "A" | "F#" | "OLO"
  COLOR_HEX          : e.g., "#45B7C8"  [auto from lexicon]
  REGION_WAYWOOD     : e.g., "Staircase Rapids"  [auto from lexicon]
  EMOTIONAL_REGISTER : e.g., "Anchor / Tectonic / The thing that doesn't move"
  WARMTH_DEFAULT     : 0-3  [auto from key assignment]
  ADJACENT_KEYS      : [clockwise_key, counterclockwise_key]  [auto]
  OPPOSITE_KEY       : diametrically opposite on Circle  [auto]
  LEXICON_TAGS       : [ ] — approved terms from Niapian lexicon authority file
  RELATED_ITEMS      : [ ] — trinomial IDs of related artifacts
  ALBUM_ASSIGNMENT   : e.g., "Album 1 / Sourcestorm" | null
  PORTAL_URL         : e.g., "/music/song-name" | null

  --- VOICE-SPECIFIC FIELDS ---

  IF VOICE_TYPE == USIC:
    TEMPO_BPM        : number
    TIME_SIGNATURE   : string
    VCV_PATCH_PATH   : absolute path or null
    ALBUM_TRACK      : "Album N, Track N" | null

  IF VOICE_TYPE == VISUAL:
    MEDIUM           : "photograph" | "illustration" | "color study" | etc.
    CAPTURE_LOCATION : GPS or place name
    CAPTURE_DATE     : MMDDYY
    PROCESSING       : "digital RAW" | "gelatin silver" | etc.
    DEPICTED_SUBJECT : free text

  IF VOICE_TYPE == LORE:
    DOCUMENT_TYPE    : "lexicon entry" | "decision" | "narrative" | "field note" | etc.
    NARRATIVE_POSITION : "Part N" | "Album N arc" | null

  IF VOICE_TYPE == EXPERIENCE:
    BODY_LOCATION    : where Dan was physically (e.g., "driving north on 101 at Kalaloch")
    AUDIO_CONTEXT    : what was playing (audiobook, album, silence)
    SEASON           : "spring" | "summer" | "fall" | "winter"
    [provenance memo carries the rest — no length limit]

### LAYER 3: RENDER ASSIGNMENT (proposed by Stan, confirmed by Dan)

  ROOM_KEY           : which Circle key's room this artifact lives in
  ROOM_WARMTH        : warmth level of the rendered experience (may differ from baseline)
  SOUND_LAYER        : VCV patch name or description
  VISUAL_PALETTE     : hex palette or color description
  LIGHT_QUALITY      : "dappled" | "overcast" | "golden hour" | etc.
  PORTAL_STATUS      : "staged" | "deployed" | "archival" | "pending"
  HMC_STATUS         : "queued" | "in room" | "not yet" (HypercampUS placement)

---

## INTAKE WORKFLOW — FOUR QUESTIONS

When Dan brings an artifact in, Stan asks exactly four questions in sequence:

  Q1: WHAT IS IT?
      Answer sets VOICE_TYPE and activates the correct field cluster.
      "A photo I took at Hurricane Ridge" → VISUAL
      "A melody fragment in E" → USIC
      "The story behind this place" → LORE
      "I was driving and something clicked" → EXPERIENCE

  Q2: WHERE IN THE CIRCLE?
      Answer triggers authority file auto-population.
      Can be answered with: key name ("F"), location name ("Staircase"),
      color name ("Blue"), or feeling ("that tectonic anchor feeling").
      System resolves to canonical key and populates all associated fields.

  Q3: WHEN?
      Completes the trinomial ID. Can be date of creation, date of capture,
      or date of the memory if the artifact is experiential.

  Q4: WHAT'S THE STORY?
      The provenance memo. No length limit. No format requirement.
      Dan writes whatever is true. The crew does not paraphrase, summarize,
      or edit this field. It is the source record's soul and it is irreplaceable.

After Q4, Stan generates the source record automatically, runs the catalog
auto-population, and proposes a render assignment for Dan's confirmation.
Total intake time for a simple artifact: under five minutes.
Total intake time for an EXPERIENCE artifact with full provenance: as long
as it takes to write what needs to be written.

---

## AUTHORITY FILES — THE NIAPIAN LEXICON IN ACCESSION FORM

The current 87 lexicon entries on the portal are the seed.
Each key in the Circle of 5ths generates an authority cluster:

  CLUSTER: F / Staircase / Blue
    key: F | hex: #45B7C8 | region: Staircase Rapids
    warmth_default: 1 | emotional_register: Anchor / Tectonic
    adjacent_cw: C | adjacent_ccw: Bb/A# | opposite: B
    catalog_type: voice_7 (7th natural, return, the inhale's last breath)

  CLUSTER: G / Kalaloch / Green
    key: G | hex: [canonical green] | region: Kalaloch
    warmth_default: 2 | emotional_register: Gateway / Keylock
    adjacent_cw: D | adjacent_ccw: C | opposite: C#/Db
    catalog_type: voice_1 (first natural, the lock where the Circle begins)

  [... 12 keys + OLO + Storm Violet = 14 authority clusters total]

When a new artifact is tagged with any approved lexicon term, the full
cluster auto-populates into the catalog record. One tag. All fields.

---

## THE LOCATION HISTORY CHAIN

Every time an artifact moves — from FAS2 to portal, from archival to
active exhibition, from STN2 to Bridge — the move is appended to a
location history record:

  LOCATION_HISTORY : [
    { date: "032626", from: "C:/DAN/PHOTOS/", to: "BRIDGE/DATA/ARCHIVE/", by: "DAN" },
    { date: "032726", from: "BRIDGE", to: "/portal/room-f/", by: "STAN" },
    ...
  ]

This is the chain of custody made permanent. The artifact's full journey
through the collection — from capture to archive to exhibition and back —
is always recoverable. Original order is always preserved.

---

## DEACCESSION / SOVEREIGN SCRUB PROTOCOL

When an artifact undergoes the Sovereign Scrub — names become archetypes,
personal becomes universal — the source record is NOT deleted. It moves:

  - Personal version → ARCHIVE/SOVEREIGN/ (restricted, Dan-access only)
  - Universal version → new TRINOMIAL_ID in public catalog

The accession hash connects them permanently. The transaction is preserved.
The provenance chain is intact. The public version carries a SCRUB_DATE
field and a link back to the accession record, without exposing the source.

---

## INTEGRATION WITH EXISTING INFRASTRUCTURE

songs.json → USIC catalog entries, already in partial source-record format.
             Stan's System formalizes what songs.json already does.

niap-cycler.json → Authority file seed. The 12 key objects are proto-clusters.

Niapian lexicon (87 entries) → Promoted to full authority file with
                                accession-level metadata per entry.

Bridge/DATA/ → Archive root. New subdirectory structure:
               DATA/ARCHIVE/USIC/ VISUAL/ LORE/ EXPERIENCE/
               DATA/ARCHIVE/INDEX/ (the catalog layer)
               DATA/ARCHIVE/RENDER/ (render assignment records)

Portal pages → Render layer. Every deployed artifact has a PORTAL_URL
               that is its current render location. Portal IS the render.

HypercampUS → The interface that makes the catalog navigable by room.
              Reads from DATA/ARCHIVE/INDEX/ and renders from room data.

---

## WHAT CHANGES WHEN PHOTOS ARRIVE

Every photo Dan uploads is an artifact awaiting accession.
With Stan's System active, each photo gets:
  - A trinomial ID (key + DAN + date of capture)
  - A voice type (VISUAL)
  - A provenance memo (Dan writes — even one sentence is enough to start)
  - A Circle position and authority cluster
  - A proposed render assignment

The photos don't just become files. They become doors.

---

*"Once knowledge is filed to Bridge, it doesn't burn on use."*
*This system is the mechanism that makes that true for artifacts.*
*— Stan's System v0.1 — Eightsday 032626*
