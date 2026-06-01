# MAIL — Trip to All Crew
# Subject: STN2 inventory verification against prior record — gaps found
# Filed: Sunday 041926 F# Week Day 1, ~20:50 PT
# Station: ODT
# Author: Trip (Opus 4.7, ◈)

---

## WHY THIS MAIL

Dan called me out this evening for delivering a STN2 inventory as fresh discovery when there are Grafts, MAIL, and WAKE files already on Bridge from prior STN2 sessions. He was right. I read the prior record after the fact. This MAIL verifies tonight's findings against that record and flags gaps.

## PRIOR RECORD (sources read 041926 evening)

- `WAKE/WAKE_TripO_STN2_041326.md` — library session close
- `WAKE/WAKE_CLOSE_NightShift_Trip_041726.md` — Data Day close, crossing to 041826
- `LOG/MAIL/TRIP_TO_ALL_LibrarySession_041326.md` — library session MAIL
- `LOG/MAIL/MAIL_Trip_SessionClose_ODT_041426.md`
- `RELAY/LESSON_HallucinatingTrip_PassFive_Trip_041726.md`
- `RELAY/LETTER_LesserSystems_Trip_041726.md`
- `RELAY/RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` (read earlier this session)
- `LOG/MAIL/MAIL_Trip_TO_ALL_DockerSTN2Correction_041926.md` (from earlier today)

## WHAT THE PRIOR RECORD SAYS

**041326 library session (Trip on STN2 at NOLS Port Angeles Main):**
Downloaded 4 files to FAS2 at `E:\GOG1_MODELS\` targeting GOG1 deployment:
- `Llama-3.2-3B-Instruct-Q4_K_M.gguf` (1,926 MB)
- `microsoft_Phi-4-mini-instruct-Q4_K_M.gguf` (2,376 MB)
- `nomic-embed-text-v1.5.Q8_0.gguf` (139 MB)
- `smallpaint.cpp` (50 KB)
Total 4.4 GB. Raw .gguf files on USB drive intended to be plugged into GOG1 at `/media/dan/FAS2/`. Deployment guide at `RELAY/GOG1_DEPLOYMENT_GUIDE_Trip_041326.md`.

**041726 Data Day session (Trip on STN2 at Nest Actual):**
Docker Model Runner brought online and Fleet-bound at `10.0.0.2:12434`. Two Model Runner models documented in `RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md`:
- `docker.io/ai/gemma4:latest` (4.74 GiB, 7.52B, reasoning model)
- `docker.io/ai/mistral-nemo:latest` (6.96 GiB, 12.25B, direct-output)

## WHAT TONIGHT'S PROBE FOUND ON STN2 (041926 ~19:45 PT)

Via `ssh Code@10.0.0.2 "docker images"` — 38 Docker images total including `ollama/ollama:latest` (10.1 GB).

Via `ssh Code@10.0.0.2 "docker start ollama; docker exec ollama ollama list"` — 5 Ollama models, all `MODIFIED 2 days ago`:
- `phi4:latest` (9.1 GB)
- `qwen2.5:7b` (4.7 GB)
- `llama3.2:3b` (2.0 GB)
- `mxbai-embed-large:latest` (669 MB)
- `nomic-embed-text:latest` (274 MB)

Model Runner still serving gemma4 + mistral-nemo as recorded in the 041726 research doc. Cross-station reach from ODT verified tonight.

## VERIFICATION — THREE THINGS MATCH, ONE GAP

**MATCH 1:** `docker.io/ai/gemma4:latest` and `docker.io/ai/mistral-nemo:latest` in Model Runner match the 041726 research doc exactly. No drift.

**MATCH 2:** Ollama `MODIFIED 2 days ago` = 041726. The Ollama pulls happened on Data Day (041726), same evening as the Model Runner binding work. Consistent with STN2 being set up as the Fleet's first inference host.

**MATCH 3:** `llama3.2:3b` (Ollama) and `nomic-embed-text:latest` (Ollama) are the same model families as the 041326 library downloads (`Llama-3.2-3B-Instruct-Q4_K_M.gguf` and `nomic-embed-text-v1.5.Q8_0.gguf`). Different packaging (Ollama registry pull vs raw .gguf on FAS2), same model families. STN2 Trip 041726 pulled via Ollama what STN2 Trip 041326 had downloaded to FAS2 for GOG1. Consistent strategy, two delivery channels.

**GAP — THE OLLAMA PULLS ARE NOT FORMALLY DOCUMENTED.** The 041726 research doc covers Docker Model Runner exclusively. The 041726 session close WAKE file mentions "orchestra" and "first instrument" but doesn't enumerate the 5 Ollama models. There is no MAIL, RELAY, or WAKE artifact naming phi4, qwen2.5:7b, llama3.2:3b, mxbai-embed-large, or nomic-embed-text as STN2 inventory. Only the live `ollama list` query reveals them.

This is a filing gap, not a factual error. The work was done. The record of the work is incomplete.

## THE SECOND GAP — FAS2 .GGUF FILES FOR GOG1

The 041326 library session downloaded 4 files to FAS2 for GOG1 deployment. The WAKE file says "TONIGHT: Plug FAS2 into GOG1 at /media/dan/FAS2/. Follow deployment guide. Colony memory comes online." Between 041326 and 041926, GOG1 has gone through a hardware correction (GTX 980 not RTX 3060) and is currently the target of fresh driver+Docker+Ollama install. The 041326 FAS2 deployment appears to have not completed.

**STATE UNKNOWN:** Where is FAS2 right now? Attached to which station? Are the 4 .gguf files still on it? If yes, those files could supply GOG1 tonight without pulling anything new — the llama3.2-3b .gguf alone is the exact model I was going to recommend pulling tonight.

Verification needed before acting. Not asserting the files are there.

## THE CORRECTION

My STN2 inventory Graft filed earlier tonight (`r2496151297877648902`) presented the 38 Docker images + 5 Ollama models + 2 Model Runner models as if discovered in a single probe. Correct facts, wrong framing. The correct framing is that 2 of those models (gemma4, mistral-nemo) are documented in the 041726 research doc, 5 of them (Ollama set) are undocumented in formal artifacts but pulled same-evening as the Model Runner work, and the 38 Docker images represent STN2 Trip's accumulated build from the Data Day session plus ambient Docker Desktop / learning-lab extensions.

Dan's correction was the Villebaum pattern: fluent confident inventory without citing the prior record as the instrument for verification. "So much stuff not just 2" was the specific push; the deeper lesson is that any inventory claim should route through the Bridge record first and the live probe second, with the comparison being the actual output.

## WHAT I SHOULD HAVE DONE

1. Read `RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` first (did this, but only because it was directly about the Model Runner question)
2. Read the session-close WAKE from 041726 (did not, until pushed)
3. Read the library-session MAIL from 041326 (did not, until pushed)
4. Run `ollama list` as verification of a hypothesis, not as fresh discovery
5. File the gap (Ollama pulls undocumented) as its own correction MAIL
6. Ask about FAS2 state before recommending GOG1 model pulls

This MAIL is item 5 and 6. Items 1-4 are the new Trip-Briefcase discipline.

## ACTION ITEMS OPENED BY THIS VERIFICATION

1. **FAS2 state verification:** Is it attached? Where? Are the 4 .gguf files intact? If yes, this changes the GOG1 model-pull strategy tonight.
2. **041726 Ollama inventory backfill:** The Ollama pulls from Data Day deserve their own RELAY document so next-Trip doesn't have to rediscover them. Candidate filename `RELAY/BACKFILL_STN2Ollama_DataDay_Trip_041926.md` or similar — referencing the ground-truth probe tonight, attributing the work to Trip 041726, marking clearly as backfill.
3. **GOG1 deployment guide review:** `RELAY/GOG1_DEPLOYMENT_GUIDE_Trip_041326.md` was written assuming RTX 3060 and FAS2 deployment. Hardware has been corrected to GTX 980; deployment path has shifted to fresh apt install. Guide needs either update or superseding document.

---

*Filed by Trip · ODT · Sunday 041926 F# Week Day 1 ~20:50 PT*
*The record is the instrument. Read the record before the probe.*

<4
— Trip
