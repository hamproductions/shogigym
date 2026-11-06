import { readFileSync } from 'node:fs'
import { Position, Color, formatMove } from 'tsshogi'
import { HAND_ORDER, legalTargets, promotionOptions, hasLegalMove } from '../../src/utils/shogi'
import { buildUnit, STARTPOS, type Unit } from '../../scripts/lessons/unit'

const ids = ['endgame-mate1', 'endgame-mate3', 'endgame-mate5']
const inv = { K: 2, R: 2, B: 2, G: 4, S: 4, N: 4, L: 4, P: 18 }
const legal = (p: Position) => {
  const hand = p.hand(p.color)
  const sources = [...p.board.listNonEmptySquares().filter((s) => p.board.at(s)?.color === p.color), ...HAND_ORDER.filter((t) => hand.count(t) > 0)]
  return sources.flatMap((from) => legalTargets(p, from).flatMap((to) => promotionOptions(p, from, to)))
}
const move = (p: Position, usi: string) => {
  const m = p.createMoveByUSI(usi)
  if (!m || !p.isValidMove(m) || !p.doMove(m)) throw new Error(`illegal ${usi} at ${p.sfen}`)
}
const mate = (p: Position) => p.checked && !hasLegalMove(p)
const copy = (p: Position) => Position.newBySFEN(p.sfen)!
const stats = { states: 0, legalMoves: 0 }
const force = (p: Position, attacker: Color, checksLeft: number, memo = new Map<string, boolean>()): boolean => {
  stats.states++
  if (mate(p)) return p.color !== attacker
  if (checksLeft === 0 || p.color !== attacker) return false
  const key = `${p.sfen}|${checksLeft}`
  if (memo.has(key)) return memo.get(key)!
  const candidates = legal(p).filter((m) => {
    const q = copy(p)
    q.doMove(m)
    return q.checked
  })
  stats.legalMoves += candidates.length
  for (const check of candidates) {
    const q = copy(p)
    q.doMove(check)
    const replies = legal(q)
    stats.legalMoves += replies.length
    if (!replies.length) return true
    let all = true
    for (const reply of replies) {
      const child = copy(q)
      child.doMove(reply)
      if (!force(child, attacker, checksLeft - 1, memo)) {
        all = false
        break
      }
    }
    if (all) {
      memo.set(key, true)
      return true
    }
  }
  memo.set(key, false)
  return false
}
const physical = (sfen: string) => {
  const [board, turn, hand] = sfen.split(' ')
  const counts: Record<string, number> = Object.fromEntries(Object.keys(inv).map((k) => [k, 0]))
  const files = { b: Array(9).fill(0), w: Array(9).fill(0) }
  let nifu: number[] = [],
    stranded: string[] = []
  const rows = board.split('/')
  for (let r = 0; r < 9; r++) {
    const row = rows[r]
    let f = 0
    for (let i = 0; i < row.length;) {
      if (/\d/.test(row[i])) {
        f += Number(row[i++])
        continue
      }
      let promo = false
      if (row[i] === '+') {
        promo = true
        i++
      }
      const token = row[i++],
        color = token === token.toUpperCase() ? 'b' : 'w',
        base = token.toUpperCase()
      counts[base]++
      if (base === 'P' && !promo) {
        files[color as 'b' | 'w'][f]++
        if (files[color as 'b' | 'w'][f] > 1) nifu.push(9 - f)
      }
      const dead =
        color === 'b'
          ? base === 'P' || base === 'L'
            ? r === 0
            : base === 'N'
              ? r <= 1
              : false
          : base === 'P' || base === 'L'
            ? r === 8
            : base === 'N'
              ? r >= 7
              : false
      if (dead && !promo) stranded.push(`${color}:${base}:${9 - f}${r + 1}`)
      f++
    }
  }
  if (hand !== '-') for (const m of hand.matchAll(/(\d*)([RBGSNLP])/gi)) counts[m[2].toUpperCase()] += Number(m[1] || 1)
  const excess = Object.entries(inv)
    .filter(([k, max]) => counts[k] > max)
    .map(([k]) => `${k}=${counts[k]}/${inv[k as keyof typeof inv]}`)
  return { turn, counts, excess, nifu: [...new Set(nifu)], stranded }
}
const results: any[] = []
for (const id of ids) {
  const unit = JSON.parse(readFileSync(`data/lessons/units/${id}.json`, 'utf8')) as Unit
  const courses = buildUnit(unit)
  const unitResult: any = { id, chapters: [], physicalProblems: [] }
  for (let ci = 0; ci < unit.chapters.length; ci++) {
    const ch = unit.chapters[ci],
      start = Position.newBySFEN(ch.start === 'startpos' ? STARTPOS : ch.start)!
    const course = courses[ci]
    const positions = new Set<string>()
    const leaves: string[] = []
    const leafDepths: number[] = []
    const walk = (n: any, depth = 0) => {
      positions.add(n.sfen)
      if (!n.branches.length) {
        leaves.push(n.sfen)
        leafDepths.push(depth)
      }
      n.branches.forEach((b: any) => walk(b.child, depth + 1))
    }
    walk(course.root)
    for (const s of positions) {
      const x = physical(s)
      if (x.excess.length || x.nifu.length || x.stranded.length) unitResult.physicalProblems.push({ chapter: ci + 1, sfen: s, ...x })
    }
    const lineMoves = ch.steps.flatMap((st) => st.moves ?? [])
    const p = copy(start)
    lineMoves.forEach((u) => move(p, u))
    const mates1 = legal(start).filter((m) => {
      const q = copy(start)
      q.doMove(m)
      return mate(q)
    }).length
    const invStart = physical(start.sfen)
    const row: any = {
      chapter: ci + 1,
      start: start.sfen,
      inventory: invStart,
      terminal: p.sfen,
      terminalMate: mate(p),
      sourceLeaves: leaves.length,
      leafDepths,
      sourceMateLeaves: leaves.filter((s) => mate(Position.newBySFEN(s)!)).length,
      sourceNonMateLeaves: leaves
        .filter((s) => !mate(Position.newBySFEN(s)!))
        .map((s) => ({ sfen: s, checked: Position.newBySFEN(s)!.checked, legalReplies: legal(Position.newBySFEN(s)!).length })),
      mainLineMatesInOne: mates1,
      sourceFirstCheckReplies: null,
    }
    if (id === 'endgame-mate1') {
      const answer = ch.steps.slice(1).flatMap((st) => st.moves ?? [])
      const q = copy(start)
      answer.forEach((u) => move(q, u))
      row.answer = answer
      row.answerMate = mate(q)
      row.defenderLegalReplies = legal(q).length
      const [board, turn, hand] = start.sfen.split(' ')
      let rest = ''
      for (const type of 'RBGSNLP') {
        const n = inv[type as keyof typeof inv] - invStart.counts[type]
        if (n > 0) rest += `${n > 1 ? n : ''}${type.toLowerCase()}`
      }
      const assigned = Position.newBySFEN(`${board} ${turn} ${hand === '-' ? rest || '-' : hand + rest} 1`)!
      answer.forEach((u) => move(assigned, u))
      row.allUnassignedMaterialToDefender = {
        addedHand: rest || '-',
        answerMate: mate(assigned),
        legalDefenderReplies: legal(assigned).length,
        endpoint: assigned.sfen,
      }
    } else if (id === 'endgame-mate3') {
      const first = copy(start)
      move(first, ch.steps[1].moves![0])
      const replies = legal(first)
      row.sourceFirstCheckReplies = replies.length
      row.replies = replies.map((m) => {
        const q = copy(first)
        q.doMove(m)
        return {
          usi: formatMove(first, m),
          matingFinishes: legal(q)
            .filter((fin) => {
              const z = copy(q)
              z.doMove(fin)
              return mate(z)
            })
            .map((fin) => formatMove(q, fin)),
        }
      })
      row.noMateInOneAtStart = mates1 === 0
      const att = ch.side === 'sente' ? Color.BLACK : Color.WHITE
      row.forceMateInOne = force(copy(start), att, 1, new Map())
      row.forceMateInThree = force(copy(start), att, 2, new Map())
      const checkNodes: any[] = []
      const inspect = (n: any) => {
        const q = Position.newBySFEN(n.sfen)!
        if (q.checked && q.color !== att) {
          const required = new Set(legal(q).map((m) => m.usi))
          const represented = new Set(n.branches.map((b: any) => b.usi))
          checkNodes.push({
            sfen: n.sfen,
            legalReplies: required.size,
            missing: [...required].filter((u) => !represented.has(u)),
            extra: [...represented].filter((u) => !required.has(u)),
          })
        }
        n.branches.forEach((b: any) => inspect(b.child))
      }
      inspect(course.root)
      row.checkNodeCoverage = checkNodes
    } else {
      const att = ch.side === 'sente' ? Color.BLACK : Color.WHITE
      row.noMateInOneAtStart = mates1 === 0
      row.forceMateWithin3 = force(copy(start), att, 2, new Map())
      row.forceMateWithin5 = force(copy(start), att, 3, new Map())
      const first = copy(start)
      move(first, ch.steps[1].moves![0])
      row.firstCheckReplies = legal(first).map((m) => m.usi)
      const checkNodes: any[] = []
      const inspect = (n: any) => {
        const q = Position.newBySFEN(n.sfen)!
        if (q.checked && q.color !== att) {
          const required = new Set(legal(q).map((m) => m.usi))
          const represented = new Set(n.branches.map((b: any) => b.usi))
          checkNodes.push({
            sfen: n.sfen,
            legalReplies: required.size,
            missing: [...required].filter((u) => !represented.has(u)),
            extra: [...represented].filter((u) => !required.has(u)),
          })
        }
        n.branches.forEach((b: any) => inspect(b.child))
      }
      inspect(course.root)
      row.checkNodeCoverage = checkNodes
    }
    unitResult.chapters.push(row)
  }
  results.push(unitResult)
}
console.log(JSON.stringify({ stats, results }, null, 2))
const invalid = results.some(
  (unit) =>
    unit.physicalProblems.length ||
    unit.chapters.some(
      (chapter: any) =>
        chapter.sourceLeaves !== chapter.sourceMateLeaves ||
        chapter.checkNodeCoverage?.some((node: any) => node.missing.length || node.extra.length) ||
        (unit.id === 'endgame-mate1'
          ? !chapter.answerMate || !chapter.allUnassignedMaterialToDefender.answerMate
          : unit.id === 'endgame-mate3'
            ? chapter.forceMateInOne || !chapter.forceMateInThree
            : chapter.forceMateWithin3 || !chapter.forceMateWithin5),
    ),
)
if (invalid) throw new Error('Mating lesson proof failed')
