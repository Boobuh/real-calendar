#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copy the web demo and shared calendar JS into the Tauri frontend tree.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/desktop/www"
LIB="${ROOT}/src/real-calendar@boobuh.github.io/lib"

if [[ ! -f "${ROOT}/demo/index.html" || ! -f "${LIB}/calendar.js" ]]; then
    echo "Missing demo/ or calendar.js" >&2
    exit 1
fi

rm -rf "${DEST}"
mkdir -p "${DEST}/demo" "${DEST}/src/real-calendar@boobuh.github.io/lib"
cp -a "${ROOT}/demo/." "${DEST}/demo/"
cp -a "${ROOT}/desktop/ui/." "${DEST}/demo/"
cp -a "${LIB}/." "${DEST}/src/real-calendar@boobuh.github.io/lib/"
python3 "${ROOT}/scripts/patch-desktop-index.py" "${DEST}/demo/index.html"

echo "Synced desktop assets to ${DEST}"
