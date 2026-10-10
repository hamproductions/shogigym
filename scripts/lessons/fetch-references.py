import hashlib
import html
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen

out = Path('.cache/reference')
out.mkdir(parents=True, exist_ok=True)
urls = Path('scripts/lessons/reference-urls.txt').read_text().split()
for url in urls:
    path = out / (hashlib.md5(url.encode()).hexdigest()[:10] + '.txt')
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
