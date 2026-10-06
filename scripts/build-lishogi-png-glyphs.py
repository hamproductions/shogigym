from pathlib import Path
import urllib.request
import sys
import runpy
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
shared = runpy.run_path(str(ROOT / 'scripts' / 'build-piece-glyphs.py'))
fit_glyph_set = shared['fit_glyph_set']
CODES = ['OU', 'GY', 'HI', 'RY', 'KA', 'UM', 'KI', 'GI', 'NG', 'KE', 'NK', 'KY', 'NY', 'FU', 'TO']
SETS = ['portella', 'portella_2kanji', 'pixel']
BASE = 'https://raw.githubusercontent.com/WandererXII/lishogi/master/ui/@build/pieces/assets/standard'


def without_specks(alpha):
    remaining = alpha > 0
    h, w = remaining.shape
    for y, x in zip(*np.nonzero(remaining)):
        if not remaining[y, x]:
            continue
        stack = [(y, x)]
        remaining[y, x] = False
        points = []
        while stack:
            cy, cx = stack.pop()
            points.append((cy, cx))
            for dy in [-1, 0, 1]:
                for dx in [-1, 0, 1]:
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and remaining[ny, nx]:
                        remaining[ny, nx] = False
                        stack.append((ny, nx))
        ys, xs = zip(*points)
        if max(xs) - min(xs) < 2 or max(ys) - min(ys) < 2:
            for py, px in points:
                alpha[py, px] = 0
    return alpha


def extract(image, piece_set):
    px = np.array(image.convert('RGBA'))
    rgb = px[:, :, :3].astype(float)
    lum = rgb @ np.array([.3, .59, .11])
    red = (rgb[:, :, 0] - rgb[:, :, 1] > 55) & (rgb[:, :, 0] - rgb[:, :, 2] > 55)
    if piece_set == 'pixel':
        inside = px[:, :, 3] > 250
        h, w = inside.shape
        padded = np.pad(inside, 6)
        interior = np.logical_and.reduce([padded[dy:dy + h, dx:dx + w] for dy in range(13) for dx in range(13)])
        ink = red if np.any(red) else lum < 90
        alpha = without_specks(np.where(ink & interior, px[:, :, 3], 0).astype(np.uint8))
    else:
        h, w = lum.shape
        region = np.zeros((h, w), dtype=bool)
        region[round(h * .05):round(h * .845), round(w * .09):round(w * .90)] = True
        surface = (lum > 140) & (rgb[:, :, 0] > rgb[:, :, 1]) & (rgb[:, :, 1] > rgb[:, :, 2])
        interior = np.zeros_like(region)
        for y in range(h):
            xs = np.flatnonzero(surface[y] & region[y])
            if len(xs) > 1:
                interior[y, xs[0] + 1:xs[-1]] = True
        region &= interior
        coverage = np.clip((140 - lum) / 100, 0, 1)
        ink = (lum < 90) & region & (px[:, :, 3] >= 250)
        padded = np.pad(ink, 3)
        adjacent = np.logical_or.reduce([padded[dy:dy + h, dx:dx + w] for dy in range(7) for dx in range(7)])
        highlights = (rgb.max(axis=2) - rgb.min(axis=2) < 30) & (lum >= 140) & adjacent
        coverage[highlights] = 1
        alpha = np.rint(px[:, :, 3] * coverage * region * (px[:, :, 3] >= 250)).astype(np.uint8)
        alpha = without_specks(alpha)
    out = np.zeros_like(px)
    out[:, :, :3] = [18, 12, 6]
    if piece_set == 'pixel':
        out[:, :, :3][red] = [156, 28, 18]
    elif np.count_nonzero(red & (alpha > 127)) > np.count_nonzero(alpha > 127) / 4:
        out[:, :, :3] = [156, 28, 18]
    out[:, :, 3] = alpha
    return Image.fromarray(out)


for piece_set in (sys.argv[1:] or SETS):
    source = ROOT / 'assets' / 'pieces' / 'sources' / piece_set
    target = ROOT / 'public' / 'pieces' / 'prepared' / piece_set
    source.mkdir(parents=True, exist_ok=True)
    target.mkdir(parents=True, exist_ok=True)
    images = {}
    for code in CODES:
        path = source / f'0{code}.png'
        if not path.exists():
            with urllib.request.urlopen(f'{BASE}/{piece_set}/{path.name}') as response:
                path.write_bytes(response.read())
        images[code] = extract(Image.open(path), piece_set)
    for code, image in fit_glyph_set(images, resampling=Image.Resampling.NEAREST if piece_set == 'pixel' else Image.Resampling.LANCZOS, piece_set=piece_set).items():
        image.save(target / f'{code}.png', optimize=True)
    portella = piece_set.startswith('portella')
    attribution = (
        f'Source artwork: Lishogi standard piece set {piece_set}.\n'
        f'Original files: {BASE}/{piece_set}/0{{CODE}}.png\n'
        f'Authors: {"Portella" if portella else "Lishogi contributors"}\n'
        f'License: {"CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)" if portella else "GNU AGPL version 3 or later (https://www.gnu.org/licenses/agpl-3.0.html)"}\n'
        'Source license record: https://github.com/WandererXII/lishogi/blob/master/COPYING.md\n'
        'Changes: background, tile frame, wood texture, shadow and maker marking removed; source glyph contours retained, ink normalized to black/red, fitted proportionally inside the shared tile face. Pixel design preserves hard pixel edges.\n'
        f'Adapted glyphs retain {"CC BY-NC-SA 4.0" if portella else "AGPL-3.0-or-later"} license.\n'
    )
    (source / 'SOURCE.txt').write_text(attribution)
    (target / 'SOURCE.txt').write_text(attribution)
    print(piece_set)
