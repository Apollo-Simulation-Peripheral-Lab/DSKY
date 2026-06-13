# Deploying code to a DSKY over the network

This guide explains how to push the `next-dsky` software onto a physical DSKY (the Orange Pi inside it) from your PC, step by step. You need this in two situations:

1. **One-time OTA bootstrap** — installing the over-the-air update system onto a device that doesn't have it yet. After this, the device updates itself from its own menu (see [updates.md](updates.md)) and you never need this guide again for that device.
2. **Developer workflow** — pushing your latest local changes to a test device to try them on real hardware, without cutting a release.

The whole process is done **from your PC's terminal**. You never plug a keyboard into the DSKY. The Orange Pi inside it is a small Linux computer on your network, and you control it remotely over SSH.

> **A note on terminology:** "from your PC" means a terminal on your normal computer. `ssh user@host '<command>'` runs `<command>` *on the Pi*, but you type it from your PC — SSH carries the command across the network for you. You do not need to "log into" the Pi manually for the deploy.

---

## Prerequisites

- The DSKY and your PC are on the **same WiFi/LAN**.
- **NodeJS > 18** on your PC (only needed if you want to test locally first).
- A clone of this repository on your PC with the code you want to deploy:
  ```bash
  git clone https://github.com/Apollo-Replica/DSKY.git
  # or, if you already have it, get the latest:
  cd DSKY && git pull
  ```
  Throughout this guide the clone is referred to as `~/DSKY` — adjust to wherever yours lives.

---

## Step 1 — Get the DSKY onto your WiFi

Skip this if the device is already on your network (e.g. via Ethernet).

### The on-device WiFi portal

In the DSKY menu (press **NOUN** three times) go to **SETTINGS → WIFI**. The device starts a temporary WiFi access point called **"DSKY Replica"** and shows a QR code.

That QR is a *"join this WiFi network"* code, **not** a scan-to-open-a-website code. If this doesn't work, connect it like this:

1. On your phone, open **Settings → WiFi** (the normal network list).
2. Connect to the network named **"DSKY Replica"**.
3. A page opens automatically (like a hotel WiFi portal) where you pick **your home WiFi** and enter its password.
4. The DSKY connects to your WiFi and the "DSKY Replica" network disappears.

---

## Step 2 — Find the DSKY and connect via SSH

### Try the hostname first

The setup guide sets the Pi's hostname to `dsky`, so this may just work:

```bash
ssh orangepi@dsky.local
```

### If that fails: find the IP address

`.local` names rely on mDNS, which **often does not work from WSL** (Linux inside Windows). If you see `Could not resolve hostname dsky.local`, don't fight it — find the device's numeric IP instead:

- **From your router:** open its admin page (usually `http://192.168.1.1`), find the connected-devices / DHCP list, and look for a device named `dsky` or `orangepi`. Note its IP (e.g. `192.168.68.104`).
- **From Windows PowerShell** (not WSL — Windows *can* resolve `.local`):
  ```powershell
  ping dsky.local
  ```
  The reply shows the IP in brackets.

> Your LAN may not use the `192.168.1.x` range. In testing it was `192.168.68.x` — always use whatever your router actually reports.

### Confirm it's the DSKY

Open the IP in your PC's browser with port `3000`:

```
http://<DSKY-IP>:3000
```

If you see the DSKY screen, the IP is correct and the device is reachable. (`Connection timed out` when you try to SSH usually means a **wrong IP**, not a DSKY problem — re-check the IP. `Connection refused` would instead mean SSH isn't running.)

### Connect

```bash
ssh orangepi@<DSKY-IP>
```

- Default password: **`orangepi`** (unless you changed it).
- **The password is invisible as you type** — no dots, no asterisks. This is normal; type it and press Enter.
- A successful login shows a prompt like `orangepi@dsky:~$`. You're now "inside" the Pi. Type `exit` to return to your PC — the deploy below doesn't need you to stay logged in.

---

## Step 3 — Deploy the code

Run these from your PC. Replace `<DSKY-IP>` with the address from Step 2, and `~/DSKY` with your local clone path. You'll be asked for the password (`orangepi`) on each command.

```bash
# 1. Copy the app code to the Pi (skip the big build/dependency folders)
rsync -av --exclude node_modules --exclude .next \
  ~/DSKY/Programs/next-dsky/ orangepi@<DSKY-IP>:~/DSKY/Programs/next-dsky/

# 2. Copy the launcher script
rsync -av ~/DSKY/orangepi.sh orangepi@<DSKY-IP>:~/DSKY/orangepi.sh

# 3. Rebuild on the Pi and reboot
ssh orangepi@<DSKY-IP> 'cd ~/DSKY/Programs/next-dsky && npm install && npm run build && sudo reboot'
```

What to expect:

- **Step 3 is slow** — several minutes. `npm install` and `npm run build` are heavy for the small Orange Pi (the build alone can take ~300s). This is normal; let it finish.
- A successful build prints `✓ Compiled successfully` followed by a small routes table.
- The command ends with **`Connection to <IP> closed by remote host`**. This is **not an error** — it's the `sudo reboot` taking effect and dropping the SSH session, exactly as intended.
- npm warnings about `vulnerabilities` or a `New major version of npm` are harmless noise — ignore them.

> **Why copy from the PC and not `git pull` on the Pi?** Either works, but copying with `rsync` deploys exactly the code on your PC — including local changes you haven't pushed yet — which is what you want for a developer test. For a clean release-based install, `git pull` on the Pi is fine too. The `rsync` excludes (`node_modules`, `.next`) keep the transfer small; Step 3 regenerates them.

---

## Step 4 — Verify

The Pi takes 4-5 minutes to boot back up. Then, on the DSKY:

1. Press **NOUN** three times → **SETTINGS**.
2. A new **UPDATE** entry should appear. (It only shows when over-the-air updates are enabled, which the new `orangepi.sh` does automatically by setting `DSKY_RELEASES_DIR`.)
3. Open **ABOUT** → it now shows a **Version** line.

If you see **UPDATE** in SETTINGS, the deploy succeeded and the device is ready for over-the-air updates from here on.

---

## After this: updates are automatic

Once a device has been bootstrapped with the steps above, you never need to do it again for that device. New versions are published as GitHub releases and installed from the DSKY's own menu (**SETTINGS → UPDATE**), with automatic rollback if anything goes wrong. See [updates.md](updates.md) for how to publish a release and how the safety/rollback mechanism works.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Could not resolve hostname dsky.local` | mDNS not working (common in WSL) | Use the numeric IP — find it via the router or `ping dsky.local` from Windows PowerShell |
| `ssh: connect to host … port 22: Connection timed out` | Wrong IP, or the device isn't reachable at that address | Confirm the IP with `http://<IP>:3000` in a browser; re-check the router's device list |
| `Connection refused` (instead of timeout) | Reachable, but SSH server not running on the Pi | Enable/start `sshd` on the Pi (needs a monitor+keyboard, or a pre-configured image) |
| Password prompt shows nothing as you type | Normal SSH behaviour | Type it blind and press Enter (default: `orangepi`) |
| QR code does nothing when scanned | It's a WiFi-join QR, not a website QR | Connect to the "DSKY Replica" network manually from your phone's WiFi settings |
| "DSKY Replica" network never appears | `wifi-connect` not installed/running on the Pi | Install it (see [orangepi-setup.md](orangepi-setup.md)) or use Ethernet |
| `Connection closed by remote host` at end of Step 3 | The `sudo reboot` dropped the session | Expected — not an error |
| Build seems stuck for a minute or two | The Orange Pi is slow to compile | Wait; ~100s for the build is normal |
| UPDATE doesn't appear in SETTINGS after reboot | `orangepi.sh` not updated, so `DSKY_RELEASES_DIR` isn't set | Make sure Step 3.2 (copying `orangepi.sh`) ran, then reboot |
