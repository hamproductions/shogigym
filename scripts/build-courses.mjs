import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { InitialPositionSFEN, Position, parseMoves } from 'tsshogi'

const SPEC_DIR = 'scripts/courses'
const OUT_DIR = 'src/data/joseki'
const VENDOR_DIR = 'vendor/shiryu-joseki'

function parseSegment(position, segment, lastMove) {
  const text = segment.moves.trim()
  const usiTokens = text.split(/\s+/)
  if (usiTokens.every((t) => /^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(t))) {
    const p = position.clone()
    return usiTokens.map((usi) => {
      const move = p.createMoveByUSI(usi)
      if (!move || !p.doMove(move)) throw new Error(`illegal ${usi} in "${text}"`)
      return move
    })
  }
  const [moves, error] = parseMoves(position, text, lastMove)
  if (error) throw new Error(`${error.message} in "${text}"`)
  return moves
}

function buildSegment(position, segment, lastMove, idPrefix) {
  const moves = parseSegment(position, segment, lastMove)
  const p = position.clone()
  const head = { branches: [] }
  let node = head
  moves.forEach((move, i) => {
    const notes = segment.notes ?? {}
    const branch = { usi: move.usi, kind: i === 0 ? (segment.kind ?? 'main') : 'main' }
    if (notes[i]) branch.note = notes[i]
    if (i === 0 && segment.punishNote) branch.punishNote = segment.punishNote
    if (i === 0 && segment.aim) branch.aim = segment.aim
    p.doMove(move)
    branch.child = { id: `${idPrefix}_${i}`, sfen: p.sfen, branches: [] }
    node.branches.push(branch)
    node = branch.child
  })
  if (segment.comment) node.comment = segment.comment
  ;(segment.branches ?? []).forEach((child, i) => {
    const sub = buildSegment(p, child, moves.at(-1), `${idPrefix}b${i}`)
    mergeInto(node, sub.head.branches)
  })
  return { head, last: node }
}

const RANK = { main: 0, alt: 1, deviation: 2 }

function mergeInto(node, branches) {
  for (const branch of branches) {
    const existing = node.branches.find((b) => b.usi === branch.usi)
    if (!existing) {
      node.branches.push(branch)
      continue
    }
    if (RANK[branch.kind] < RANK[existing.kind]) existing.kind = branch.kind
    for (const key of ['note', 'aim', 'punishNote']) if (!existing[key] && branch[key]) existing[key] = branch[key]
    if (branch.child) {
      if (!existing.child.comment && branch.child.comment) existing.child.comment = branch.child.comment
      mergeInto(existing.child, branch.child.branches)
    }
  }
}

const vendorArg = process.argv.indexOf('--vendor')
if (vendorArg > 0) {
  const [checkout, commit] = process.argv.slice(vendorArg + 1, vendorArg + 3)
  if (!checkout || !/^[0-9a-f]{40}$/.test(commit ?? '')) throw new Error('usage: --vendor <shiryu checkout> <40-char commit>')
  const from = `${checkout}/src/data/joseki`
  const to = `${VENDOR_DIR}/src/data/joseki`
  rmSync(to, { recursive: true, force: true })
  mkdirSync(to, { recursive: true })
  for (const file of readdirSync(from).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) copyFileSync(`${from}/${file}`, `${to}/${file}`)
  for (const file of ['LICENSE', 'DESIGN.md']) copyFileSync(`${checkout}/${file}`, `${VENDOR_DIR}/${file}`)
  writeFileSync(`${VENDOR_DIR}/SOURCE_COMMIT`, commit + '\n')
  console.log(`vendored ${readdirSync(to).length} courses from ${commit}`)
}

mkdirSync(OUT_DIR, { recursive: true })
for (const file of readdirSync(SPEC_DIR).filter((f) => f.endsWith('.mjs'))) {
  const { default: spec } = await import(pathToFileURL(`${SPEC_DIR}/${file}`).href)
  const start = Position.newBySFEN(spec.startSfen ?? InitialPositionSFEN.STANDARD)
  if (!start) throw new Error(`${spec.id}: invalid startSfen`)
  const { head } = buildSegment(start, spec.line, undefined, 'n')
  const { line, startSfen, ...meta } = spec
  const course = { ...meta, root: { id: 'n0', sfen: start.sfen, comment: spec.rootComment, branches: head.branches } }
  delete course.rootComment
  writeFileSync(`${OUT_DIR}/${spec.id}.json`, JSON.stringify(course, null, 1) + '\n')
  console.log(`built ${spec.id}`)
}
