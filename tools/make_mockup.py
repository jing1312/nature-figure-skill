# -*- coding: utf-8 -*-
"""Keyphore-style product mockups for FigureForge hero assets. v2
Supersampled 2x: tilted perspective card + white bezel + rounded corners,
large soft drop shadow (down-only offset), pastel pink/violet blurred
gradient background. Output 2400x1560 JPEG q90."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SS = 2                      # supersample factor
W, H = 2400 * SS, 1560 * SS

def find_coeffs(pa, pb):
    """PIL PERSPECTIVE coeffs: output point pa[i] samples input at pb[i]."""
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
    # gentle vertical base gradient: warm pink-white -> faint lilac
    top, bot = (250, 246, 250), (241, 234, 245)
    base = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(base)
    for y in range(H):
        t = y / (H - 1)
        col = tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=col)
    # blurred color blobs, screened softly over the base (muted lavender family)
    blobs = Image.new('RGB', (W, H), (246, 241, 248))
    d = ImageDraw.Draw(blobs)
    d.ellipse([-420 * SS, 1050 * SS, 800 * SS, 2300 * SS], fill=(174, 143, 226))   # violet BL
    d.ellipse([1600 * SS, 1150 * SS, 3000 * SS, 2400 * SS], fill=(211, 176, 238))  # pink-violet BR
    d.ellipse([-250 * SS, -260 * SS, 520 * SS, 380 * SS], fill=(248, 224, 233))    # rose TL
    blobs = blobs.filter(ImageFilter.GaussianBlur(170 * SS))
    return Image.blend(base, blobs, 0.50)

def make_card(shot_path, bezel=18 * SS, radius=52 * SS):
    shot = Image.open(shot_path).convert('RGB')
    tw = 2000 * SS
    th = round(shot.height * tw / shot.width)
    shot = shot.resize((tw, th), Image.LANCZOS)
    cw, ch = tw + bezel * 2, th + bezel * 2
    card = Image.new('RGB', (cw, ch), (253, 252, 254))
    card.paste(shot, (bezel, bezel))
    ImageDraw.Draw(card).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=radius,
                                           outline=(216, 208, 222), width=2 * SS)
    card = card.convert('RGBA')
    card.putalpha(rounded_mask((cw, ch), radius))
    return card

def compose(shot_path, out_path, quad):
    card = make_card(shot_path)          # RGBA, transparent only at corners
    cw, ch = card.size
    bg = make_background().convert('RGBA')

    q = [(x * SS, y * SS) for x, y in quad]
    coeffs = find_coeffs(q, [(0, 0), (cw, 0), (cw, ch), (0, ch)])

    def warp(img):
        return img.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)

    # kill dark edge bleed: warp opaque RGB (white-filled) and alpha separately
    rgb = Image.merge('RGB', card.split()[:3])
    alpha = card.split()[3]
    warped = Image.merge('RGBA', (*warp(rgb).split(), warp(alpha)))

    # two-layer shadow: tight contact shadow + wide low ambient pool, down-only
    for blur_r, fill, dy in ((36 * SS, 95, 40 * SS), (115 * SS, 38, 135 * SS)):
        sil = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(sil).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=52 * SS, fill=fill)
        sil = sil.filter(ImageFilter.GaussianBlur(blur_r))
        sh = Image.merge('RGBA', [Image.new('L', (cw, ch), 28)] * 3 + [sil])
        sh = warp(sh)
        off = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        off.paste(sh, (0, dy), sh)
        bg = Image.alpha_composite(bg, off)

    bg = Image.alpha_composite(bg, warped)
    out = bg.convert('RGB').resize((2400, 1560), Image.LANCZOS)  # downsample = clean AA
    out.save(out_path, 'JPEG', quality=90, subsampling=1)
    print('saved', out_path)

# quad (2400x1560 space): TL, TR, BR, BL — right side lifted, mild tilt-back
QUAD = [(300, 245), (2120, 160), (2262, 1252), (218, 1332)]

compose(r"C:\Users\江静静\AppData\Local\Temp\ff-hero.png",
        r"C:\Users\江静静\AppData\Local\Temp\mock-canvas.jpg", QUAD)
compose(r"C:\Users\江静静\AppData\Local\Temp\ff-editor.png",
        r"C:\Users\江静静\AppData\Local\Temp\mock-editor.jpg", QUAD)
