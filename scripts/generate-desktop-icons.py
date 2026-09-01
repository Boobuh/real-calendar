#!/usr/bin/env python3
"""Generate Tauri icon PNG/ICO/ICNS from the Real Calendar brand colors."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "desktop" / "src-tauri" / "icons"
ORANGE = (255, 122, 61)
BG = (43, 43, 43)
DOT = (245, 245, 245)


def _chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path: Path, size: int) -> None:
    from PIL import Image, ImageDraw

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = size // 8
    radius = size // 10
    body = [pad, pad + size // 5, size - pad, size - pad]
    draw.rounded_rectangle(body, radius=radius, fill=BG + (255,), outline=ORANGE + (255,), width=max(2, size // 32))
    header = [pad, pad, size - pad, pad + size // 5]
    draw.rounded_rectangle(header, radius=radius, fill=ORANGE + (255,))
    dot_r = max(2, size // 22)
    cols = 3
    rows = 2
    grid_top = pad + size // 3
    grid_left = pad + size // 6
    grid_w = size - 2 * (pad + size // 6)
    grid_h = size - grid_top - pad
    for row in range(rows):
        for col in range(cols):
            cx = grid_left + (col + 0.5) * grid_w / cols
            cy = grid_top + (row + 0.5) * grid_h / rows
            color = ORANGE if (row, col) == (0, 2) else DOT
            draw.ellipse(
                (cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r),
                fill=color + (255,),
            )
    img.save(path, format="PNG")


def write_ico(path: Path, sizes: list[int]) -> None:
    from PIL import Image

    images = []
    for size in sizes:
        from PIL import ImageDraw

        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        pad = size // 8
        radius = size // 10
        body = [pad, pad + size // 5, size - pad, size - pad]
        draw.rounded_rectangle(body, radius=radius, fill=BG + (255,), outline=ORANGE + (255,), width=max(2, size // 32))
        header = [pad, pad, size - pad, pad + size // 5]
        draw.rounded_rectangle(header, radius=radius, fill=ORANGE + (255,))
        images.append(img)
    images[0].save(path, format="ICO", sizes=[(s, s) for s in sizes], append_images=images[1:])


def write_icns(path: Path, png256: Path) -> None:
    png = png256.read_bytes()
    entry = struct.pack(">4sI", b"ic09", len(png) + 8) + png
    data = struct.pack(">4sI", b"icns", len(entry) + 8) + entry
    path.write_bytes(data)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_png(OUT / "32x32.png", 32)
    write_png(OUT / "128x128.png", 128)
    write_png(OUT / "128x128@2x.png", 256)
    write_png(OUT / "icon.png", 512)
    write_ico(OUT / "icon.ico", [16, 32, 48, 64, 128, 256])
    print(f"Wrote icons under {OUT}")
    print("Run: cd desktop && npx tauri icon src-tauri/icons/icon.png")


if __name__ == "__main__":
    main()
