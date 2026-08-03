#!/usr/bin/env python3
"""
Generate the ISO Null brand assets: favicon set, touch icons, Open Graph card.

OFFLINE TOOL. This does not run in CI and is not part of `pnpm verify`.

Brand assets change on the order of once a year. Putting this in the verify
pipeline would add a Python toolchain to a pnpm repository in order to
reproduce bytes that are already committed. The committed assets are checked
instead by `scripts/verify-brand-assets.mjs`, which has no dependencies.

Requires Pillow and fontTools, neither of which the repository otherwise uses.
Run it without installing anything permanently:

    uv run --with pillow --with fonttools scripts/build-brand-assets.py

Or with a throwaway virtual environment:

    python3 -m venv /tmp/iso-zero-assets
    /tmp/iso-zero-assets/bin/pip install pillow fonttools
    /tmp/iso-zero-assets/bin/python scripts/build-brand-assets.py

After regenerating, update the manifest the Node check reads:

    cd public && sha256sum favicon.svg favicon.ico mark.svg \
      apple-touch-icon.png icon-192.png icon-512.png og-default.png \
      > brand-assets.sha256

`--check` writes nothing and exits non-zero when regeneration would differ.
Output is deterministic: no timestamps, no wall-clock values, no random
ordering.

The mark is the slashed zero. It is not a new glyph. `font-feature-settings:
"zero"` maps `zero` to `zero.alt01` in every IBM Plex face, so the identity is
a form the stylesheet already produces. PIL cannot apply OpenType features, so
the cmap is patched in memory to point U+0030 at `zero.alt01` directly and the
raster output matches the browser.

Fonts are read from FONT_DIR. Point it at the self-hosted subset once that
lands. The scale specifies weight 600 for both display and overline; if the
directory holds only Regular and Bold, the assets are built at Bold and the
deviation is reported on stdout rather than silently absorbed.

The ICO container is written here rather than shelled out to ImageMagick,
because the tool should not also require a system binary.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import struct
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

# --- Configuration -------------------------------------------------------

FONT_DIR = Path(
    os.environ.get("ISO_ZERO_FONT_DIR", "/mnt/skills/examples/canvas-design/canvas-fonts")
)
OUT_DIR = Path(os.environ.get("ISO_ZERO_ASSET_DIR", "public"))

# Preferred weight first. The scale asks for 600; Bold is the documented
# fallback when a SemiBold subset is not yet in the repository.
FACE_CANDIDATES = {
    "display": ["IBMPlexSerif-SemiBold.ttf", "IBMPlexSerif-Bold.ttf"],
    "mono": ["IBMPlexMono-SemiBold.ttf", "IBMPlexMono-Bold.ttf"],
    "mono-regular": ["IBMPlexMono-Regular.ttf"],
}

# Tokens, dark theme. Copied from src/styles/design-tokens.css.
BG = "#191611"
BORDER = "#3a352c"
TEXT = "#ede7db"
MUTED = "#a39b8c"
ACCENT = "#e8632c"

# Card geometry. 1200 x 630 is 1.905:1, which satisfies the Open Graph 1.91:1
# recommendation and X summary_large_image from a single asset.
CARD_W, CARD_H = 1200, 630
MARGIN = 96  # --space-24
SCALE = 2  # the card is authored at twice the page's token scale

OVERLINE = "ISO Null"
NAV = ["Index", "Galleries", "Prints", "About"]
ACTIVE = "Index"
TITLE_LINES = ["Photographs, field notes,", "and limited prints."]
PLATE_L = "ASTRO · STATIC OUTPUT · SHARP"
PLATE_R = "1200 × 630 · SRGB"

ICON_TILE_INK = 0.56  # glyph ink height as a fraction of the tile

_notes: list[str] = []


# --- Fonts ---------------------------------------------------------------


def _resolve(role: str) -> Path:
    for name in FACE_CANDIDATES[role]:
        candidate = FONT_DIR / name
        if candidate.exists():
            if name != FACE_CANDIDATES[role][0]:
                _notes.append(f"{role}: using {name}; {FACE_CANDIDATES[role][0]} is absent")
            return candidate
    raise SystemExit(f"FONT_MISSING: no face for role {role!r} under {FONT_DIR}")


_PATCH_CACHE: dict[str, Path] = {}


def _slashed(role: str) -> Path:
    """A copy of the face with U+0030 remapped to the slashed zero."""
    if role not in _PATCH_CACHE:
        src = _resolve(role)
        out = Path("/tmp") / f"iso-zero-{src.stem}-slashed.ttf"
        font = TTFont(src)
        if "zero.alt01" not in font.getGlyphOrder():
            raise SystemExit(f"GLYPH_MISSING: {src.name} has no zero.alt01")
        for table in font["cmap"].tables:
            if 0x30 in table.cmap:
                table.cmap[0x30] = "zero.alt01"
        font.save(out)
        _PATCH_CACHE[role] = out
    return _PATCH_CACHE[role]


_FONTS: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def font(role: str, size: int) -> ImageFont.FreeTypeFont:
    key = (role, size)
    if key not in _FONTS:
        _FONTS[key] = ImageFont.truetype(str(_slashed(role)), size)
    return _FONTS[key]


# --- Drawing -------------------------------------------------------------


def tracked(draw, xy, text, fnt, fill, tracking=0.0) -> None:
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill, anchor="la")
        x += fnt.getlength(ch) + tracking


def tracked_width(text: str, fnt, tracking: float = 0.0) -> float:
    return sum(fnt.getlength(c) for c in text) + tracking * max(0, len(text) - 1)


def hairline(draw, x0: int, x1: int, y: int, colour: str = BORDER) -> None:
    draw.rectangle([x0, y, x1 - 1, y], fill=colour)


def rule_datum(draw, x0: int, x1: int, y: int) -> None:
    """1px hairline anchored by a 24 x 2 accent tick, both scaled by SCALE."""
    hairline(draw, x0, x1, y)
    w, h = 24 * SCALE, 2 * SCALE
    draw.rectangle([x0, y - h // 2, x0 + w - 1, y - h // 2 + h - 1], fill=ACCENT)


def fit_glyph(role: str, glyph: str, target_h: int):
    """Size a glyph so its ink box, not its em box, matches target_h."""
    size = max(8, int(target_h * 1.35))
    for _ in range(80):
        box = font(role, size).getbbox(glyph)
        height = box[3] - box[1]
        if height == target_h or size <= 8:
            break
        size += 1 if height < target_h else -1
    box = font(role, size).getbbox(glyph)
    return size, -box[0], -box[1], box[2] - box[0], box[3] - box[1]


def render_mark(size: int) -> Image.Image:
    """The favicon tile: plate, slashed zero, ink only."""
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    fs, dx, dy, w, h = fit_glyph("mono", "0", round(size * ICON_TILE_INK))
    draw.text(
        (size // 2 - w // 2 + dx, size // 2 - h // 2 + dy),
        "0",
        font=font("mono", fs),
        fill=TEXT,
    )
    return img


def render_card() -> Image.Image:
    """og-a-datum-plate: the homepage chrome with the photograph withheld."""
    img = Image.new("RGB", (CARD_W, CARD_H), BG)
    draw = ImageDraw.Draw(img)
    right_edge = CARD_W - MARGIN

    tracked(draw, (MARGIN, 56), OVERLINE, font("mono", 21), TEXT, 1.7)

    nav_font = font("mono-regular", 19)
    tracking, gap = 1.5, 34
    widths = [tracked_width(n.upper(), nav_font, tracking) for n in NAV]
    x = right_edge - (sum(widths) + gap * (len(NAV) - 1))
    for label, width in zip(NAV, widths, strict=True):
        active = label == ACTIVE
        # The allowlist covers the active underline, not the label colour, so
        # the active item is distinguished by full ink plus the accent rule.
        tracked(draw, (round(x), 58), label.upper(), nav_font, TEXT if active else MUTED, tracking)
        if active:
            draw.rectangle([round(x), 86, round(x + width) - 1, 87], fill=ACCENT)
        x += width + gap
    hairline(draw, 0, CARD_W, 116)

    rule_datum(draw, MARGIN, right_edge, 268)

    title = font("display", 76)
    for i, line in enumerate(TITLE_LINES):
        draw.text((MARGIN, 316 + i * 84), line, font=title, fill=TEXT, anchor="la")

    hairline(draw, MARGIN, right_edge, 542)
    plate = font("mono-regular", 19)
    tracked(draw, (MARGIN, 558), PLATE_L, plate, MUTED, 1.4)
    tracked(
        draw,
        (round(right_edge - tracked_width(PLATE_R, plate, 1.4)), 558),
        PLATE_R,
        plate,
        MUTED,
        1.4,
    )
    return img


# --- Vector mark ---------------------------------------------------------


def zero_outline(view: int = 128) -> str:
    """`zero.alt01` as an SVG path, centred and scaled to the icon tile.

    Outlines rather than a <text> element: a text favicon renders in whatever
    face the client has, so the mark would change shape per machine.
    """
    tt = TTFont(_resolve("mono"))
    glyphs = tt.getGlyphSet()
    bounds = BoundsPen(glyphs)
    glyphs["zero.alt01"].draw(bounds)
    x0, y0, x1, y1 = bounds.bounds
    scale = (view * ICON_TILE_INK) / (y1 - y0)
    dx = view / 2 - (x1 - x0) * scale / 2 - x0 * scale
    dy = view / 2 + (y1 - y0) * scale / 2 + y0 * scale
    pen = SVGPathPen(glyphs)
    glyphs["zero.alt01"].draw(TransformPen(pen, (scale, 0, 0, -scale, dx, dy)))
    # Two decimals is below sub-pixel at any icon size; further digits are
    # bytes shipped on every page load.
    return re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group()):.2f}", pen.getCommands())


def svg_favicon(view: int = 128) -> bytes:
    path = zero_outline(view)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view} {view}" '
        f'width="{view}" height="{view}" role="img" aria-label="ISO Null">'
        f'<rect width="{view}" height="{view}" fill="{BG}"/>'
        f'<path d="{path}" fill="{TEXT}"/>'
        f"</svg>\n"
    ).encode("utf-8")


def svg_mark_bare(view: int = 128) -> bytes:
    """No plate. Inherits colour, for inline use in the header."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view} {view}" '
        f'width="{view}" height="{view}" role="img" aria-label="ISO Null">'
        f'<path d="{zero_outline(view)}" fill="currentColor"/>'
        f"</svg>\n"
    ).encode("utf-8")


# --- ICO container -------------------------------------------------------


def ico(images: list[Image.Image]) -> bytes:
    """Pack 32-bit BMP entries.

    BMP rather than embedded PNG because a favicon.ico exists for clients that
    do not take the SVG, and those are the clients least likely to decode
    PNG-in-ICO. Each size is rendered independently: downsampling a large
    master smears the slash into the bowl at 16 px.
    """
    entries, blobs, offset = [], [], 6 + 16 * len(images)
    for img in images:
        w, h = img.size
        rgba = img.convert("RGBA")
        rows = [
            b"".join(
                struct.pack("<4B", *(px[2], px[1], px[0], px[3]))
                for px in (rgba.getpixel((x, y)) for x in range(w))
            )
            for y in reversed(range(h))
        ]
        header = struct.pack("<IiiHHIIiiII", 40, w, h * 2, 1, 32, 0, w * h * 4, 0, 0, 0, 0)
        mask = b"\x00" * (((w + 31) // 32) * 4 * h)
        blob = header + b"".join(rows) + mask
        entries.append(
            struct.pack("<BBBBHHII", w % 256, h % 256, 0, 0, 1, 32, len(blob), offset)
        )
        blobs.append(blob)
        offset += len(blob)
    return struct.pack("<HHH", 0, 1, len(images)) + b"".join(entries) + b"".join(blobs)


def png_bytes(img: Image.Image) -> bytes:
    from io import BytesIO

    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# --- Build ---------------------------------------------------------------


def artifacts() -> dict[str, bytes]:
    return {
        "favicon.svg": svg_favicon(),
        "favicon.ico": ico([render_mark(s) for s in (16, 32, 48)]),
        "mark.svg": svg_mark_bare(),
        "apple-touch-icon.png": png_bytes(render_mark(180)),
        "icon-192.png": png_bytes(render_mark(192)),
        "icon-512.png": png_bytes(render_mark(512)),
        # PNG, not JPEG: the card is one-pixel hairlines on a near-black
        # field, and chroma subsampling destroys both.
        "og-default.png": png_bytes(render_card()),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="write nothing; fail on drift")
    args = parser.parse_args()

    built = artifacts()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    drift = []
    for name, data in built.items():
        target = OUT_DIR / name
        if args.check:
            current = target.read_bytes() if target.exists() else b""
            if hashlib.sha256(current).digest() != hashlib.sha256(data).digest():
                drift.append(name)
        else:
            target.write_bytes(data)
            print(f"{name:24} {len(data):>8} B  {hashlib.sha256(data).hexdigest()[:12]}")

    for note in dict.fromkeys(_notes):
        print(f"NOTE: {note}", file=sys.stderr)

    if args.check and drift:
        print("ASSET_DRIFT: " + ", ".join(drift), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
