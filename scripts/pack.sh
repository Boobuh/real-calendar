#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Build a GNOME Shell extension zip suitable for extensions.gnome.org.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UUID="real-calendar@boobuh.github.io"
SRC="${ROOT}/src/${UUID}"
BUILD="${ROOT}/build"
ZIP="${BUILD}/${UUID}.shell-extension.zip"
METAINFO="${ROOT}/data/${UUID}.metainfo.xml"

if [[ ! -f "${SRC}/metadata.json" || ! -f "${SRC}/extension.js" ]]; then
    echo "Missing metadata.json or extension.js in ${SRC}" >&2
    exit 1
fi

mkdir -p "${BUILD}"
STAGING="$(mktemp -d "${TMPDIR:-/tmp}/real-calendar-pack.XXXXXX")"
trap 'rm -rf "${STAGING}"' EXIT

cp "${SRC}/metadata.json" "${SRC}/extension.js" "${SRC}/prefs.js" \
    "${SRC}/stylesheet.css" "${SRC}/calendarWidget.js" "${STAGING}/"
cp -a "${SRC}/lib" "${STAGING}/lib"
mkdir -p "${STAGING}/schemas"
cp "${SRC}/schemas/"*.gschema.xml "${STAGING}/schemas/"
cp "${ROOT}/LICENSE" "${STAGING}/LICENSE"
if [[ -f "${METAINFO}" ]]; then
    cp "${METAINFO}" "${STAGING}/"
fi
mkdir -p "${STAGING}/po"
cp "${ROOT}/po/POTFILES.in" "${ROOT}/po/LINGUAS" "${STAGING}/po/"
if compgen -G "${ROOT}/po/*.po" >/dev/null; then
    cp "${ROOT}/po/"*.po "${STAGING}/po/"
fi
if [[ -f "${ROOT}/po/real-calendar.pot" ]]; then
    cp "${ROOT}/po/real-calendar.pot" "${STAGING}/po/"
fi

EXTRA=(
    --extra-source=calendarWidget.js
    --extra-source=lib
    --extra-source=LICENSE
)
if [[ -f "${STAGING}/${UUID}.metainfo.xml" ]]; then
    EXTRA+=(--extra-source="${UUID}.metainfo.xml")
fi

if command -v gnome-extensions >/dev/null 2>&1; then
    gnome-extensions pack \
        --force \
        "${EXTRA[@]}" \
        --podir="${STAGING}/po" \
        --out-dir="${BUILD}" \
        "${STAGING}"
else
    (
        cd "${STAGING}"
        zip -rq "${ZIP}" .
    )
    echo "gnome-extensions not found; packed with zip (schema compiles on install)."
fi

echo "Wrote ${ZIP}"
ls -lh "${ZIP}"
