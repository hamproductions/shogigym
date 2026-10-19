// usage: bun pos.ts "<sfen>" [moves...] [--mates] [--legal]
// prints board status after moves; --mates lists every legal move that mates immediately; --legal lists all legal moves
import { Color, Position, Square, PieceType, formatMove } from 'tsshogi'
import { HAND_ORDER, hasLegalMove, legalTargets, promotionOptions } from '/home/user/shogigym/src/utils/shogi'
const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith('--'))
const [sfen0, ...moves] = args.filter((a) => !a.startsWith('--'))
const p = Position.newBySFEN(sfen0 === 'startpos' ? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1' : sfen0)!
for (const u of moves) {
  const m = p.createMoveByUSI(u)
  if (!m || !p.isValidMove(m)) { console.log('ILLEGAL', u); process.exit(1) }
  process.stdout.write(formatMove(p, m) + ' ')
  p.doMove(m)
}
console.log('\nsfen:', p.sfen)
export const legal = (q: Position) => {
  const out: { usi: string; text: string }[] = []
  const hand = q.hand(q.color)
  const sources = [...q.board.listNonEmptySquares().filter((s) => q.board.at(s)!.color === q.color), ...HAND_ORDER.filter((t) => hand.count(t) > 0)]
  for (const from of sources) for (const to of legalTargets(q, from)) for (const m of promotionOptions(q, from, to)) out.push({ usi: m.usi, text: formatMove(q, m) })
  return out
}
const mated = (q: Position) => q.checked && !hasLegalMove(q)
console.log('to move:', p.color === Color.BLACK ? 'sente' : 'gote', p.checked ? 'IN CHECK' : '', mated(p) ? 'CHECKMATED' : '')
const L = legal(p)
if (flags.includes('--legal')) console.log('legal', L.length + ':', L.map((x) => `${x.text}(${x.usi})`).join(' '))
if (flags.includes('--mates')) {
  const mates = L.filter((x) => { const q = Position.newBySFEN(p.sfen)!; q.doMove(q.createMoveByUSI(x.usi)!); return mated(q) })
  console.log('mating moves:', mates.map((x) => `${x.text}(${x.usi})`).join(' ') || 'none')
}
