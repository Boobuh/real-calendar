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
demo/                                 browser preview of the date menu
bin/real-calendar.js                  print today in Real + zodiac
```
