# Developing on a physical DSKY (dev mode)

This guide is for iterating on the `next-dsky` software **on a real DSKY** with a
fast edit → see-it loop: edits hot-reload on the device in seconds, with no
build and no reboot. It complements:

- [deploying-to-a-device.md](deploying-to-a-device.md) — pushing a built copy to a device (slow; for a one-off install or OTA bootstrap).
- [updates.md](updates.md) — the production OTA update system.

Use **dev mode** while actively developing. Use the other two for releasing.

> The DSKY's keyboard and indicator lamps are wired to the Orange Pi over serial,
> and the display is a Chromium kiosk on the Pi pointing at `localhost:3000`. So
> the server has to run **on the Pi**. Dev mode just runs it in Next's dev (hot
> reload) mode instead of the production build, and you sync your code to it.

## How it works (the safety model)

Dev mode is a purely **in-memory takeover** — it never changes what the device
boots:

- It does **not** touch `~/dsky-releases/current` (the OTA boot pointer). The
  configured production release stays the boot target.
- It **pauses** the production launcher (`orangepi.sh`) with `SIGSTOP` — rather
  than killing it, which would end the X session and drop the screen to the
  lightdm login prompt — and runs `npm run dev` in its place.
- A **reboot returns to production automatically**: nothing persistent changed.
  Pressing `Ctrl-C` also resumes production (the launcher is sent `SIGCONT`).

So you can power-cycle the device at any point and it boots back to normal.

## One-time setup

From your PC:

```bash
# Passwordless SSH (so syncing doesn't prompt on every save)
ssh-copy-id orangepi@<DSKY-IP>

# File-watch tool for live sync
sudo apt install -y inotify-tools

# Copy the dev launcher to the Pi (dev-sync.sh only syncs next-dsky, not the root)
scp dev.sh orangepi@<DSKY-IP>:~/DSKY/dev.sh
```

Finding `<DSKY-IP>` and SSH basics are covered in [deploying-to-a-device.md](deploying-to-a-device.md#step-2--find-the-dsky-and-connect-via-ssh).

## Entering dev mode

In one terminal, start the dev server on the Pi (keep this terminal open — it
shows the live logs):

```bash
ssh -t orangepi@<DSKY-IP> '~/DSKY/dev.sh'
```

- The **first compile is slow** (~90 s on an Orange Pi Zero 2W — it's RAM-tight
  and leans on swap). The splash stays up meanwhile; let it finish.
- When `:3000` responds, the kiosk reloads and you'll see the app in dev mode.

To **edit live**, in a second terminal on your PC:

```bash
./dev-sync.sh <DSKY-IP>        # rsyncs Programs/next-dsky on every save
```

Now edit in your local repo; changes sync to the Pi and hot-reload on the device.

## Leaving dev mode

Press `Ctrl-C` in the `dev.sh` terminal — production resumes on its own (~15 s) —
or `ssh orangepi@<DSKY-IP> 'sudo reboot'`.

## Things to know

- **No UPDATE in SETTINGS while in dev.** OTA is intentionally disabled in dev
  (it keys off `DSKY_RELEASES_DIR`, which only the production launcher sets), so
  the **UPDATE** menu entry is hidden. Return to production to install OTA updates.
- **Server-side edits cause a brief outage.** Editing a server `.ts` file restarts
  the dev server (`tsx watch`), so `:3000` is down for a few seconds. If Chromium
  reloads in that window it shows **"This site can't be reached"** and won't retry.
  The server is fine — just reload the kiosk (see below). Client `.tsx` edits use
  Next HMR and don't cause this.
- **Reloading the kiosk** (no keyboard on the DSKY) from your PC:
  ```bash
  ssh orangepi@<DSKY-IP> 'export DISPLAY=:0; killall chromium-browser chromium; \
    sleep 1; setsid chromium-browser --start-fullscreen --incognito --noerrdialogs \
    --disable-infobars --disable-session-crashed-bubble --no-default-browser-check \
    --no-first-run "http://localhost:3000/?view=screen" >/dev/null 2>&1 < /dev/null &'
  ```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Screen stuck on a login/password prompt | An older `dev.sh` killed `orangepi.sh`, ending the X session (lightdm greeter) | Update `dev.sh` (it now `SIGSTOP`s instead); `sudo reboot` to recover |
| "This site can't be reached" on the DSKY | `:3000` was briefly down during a server restart | Reload the kiosk (command above); the server recovers on its own |
| No **UPDATE** entry in SETTINGS | You're in dev mode (OTA disabled) | Return to production (`Ctrl-C` / reboot) |
| First load takes ~90 s | Zero 2W compiling in dev under tight RAM | Normal — wait; subsequent HMR edits are fast |
| Every save prompts for a password | SSH key not installed | `ssh-copy-id orangepi@<DSKY-IP>` |
