#!/usr/bin/env python3
"""Inject desktop-only UI assets into the synced demo index."""
from __future__ import annotations

import sys
from pathlib import Path

DESKTOP_HEAD = """\
  <link rel="stylesheet" href="./desktop.css">
  <script type="module" src="./desktop.js"></script>
"""


def patch_index(index_path: Path) -> None:
    html = index_path.read_text(encoding="utf-8")
    if "desktop.css" not in html:
        html = html.replace("</head>", f"{DESKTOP_HEAD}</head>")
    if 'class="desktop-app"' not in html and "<html lang=" in html:
        html = html.replace(
            '<html lang="en">',
            '<html lang="en" class="desktop-app">',
            1,
        )
    index_path.write_text(html, encoding="utf-8")


def main() -> None:
    index_path = Path(sys.argv[1])
    patch_index(index_path)


if __name__ == "__main__":
    main()
