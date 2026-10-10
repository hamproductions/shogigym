import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen


class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag = tag
        self.attrs = dict(attrs)
        self.parent = parent
        self.children = []

    def text(self):
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)

    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c, Node):
                yield from c.walk()


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.root = Node()
        self.current = self.root
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.current = node

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


def html_of(url):
    with urlopen(url, timeout=30) as response:
        return response.read().decode()


def fetch(url):
    return Document(html_of(url))


class Article(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.parts = []
        self.hidden = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag in {'script', 'style'}:
            self.hidden = tag
        elif tag in {'h2', 'h3', 'h4', 'p', 'li', 'td', 'div', 'br'}:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag == self.hidden:
            self.hidden = None
        if tag in {'h2', 'h3', 'h4', 'p', 'li', 'td', 'div'}:
            self.parts.append('\n')

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)

    def lines(self):
        return [text for line in ''.join(self.parts).splitlines() if (text := ' '.join(line.split()))]


cache = Path('.cache/curriculum-source')
cache.mkdir(parents=True, exist_ok=True)
manifest_path = Path('data/lessons/topics/catalog.json')

if sys.argv[1] == 'catalog':
    doc = fetch('https://shogi-joutatsu.com/')
    sitemap = next(n for n in doc.root.walk() if n.attrs.get('id') == 'sitemap_list')
    topics = []
    for node in sitemap.walk():
        if node.tag != 'li' or 'post-item' not in node.attrs.get('class', ''):
            continue
        link = next(n for n in node.walk() if n.tag == 'a')
        categories = []
        parent = node.parent
        while parent:
            if parent.tag == 'li' and 'cat-item' in parent.attrs.get('class', ''):
                cat = next(c for c in parent.children if isinstance(c, Node) and c.tag == 'a')
                categories.insert(0, cat.text().strip())
            parent = parent.parent
        topics.append({'id': link.attrs['href'].rstrip('/').split('/')[-1], 'title': link.text().strip(), 'path': categories, 'source': link.attrs['href']})
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(topics, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(topics)} topics')
else:
    topics = json.loads(manifest_path.read_text())
    start, end = map(int, sys.argv[1:3])
    for topic in topics[start:end]:
        path = cache / (topic['id'] + '.txt')
        if path.exists() and 'SOURCE EXTRACTOR V2' in path.read_text():
            print(topic['id'], 'cached', flush=True)
            continue
        html = html_of(topic['source'])
        start_match = re.search(r'<div class="entry-content">', html)
        end = html.find('<!-- CONTENT END 1 -->', start_match.end())
        if end < 0:
            raise ValueError(f"missing article end marker: {topic['id']}")
        lines = [topic['title'], topic['source'], 'SOURCE EXTRACTOR V2', *Article(html[start_match.end():end]).lines()]
        path.write_text('\n'.join(lines) + '\n')
        print(topic['id'], len(lines), 'lines', flush=True)
