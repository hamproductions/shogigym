import { cpSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.env.BASE_PATH ?? '/').replace(/^\/|\/$/g, '')
const out = 'build/client'
if (base) {
  const nested = join(out, base)
  if (existsSync(nested)) {
    cpSync(nested, out, { recursive: true })
    rmSync(nested, { recursive: true })
  }
}
cpSync(join(out, 'index.html'), join(out, '404.html'))

const site = (process.env.SITE_URL ?? 'https://hamproductions.github.io/shogilab').replace(/\/$/, '')
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
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site}${p === '/' ? '/' : p.replace(/\/$/, '')}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /dev/\nSitemap: ${site}/sitemap.xml\n`)
