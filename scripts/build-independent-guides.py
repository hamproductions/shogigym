from pathlib import Path
import runpy
import sys
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GLYPHS = runpy.run_path(str(ROOT / 'scripts/build-lishogi-svg-glyphs.py'))
GUIDES = runpy.run_path(str(ROOT / 'scripts/build-piece-guide-layers.py'))
fit_set = GLYPHS['fit_glyph_set']
CODES = GLYPHS['CODES']
ALIASES = {'kanji_light', 'kanji_red_wood', 'sunfish_wood', 'sunfish_dark', 'sunfish_gothic_dark', 'dewitt_czech', 'shogi_fcz', 'engraved_cz', 'engraved_cz_bnw', 'kanji_guide_shadowed', 'valdivia', 'vald_opt', 'glass'}


def placed(image, width, height, center):
    bounds = image.getchannel('A').getbbox()
    result = Image.new('RGBA', (256, 256))
    if bounds:
        crop = image.crop(bounds)
        crop.thumbnail((width, height), Image.Resampling.LANCZOS)
        result.alpha_composite(crop, ((256 - crop.width) // 2, round(center - crop.height / 2)))
    return result


def main():
    prepared = ROOT / 'public/pieces/prepared'
    guide_dir = prepared / 'guides'
    guide_sources = [('movement', 'kanji_guide_shadowed'), ('dots', 'valdivia'), ('lines', 'shogi_fcz')]
    for mode, name in guide_sources:
        if '--marks-only' in sys.argv and mode != 'movement':
            continue
        images = {}
        for code in CODES:
            if '--compose-only' in sys.argv:
                guide = Image.open(guide_dir / f'{code}.{mode}.png').convert('RGBA')
            else:
                source = ROOT / f'assets/pieces/sources/{name}/0{code}.svg'
                root = ET.parse(source).getroot()
                guide = GUIDES['guide_layer'](root, name, code)
                if name == 'kanji_guide_shadowed':
                    body_index = next(index for index, node in enumerate(root) if node.tag.endswith('}g'))
                    bounds = GLYPHS['render_svg'](GLYPHS['isolated_svg'](root, [body_index])).getchannel('A').getbbox()
                    guide = guide.crop(bounds).resize((256, 256), Image.Resampling.LANCZOS)
            images[code] = guide
        if mode != 'movement':
            images = {code: image.crop(image.getchannel('A').getbbox()) for code, image in images.items()}
            scale = 256 / max(max(image.size) for image in images.values())
            for code, image in images.items():
                resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
                canvas = Image.new('RGBA', (256, 256))
                canvas.alpha_composite(resized, ((256 - resized.width) // 2, (256 - resized.height) // 2))
                images[code] = canvas
        guide_dir.mkdir(exist_ok=True)
        for code, image in images.items():
            image.save(guide_dir / f'{code}.{mode}.png', optimize=True)
    for folder in sorted(prepared.iterdir()):
        if not folder.is_dir() or folder.name == 'guides':
            continue
        for code in CODES:
            for mode in ('movement', 'dots', 'lines'):
                for suffix in ('png', 'field.png', 'guide.png'):
                    (folder / f'{code}.{mode}.{suffix}').unlink(missing_ok=True)
            if folder.name in GUIDES['SETS']:
                (folder / f'{code}.guide.png').unlink(missing_ok=True)
            (folder / f'{code}.field.png').unlink(missing_ok=True)
        if folder.name in ALIASES:
            for code in CODES:
                (folder / f'{code}.png').unlink(missing_ok=True)
                (folder / f'{code}.field.png').unlink(missing_ok=True)
            continue
        if not (folder / 'FU.png').exists():
            continue
    for sidecar in prepared.rglob('*.field.png'):
        sidecar.unlink(missing_ok=True)
    for sidecar in prepared.rglob('*.guide.png'):
        sidecar.unlink(missing_ok=True)
    (guide_dir / 'SOURCE.txt').write_text('Line guide: Lishogi shogi_fcz, AGPLv3+. Mark guide: CouchTomato87 kanji_guide_shadowed, CC BY 4.0. Dot guide: Valdivia by Kleffa, CC BY-SA 4.0. Source SVGs and attribution are retained in the corresponding source and prepared directories. Guide glyphs isolated without body, border or shadow; original colors retained.\n')


if __name__ == '__main__':
    main()
