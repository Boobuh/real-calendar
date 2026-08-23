#!/usr/bin/env bash
set -euo pipefail

UUID="real-calendar@boobuh.github.io"
DEST="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

if command -v gnome-extensions >/dev/null 2>&1; then
    # From a text console there is no session bus, so gnome-extensions cannot
    # reach the shell. Fall back to a private bus, which still writes dconf.
    gnome-extensions disable "$UUID" >/dev/null 2>&1 ||
        (command -v dbus-run-session >/dev/null 2>&1 &&
            dbus-run-session -- gnome-extensions disable "$UUID" >/dev/null 2>&1) ||
        true
fi

rm -rf "$DEST"
echo "Removed ${DEST}"
echo "Log out and back in on Wayland, or restart GNOME Shell on Xorg, to finish unloading it."
