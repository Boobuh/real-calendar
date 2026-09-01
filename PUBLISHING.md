# Publishing Real Calendar

Real Calendar is a **GNOME Shell extension**. Ubuntu App Center lists snaps and `.deb` packages — it does **not** install shell extensions directly like a normal app. Use the paths below.

## Recommended path (most Ubuntu users)

### 1. Publish to extensions.gnome.org (EGO)

1. Build the zip:
   ```bash
   make pack
   ```
2. Upload `build/real-calendar@boobuh.github.io.shell-extension.zip` to  
   https://extensions.gnome.org/upload/
3. After review, users install via **Extension Manager** (available in App Center):
   ```bash
   sudo apt install gnome-shell-extension-manager
   ```
4. Open Extension Manager → search **Real Calendar** → Install → Enable  
   Log out and back in (Wayland) or **Alt+F2 → r** (Xorg).

See `CONTRIBUTING.md` for EGO review notes.

## Ubuntu App Center (.deb)

App Center can surface `.deb` packages from Ubuntu archives (and some apt sources). A third-party `.deb` on its own will **not** appear in App Center until it is published to **Ubuntu universe** or a **PPA** that App Center indexes.

### Build the Debian package locally

```bash
sudo apt install debhelper nodejs npm
debuild -us -uc -b
```

Install the resulting `.deb`:

```bash
sudo dpkg -i ../gnome-shell-extension-real-calendar_2.0.0-1_all.deb
```

Then enable the extension (Extensions app or `gnome-extensions enable real-calendar@boobuh.github.io`) and reload GNOME Shell.

### Ship to Ubuntu users via PPA (intermediate step)

1. Create a Launchpad PPA for `gnome-shell-extension-real-calendar`.
2. Upload the source with `dput`.
3. Document in README: users add the PPA, then `sudo apt install gnome-shell-extension-real-calendar`.

### Ship in Ubuntu universe (shows in App Center search)

1. File a [bug against ubuntu-dev-tools / MOTU](https://bugs.launchpad.net/ubuntu/+filebug) or ask on `#ubuntu-motu` to sponsor the package.
2. Include valid AppStream metadata (`data/io.github.boobuh.real-calendar.metainfo.xml`).
3. Once accepted, users search **Real Calendar** in App Center under apt/deb results.

## What does not work

| Channel | Why |
|---------|-----|
| **Snap Store** | GNOME Shell extensions run unconfined inside the shell; snaps cannot safely install or manage them. |
| **Flatpak** | Extensions are not standalone apps. |
| **App Center alone** | No upload button for random `.deb` files; needs archive/PPA/snap listing. |

## AppStream & assets

| File | Purpose |
|------|---------|
| `data/io.github.boobuh.real-calendar.metainfo.xml` | GNOME Software / apt metadata |
| `data/icons/io.github.boobuh.real-calendar.svg` | Store icon |
| `data/screenshots/date-menu.png` | Screenshot for EGO and metainfo |

Validate metadata:

```bash
appstreamcli validate data/io.github.boobuh.real-calendar.metainfo.xml
```

## Release checklist

- [ ] Sync `metadata.json` version with metainfo `<release>` and `debian/changelog`
- [ ] `make test && make pack`
- [ ] Upload zip to EGO
- [ ] Tag extension release on GitHub with the zip attached
- [ ] (Optional) Upload `.deb` to PPA or request universe sponsorship
- [ ] Desktop: `./scripts/release-desktop.sh VERSION` → publish draft GitHub Release

---

## Desktop app (Windows / macOS / Linux) — recommended

The Tauri app in `desktop/` is distributed via **GitHub Releases** — no app store account, no identity verification, no Microsoft Partner Center.

### For users

Download the latest release:

**https://github.com/Boobuh/real-calendar/releases/latest**

| Platform | Install |
|----------|---------|
| **Windows 10+** | `Real Calendar_*-setup.exe` (or `.msi`) |
| **macOS 10.15+** | `.dmg` — drag app to Applications ([step-by-step in README](./README.md#install-on-macos-1015-catalina-or-later)) |
| **Linux** | `.AppImage`, `.deb`, or `.rpm` |
| **Any browser** | `real-calendar-portable.zip` (no install) |

> **Mac App Store:** postponed — Apple Developer Program ($99/year) not required; GitHub `.dmg` is the supported Mac path.

### Maintainer: cut a desktop release

1. Bump `desktop/package.json`, `desktop/src-tauri/Cargo.toml`, and `desktop/src-tauri/tauri.conf.json` version together.
2. (Once) set up in-app updates:
   ```bash
   ./scripts/setup-updater-keys.sh
   ```
   Add GitHub secret **`TAURI_SIGNING_PRIVATE_KEY`** with the private key contents.
3. Commit, push, then tag:
   ```bash
   ./scripts/release-desktop.sh 2.0.0
   ```
4. Open the **draft** release CI creates → review assets → **Publish release**.

Workflow: `.github/workflows/desktop-release.yml` (triggered by `desktop-v*` tags).

CI builds all platforms, attaches `latest.json` for the updater (when signing secret is set), and adds `real-calendar-portable.zip`.

### Local build (optional)

```bash
cd desktop
npm ci
npm run build:release   # signed updater artifacts if TAURI_SIGNING_PRIVATE_KEY is set
```

See [desktop/README.md](./desktop/README.md) for dev prerequisites.

---

## Microsoft Store (optional — not recommended)

> **Skip this** unless you explicitly want Microsoft Store distribution and are OK sharing personal identity data with Microsoft (name, address, phone, tax/payment profile for Partner Center enrollment).

The repo still includes Store-oriented configs (`build:store`, `tauri.microsoftstore.conf.json`) if you change your mind later. They are **not** required for GitHub Releases or in-app updates.

<details>
<summary>Legacy Store checklist (collapsed)</summary>

1. Enroll at [Partner Center](https://partner.microsoft.com/dashboard) as Individual (~$19).
2. New product → **EXE or MSI app** → **Real Calendar**.
3. `npm run build:store` on Windows → sign with Authenticode → upload with silent args **`/S`**.
4. Privacy policy: [docs/PRIVACY.md](./docs/PRIVACY.md).

See [Tauri Microsoft Store guide](https://v2.tauri.app/distribute/microsoft-store/) for certification details.

</details>

---

## Mac App Store (postponed)

> **Not using this path for now.** Apple Developer Program membership is **$99 USD per year**, requires legal name / address / phone, and notarized builds for a smooth first launch. Real Calendar for Mac is distributed via **GitHub Releases** (`.dmg`) instead.

When you want the App Store later: enroll at [developer.apple.com/programs](https://developer.apple.com/programs/enroll/), submit through [App Store Connect](https://appstoreconnect.apple.com/), and see [Tauri App Store guide](https://v2.tauri.app/distribute/app-store/).

