// Join engine evaluations to every move of every lesson line and flag large losses.
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
    const learner = ch.side === 'sente' ? 0 : 1
    const tips: string[] = []
    const run = (sfen: string, steps: Step[], label: string) => {
      const p = Position.newBySFEN(sfen)!
      steps.forEach((st, n) => {
        for (const usi of st.moves ?? []) {
          const before = ev.get(norm(p.sfen)); const m = p.createMoveByUSI(usi)!; const text = formatMove(p, m); const mover = p.color === Color.BLACK ? 0 : 1
          const beforeBest = before?.best
          p.doMove(m)
          const after = ev.get(norm(p.sfen))
          if (before && after && before.score !== null && after.score !== null) {
            const loss = before.score + after.score
            const sb = before.score, sa = -after.score
            const decided = Math.abs(sb) >= 2500 && Math.abs(sa) >= 2500 && Math.sign(sb) === Math.sign(sa)
            const who = mover === learner ? 'LEARNER' : 'OPP'
            const th = who === 'LEARNER' ? 300 : 500
            if (loss >= th && !decided && usi !== beforeBest) rows.push(`${u.id}#${c}.${label}${n}\t${who}\t${text}(${usi})\tloss=${loss}\t${sb}->${sa}\tbest=${beforeBest}\t${st.text.ja.slice(0, 110)}`)
          }
        }
        if (label === 's') tips.push(p.sfen)
      })
    }
    run(ch.start === 'startpos' ? STARTPOS : ch.start, ch.steps, 's')
    ch.variations?.forEach((v, i) => run(tips[v.from], [{ moves: v.moves, text: v.text }, ...(v.steps ?? [])], `v${i}.`))
  })
}
writeFileSync(`${A}/screen.tsv`, rows.join('\n') + '\n')
console.log(rows.length, 'flags;', rows.filter((r) => r.includes('\tLEARNER\t')).length, 'learner')
