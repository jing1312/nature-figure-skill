# -*- coding: utf-8 -*-
"""Compose Keyphore-style product mockups for FigureForge hero assets.
Tilted perspective card + white bezel + rounded corners + soft drop shadow
on a pastel pink/violet blurred gradient background."""
import sys, io
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 2400, 1560  # output canvas

def find_coeffs(pa, pb):
    """PIL PERSPECTIVE coeffs: output point pa[i] samples input at pb[i].
    pa: output quad corners, pb: input corners."""
    A, b = [], []
    for (xo, yo), (xi, yi) in zip(pa, pb):
        A.append([xo, yo, 1, 0, 0, 0, -xi * xo, -xi * yo]); b.append(xi)
        A.append([0, 0, 0, xo, yo, 1, -yi * xo, -yi * yo]); b.append(yi)
    return np.linalg.solve(np.array(A, dtype=np.float64), np.array(b, dtype=np.float64))

def rounded_mask(size, radius):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return m

def make_background():
    base = Image.new('RGB', (W, H), (247, 241, 246))  # soft pink-white
    blobs = Image.new('RGB', (W, H), (247, 241, 246))
    d = ImageDraw.Draw(blobs)
    # large violet blob bottom-left (like reference)
    d.ellipse([-500, 900, 900, 2100], fill=(150, 108, 230))
    # medium pink-violet blob bottom-right
    d.ellipse([1500, 1050, 2900, 2200], fill=(196, 145, 238))
    # faint rose tint top-left
    d.ellipse([-300, -300, 600, 400], fill=(244, 208, 222))
    blobs = blobs.filter(ImageFilter.GaussianBlur(220))
    return Image.blend(base, blobs, 0.72)

def make_card(shot_path, bezel=16, radius=48):
    shot = Image.open(shot_path).convert('RGB')
    tw = 1980
    th = round(shot.height * tw / shot.width)  # ~1114
    shot = shot.resize((tw, th), Image.LANCZOS)
    cw, ch = tw + bezel * 2, th + bezel * 2
    card = Image.new('RGB', (cw, ch), (252, 251, 253))  # near-white bezel
    card.paste(shot, (bezel, bezel))
    # hairline outline around the bezel
    ImageDraw.Draw(card).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=radius, outline=(214, 205, 220), width=2)
    card = card.convert('RGBA')
    card.putalpha(rounded_mask((cw, ch), radius))
    return card

def compose(shot_path, out_path, quad):
    card = make_card(shot_path)
    cw, ch = card.size
    bg = make_background()

    src = [(0, 0), (cw, 0), (cw, ch), (0, ch)]
    coeffs = find_coeffs(quad, src)

    # soft drop shadow: blurred black silhouette, same perspective
    sil = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(sil).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=48, fill=110)
    sil = sil.filter(ImageFilter.GaussianBlur(46))
    shadow = Image.merge('RGBA', [Image.new('L', (cw, ch), 20)] * 3 + [sil])
    shadow = shadow.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)
    # nudge shadow down
    off = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    off.paste(shadow, (0, 48), shadow)
    bg = Image.alpha_composite(bg.convert('RGBA'), off)

    warped = card.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)
    bg = Image.alpha_composite(bg, warped)
    bg.convert('RGB').save(out_path, 'JPEG', quality=88)
    print('saved', out_path)

# quad corners (output coords): TL, TR, BR, BL — right side lifted, mild tilt-back
QUAD = [(300, 245), (2120, 160), (2262, 1252), (218, 1332)]

compose(r"C:\Users\江静静\AppData\Local\Temp\ff-hero.png",
        r"C:\Users\江静静\AppData\Local\Temp\mock-canvas.jpg", QUAD)
compose(r"C:\Users\江静静\AppData\Local\Temp\ff-editor.png",
        r"C:\Users\江静静\AppData\Local\Temp\mock-editor.jpg", QUAD)
