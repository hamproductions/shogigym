import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { InitialPositionSFEN, Position, importCSA, parseCSAMove } from 'tsshogi'
import { statsKey, statsShard, type RawPosition, type StatsMeta } from '../../src/workshop/lib/stats'

const args = process.argv.slice(2)
const arg = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const FLOODGATE_YEARS = arg('floodgate', '2025').split(',').filter(Boolean)
const AOBA_FILES = Number(arg('aoba', '3'))
const MIN_GAMES = Number(arg('min', '30'))
const MAX_PLY = Number(arg('ply', '30'))
const MAX_MOVES = Number(arg('moves', '10'))
const KEEP = args.includes('--keep')
const CACHE = '.cache/stats'
const OUT = 'public/book'
const AOBA_PAGE = 'http://www.yss-aya.com/aobazero/'
const PETABOOK_URL = 'https://github.com/yaneurao/YaneuraOu/releases/download/new_petabook233/new_petabook_20250505c.7z'

type Result = 'b' | 'w' | 'd' | null
const table = new Map<string, Map<string, number[]>>()
const sourceGames: { id: string; games: number }[] = []
const HIRATE = statsKey(InitialPositionSFEN.STANDARD)

function shell(cmd: string) {
  const child = spawn('sh', ['-c', cmd], { stdio: ['ignore', 'pipe', 'inherit'] })
  return createInterface({ input: child.stdout, crlfDelay: Infinity })
}

function download(url: string, file: string) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const r = spawnSync('curl', ['-sSL', '-C', '-', '--speed-limit', '2000', '--speed-time', '20', '-o', file, '-w', '%{http_code}', url], { encoding: 'utf8' })
    if (r.status === 0 || r.stdout === '416') return
  }
  throw new Error(`download failed: ${url}`)
}

function resultOf(end: string, plies: number): Result {
  const toMove = plies % 2 === 0 ? 'b' : 'w'
  const other = toMove === 'b' ? 'w' : 'b'
  if (/^%(TORYO|TIME_UP|ILLEGAL_MOVE|TSUMI)/.test(end)) return other
  if (end.startsWith('%KACHI')) return toMove
  if (end.startsWith('%+ILLEGAL_ACTION')) return 'w'
  if (end.startsWith('%-ILLEGAL_ACTION')) return 'b'
  if (/^%(SENNICHITE|JISHOGI|MAX_MOVES|HIKIWAKE)/.test(end)) return 'd'
  return null
}

function startsHirate(start: string[]) {
  if (start.length === 2 && start[0] === 'PI' && start[1] === '+') return true
  if (start.some((l) => l === 'PI' || /^P[+-]/.test(l))) return false
  const record = importCSA(`${start.join('\n')}\n`)
  return !(record instanceof Error) && statsKey(record.position.sfen) === HIRATE
}

function addGame(start: string[], moves: string[], result: Result) {
  if (!result || moves.length < 20 || !startsHirate(start)) return false
  const position = Position.newBySFEN(InitialPositionSFEN.STANDARD)
  if (!position) return false
  const steps: [string, string][] = []
  for (const line of moves.slice(0, MAX_PLY)) {
    const move = parseCSAMove(position, line)
    if (move instanceof Error) break
    steps.push([statsKey(position.sfen), move.usi])
    if (!position.doMove(move)) break
  }
  for (const [key, usi] of steps) {
    let moveMap = table.get(key)
    if (!moveMap) table.set(key, (moveMap = new Map()))
    const row = moveMap.get(usi) ?? [0, 0, 0]
    row[0]++
    if (result === 'b') row[1]++
    if (result === 'w') row[2]++
    moveMap.set(usi, row)
  }
  return true
}

async function readGames(id: string, cmd: string, isStart: (line: string) => boolean) {
  let start: string[] = []
  let moves: string[] = []
  let end = ''
  let games = 0
  const flush = () => {
    if (addGame(start, moves, resultOf(end, moves.length))) games++
    start = []
    moves = []
    end = ''
  }
  for await (const raw of shell(cmd)) {
    const line = raw.trimEnd()
    if (isStart(line)) flush()
    else if (/^[+-]\d{4}[A-Z]{2}/.test(line)) moves.push(line.slice(0, 7))
    else if (line.startsWith('%')) end ||= line
    else if (!moves.length && /^(PI|P[1-9+-]|[+-]$)/.test(line)) start.push(line)
  }
  flush()
  sourceGames.push({ id, games })
  console.log(`${id}: ${games} games, ${table.size} positions so far`)
}

async function aobaFiles() {
  const page = await (await fetch(AOBA_PAGE)).text()
  const section = page.slice(page.indexOf('xz'), page.indexOf('no000000000000'))
  const folders = [...section.matchAll(/drive\/folders\/([\w-]+)/g)].map((m) => m[1])
  const folder = folders.at(-1)
  if (!folder) throw new Error('no AobaZero kifu folder found')
  const view = await (await fetch(`https://drive.google.com/embeddedfolderview?id=${folder}`)).text()
  const files = [...view.matchAll(/file\/d\/([\w-]+)[\s\S]*?flip-entry-title">(arch\d+\.csa\.xz)/g)].map((m) => ({ id: m[1], name: m[2] }))
  return files.sort((a, b) => a.name.localeCompare(b.name)).slice(-AOBA_FILES)
}

async function readPetabook(keys: Set<string>) {
  const file = `${CACHE}/new_petabook.7z`
  if (!existsSync(file)) download(PETABOOK_URL, file)
  const boards = new Set([...keys].map((k) => k.split(' ')[0]))
  const best = new Map<string, [string, number]>()
  let current: string | null = null
  for await (const line of shell(`bsdtar -xOf ${file}`)) {
    if (line.startsWith('sfen ')) {
      current = null
      const sfen = line.slice(5)
      if (!boards.has(sfen.slice(0, sfen.indexOf(' ')))) continue
      const key = statsKey(Position.newBySFEN(sfen)?.sfen ?? '')
      if (keys.has(key)) current = key
    } else if (current) {
      const [usi, , evalText] = line.split(' ')
      const value = Number(evalText)
      const prev = best.get(current)
      if (usi && Number.isFinite(value) && (!prev || value > prev[1])) best.set(current, [usi, value])
    }
  }
  if (!KEEP) rmSync(file)
  return best
}

mkdirSync(CACHE, { recursive: true })

for (const file of await aobaFiles()) {
  const url = `https://drive.usercontent.google.com/download?id=${file.id}&export=download&confirm=t`
  await readGames(`aobazero:${file.name}`, `curl -sSL --retry 3 '${url}' | xz -dc | LC_ALL=C grep -aE '^(PI|P[1-9+-]|/|%|[+-])' | cut -c1-24`, (line) => line === '/')
}

for (const year of FLOODGATE_YEARS) {
  const file = `${CACHE}/wdoor${year}.7z`
  download(`https://wdoor.c.u-tokyo.ac.jp/shogi/archive/wdoor${year}.7z`, file)
  await readGames(`floodgate:${year}`, `bsdtar -xOf ${file} | LC_ALL=C grep -aE '^(V2|PI|P[1-9+-]|%|[+-])' | cut -c1-40`, (line) => line.startsWith('V2'))
  if (!KEEP) rmSync(file)
}

const totals = [...table.values()].map((moveMap) => [...moveMap.values()].reduce((sum, r) => sum + r[0], 0))
console.log([5, 10, 20, 30, 50, 100].map((t) => `>=${t}: ${totals.filter((n) => n >= t).length}`).join(', '))
const kept = new Map<string, RawPosition>()
for (const [key, moveMap] of table) {
  const rows = [...moveMap].map(([usi, [n, s, g]]) => [usi, n, s, g] as [string, number, number, number])
  const total = rows.reduce((sum, r) => sum + r[1], 0)
  if (total < MIN_GAMES) continue
  const m = rows.filter((r) => r[1] >= Math.max(2, total * 0.005)).sort((a, b) => b[1] - a[1]).slice(0, MAX_MOVES)
  kept.set(key, { n: total, m })
}
table.clear()
console.log(`kept ${kept.size} positions with >= ${MIN_GAMES} games`)

const book = await readPetabook(new Set(kept.keys()))
for (const [key, b] of book) kept.get(key)!.b = b
console.log(`petabook moves for ${book.size} positions`)

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const shards = new Map<string, Record<string, RawPosition>>()
for (const [key, value] of kept) {
  const id = statsShard(key)
  if (!shards.has(id)) shards.set(id, {})
  shards.get(id)![key] = value
}
for (const [id, shard] of shards) writeFileSync(`${OUT}/${id}.json`, JSON.stringify(shard))
const meta: StatsMeta = { games: sourceGames.reduce((s, x) => s + x.games, 0), sources: sourceGames, minGames: MIN_GAMES, maxPly: MAX_PLY, built: new Date().toISOString().slice(0, 10) }
writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 2))
const bytes = readdirSync(OUT).reduce((s, f) => s + statSync(`${OUT}/${f}`).size, 0)
console.log(`wrote ${shards.size} shards, ${(bytes / 1024 / 1024).toFixed(2)} MB to ${OUT}`)
