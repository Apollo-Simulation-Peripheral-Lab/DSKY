#!/bin/bash

# DSKY development launcher (run ON the Pi).
#
# Runs next-dsky in Next's DEV mode with hot reload instead of the production
# build+reboot cycle, so edits synced from your PC show up in seconds.
#
# SAFETY MODEL — this is purely an in-memory takeover:
#   * It does NOT touch ~/dsky-releases/current (the boot pointer). Production
#     (v0.2.0) stays the configured boot target, untouched.
#   * It PAUSES the production supervisor (SIGSTOP, keeping the X session alive)
#     and runs the dev server in its place for this session.
#   * A reboot wipes the dev session automatically: the launcher boots straight
#     back into production. There is nothing persistent to clean up or break.
#
# Usage, from your PC:
#     ssh -t orangepi@<pi> '~/DSKY/dev.sh'
#
# To stop dev and return to normal production mode: press Ctrl-C (the supervisor
# resumes production automatically), or just `sudo reboot`.

APP_DIR="$HOME/DSKY/Programs/next-dsky"
export DISPLAY=:0

echo "[dev.sh] Pausing production supervisor (keeping the X session alive)..."
# orangepi.sh is the FOREGROUND process of ~/.xsession: killing it ends the X
# session and drops the screen to the lightdm login greeter (the password prompt
# you couldn't dismiss). So FREEZE the respawn loop with SIGSTOP instead — the X
# session stays up — then kill the production app + kiosk it had spawned.
pkill -STOP -f 'orangepi.sh' 2>/dev/null
pkill -f 'tsx server.ts'     2>/dev/null
pkill -f 'cross-env'         2>/dev/null
killall chromium-browser chromium 2>/dev/null
sleep 2

# On exit (Ctrl-C / dev server dies): stop our dev server + kiosk and RESUME the
# supervisor, which relaunches production. So you get back to normal without a
# reboot. (A reboot also works and is always safe.)
cleanup() {
    echo; echo "[dev.sh] Stopping dev, resuming production..."
    [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null
    killall chromium-browser chromium 2>/dev/null
    pkill -CONT -f 'orangepi.sh' 2>/dev/null
}
trap cleanup EXIT INT TERM

# Mirror production's display setup, so the screen can't blank or lock while the
# (slow) first dev compile runs. Omitting this is what popped the lock/password
# prompt you couldn't dismiss. Show the splash so the screen isn't bare meanwhile.
xset s off      2>/dev/null
xset -dpms      2>/dev/null
xset s noblank  2>/dev/null
# xscreensaver has its OWN idle timer that ignores `xset s`, so it will lock the
# screen (the password prompt you couldn't dismiss) during the slow first
# compile unless we stop it for this session.
xscreensaver-command -exit 2>/dev/null
pkill -x xscreensaver      2>/dev/null
SPLASH="$HOME/DSKY/Programs/orangepi-utilities/splash.png"
[ -f "$SPLASH" ] && feh --bg-fill --no-fehbg "$SPLASH" 2>/dev/null

cd "$APP_DIR" || { echo "[dev.sh] $APP_DIR not found"; exit 1; }

# Only install deps when they're actually missing — skip the slow step otherwise.
[ -d node_modules ] || npm install

echo "[dev.sh] Starting Next dev server (hot reload) on :3000 ..."
# NODE_ENV is left unset -> server.ts runs Next with dev=true (HMR on).
# No --wifi-connect / --shutdown / --reboot here: dev mode shouldn't be able to
# start the wifi portal or power off the box.
npm run dev -- -s /dev/ttyUSB0 &
DEV_PID=$!

# Wait for the dev server to answer (first compile is slow on the Zero 2W),
# then (re)launch the kiosk browser so it connects to the fresh server.
echo "[dev.sh] Waiting for :3000 (first compile can take a minute)..."
for _ in $(seq 1 180); do
    curl -fsS http://localhost:3000 >/dev/null 2>&1 && break
    kill -0 "$DEV_PID" 2>/dev/null || { echo "[dev.sh] dev server died"; exit 1; }
    sleep 1
done

killall chromium-browser chromium 2>/dev/null
chromium-browser --start-fullscreen --incognito \
    --noerrdialogs --disable-infobars --disable-session-crashed-bubble \
    --no-default-browser-check --no-first-run \
    http://localhost:3000/?view=screen >/dev/null 2>&1 &

echo "[dev.sh] Dev server up. Edit on your PC — changes hot-reload here."
echo "[dev.sh] Ctrl-C to stop; 'sudo reboot' to return to production mode."
wait "$DEV_PID"
