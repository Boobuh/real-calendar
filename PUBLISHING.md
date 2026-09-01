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
- [ ] Tag GitHub release with the zip attached
- [ ] (Optional) Upload `.deb` to PPA or request universe sponsorship
- [ ] (Optional) Desktop: tag `desktop-v*` and publish Microsoft Store package (see below)

---

## Microsoft Store (Windows desktop — individual developer)

The **Tauri desktop app** (`desktop/`) is what you publish to the Microsoft Store — not the GNOME extension.

### One-time setup

1. **Enroll** at [Microsoft Partner Center](https://partner.microsoft.com/dashboard) as an **Individual** (~$19 one-time).
2. **New product** → **EXE or MSI app** → reserve the name **Real Calendar**.
3. **Updater signing keys** (in-app updates + Store requirement):
   ```bash
   ./scripts/setup-updater-keys.sh
   ```
   Add GitHub secret **`TAURI_SIGNING_PRIVATE_KEY`** with the contents of `desktop/.keys/updater.key`.  
   The matching public key is already in `desktop/src-tauri/tauri.release.conf.json`.
4. **Code-signing certificate (Authenticode)** for the Windows installer — required for Store certification. As an individual, use a CA that sells to indie devs (e.g. SSL.com, DigiCert). Install the cert on your Windows build machine or use `signtool` in CI with secrets `WINDOWS_CERTIFICATE` + `WINDOWS_CERTIFICATE_PASSWORD`.
5. **Privacy policy URL** — use the committed policy:  
   `https://github.com/Boobuh/real-calendar/blob/main/docs/PRIVACY.md`  
   (or host the same text on a GitHub Pages site if Partner Center prefers a non-repo URL).

### Build the Store installer

On **Windows** (Visual Studio Build Tools + WebView2 SDK):

```bash
cd desktop
npm ci
export TAURI_SIGNING_PRIVATE_KEY="$(cat .keys/updater.key)"   # Git Bash / WSL
npm run build:store
```

Outputs in `desktop/src-tauri/target/release/bundle/nsis/`:

| File | Purpose |
|------|---------|
| `Real Calendar_*-setup.exe` | Upload to Partner Center |
| `*-setup.exe.sig` | Updater signature |
| `*.nsis.zip` | In-app update bundle |

Store-specific settings (merged at build time):

- `tauri.microsoftstore.conf.json` — offline WebView2 installer, publisher **Boobuh**
- `tauri.release.conf.json` — updater artifacts + GitHub `latest.json` endpoint

**Silent install argument** for Partner Center: `/S` (uppercase S).

### Sign the installer (Authenticode)

After `npm run build:store`, sign the NSIS exe before upload:

```powershell
signtool sign /fd SHA256 /a "desktop\src-tauri\target\release\bundle\nsis\Real Calendar_*-setup.exe"
```

Verify:

```powershell
signtool verify /pa "...\Real Calendar_*-setup.exe"
```

### Partner Center listing

| Field | Value |
|-------|--------|
| Product name | Real Calendar |
| Publisher display | Boobuh |
| Category | Utilities & tools |
| Pricing | Free |
| Privacy policy | `docs/PRIVACY.md` on GitHub (see above) |
| Support contact | GitHub Issues URL |
| Screenshots | 1366×768+ from desktop app |

**Packages** → link or upload the signed `*-setup.exe` → set silent args **`/S`**.

### CI artifacts

Push to `feat/desktop-tauri` or `main` (with `TAURI_SIGNING_PRIVATE_KEY` set):

- **`real-calendar-windows-store`** — Store-ready NSIS + updater signatures

### Tagged desktop releases

```bash
git tag desktop-v2.0.0
git push origin desktop-v2.0.0
```

Workflow `.github/workflows/desktop-release.yml` builds all platforms, generates **`latest.json`** for the updater, and opens a **draft** GitHub Release. Publish the release, then submit the Windows Store artifact from that release to Partner Center.

### Certification tips

- Use **`build:store`** (offline WebView2), not the default embed bootstrapper.
- Installer must install silently (`/S`).
- Publisher name **Boobuh** must differ from product name **Real Calendar** (already configured).
- Review can take several days; respond promptly to certification feedback in Partner Center.

