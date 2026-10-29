// Writes public/eval/manifest.json for an NNUE evaluation file.
//   node scripts/build-eval-manifest.mjs path/to/nn.bin [--fv-scale 24] [--url https://host/nn.bin]
// Without --url the file is copied to public/eval/ and served from the app origin
// (required under COEP unless the remote host sends CORS headers).
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const args = process.argv.slice(2)
const flag = (name) => args[args.indexOf(name) + 1]
const source = args[0]
if (!source || source.startsWith('--')) {
  console.error('usage: build-eval-manifest.mjs <nn.bin> [--fv-scale 24] [--url <https url>]')
  process.exit(1)
}
const out = join(import.meta.dirname, '..', 'public', 'eval')
mkdirSync(out, { recursive: true })
const name = basename(source)
const url = args.includes('--url') ? flag('--url') : undefined
if (!url) copyFileSync(source, join(out, name))
const manifest = {
  name,
  size: statSync(source).size,
  sha256: createHash('sha256').update(readFileSync(source)).digest('hex'),
  ...(url && { url }),
  fvScale: args.includes('--fv-scale') ? Number(flag('--fv-scale')) : 24,
}
writeFileSync(join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(manifest)
