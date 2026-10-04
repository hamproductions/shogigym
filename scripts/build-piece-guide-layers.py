from io import BytesIO
import copy
import re
import subprocess
import xml.etree.ElementTree as ET
from PIL import Image

SVG = '{http://www.w3.org/2000/svg}'
ARITY = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'A': 7}
SETS = {'dewitt_czech', 'shogi_cz', 'shogi_fcz', 'engraved_cz', 'engraved_cz_bnw', 'kanji_guide_shadowed', 'valdivia', 'vald_opt'}


def subpaths(data):
    tokens = re.findall(r'[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?', data)
    result = []
    current = []
    x = y = sx = sy = 0.0
    command = None
    index = 0
    while index < len(tokens):
        if tokens[index].isalpha():
            command = tokens[index]
            index += 1
            if command in 'Zz':
                current.append('Z')
                x, y = sx, sy
                command = None
                continue
        if command is None:
            raise ValueError('Path coordinates without a command')
        op = command.upper()
        relative = command.islower()
        count = ARITY[op]
        values = [float(value) for value in tokens[index:index + count]]
        index += count
        if len(values) != count:
            raise ValueError('Incomplete path command')
        if op == 'H':
            x = values[0] + x if relative else values[0]
            output = ['L', x, y]
        elif op == 'V':
            y = values[0] + y if relative else values[0]
            output = ['L', x, y]
        else:
            if relative:
                if op == 'A':
                    values[-2] += x
                    values[-1] += y
                else:
                    for i in range(0, len(values), 2):
                        values[i] += x
                        values[i + 1] += y
            x, y = values[-2:]
            output = [op, *values]
            if op == 'M':
                if current:
                    result.append(' '.join(current))
                current = []
                sx, sy = x, y
                command = 'l' if relative else 'L'
        current.append(' '.join(str(int(value)) if isinstance(value, float) and value.is_integer() else str(value) for value in output))
    if current:
        result.append(' '.join(current))
    return result


def render(root):
    raw = subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', '-'], input=ET.tostring(root, encoding='utf-8'), check=True, capture_output=True).stdout
    return Image.open(BytesIO(raw)).convert('RGBA')


def isolated(root, node):
    clone = copy.deepcopy(root)
    clone[:] = [copy.deepcopy(child) for child in root if child.tag == SVG + 'defs']
    clone.append(copy.deepcopy(node))
    for child in clone.iter():
        child.attrib.pop('filter', None)
    return clone


def lower_subpaths(root, node, threshold=.60):
    selected = []
    for data in subpaths(node.get('d', '')):
        candidate = copy.deepcopy(node)
        candidate.set('d', data)
        bounds = render(isolated(root, candidate)).getchannel('A').getbbox()
        if bounds and (bounds[1] + bounds[3]) / 2 >= 512 * threshold:
            selected.append(data)
    candidate = copy.deepcopy(node)
    candidate.set('d', ' '.join(selected))
    return candidate


def guide_layer(root, piece_set, code):
    if piece_set not in SETS:
        return Image.new('RGBA', (512, 512))
    paths = [node for node in root if node.tag == SVG + 'path']
    result = copy.deepcopy(root)
    result[:] = [copy.deepcopy(node) for node in root if node.tag == SVG + 'defs']
    if piece_set == 'kanji_guide_shadowed':
        colors = {'#fff', '#ffffff', '#d38d5f', '#d35f8c', '#969696'}
        result.extend(copy.deepcopy(node) for node in paths if node.get('fill') in colors or (piece_set == 'kanji_guide_shadowed' and code == 'GY' and node.get('fill') is None and node.get('stroke') is None))
    elif piece_set in {'valdivia', 'vald_opt'}:
        def visit(node, transform=''):
            transforms = ' '.join(value for value in [transform, node.get('transform', '')] if value)
            if node.tag == SVG + 'path' and node.get('fill') in {None, 'red', '#f00', '#ff0000'}:
                candidate = copy.deepcopy(node)
                if transforms:
                    candidate.set('transform', transforms)
                result.append(lower_subpaths(root, candidate, .50))
            for child in node:
                visit(child, transforms)
        visit(root)
    elif piece_set == 'shogi_fcz':
        result.extend(lower_subpaths(root, node, .47) for node in paths[2:])
    elif piece_set == 'dewitt_czech':
        result.extend(lower_subpaths(root, node, .47) for node in paths[2:] if node.get('fill') != '#f9f9f9')
    elif piece_set == 'shogi_cz':
        result.extend(lower_subpaths(root, node, .47) for node in paths)
    else:
        candidates = [node for index, node in enumerate(root) if index >= 12 and node.tag == SVG + 'path' and node.get('fill') in ({None, '#300', '#310000', '#340000', '#350000'} if piece_set == 'engraved_cz' else {'#5b5f65', '#9b9ea3', '#600606'})]
        result.extend(lower_subpaths(root, node) for node in candidates)
    if piece_set == 'kanji_guide_shadowed' and code == 'KY':
        for node in result:
            if node.tag == SVG + 'path' and node.get('fill') in {'#fff', '#ffffff'}:
                node.set('d', 'M29.351 5.721L26.501 6.607L26.501 30L32.254 30L32.254 6.518Z')
    for node in result.iter():
        node.attrib.pop('filter', None)
    return render(result)
