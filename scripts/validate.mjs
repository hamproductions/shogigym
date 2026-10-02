import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { Position } from 'tsshogi'

const dirs = ['vendor/shiryu-joseki/src/data/joseki', 'src/data/joseki']
const stripPly = (sfen) => sfen.split(' ').slice(0, 3).join(' ')
let errors = 0
let moves = 0

const fail = (file, msg) => {
  errors++
  console.error(`${file}: ${msg}`)
}

const play = (file, sfen, usis, label) => {
  const position = Position.newBySFEN(sfen)
  for (const usi of usis) {
    const move = position.createMoveByUSI(usi)
    if (!move || !position.doMove(move)) return fail(file, `${label}: illegal ${usi}`)
  }
}

const walk = (file, node) => {
  const position = Position.newBySFEN(node.sfen)
  if (!position) return fail(file, `${node.id}: bad sfen ${node.sfen}`)
  for (const branch of node.branches) {
    moves++
    const next = position.clone()
    const move = next.createMoveByUSI(branch.usi)
    if (!move || !next.doMove(move)) {
      fail(file, `${node.id}: illegal ${branch.usi}`)
      continue
    }
    for (const demo of branch.demos ?? []) play(file, next.sfen, demo.usi, `${node.id} demo "${demo.title}"`)
    if (!branch.child) continue
    if (stripPly(branch.child.sfen) !== stripPly(next.sfen)) fail(file, `${node.id} ${branch.usi}: child sfen mismatch`)
    walk(file, branch.child)
  }
}

for (const dir of dirs) {
  let files = []
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  } catch {
    continue
  }
  for (const file of files) walk(`${dir}/${file}`, JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')).root)
}

console.log(`${moves} moves checked, ${errors} errors`)
for (const script of ['scripts/strategy-check.ts']) {
  const run = spawnSync('bun', [script], { stdio: 'inherit' })
  if (run.status !== 0) errors++
}
process.exit(errors ? 1 : 0)
