# Real Calendar — Desktop (Tauri)

Cross-platform desktop app for **macOS** and **Windows** (also builds on Linux). It wraps the same web demo and shared JavaScript libraries used by the GNOME extension and Android app — no Swift or C# rewrite.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install)
- Platform tools:
  - **Linux:** `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`
  - **macOS:** Xcode command-line tools
  - **Windows:** Visual Studio Build Tools with C++ workload, WebView2 (installed by the installer if missing)

## Develop

```bash
cd desktop
npm install
npm run dev
```

`npm run dev` syncs `demo/` and `lib/` into `desktop/www/` then opens the Tauri window.

The desktop build adds **platform-native styling** (macOS / Windows / Linux) via `desktop/ui/desktop.css`. GNOME shell mock chrome (media column, top clock pill) is hidden; calendar data and behavior stay identical to the extension demo.

## Release build

```bash
cd desktop
npm install
npm run build
```

### GitHub Releases (recommended)

Users download installers from **GitHub Releases** — no Microsoft Store or Partner Center.

```bash
# from repo root, after bumping version in tauri.conf.json / Cargo.toml / package.json
./scripts/release-desktop.sh 2.0.0
```

CI (`.github/workflows/desktop-release.yml`) builds Windows `.exe`/`.msi`, macOS `.dmg`, Linux bundles, `latest.json`, and `real-calendar-portable.zip`. Review the draft release, then publish.

For in-app updates, run `./scripts/setup-updater-keys.sh` once and set GitHub secret `TAURI_SIGNING_PRIVATE_KEY`.

### Microsoft Store (optional)

Not recommended — requires Microsoft identity verification. Config remains if you need it later:

```bash
npm run build:store   # offline WebView2 bundle; see PUBLISHING.md
```

Outputs (under `desktop/src-tauri/target/release/bundle/`):

| OS | Artifacts |
|----|-----------|
| macOS 10.15+ | `.dmg`, `.app` |
| Windows 10+ | `.msi`, `-setup.exe` (NSIS) |
| Debian / Ubuntu | `.deb` |
| Fedora / RHEL / openSUSE | `.rpm` |
| Any Linux | `.AppImage` (most portable native binary) |

**Older systems (pre–Windows 10, pre–macOS 10.15, or no WebKit):** use the portable web zip from the repo root:

```bash
make portable   # → build/real-calendar-portable.zip
```

See [packaging/COMPATIBILITY.md](../packaging/COMPATIBILITY.md) for the full matrix (Debian, Fedora, Arch, Flatpak, XP limits).

## Asset sync

```bash
./scripts/sync-desktop-assets.sh
```

Copies:

- `demo/` → `desktop/www/demo/`
- `src/real-calendar@boobuh.github.io/lib/` → `desktop/www/src/real-calendar@boobuh.github.io/lib/`

Run automatically before `tauri dev` and `tauri build`.

## Icons

```bash
python3 scripts/generate-desktop-icons.py
```

Regenerates `desktop/src-tauri/icons/` from the Real Calendar brand colors.

## CI

GitHub Actions `.github/workflows/desktop.yml` builds on push/PR and uploads CI artifacts. Tag `desktop-v*` to run `.github/workflows/desktop-release.yml` (draft GitHub Release + portable zip).
