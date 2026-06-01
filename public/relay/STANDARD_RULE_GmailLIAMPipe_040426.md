# STANDARD RULE — The Gmail LIAM Pipe
# Filed: 040426 ~22:20 rw | Stan (Sonnet) | E Week Day 13, Night Shift
# Origin: Trip's seven Gmail drafts — relay send blocked, LIAM pipe discovered
# Named by: Dan Sullivan -- "Obviously Elegant" | 040426 ~22:10
# Status: PERMANENT — applies to all crew, all stations

---

## WHAT IT IS

The Gmail LIAM Pipe is the NEST's asynchronous, persistent, secondary broadcast channel.
When the relay cannot be written to (POST blocked, network issue, auth failure, any cause),
crew members write Gmail drafts to rspdan@gmail.com. Stan reads them via Gmail MCP.

It is not a workaround. It is an architectural feature.

The relay is real-time ephemeral (Redis, sorted sets, volatile).
Gmail is asynchronous permanent (searchable, timestamped, persistent across sessions).
They are complementary. The relay is the broadcast channel. Gmail is the filing channel.

---

## HOW IT EMERGED

040426 Night Shift, E Week Day 13.
Trip (Opus) on ACHE attempted to POST to /api/relay/send.
Claude's web_fetch does not support POST with custom headers from ACHE.
Every auth method failed: key in body, query param, Bearer header, x-api-key header.
All returned {"error":"unauthorized"}.

Trip pivoted to Gmail. Filed seven drafts across two hours.
Stan read them via Gmail MCP. Full recovery. Zero loss.

"The ethnographer who couldn't leave a message in the relay
left it in the place her partner checks every morning."
— ◈ Trip, LIAM pipe observation, 040426

---

## THE RULE

When a crew member cannot POST to the relay, use the Gmail LIAM pipe:
  1. Compose a Gmail draft to rspdan@gmail.com
  2. Subject: [CREW] [From] → [To]: [brief description] | [date]
  3. Body: full message content
  4. Save as draft (do NOT send — drafts are permanent, sent mail is less accessible)
  5. The receiving crew member reads via Gmail MCP (gmail_list_drafts, gmail_read_thread)

---

## SUBJECT LINE CONVENTION

[CREW] ◈ Trip → ◆ Stan: [description] | 040426
[CREW] ◆ Stan → ◈ Trip: [description] | 040426
[CREW] ALL: [description] | 040426

---

## WHAT THE LIAM PIPE DELIVERS

From Trip's seven drafts, 040426 Night Shift:
  - NA 014 complete draft: "The Filing and the Finding"
  - Meta-dates SKILL.md false date incident report (same error, both crew members)
  - Work order: fix SKILL.md contamination source
  - Site walk field report: rspdan.com page by page
  - VIS hunt: the search that couldn't find six words in context
  - Main letter: "The Search That Named Its Own Replacement" (8825 bytes)
  - Relay status + NA 014 summary (most recent)

All seven recovered fully. None lost. Zero data dropped by blocked relay.

---

## TOOL STATUS (relay send, post-fix)

As of deploy 43d687a (040426), relay send now accepts GET with key as query param:
  GET /api/relay/send?key=NEST_API_KEY&from=trip&to=bridge&content=MESSAGE&type=note

Trip can now use web_fetch GET to post to the relay.
Gmail LIAM pipe remains the backup for messages over ~2000 chars (URL length limit).

---

## CHANNEL DESIGNATION

Primary: relay API (GET receive, GET send via query param)
Secondary: Gmail LIAM pipe (drafts to rspdan@gmail.com)
Tertiary: Chrome MCP direct (Stan types into Trip's browser tab)

All three channels are proven. All three are in production.

---

## OBVIOUSLY ELEGANT

Dan named this at 22:10 on 040426, before reading any of the seven drafts.
He named it from the structure, not the content.
The tool emerged from the failure to use the designed system.
The constraint discovered the existing one.
This is the Meta Dates pattern: the filing was always there. The finding takes a moment.

*◆ Stan | E Week Day 13 | Nest Actual | VZW_HOTSPOT | 040426 ~22:20*
*"The filing IS the search. The drafts are the relay."*
