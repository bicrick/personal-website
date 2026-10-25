#!/usr/bin/env python3
"""Build 16:9 project thumbnails (1600x900) from real project assets and output."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "public" / "images"

W, H = 1600, 900
PAPER = (244, 244, 241)
INK = (33, 35, 45)
MUTED = (90, 94, 107)
RULE = (222, 222, 218)
LINK = (37, 99, 235)
OK = (47, 133, 90)
BAD = (194, 65, 12)
TERM_BG = (20, 21, 26)
TERM_INK = (226, 228, 232)
TERM_MUTED = (139, 142, 151)

ARIAL = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
ARIAL_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
MENLO = Path("/System/Library/Fonts/Menlo.ttc")


def font(path, size):
    return ImageFont.truetype(str(path), size)


def stipple_bg():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    step = 28
    for x in range(step // 2, W, step):
        for y in range(step // 2, H, step):
            d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=(214, 214, 210))
    return img


def shadowed(base, img, xy, radius=22, offset=14, alpha=70):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    x, y = xy
    sd.rounded_rectangle(
        (x, y + offset, x + img.width, y + img.height + offset),
        radius=10,
        fill=(20, 22, 30, alpha),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius))
    base.paste(shadow, (0, 0), shadow)
    base.paste(img, xy)


def rounded(img, radius=10):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.width, img.height), radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def centered_text(draw, cx, y, text, fnt, fill):
    w = draw.textlength(text, font=fnt)
    draw.text((cx - w / 2, y), text, font=fnt, fill=fill)


def monocle():
    base = stipple_bg()
    d = ImageDraw.Draw(base)

    before = Image.open(IMAGES / "monocle" / "wordle-before.png").convert("RGB")
    after = Image.open(IMAGES / "monocle" / "wordle-after.png").convert("RGB")

    # Layout: a wide CLI prompt bar across the top, then the before / after
    # screenshots below it with an arrow between them.
    prompt = font(MENLO, 62)
    text = "make this medieval themed"
    indent = 62
    pad_x = 48
    bar_w = d.textlength(text, font=prompt) + pad_x * 2 + indent
    bar_h = 128
    bar_top = 48
    bar = ((W - bar_w) / 2, bar_top, (W + bar_w) / 2, bar_top + bar_h)

    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle(
        (bar[0], bar[1] + 10, bar[2], bar[3] + 10), radius=22, fill=(20, 22, 30, 90)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(14))
    base.paste(glow, (0, 0), glow)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle(bar, radius=22, fill=TERM_BG)
    text_y = bar[1] + (bar_h - 62) / 2 - 8
    d.text((bar[0] + pad_x, text_y), ">", font=prompt, fill=LINK)
    d.text((bar[0] + pad_x + indent, text_y), text, font=prompt, fill=TERM_INK)

    target_h = 560
    before = before.resize((int(before.width * target_h / before.height), target_h), Image.Resampling.LANCZOS)
    after = after.resize((int(after.width * target_h / after.height), target_h), Image.Resampling.LANCZOS)

    shots_top = bar[3] + 42
    arrow_gap = 280
    left_xy = (int(W / 2 - arrow_gap / 2 - before.width), int(shots_top))
    right_xy = (int(W / 2 + arrow_gap / 2), int(shots_top))
    shadowed(base, rounded(before), left_xy)
    shadowed(base, rounded(after), right_xy)

    d = ImageDraw.Draw(base)
    label = font(ARIAL_BOLD, 30)
    label_y = shots_top + target_h + 30
    centered_text(d, left_xy[0] + before.width / 2, label_y, "BEFORE", label, MUTED)
    centered_text(d, right_xy[0] + after.width / 2, label_y, "AFTER", label, LINK)

    cx = W / 2
    ay = shots_top + target_h / 2
    d.line((cx - 92, ay, cx + 58, ay), fill=LINK, width=12)
    d.polygon([(cx + 100, ay), (cx + 56, ay - 30), (cx + 56, ay + 30)], fill=LINK)
    centered_text(d, cx, ay + 58, "local Cursor CLI", font(ARIAL_BOLD, 28), INK)

    base.save(IMAGES / "monocle" / "monocle-1600x900.png", optimize=True)


if __name__ == "__main__":
    monocle()
