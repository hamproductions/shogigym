#!/usr/bin/env python3
"""Build src/features/taikyoku/catalog.json from the TaikyokuShogi-Stockfish rules artefacts.

usage: build-catalog.py <path-to-TaikyokuShogi-Stockfish> <out.json>
"""
import json, re, sys
from pathlib import Path

root, out = Path(sys.argv[1]), Path(sys.argv[2])
header = (root / 'src/rules_data.h').read_text()
body = header.split('inline constexpr PieceInfo PIECES[NPIECE] = {')[1].split('};')[0]
rows = re.findall(r'\{"([^"]*)","([^"]*)",(\d+),(-?\d+),(\d+),(\d+),(-?\d+)\}', body)

kanji = {}
for b in json.loads((root / 'rules/pieces.json').read_text())['blocks']:
    for n in b['names']:
        kanji[n['name'].lower()] = n['kanji']
for r in json.loads((root / 'rules/promotions.json').read_text())['rows']:
    kanji.setdefault(r['name'].lower(), r['kanji'])
    if r['promotes_to'] and r['promotion_kanji']:
        kanji.setdefault(r['promotes_to'].lower(), r['promotion_kanji'])

def glyph(k):
    # a few promoted-only forms use ideographic description characters that no
    # font renders; the UI falls back to the latin abbreviation for those
    return '' if re.search('[\u2ff0-\u2fff\u00b7]', k) else k

keys = [('+' if int(r[2]) else '') + r[1] for r in rows]
pieces = {}
missing = []
for key, (name, abbrev, promoted, promotes_to, royal, rank_cap, value) in zip(keys, rows):
    k = kanji.get(name.lower())
    if k is None:
        missing.append(name)
    first, _, second = (k or '').partition('/')
    entry = {'n': name, 'k': glyph(first), 'r': int(royal), 'c': int(rank_cap), 'v': int(value)}
    if second:
        entry['k2'] = glyph(second)
    if int(promotes_to) >= 0:
        entry['p'] = keys[int(promotes_to)]
    pieces[key] = entry
print(len(rows), 'rows', len(pieces), 'keys', 'missing kanji:', sorted(set(missing)))
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(pieces, ensure_ascii=False, separators=(',', ':')))
