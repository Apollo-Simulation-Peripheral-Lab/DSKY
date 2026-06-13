# Over-the-air updates

DSKYs update themselves from the device UI — owners never need a terminal. This document explains how the pieces fit together, how to publish an update, and how recovery works.

## For DSKY owners

1. Open the menu (press **NOUN** three times), go to **SETTINGS**.
2. The **UPDATE** entry shows a `NEW vX.Y.Z` badge when an update is available (the device checks automatically every few hours).
3. Select **UPDATE → INSTALL vX.Y.Z**. The display shows download progress, installs, and the DSKY restarts itself. That's it.

If anything goes wrong (power loss, WiFi drop, a bad release), the DSKY keeps or restores the previous version automatically. Updating is always safe.

## How it works

```
GitHub release (vX.Y.Z)                     Orange Pi
┌──────────────────────────┐      ┌─────────────────────────────────┐
│ next-dsky-vX.Y.Z-        │      │ ~/dsky-releases/                │
│   linux-arm64.tar.gz     │ ───▶ │   current  ──▶ vX.Y.Z/          │  ◀─ active (symlink)
│   (prebuilt, + .sha256)  │      │   vX.Y.Z/                       │
└──────────────────────────┘      │   vW.V.U/                       │  ◀─ rollback target
   built by GitHub Actions        │   previous (path of last good)  │
                                  │ ~/DSKY/Programs/next-dsky       │  ◀─ factory install (git clone,
                                  └─────────────────────────────────┘     never touched)
```

- **Releases are prebuilt by CI** ([release.yml](../.github/workflows/release.yml)) on an arm64 runner: `npm ci`, `next build`, dev dependencies pruned, everything tarballed with a SHA-256 checksum. The Orange Pi never runs `npm install` or `next build` — too slow and too fragile on a Zero 2W.
- **The updater lives in the server** ([updater.ts](../Programs/next-dsky/src/server/updater.ts)). It checks `https://api.github.com/repos/<repo>/releases/latest` every 6 hours and on entering the UPDATE screen. Installing means: download → verify checksum → unpack into a *new* directory → carry over device config (`.env`, `ha_entities.json`) → atomically switch the `current` symlink → restart.
- **The launcher is the safety net** ([orangepi.sh](../orangepi.sh)). It always starts the app from `current` (falling back to the factory install if the symlink is missing or broken). A fresh release carries a `.pending-verify` flag; the launcher counts boot attempts while that flag exists, and after 3 failed starts it points `current` back at the previous release. The server removes the flag only after running healthily for 90 seconds.

Failure cases and what happens:

| Failure | Result |
|---|---|
| Network drops mid-download | Install aborts, error shown, current version untouched |
| Corrupted download | Checksum mismatch, install aborts |
| Power loss during install | Symlink not yet switched — old version boots |
| Power loss right after install | New release boots; if broken, crash-loop rollback kicks in |
| New release crash-loops | After 3 attempts the launcher rolls back to the previous release |
| Everything in `~/dsky-releases` is broken | Launcher falls back to the factory git clone |

## Publishing an update (maintainers)

```bash
git tag v0.2.0
git push origin v0.2.0
```

The workflow builds and attaches the package to the release automatically. Devices pick it up on their next periodic check (≤6h) or when the owner opens SETTINGS → UPDATE.

Notes:
- The version shown on devices comes from the tag (CI stamps it into `package.json`); you don't need to bump `package.json` manually.
- Only the **latest** release is offered, so devices that skipped versions jump straight to the newest one. Releases must therefore always be self-contained (no incremental migrations between versions).
- Test on your own DSKY before tagging: the public release goes to every device in the field.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DSKY_RELEASES_DIR` | `~/dsky-releases` (set by `orangepi.sh`) | Enables OTA and sets the install location. Unset (e.g. desktop installs) = no OTA UI. |
| `DSKY_UPDATE_REPO` | `Apollo-Replica/DSKY` | GitHub repo whose releases are checked. |

## Devices shipped before OTA existed

Older devices don't have the updater yet, so they need one manual deploy over the network to bootstrap it. The full step-by-step (finding the device, SSH, copying the code, rebuilding, and the gotchas around `.local`/WSL) is in **[deploying-to-a-device.md](deploying-to-a-device.md)**. In short:

```bash
ssh orangepi@<DSKY-IP>
cd ~/DSKY && git pull
cd Programs/next-dsky && npm install && npm run build
sudo reboot
```

From then on, all updates are OTA. New SD card images include the updater out of the box.

## Manual recovery

Should a device ever need hands-on recovery (it shouldn't), over SSH:

```bash
rm -f ~/dsky-releases/current   # next boot uses the factory install
sudo reboot
```
