import { readFileSync, writeFileSync } from 'node:fs'
import { Position, Square, PieceType } from 'tsshogi'

const hasLegalMove = (p) => {
  const froms = [
    ...p.board.listNonEmptySquares().filter((s) => p.board.at(s).color === p.color),
    ...Object.values(PieceType).filter((t) => p.hand(p.color).count(t) > 0),
  ]
  for (const from of froms)
    for (let f = 1; f <= 9; f++)
      for (let r = 1; r <= 9; r++) {
        const m = p.createMove(from, new Square(f, r))
        if (m && (p.isValidMove(m) || p.isValidMove(m.withPromote()))) return true
      }
  return false
}

const problems = JSON.parse(readFileSync('src/data/tsume.json', 'utf8'))
let bad = 0
const kept = []
for (const pr of problems) {
  const p = Position.newBySFEN(pr.sfen)
  let ok = true
  pr.pv.forEach((usi, i) => {
    if (!ok) return
    const m = p.createMoveByUSI(usi)
    if (!m || !p.doMove(m)) ok = false
    else if (i % 2 === 0 && !p.checked) ok = false
  })
  if (!ok || !p.checked || hasLegalMove(p)) bad++
  else kept.push(pr)
}
if (process.argv.includes('--prune')) {
  writeFileSync('src/data/tsume.json', JSON.stringify(kept) + '\n')
  console.log(`pruned ${bad}`)
  bad = 0
}
console.log(`${problems.length} problems, ${bad} failed`)
process.exit(bad ? 1 : 0)
