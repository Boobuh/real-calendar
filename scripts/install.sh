#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UUID="real-calendar@boobuh.github.io"
SRC="${ROOT}/src/${UUID}"
DEST="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

if [[ ! -d "$SRC" ]]; then
    echo "Extension sources not found at $SRC" >&2
    exit 1
fi

mkdir -p "$DEST"
cp -a "${SRC}/." "$DEST/"
glib-compile-schemas "${DEST}/schemas"

echo "Installed ${UUID} to ${DEST}"
echo
if command -v gnome-extensions >/dev/null 2>&1; then
    gnome-extensions enable "$UUID" && echo "Enabled ${UUID}." || true
fi

echo "On Wayland, log out and back in (or reboot) so GNOME Shell reloads extensions."
echo "On Xorg, press Alt+F2, type r, and press Enter."
echo
echo "Then open the clock in the top bar. Use Settings → Calendar display to replace"
echo "the default calendar, or keep the Gregorian / Real toggle (default)."
