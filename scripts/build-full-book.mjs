import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { gzip } from 'node:zlib'

const [input] = process.argv.slice(2)
if (!input) throw new Error('usage: node scripts/build-full-book.mjs <user_book1.db>')
const output = 'public/books/peta233-full-v1'
const chunkSize = 8 * 1024 * 1024
const compress = promisify(gzip)
const hash = createHash('sha256')
const chunks = []
let bytes = 0
let compressedBytes = 0
let pending = Buffer.alloc(0)
await mkdir(output, { recursive: true })
const save = async (data) => {
  const compressed = await compress(data, { level: 9 })
  const file = `${chunks.length.toString().padStart(3, '0')}.db.gz`
  await writeFile(`${output}/${file}`, compressed)
  hash.update(data)
  bytes += data.length
  compressedBytes += compressed.length
  chunks.push({
    file,
    size: data.length,
    compressedSize: compressed.length,
    rawSha256: createHash('sha256').update(data).digest('hex'),
    sha256: createHash('sha256').update(compressed).digest('hex'),
  })
}
for await (const data of createReadStream(input, { highWaterMark: chunkSize })) {
  pending = Buffer.concat([pending, data])
  while (pending.length >= chunkSize) {
    await save(pending.subarray(0, chunkSize))
    pending = pending.subarray(chunkSize)
  }
}
if (pending.length) await save(pending)
await writeFile(
  `${output}/manifest.json`,
  `${JSON.stringify(
    {
      source: 'https://github.com/yaneurao/YaneuraOu/releases/tag/new_petabook233',
      archive: 'new_petabook_20250505c.7z',
      license: 'MIT',
      filename: 'user_book1.db',
      size: bytes,
      compressedSize: compressedBytes,
      sha256: hash.digest('hex'),
      chunks,
    },
    null,
    2,
  )}\n`,
)
const license = await readFile('public/books/peta233-v1/LICENSE', 'utf8')
await writeFile(
  `${output}/LICENSE`,
  license
    .replace('Peta 233 opening-book subset', 'Peta 233 complete native opening book')
    .replace(
      /Modified on 2026-10-05:.*\n/,
      'Modified on 2026-10-05: the complete native database is split into gzip chunks for optional browser download. Decompression reproduces the original file byte for byte; generated output is reproducible with scripts/build-full-book.mjs.\n',
    ),
)
console.log(`${chunks.length} chunks, ${bytes} native bytes, ${compressedBytes} compressed bytes`)
