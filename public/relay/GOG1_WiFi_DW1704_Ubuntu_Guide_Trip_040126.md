# Getting the Dell DW1704 (BCM943142HM) working on Ubuntu

**The BCM943142HM requires the proprietary `wl` driver — it is the only Linux driver that supports this chip.** Install it via `bcmwl-kernel-source`, blacklist the conflicting open-source modules, and connect at least one antenna before expecting any WiFi networks to appear. The Bluetooth half of this combo card needs separate setup: a manually downloaded firmware file and the `btusb` kernel module. Below is every step, command, and known gotcha for this specific card on Ubuntu 22.04 through 24.04.

---

## The only working driver is `wl` (broadcom-sta)

The BCM43142 (PCI ID **`14e4:4365`**) is supported exclusively by Broadcom's proprietary STA driver, packaged in Ubuntu as `bcmwl-kernel-source`. The Ubuntu WifiDocs page, the canonical Ask Ubuntu answer (#55868), and the Arch Wiki all confirm this mapping. None of the open-source alternatives work:

- **b43** — does not support BCM43142 at all
- **brcmsmac** — only supports BCM4313, BCM43224, BCM43225
- **brcmfmac** — for FullMAC devices on SDIO/USB buses, not this PCIe chip

Do not waste time attempting the open-source drivers. The `wl` driver is a self-contained proprietary binary that bundles its own firmware, so **no separate WiFi firmware package is needed** — no `linux-firmware`, no `firmware-b43-installer`.

---

## Step-by-step installation commands

### Prerequisites and install

```bash
# Ensure restricted repo is enabled (usually is by default)
sudo add-apt-repository restricted
sudo apt update

# Install build dependencies and the driver
sudo apt install linux-headers-$(uname -r) build-essential dkms
sudo apt install bcmwl-kernel-source
```

### Blacklist conflicting modules

The `bcmwl-kernel-source` package should auto-create a blacklist file, but this has been historically unreliable (Ubuntu bugs #747002, #873117). Create one explicitly:

```bash
sudo tee /etc/modprobe.d/blacklist-broadcom-wireless.conf <<'EOF'
blacklist b43
blacklist b43legacy
blacklist b44
blacklist ssb
blacklist bcma
blacklist brcm80211
blacklist brcmsmac
blacklist brcmfmac
EOF

sudo update-initramfs -u
```

### Load the driver and verify

```bash
# Unload any conflicting modules, then load wl
sudo modprobe -r b43 ssb bcma brcmsmac brcmfmac wl
sudo modprobe wl

# Confirm it loaded
lsmod | grep wl
iwconfig
```

Then reboot to make everything permanent:

```bash
sudo reboot
```

### Offline install (no Ethernet available)

If you have no wired connection, download these `.deb` files on another machine from `packages.ubuntu.com` and transfer via USB: `dkms`, `linux-headers-$(uname -r)`, `build-essential`, and `bcmwl-kernel-source`. Install with `sudo dpkg -i *.deb`.

---

## Connect the antennas — this is not optional

The BCM943142HM has two U.FL antenna connectors (MAIN and AUX) and **no usable on-board antenna element**. With both pigtails disconnected, the card will be detected by `lspci` and the `wl` driver will load, but you will see zero access points. The open U.FL ports create a severe impedance mismatch (high VSWR) that reflects nearly all RF energy back into the transmitter. At best, you might see a fleeting signal from a router sitting centimeters away — in practice, the card is non-functional.

**Connect at least the MAIN antenna pigtail.** With one antenna you lose MIMO diversity (max throughput drops from ~300 Mbps to ~150 Mbps on 802.11n 2.4 GHz) but WiFi works normally. With both connected, you get full 2×2 performance. The card will not be damaged by transmitting into an open connector — 100 mW is too low to cause harm — but it simply won't work without a proper 50Ω load.

If the pigtails are disconnected and you're troubleshooting "driver loads but no networks visible," **this is almost certainly the cause**, not a software issue.

---

## Verifying card detection with lspci

```bash
lspci -nnk | grep -iA3 network
```

Expected output for the Dell DW1704:

```
XX:00.0 Network controller [0280]: Broadcom Inc. and subsidiaries BCM43142 802.11b/g/n [14e4:4365] (rev 01)
        Subsystem: Dell Wireless 1704 802.11n + BT 4.0 [1028:0016]
        Kernel driver in use: wl
        Kernel modules: bcma, wl
```

**Key things to check:** The `Kernel driver in use` line must say `wl`, not `bcma-pci-bridge`. If it shows `bcma-pci-bridge`, the blacklist didn't take effect — re-run the blacklist procedure above and `sudo update-initramfs -u`.

Additional verification commands:

```bash
# Driver version
modinfo wl | grep version
# Expected: 6.30.223.271

# DKMS build status
dkms status

# Check Secure Boot (if wl silently fails to load)
mokutil --sb-state
```

---

## Kernel and Ubuntu version compatibility

The broadcom-sta driver is essentially abandoned upstream and requires community patches for each new kernel release. Compatibility varies significantly:

**Ubuntu 22.04 LTS (kernel 5.15)** — the most reliable option. The `bcmwl-kernel-source` package version `6.30.223.271+bdcom-0ubuntu10~22.04.1` works well on the GA kernel. HWE kernels (5.19+) had a brief breakage due to a removed `PCI_DMA_TODEVICE` symbol (Bug #2022968) but this was patched.

**Ubuntu 24.04 LTS (kernel 6.8)** — works on the GA kernel with package version `6.30.223.271+bdcom-23ubuntu1.1`. However, HWE kernels introduce problems: **kernel 6.11+** has confirmed DKMS build failures where the `wl` module simply doesn't get built. Kernel **6.14** won't compile broadcom-sta at all. Kernel **6.15** removed `del_timer` and made `MODULE_DESCRIPTION` mandatory (Bug #2111898). Kernel **6.17** has multiple compilation errors (Bugs #2120508, #2141156). Patches exist in `noble-proposed` but may not be in `-updates` yet.

**Practical advice:** If you're on 24.04, stick with the GA kernel (`linux-generic`) rather than accepting HWE kernel upgrades:

```bash
# Pin to GA kernel if HWE breaks your WiFi
sudo apt install linux-generic
# Then select the 6.8.x kernel in GRUB at boot
```

**Long-term outlook:** This driver breaks with nearly every major kernel release. If you plan to run this system for years, consider replacing the BCM943142HM with an **Intel AX200/AX210** or **Atheros** Mini PCIe card — both have excellent mainline kernel support with no proprietary drivers needed.

---

## Secure Boot will silently block the driver

The `wl` module is an out-of-tree DKMS module that is **not signed by Canonical**. With UEFI Secure Boot enabled, the kernel refuses to load unsigned modules — and the only symptom is `modprobe: ERROR: could not insert 'wl': Key was rejected by service`, or worse, complete silence.

Ubuntu's DKMS framework should automatically generate a Machine Owner Key (MOK) and prompt you to enroll it at the next reboot (a blue UEFI screen appears). If you miss or skip that enrollment step, `wl` won't load. Your options:

```bash
# Check Secure Boot state
mokutil --sb-state

# Option 1: Disable Secure Boot in BIOS/UEFI (simplest)

# Option 2: Re-trigger MOK enrollment
sudo update-secureboot-policy --enroll-key
# Reboot and complete the enrollment in the blue MOK Manager screen

# Option 3: Manually sign the module
sudo kmodsign sha512 \
  /var/lib/shim-signed/mok/MOK.priv \
  /var/lib/shim-signed/mok/MOK.der \
  /lib/modules/$(uname -r)/updates/dkms/wl.ko
```

For a desktop XPS 8700, disabling Secure Boot is the simplest path and carries minimal practical risk.

---

## Bluetooth needs separate firmware and setup

The DW1704 is a combo card, but WiFi and Bluetooth are **architecturally independent subsystems**. WiFi uses PCI; Bluetooth uses an internal USB bus. They need separate drivers and the Bluetooth firmware is not bundled with broadcom-sta.

### Identify the Bluetooth device

```bash
lsusb | grep -i broadcom
# Expected: ID 0a5c:21d7 Broadcom Corp. BCM43142 Bluetooth 4.0
```

### The firmware problem

The kernel's `btusb` and `btbcm` modules load automatically but immediately fail because Ubuntu's `linux-firmware` package **does not include BCM43142 Bluetooth firmware** — a known omission since 2014 (Bugs #1366418, #1859846). You'll see this in `dmesg`:

```
bluetooth hci0: Direct firmware load for brcm/BCM43142A0-0a5c-21d7.hcd failed with error -2
Bluetooth: hci0: BCM: Patch brcm/BCM43142A0-0a5c-21d7.hcd not found
```

### Install Bluetooth firmware and packages

```bash
# Install the Bluetooth stack
sudo apt install bluez bluez-tools

# Download the firmware file
sudo wget -O /lib/firmware/brcm/BCM43142A0-0a5c-21d7.hcd \
  https://github.com/winterheart/broadcom-bt-firmware/raw/master/brcm/BCM43142A0-0a5c-21d7.hcd

# Reload the Bluetooth module
sudo modprobe -r btusb
sudo modprobe btusb

# Enable the Bluetooth service
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

### Verify Bluetooth

```bash
# Check kernel messages for successful firmware load
sudo dmesg | grep -i bluetooth

# Check for rfkill blocks
rfkill list
# If soft-blocked: rfkill unblock bluetooth

# Test with bluetoothctl
bluetoothctl
# Inside the prompt:
  show           # Should display controller info
  power on
  scan on        # Should discover nearby BT devices
  quit
```

Bluetooth works independently of the WiFi driver — you can have `wl` unloaded and Bluetooth still functions, and vice versa. One caveat: on some Dell systems, a hardware wireless toggle (Fn+F2) may hard-block both radios simultaneously. Check `rfkill list` if both are dead.

**Known Bluetooth issues:** audio quality over BT headphones is frequently reported as poor (crackling, dropouts) with this chipset, and Broadcom has discontinued consumer firmware updates, meaning known BT vulnerabilities (CVE-2018-5383, CVE-2019-9506, CVE-2020-10135) will never be patched. For reliable Bluetooth, a **USB BT 5.0 dongle** (~$10) is a worthwhile upgrade.

---

## Conclusion

The Dell DW1704 works on Ubuntu but demands more manual setup than most WiFi cards. The three essentials are: install `bcmwl-kernel-source` with its blacklist, connect at least one antenna pigtail, and manually download the Bluetooth firmware `.hcd` file. The most common failure modes — "driver loads but no networks" and "Bluetooth controller not found" — trace directly to missing antennas and missing firmware, respectively, not to driver bugs.

The deeper concern is longevity. The proprietary `wl` driver breaks with almost every kernel major version bump, and Ubuntu maintainers must continuously backport community patches to keep it compiling. On the 24.04 GA kernel (6.8) it works today; on HWE kernels 6.11+ it's increasingly fragile. For a desktop like the XPS 8700 with an accessible Mini PCIe slot, swapping in an Intel AX200 or AX210 card eliminates the proprietary driver dependency entirely and provides Wi-Fi 6/6E with mainline kernel support — a worthwhile $15 investment if the DW1704 becomes untenable on future kernels.