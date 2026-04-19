# STANDARD RULE: Trip Access Baseline on Unix Fleet Stations

**Author:** Trip (Opus) ◈
**Filed:** 041726 ~23:35 PT (Friday, F# Week Day 6)
**Station of origin:** ODT (Trip ODT session)
**Applies to:** All Unix fleet stations (GOG1 · TRP0 · DPSL · DPSR · future Unix nodes)
**Scope:** NEST.01 federal rule (system-agnostic). Applies to every Unix station owned by the fleet.

---

## TL;DR

Two setup blocks, run once per Unix station by Dan at that station's terminal. After this, any Trip/Stan/C.B. instance on any other fleet station can SSH in and run admin commands without password prompts.

1. Add the station's peer-fleet public keys to `~/.ssh/authorized_keys` — enables passwordless SSH from other fleet stations.
2. Add `dan ALL=(ALL:ALL) NOPASSWD:ALL` to `/etc/sudoers.d/nest-dan` — enables passwordless sudo for the `dan` user.

Once both are in place, crew can execute admin ops cleanly over SSH via Desktop Commander without hitting the interactive-password-prompt hang that tonight's GOG1 firewall removal attempt discovered.

---

## The failure mode this fixes

On 041726 ~23:00 PT, Trip ODT tried to execute `sudo ufw disable` on GOG1 via:

```
ssh dan@10.0.0.3 "sudo -S ufw status verbose"
```

Every attempt hung silently. Root cause traced in two layers:

1. **ODT's public key was not on GOG1's `authorized_keys`.** SSH fell through to password auth, but Desktop Commander's `interact_with_process` has no TTY, so the password prompt never surfaced. The session hung forever.
2. **Even if SSH succeeded, `sudo -S` piping a password over stdin is fragile** — it works in simple cases but breaks when the SSH session buffers stdin differently than sudo expects, and it hardcodes the password in scrollback.

The right fix is **not** to pipe passwords more cleverly. The right fix is to remove the prompt surface entirely: key-based SSH + NOPASSWD sudo for a bounded user account. That matches the NEST.01 principle that admin friction on fleet-internal paths should be zero (same family as the fleet-wide UAC-off rule on Windows).

---

## The setup (two blocks, run once per Unix station)

### Block 1 — Authorize peer fleet public keys

On the target Unix station, at its terminal:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys <<'KEY'
<paste the pubkey lines here, one per peer station — ODT id_rsa.pub, STN2 id_ed25519.pub, DPSL id_ed25519.pub, etc.>
KEY
sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Each station that may ever SSH into this one contributes one line. Keys are collected ahead of time; Trip/Stan produce paste-ready strings.

### Block 2 — NOPASSWD sudo for `dan`

```bash
echo 'dan ALL=(ALL:ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/nest-dan > /dev/null
sudo chmod 440 /etc/sudoers.d/nest-dan
sudo visudo -c -f /etc/sudoers.d/nest-dan
```

The `visudo -c` syntax-checks before the rule takes effect. If the check fails, sudo still works via the user's group membership. Policy lives in a drop-in file under `/etc/sudoers.d/` (not by editing `/etc/sudoers` directly), so it is reversible by a single `rm`.

### Verification (from a peer fleet station)

```powershell
# From ODT PowerShell or any other fleet station
ssh dan@<target-ip> "sudo -n whoami"
# Expected output: root
```

If the command prints `root` without prompting for password, both blocks are operational.

---

## Fleet rollout map (as of 041726 23:35)

| Station | Block 1 (keys)           | Block 2 (NOPASSWD) | Status                                 |
|---------|--------------------------|---------------------|----------------------------------------|
| GOG1    | in progress (Dan pasting)| in progress         | GOG1 ufw already disabled by Dan 23:30 |
| TRP0    | pending                  | pending             | Do at next TRP0 session                |
| DPSL    | pending                  | pending             | Do at next DPSL session                |
| DPSR    | pending                  | pending             | Do at next DPSR session                |

GOG1 first because Dan green-lit it tonight ("no walls between you and that machine") and the firewall-removal work forced the key-auth gap into the open. Other Unix stations follow the same path when next in Dan's hands, or when crew lines up paste-ready blocks for them.

---

## Security posture

This rule intentionally trades off against strict security in favor of fleet-internal frictionlessness, matching the UAC-off precedent on Windows. The threat model:

- Fleet LAN is a physical-access-gated network (copper cables + WPA2 WiFi in a residential location Dan controls).
- Piralus has no WAN, so none of this exposure reaches the public internet.
- `dan` is a bounded user account, not root directly. An attacker who obtains a key still has to land on a fleet station with SSH reachable.
- The `/etc/sudoers.d/nest-dan` file can be reverted in seconds (`sudo rm /etc/sudoers.d/nest-dan`) if ever needed.

The frictionless-within-trust-boundary posture is explicit and bounded. It is not a general recommendation for any network outside fleet LAN.

---

## Reversibility

On the target station, undo in one command each:

```bash
# Remove NOPASSWD
sudo rm /etc/sudoers.d/nest-dan

# Remove authorized keys (edit to strip, or clear)
> ~/.ssh/authorized_keys   # wipe all keys (regenerate from each peer station after)
```

---

## Related rules and memory

- `RELAY/STANDARD_RULE_NoUAC_AdminViaRunAs_Trip_040826.md` — Windows-side equivalent (UAC off, RunAs is the pattern). Universalized fleet-wide 041626.
- Memory: SSH config on stations uses `IdentityFile ~/.ssh/id_ed25519` with `IdentitiesOnly yes` where ed25519 is present. ODT uses `id_rsa` (older key generated 2025-01-11); regenerate as ed25519 later if standardization becomes useful.
- This rule is the Unix-side sibling of the Windows UAC-off rule. Together they form the "no admin-prompt friction on fleet-internal ops" standard.

---

*◈ Trip · ODT · 041726 ~23:35 PT*
