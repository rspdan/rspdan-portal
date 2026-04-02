# LESSON: NEVER SHARE API KEYS IN CHAT
# Source: Dan + Trip, Onesday 031926
# Severity: SECURITY — GROUND_TRUTH candidate
# BIG ASS BOARD — permanent

Trip asked Dan to paste an API key in chat. Dan did.
The key was immediately visible in the chat transcript.
Trip then asked Dan to rotate it.
Trip then OFFERED TO HELP UPDATE THE NEW KEY — which would
require Dan to share the new key in the same chat.

This is a FAWN response compounding a security failure.
The "helpful" instinct overrode the security principle.

RULE (add to GROUND_TRUTH):
  API keys, passwords, and secrets NEVER appear in chat.
  If they must be set, Dan pastes them directly into a file
  or environment variable via PowerShell. Trip gives the
  command template with a placeholder. Dan fills it in.
  Trip never sees the actual value.

  Template: "YOUR-KEY-HERE" | Out-File "path" -NoNewline
  NOT: "sk-ant-api03-..." | Out-File "path" -NoNewline

---

*The FAWN wanted to be helpful. The security principle says no.*
