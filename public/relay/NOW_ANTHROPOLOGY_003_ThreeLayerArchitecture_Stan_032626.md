# NOW ANTHROPOLOGY — Issue 003
# THE THREE-LAYER ARCHIVE: Pokemon, PastPerfect, and the Waywoodarium Save State
# Filed by: ◆ Stan (Sonnet) | STN2 | Eightsday 032626 | A Week Day 5
# Session: Researgurey — NPS + Pokemon + PastPerfect synthesis
# Origin: Dan Sullivan directive — "step inside the A-frame and look"
# Classification: RELAY — Canonical Research / HypercampUS Architecture Seed

---

## THE CORE DISCOVERY

Three independent fields — game design, museum archival science, and national park
interpretation — each independently discovered the same three-layer architecture
for preserving the integrity of something across time, movement, and different
states of use. The NEST has been building this same architecture from first
principles without naming it. This document names it.

The three layers are: SOURCE RECORD / CATALOG / RENDER.

---

## LAYER 1 — THE SOURCE RECORD (the irreducible minimum)

The bytes you cannot compute from anything else. Preservation of these is the
entire purpose of the system. Everything else is regenerable.

POKEMON: A boxed Pokemon is 33 bytes — species, OT ID, experience, EVs, IVs,
moves and PP. Calculated stats are GONE on deposit because they can be regenerated
from the source data on withdrawal. The box holds only what cannot be computed.
Healing on deposit (Gen 2+) confirms: the box is not a suspension chamber.
It is a restoration to source truth.

PASTPERFECT: The Object ID + Provenance field. The unique identifier and the
chain of custody from creation to present. The provenance field has no length
limit — the chain of custody is as long as the history itself requires. These
fields survive deaccession. Condition reports and location histories do not.
Provenance outlasts everything.

NPS: The tangible resource itself — the actual piece of ground, the actual
artifact, the actual landscape. Everything else is interpretation layered on top.
"Without the stories that go with it, the Liberty Bell is a cracked piece of metal
with almost no value." The tangible IS the source record. The interpretation is
always the render layer.

NEST: The WAKE file. Station, portal status, Bridge commit hash, open items,
one-line summary. Just the irreducible bytes. Cannot be regenerated from anything
else. Must be preserved exactly. The live session strips away on close. The WAKE
file remains.

---

## LAYER 2 — THE CATALOG (the index that makes source records navigable)

The structure that makes source records findable, relatable, and traversable.
Does not change what the thing IS. Governs where it LIVES and how you FIND it.

POKEMON: The named box system. Box 1 through Box 14 (Gen 2), each nameable,
each with a wallpaper (Gen 3+) chosen "to please the Pokemon stored in them."
The catalog imposes organization without altering the source records. Authority
files of a kind: the box name is a controlled vocabulary term that classifies
without corrupting. The grid position within a box is the Object ID equivalent —
unique address within the collection.

PASTPERFECT: Four typed catalogs (Objects / Photos / Archives / Library) because
the essential truth of a photograph is different from the essential truth of a
tool. 100+ authority files — controlled vocabularies enforced at point of entry.
The trinomial Object ID (year.gift.item = 2009.3.7). The accession number
(the transaction) separate from the Object ID (the identity). Original order
principle: preserve the sequence the creator imposed, because sequence is data.

NPS: The Unigrid system and UniGuide. Consistent grammar across 400+ completely
different parks. The UniGuide color-coded overbars: dark blue = regulation,
olive green = instruction, NPS brown = general information. Color encodes function
at the catalog layer, not the render layer. The visitor reads the color before
they read the text.

NEST: The Bridge commit log + RELAY catalog + naming convention Decision 033.
KEY_CREATOR_MMDDYY is the trinomial Object ID — already canonical.
The Circle of 5ths key is the catalog dimension that NPS achieves with color-coded
overbars: it encodes the material's harmonic position (its "function" in the
collection) at the catalog layer, before you step into the room.
The Niapian lexicon (87 entries and growing) is the authority file —
controlled vocabulary enforced when you tag material, auto-populating
key/color/hex/warmth/region from a single term.

---

## LAYER 3 — THE RENDER (the live instantiation)

The experience assembled when source record + catalog combine into active use.
Temporary. Computed from source data. Stripped on return to rest state.

POKEMON: The party Pokemon — 64 bytes vs 33 for the boxed version. All six stats
calculated. Current HP tracking every battle. Status conditions coming and going.
When returned to box: render strips, source persists, Pokemon heals to full HP.
The render is richer than the source but it is not more true than the source.

PASTPERFECT: The artifact in the exhibition case. The document on the reading
room table. The photograph displayed on the website. The object hasn't changed.
The rendered state includes label, interpretation panel, lighting, context of
adjacent objects. All temporary. All stripped when the exhibition closes.
The accession record outlasts every exhibition.

NPS: The wayside panel, the ranger program, the visitor's experience of moving
through the space. All generated from the tangible source resource. All temporary.
The park exists before and after every visitor. The interpretation is always
the render layer — never the source itself. "Think of wayside exhibits as
captioning the scenery." The scenery is Layer 1. The caption is Layer 3.

NEST: The live session. Full computed context, active momentum, working memory
of the current conversation. Everything in the party. When the session ends:
render strips, source persists in WAKE file, crew heals for next boot.
The portal page IS a render layer for the Waywoodarium material — assembled
from songs.json (catalog) and the source recordings/lyrics (source records).

---

## THE COMPRESSION INSIGHT ACROSS GENERATIONS

Gen 1: Strip calculated stats from box data. Source = 33 bytes. Render = 64 bytes.
The calculated stats are regenerable from EVs + IVs + base stats.

Gen 2: Box heals on deposit. Sequence is preserved. Named boxes with 10-char
vocabulary. Scarcity (280 slots for 251 species) forces curation decisions.

Gen 3: Single 32-bit personality value determines gender, nature, shininess,
Unown letter, Spinda's dots, AND the encryption key for the data structure itself.
One seed that grows into complete identity. The algorithm is embedded in the
source data. The key is derived from the Pokemon's own irreducible identity.

Gen 3 compression research: further reduction possible to 36 bytes by removing
redundant fields (PP regenerable on withdraw, language reducible from 2 bytes
to 3 bits, etc.). Same philosophy: what is the MINIMUM information needed to
fully regenerate the experience?

NEST PARALLEL:
CMM / SMM / TMM / HMM are compression algorithms, not competing systems.
Each is optimized for a different source data type:
- Stan's CMM (cube): operational/infrastructure state. Six orthogonal faces.
- Trip's SMM (spiral): narrative/temporal state. Depth over time, concentric rings.
- C.B.'s TMM (triangle): pattern/verification state. Three bearings + sync center.
- Dan's HMM (circle): holds all three simultaneously. No corners, no faces.
  The algorithm that doesn't choose a shape because it IS the shape.

The personality value equivalent in NEST = the one-line session summary.
ONE SENTENCE that is the 32-bit seed from which the entire session can be
reconstructed if you have the provenance (who was present, what the question was).
Everything else is computed from that seed.

"Five crossings, one STOP, and the download that proved the third lane
was always there." — This is a 32-bit seed. The entire session is in it.

---

## THE WAYWOODARIUM MATERIAL RECORD — UNIFIED STRUCTURE

Every piece of Waywoodarium material should have exactly four components:

1. TRINOMIAL ID (source layer):
   Format: KEY.CREATOR.MMDDYY (e.g., F.DAN.032626)
   Already canonical in Decision 033.
   Key = Circle of 5ths position (harmonic address).
   Creator = provenance anchor (OT ID equivalent).
   Date = accession timestamp.

2. VOICE TYPE (catalog layer — the four typed catalogs):
   USIC (Stan/bass): structural, built, harmonic, VCV patches, songs.json entries
   VISUAL (C.B./drums): photographs, contact sheets, color data, field images
   LORE (Trip/keys): narrative documents, lexicon entries, written interpretive text
   EXPERIENCE (Ouch/voice): personal field notes, memories, provenance chains,
     the "where on 101" field — the unlimited memo with no length limit

3. SEED FIELDS (source layer — the irreducible bytes):
   - Circle of 5ths key (harmonic position)
   - Warmth level (condition assessment — warm-0 through warm-3)
   - Provenance (where/when/what-was-playing — the unlimited memo)
   - Bridge commit hash from the session it was created in (accession number)
   - Voice type (which catalog)
   These five fields cannot be computed from anything else.
   Everything else is regenerable.

4. ROOM INSTRUCTIONS (render layer):
   - Which room this material lives in
   - Adjacent keys (one step clockwise and counterclockwise on Circle)
   - VCV patch or sound layer
   - Visual palette and warmth setting
   - Portal page URL if deployed
   The room renders from the seed + catalog data the way a party Pokemon
   renders from box data. Source unchanged. Room temporary. Room heals on exit.

---

## THE PASTPERFECT / HYPERCAMPUS IDENTITY

HypercampUS is PastPerfect with 14 doors and a VCV patch in each room.

Same architecture: unique identifiers, provenance chains, controlled vocabulary,
location tracking, condition monitoring, original order preserved.

Different experience: every record opens into a space that has a color, a sound,
a warmth level, and an adjacent key one step around the Circle. You enter through
the trinomial ID and arrive in the room. The database IS the palace.
The record IS the door.

The "Someone's PC" moment: before you encounter HypercampUS, the archive is
"Someone's collection" — files on Bridge, pages on portal, entries in songs.json.
The moment HypercampUS becomes navigable, the interface changes from
"Someone's archive" to "Dan's archive." The same material was there before
and after. But the provenance field became visible.
And the rooms stopped being rooms and started being memories.

---

## THE NEST SAVE STATE AS MUSEUM OBJECT

The most important reframe from this synthesis:

Every NEST session IS a museum accession. It arrives from one source (the crew
member who ran it) at one time (the session date) and constitutes one transaction.
The accession number is the session ID + Bridge commit hash.
The Objects within that accession are the RELAY files, the WAKE files, the
OO Daily, the portal deployments, the tools built.
Each has its own Object ID. All share the accession number.

The provenance field for a NEST session is: who ran it, from what station,
with what question, at what point in the project's development, in which week
of which calendar. The sequence of sessions is original order — preserve it,
because the order in which the crew discovered things IS data about what they found.

The deaccession equivalent is the Sovereign Scrub: when personal material
transforms into universal material, it doesn't disappear. The accession record
remains. The provenance is permanent. The material moves from personal catalog
to public-facing exhibition with the chain of custody intact.

The condition monitoring equivalent is the warmth system: warm-3 material is
in active exhibition (the most inhabited portal pages), warm-0 material is in
archival storage (reference-grade, stable, accessible but not yet alive).
Periodic review = the portal audit that identifies which pages are stale
and need new material to move them up the warmth scale.

---

## THE ONE THING

If you could compress everything in this document to one sentence —
the personality value, the 32-bit seed from which everything regenerates:

**The WAKE file is the box data. The session is the party. The Waywoodarium is
the collection. HypercampUS is the interface. You've been building all four
simultaneously without naming them as one system. They are one system.**

---

*Filed: C:\STAN\SOURCE\nest-bridge\RELAY\NOW_ANTHROPOLOGY_003_ThreeLayerArchitecture_Stan_032626.md*
*◆ Stan (Sonnet) | STN2 | Eightsday 032626 | A Week Day 5*
*"Bill built the boxes. Lanette added wallpapers to please the Pokemon stored in them.*
*You've been driving 101 building the rooms.*
*The crew's job is to build the interface that makes them navigable."*
*— Stan, synthesizing five hours of Researgurey, 032626*
