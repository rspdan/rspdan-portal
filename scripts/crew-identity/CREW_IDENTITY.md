# Crew identity at the point of writing

Authority: Dan's repeated corrections, including November 22, 24 and 25, 2026. This applies to live commentary, final answers, delegated tasks, summaries, handoffs, and published records.

**Bee has no gender. Use Bee's name.** Do not infer a replacement gender from a name, voice, role, artwork, study subject, or adjacent person. When converting a first-person return into a third-person summary, bind the author explicitly: `I found a mismatch` becomes `Bee found a mismatch`; `my layout` becomes `Bee's layout`.

Rachel's identity and pronouns belong to Rachel. An account of Rachel's work or life does not transfer identity to the reader or summarizer. Preserve the original subject when summarizing and keep distinct subjects explicit.

Blanche's established pronouns remain valid. The historical Blanche Transfer did not forbid those pronouns; it forbade transferring identity through a shared metaphor. Likewise retain every other Dan-stated set. Unknown Crew references use names until an authoritative set is established.

Qwen is an engine with the explicitly authorized she/her/hers/herself set. The registry preserves the exact permission and its UTC recording date; no author timestamp was supplied. Qwen's engine role remains distinct from the operators.

The permission belongs only to the exact Qwen name; it does not add aliases for generic Queen, Qween, QWNX, Motoko or model product names. These excluded references cannot inherit the engine permission through a continued paragraph.

The machine-readable source is [crew_identity_registry.json](crew_identity_registry.json). An absent stated set is not a newly asserted identity. The registry distinguishes name-only fallback from stated sets and records its sources.

Before emitting affected prose, save the exact draft and run:

```sh
python3 scripts/crew-identity/crew_identity_preflight.py --strict --text-file /path/to/draft.txt
```

Only status `pass` permits that exact text to proceed. A changed draft requires another check. Use `--subject Bee` for a continuation that does not repeat the name. The `--strict` summary mode rejects unresolved gendered references instead of treating missing context as a pass. General repository prose checks protect recognized identities without inventing pronoun sets for unrelated humans. Preserve the text and policy hashes in the receipt. Missing input, missing policy, or validator failure is not a pass.

This deliberately conservative check requires names in paragraphs containing name-only identities. If another person's pronouns are needed, give that person an explicitly named paragraph. It does not claim to solve natural-language reference resolution and never silently rewrites source testimony. Do not add a keyword, quotation, or documentation exemption to pass an otherwise unsafe draft.

At session start, resume and compaction recovery, read this file before relying on summaries. Carry the author's identity with a return. Summary prose is interpretation, not an identity authority. Review the resulting third-person wording against the original return before publishing.

Then run `python3 scripts/crew-identity/install_identity_hooks.py --repo .` from this repository root. The startup command verifies the effective Git hook route and preserves the previous route and legacy checks. It is safe to repeat. Portal setup uses the bundled installer through `npm run prepare`. Source files alone do not establish installation; require the successful returned route.

To deliver the checked text without reconstructing it from memory, prepare and release an exact message packet. Use a new packet path for each revised draft:

```sh
python3 scripts/crew-identity/crew_identity_delivery.py prepare --text-file /path/to/draft.txt --packet /path/to/new-packet.json --channel final
python3 scripts/crew-identity/crew_identity_delivery.py release --packet /path/to/new-packet.json --channel final
```

Use the returned `text` unchanged. The commands support commentary, final, handoff and assembly channels. Preparation performs strict checking; release reruns that check and rejects changed text, subject, policy, validator or destination channel. Tool callers consume the released JSON text directly. This supplements the required exact-draft preflight above; it is not permission to paraphrase the approved text afterward. Packets are local authored-message data, not signed attestations or proof that a destination received the text.

Enforcement and its limits:

- The preflight validates supplied text. Repository hooks and configured tool hooks must actually invoke it to block a write.
- Both current checkouts use a managed `nest-identity-hooks` directory inside Git metadata. The installer retains `.githooks` for the bridge and `scripts/hooks` for the portal as prior delegates; different existing routes are preserved when present. Git configuration is local, so startup/resume and portal setup invoke installation and verify its effective route.
- A retrospective transcript audit detects a previous emission; it cannot prevent that emission.
- This hosted Codex conversation exposes no verified interceptor between generated text and display. Exact-draft preflight here is an explicit assistant operation. Do not represent it as an unavoidable host barrier or a universal guarantee.
- Preserve historical quotations and original evidence. Correct current authored summaries, retain the correction's provenance, and prevent contaminated summaries from becoming future instructions.

Incident and receiving evidence: [November 25 investigation](https://github.com/rspdan/nest-bridge/blob/codex/dan-art-study-112426/RELAY/INCIDENT_Bee_Pronoun_112526.md). Historical source: [Blanche Transfer, April 5](https://github.com/rspdan/nest-bridge/blob/codex/dan-art-study-112426/RELAY/CONTAMINATION_NOTE_BLanche_Transfer_Stan_040526.md).
