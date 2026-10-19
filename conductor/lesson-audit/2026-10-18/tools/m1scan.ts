import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { Color, Position, formatMove } from 'tsshogi'
import { HAND_ORDER, hasLegalMove, legalTargets, promotionOptions } from '/home/user/shogigym/src/utils/shogi'
import { STARTPOS, type Step, type Unit } from '/home/user/shogigym/scripts/lessons/unit'
const legal = (q: Position) => {
  const out: any[] = []; const hand = q.hand(q.color)
  const sources = [...q.board.listNonEmptySquares().filter((s) => q.board.at(s)!.color === q.color), ...HAND_ORDER.filter((t) => hand.count(t) > 0)]
  for (const from of sources) for (const to of legalTargets(q, from)) for (const m of promotionOptions(q, from, to)) out.push(m)
  return out
}
const mates = (q: Position) => legal(q).filter((m) => { const z = Position.newBySFEN(q.sfen)!; z.doMove(m); return z.checked && !hasLegalMove(z) })
const rows: string[] = []
for (const f of readdirSync('/home/user/shogigym/data/lessons/units')) {
  const u = JSON.parse(readFileSync(`/home/user/shogigym/data/lessons/units/${f}`, 'utf8')) as Unit
  u.chapters.forEach((ch, c) => {
    if (ch.kind === 'opening') return
    const learner = ch.side === 'sente' ? Color.BLACK : Color.WHITE
    const tips: string[] = []
    const run = (sfen: string, steps: Step[], label: string) => {
      const p = Position.newBySFEN(sfen)!
      steps.forEach((st, n) => {
        for (const usi of st.moves ?? []) {
          const m = p.createMoveByUSI(usi)!
          const ms = p.board.listNonEmptySquares().some((s) => p.board.at(s)!.type === 'king' && p.board.at(s)!.color !== p.color) ? mates(p) : []
          const z = Position.newBySFEN(p.sfen)!; z.doMove(m)
          const isMate = z.checked && !hasLegalMove(z)
          if (ms.length && !isMate) rows.push(`${u.id}#${c}.${label}${n}\t${p.color === learner ? 'LEARNER' : 'OPP'}\tplays ${formatMove(p, m)} but mate-in-1: ${ms.map((x) => formatMove(p, x)).join(' ')}\t${st.text.ja.slice(0, 90)}`)
          p.doMove(m)
        }
        if (label === 's') tips.push(p.sfen)
      })
    }
    run(ch.start === 'startpos' ? STARTPOS : ch.start, ch.steps, 's')
    ch.variations?.forEach((v, i) => run(tips[v.from], [{ moves: v.moves, text: v.text }, ...(v.steps ?? [])], `v${i}.`))
  })
}
writeFileSync('/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit/m1scan.tsv', rows.join('\n') + '\n')
console.log(rows.length)
