# Real Calendar

A GNOME Shell extension for Ubuntu that adds a **13-month calendar** to the top-bar date menu — as a second option next to Gregorian, or as a replacement.

The **24-hour clock** and the **7-day week** are left alone. What changes is the year: thirteen months of 28 days, plus named extra days that still have weekdays.

## The calendar

This follows the [International Fixed Calendar](https://en.wikipedia.org/wiki/International_Fixed_Calendar):

| | |
| --- | --- |
| Months | 13 × 28 days |
| Extra month | **Sol**, between June and July (Latin for the sun / mid-year solstice) |
| Year Day | After December 28 (always Gregorian 31 December) |
| Leap Day | After June 28 in leap years (Gregorian day-of-year 169) |
| Week | Sunday–Saturday, never skipped |
| Clock | 24-hour, unchanged |

Because the week is kept continuous, a month does not always start on Sunday. That is intentional: churches and workplaces already keep a 7-day cycle, and so does this plugin.

On 23 August 2026 (Sunday), the Real date is **Sunday August 11 2026**.

## The 13 signs

Each 28-day month has one sign. The thirteenth is **Ophiuchus** (the Serpent Bearer, ⛎), which sits on the ecliptic between Scorpio and Sagittarius.

| Month | Sign | |
| --- | --- | --- |
| January | Capricorn | ♑ |
| February | Aquarius | ♒ |
| March | Pisces | ♓ |
| April | Aries | ♈ |
| May | Taurus | ♉ |
| June | Gemini | ♊ |
| **Sol** | Cancer | ♋ |
| July | Leo | ♌ |
| August | Virgo | ♍ |
| September | Libra | ♎ |
| October | Scorpio | ♏ |
| November | **Ophiuchus** | ⛎ |
| December | Sagittarius | ♐ |

Leap Day uses Gemini (the June / Sol threshold). Year Day uses Sagittarius (the December / January threshold).

## Install on Ubuntu (GNOME 45+)

Tested against GNOME Shell 46 (Ubuntu 24.04). Also declared for 45, 47, 48, and 49.

```bash
git clone https://github.com/Boobuh/real-calendar.git
cd real-calendar
./scripts/install.sh
```

On Wayland, log out and back in so GNOME Shell reloads extensions. On Xorg, Alt+F2, type `r`, Enter.

Then click the clock in the top bar. You should see a **Gregorian | Real** toggle. Open **Extensions → Real Calendar → Settings** to:

- keep that toggle (**Second option**, default), or
- **Replace the default calendar**

Uninstall:

```bash
./scripts/uninstall.sh
```

## Ubuntu App Center and software stores

GNOME Shell extensions are **not** published as snaps. To get Real Calendar onto Ubuntu desktops:

1. **Extension Manager** (install from App Center) → browse extensions after we publish to [extensions.gnome.org](https://extensions.gnome.org/).
2. **`.deb` package** — `make`-less build: see [PUBLISHING.md](./PUBLISHING.md) for `debuild`, PPA, and Ubuntu universe steps so App Center can list `gnome-shell-extension-real-calendar`.

Packaging helpers:

```bash
make pack    # EGO upload zip → build/*.shell-extension.zip
make test    # conversion + time-reading tests
```

## Demo and CLI (no GNOME required)

```bash
npm test
node bin/real-calendar.js
node bin/real-calendar.js 2026-08-23
python3 -m http.server 8765
# open http://127.0.0.1:8765/demo/
```

## Layout

```
src/real-calendar@boobuh.github.io/   GNOME Shell extension
  lib/calendar.js                     date conversion
  lib/zodiac.js                       13 signs
  lib/timeReading.js                  369 time reading
demo/                                 browser preview of the date menu
desktop/                              Tauri app (macOS, Windows, Linux)
bin/real-calendar.js                  print today in Real + zodiac
```

## Desktop (macOS & Windows)

Cross-platform app via [Tauri](https://tauri.app/) — same web UI and shared `lib/` as the demo (no Swift rewrite).

### Download (no app store)

| Platform | Get it |
|----------|--------|
| **Windows** | [**Download for Windows**](https://github.com/Boobuh/real-calendar/releases/latest) → `*-setup.exe` |
| **macOS** | [**Download for Mac**](https://github.com/Boobuh/real-calendar/releases/latest) → `.dmg` (see below) |
| **Linux** | [Releases](https://github.com/Boobuh/real-calendar/releases/latest) → `.AppImage` / `.deb` / `.rpm` |
| **Browser only** | `real-calendar-portable.zip` on the same release page |

> **Mac App Store:** not planned for now (Apple Developer Program is $99/year). GitHub Releases is the official Mac download path.

### Install on macOS (10.15 Catalina or later)

1. Open **[Releases](https://github.com/Boobuh/real-calendar/releases/latest)** and download the **`.dmg`** file (name looks like `Real Calendar_2.0.0_aarch64.dmg` on Apple Silicon, or `_x64.dmg` on Intel Mac).
2. Open the downloaded `.dmg` (double-click in Finder or Downloads).
3. Drag **Real Calendar** into the **Applications** folder shown in the window.
4. Eject the disk image (right-click the mounted volume → **Eject**).
5. Open **Applications** → double-click **Real Calendar**.

**If macOS says the app “cannot be opened” or “is from an unidentified developer”** (normal for GitHub builds without App Store notarization):

- **macOS Ventura / Sonoma / Sequoia:** **System Settings → Privacy & Security** → scroll down → **Open Anyway** next to Real Calendar, then confirm.
- **Or:** Control-click (or right-click) **Real Calendar** in Applications → **Open** → **Open** again in the dialog. You only need to do this once.

No Apple ID or App Store account is required. Updates: check [Releases](https://github.com/Boobuh/real-calendar/releases/latest) for a new `.dmg`, or use in-app update when enabled in a signed release.

Build from source:

```bash
cd desktop
npm install
npm run dev      # development window
npm run build    # .dmg / .msi / .deb / .AppImage
```

See [desktop/README.md](./desktop/README.md) for platform prerequisites. Maintainer release flow: [PUBLISHING.md](./PUBLISHING.md#desktop-app-windows--macos--linux--recommended).

Full compatibility matrix (Debian, Fedora, Arch, older Mac/Windows): [packaging/COMPATIBILITY.md](./packaging/COMPATIBILITY.md).

Portable offline zip for the widest browser support:

```bash
make portable   # build/real-calendar-portable.zip
```
