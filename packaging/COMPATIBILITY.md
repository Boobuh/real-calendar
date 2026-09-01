# Real Calendar — platform compatibility

Real Calendar ships in several forms. Pick the one that matches your OS.

## Quick picker

| Your system | Best install |
|-------------|--------------|
| Ubuntu / Debian / Mint | GNOME extension (EGO) **or** `.deb` desktop **or** AppImage |
| Fedora / RHEL / openSUSE | `.rpm` desktop **or** AppImage **or** Flatpak |
| Arch / Manjaro | AUR/`PKGBUILD` **or** AppImage |
| Any Linux (generic) | **AppImage** or **portable web zip** |
| macOS 10.15+ | `.dmg` desktop (Tauri) |
| macOS older | **Portable web zip** in a modern browser |
| Windows 10/11 | `.msi` / `.exe` desktop (Tauri) |
| Windows 7/8.1 | **Portable web zip** (Chrome/Firefox); WebView2 desktop may work on 7 with updates |
| Windows XP/Vista | **CLI only** (`node bin/real-calendar.js`) — no supported GUI runtime |

## GNOME Shell extension (Linux, primary on Ubuntu)

Works on **any distro** running **GNOME Shell 45–49** (not XFCE/LXQt/KDE panel integration).

- Install via [extensions.gnome.org](https://extensions.gnome.org/) + Extension Manager
- Or manual: `./scripts/install.sh`
- Does **not** require Ubuntu specifically

## Native desktop app (Tauri)

Built from `desktop/` — embeds the same calendar UI as the demo.

| OS | Native installer | Minimum version |
|----|------------------|-----------------|
| Linux | `.deb`, `.rpm`, `.AppImage` | glibc 2.31+, WebKitGTK 4.1 (most distros from ~2021) |
| macOS | `.dmg` | **10.15 Catalina** (Tauri/WebKit requirement) |
| Windows | `.msi`, NSIS `.exe` | **Windows 10 1809+** (recommended); WebView2 runtime |

**Why not Windows XP?** XP has no WebView2, no modern Chromium, and cannot run ES module web apps in Internet Explorer. A native Tauri/Electron/Chromium app cannot target XP.

**Why not old macOS (pre-10.15)?** Apple WebKit APIs used by Tauri require 10.15+.

## Portable web bundle (widest GUI support)

For older Mac/Windows/Linux **with a modern browser** (Firefox, Chrome, Chromium, Edge — not IE):

```bash
make portable
# → build/real-calendar-portable.zip
```

Unzip and open `index.html`, or use the included launchers:

- `Real Calendar.bat` (Windows)
- `Real Calendar.command` (macOS)
- `real-calendar.sh` (Linux)

Bundled as a single legacy-friendly script (`target=es2015`) — no server required.

Works offline. Same Real dates, zodiac, and 369 time reading.

## CLI (everything with Node.js 18+)

```bash
node bin/real-calendar.js
node bin/real-calendar.js 2026-08-23
```

Works wherever a current Node.js runtime is available.

## Linux distro notes

| Distro | Extension | Desktop `.deb` | Desktop `.rpm` | AppImage | Flatpak |
|--------|-----------|----------------|----------------|----------|---------|
| Debian / Ubuntu | EGO / manual | yes | — | yes | yes |
| Linux Mint | same | yes | — | yes | yes |
| Fedora | manual | — | yes | yes | yes |
| RHEL / CentOS Stream | manual | — | yes | yes | yes |
| openSUSE | manual | — | yes | yes | yes |
| Arch / Manjaro | manual | — | AUR/PKGBUILD | yes | yes |
| Gentoo / NixOS | manual | build from source | build from source | yes | yes |

**AppImage** is the most portable Linux binary (enable FUSE on Debian: `sudo apt install fuse3`).

## Building all Linux formats

```bash
cd desktop && npm install && npm run build
# deb  → src-tauri/target/release/bundle/deb/
# rpm  → src-tauri/target/release/bundle/rpm/
# AppImage → src-tauri/target/release/bundle/appimage/
```

Arch from source: `packaging/arch/PKGBUILD`

Flatpak: see `packaging/flatpak/README.md`
