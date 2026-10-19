// usage: bun m1all.ts "<sfen>" [moves...]: for each legal reply of side to move, list whether opponent has mate-in-1 (and how)
import { Position, formatMove } from 'tsshogi'
import { HAND_ORDER, hasLegalMove, legalTargets, promotionOptions } from '/home/user/shogigym/src/utils/shogi'
const [sfen0, ...moves] = process.argv.slice(2)
const p = Position.newBySFEN(sfen0)!
for (const u of moves) { const m = p.createMoveByUSI(u); if (!m || !p.isValidMove(m)) { console.log('ILLEGAL', u); process.exit(1) } p.doMove(m) }
const legal = (q: Position) => {
  const out: any[] = []; const hand = q.hand(q.color)
  const sources = [...q.board.listNonEmptySquares().filter((s) => q.board.at(s)!.color === q.color), ...HAND_ORDER.filter((t) => hand.count(t) > 0)]
  for (const from of sources) for (const to of legalTargets(q, from)) for (const m of promotionOptions(q, from, to)) out.push(m)
  return out
}
for (const r of legal(p)) {
  const q = Position.newBySFEN(p.sfen)!; const t = formatMove(q, r); q.doMove(r)
  const mates = legal(q).filter((m) => { const z = Position.newBySFEN(q.sfen)!; z.doMove(m); return z.checked && !hasLegalMove(z) }).map((m) => formatMove(q, m))
  console.log(`${t.padEnd(10)} ${q.checked ? 'CHECK ' : '      '} mate-in-1: ${mates.join(' ') || 'NONE'}`)
}
