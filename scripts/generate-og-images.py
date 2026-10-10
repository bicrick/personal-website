#!/usr/bin/env python3
"""Build 1200x630 share cards."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
PANEL = 630
PAPER = (251, 251, 250)
INK = (33, 35, 45)
MUTED = (90, 94, 107)
RULE = (232, 232, 230)
LINK = (37, 99, 235)

def _first_existing(*candidates):
    for path in candidates:
        if Path(path).exists():
            return Path(path)
    raise FileNotFoundError(f"No font found among: {candidates}")


FONT_BOLD = _first_existing(
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)
FONT_REG = _first_existing(
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)


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


def contain_pad(img, box, bg=PAPER):
    tw, th = box
    src = img.convert("RGB")
    if bg is None:
        bg = src.getpixel((2, 2))
    sw, sh = src.size
    pad = 48
    scale = min((tw - pad * 2) / sw, (th - pad * 2) / sh)
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", box, bg)
    canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def title_size(text):
    if len(text) > 18:
        return 44
    if len(text) > 14:
        return 52
    return 64


def save_jpg(img, name):
    path = OUT / name
    img.convert("RGB").save(path, "JPEG", quality=90, optimize=True)
    print(f"wrote {path}")


TEXT_X = 668
TEXT_W = W - TEXT_X - 40


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def split_card(visual, title, subtitle, name, fit="cover", bg=PAPER):
    canvas = Image.new("RGB", (W, H), PAPER)
    src = Image.open(visual)
    panel = cover_crop(src, (PANEL, H)) if fit == "cover" else contain_pad(src, (PANEL, H), bg)
    canvas.paste(panel, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line((PANEL, 0, PANEL, H), fill=RULE, width=1)

    title_font = font(FONT_BOLD, title_size(title))
    title_lines = [title]
    if draw.textlength(title, font=title_font) > TEXT_W:
        title_font = font(FONT_BOLD, 52)
        title_lines = wrap(draw, title, title_font, TEXT_W)
    sub_font = font(FONT_REG, 26)
    sub_lines = wrap(draw, subtitle, sub_font, TEXT_W)

    title_h = int(title_font.size * 1.2)
    block = 46 + title_h * len(title_lines) + 22 + 36 * len(sub_lines)
    y = (H - block) // 2
    draw.text((TEXT_X, y), "bicrick", font=font(FONT_BOLD, 28), fill=INK)
    ty = y + 46
    for line in title_lines:
        draw.text((TEXT_X, ty), line, font=title_font, fill=INK)
        ty += title_h
    ty += 22
    for line in sub_lines:
        draw.text((TEXT_X, ty), line, font=sub_font, fill=MUTED)
        ty += 36
    save_jpg(canvas, name)


def center_card(title, subtitle, name, visual=None):
    canvas = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)
    if visual:
        photo = cover_crop(Image.open(visual), (220, 220))
        mask = Image.new("L", (220, 220), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 219, 219), fill=255)
        circled = Image.new("RGB", (220, 220), PAPER)
        circled.paste(photo, (0, 0), mask)
        canvas.paste(circled, (490, 88))
        title_y = 360
    else:
        title_y = 250
    draw.text((W // 2, title_y), title, font=font(FONT_BOLD, 64), fill=INK, anchor="mm")
    draw.text((W // 2, title_y + 70), subtitle, font=font(FONT_REG, 28), fill=MUTED, anchor="mm")
    draw.text((W // 2, title_y + 130), "bicrick", font=font(FONT_BOLD, 24), fill=MUTED, anchor="mm")
    save_jpg(canvas, name)


def make_home():
    split_card(
        PUBLIC / "about" / "headshot.jpg",
        "Patrick Brown",
        "Platform Engineer · Austin, TX",
        "home-1200x630.jpg",
    )


def make_about():
    canvas = Image.new("RGB", (W, H), PAPER)
    photo = cover_crop(Image.open(PUBLIC / "about" / "img-4149.jpg"), (PANEL, H))
    canvas.paste(photo, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line((PANEL, 0, PANEL, H), fill=RULE, width=1)
    x, y = 668, 190
    draw.text((x, y), "bicrick", font=font(FONT_BOLD, 28), fill=INK)
    draw.text((x, y + 46), "about", font=font(FONT_BOLD, 64), fill=INK)
    draw.text((x, y + 130), "Platform Engineer at H-E-B", font=font(FONT_REG, 26), fill=MUTED)
    draw.text((x, 360), "Golf, puzzles, and building\nwith coding agents.", font=font(FONT_REG, 24), fill=MUTED)
    save_jpg(canvas, "about-1200x630.jpg")


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


def make_projects():
    center_card("projects", "software by bicrick", "projects-simple-1200x630.jpg")


def make_page_cards():
    center_card(
        "career",
        "Platform Engineer at H-E-B",
        "career-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "heb" / "heb-logo.png",
        "data platform engineering at h-e-b",
        "10+ teams, 100+ users on one control room",
        "heb-1200x630.jpg",
        fit="contain",
        bg=(255, 255, 255),
    )
    split_card(
        PUBLIC / "images" / "agent-research-loops" / "loop-card.png",
        "agentic research loops",
        "An agent that reshapes rewards so the next run avoids the last cheat",
        "agent-research-loops-1200x630.jpg",
        fit="contain",
        bg=None,
    )
    split_card(
        PUBLIC / "images" / "auto-research" / "cart-pole-card.png",
        "cart-pole-autoresearch",
        "Agentic loops on cart-pole, from PPO to MPPI",
        "auto-research-1200x630.jpg",
        fit="contain",
        bg=None,
    )


def make_project_cards():
    split_card(
        PUBLIC / "images" / "qwop-python" / "qwop-python-1200x600.png",
        "qwop-python",
        "QWOP world record with RL",
        "qwop-python-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "qwop-python" / "qwop-python-1200x600.png",
        "qwop demo",
        "PPO agent replay",
        "qwop-demo-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "golf-incremental" / "range-rat-playlist-cover.jpg",
        "range rat",
        "2.5d golf incremental",
        "range-rat-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "notepadable" / "notepadable-logo.png",
        "notepadable",
        "a text editor in the URL",
        "notepadable-1200x630.jpg",
        fit="contain",
    )
    split_card(
        PUBLIC / "images" / "gd-visualizer" / "gd-visualizer-1200x600.png",
        "gd-visualizer",
        "3D optimizer playground",
        "gd-visualizer-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "docprep" / "docprep-1200x600.png",
        "docprep",
        "Office docs to plaintext",
        "docprep-1200x630.jpg",
        fit="contain",
    )
    split_card(
        PUBLIC / "images" / "ai-masters" / "ut-msai-1200x600.png",
        "ai masters",
        "UT Austin MSAI notes",
        "ai-masters-1200x630.jpg",
    )
    split_card(
        PUBLIC / "images" / "monocle" / "monocle-1600x900.png",
        "monocle",
        "restyle the live tab",
        "monocle-1200x630.jpg",
        fit="contain",
    )
    split_card(
        PUBLIC / "images" / "tracebench" / "tracebench-1600x900.png",
        "tracebench",
        "offline agent evals",
        "tracebench-1200x630.jpg",
        fit="contain",
    )
    split_card(
        PUBLIC / "images" / "context-shaping" / "headline.png",
        "same model, better harness",
        "How far can context management and tool design push a cheap model?",
        "context-shaping-1200x630.jpg",
        fit="contain",
        bg=None,
    )


if __name__ == "__main__":
    make_home()
    make_about()
    make_projects()
    make_contact()
    make_page_cards()
    make_project_cards()
