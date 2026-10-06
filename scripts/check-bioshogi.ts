import { readFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { Color, Move, Position, SpecialMoveType, importKIF } from 'tsshogi'
import definitions from '../src/data/formations.json'
import { finalizeFormationTags, formationTagsAt, type DetectionPreset, type DetectionResult, type FormationTag } from '../src/utils/formationTags'
import { formationMoveTags } from '../src/utils/formation'
import { flipBookMove, flipBookPosition } from '../src/utils/bookPosition'

type Tags = Record<'attack' | 'defense' | 'technique' | 'note', string[]>
interface OracleRecord {
  file: string
  preset?: string
  initial: Tags[]
  initialSfen: string
  events: { ply: number; color: string; tags: Tags; sfen: string; accumulated: Tags[] }[]
  final: Tags[]
  plies: number
  error?: string
}
const oracle = JSON.parse(gunzipSync(await readFile('vendor/bioshogi/oracle.json.gz')).toString()) as {
  revision: string
  records: OracleRecord[]
  mirroredRecords: OracleRecord[]
}
if (oracle.revision !== definitions.revision) throw new Error('Oracle revision differs from detector revision')
const manifest = JSON.parse(await readFile('vendor/bioshogi/fixture-manifest.json', 'utf8')) as { revision: string; paths: string[] }
if (manifest.revision !== oracle.revision || manifest.paths.length !== oracle.records.length) throw new Error('Fixture manifest differs from oracle')
const fixtureFiles = manifest.paths.map((path) => path.replaceAll('/', '__')).sort()
if (JSON.stringify(fixtureFiles) !== JSON.stringify(oracle.records.map((record) => record.file).sort()))
  throw new Error('Oracle fixture paths differ from manifest')
const voices = JSON.parse(await readFile('public/voice/zundamon/manifest.json', 'utf8')) as Record<string, string>
const presets = ['平手', '香落ち', '右香落ち', '角落ち', '飛車落ち', '飛香落ち', '二枚落ち', '二枚持ち', '三枚落ち', '四枚落ち', '六枚落ち']
const names = (tags: Tags) => [...new Set(Object.values(tags).flat())].sort()
const actualNames = (tags: FormationTag[]) => [...new Set(tags.map((tag) => tag.name))].sort()
let assertions = 0
const failures: string[] = []
const emitted = new Set<string>()
const compare = (label: string, expected: string[], actual: string[]) => {
  assertions++
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    const missing = expected.filter((name) => !actual.includes(name))
    const extra = actual.filter((name) => !expected.includes(name))
    failures.push(`${label}: ${JSON.stringify({ missing, extra })}`)
  }
}
for (const item of oracle.records) {
  if (item.error) throw new Error(`${item.file}: ${item.error}`)
  const record = importKIF(await readFile(`vendor/bioshogi/fixtures/${item.file}`, 'utf8'))
  if (record instanceof Error) throw new Error(`${item.file}: ${record.message}`)
  const moves = record.moves.filter((node) => node.move instanceof Move).map((node) => (node.move as Move).usi)
  const position = Position.newBySFEN(record.initialPosition.sfen)!
  const sfens = [position.sfen]
  for (const usi of moves) {
    const move = position.createMoveByUSI(usi)
    if (!move || !position.doMove(move, { ignoreValidation: true })) throw new Error(`${item.file}: ${usi}`)
    sfens.push(position.sfen)
  }
  if (item.plies !== moves.length) throw new Error(`${item.file}: ply count differs`)
  const preset: DetectionPreset =
    item.preset && presets.includes(item.preset) ? { hirateLike: ['平手', '香落ち', '右香落ち'].includes(item.preset), generalPreset: true } : {}
  const initialHand = item.initialSfen.split(' ')[2]
  const heldKings = (symbol: string) => Number(new RegExp(`(\\d*)${symbol}`).exec(initialHand)?.[1] || (initialHand.includes(symbol) ? 1 : 0))
  const kingHands: [number, number] = [heldKings('K'), heldKings('k')]
  if (kingHands.some(Boolean)) preset.kingHands = kingHands
  const last = record.moves.at(-1)!
  const ending = last.move instanceof Move ? undefined : last.move.type
  const loses = [SpecialMoveType.RESIGN, SpecialMoveType.MATE, SpecialMoveType.TIMEOUT, SpecialMoveType.FOUL_LOSE, SpecialMoveType.LOSE_BY_DEFAULT].some(
    (type) => type === ending,
  )
  const wins = [SpecialMoveType.FOUL_WIN, SpecialMoveType.WIN_BY_DEFAULT].some((type) => type === ending)
  const winner = loses ? (position.color === Color.BLACK ? Color.WHITE : Color.BLACK) : wins ? position.color : undefined
  const result: DetectionResult = { ...preset, winner, checkmate: ending === SpecialMoveType.MATE, impasse: ending === SpecialMoveType.IMPASS }
  const normalized = (sfen: string) => {
    const fields = sfen.split(' ')
    fields[2] = fields[2].replace(/\d*[Kk]/g, '') || '-'
    if (fields.length === 3) fields.push('1')
    const parsed = Position.newBySFEN(fields.join(' '))
    if (!parsed) throw new Error(`${item.file}: unsupported oracle position ${sfen}`)
    return parsed.sfen.split(' ').slice(0, 3).join(' ')
  }
  if (normalized(sfens[0]) !== normalized(item.initialSfen)) throw new Error(`${item.file}: initial position differs`)
  for (let ply = 0; ply <= moves.length; ply++) {
    const expected = ply ? item.events[ply - 1].accumulated : item.initial
    if (ply && normalized(sfens[ply]) !== normalized(item.events[ply - 1].sfen)) throw new Error(`${item.file}:${ply}: position differs`)
    const actual = formationTagsAt(sfens.slice(0, ply + 1), moves.slice(0, ply), ply, preset)
    for (let side = 0; side < 2; side++) compare(`${item.file}:${ply}:${side}`, names(expected[side]), actualNames(actual[side]))
  }
  const final = finalizeFormationTags(sfens, moves, result)
  const annotations = formationMoveTags(sfens, moves, preset, result)
  for (const event of item.events) {
    const side = event.color === 'black' ? 0 : 1
    compare(
      `${item.file}:hand:${event.ply}`,
      names(event.tags),
      actualNames(annotations[side].filter((tag) => tag.ply === event.ply && tag.annotation !== false)),
    )
  }
  for (let side = 0; side < 2; side++) {
    compare(`${item.file}:final:${side}`, names(item.final[side]), actualNames(final[side]))
    final[side].forEach((tag) => emitted.add(tag.name))
  }
  const mirror = oracle.mirroredRecords.find((record) => record.file === item.file)
  if (!mirror || mirror.error || mirror.plies !== moves.length) throw new Error(`${item.file}: mirrored oracle missing or invalid`)
  const mirroredSfens = sfens.map(flipBookPosition)
  const mirroredMoves = moves.map(flipBookMove)
  const mirroredResult: DetectionResult = {
    ...result,
    kingHands: preset.kingHands ? [preset.kingHands[1], preset.kingHands[0]] : undefined,
    winner: winner === undefined ? undefined : winner === Color.BLACK ? Color.WHITE : Color.BLACK,
  }
  for (let ply = 0; ply <= moves.length; ply++) {
    const expected = ply ? mirror.events[ply - 1].accumulated : mirror.initial
    const actual = formationTagsAt(mirroredSfens.slice(0, ply + 1), mirroredMoves.slice(0, ply), ply, mirroredResult)
    for (let side = 0; side < 2; side++) compare(`${item.file}:mirror:${ply}:${side}`, names(expected[side]), actualNames(actual[side]))
  }
  const mirrored = finalizeFormationTags(mirroredSfens, mirroredMoves, mirroredResult)
  const mirroredAnnotations = formationMoveTags(mirroredSfens, mirroredMoves, mirroredResult, mirroredResult)
  for (const event of mirror.events) {
    const side = event.color === 'black' ? 0 : 1
    compare(
      `${item.file}:mirror:hand:${event.ply}`,
      names(event.tags),
      actualNames(mirroredAnnotations[side].filter((tag) => tag.ply === event.ply && tag.annotation !== false)),
    )
  }
  for (let side = 0; side < 2; side++) compare(`${item.file}:mirror:final:${side}`, names(mirror.final[side]), actualNames(mirrored[side]))
}
for (const name of emitted) {
  assertions++
  if (!voices[name]) failures.push(`Missing voice: ${name}`)
}
for (const failure of failures) console.error(failure)
console.log(JSON.stringify({ fixtures: oracle.records.length, assertions, failures: failures.length }))
if (failures.length) process.exitCode = 1
