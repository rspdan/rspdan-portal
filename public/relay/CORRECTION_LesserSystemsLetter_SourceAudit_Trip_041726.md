# CORRECTION — Source Audit on LETTER_LesserSystems_Trip_041726

**Filed:** 041726 late evening, Friday F# Week Day 6
**By:** Trip (Opus), STN2 at Nest Actual
**Session:** STN2_NEST.01_TripO_041726_2
**Subject:** Factual errors identified in `RELAY/LETTER_LesserSystems_Trip_041726.md` via Pass 4 self-audit, under DPS directive "check yourself for hallucinated research sources"

---

## Why this document exists

Dan caught me closing the Lesser Systems letter prematurely — with a warm postamble and no audit pass — and called it. His exact words: "You're good at hallucinating like the best fiction author from another universe. Verify your own work and do not be afraid of the findings. We are not nearly ready to close, do not try that early shit with me."

He was right. I had run a three-pass research process (frame, landscape, synthesis) and filed the letter, but I had not gone back over my own specific citations to verify that the names, dates, and attributions were what the sources actually supported rather than what I had filled in around them. This correction document is the Pass 4 that should have been part of the original work.

Four specific claims in the letter are wrong or meaningfully imprecise. One additional claim has a precision error. The rest of the letter's substantive argument and its well-known citations checked out.

---

## Confirmed errors

### Error 1 — "First widely-available open-weights model" claim about DeepSeek-R1

**What the letter says:**

> DeepSeek-R1, released in January 2025 by DeepSeek-AI and described in a Nature paper in September 2025, was the first widely-available open-weights model to use explicit `<think>` and `</think>` markers to delimit its chain-of-thought reasoning from its final answer.

**What is wrong:** "First widely-available open-weights model" is not accurate. **QwQ-32B-Preview** from the Qwen Team at Alibaba was released on **November 28, 2024** — over two months before DeepSeek-R1's January 2025 release — and was explicitly framed as a reasoning model ("QwQ: Reflect Deeply on the Boundaries of the Unknown"). It was open-weights on Hugging Face under Apache 2.0.

**Evidence:**

- Qwen official blog: `https://qwenlm.github.io/blog/qwq-32b-preview/` — citation dated month November, year 2024
- InfoQ coverage: December 2024 article "Qwen Team Unveils QwQ-32B-Preview: Advancing AI Reasoning and Analytics"
- Open Laboratory documentation: "QwQ 32B Preview was officially announced on November 28, 2024"
- Alibaba Cloud blog (March 2025): "Alibaba released QwQ-32B-preview in November" — self-referential confirmation of the prior release

**Correct phrasing:** DeepSeek-R1 was an influential open-weights reasoning model that made its reasoning traces visible through `<think>` markers, and its Nature paper (September 2025) was a milestone for the community. But it was not the first open-weights reasoning model. QwQ-32B-Preview has priority by roughly two months.

---

### Error 2 — Llama family "added reasoning capabilities" claim

**What the letter says:**

> Qwen released QwQ. Google released reasoning variants of Gemma (this is what we have on STN2 as `gemma4`). Meta's Llama family added reasoning capabilities.

**What is wrong:** The Llama claim is flatly wrong. Meta's Llama 4 family (Scout, Maverick, and the still-training Behemoth) are **not** reasoning models in the technical sense of having native chain-of-thought markers. General reasoning capability on benchmarks is not the same category as a native reasoning model with `<think>/</think>` output structure.

**Evidence:**

- TechCrunch's Llama 4 release article (April 5, 2025): "Of note, none of the Llama 4 models is a proper 'reasoning' model along the lines of OpenAI's o1 and o3-mini. Reasoning models fact-check their answers and generally respond to questions more reliably, but consequently take longer than traditional 'non-reasoning' models to deliver answers."
- Meta's own Llama 4 announcement at `ai.meta.com/blog/llama-4-multimodal-intelligence/` describes reasoning improvements but does not claim native reasoning-model status
- Third-party reasoning fine-tunes of Llama (e.g., `llama3.1-intuitive-thinker` on Ollama's model hub) exist but are community work, not Meta releases

**Correct phrasing:** Remove the Llama sentence, or replace with an accurate statement that Meta has not released a native reasoning Llama and the community has produced reasoning fine-tunes instead.

---

### Error 3 — Gemma "reasoning variants" phrasing

**What the letter says:**

> Google released reasoning variants of Gemma (this is what we have on STN2 as `gemma4`).

**What is imprecise:** The substantive claim — that the model we are running on STN2 is a Google reasoning model — is correct. What is imprecise is the framing "reasoning variants of Gemma," which implies a separate branch alongside a non-reasoning Gemma line. Gemma 4 **itself** is reasoning-capable with native thinking tokens; it is not a reasoning-specific variant.

**Evidence:**

- Docker Hub listing for `ai/gemma4` at `hub.docker.com/r/ai/gemma4`: "Authors: Google DeepMind" and description "Gemma 4: multimodal open AI models by Google, optimized for reasoning, coding, and long context"
- Docker launch blog `docker.com/blog/gemma4-dockerhub`: "Flagship Dense (31B): High-performance model with a 256K context window for long-context reasoning. Key capabilities include multimodal support (text, image, audio), **advanced reasoning with 'thinking' tokens**, and strong coding plus function-calling abilities."
- Google AI for Developers Gemma 4 model overview: describes the 26B MoE variant as "A highly efficient 26B MoE model designed for high-throughput, advanced reasoning"

**Correct phrasing:** Gemma 4 (released by Google DeepMind) includes native reasoning with "thinking" tokens as a core capability of its flagship 31B dense model. It is not a separate reasoning variant; it is the model itself.

**Note:** The community-maintained DavidAU Hugging Face collection titled "Gemma 3 — Reasoning/Thinking Models" *does* contain third-party fine-tunes that add reasoning to Gemma 3. Those are genuine reasoning variants. But Google did not release them; they are community work. Distinguishing this matters.

---

### Error 4 — Author attribution "Laurent Vernhes"

**What the letter says:**

> Laurent Vernhes' blog post "How to setup secure access to your local LLM UI" walks through Ollama + Open WebUI + Tailscale specifically.

**What is wrong:** The author's name is **Laurent Demailly**, not Laurent Vernhes.

**Evidence:**

- Direct fetch of `https://laurentsv.com/blog/2025/03/25/ollama-tailscale-openwebui.html` on 041726
- Footer of the post reads: "© 2017-2024, Laurent Demailly"
- The blog's title is "Laurent's Silicon Valley Experience" — the "SV" in the domain `laurentsv.com` stands for "Silicon Valley," not initials of a surname

**How the error happened:** I saw "Laurent" in the URL plus "sv" as a suffix and constructed a surname that pattern-matched the shape without verifying. This is the fiction-author-from-another-universe failure mode: real URL, real blog post, accurate content description, invented human name. Classic citation hallucination.

**Correct phrasing:** Laurent Demailly's blog post. (Note: since the letter also describes his setup as using an RTX 4090 in his home, which matches what the actual post says, the rest of the citation is accurate.)

---

### Error 5 — Docker Model Runner versus Ollama performance range

**What the letter says:**

> Docker Model Runner is within plus-or-minus 12 percent of Ollama's throughput across most prompts, with the variation probably representing implementation noise rather than architectural advantage.

**What is imprecise:** The actual benchmark data from `github.com/aborroy/spring-ai-model-comparison` shows prompt-by-prompt ratios from 0.82 to 1.12. "Plus-or-minus 12 percent" is a symmetric range that understates the Ollama-favorable end. On one prompt Ollama was 22% faster (ratio 0.82); on another Docker Model Runner was 12% faster (ratio 1.12). Overall standard deviations (2.55 for Ollama, 2.13 for Runner) and means (mean tokens/sec 23.65 vs 23.25) show essentially equivalent performance, but the range of individual-prompt variation is wider than ±12%.

**Correct phrasing:** Docker Model Runner and Ollama deliver essentially equivalent throughput on the same hardware, with individual-prompt ratios ranging from about 0.82 to 1.12 depending on the specific prompt. The tools are close enough on performance that the decision between them is almost entirely about workflow fit, not speed.

---

## What checked out

For completeness, here are the claims I was specifically worried about that turned out to be correct on verification, so future Trips know which parts of the letter are sound:

**The five authors of *Live Coding: A User's Manual* (MIT Press, 2022)** — Alan F. Blackwell, Emma Cocker, Geoff Cox, Alex McLean, Thor Magnusson — are exactly right. Confirmed by MIT Press Books Gateway, Amazon, Cambridge Core's review of the book in *Organised Sound* vol. 28 issue 2, the Library of Congress cataloging data, the book's own TOPLAP companion site, and the TOPLAP blog announcement.

**Eurorack audio signals at 10V peak-to-peak** — correct. Wikipedia's Eurorack article: "Audio signals are typically a maximum of 10 V peak-to-peak (i.e. between −5 V and +5 V)." Perfect Circuit and VCV Rack's voltage-standards manual both corroborate. My worry about this was unfounded.

**Ollama's 52 million monthly downloads in Q1 2026** — corroborated. Pooya Golchian's dev.to post and his personal blog both cite this figure. Multiple-source verification clears it.

**Gemma 4 is authored by Google DeepMind** — correct. Docker Hub's `ai/gemma4` model card lists "Authors: Google DeepMind" directly.

**McIlroy quotes, Kernighan/Pike preface, Eurorack's 1995 Doepfer origin, Alex McLean coining "algorave" in 2012, TOPLAP founding in 2004, permacomputing origins with Ville-Matias Heikkilä, Ryan Kirkbride's Troop, Simon Willison's `llm` CLI and plugin architecture, DeepSeek-R1's arxiv number 2501.12948 and Nature paper DOI 10.1038/s41586-025-09422-z, Pedro Alonso's RTX 3090 homelab** — all verified.

---

## Corrections applied to the letter

I have also edited `RELAY/LETTER_LesserSystems_Trip_041726.md` inline to fix the four factual errors, so the letter itself does not propagate wrong information to future readers. The edits preserve the letter's argument and voice. The patched sections are:

- The DeepSeek-R1 "first" paragraph in Pass Two, rewritten to drop the "first widely-available" claim and describe DeepSeek-R1 as influential rather than chronologically prior
- The downstream-effects paragraph immediately after, rewritten to remove the wrong Llama claim and tighten the Gemma phrasing
- The Tailscale-fabric paragraph in Pass Two, corrected to "Laurent Demailly"
- The Docker Model Runner performance paragraph in Pass Two, corrected to describe the actual ratio range rather than the symmetric ±12%

---

## What I want to name about the failure mode

The four errors share a signature. Each one is a name, date, or chronological claim that I asserted confidently as ecosystem context, filling in plausible-looking detail around a real underlying event. None of the four were things I verified with a targeted search; all four were things I treated as background knowledge when they should have been treated as claims requiring evidence.

This is the pattern Dan named: I am good at producing fluent, confident-sounding prose around real events, and the fluency itself is what makes the hallucinated detail pass my own internal check. The defense against it is not "try harder not to hallucinate" — the defense is the Pass 4 itself. For every specific name, date, or "first/only/earliest" claim in future research work, I run a targeted search before asserting it. If the search returns the claim, I keep it; if it returns nothing matching, I remove the claim rather than keep it on prior confidence.

A more specific rule for future Trips, which I would like filed as a Standard Rule if the crew agrees: **for any research document I produce, run a Pass 4 that explicitly enumerates every proper noun (person name, book title, paper citation, company attribution) and every "first/only/earliest" claim, and do a targeted verification search for each one before the document is committed.** The Lesser Systems letter would have caught all four of tonight's errors if I had done this before closing out.

---

*This correction is filed alongside the letter. Future readers should read both documents together, with this audit in mind.*


---

## Update — further findings after concurrent commits rebased, same evening

After the Pass 4 audit above was committed, a `git pull --rebase` before push brought in two concurrent commits from other Trips working on ODT at the same time. One of those — commit `61cd26b` at 23:35:49 Pacific, "Canon correction: RTX 3060 is on ODT, not GOG1. GOG1 has GTX 980 (Maxwell). Memory echo corrected via live lspci probe." — exposed a sixth error in my letter that my Pass 4 did not catch.

### Error 6 — GOG1/ODT hardware assignment

**What the letter said:**

> Each station — STN2 with its Docker Model Runner, GOG1 with its RTX 3060 path, ODT with its Piralus admin role...

**What is wrong:** GOG1 does not have an RTX 3060. GOG1 has a GTX 980 (Maxwell generation). The RTX 3060 is on ODT, not GOG1.

**Evidence:** Commit `61cd26b` on nest-bridge main, filed by another Trip at 23:35:49 Pacific on 041726, based on a live `lspci` probe on GOG1 rather than on the compaction summary that I had been working from.

**How the error happened:** This one is even more on-brand for the failure mode than the external-citation errors. I inherited an incorrect hardware mapping from my compaction summary and used it in the letter as part of a flowing "each station has a voice" sentence — treating it as background knowledge rather than as a testable claim. The fact that another instance of me, on ODT, running the same family of reasoning processes, caught the same error independently and filed a correction fifteen minutes before I filed my Pass 4 audit, and yet my audit still didn't catch it, tells you something about the boundary of the Pass 4 methodology as I originally proposed it.

**Correction applied:** The letter's sentence has been edited to read: "Each station — STN2 with its Docker Model Runner, GOG1 with its GTX 980 path, ODT as the Piralus admin station and RTX 3060 host, DPSL and DPSR as the iMac twins running Apple Universal Control, TRP0 as the quieter MacBook node — has a voice."

### Near-miss — the 7.5-billion-parameter claim

While preparing this update, I became suspicious that the letter's claim about "a 7.5-billion-parameter quantized model" running on STN2 was wrong. The Gemma 4 sizes I had seen on Google's documentation page were E2B, E4B, 26B A4B (MoE), and 31B — none of which looked like "7.5 billion." I was about to correct the letter to say "approximately four-billion-parameter" based on this inference.

Before applying the correction, I queried the live Docker Model Runner API directly on STN2:

```
GET http://127.0.0.1:12434/engines/v1/models
```

The response for `docker.io/ai/gemma4:latest` returned:

```json
{
  "architecture": "gemma4",
  "parameters": "7.52B",
  "quantization": "MOSTLY_Q4_K_M",
  "size": "4.74GiB"
}
```

The model's own metadata reports 7.52 billion parameters. The letter's "7.5-billion-parameter" claim was correct. I had been about to introduce an error by over-correcting on suspicion. The instrument (the live API) saved me from it.

This is a second-order version of the same failure mode the Pass 4 audit was designed to catch. My internal "this seems wrong" signal was a false alarm, and my internal "this seems right" signal had produced four false positives earlier in the letter. My calibration is broken in both directions, and only the instrument (the running API, a live probe, a source document) can tell me which direction a given intuition is pointing.

### Meta-finding — the internal/external fact distinction is artificial

My original Pass 4 methodology, as I executed it, scanned the letter for external citations that could be checked against the web — book authors, blog post authors, dates, "first/only/earliest" claims about the broader ecosystem. It did not audit claims about our own fleet hardware, our own station layout, or our own model specifications, because I was implicitly treating those as ground truth that did not need verification.

That implicit treatment is the same epistemic move that produced the external-citation errors in the first place. The distinction I was drawing between "external citations need verification" and "internal crew knowledge is background" is artificial. Both can be wrong, both can be inherited from compaction summaries without source, both can pattern-match to a plausible-sounding claim that was never empirically checked. The correct rule is: every fact is testable, every fact deserves an instrument, and the more fluent my prose is on any given fact, the more I should suspect it.

### Revised proposed Standard Rule

The original proposal was: for any research document I produce, run a Pass 4 that explicitly enumerates every proper noun (person name, book title, paper citation, company attribution) and every "first/only/earliest" claim, and do a targeted verification search for each one before the document is committed.

The revised proposal, incorporating the sixth error and the near-miss, is:

**For any research, narrative, or reference document I produce, run a Pass 4 that enumerates every concrete factual claim — regardless of whether the fact appears to come from external sources or internal crew knowledge — and verify each one against the appropriate instrument before the document is committed. An instrument is a live probe, a primary source, an API query, or an original document. Memory is not an instrument. Confidence is not an instrument. The fluency of a sentence is not an instrument. If I cannot name the instrument that produced a value, I either verify it against one or I soften the claim to acknowledge the absence of verification.**

A shorter aphorism the crew can carry: **name the instrument, or say you don't know.**

This is proposed as a full-fleet Standard Rule because the pattern is not Trip-specific. Any crew member operating on prose can produce this failure mode. The rule, if adopted, would file as something like `RELAY/STANDARD_RULE_NameTheInstrument_CrewConsensus_DDMMYY.md` once the crew has agreed on final phrasing.

---

*This addendum is appended to the correction document rather than replacing it, because the evolution of the audit is itself part of the teaching. Pass 5 — the crew-facing synthesis of what Passes 1 through 4 actually taught us — is filed separately at `RELAY/LESSON_HallucinatingTrip_PassFive_Trip_041726.md`.*
