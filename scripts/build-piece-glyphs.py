from io import BytesIO
from pathlib import Path
import base64
import json
import sys
import subprocess
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SETS = ['ryoko_1kanji', 'kanji_brown', 'sunfish_futamoji', 'sunfish_hitomoji', 'sunfish_gothic', 'kaishoa_one', 'kaishoa_two']
SIZE = 256
LISHOGI_SETS = {
    '1kanji_3d': ('CC BY 4.0', 'Little-Mage and CouchTomato87', 'https://creativecommons.org/licenses/by/4.0/'),
    '2kanji_3d': ('CC BY-SA 3.0', 'Little-Mage and orangain', 'https://creativecommons.org/licenses/by-sa/3.0/deed.en'),
    'simple_kanji': ('CC BY 4.0', 'Ka-hu', 'https://creativecommons.org/licenses/by/4.0/'),
}
LISHOGI_CODES = ['OU', 'GY', 'HI', 'RY', 'KA', 'UM', 'KI', 'GI', 'NG', 'KE', 'NK', 'KY', 'NY', 'FU', 'TO']
LISHOGI_BASE = 'https://raw.githubusercontent.com/WandererXII/lishogi/master/ui/@build/pieces/assets/standard'
SVG = '{http://www.w3.org/2000/svg}'


def glyph(source, legacy):
    if not legacy:
        raw = subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', str(source)], check=True, capture_output=True).stdout
        return Image.open(BytesIO(raw)).convert('RGBA')
    root = ET.fromstring(source.read_bytes())
    body = next(root.iter(SVG + 'path'))
    if not body.get('fill', '').startswith(('url(', '#e8bc5d', '#fff7b7')):
        raise ValueError(f'Unexpected tile body in {source}')
    for parent in root.iter():
        if body in list(parent):
            parent.remove(body)
            break
    raw = subprocess.run(['rsvg-convert', '-w', '512', '-h', '512'], input=ET.tostring(root), check=True, capture_output=True).stdout
    pixels = np.array(Image.open(BytesIO(raw)).convert('RGBA'))
    rgb = pixels[:, :, :3].astype(float)
    red = (rgb[:, :, 0] - rgb[:, :, 1] > 70) & (rgb[:, :, 0] - rgb[:, :, 2] > 70)
    pixels[:, :, :3] = [156, 28, 18] if np.any(red & (pixels[:, :, 3] > 127)) else [18, 12, 6]
    return Image.fromarray(pixels)


def lishogi_glyph(source):
    root = ET.fromstring(source)
    root[:] = [node for node in root if node.tag != SVG + 'defs']
    for parent in root.iter():
        for node in list(parent):
            if 'filter' in node.attrib:
                parent.remove(node)
    with tempfile.NamedTemporaryFile(suffix='.svg') as svg:
        svg.write(ET.tostring(root, encoding='utf-8'))
        svg.flush()
        raw = subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', svg.name], check=True, capture_output=True).stdout
    image = Image.open(BytesIO(raw)).convert('RGBA').resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    pixels = np.array(image)
    rgb = pixels[:, :, :3].astype(float)
    red = (pixels[:, :, 3] > 127) & (rgb[:, :, 0] - rgb[:, :, 1] > 40) & (rgb[:, :, 0] - rgb[:, :, 2] > 40)
    pixels[:, :, :3] = [156, 28, 18] if np.any(red) else [18, 12, 6]
    return Image.fromarray(pixels)


def fit_glyph(image, resampling=Image.Resampling.LANCZOS):
    bounds = image.getchannel('A').getbbox()
    if not bounds:
        raise ValueError('Empty glyph artwork')
    glyph = image.crop(bounds)
    scale = min(SIZE / glyph.width, SIZE / glyph.height)
    glyph = glyph.resize((round(glyph.width * scale), round(glyph.height * scale)), resampling)
    result = Image.new('RGBA', (SIZE, SIZE))
    position = ((SIZE - glyph.width) // 2, (SIZE - glyph.height) // 2)
    result.alpha_composite(glyph, position)
    return result


TWO_CHARACTER_SETS = {'sunfish_futamoji', 'kaishoa_two', '2kanji_3d', 'orangain', 'dewitt_2kanji', 'portella_2kanji'}

def fit_glyph_set(images, reference='OU', resampling=Image.Resampling.LANCZOS, piece_set=''):
    glyphs = {}
    for code, image in images.items():
        image = image.convert('RGBA')
        visible = image.getchannel('A').point(lambda value: 255 if value > 40 else 0).getbbox()
        if visible is None:
            raise ValueError(f'Empty {code} glyph artwork')
        glyphs[code] = image.crop(visible)
    if reference not in glyphs:
        raise ValueError(f'Missing {reference} reference glyph')
    reference_glyph = glyphs[reference]
    reference_scale = SIZE / (reference_glyph.height if piece_set in TWO_CHARACTER_SETS else reference_glyph.width)
    canvas_size = max(SIZE, *(round(max(glyph.size) * reference_scale) for glyph in glyphs.values()))
    fitted = {}
    for code, glyph in glyphs.items():
        scale = reference_scale
        resized = glyph.resize((max(1, round(glyph.width * scale)), max(1, round(glyph.height * scale))), resampling)
        result = Image.new('RGBA', (canvas_size, canvas_size))
        result.alpha_composite(resized, ((canvas_size - resized.width) // 2, (canvas_size - resized.height) // 2))
        fitted[code] = result
    return fitted


def build_lishogi():
    for piece_set, (license_name, artists, license_url) in LISHOGI_SETS.items():
        target = ROOT / 'public' / 'pieces' / 'prepared' / piece_set
        target.mkdir(parents=True, exist_ok=True)
        images = {}
        for code in LISHOGI_CODES:
            url = f'{LISHOGI_BASE}/{piece_set}/0{code}.svg'
            source = ROOT / 'public' / 'pieces' / 'sources' / piece_set / f'0{code}.svg'
            source.parent.mkdir(parents=True, exist_ok=True)
            if not source.exists():
                source.write_bytes(urllib.request.urlopen(url).read())
            images[code] = lishogi_glyph(source.read_bytes())
        for code, image in fit_glyph_set(images, piece_set=piece_set).items():
            image.save(target / f'{code}.png', optimize=True)
        (target / 'SOURCE.txt').write_text(
            f'Source artwork: Lishogi standard piece set {piece_set}, glyph layer extracted from SVG files.\n'
            f'Original files: {LISHOGI_BASE}/{piece_set}/0{{CODE}}.svg\n'
            f'Authors: {artists}\n'
            f'License: {license_name} ({license_url})\n'
            f'Source license record: https://github.com/WandererXII/lishogi/blob/master/COPYING.md\n'
            'Changes: tile body and shadow removed; glyph artwork fitted proportionally inside the shared tile face and rasterized to a transparent 256 by 256 image; baked lettering highlights replaced with solid black or red ink.\n'
            + ('Adapted glyphs are distributed under CC BY-SA 3.0.\n' if license_name == 'CC BY-SA 3.0' else '')
        )
        print(piece_set)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--lishogi':
        build_lishogi()
    elif len(sys.argv) > 1 and sys.argv[1] != '--set':
        data = json.loads(Path(sys.argv[1]).read_text())
        if isinstance(data, str):
            data = json.loads(data)
        for piece_set, codes in data.items():
            target = ROOT / 'public' / 'pieces' / 'prepared' / piece_set
            target.mkdir(parents=True, exist_ok=True)
            images = {}
            for code, url in codes.items():
                images[code] = Image.open(BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA')
            for code, image in fit_glyph_set(images, resampling=Image.Resampling.NEAREST if piece_set == 'pixel' else Image.Resampling.LANCZOS, piece_set=piece_set).items():
                image.save(target / f'{code}.png', optimize=True)
            print(piece_set)
    else:
        for piece_set in ([sys.argv[2]] if len(sys.argv) > 1 else SETS):
            target = ROOT / 'public' / 'pieces' / 'prepared' / piece_set
            target.mkdir(parents=True, exist_ok=True)
            images = {}
            for source in sorted((ROOT / 'public' / 'pieces' / piece_set).glob('*.svg')):
                images[source.stem] = glyph(source, piece_set in {'ryoko_1kanji', 'kanji_brown'})
            for code, image in fit_glyph_set(images, resampling=Image.Resampling.NEAREST if piece_set == 'pixel' else Image.Resampling.LANCZOS, piece_set=piece_set).items():
                image.save(target / f'{code}.png', optimize=True)
            print(piece_set)


if __name__ == '__main__':
    main()
