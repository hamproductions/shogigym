// Render every lesson unit as readable text: boards, Japanese move notation, marks and ja/en text.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { Color, PieceType, Position, Square, formatMove } from 'tsshogi'
import { HAND_ORDER, PIECE_CHAR, hasLegalMove, usiFallback } from '/home/user/shogigym/src/utils/shogi'
import { STARTPOS, type Marks, type Step, type Unit } from '/home/user/shogigym/scripts/lessons/unit'

const ROOT = '/home/user/shogigym'
const OUT = process.argv[2] ?? '/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit/dump'
mkdirSync(OUT, { recursive: true })
const ids = process.argv.slice(3)

const handText = (p: Position, c: Color) => {
  const h = p.hand(c)
  const s = HAND_ORDER.filter((t) => h.count(t) > 0).map((t) => PIECE_CHAR[t] + (h.count(t) > 1 ? h.count(t) : '')).join('')
  return s || 'なし'
}
const board = (p: Position) => {
  const rows = ['  ９ ８ ７ ６ ５ ４ ３ ２ １']
  rows.push(`△持駒: ${handText(p, Color.WHITE)}`)
  for (let rank = 1; rank <= 9; rank++) {
    let row = ''
    for (let file = 9; file >= 1; file--) {
      const piece = p.board.at(new Square(file, rank))
      row += piece ? (piece.color === Color.WHITE ? 'v' : ' ') + PIECE_CHAR[piece.type] : ' ・'
    }
    rows.push(`|${row}| ${'一二三四五六七八九'[rank - 1]}`)
  }
  rows.push(`▲持駒: ${handText(p, Color.BLACK)}   手番: ${p.color === Color.BLACK ? '▲' : '△'}`)
  return rows.join('\n')
}
const status = (p: Position) => {
  const out: string[] = []
  if (p.checked) out.push(hasLegalMove(p) ? 'CHECK' : 'CHECKMATE')
  else if (!hasLegalMove(p)) out.push('NO-LEGAL-MOVES')
  const other = p.color === Color.BLACK ? Color.WHITE : Color.BLACK
  if (p.board.isChecked(other)) out.push('ILLEGAL: side-not-to-move in check')
  return out.length ? ` [${out.join(', ')}]` : ''
}
const sq = (s: string) => `${s[0]}${'一二三四五六七八九'['abcdefghi'.indexOf(s[1])]}`
const arrow = (p: Position, usi: string) => {
  const move = p.createMoveByUSI(usi)
  if (move && p.isValidMove(move)) return formatMove(p, move)
  // arrow for the other side or an illegal one: describe with the origin piece
  if (usi[1] === '*') return `${usiFallback(usi)}(drop)`
  const piece = p.board.at(Square.newByUSI(usi.slice(0, 2))!)
  const owner = piece ? (piece.color === Color.BLACK ? '▲' : '△') + PIECE_CHAR[piece.type] : 'EMPTY-ORIGIN'
  let legalForOwner = ''
  if (piece) {
    const q = Position.newBySFEN(p.sfen)!
    q.setColor(piece.color)
    const m = q.createMoveByUSI(usi)
    legalForOwner = m && q.isValidMove(m) ? '' : ' NOT-LEGAL'
  }
  return `${owner}${usiFallback(usi)}${legalForOwner}`
}
const marksText = (p: Position, m?: Marks) => {
  if (!m) return ''
  const parts: string[] = []
  if (m.arrows?.length) parts.push('arrows ' + m.arrows.map((a) => arrow(p, a)).join(' / '))
  if (m.ghosts?.length) parts.push('ghosts ' + m.ghosts.map((a) => arrow(p, a)).join(' / '))
  for (const key of ['boxes', 'dashed'] as const)
    if (m[key]?.length)
      parts.push(
        key +
          ' ' +
          m[key]!.map((s) => {
            const pc = p.board.at(Square.newByUSI(s)!)
            return sq(s) + (pc ? `(${pc.color === Color.BLACK ? '▲' : '△'}${PIECE_CHAR[pc.type]})` : '(空)')
          }).join(' '),
      )
  if (m.last) parts.push('last ' + m.last)
  return parts.length ? `  marks: ${parts.join(' | ')}\n` : ''
}

const files = readdirSync(`${ROOT}/data/lessons/units`).filter((f) => f.endsWith('.json'))
const units = files.map((f) => JSON.parse(readFileSync(`${ROOT}/data/lessons/units/${f}`, 'utf8')) as Unit).filter((u) => !ids.length || ids.includes(u.id))
const index: string[] = []
for (const unit of units.sort((a, b) => a.order - b.order)) {
  const out: string[] = []
  out.push(`# ${unit.id}  order=${unit.order}  path=${unit.path.join(' / ')}${unit.practice ? '  practice' : ''}`)
  out.push(`title: ${unit.title.ja} | ${unit.title.en}`)
  out.push(`intro.ja: ${unit.intro.ja}`)
  out.push(`intro.en: ${unit.intro.en}`)
  if (unit.check) out.push(`check.Q: ${unit.check.question.ja} | ${unit.check.question.en}\ncheck.A: ${unit.check.answer.ja} | ${unit.check.answer.en}`)
  for (const r of unit.references ?? []) out.push(`ref: ${r.title} ${r.url} ${r.license} adapted=${!!r.adapted}`)
  const playSteps = (start: Position, steps: Step[], label: string, opening: boolean, prevUsi = '') => {
    const p = start
    let last = prevUsi
    steps.forEach((step, n) => {
      const notes: string[] = []
      for (const usi of step.moves ?? []) {
        const move = p.createMoveByUSI(usi)
        if (!move || !p.isValidMove(move)) {
          notes.push(`ILLEGAL ${usi}`)
          break
        }
        let t = formatMove(p, move)
        if (last && last.slice(2, 4) === usi.slice(2, 4)) t = t.slice(0, 1) + '同' + t.slice(3)
        notes.push(t)
        p.doMove(move)
        last = usi
      }
      out.push(`\n-- ${label} step ${n}${notes.length ? ': ' + notes.join(' ') : ' (no moves)'}${status(p)}`)
      if (step.moves?.length || (n === 0 && label !== 'main')) out.push(board(p))
      out.push(marksText(p, step.marks).trimEnd())
      out.push(`  ja: ${step.text.ja}`)
      out.push(`  en: ${step.text.en}`)
    })
    return last
  }
  unit.chapters.forEach((ch, c) => {
    const sfen = ch.start === 'startpos' ? STARTPOS : ch.start
    const opening = ch.kind === 'opening'
    out.push(`\n=== ch${c} "${ch.title.ja}" | "${ch.title.en}"  side=${ch.side} kind=${ch.kind ?? '-'} start=${ch.start}`)
    const p = Position.newBySFEN(sfen)!
    out.push(board(p) + status(p))
    const tipSfens: string[] = []
    const lastUsis: string[] = []
    // replay main steps, recording tips
    const q = Position.newBySFEN(sfen)!
    let last = ''
    ch.steps.forEach((step) => {
      for (const usi of step.moves ?? []) {
        const m = q.createMoveByUSI(usi)
        if (m && q.isValidMove(m)) (q.doMove(m), (last = usi))
      }
      tipSfens.push(q.sfen)
      lastUsis.push(last)
    })
    playSteps(p, ch.steps, 'main', opening)
    ch.variations?.forEach((v, i) => {
      const vp = Position.newBySFEN(tipSfens[v.from])!
      out.push(`\n~~ variation ${i} from main step ${v.from}`)
      const lastV = playSteps(vp, [{ moves: v.moves, text: v.text }], `v${i}`, false, lastUsis[v.from])
      if (v.steps?.length) playSteps(vp, v.steps, `v${i}`, false, lastV)
    })
  })
  const text = out.filter((l) => l !== '').join('\n') + '\n'
  writeFileSync(`${OUT}/${String(unit.order).padStart(4, '0')}-${unit.id}.txt`, text)
  index.push(`${unit.order}\t${unit.id}\t${unit.chapters.length}ch\t${text.length}B\t${unit.path.join('/')}`)
}
writeFileSync(`${OUT}/INDEX.tsv`, index.join('\n') + '\n')
console.log(index.length, 'units dumped')
