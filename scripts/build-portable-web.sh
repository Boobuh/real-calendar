#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Offline portable web app for older macOS/Windows/Linux browsers (no Tauri required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/build/portable"
ZIP="${ROOT}/build/real-calendar-portable.zip"
LIB="${ROOT}/src/real-calendar@boobuh.github.io/lib"

if [[ ! -f "${ROOT}/demo/index.html" ]]; then
    echo "Missing demo/" >&2
    exit 1
fi

rm -rf "${OUT}"
mkdir -p "${OUT}"

cp "${ROOT}/demo/index.html" "${OUT}/index.html"
cp "${ROOT}/demo/styles.css" "${OUT}/styles.css"
if [[ -f "${ROOT}/desktop/ui/desktop.css" ]]; then
    cp "${ROOT}/desktop/ui/desktop.css" "${OUT}/desktop.css"
    cp "${ROOT}/desktop/ui/desktop.js" "${OUT}/desktop.js"
    python3 "${ROOT}/scripts/patch-desktop-index.py" "${OUT}/index.html"
fi

# Single-file bundle (no ES modules) for older browsers.
npx --yes esbuild@0.25.0 "${ROOT}/demo/app.js" \
    --bundle \
    --format=iife \
    --target=es2015 \
    --outfile="${OUT}/app.bundle.js"

# Replace module script with bundled script.
python3 - "${OUT}/index.html" <<'PY'
import sys
from pathlib import Path
p = Path(sys.argv[1])
html = p.read_text()
html = html.replace('<script type="module" src="./app.js"></script>',
                    '<script src="./app.bundle.js"></script>')
p.write_text(html)
PY

cat > "${OUT}/real-calendar.sh" <<'EOF'
#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${DIR}/index.html"
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "${DIR}/index.html"
else
  echo "Open ${DIR}/index.html in your web browser."
fi
EOF

cat > "${OUT}/Real Calendar.bat" <<'EOF'
@echo off
start "" "%~dp0index.html"
EOF

cat > "${OUT}/Real Calendar.command" <<'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
open "${DIR}/index.html"
EOF

chmod +x "${OUT}/real-calendar.sh" "${OUT}/Real Calendar.command"

rm -f "${ZIP}"
(cd "${OUT}" && zip -rq "${ZIP}" .)
echo "Wrote ${ZIP}"
ls -lh "${ZIP}"
