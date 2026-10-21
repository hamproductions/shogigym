import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
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
    cpSync(join(out, 'index.html'), join(dir, 'index.html'))
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
