from io import BytesIO
from pathlib import Path
import re
import copy
import runpy
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 256
SOURCE_BASE = 'https://raw.githubusercontent.com/WandererXII/lishogi/master/ui/@build/pieces/assets/standard'
CODES = ['OU', 'GY', 'HI', 'RY', 'KA', 'UM', 'KI', 'GI', 'NG', 'KE', 'NK', 'KY', 'NY', 'FU', 'TO']
SHARED = runpy.run_path(str(ROOT / 'scripts' / 'build-piece-glyphs.py'))
fit_glyph = SHARED['fit_glyph']
fit_glyph_set = SHARED['fit_glyph_set']
SVG = '{http://www.w3.org/2000/svg}'
SETS = {
    'orangain': ('CC BY-SA 3.0', 'orangain', 'https://creativecommons.org/licenses/by-sa/3.0/deed.en', 'dark'),
    'dewitt_1kanji': ('AGPLv3+', 'Lishogi authors', 'https://github.com/WandererXII/lishogi/blob/master/COPYING.md', 'negative'),
    'dewitt_2kanji': ('AGPLv3+', 'Lishogi authors', 'https://github.com/WandererXII/lishogi/blob/master/COPYING.md', 'negative'),
    'hitomoji': ('AGPLv3+', 'Lishogi authors', 'https://github.com/WandererXII/lishogi/blob/master/COPYING.md', 'dark'),
    'shogi_cz': ('CC BY-SA 4.0', 'shogi.cz', 'https://creativecommons.org/licenses/by-sa/4.0/', 'dark'),
    'shogi_bnw': ('CC BY-SA 4.0', 'visualdenniss', 'https://creativecommons.org/licenses/by-sa/4.0/', 'light'),
}


def element_paths(root):
    paths = []

    def visit(node, indexes):
        if node.tag == SVG + 'path' and node.get('d'):
            paths.append(tuple(indexes))
        for index, child in enumerate(node):
            visit(child, indexes + [index])

    visit(root, [])
    return paths


def _path_node(root, indexes):
    node = root
    for index in indexes:
        node = node[index]
    return node

def isolated_svg(root, indexes):
    clone = copy.deepcopy(root)
    node = clone
    for index in indexes:
        child = node[index]
        for sibling in list(node):
            if sibling is not child and sibling.tag != SVG + 'defs':
                node.remove(sibling)
        node = child
    for parent in clone.iter():
        parent.attrib.pop('filter', None)
    return ET.tostring(clone, encoding='utf-8')


def render_svg(data):
    raw = subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', '-'], input=data, check=True, capture_output=True).stdout
    return Image.open(BytesIO(raw)).convert('RGBA')


def path_image(root, indexes):
    return render_svg(isolated_svg(root, indexes))


def path_subpaths(data):
    tokens = re.findall(r'[MmLlHhVvZz]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?', data)
    result = []
    current = []
    command = None
    x = y = sx = sy = 0.0
    index = 0
    while index < len(tokens):
        token = tokens[index]
        if token.isalpha():
            command = token
            index += 1
            if command in 'Zz':
                current.append('Z')
                if current:
                    result.append(' '.join(current))
                    current = []
                x, y = sx, sy
                command = None
            continue
        if command is None:
            index += 1
            continue
        relative = command.islower()
        op = command.upper()
        if op in 'ML':
            nx, ny = float(tokens[index]), float(tokens[index + 1])
            index += 2
            if relative:
                nx += x
                ny += y
            x, y = nx, ny
            if op == 'M':
                if current:
                    result.append(' '.join(current))
                current = [f'M{x} {y}']
                sx, sy = x, y
                command = 'l' if relative else 'L'
            else:
                current.append(f'L{x} {y}')
        elif op == 'H':
            nx = float(tokens[index]); index += 1
            x = x + nx if relative else nx
            current.append(f'L{x} {y}')
        elif op == 'V':
            ny = float(tokens[index]); index += 1
            y = y + ny if relative else ny
            current.append(f'L{x} {y}')
        else:
            index += 1
    if current:
        result.append(' '.join(current))
    return result


def dewit_glyph(root, piece_set, fitted=True):
    paths = element_paths(root)
    path_indexes = paths[0]
    original = _path_node(root, path_indexes)
    fallback = piece_set != 'dewitt_czech' and original.get('fill') == 'none'
    if fallback:
        path_indexes = paths[2]
        original = _path_node(root, path_indexes)
    if fallback:
        clone = copy.deepcopy(root)
        for index, child in reversed(list(enumerate(list(clone)))):
            if index < 2 or child.get('fill') not in {None, 'red'}:
                clone.remove(child)
        image = render_svg(ET.tostring(clone, encoding='utf-8'))
    else:
        selected = []
        for d in path_subpaths(original.get('d', '')):
            clone = copy.deepcopy(root)
            node = clone
            for index in path_indexes:
                child = node[index]
                for sibling in list(node):
                    if sibling is not child and sibling.tag != SVG + 'defs':
                        node.remove(sibling)
                node = child
            node.set('d', d)
            bounds = render_svg(ET.tostring(clone, encoding='utf-8')).getchannel('A').point(lambda value: 255 if value > 40 else 0).getbbox()
            if bounds and bounds[2] - bounds[0] <= 300 and bounds[3] - bounds[1] <= 360:
                selected.append(d)
        if not selected:
            raise ValueError(f'No DeWitt glyph subpaths in {piece_set}')
        clone = copy.deepcopy(root)
        node = clone
        for index in path_indexes:
            child = node[index]
            for sibling in list(node):
                if sibling is not child and sibling.tag != SVG + 'defs':
                    node.remove(sibling)
            node = child
        node.set('d', ' '.join(selected))
        image = render_svg(ET.tostring(clone, encoding='utf-8'))
    pixels = np.asarray(image).astype(np.float32)
    rgb = pixels[:, :, :3]
    luminance = rgb @ np.array([.3, .59, .11], dtype=np.float32)
    red = (pixels[:, :, 0] > 35) & (pixels[:, :, 1] < pixels[:, :, 0] * .5) & (pixels[:, :, 2] < pixels[:, :, 0] * .5)
    ink = (pixels[:, :, 3] > 64) & (luminance < 130)
    out = np.zeros((512, 512, 4), dtype=np.uint8)
    out[:, :, :3] = [18, 12, 6]
    out[:, :, 3] = np.where(ink, 255, 0).astype(np.uint8)
    out[:, :, :3][red & ink] = [156, 28, 18]
    raw = Image.fromarray(out)
    return fit_glyph(raw) if fitted else raw


def extract_negative(root):
    full = render_svg(ET.tostring(root, encoding='utf-8'))
    source = np.asarray(full).astype(np.float32)
    rgb = source[:, :, :3]
    luminance = rgb @ np.array([.3, .59, .11], dtype=np.float32)
    height, width = luminance.shape
    yy, xx = np.mgrid[:height, :width]
    face = (xx >= width * .19) & (xx <= width * .81) & (yy >= height * .16) & (yy <= height * .86)
    ink = (luminance < 110) & face & (source[:, :, 3] > 32)
    alpha = Image.fromarray((ink * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    pixels = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    pixels[:, :, :3] = [18, 12, 6]
    pixels[:, :, 3] = np.asarray(alpha)
    return fit_glyph(Image.fromarray(pixels))


def kanji_subpaths(data):
    tokens = re.findall(r'[A-Za-z]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?', data)
    arities = {'m': 2, 'l': 2, 'h': 1, 'v': 1, 'c': 6, 's': 4, 'q': 4, 't': 2, 'a': 7}
    x = y = sx = sy = 0
    parts = []
    part = []
    curved = False
    command = None
    index = 0
    while index < len(tokens):
        if tokens[index].isalpha():
            command = tokens[index]
            index += 1
            if command.lower() == 'z':
                part.append(command)
                x, y = sx, sy
                continue
        count = arities[command.lower()]
        values = list(map(float, tokens[index:index + count]))
        index += count
        relative = command.islower()
        kind = command.lower()
        if kind == 'm':
            if part and curved:
                parts.append(' '.join(part))
            x = values[0] + (x if relative else 0)
            y = values[1] + (y if relative else 0)
            sx, sy = x, y
            part = [f'M{x} {y}']
            curved = False
            command = 'l' if relative else 'L'
            continue
        part.append(command + ' '.join(map(str, values)))
        curved = curved or kind in {'c', 's', 'q', 't'}
        if kind == 'h':
            x = values[0] + (x if relative else 0)
        elif kind == 'v':
            y = values[0] + (y if relative else 0)
        else:
            x = values[-2] + (x if relative else 0)
            y = values[-1] + (y if relative else 0)
    if part and curved:
        parts.append(' '.join(part))
    return parts


def extract(source, piece_set, code, fitted=True):
    root = ET.parse(source).getroot()
    mode = SETS[piece_set][3]
    if piece_set == 'shogi_cz':
        for indexes in element_paths(root):
            node = _path_node(root, indexes)
            selected = []
            for part in kanji_subpaths(node.get('d', '')):
                node.set('d', part)
                image = path_image(root, indexes)
                bounds = image.getchannel('A').getbbox()
                if bounds and (bounds[1] + bounds[3]) / 2 < image.height / 2:
                    selected.append(part)
            node.set('d', ' '.join(selected))
    if mode == 'negative':
        return dewit_glyph(root, piece_set, fitted)
    if piece_set == 'shogi_fcz':
        ink = np.zeros((512, 512), dtype=np.uint8)
        red_ink = np.zeros_like(ink)
        for indexes in element_paths(root)[2:]:
            image = path_image(root, indexes)
            pixels = np.asarray(image).astype(np.float32)
            rgb = pixels[:, :, :3]
            alpha = pixels[:, :, 3]
            red = (rgb[:, :, 0] > 35) & (rgb[:, :, 1] < rgb[:, :, 0] * .5) & (rgb[:, :, 2] < rgb[:, :, 0] * .5)
            lum = rgb @ np.array([.3, .59, .11], dtype=np.float32)
            visible = (alpha > 64) & (lum < 155)
            ink = np.maximum(ink, np.where(visible & ~red, 255, 0).astype(np.uint8))
            red_ink = np.maximum(red_ink, np.where(visible & red, 255, 0).astype(np.uint8))
        out = np.zeros((512, 512, 4), dtype=np.uint8)
        out[:, :, :3] = [18, 12, 6]
        out[:, :, 3] = ink
        out[:, :, :3][red_ink > 0] = [156, 28, 18]
        out[:, :, 3] = np.maximum(ink, red_ink)
        raw = Image.fromarray(out)
        return fit_glyph(raw) if fitted else raw
    records = []
    explicit = piece_set in {'engraved_cz', 'engraved_cz_bnw', 'shogi_bnw'}
    paths = element_paths(root)
    if piece_set == 'shogi_bnw':
        paths = [indexes for indexes in paths if _path_node(root, indexes).get('fill') in {'#b3b3b3', '#dd1010'}]
    elif piece_set == 'engraved_cz':
        paths = [indexes for indexes in paths if indexes[0] >= 12 and (root[indexes[0]].get('fill') is None or root[indexes[0]].get('fill') in {'#300', '#310000', '#340000', '#350000', '#9b0000'})]
    elif piece_set == 'engraved_cz_bnw':
        paths = [indexes for indexes in paths if indexes[0] >= 12 and root[indexes[0]].get('fill') in {'#5b5f65', '#9b9ea3', '#600606'}]
    for indexes in paths:
        image = render_svg(isolated_svg(root, indexes))
        pixels = np.asarray(image).astype(np.float32)
        alpha = pixels[:, :, 3]
        bounds = image.getchannel('A').point(lambda value: 255 if value > 40 else 0).getbbox()
        if not bounds:
            continue
        x0, y0, x1, y1 = bounds
        width, height = image.size
        box = np.array([x0 / width, y0 / height, x1 / width, y1 / height])
        center_x = (box[0] + box[2]) / 2
        center_y = (box[1] + box[3]) / 2
        if not explicit and (box[2] - box[0] > .84 or box[3] - box[1] > .90 or not (.17 <= center_x <= .83 and .12 <= center_y <= .88)):
            continue
        visible = alpha > 64
        if not np.any(visible):
            continue
        rgb = pixels[:, :, :3]
        luminance = rgb @ np.array([.3, .59, .11], dtype=np.float32)
        red = (rgb[:, :, 0] > 35) & (rgb[:, :, 1] < rgb[:, :, 0] * .5) & (rgb[:, :, 2] < rgb[:, :, 0] * .5)
        red_ratio = np.count_nonzero(red & visible) / np.count_nonzero(visible)
        value = float(np.median(luminance[visible]))
        if not explicit and ((mode == 'light' and value < 140) or (mode == 'dark' and value > 135 and red_ratio < .2)):
            continue
        records.append((image, bounds, value, red_ratio, np.asarray(image.getchannel('A'))))
    selected = []
    for record in records:
        _, bounds, value, red_ratio, _ = record
        duplicate = None
        for index, prior in enumerate(selected):
            _, prior_bounds, prior_value, prior_red_ratio, _ = prior
            a = np.asarray(bounds, dtype=float)
            b = np.asarray(prior_bounds, dtype=float)
            intersection = np.minimum(a[2:], b[2:]) - np.maximum(a[:2], b[:2])
            if np.all(intersection > 0):
                overlap = np.prod(intersection)
                union = np.prod(a[2:] - a[:2]) + np.prod(b[2:] - b[:2]) - overlap
                if union > 0 and overlap / union > .86:
                    duplicate = index
                    break
        if duplicate is None:
            selected.append(record)
        else:
            prior = selected[duplicate]
            better = value > prior[2] if mode == 'light' else value < prior[2]
            if red_ratio > prior[3]:
                better = True
            if better:
                selected[duplicate] = record
    black = np.zeros((512, 512), dtype=np.uint8)
    red_ink = np.zeros_like(black)
    if explicit:
        selected = records
    for image, _, _, red_ratio, alpha in selected:
        pixels = np.asarray(image).astype(np.float32)
        rgb = pixels[:, :, :3]
        red = (rgb[:, :, 0] > 35) & (rgb[:, :, 1] < rgb[:, :, 0] * .5) & (rgb[:, :, 2] < rgb[:, :, 0] * .5)
        normalized = np.rint(np.minimum(255, alpha.astype(float) * 255 / max(1, alpha.max()))).astype(np.uint8)
        if red_ratio > .2 and code in {'TO', 'NY', 'NK', 'NG', 'UM', 'RY'}:
            red_ink = np.maximum(red_ink, np.where(red, normalized, 0).astype(np.uint8))
            black = np.maximum(black, np.where(~red, normalized, 0).astype(np.uint8))
        else:
            black = np.maximum(black, normalized)
    pixels = np.zeros((512, 512, 4), dtype=np.uint8)
    pixels[:, :, :3] = [18, 12, 6]
    pixels[:, :, 3] = black
    red_pixels = red_ink
    pixels[:, :, :3][red_pixels > 0] = [156, 28, 18]
    pixels[:, :, 3] = np.maximum(pixels[:, :, 3], red_pixels)
    raw = Image.fromarray(pixels)
    return fit_glyph(raw) if fitted else raw


def main():
    output = ROOT / 'public' / 'pieces' / 'prepared'
    sources = ROOT / 'public' / 'pieces' / 'sources'
    for piece_set, (license_name, authors, license_url, _) in SETS.items():
        if len(sys.argv) > 1 and piece_set not in sys.argv[1:]:
            continue
        source_dir = sources / piece_set
        target_dir = output / piece_set
        source_dir.mkdir(parents=True, exist_ok=True)
        target_dir.mkdir(parents=True, exist_ok=True)
        images = {}
        for code in CODES:
            source = source_dir / f'0{code}.svg'
            if not source.exists():
                url = f'{SOURCE_BASE}/{piece_set}/0{code}.svg'
                source.write_bytes(urllib.request.urlopen(url).read())
            images[code] = extract(source, piece_set, code, fitted=False)
        for code, image in fit_glyph_set(images, piece_set=piece_set).items():
            image.save(target_dir / f'{code}.png', optimize=True)
        attribution = (
            f'Source artwork: Lishogi standard piece set {piece_set}.\n'
            f'Original SVGs: {SOURCE_BASE}/{piece_set}/0{{CODE}}.svg\n'
            f'Authors: {authors}\n'
            f'License: {license_name} ({license_url})\n'
            'Source license record: https://github.com/WandererXII/lishogi/blob/master/COPYING.md\n'
            'Changes: extracted glyph artwork from source piece images; removed tile, outline, shadow, and surface texture; fitted glyph proportionally to a shared transparent tile face; normalized lettering to black or source red.\n'
        )
        if license_name == 'CC BY-SA 3.0':
            attribution += 'Adapted glyph assets are distributed under CC BY-SA 3.0.\n'
        (target_dir / 'SOURCE.txt').write_text(attribution)
        print(piece_set)


if __name__ == '__main__':
    main()
