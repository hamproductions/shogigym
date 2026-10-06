import { Database } from 'bun:sqlite'
import { createReadStream, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { InitialPositionSFEN, Position } from 'tsshogi'
import { bookPosition, bookShard, flipBookMove } from '../src/utils/bookPosition'

const [input, index] = process.argv.slice(2)
if (!input || !index) throw new Error('usage: bun scripts/build-opening-book.ts <user_book1.db> <temporary index.sqlite>')
const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')
const db = new Database(index)
db.exec('PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF; CREATE TABLE IF NOT EXISTS positions (sfen TEXT PRIMARY KEY, moves TEXT NOT NULL) WITHOUT ROWID')
const insert = db.prepare('INSERT OR REPLACE INTO positions VALUES (?, ?)')
const flush = db.transaction((batch: [string, string][]) => {
  for (const row of batch) insert.run(...row)
})
let key = ''
let moves: [string, number, number][] = []
let batch: [string, string][] = []
const save = () => {
  if (key && moves.length) batch.push([key, JSON.stringify(moves)])
  if (batch.length >= 1000) {
    flush(batch)
    batch = []
  }
}
if (!db.query<{ count: number }, []>('SELECT count(*) AS count FROM positions').get()?.count) {
  for await (const line of createInterface({ input: createReadStream(input), crlfDelay: Infinity })) {
    if (line.startsWith('sfen ')) {
      save()
      key = strip(line.slice(5))
      moves = []
    } else if (/^(?:[1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]/.test(line)) {
      const [usi, , score, depth] = line.trim().split(/\s+/)
      moves.push([usi, Number(score), Number(depth)])
    }
  }
  save()
  flush(batch)
}
const query = db.prepare<{ moves: string }, [string]>('SELECT moves FROM positions WHERE sfen = ?')
const queue: [string, number][] = [[InitialPositionSFEN.STANDARD, 0]]
const seeded = new Set<string>()
const seed = (node: { sfen: string; branches: { child: typeof node | null }[] }) => {
  const key = strip(node.sfen)
  if (!seeded.has(key)) {
    seeded.add(key)
    queue.push([node.sfen, Math.max(0, Number(node.sfen.split(' ')[3]) - 1)])
  }
  for (const branch of node.branches) if (branch.child) seed(branch.child)
}
for (const directory of ['src/data/joseki', 'vendor/shiryu-joseki/src/data/joseki']) {
  for (const file of readdirSync(directory).filter((file) => file.endsWith('.json'))) seed((await Bun.file(`${directory}/${file}`).json()).root)
}
const seen = new Set<string>()
const shards: Record<string, [string, number, number][]>[] = Array.from({ length: 64 }, () => ({}))
let count = 0
let branches = 0
for (let cursor = 0; cursor < queue.length && count < 24000; cursor++) {
  const [sfen, ply] = queue[cursor]
  const { key, flipped } = bookPosition(sfen)
  if (seen.has(key) || ply >= 48) continue
  seen.add(key)
  const row = query.get(key)
  if (!row) continue
  const position = Position.newBySFEN(`${key} 1`)
  if (!position) throw new Error(`invalid book position: ${key}`)
  const entries = (JSON.parse(row.moves) as [string, number, number][])
    .filter(([usi]) => {
      const move = position.createMoveByUSI(usi)
      return move && position.isValidMove(move)
    })
    .sort((a, b) => b[1] - a[1])
  if (!entries.length) continue
  shards[bookShard(key)][key] = entries
  count++
  branches += entries.length
  for (const [usi] of entries) {
    const next = Position.newBySFEN(sfen)!
    const move = next.createMoveByUSI(flipped ? flipBookMove(usi) : usi)!
    if (next.doMove(move)) queue.push([next.sfen, ply + 1])
  }
}
db.close()
const output = 'public/books/peta233-v1'
mkdirSync(output, { recursive: true })
for (let i = 0; i < shards.length; i++) writeFileSync(`${output}/${i.toString(16).padStart(2, '0')}.json`, `${JSON.stringify(shards[i])}\n`)
writeFileSync(
  `${output}/manifest.json`,
  `${JSON.stringify(
    {
      source: 'https://github.com/yaneurao/YaneuraOu/releases/tag/new_petabook233',
      archive: 'new_petabook_20250505c.7z',
      license: 'MIT',
      positions: count,
      branches,
      shards: 64,
      maxPly: 48,
    },
    null,
    2,
  )}\n`,
)
console.log(`${count} positions, ${branches} evaluated moves`)
