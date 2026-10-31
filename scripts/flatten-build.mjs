import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.env.BASE_PATH ?? '/').replace(/^\/|\/$/g, '')
const out = 'build/client'
if (base) {
  const nested = join(out, base)
  if (existsSync(nested)) {
    cpSync(nested, out, { recursive: true })
    rmSync(join(out, base.split('/')[0]), { recursive: true })
  }
}
const notFound = join(out, '404')
if (existsSync(join(notFound, 'index.html'))) {
  cpSync(join(notFound, 'index.html'), join(out, '404.html'))
  rmSync(notFound, { recursive: true })
} else cpSync(join(out, 'index.html'), join(out, '404.html'))

// Pages only serves the root 404.html, so a preview (prerendered at '/' only) needs a real SPA shell at every route for deep links.
if (process.env.PREVIEW) {
  const { mainStrategies } = await import('../src/data/strategies.ts')
  const routes = ['taikyoku', ...['play', 'view', 'analyze', 'openings', 'review', 'tsume', 'tesuji'], ...mainStrategies().map((s) => `openings/${s.id}`)]
  for (const route of routes) {
    const dir = join(out, route)
    if (existsSync(join(dir, 'index.html'))) continue
    mkdirSync(dir, { recursive: true })
    cpSync(join(out, existsSync(join(out, '__spa-fallback.html')) ? '__spa-fallback.html' : 'index.html'), join(dir, 'index.html'))
  }
}

const site = (process.env.SITE_URL ?? 'https://hamproductions.github.io/shogigym').replace(/\/$/, '')
const pages = []
const walk = (dir, path) => {
  if (existsSync(join(dir, 'index.html'))) pages.push(path)
  for (const name of readdirSync(dir)) {
    if (['assets', 'engine', 'avatars', 'book', 'voice', 'pieces', 'sky'].includes(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, `${path}${name}/`)
  }
}
walk(out, '/')
const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n')}\n</urlset>\n`,
)
writeFileSync(
  join(out, 'robots.txt'),
  process.env.PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /dev/\nDisallow: /pr/\nSitemap: ${site}/sitemap.xml\n`,
)

// Offline precache: list every file the app needs so the service worker can store them ahead of use, and stamp the cache name with a hash of that list so each build gets its own cache.
const optional = ['books/peta233-full-v1/', 'eval/']
const skip = new Set(['coi-sw.js', 'precache.json', 'sitemap.xml', 'robots.txt', '404.html', 'og.png', '_headers'])
const files = []
const list = (dir, path) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = `${path}${name}`
    if (statSync(full).isDirectory()) list(full, `${rel}/`)
    else if (!skip.has(rel) && !rel.endsWith('.map') && !optional.some((o) => rel.startsWith(o))) files.push({ url: rel, size: statSync(full).size })
  }
}
list(out, '')
files.sort((a, b) => a.url.localeCompare(b.url))
const shell = (url) => url.endsWith('.html') || url === 'manifest.webmanifest' || url.startsWith('icon-') || url === 'favicon.svg'
const version = createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 12)
const toUrl = (url) => (url.endsWith('/index.html') ? url.slice(0, -'index.html'.length) : url === 'index.html' ? './' : url)
writeFileSync(
  join(out, 'precache.json'),
  JSON.stringify({ version, shell: files.filter((f) => shell(f.url)).map((f) => toUrl(f.url)), rest: files.filter((f) => !shell(f.url)).map((f) => f.url) }),
)
const sw = join(out, 'coi-sw.js')
writeFileSync(sw, readFileSync(sw, 'utf8').replace("'shogigym-v1'", `'shogigym-${version}'`))
