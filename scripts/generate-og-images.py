#!/usr/bin/env python3
"""Build 1200x630 share cards for landing pages."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
PAPER = (251, 251, 250)
INK = (33, 35, 45)
MUTED = (90, 94, 107)
RULE = (232, 232, 230)
LINK = (37, 99, 235)

FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
FONT_REG = Path("/System/Library/Fonts/Supplemental/Arial.ttf")


def font(path, size):
    return ImageFont.truetype(str(path), size)


def cover_crop(img, box):
    tw, th = box
    src = img.convert("RGB")
    sw, sh = src.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def draw_label(draw, xy, title, subtitle, brand="bicrick"):
    x, y = xy
    draw.text((x, y), brand, font=font(FONT_BOLD, 28), fill=INK)
    draw.text((x, y + 46), title, font=font(FONT_BOLD, 64), fill=INK)
    draw.text((x, y + 130), subtitle, font=font(FONT_REG, 26), fill=MUTED)


def save_jpg(img, name):
    path = OUT / name
    img.convert("RGB").save(path, "JPEG", quality=90, optimize=True)
    print(f"wrote {path}")


def make_home():
    canvas = Image.new("RGB", (W, H), PAPER)
    photo = cover_crop(Image.open(PUBLIC / "about" / "headshot.jpg"), (630, H))
    canvas.paste(photo, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line((630, 0, 630, H), fill=RULE, width=1)
    draw_label(draw, (668, 210), "Patrick Brown", "Agent-first engineer · Austin, TX")
    save_jpg(canvas, "home-1200x630.jpg")


def make_about():
    canvas = Image.new("RGB", (W, H), PAPER)
    photo = cover_crop(Image.open(PUBLIC / "about" / "img-4149.jpg"), (630, H))
    canvas.paste(photo, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line((630, 0, 630, H), fill=RULE, width=1)
    draw_label(draw, (668, 190), "about", "Data engineer at H-E-B")
    draw.text((668, 360), "Golf, puzzles, and building\nwith coding agents.", font=font(FONT_REG, 24), fill=MUTED)
    save_jpg(canvas, "about-1200x630.jpg")


def make_projects():
    tiles = [
        PUBLIC / "images" / "qwop-python" / "qwop-python-1200x600.png",
        PUBLIC / "images" / "golf-incremental" / "range-rat-1200x600.jpg",
        PUBLIC / "images" / "notepadable" / "notepadable-1200x600.png",
        PUBLIC / "images" / "gd-visualizer" / "gd-visualizer-1200x600.png",
        PUBLIC / "images" / "ai-masters" / "ut-msai-1200x600.png",
        PUBLIC / "images" / "docprep" / "docprep-1200x600.png",
    ]
    cols, rows = 3, 2
    gap = 8
    bar_h = 72
    cell_w = (W - gap * (cols + 1)) // cols
    cell_h = (H - bar_h - gap * (rows + 1)) // rows
    canvas = Image.new("RGB", (W, H), PAPER)
    for i, path in enumerate(tiles):
        c, r = i % cols, i // cols
        tile = cover_crop(Image.open(path), (cell_w, cell_h))
        x = gap + c * (cell_w + gap)
        y = gap + r * (cell_h + gap)
        canvas.paste(tile, (x, y))

    draw = ImageDraw.Draw(canvas)
    draw.text((36, H - 50), "bicrick", font=font(FONT_BOLD, 22), fill=INK)
    draw.text((140, H - 54), "projects", font=font(FONT_BOLD, 32), fill=INK)
    save_jpg(canvas, "projects-1200x630.jpg")


def make_contact():
    canvas = Image.new("RGB", (W, H), PAPER)
    photo = cover_crop(Image.open(PUBLIC / "about" / "headshot.jpg"), (220, 220))
    mask = Image.new("L", (220, 220), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 219, 219), fill=255)
    circled = Image.new("RGB", (220, 220), PAPER)
    circled.paste(photo, (0, 0), mask)
    canvas.paste(circled, (490, 88))

    draw = ImageDraw.Draw(canvas)
    draw.text((W // 2, 360), "contact", font=font(FONT_BOLD, 64), fill=INK, anchor="mm")
    draw.text((W // 2, 430), "patrickbrownai@gmail.com", font=font(FONT_REG, 28), fill=LINK, anchor="mm")
    draw.text((W // 2, 490), "bicrick", font=font(FONT_BOLD, 24), fill=MUTED, anchor="mm")
    save_jpg(canvas, "contact-1200x630.jpg")


if __name__ == "__main__":
    make_home()
    make_about()
    make_projects()
    make_contact()
