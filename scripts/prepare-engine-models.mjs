import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.argv[2]
if (!root) throw new Error('Usage: node scripts/prepare-engine-models.mjs <extracted model directory>')
const definitions = [
  ['suisho5', 'halfkp', 24, 'suisho5/nn.bin', 'https://github.com/yaneurao/YaneuraOu/releases/tag/suisho5'],
  ['tanuki-hao', 'halfkp', 20, 'hao/eval/nn.bin', 'https://github.com/nodchip/tanuki-/releases/tag/tanuki-.halfkp_256x2-32-32.2023-05-08'],
  ['tanuki-li', 'tanuki-li', 20, 'li/eval/nn.bin', 'https://github.com/nodchip/tanuki-/releases/tag/tanuki-wcsc33-2023-05-04'],
  ['aobannue', 'aobannue', 40, 'aoba/AobaNNUE/eval/nn.bin', 'https://github.com/yssaya/AobaNNUE/releases/tag/v1.1'],
]
const manifest = []
for (const [id, engine, fvScale, file, source] of definitions) {
  const bytes = readFileSync(resolve(root, file))
  const directory = resolve('public/engines/models', id)
  mkdirSync(directory, { recursive: true })
  const parts = []
  for (let offset = 0; offset < bytes.length; offset += 32 * 1048576) {
    const part = bytes.subarray(offset, offset + 32 * 1048576)
    const name = `nn.bin.${String(parts.length).padStart(3, '0')}`
    writeFileSync(resolve(directory, name), part)
    parts.push({ name, size: part.length, sha256: createHash('sha256').update(part).digest('hex') })
  }
  manifest.push({ id, engine, fvScale, size: bytes.length, source, parts })
}
writeFileSync('src/utils/engineModels.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(manifest.map(({ id, size, parts }) => ({ id, size, parts: parts.length })))
