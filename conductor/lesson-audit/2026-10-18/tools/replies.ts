// usage: bun replies.ts <ms> "<sfen>" [moves...]  — for every legal move of the side to move, engine-evaluate the result
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { Position, formatMove } from 'tsshogi'
import { HAND_ORDER, legalTargets, promotionOptions } from '/home/user/shogigym/src/utils/shogi'
const [ms, sfen0, ...moves] = process.argv.slice(2)
const p = Position.newBySFEN(sfen0 === 'startpos' ? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1' : sfen0)!
for (const u of moves) { const m = p.createMoveByUSI(u); if (!m || !p.isValidMove(m)) { console.log('ILLEGAL', u); process.exit(1) } p.doMove(m) }
const hand = p.hand(p.color)
const sources = [...p.board.listNonEmptySquares().filter((s) => p.board.at(s)!.color === p.color), ...HAND_ORDER.filter((t) => hand.count(t) > 0)]
const list: { usi: string; text: string; sfen: string }[] = []
for (const from of sources) for (const to of legalTargets(p, from)) for (const m of promotionOptions(p, from, to)) {
  const q = Position.newBySFEN(p.sfen)!; q.doMove(m); list.push({ usi: m.usi, text: formatMove(p, m), sfen: q.sfen })
}
const tmp = '/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit/replies-in.txt'
writeFileSync(tmp, list.map((x) => x.sfen).join('\n') + '\n')
const out = execFileSync('node', ['/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit/eng.mjs', ms, tmp], { encoding: 'utf8', maxBuffer: 1e8 }).trim().split('\n').map((l) => JSON.parse(l))
const rows = list.map((x, i) => ({ ...x, r: out[i] }))
// score is from the side to move AFTER the reply (opponent); show from mover's perspective
rows.sort((a, b) => (-(a.r.score ?? 0)) - (-(b.r.score ?? 0))).reverse()
console.log('position:', p.sfen, '| movers:', list.length)
for (const x of rows) console.log(`${x.text.padEnd(10)} ${x.usi.padEnd(6)} mover=${-(x.r.score ?? 0)} ${x.r.mate !== null ? 'mate ' + (-x.r.mate) : ''} pv ${x.r.pv.slice(0, 6).join(' ')}`)
