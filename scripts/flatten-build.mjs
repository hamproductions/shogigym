import { cpSync, existsSync, rmSync } from 'node:fs'
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
