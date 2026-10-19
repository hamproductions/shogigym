import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { Color, Position, formatMove } from 'tsshogi'
import { STARTPOS, type Step, type Unit } from '/home/user/shogigym/scripts/lessons/unit'
const A = '/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit'
const ev = new Map<string, any>()
for (const i of [0, 1, 2]) for (const l of readFileSync(`${A}/ev${i}.jsonl`, 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); ev.set(r.sfen, r) }
const norm = (s: string) => s.split(' ').slice(0, 3).join(' ') + ' 1'
const rows: string[] = []
for (const f of readdirSync('/home/user/shogigym/data/lessons/units')) {
  const u = JSON.parse(readFileSync(`/home/user/shogigym/data/lessons/units/${f}`, 'utf8')) as Unit
  u.chapters.forEach((ch, c) => {
    const learner = ch.side === 'sente' ? Color.BLACK : Color.WHITE
    const tips: string[] = []
    const run = (sfen: string, steps: Step[], label: string) => {
      const p = Position.newBySFEN(sfen)!
      steps.forEach((st, n) => {
        for (const usi of st.moves ?? []) {
          const e = ev.get(norm(p.sfen)); const m = p.createMoveByUSI(usi)!; const text = formatMove(p, m)
          if (e && e.mate !== null && e.mate > 0) {
            // side to move has forced mate in e.mate; does the lesson play a move that keeps it?
            const q = Position.newBySFEN(p.sfen)!; q.doMove(m)
            const a = ev.get(norm(q.sfen))
            const kept = q.checked && !hasLegal(q) || (a && a.mate !== null && a.mate < 0 && -a.mate < e.mate)
            const who = p.color === learner ? 'LEARNER' : 'OPP'
            if (!kept) rows.push(`${u.id}#${c}.${label}${n}\t${who} has mate ${e.mate} (${e.pv.slice(0, e.mate).join(' ')}) but lesson plays ${text}(${usi}) after=${a ? (a.mate !== null ? 'mate ' + a.mate : a.score) : '?'}\t${st.text.ja.slice(0, 120)}`)
          }
          p.doMove(m)
        }
        if (label === 's') tips.push(p.sfen)
        const e2 = ev.get(norm(p.sfen))
        // end-of-step position: side to move has mate but the step text doesn't mention 詰
        if (e2 && e2.mate !== null && e2.mate > 0 && !/詰/.test(st.text.ja) && !(st.moves ?? []).length === false) {
          const who = p.color === learner ? 'LEARNER' : 'OPP'
          rows.push(`${u.id}#${c}.${label}${n}\t[end] ${who} to move has mate ${e2.mate} (${e2.pv.slice(0, e2.mate).join(' ')}); text silent on 詰\t${st.text.ja.slice(0, 120)}`)
        }
      })
    }
    run(ch.start === 'startpos' ? STARTPOS : ch.start, ch.steps, 's')
    ch.variations?.forEach((v, i) => run(tips[v.from], [{ moves: v.moves, text: v.text }, ...(v.steps ?? [])], `v${i}.`))
  })
}
import { hasLegalMove as hasLegal } from '/home/user/shogigym/src/utils/shogi'
writeFileSync(`${A}/mates.tsv`, rows.join('\n') + '\n')
console.log(rows.length)
