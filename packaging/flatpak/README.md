# Flatpak (all Linux distros)

Flatpak runs on Debian, Fedora, Arch, openSUSE, and others with `flatpak` installed.

## Build locally

Requires Flatpak builder and the GNOME 46 SDK:

```bash
sudo apt install flatpak flatpak-builder   # Debian/Ubuntu
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.gnome.Platform//46 org.gnome.Sdk//46

cd packaging/flatpak
flatpak-builder --force-clean --repo=repo build io.github.boobuh.real-calendar.yml
flatpak build-bundle repo real-calendar.flatpak io.github.boobuh.real-calendar
```

Install:

```bash
flatpak install --user real-calendar.flatpak
flatpak run io.github.boobuh.real-calendar
```

## CI

GitHub Actions desktop workflow uploads `.deb`, `.rpm`, and AppImage. Flatpak can be added to release assets when a builder runner is available.

For most users on unknown Linux, prefer the **AppImage** from releases or `make portable` for browser-only use.
