#!/usr/bin/env python3
"""Build 16:9 project thumbnails (1600x900) from real project assets and output."""

import json
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


def load_traces():
    path = ROOT / "scripts" / "data" / "tracebench-sample.jsonl"
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def tracebench():
    traces = load_traces()
    base = stipple_bg()
    d = ImageDraw.Draw(base)

    # terminal panel
    tx, ty, tw, th = 90, 110, 640, 680
    term = Image.new("RGB", (tw, th), TERM_BG)
    td = ImageDraw.Draw(term)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        td.ellipse((26 + i * 30, 24, 42 + i * 30, 40), fill=c)
    mono = font(MENLO, 25)
    small = font(MENLO, 23)
    y = 78
    lines = [
        ("$ tracebench run", TERM_INK),
        ("wrote 4 traces", TERM_MUTED),
        ("", TERM_INK),
        ("$ tracebench score", TERM_INK),
        ("tool_error_rate  0.444", TERM_INK),
        ("task_success     0.500", TERM_INK),
        ("keep_rate        0.500", TERM_INK),
        ("", TERM_INK),
        ("$ tracebench cluster", TERM_INK),
        ("2  edit:file_locked", (255, 160, 110)),
        ("1  search:invalid_args", (255, 160, 110)),
        ("1  read:not_found", (255, 160, 110)),
    ]
    for text, colour in lines:
        td.text((32, y), text, font=mono if text.startswith("$") else small, fill=colour)
        y += 46
    shadowed(base, rounded(term, 12), (tx, ty))

    # trace timeline
    px, py, pw, ph = 800, 110, 710, 680
    panel = Image.new("RGB", (pw, ph), (255, 255, 255))
    pd = ImageDraw.Draw(panel)
    pd.rectangle((0, 0, pw - 1, ph - 1), outline=RULE, width=2)
    pd.text((36, 34), "traces.jsonl", font=font(ARIAL_BOLD, 30), fill=INK)
    pd.text((36, 78), "one row per trace, one cell per tool call", font=font(ARIAL, 22), fill=MUTED)

    row_y = 150
    cell = 92
    for t in traces:
        task = t["task"]["id"]
        pd.text((36, row_y), task, font=font(MENLO, 24), fill=INK)
        x = 36
        for s in t["steps"]:
            colour = OK if s["ok"] else BAD
            pd.rounded_rectangle((x, row_y + 44, x + cell, row_y + 44 + 44), radius=6, fill=colour)
            tool = s["tool"]
            tw_ = pd.textlength(tool, font=font(MENLO, 20))
            pd.text((x + (cell - tw_) / 2, row_y + 54), tool, font=font(MENLO, 20), fill=(255, 255, 255))
            x += cell + 10
        verdict = "keep" if t["success"] and all(s["ok"] for s in t["steps"]) else ("pass, retried" if t["success"] else "fail")
        vcol = OK if t["success"] else BAD
        vw = pd.textlength(verdict, font=font(ARIAL_BOLD, 24))
        pd.text((pw - 36 - vw, row_y + 54), verdict, font=font(ARIAL_BOLD, 24), fill=vcol)
        row_y += 130

    lx = 36
    for label, colour in (("ok", OK), ("error", BAD)):
        pd.rounded_rectangle((lx, ph - 58, lx + 22, ph - 36), radius=4, fill=colour)
        pd.text((lx + 32, ph - 61), label, font=font(ARIAL, 22), fill=MUTED)
        lx += 130
    shadowed(base, panel, (px, py))

    base.save(IMAGES / "tracebench" / "tracebench-1600x900.png", optimize=True)


if __name__ == "__main__":
    monocle()
    tracebench()
