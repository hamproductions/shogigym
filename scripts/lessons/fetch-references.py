import hashlib
import html
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen

ARTICLE = re.compile(r'^https://shogi-joutatsu\.com/archives/(\d+)/?$')
articles = Path('.cache/curriculum-source')
pages = Path('.cache/reference')
for folder in (articles, pages):
    folder.mkdir(parents=True, exist_ok=True)

old = Path('.cache/old')
if not old.exists():
    old.mkdir(parents=True)
    subprocess.run('git archive 4ed7ce0 data/lessons src/data/joseki | tar -x -C .cache/old', shell=True, check=True)
    (old / 'data/lessons').rename(old / 'lessons')
    (old / 'src/data/joseki').rename(old / 'joseki')
    print('restored .cache/old from 4ed7ce0')

for url in Path('scripts/lessons/reference-urls.txt').read_text().split():
    match = ARTICLE.match(url)
    path = articles / f'{match.group(1)}.txt' if match else pages / (hashlib.md5(url.encode()).hexdigest()[:10] + '.txt')
    if path.exists():
        continue
    parts = urlsplit(url)
    try:
        page = urlopen(Request(urlunsplit((parts.scheme, parts.netloc, quote(parts.path), parts.query, '')), headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode('utf-8', 'ignore')
    except Exception as error:
        print('failed', url, error, file=sys.stderr)
        continue
    page = re.sub(r'<script.*?</script>|<style.*?</style>', '', page, flags=re.S)
    text = html.unescape(re.sub(r'<[^>]+>', '\n', page))
    path.write_text(url + '\n' + '\n'.join(line.strip() for line in text.split('\n') if line.strip()))
    print('fetched', url)
    time.sleep(1)
