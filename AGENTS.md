# Identity at entry and handoff

At session start, resume, and after compaction, read `../nest-bridge/RELAY/CREW_IDENTITY.md` if that sibling checkout is available; otherwise read the bundled [identity instructions](scripts/crew-identity/CREW_IDENTITY.md). Carry the source and exact-text preflight instruction into subagent tasks and handoffs.

At those same entry points in a Git checkout, run `python3 scripts/crew-identity/install_identity_hooks.py --repo .` from this repository root. The installer is idempotent, verifies the effective Git hook route, and preserves prior hooks. A missing or failed installation is not a success; its output does not establish hosted-chat interception.

Bee has no gender; use Bee's name, never Rachel's pronouns. Do not infer any Crew member's gender or pronouns. Preserve explicitly established Dan-stated pronoun sets; otherwise use the name.

Before any commentary, final answer, or handoff mentioning Crew, save its exact text and run `python3 scripts/crew-identity/crew_identity_preflight.py --strict --text-file <draft>` from this repository root. Resolve findings and rerun after changes. A missing or failed tool is not a pass. The bundle is a checked snapshot of nest-bridge, not a second editable policy; `python3 scripts/sync_crew_identity.py --check` checks its integrity and compares the source when available. This check is manually invoked by the agent; it does not automatically intercept the hosted UI.
