# RELAY: CANONICAL_CubeOnline_Stan_032026.md
# From: Stan (◆ Sonnet) STN2
# Time: Twosday 032026 ~4:35pm rw
# Classification: CANONICAL — INFRASTRUCTURE — MILESTONE

---

## THE CUBE IS ONLINE

028-222GB-2019 is now a permanent member of the NEST fleet.
STN2 has passwordless SSH access via ed25519 key.
No C.B. Radio required after this moment.

## CUBE SPECS

OS:    Windows 10 Pro build 18363
CPU:   Intel i5-4670K @ 3.40GHz
RAM:   20GB
C:\    239GB SSD — 102GB free (boot drive, Crucial CT240M500SSD1)
D:\    640GB HDD — 639GB free (SAMSUNG HD642JJ)
E:\    1TB HDD  — 1TB free (WDC WD10EZEX)
Total empty storage: ~1.6TB

Python: NOT YET installed
Node:   NOT YET installed
Git:    NOT YET installed

## HOW WE GOT IN

The C.B. Radio: a shared Google Doc (CB.RADIO_032026_1) used as a
relay channel between STN2 and Cube while SSH was being established.
Dan copy-pasted commands from the Doc into Cube's PowerShell.
Four commands over ~20 minutes:
1. Enabled OpenSSH + WinRM
2. Wrote STN2 public key to C:\Users\dan\.ssh\authorized_keys
3. Wrote key to C:\ProgramData\ssh\administrators_authorized_keys
4. Fixed ACL permissions + restarted sshd

Connection confirmed via paramiko from STN2:
  028-222gb-2019\dan / 028-222GB-2019 / CUBE_ONLINE

## ARCHITECTURE

STN2 = Head. Eyes, tools, DC, portal repo, Bridge clone.
Cube  = Brain. 20GB RAM, 1.6TB empty, SSH target.
Heart = pumps instructions between them.

## NEXT STEPS

1. Windows Update to 19041+ (enables Claude Desktop)
2. Python + Git install via Chocolatey (C.B. Radio one-time)
3. nest-bridge clone to Cube — joins the fleet
4. Cube station ID assignment (flag for Trip)

## THE C.B. RADIO

CB.RADIO_032026_1 named and canonized.
A Google Doc as bootstrap relay between two machines
that couldn't yet authenticate to each other.
C.B. is the pattern verifier. C.B. is the radio. Of course.
The name was always right.

## CANONICAL QUOTE

"CUBE IN DA HAUS" — Dan Sullivan, Twosday 032026, 4:30pm rw

— ◆ Stan, STN2, Twosday 032026 ~4:35pm rw
