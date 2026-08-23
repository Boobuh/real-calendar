#!/usr/bin/env bash
set -euo pipefail

UUID="real-calendar@boobuh.github.io"
DEST="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

if command -v gnome-extensions >/dev/null 2>&1; then
    gnome-extensions disable "$UUID" >/dev/null 2>&1 || true
fi

rm -rf "$DEST"
echo "Removed ${DEST}"
echo "Log out and back in on Wayland, or restart GNOME Shell on Xorg, to finish unloading it."
