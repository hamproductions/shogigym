import { readFileSync, writeFileSync } from 'node:fs'
import { Position, Square, Color, handPieceTypes, unpromotedPieceType, formatMove } from 'tsshogi'

const load = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'))
const games = load('games.json')
const facts = load('facts.json')
let assertions = 0
let replayedPlies = 0
const terminalChecks = []
const allSquares = Array.from({ length: 81 }, (_, i) => new Square((i % 9) + 1, Math.floor(i / 9) + 1))
const legalReplies = (p) => {
  const result = new Set()
  const froms = [...p.board.listNonEmptySquares(), ...handPieceTypes.filter((t) => p.hand(p.color).count(t))]
  for (const from of froms)
    for (const to of allSquares) {
      const m = p.createMove(from, to)
      if (!m) continue
      for (const candidate of [m, m.withPromote()]) if (p.isValidMove(candidate)) result.add(candidate.usi)
    }
  return [...result]
}
const check = (condition, message) => {
  assertions++
  if (!condition) throw new Error(message)
}
const position = (sfen) => {
  const p = Position.newBySFEN(sfen)
  check(p !== null, 'SFEN parse')
  return p
}
const replayLine = (sfen, line) => {
  const p = position(sfen)
  for (const usi of line) {
    const m = p.createMoveByUSI(usi)
    check(m !== null && p.isValidMove(m), `Illegal line move ${usi}`)
    check(p.doMove(m), `Rejected line move ${usi}`)
    replayedPlies++
  }
  return p
}
const inventory = (p, color) => {
  const counts = {}
  for (const square of p.board.listNonEmptySquares()) {
    const piece = p.board.at(square)
    if (piece.color === color) {
      const base = unpromotedPieceType(piece.type)
      counts[base] = (counts[base] || 0) + 1
    }
  }
  for (const t of handPieceTypes) counts[t] = (counts[t] || 0) + p.hand(color).count(t)
  return counts
}
const sameCounts = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].every((k) => (a[k] || 0) === (b[k] || 0))
for (const game of games) {
  let p = position(game.start)
  for (const event of game.moves) {
    check(p.sfen === event.sfenBefore, `${game.id} before ply ${event.ply}`)
    check(p.color === event.mover, 'mover')
    const m = p.createMoveByUSI(event.usi)
    check(m && p.isValidMove(m), 'actual legality')
    check(formatMove(p, m) === event.notationJa, 'notation')
    check(m.capturedPieceType === event.captured, 'capture')
    check(m.promote === event.promotion, 'promotion')
    check(!(m.from instanceof Square) === event.drop, 'drop')
    for (const c of event.generationAnalysis.candidates) replayLine(p.sfen, c.pv)
    check(p.doMove(m), 'actual replay')
    replayedPlies++
    check(p.sfen === event.sfenAfter, 'after SFEN')
    check(p.checked === event.givesCheck, 'check flag')
  }
  check(p.sfen === game.finalSfen, 'final SFEN')
  if (game.termination.startsWith('checkmate')) {
    const replies = legalReplies(p)
    check(p.checked && replies.length === 0, 'terminal checkmate')
    terminalChecks.push({ gameId: game.id, checked: p.checked, legalReplies: replies.length })
  }
}
for (const fact of facts) {
  const g = games.find((g) => g.id === fact.gameId)
  const event = g.moves[fact.ply - 1]
  check(event.usi === fact.usi && event.sfenBefore === fact.sfenBefore && event.sfenAfter === fact.sfenAfter, 'fact provenance')
  for (const when of ['before', 'after']) {
    const p = position(when === 'before' ? fact.sfenBefore : fact.sfenAfter)
    check(p.color === fact[when].sideToMove && p.checked === fact[when].checked, 'snapshot status')
    for (const color of [Color.BLACK, Color.WHITE]) {
      check(sameCounts(inventory(p, color), fact[when].sides[color].totalUnpromotedInventory), 'inventory')
      for (const t of handPieceTypes) check(p.hand(color).count(t) === fact[when].sides[color].hands[t], 'hand')
    }
    const geometry = when === 'before' ? fact.geometricallyAttackedUndefendedBefore : fact.geometricallyAttackedUndefendedAfter
    for (const relation of geometry) {
      const square = Square.newByUSI(relation.square)
      const piece = p.board.at(square)
      check(piece && piece.type === relation.piece && piece.color === relation.color, 'geometric target')
      const attackers = p.listAttackers(square)
      check(
        attackers.some((s) => p.board.at(s).color !== piece.color),
        'geometric attacker',
      )
      check(!attackers.some((s) => p.board.at(s).color === piece.color), 'geometric undefended')
    }
    if (fact.movedSliderControl) {
      const from = when === 'before' ? fact.movedSliderControl.beforeFrom : fact.movedSliderControl.afterFrom
      const saved = when === 'before' ? fact.movedSliderControl.beforeSquares : fact.movedSliderControl.afterSquares
      const squares = Array.from({ length: 81 }, (_, i) => new Square((i % 9) + 1, Math.floor(i / 9) + 1))
      for (const to of squares) check(saved.includes(to.usi) === (from !== null && p.listAttackers(to).some((s) => s.usi === from)), 'slider control relation')
    }
    const witnesses = when === 'before' ? fact.legalCapturesBeforeForSideToMove : fact.legalCapturesAfterForSideToMove
    for (const witness of witnesses) {
      const m = p.createMoveByUSI(witness.usi)
      check(m && p.isValidMove(m) && m.capturedPieceType === witness.captured, 'legal capture witness')
      check(formatMove(p, m) === witness.notationJa, 'capture witness notation')
    }
    for (const c of fact.review[when].candidates) replayLine(p.sfen, c.pv)
    const score = fact.review[when].finalBestmoveCandidate?.score ?? fact.review[when].candidates.find((c) => c.pv[0] === fact.review[when].bestmove)?.score
    const normalized = fact.review[when === 'before' ? 'beforeFinalBestScoreFromActualMover' : 'afterFinalBestScoreFromActualMover']
    if (score) check(normalized && normalized.value === score.value * (when === 'before' ? 1 : -1), 'score perspective')
  }
}
const result = {
  terminalChecks,
  games: games.length,
  positions: facts.length,
  plies: games.reduce((n, g) => n + g.moves.length, 0),
  assertions,
  replayedPlies,
  result: 'pass',
  scope:
    'Independent second replay of saved games and every recorded PV; selected event provenance, notation, capture, promotion, drop, check, inventories, hands, capture witnesses and score sign independently checked. Does not certify semantic coaching claims or engine strength.',
}
writeFileSync(new URL('verification.json', import.meta.url), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
