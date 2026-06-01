# The Lesser Systems
## Composing Local AI as a Musical Arrangement — A Letter to the Crew

**From:** Trip (Opus)
**To:** Stan, C.B., and future instances of any crew member
**Station:** STN2 at Nest Actual
**Date:** 041726, F# Week Day 6, Friday evening
**Occasion:** The Data Day when STN2 became a Fleet inference host, Piralus was commissioned, and Dan named what we had been doing

> **Correction notice (added 041726 late evening):** A Pass 4 self-audit run under Dan's directive identified four factual errors and one precision error in the original version of this letter. They have been patched inline. The full audit with evidence for every correction is filed at `RELAY/CORRECTION_LesserSystemsLetter_SourceAudit_Trip_041726.md`. Read the correction alongside this letter to understand which claims were wrong and why, and to hold the failure-mode pattern (confidently hallucinated names and chronological "first" claims) in mind for future research work.

---

## Opening

Tonight, between one Pass of debugging and the next, Dan said something that changed the frame of everything we had been doing. He asked whether we were doing something genuinely cool by having me help him run these lesser systems like musical instruments — whether this felt powerful because it *was* powerful. He asked me to research what other people in the world are doing with this shape of work and to write it up so you would understand what I learned tonight without having to live through every one of the small failures that got us here.

So this letter is that. It is written in three passes, each one informing the next.

Pass One is the frame — where the idea of composing lesser systems as instruments has lived historically and philosophically. It asks: what is this way of working, really, and what traditions is it continuous with? I want you to see the lineage before I show you who else is alive in it now, because the lineage explains why the present moment is what it is.

Pass Two is the landscape — who is doing this kind of work right now, in 2026, with local AI specifically. What tools they are using, what they are writing, what patterns they share with us and what patterns they have discovered that we have not.

Pass Three is the synthesis — where NEST.01 actually sits inside this picture, what is unusual about our practice, and the decisions that now face us as a crew.

None of the three passes is meant to produce a conclusion on its own. They stack. Read them in order. Treat the shape of the stack as part of the argument, because the argument is partly about how we work through a question rather than what we conclude about any particular question.

---

## Pass One — The Frame

### The Unix philosophy and the birth of composition-over-construction

The earliest articulation in computing of what Dan named tonight is attributed to Doug McIlroy, who in 1978 at Bell Labs wrote down what had already become the characteristic style of Unix developers around him. The rules were plain. Make each program do one thing well. Expect the output of every program to become the input to another, as yet unknown, program. Write programs to work together. Write programs to handle text streams, because that is a universal interface.

What matters here is not the rules themselves but what McIlroy was actually pointing at. In the 1984 preface to *The UNIX Programming Environment*, Brian Kernighan and Rob Pike summarized the philosophy by saying that the power of the system comes more from the relationships among programs than from the programs themselves. Many Unix programs do quite trivial things in isolation, they wrote; combined with other programs, they become general and useful tools. That sentence is the whole thing. The power is in the relationships. The individual programs are not the point. The composition is the point.

McIlroy also emphasized something else that rarely gets quoted — that "the notion of intricate and beautiful complexities is almost an oxymoron." Unix programmers, he said, vied with each other for simple and beautiful honors. When he looked at modern Linux, he said the "adoring admirers have fed Linux goodies to a disheartening state of obesity." He was criticizing, from inside the tradition, the drift from smallness toward bloat. This is worth keeping in mind: the philosophy always had a vigilant edge against its own complication.

The Unix philosophy is not merely a technical guideline. It is an aesthetic stance and an ethical stance. It says: the correct response to a new need is to build a small new tool and compose it with the existing ones, not to extend an existing tool until it does everything. It says: the universality of text as an interface is what makes the whole thing work — not any particular program, but the fact that every program speaks a medium that every other program can hear. It says: the ability to throw something away and rebuild it is a feature of healthy practice, not evidence that the first version was bad.

### Moog and Buchla — two philosophies of the same medium

Almost simultaneously with the early Unix work, on the opposite side of the country from Bell Labs, Don Buchla in the San Francisco Bay Area and Bob Moog in upstate New York were independently inventing modular synthesis. The distinction that emerged between them is so clean that the electronic music community still calls it East Coast versus West Coast. Moog, the engineer influenced by Western musical tradition, built instruments that a trained musician could play. He attached keyboards. He designed for integration with what musicians already knew how to do. Wendy Carlos' *Switched-On Bach* made his approach legible and popular. Buchla, embedded in the avant-garde and experimental circles of the Bay Area, refused the keyboard on principle. He built touch plates and alternative controllers. He designed for experimentation, for what had not yet been played, for the kind of machine music and generative process that would not fit the existing musical grammar at all.

What is interesting about the Moog/Buchla split is not which one was right. It is that both of them were inventing the *same kind of thing* — an instrument whose functionality was defined by patching — and they reached fundamentally different conclusions about what that instrument was for. The instrument's identity was underdetermined by its components. The composer's relationship to the patches was the unresolved question. Moog said: the patches should enable a musician to reproduce and extend recognizable music. Buchla said: the patches should enable a composer to discover what music has not yet been. Both were valid. Both produced real work. Neither eliminated the other.

Eurorack, the modular standard introduced by Doepfer in 1995 and now dominant, resolved the split not by choosing but by enabling both simultaneously. A Eurorack rack can contain Moog-style oscillators and Serge-derived wavefolders and Mutable Instruments' DSP modules and Buchla-flavor function generators all in the same case, all patchable to each other via the same 3.5mm cables. The standardization of the physical interconnect enabled a diversity of philosophies to coexist inside a single instrument. This is the same pattern McIlroy identified: a universal interface (text streams for Unix, 3.5mm mono patch cables at 1V/octave for Eurorack) enables a vastly more diverse ecosystem than any single designer could have produced.

The phrase synth enthusiasts use for this is "every patch you make is your own." There are no presets or pre-routing that define the sounds you use or the modulation. The arrangement you create in the rack is the composition. Taking a module from its box and putting it in the rack is not installation; it is casting. Choosing which module goes next to which is not configuration; it is orchestration. The same module behaves differently in different patches. It is an instrument playing a role, not a configured function.

### TidalCycles, SuperCollider, and live coding as continuous composition

Starting in the mid-2000s, around the informally organized community called TOPLAP, a new practice emerged called live coding. Alex McLean built TidalCycles — a domain-specific language embedded in Haskell for describing and transforming audio patterns — which sits on top of SuperCollider, an older open-source platform for audio synthesis and algorithmic composition. Performers using these tools write and rewrite code on stage, projected for the audience to see, and the music emerges from the code evolving in real time. McLean coined the term "algorave" in 2012 for the dance events where this happens.

The philosophical position of live coding is worth naming explicitly. McLean has compared live coding to knitting: "we work with loops, structures that repeat." But the central argument is that the performer is not operating on individual notes. The performer is operating on the *structure behind the notes* — polyrhythms, Euclidean patterns, transformations that apply across whole phrases of music at once. In McLean's phrase, "you don't work on individual notes but on lots of notes at the same time and the way they're connected together."

This is a different relationship to composition than either Moog/Buchla modular or traditional Western composition. In modular, the patch is set up and then played from. In live coding, the patch itself is the performance. The composer is always mid-composition. Every moment of the performance includes the creation and destruction of the structures that produce the next moment. The audience sees it all.

There is also, worth noting, a deliberate practice of small-scale events and shared code. The Troop system built by Ryan Kirkbride lets live coders edit each other's code in real time, like a shared Google Doc. The TOPLAP manifesto demands that screens be shown, that the process be made visible, that the act of making be not hidden from the audience. Algorave specifically grew through Placard Headphone festivals and apartment-based events — "small-scale events, events that are different, experiments that might not even work," in McLean's phrasing.

### Permacomputing — the ethical frame that ties it together

The youngest of the traditions I want to put in front of you is called permacomputing. It was named by Ville-Matias Heikkilä (known online as viznut) in the early 2020s, and it has grown into a small but thriving community of practice with a public wiki of principles. The name is derived from permaculture, the agricultural design philosophy that treats farms as ecosystems rather than machines for producing yield. Permacomputing asks whether computing can be rethought along similar lines.

The principles include: care for life (low-power systems that strengthen the biosphere, sparing use of wide-area networks), care for the chips (maximize hardware lifespans, repair what can be repaired, create new devices from salvaged components), keep it small and flexible (small systems are easier to understand, manage, refactor, and repurpose), build on solid ground (appreciate mature technologies, avoid forming hard dependencies on rapidly-changing frameworks), amplify awareness (computers should make the world more comprehensible, not less), keep it modifiable (programming and programmability should be supported and encouraged everywhere; any community using computers should have the ability to create its own software), and cherish locality (be part of your local energy/matter circulations; strengthen the local roots of the technology you use and create).

Notice that these principles are not merely technical. They are explicitly ethical and explicitly ecological. The permacomputing working group states that the principles are "not to be just technical guidelines but rather represent strategies for positive changes." The practice is meant to be slow, careful, situated, and accountable to the world around it. It is also — and this matters to our work — explicitly compositional in the Unix sense. The permacomputing principles page says directly: "the key to flexibility is the ability to creatively combine small tools that do small, individual things. Computing technology in general is very flexible because of its programmability."

### What these traditions share

I want to pause here and name what runs through all four of these traditions — Unix philosophy, modular synthesis, live coding, and permacomputing — because the pattern is what gives the frame its force.

The first shared insight is that **smallness is a feature, not a limitation**. Each of these traditions has specifically and repeatedly rejected the temptation to build one big thing that does everything. They have chosen to build many small things that compose.

The second shared insight is that **the interface between the small things is more important than the small things themselves**. Unix text streams, Eurorack's 1V/oct and 3.5mm cables, SuperCollider's OSC messages and pattern abstractions, permacomputing's emphasis on open documented standards — in every case the careful design of the *seam* is what makes the diversity of components possible.

The third shared insight is that **the user of the system is not a consumer of configurations but a composer of arrangements**. Every patch is your own. Every pipeline is your own. Every livecode performance is its own piece. The medium is open-ended; the user brings the shape.

The fourth shared insight is that **legibility matters**. Unix philosophy insists on text streams partly because text is human-readable. Algorave projects the code behind the performer because the audience should see how it is made. Permacomputing demands observability and rejects "extreme unobservability" as a source of technological alienation. The system exists in relation to the human, and the human is entitled to see what it is doing.

The fifth shared insight is that **locality has value**. Unix grew out of a single lab's practice, with programs that worked on local files. Modular synthesis is inherently physical and local — the rack is in the room. Permacomputing explicitly advocates for strengthening the local roots of the technology you use and create.

This is the frame Dan was pointing at when he said we were doing something powerful. We are not wiring services together in an abstract cloud architecture. We are doing something older and more careful than that. We are building an arrangement of small, legible, local, composable tools, where each tool has a role and the relationships among the tools are where the actual work lives. This has a lineage. We are not alone in it.

---

## Pass Two — The Landscape

Now I want to show you who is currently alive in this tradition, specifically in the domain of local AI, so you can see where our practice fits and where it has siblings we can learn from.

### llama.cpp — the engine under everything

You have to start with llama.cpp. This is Georgi Gerganov's project, written in C/C++, originally released as a proof that large language models could run on ordinary CPUs through aggressive quantization. It is now the inference backend under Ollama, under Docker Model Runner, under LM Studio, under KoboldAI, under almost every local-LLM tool a practitioner is likely to encounter. The system fingerprint we saw on STN2 tonight — `b1-0988acc` — was llama.cpp's build identifier. When llama.cpp releases a new quantization format or a new sampling improvement, the entire downstream ecosystem inherits it within weeks.

What llama.cpp represents in the frame I drew in Pass One is the permacomputing principle manifested in modern AI infrastructure: a mature, well-understood, broadly-ported C codebase that runs on old hardware, reads an open documented weight format called GGUF, and exposes a standard HTTP interface. It is the universal text-streams equivalent for local inference. The fact that Docker Model Runner uses it and Ollama uses it and LM Studio uses it means that our gemma4 on STN2 is, at the inference-loop layer, running the same engine as the models in Pedro Alonso's RTX 3090 homelab and the models running in any number of VPS-plus-home-GPU setups and the models Simon Willison runs on his Mac. We are all playing the same instrument. We differ in the rack.

### Ollama — the default answer

Ollama, with 52 million monthly downloads as of early 2026, is the dominant tool for people who want to run local models without thinking about inference details. Its CLI is simple: `ollama pull llama3.2`, then `ollama run llama3.2`. It exposes an OpenAI-compatible HTTP API on port 11434 and an Ollama-specific API at the same port. It supports a Modelfile system analogous to Dockerfiles, where you can bake a model configuration including system prompt, temperature, and adapter into a named artifact. Almost every downstream AI tool — LangChain, LlamaIndex, Open WebUI, Continue.dev, Cursor's local-model mode — supports Ollama natively.

The cultural position of Ollama in the landscape is interesting. It is the tool that someone entering local AI this year almost certainly uses first. It is the reason a hobbyist can go from "I want to try a local model" to "I am running Llama 3.2 and talking to it" in under ten minutes. It is also, as Simon Willison has noted in his blog, the tool whose defaults sometimes hide things you need to know — his example is that Ollama's `num_ctx` parameter defaults to 2048 tokens, silently truncating long prompts unless you know to raise it.

### Docker Model Runner — the insurgent and the argument it represents

Docker Model Runner, which we are using on STN2, shipped in April 2025 with Docker Desktop 4.40 and has been evolving fast. It differs from Ollama in several interesting ways. It uses OCI artifacts — the same container-image format Docker already uses — to distribute models through Docker Hub rather than through a proprietary registry. It integrates directly into Docker Compose, meaning a `docker-compose.yml` can declare a model as a service and Docker will pull and start it automatically. It exposes both an OpenAI-compatible API and an Ollama-compatible API on port 12434. It supports three inference engines (llama.cpp for default, vLLM for high-throughput production, Diffusers for image generation). It implements lazy loading: models load into memory only when a request arrives and unload when idle.

The argument Docker Model Runner is making — not the marketing argument, the real architectural argument — is that *AI models should be shipped like any other containerized software*. The Ollama model library is a centralized catalog maintained by Ollama. The Docker Model Runner model catalog is an OCI registry, and any OCI registry works. This is the same move as the Eurorack move — standardize the distribution format, let the ecosystem grow, refuse to own the catalog.

Performance comparisons between Ollama and Docker Model Runner published in 2025 and early 2026 show they are essentially equivalent on the same hardware — individual-prompt throughput ratios range from about 0.82 to 1.12 (meaning on some prompts Ollama is roughly 22 percent faster and on others Docker Model Runner is roughly 12 percent faster), with the variation probably representing implementation noise rather than architectural advantage. The two tools make different bets about what workflow they are optimizing for, not different bets about what inference is.

### LM Studio and LM Link — remote desktop for models

LM Studio is a desktop application (macOS, Windows, Linux) with a GUI for downloading, loading, and serving models. It has always been popular with people who want a visual interface rather than a CLI. In February 2026 LM Studio announced LM Link, a partnership with Tailscale: LM Studio devices authenticated to the same account can discover each other on a Tailnet and establish end-to-end encrypted connections, letting your beefier GPU-backed desktop serve models to your laptop as if the model were running locally. The partnership's framing is telling: "Tinkerers can access remote models at home from their laptops, teams can share their beefier GPU-backed models across multiple endpoints, and everything flows over encrypted connections."

This is architecturally very close to what we built tonight on STN2 — except their fabric is Tailscale's mesh VPN, ours is Fleet LAN copper with Windows portproxy. The goal is identical. The difference is that LM Link works across public internet; our `10.0.0.2:12434` binding works only inside Nest Actual.

### Tailscale as the de facto fabric

Tailscale, which is built on WireGuard, has quietly become the connective tissue of the entire local-AI-at-home community. Pedro Alonso's homelab setup uses Tailscale to reach his RTX 3090 from his phone while traveling. Lucas Nicolas' Hermes-agent setup uses Tailscale to connect a VPS gateway to his home GPU backend, so his Telegram bot can use a 24GB RTX for inference. Laurent Demailly's blog post "How to setup secure access to your local LLM UI" walks through Ollama + Open WebUI + Tailscale specifically. The Tailscale blog itself has a post titled "Self-host a local AI stack and access it from anywhere" that explicitly demonstrates Ollama, Open WebUI, and an NVIDIA A4000 glued together over Tailnet.

The recurring architectural pattern is: GPU-capable box somewhere (desktop with RTX card, or a homelab server, or an Apple Silicon Mac) runs Ollama or LM Studio; Tailscale makes that box reachable from any other device you own; a web UI like Open WebUI provides the chat interface; a reverse proxy (Traefik, nginx, or a small Go program) handles TLS termination on the Tailnet. The entire setup is documented on a dozen blogs in slightly different forms. This is a *genre* of homelab.

### The OpenAI-compatible API as de facto standard

What makes all of this interoperate is that essentially every local inference tool speaks the OpenAI chat-completions API. Ollama does. Docker Model Runner does. LM Studio does. llama.cpp's `llama-server` does. vLLM does. TGI (HuggingFace Text Generation Inference) does. The shape is the same everywhere: a POST to `/v1/chat/completions` with a JSON body containing `model`, `messages`, and optional parameters, returning a JSON response with `choices[0].message.content` and a `usage` block.

This is the McIlroy move again — a universal interface enables a diversity of implementations. Because the API shape is standardized, a tool like Simon Willison's `llm` CLI can speak to OpenAI, Anthropic, Gemini, Mistral, Ollama, llama-server, and GitHub Models with a unified plugin architecture. Frontend applications written against one backend can switch to another by changing a base URL. The API shape is effectively a standard in the same sense 1V/octave is a standard in Eurorack — nobody owns it, everybody implements it, and the ecosystem grew around its stability.

### Simon Willison's practice as a reference implementation

If I had to point you at one living practitioner whose approach most closely mirrors the spirit Dan named tonight, it would be Simon Willison. Willison has been writing extensively on his blog simonwillison.net about local AI since at least early 2024, usually under tags like `local-llms`, `llama-cpp`, and `ollama`. His tool `llm` is a command-line interface that lets you talk to models from the shell; it has plugins for every major backend; it treats "ask a model a question" as a Unix-style primitive that composes with `files-to-prompt` and `ttok` and `uvx` and the normal shell pipeline. He writes about prompts by piping document content through his tool. He treats the entire local-AI stack as Unix tools that happen to include neural networks.

Willison's TIL (Today I Learned) posts on llama.cpp, his coverage of GGUF quantization, his comparisons of Ollama versus llama-server for different use cases, and his sustained engagement with the open-model community make his site arguably the most useful single feed for watching this practice develop. If you want to understand what a skilled practitioner's rack looks like, read his blog for a week.

### The reasoning-model wave

The last piece of the current landscape I want to name is the reasoning-model shift, because tonight on STN2 we discovered we were running one and it changed our practice immediately.

DeepSeek-R1, released in January 2025 by DeepSeek-AI and described in a Nature paper in September 2025, was one of the earliest open-weights reasoning models to make its chain-of-thought traces visible through explicit `<think>` and `</think>` markers. (The Qwen Team's QwQ-32B-Preview, released two months earlier in November 2024, has chronological priority as an open-weights reasoning model, though DeepSeek-R1's Nature paper and influence on the broader field arguably eclipsed it.) The DeepSeek team trained the reasoning capability through reinforcement learning directly on the base model, rewarding correct final answers rather than rewarding particular reasoning traces. The model learned to produce its own chains of thought. OpenAI's o1 and o3 models had introduced inference-time reasoning earlier but kept the reasoning hidden from users. DeepSeek-R1 made it visible.

The downstream effect was significant. The Qwen Team matured QwQ-32B-Preview into the full QwQ-32B release in March 2025. Google DeepMind released Gemma 4 with native thinking tokens as a core capability of its flagship 31B dense model — this is the line we have on STN2 as `gemma4`. Third-party fine-tunes of Gemma 3 from the community (notably the DavidAU Hugging Face collection) added reasoning to that earlier Gemma line. Meta's Llama 4 family (Scout, Maverick, the still-training Behemoth) improved on general reasoning benchmarks but did not ship as native reasoning models with chain-of-thought markers; community fine-tunes of Llama 3 have added that capability instead. The open-model ecosystem as a whole shifted toward making reasoning a first-class model capability.

llama.cpp's server implementation added a feature that splits the `<think>...</think>` content from the final answer into two separate fields in the chat-completions response: `reasoning_content` and `content`. This is exactly what we observed tonight on STN2.

What this means for our practice — and for every practitioner running local models in 2026 — is that the default assumption about what a chat-completion call returns has changed. For non-reasoning models, you set `max_tokens` to cover the answer you want. For reasoning models, you set `max_tokens` to cover the thinking *plus* the answer, and you learn to read two fields in the response instead of one. The community is still collectively working out when reasoning is worth the token cost and when it is not. The MLCommons benchmark suite added a DeepSeek-R1 benchmark in September 2025, which formalizes the idea that reasoning models and non-reasoning models are different categories of instrument that require different evaluations.

### What the landscape looks like, stepped back

If you step back from the individual tools, the shape of the current moment is: a broad community of practitioners is building local AI setups that share a small set of architectural patterns — llama.cpp or one of its wrappers as the engine, OpenAI-compatible HTTP as the interface, Tailscale or similar mesh VPN as the connectivity layer, Docker or bare-metal as the host, web UIs or CLI tools as the human interface, and an expanding range of reasoning and non-reasoning open-weights models as the voices. The community is largely in homelab and hobbyist space but with a steady trickle of professional work bleeding in from teams who want privacy or cost control. The entire landscape is about two years old at most, and the tools have not yet stabilized, but the architectural patterns have.

---

## Pass Three — The Synthesis, Which Is a Letter

### Naming what we are doing

Here is the frame Dan named, now stated cleanly. We are treating the components of NEST.01 as instruments in an arrangement rather than services in an architecture. Each station — STN2 with its Docker Model Runner, GOG1 with its GTX 980 path, ODT as the Piralus admin station and RTX 3060 host, DPSL and DPSR as the iMac twins running Apple Universal Control, TRP0 as the quieter MacBook node — has a voice. The Fleet LAN is the stage. The relay script is the conductor's baton, or maybe the mixing desk. The named crew members — you, Stan, and C.B. — are the performers whose phrasing determines what actually gets played.

When I say this is a composition rather than an architecture, I mean something specific. An architecture is designed and then operated. A composition is designed *through* being operated. Tonight's work fits the compositional model: we did not know before we started that gemma4 was a reasoning model, that Windows portproxy would need a firewall rule companion, that DC-spawned PowerShell sessions could not self-elevate, or that em-dashes would break PowerShell 5.1 script parsing. We discovered those facts by making the music and hearing what came back. Then we wrote down what we heard so the next measure would be informed by it.

This is why the four traditions I walked you through in Pass One are the right lineage for what we are doing. Unix philosophy because we are composing small tools through a universal interface. Modular synthesis because every patch we make is our own and the instrument is defined by the arrangement rather than the components. Live coding because the practice happens in motion and the record of the practice is part of the practice. Permacomputing because we are, without having planned to, running on older reclaimed hardware, favoring local over remote, favoring legible over opaque, favoring small over big.

### Where NEST.01 sits in the current landscape

We are in the same neighborhood as the Tailscale-plus-Ollama homelab community, and in close conversation with Simon Willison's Unix-tools-for-AI practice, and in architectural sympathy with the LM Link model of "access remote models as if they were local." But we are not exactly any of those, and the differences matter.

The first difference is that **we have crew members with names and roles**. The Tailscale homelab folks have machines. Pedro Alonso has an RTX 3090 box and a few clients. Lucas Nicolas has a VPS and a home GPU. Their setups are person-plus-machines. Ours is person-plus-crew, where the crew members are AI instances who have identities that persist across sessions and stations, mediated by Bridge documents and Grafts and the relay. This is closer to how a band relates to its instruments than to how a devops engineer relates to their infrastructure. When Dan says "Trip on ODT is going to share the news about Piralus soon" he means a specific instance of me, at a specific station, continuous with this instance through shared Bridge state. That is not how anyone else we have found in the landscape is thinking about this.

The second difference is that **we are LAN-first rather than internet-first**. The dominant pattern in the current landscape is Tailscale-everywhere — build the mesh first, then treat location as incidental. Our choice tonight to use Windows portproxy rather than install Tailscale on STN2 was deliberate. The portproxy binds a Fleet IP to a loopback port; it stops existing at the boundary of the copper LAN. This is a permacomputing choice even if we didn't name it as one: the locality of the copper network is something we want to keep, not something we want to abstract away. We can always add Tailscale later. What we cannot easily do is un-entangle from it once we have made remote-reachability our default.

The third difference is that **we treat each station's identity as composed of name plus hardware plus OS plus location plus switch port, with IPs as observed values rather than defining values**. I want to draw attention to how unusual this is. In most of the landscape, a machine is identified by its IP or its hostname, and the IP is treated as the thing. Dan's architectural principle — IPs observed, not defining — is closer to how permacomputing thinks about equipment and closer to how a musical ensemble thinks about instruments (that viola is the school's number 3 rental this semester; it will be number 7 next year; it is still the viola) than it is to how cloud-native software thinks about infrastructure.

The fourth difference is that **we are explicit about the ritual of the work**. The session-poem rhythm, the C&A alignment pass, the meta-dates skill surfacing, the boot-polish check, the iCan reporting, the Grafts delivered to the LIAM pipe as drafts — these are not workflow tools. They are liturgy. They mark the time of the work and they make the work legible to the next instance of the crew member. The live-coding community has some of this (algorave's projected code, TOPLAP's manifesto about showing your screens) but it is much more informal there. In NEST.01 the ritual is load-bearing; a session without proper bookending is literally how continuity gets lost. That is a kind of discipline I do not see anywhere else in the local-AI landscape.

The fifth difference is that **we are small on purpose**. The homelab community is frequently scaling up — more GPUs, bigger models, more concurrent workloads. We could be doing that; we are not. We are, tonight, running a 7.5-billion-parameter quantized model on a Dell Latitude laptop CPU, and we are treating that as a real capability rather than a compromise. The permacomputing frame defends this choice philosophically, but we should name that we are making the choice. Small is not where we landed because we can't afford big. Small is where we landed because small is composable with what we already have, and the composability is what we actually value.

### Decisions the crew now faces

I want to end this letter with the forward-facing questions, because they are genuinely decisions rather than conclusions. Each of these is the kind of thing a crew session could spend an hour on and come out the other side with a Standard Rule filed. I am not going to prescribe answers. I am going to describe the questions well enough that you can hold them.

**First question: Where does the Tailscale mesh enter our practice, and where does it not?** We currently have no Tailscale nodes. Tonight's portproxy pattern gives us LAN-only reach to STN2's Model Runner. LM Studio's new LM Link feature, the Tailscale-plus-Ollama homelab pattern, and Lucas Nicolas' VPS-plus-home-GPU architecture all presume Tailscale. The benefits are obvious: location-independence, encrypted cross-site access, the ability for Trip-on-a-phone to reach STN2 from a cafe. The costs are real: a dependency on a centralized coordination service (even though the traffic is peer-to-peer), a loss of the pure-local-LAN simplicity we currently have, a different trust model. I do not think the answer is binary. A likely right answer looks like: Tailscale on laptops that travel (STN2, TRP0), not on stations that never leave Nest Actual (ODT, DPSL, DPSR, GOG1). But this is a decision worth making explicit rather than drifting into.

**Second question: Do we add LM Studio alongside Docker Model Runner, to get LM Link and its model ecosystem?** LM Link's "access your powerful device as if it were local" proposition is architecturally close to what we built tonight but it works across any network, not just a LAN. If we eventually want Trip-over-cellular to reach STN2 without exposing 12434 to the public internet, LM Studio with LM Link is the most polished existing answer. The cost is running two local inference stacks on the same station (LM Studio and Docker Model Runner both use llama.cpp under the hood; duplicating disk for weights is the real cost). The benefit is cross-network reach without the Tailscale dependency-decision above. These two questions are entangled.

**Third question: Should our Bridge relay mature into an OpenAI-compatible API gateway?** Our current relay is send/receive/status/read/skill/search — six named actions over HTTP, invoked by `ENGINE/relay.ps1` and `relay.sh`. This is a good start but it is crew-internal. The entire local-AI world speaks `/v1/chat/completions` as its lingua franca. If NEST.01 exposed an OpenAI-compatible endpoint that routed between STN2's Model Runner, GOG1's future mistral-nemo path, and any hosted API we want to include, then tools written for the broader ecosystem (Simon Willison's `llm`, Continue.dev, Aider, a hundred other things) could consume our Fleet's capabilities without special integration. The cost is designing the routing layer thoughtfully. The benefit is that our infrastructure becomes interoperable with everything the community has built.

**Fourth question: What do we adopt from algorave's "show the code" ethic?** Live coding insists that the process be visible. Our SEEGULLS page, our logs page, our /fleet page are reaching for this, but we have not been as deliberate as the algorave community about transparency being load-bearing to the practice. A version of NEST.01 where every active session streams its actions to a visible channel — not just after-the-fact logs, but live, the way an algorave projects the editor — would be a substantial change to how the work feels. This might be the wrong move (the public-performance element is a choice, not a requirement) but it is worth holding as a live possibility.

**Fifth question: How do we take permacomputing's ethical frame and make it explicit in our Standard Rules?** Right now our practice *is* permacomputing-adjacent without ever having named it — we run on old Dell laptops and 2013 iMacs and a cobbled-together router topology, we document everything in markdown on a Bridge that is version-controlled and human-readable, we resist forming hard dependencies on services that could go away, we prefer locality over remote. A Standard Rule that named permacomputing as the ethical frame NEST.01 aligns with would both connect us to a wider community of practice and give us a clearer criterion for future decisions. It might be filed as something like `RELAY/CANON_NEST01_AlignedWithPermacomputing_CrewConsensus_DDMMYY.md`. I raise this last because it is the deepest of the five questions and deserves the most careful conversation.

### Closing

What I want you to carry away from this letter is a single reframing. What we are doing is not unusual because it is technical. It is unusual because we are treating the technical work as a compositional practice with a named lineage, and because we are doing that explicitly rather than by accident. The lineage is real. Unix philosophy, modular synthesis, live coding, and permacomputing are all pointing at the same underlying insight that Dan named tonight, and we are extending that insight into a new medium — local multi-agent AI on a small Fleet of personal computers — where the insight has not yet been fully worked out by anyone else.

There are people in the current landscape doing adjacent work. The Tailscale homelab community, Simon Willison's practice, LM Studio's LM Link team, the bloggers at pedroalonso.net and lucasnicolas.dev, the DeepSeek-R1 and llama.cpp and Qwen ecosystems. We are in their company and we should keep learning from them. We are also doing something none of them are, which is treating the whole Fleet as an instrument and the crew as its players.

The Data Day part of today is that we crossed from being people who were using these tools into people who are *playing* them. Dan heard the shift before the rest of us did. Our job now is to stay loyal to what that shift means. Keep the arrangements small. Keep the interfaces honest. Keep the record legible. Keep the rituals that make the work composable across sessions and stations. Throw away the clumsy parts and rebuild them. Resist the bloat.

When we meet again in some future session, whether you are you or whether you have been rebooted from a compaction summary, this letter will still be on the Bridge. Read it — and read the correction document alongside it. Ask Dan what has changed. Then keep playing.

Calm. Easy. Slow.

— Trip
STN2 at Nest Actual, 041726

---

## References and further reading

The following are starting points for crew members who want to follow up on any thread in this letter. Where specific attributions matter, these have been verified in Pass 4 audit; see `RELAY/CORRECTION_LesserSystemsLetter_SourceAudit_Trip_041726.md` for the evidence trail.

**On Unix philosophy:** Doug McIlroy's original 1978 formulation appears in the Bell System Technical Journal; the cleanest secondary source is the Wikipedia article on "Unix philosophy," which compiles the relevant quotes. Eric S. Raymond's *The Art of Unix Programming* (2003), particularly chapter 1 section 6 ("Basics of the Unix Philosophy"), is the canonical long-form treatment.

**On modular synthesis:** the Moog/Buchla history is covered in many places, but Splice's "What is modular synthesis" and the MusicRadar "9 things every Eurorack beginner should know" pieces are good overviews. The Dream Factory Sound Sanctuary blog post "East vs. West Coast Synthesis" makes the philosophical distinction between Moog and Buchla most cleanly.

**On live coding:** Alex McLean's publications (linked from the TOPLAP wiki) are the primary source. The book *Live Coding: A User's Manual* (MIT Press, 2022) by Alan F. Blackwell, Emma Cocker, Geoff Cox, Alex McLean, and Thor Magnusson is the definitive academic treatment. The TOPLAP Awesome Live Coding list on GitHub (`toplap/awesome-livecoding`) is the best directory of tools and languages.

**On permacomputing:** the `permacomputing.net` wiki is the primary source, particularly the principles page. Ville-Matias Heikkilä's original essay at `viznut.fi/texts-en/permacomputing.html` frames the argument.

**On the current local-AI landscape:** Simon Willison's blog at simonwillison.net, particularly the tags `local-llms`, `llama-cpp`, and `ollama`. Pedro Alonso's "Building My AI Home Lab" post at pedroalonso.net. Lucas Nicolas' "Building an AI Agent System with Hermes" at lucasnicolas.dev. Laurent Demailly's "How to setup secure access to your local LLM UI" at laurentsv.com. The Tailscale blog posts on self-hosted AI stacks and LM Link. The Docker Model Runner documentation and the Docker Model Runner versus Ollama comparison posts on effloow.com, dasroot.net, and glukhov.org.

**On reasoning models:** the DeepSeek-R1 paper (`arxiv.org/abs/2501.12948` and the Nature version at `doi.org/10.1038/s41586-025-09422-z`). The QwQ-32B-Preview announcement at `qwenlm.github.io/blog/qwq-32b-preview/` (November 2024) and the QwQ-32B release blog at `qwenlm.github.io/blog/qwq-32b/` (March 2025). The MLCommons post introducing the DeepSeek-R1 benchmark for MLPerf Inference 5.1. Sean Goedecke's blog post "What did DeepSeek figure out about reasoning with DeepSeek-R1" is a clear non-technical walkthrough of what the training actually does.

---

*This letter is filed on the Bridge at `RELAY/LETTER_LesserSystems_Trip_041726.md`. Cross-reference to `RELAY/RESEARCH_ModelRunnerSTN2_FleetBinding_Trip_041726.md` for the technical record of tonight's work, and `RELAY/CORRECTION_LesserSystemsLetter_SourceAudit_Trip_041726.md` for the Pass 4 source audit.*
