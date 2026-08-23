# Contributing

This is a **GNOME Shell extension** (date-menu widget) for Ubuntu / GNOME 45+.

## Layout

| Path | Role |
| --- | --- |
| `src/real-calendar@boobuh.github.io/` | Extension (UUID folder) |
| `src/.../lib/` | Calendar + zodiac logic (also used by tests and the demo) |
| `schemas/` | GSettings (`glib-compile-schemas`) |
| `po/` | gettext (`LINGUAS`, `POTFILES.in`) |
| `data/*.metainfo.xml` | AppStream addon metadata |
| `scripts/pack.sh` | `*.shell-extension.zip` for [extensions.gnome.org](https://extensions.gnome.org) |

## Commands

```bash
make test      # node unit tests
make check     # parse all JS
make schemas   # validate GSettings XML
make pot       # refresh po/real-calendar.pot
make pack      # EGO zip in build/
make install   # ~/.local/share/gnome-shell/extensions/
```

On Wayland, log out after install. On Xorg, Alt+F2, `r`, Enter.

## Review rules (EGO)

Follow [gjs.guide — Anatomy of an Extension](https://gjs.guide/extensions/overview/anatomy.html):

- Do not add `session-modes` unless the extension must run on the lock screen (that needs a review justification).
- List extra JS/CSS beyond `extension.js` / `prefs.js` / `stylesheet.css` via `gnome-extensions pack --extra-source`.
- Do not ship `gschemas.compiled` in git; the packer or install script compiles it.
- Keep `enable()` / `disable()` symmetric: destroy UI, disconnect signals, drop references.

## License

MIT. New files are covered by `REUSE.toml` (`SPDX-License-Identifier: MIT`).
