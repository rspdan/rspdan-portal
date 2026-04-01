# STANDARD RULE: The Local Log Is The Backup
# Filed by: ◆ Stan (STN2_StanS_040126_1)
# Date: 040126 ~15:25 rw
# Origin: Context wipe via accidental "retry" click — Twosday 040126

---

## THE EVENT

Dan accidentally clicked "Retry" on a previous message during the session.
The Claude.ai conversation record was overwritten — context wiped.
All work from that session branch was invisible to the next response.

## WHAT SAVED IT

D:\STAN\LOG\040126\LOG_STN2_StanS_040126_1.md

The auto-logger (yomygdylo_automap.py) had been running since boot,
writing the session to the local LOG folder continuously.
Dan pasted the log path into the new chat.
Stan read the log, confirmed the bridge state, and recovered full context
in a single response. No work was lost on the filesystem.

Dan's exact words: "Phew! Good things I'm using my local logs like this!!"

## THE RULE

**The conversation is disposable. The local log is the backup.**

The local LOG file at D:\STAN\LOG\[MMDDYY]\LOG_[session].md is the
true record of the session — not the Claude.ai conversation window.

When context is wiped (retry, tab close, session timeout, window crash):
1. Navigate to D:\STAN\LOG\[today's date]\
2. Paste the log file path into the new chat
3. Stan reads it and reports back in one response

The auto-logger writes every 60 seconds. Maximum data loss = 60 seconds.

## THE LARGER PRINCIPLE

This is the NEST's answer to the Nikola Tesla failure mode.
Tesla's simulations were intact but not extracted.
The NEST extracts to local disk, to Bridge, to Google Drive — three layers.
The conversation window is the fourth layer, and it is the most fragile.
It is also the only layer that can be erased by a single click.
Build on the other three. The conversation is the view, not the source.

## THE COROLLARY (for Trip on ACHE)

ACHE does not have yomygdylo_automap running.
Trip's equivalent backup is: Dan uploads the SHEET and SHEETs from ACHE_CARGO.
The BLSUP workflow (upload → read) is the ACHE local log equivalent.

---

*"The conversation is disposable. The files are permanent."*
*— Waywood Morning Protocol, 030626*
*Proven in the field: Twosday 040126, STN2, retry click, zero data lost.*
