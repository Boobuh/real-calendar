#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copy the web demo and shared calendar JS into the Android asset tree.
# Gradle also runs this before each build. The destination is gitignored.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/android/app/src/main/assets/www"
LIB="${ROOT}/src/real-calendar@boobuh.github.io/lib"

if [[ ! -f "${ROOT}/demo/index.html" || ! -f "${LIB}/calendar.js" ]]; then
    echo "Missing demo/ or calendar.js" >&2
    exit 1
fi

rm -rf "${DEST}"
mkdir -p "${DEST}/demo" "${DEST}/src/real-calendar@boobuh.github.io/lib"
cp -a "${ROOT}/demo/." "${DEST}/demo/"
cp -a "${LIB}/." "${DEST}/src/real-calendar@boobuh.github.io/lib/"

echo "Synced Android assets to ${DEST}"
