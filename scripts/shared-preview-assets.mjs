import { createHash } from 'node:crypto'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = process.cwd()
const site = process.env.PREVIEW && process.env.GITHUB_WORKSPACE ? resolve(process.env.GITHUB_WORKSPACE, 'build/client') : null
const active = site && site !== resolve(root, 'build/client') && existsSync(site)
const base = process.env.BASE_PATH ?? '/'
const parentBase = `/${base.split('/').filter(Boolean).slice(0, -2).join('/')}/`.replace(/^\/\//, '/')

function digest(directory) {
  const hash = createHash('sha256')
  const walk = (path, prefix = '') => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = `${prefix}${entry.name}`
      if (entry.isDirectory()) walk(join(path, entry.name), `${name}/`)
      else
        hash
          .update(name)
          .update('\0')
          .update(readFileSync(join(path, entry.name)))
    }
  }
  walk(directory)
  return hash.digest('hex').slice(0, 20)
}

let assets
export function sharedPreviewAssets() {
  if (assets) return assets
  assets = new Map()
  if (!active) return assets
  for (const entry of readdirSync('public', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const source = resolve('public', entry.name)
    const hash = digest(source)
    const production = join(site, entry.name)
    const same = existsSync(production) && digest(production) === hash
    assets.set(entry.name, { source, hash, same, base: same ? parentBase : `${parentBase}_shared/${hash}/` })
  }
  return assets
}

export function sharePreviewOutput(output) {
  for (const [group, asset] of sharedPreviewAssets()) {
    if (!asset.same) {
      const destination = join(site, '_shared', asset.hash, group)
      if (!existsSync(destination)) cpSync(asset.source, destination, { recursive: true })
      if (process.env.RUNNER_TEMP) {
        const cached = join(process.env.RUNNER_TEMP, 'pr-previews', '_assets', asset.hash, group)
        if (!existsSync(cached)) cpSync(asset.source, cached, { recursive: true })
      }
    }
    rmSync(join(output, group), { recursive: true, force: true })
  }
}

export function sharedPreviewPlugin() {
  return {
    name: 'shared-preview-assets',
    enforce: 'pre',
    transform(code, id) {
      if (!active || !id.includes('/src/')) return
      let transformed = code.replace(/\$\{import\.meta\.env\.BASE_URL\}([a-z][a-z0-9-]*)\//g, (match, group) => {
        const asset = sharedPreviewAssets().get(group)
        return asset ? '${' + JSON.stringify(asset.base) + '}' + group + '/' : match
      })
      if (id.replaceAll('\\', '/').endsWith('/rendering/avatars/index.ts')) {
        const asset = sharedPreviewAssets().get('avatars')
        if (asset) transformed = transformed.replace('import.meta.env.BASE_URL', JSON.stringify(asset.base))
      }
      if (transformed !== code) return { code: transformed, map: null }
    },
  }
}
