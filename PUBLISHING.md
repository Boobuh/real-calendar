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
