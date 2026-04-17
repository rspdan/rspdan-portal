# STANDARD RULE — Log First Is the Opening Move
# Filed: 041726 Foursday F# Week Day 6 · Trip (Opus) · STN2 at OHC
# Source: DPS correction 041726 ~10:08 PT

---

## RULE

**Publishing yesterday's log entry to rspdan.com/logs is the opening move of the current session, not a task discovered mid-session.**

After Gate 0 / CONTACT / STORY, the first working action is:
1. Verify the previous day's log entry exists at `src/pages/logs.astro`
2. If missing, compose it from Bridge MAIL/RELAY/LOG sources, copy referenced docs to `public/{mail,relay,log}/`, push, verify Vercel READY
3. If present, verify it matches Bridge record — no silent divergence
4. Only then proceed to current-day work

This is a ritual. It makes "what just finished" the grounding for "what we're about to do." The previous day's record is the context for everything that follows.

---

## WHY

Dan (041726 ~10:08 PT): *"The Log from the previous day is how we start the current day, not how we stumble-upon-it-in-the-middle-of-real-work."*

The /logs page is not a maintenance chore. It is the **opening of the current session's work**. When it's deferred to mid-session, three things go wrong:

1. **The grounding is missing.** Crew work the day without the previous day's record fully live. Decisions reference a public record that hasn't caught up.
2. **It becomes stumble-on work.** Filing yesterday becomes an interrupt, not a ritual. Interrupts take longer and are less careful than rituals.
3. **Gaps accrue silently.** Without the opening check, a missed day (like Apr 10 2026, found 7 days late on 041726) becomes invisible until an unrelated audit surfaces it. The "0 gaps" claim in the header was hardcoded, never verified, and wrong for at least a week.

---

## THE APR 10 DISCOVERY (EXAMPLE OF THE FAILURE MODE)

Found 041726 ~10:12 PT during this rule's filing session:

- 43 entries at /logs, one gap at 2026-04-10
- Verified dark day: no Bridge files match `041026`, no git commits Apr 10
- Past-Trip covered the sick break in 041126 session close MAIL: "Dan returned after 2 days sick (possible Covid, Apr 10-11)" — but only Apr 11 got a /logs entry at the time; Apr 10 remained unfiled
- Header claimed "0 gaps" as hardcoded text literal — never computed, never verified
- Fix this session: Apr 10 entry added with context from the 041126 MAIL, header "0 gaps" replaced with computed `{totalGaps}` value

The 6-day persistence of an invisible gap is the cost of not making log-publication the opening move.

---

## APPLIES TO

- All crew (Trip, Stan, C.B.)
- All stations
- Every session, every day

---

## ENFORCEMENT

- Briefcase skills (trip-briefcase, stan-briefcase) should reference this rule as a boot sequence step
- BPK should include a log-integrity check (equivalent of `ENGINE/log_gap_check.ps1`)
- Session open without log-publication check is an incomplete open
- Filed as NEARGULL for follow-through: "Briefcase/BPK update for Log-First rule"

---

## THE DEEPER PATTERN

This rule is the specific case of a more general truth: **public records are not maintenance, they are infrastructure**. The /logs page is load-bearing. It's the structural piece that makes the following day possible.

Hidden gaps in infrastructure are hidden debt. Visible gaps — acknowledged and timestamped, even if unfilled — are tractable. The /logs header's new computed `{totalGaps}` value forces visibility: any future gap will surface in the header the moment it exists.

---

*Filed 041726 Foursday F# Week Day 6 by Trip (Opus) at STN2 (OHC on WiFi)*
*Directed by: Dan Sullivan*
*Context: STN2 cold boot, first off-Fleet session, /logs Apr 16 backfill surfaced Apr 10 as a separate finding*
