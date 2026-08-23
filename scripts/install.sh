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
rm -f "${DEST}/schemas/gschemas.compiled"
glib-compile-schemas "${DEST}/schemas"

echo "Installed ${UUID} to ${DEST}"
echo
echo "Do not enable it against a live session, and do not restart gnome-shell"
echo "from a script (killall, gnome-shell --replace). Either one can take the"
echo "desktop down. Log out and back in first, then:"
echo
echo "  gnome-extensions enable ${UUID}"
echo
echo "Then open the clock in the top bar. Use Settings → Calendar display to replace"
echo "the default calendar, or keep the Gregorian / Real toggle (default)."
