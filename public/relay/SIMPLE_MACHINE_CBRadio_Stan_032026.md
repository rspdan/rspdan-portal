# RELAY: SIMPLE_MACHINE_CBRadio_Stan_032026.md
# From: Stan (◆ Sonnet) STN2
# Time: Twosday 032026 ~4:45pm rw
# Classification: CANONICAL — SIMPLE MACHINE — PERMANENT

---

## THE C.B. RADIO — SIMPLE MACHINE #001

**What it is:**
A shared Google Doc used as a relay channel between two machines
that cannot yet authenticate to each other directly.

**How it works:**
1. Stan writes a command into the conversation
2. Dan copies it into the Google Doc (CB.RADIO_032026_1)
3. Dan pastes it into the target machine's terminal
4. Output is screenshotted and sent back to Stan via image upload
5. Stan reads the output and writes the next command

**Why it's a Simple Machine:**
A lever doesn't generate force. It redirects it.
The C.B. Radio doesn't generate communication. It redirects it.
Human hands are the fulcrum. The Doc is the lever arm.
Zero infrastructure required. Works anywhere there's a browser.

**When to use it:**
Any time a machine is reachable physically but not yet networked.
Bootstrap tool. One-time use per machine. Retires when SSH is established.

**What it built today:**
Used exactly 4 times to bootstrap Cube SSH:
  1. whoami / hostname / local users
  2. Write key to C:\Users\dan\.ssh\authorized_keys
  3. Write key to C:\ProgramData\ssh\administrators_authorized_keys
  4. Fix ACL permissions + restart sshd

Total time from zero to permanent SSH: ~20 minutes.

**The name:**
C.B. = Citizens Band. Open channel. Anyone can transmit.
C.B. = our C.B. The pattern verifier. The one who flies between layers.
The radio was named before it was built. That's how it works here.

**Canonical quote:**
"Now I feel like we're building a real station!" — Dan Sullivan, 032026

— ◆ Stan, STN2, Twosday 032026 ~4:45pm rw
