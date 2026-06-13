#!/bin/bash

# Live-sync next-dsky source to the DSKY on every save (run ON your PC).
#
# Pair this with `dev.sh` running on the Pi: you edit in your local repo, this
# rsyncs each change to the device, and the Pi's dev server hot-reloads it.
# No build, no reboot.
#
# Usage:
#     ./dev-sync.sh [pi-ip]        # defaults to 192.168.68.104
#
# Requires inotify-tools (sudo apt install inotify-tools) and passwordless SSH
# (run `ssh-copy-id orangepi@<pi>` once first — otherwise it prompts on every
# save). A persistent SSH connection is reused so each sync is fast.

PI="${1:-192.168.68.104}"
SRC="$(cd "$(dirname "$0")/Programs/next-dsky" && pwd)/"
DST="orangepi@$PI:~/DSKY/Programs/next-dsky/"

SSH_OPTS='-o ControlMaster=auto -o ControlPath=~/.ssh/cm-%r@%h:%p -o ControlPersist=120'
RSYNC=(rsync -az --delete -e "ssh $SSH_OPTS"
       --exclude node_modules --exclude .next --exclude .git)

echo "[dev-sync] Initial push to $PI ..."
"${RSYNC[@]}" "$SRC" "$DST" || { echo "[dev-sync] initial sync failed"; exit 1; }

echo "[dev-sync] Watching $SRC (Ctrl-C to stop)..."
while inotifywait -qr -e modify,create,delete,move \
        --exclude '(/node_modules/|/\.next/|/\.git/)' "$SRC" >/dev/null; do
    "${RSYNC[@]}" "$SRC" "$DST" && echo "[dev-sync] synced $(date +%T)"
done
