import { PieceType, Square, formatMove, unpromotedPieceType } from 'tsshogi'
import { PIECE_VALUE, pieceName } from './pieceValues'
import { squareName } from './notation'
import { positionOf } from './shogi'
import { coachingLine } from './coachingLine'
import { hasLegalMove } from './legalMoves'
import type { MoveReview } from './analysis'
import type { Candidate } from './engine'
import i18n from './i18n'

type CoachingContext = { review?: MoveReview | null; candidate?: Candidate | null }

export function moveCoaching(sfen: string, usi: string, context: CoachingContext = {}) {
  const before = positionOf(sfen)
  const move = before.createMoveByUSI(usi)
  if (!move || move.usi !== usi || !before.isValidMove(move)) return null
  const after = before.clone()
  if (!after.doMove(move)) return null
  const piece = after.board.at(move.to)!
  const square = squareName(move.to)
  const values = { piece: pieceName(piece.type), square, move: formatMove(before, move) }
  const captured = move.capturedPieceType
  const capture = captured ? i18n.t('coach.live.captureDetail', { captured: pieceName(captured), handPiece: pieceName(unpromotedPieceType(captured)) }) : ''
  const moves = [{ sfen, usi }]
  const candidate = context.candidate?.move === usi ? context.candidate : null
  const reply = context.review?.usi === usi ? context.review.reply : null
  const pv = candidate ? (candidate.pv[0] === usi ? candidate.pv.slice(1) : []) : reply ? (reply.pv[0] === reply.move ? reply.pv : [reply.move]) : []
  const line = coachingLine(after.sfen, pv)
  const consequence = line.find((step) => step.captured || step.givesCheck)
  const continuation = line.length
    ? [
        i18n.t('coach.live.continuation', { line: line.map((step) => step.text).join(' ') }),
        consequence?.captured
          ? i18n.t('coach.live.lineCapture', {
              move: consequence.text,
              captured: pieceName(consequence.captured),
              square: squareName(Square.newByUSI(consequence.to)!),
            })
          : consequence?.givesCheck
            ? i18n.t('coach.live.lineCheck', { move: consequence.text })
            : '',
      ]
        .filter(Boolean)
        .join(' ')
    : ''
  const describe = (feedback: { pattern: string; summary: string; detail: string }) => ({
    ...feedback,
    detail: [continuation, feedback.detail].filter(Boolean).join(' '),
    moves: [...moves, ...line.map(({ sfen, usi }) => ({ sfen, usi }))],
  })
  const replies = after
    .listAttackers(move.to)
    .filter((from) => after.board.at(from)?.color === after.color)
    .flatMap((from) => {
      const reply = after.createMove(from, move.to)
      if (!reply) return []
      const legal = [reply, reply.withPromote()].find((candidate) => after.isValidMove(candidate))
      if (!legal) return []
      moves.push({ sfen: after.sfen, usi: legal.usi })
      return [formatMove(after, legal)]
    })
  if (after.checked) {
    const king = after.board.findKing(after.color)!
    const mate = !hasLegalMove(after)
    const guards =
      mate && Math.abs(king.file - move.to.file) <= 1 && Math.abs(king.rank - move.to.rank) <= 1
        ? after.listAttackers(move.to).filter((from) => {
            if (after.board.at(from)?.color !== move.color) return false
            const probe = after.clone()
            probe.setColor(move.color)
            probe.board.remove(move.to)
            const defense = probe.createMove(from, move.to)
            return !!defense && [defense, defense.withPromote()].some((candidate) => probe.isValidMove(candidate))
          })
        : []
    const blocker = after.board
      .listSquaresByColor(after.color)
      .find((square) => !square.equals(king) && Math.abs(square.file - king.file) <= 1 && Math.abs(square.rank - king.rank) <= 1)
    return describe({
      pattern: mate ? 'mate' : 'check',
      summary: i18n.t(mate ? 'coach.live.checkmate' : 'coach.live.check', { ...values, kingSquare: squareName(king) }),
      detail: [
        capture,
        mate && guards.length
          ? i18n.t('coach.live.mateProtected', { ...values, guard: pieceName(after.board.at(guards[0])!.type), guardSquare: squareName(guards[0]) })
          : '',
        mate && blocker ? i18n.t('coach.live.mateBlocker', { piece: pieceName(after.board.at(blocker)!.type), square: squareName(blocker) }) : '',
        replies.length ? i18n.t('coach.live.checkCaptures', { replies: replies.join(i18n.t('moveFacts.sep')) }) : '',
      ]
        .filter(Boolean)
        .join(' '),
    })
  }
  if (before.checked)
    return describe({
      pattern: 'defense',
      summary: i18n.t(move.from instanceof Square ? 'coach.live.evades' : 'coach.live.block', values),
      detail: [capture, i18n.t('coach.live.checkRemoved')].filter(Boolean).join(' '),
    })
  if (replies.length)
    return describe({
      pattern: 'recapture',
      summary: i18n.t(captured ? 'coach.live.recapture' : 'coach.live.canBeCaptured', {
        ...values,
        captured: captured ? pieceName(captured) : '',
        replies: replies.join(i18n.t('moveFacts.sep')),
      }),
      detail: capture,
    })
  const from = move.from
  const attacking = after.clone()
  attacking.setColor(move.color)
  const targets = after.board
    .listNonEmptySquares()
    .filter((target) => {
      const occupant = after.board.at(target)!
      const attack = attacking.createMove(move.to, target)
      return (
        occupant.color !== move.color &&
        occupant.type !== PieceType.KING &&
        !!attack &&
        [attack, attack.withPromote()].some((candidate) => attacking.isValidMove(candidate)) &&
        (!(from instanceof Square) || !before.listAttackers(target).some((attacker) => attacker.equals(from)))
      )
    })
    .sort((a, b) => PIECE_VALUE[after.board.at(b)!.type] - PIECE_VALUE[after.board.at(a)!.type])
  if (targets.length) {
    const target = targets[0]
    const targetSquare = squareName(target)
    const control = i18n.t('coach.live.control', { ...values, target: pieceName(after.board.at(target)!.type), targetSquare })
    if (targets.length > 1)
      return describe({
        pattern: 'control',
        summary: i18n.t('coach.live.fork', {
          ...values,
          first: pieceName(after.board.at(target)!.type),
          firstSquare: targetSquare,
          second: pieceName(after.board.at(targets[1])!.type),
          secondSquare: squareName(targets[1]),
        }),
        detail: capture,
      })
    return describe(
      move.promote
        ? {
            pattern: 'promotion',
            summary: i18n.t('coach.live.promote', values),
            detail: [capture, control].filter(Boolean).join(' '),
          }
        : { pattern: 'control', summary: control, detail: capture },
    )
  }
  if (move.promote) return describe({ pattern: 'promotion', summary: i18n.t('coach.live.promote', values), detail: capture })
  const friendly = after.board
    .listSquaresByColor(move.color)
    .filter((target) => {
      const type = after.board.at(target)!.type
      return !target.equals(move.to) && type !== PieceType.KING && PIECE_VALUE[type] >= 3
    })
    .sort((a, b) => PIECE_VALUE[after.board.at(b)!.type] - PIECE_VALUE[after.board.at(a)!.type])
  for (const target of friendly) {
    if (!after.listAttackers(target).some((square) => square.equals(move.to))) continue
    const probe = attacking.clone()
    probe.board.remove(target)
    const defense = probe.createMove(move.to, target)
    if (!defense || ![defense, defense.withPromote()].some((candidate) => probe.isValidMove(candidate))) continue
    if (from instanceof Square && before.listAttackers(target).some((square) => square.equals(from))) continue
    return describe({
      pattern: 'control',
      summary: i18n.t('coach.live.defends', { ...values, target: pieceName(after.board.at(target)!.type), targetSquare: squareName(target) }),
      detail: capture,
    })
  }
  if (!(from instanceof Square))
    return describe({
      pattern: 'drop',
      summary: i18n.t('coach.live.drop', values),
      detail: i18n.t('coach.live.dropDetail', {
        ...values,
        before: before.hand(move.color).count(move.pieceType),
        after: after.hand(move.color).count(move.pieceType),
      }),
    })
  if (!captured && move.pieceType !== PieceType.KING) {
    const threatened = before.clone()
    threatened.setColor(after.color)
    const threats = threatened
      .listAttackers(from)
      .filter((square) => threatened.board.at(square)?.color === threatened.color)
      .flatMap((square) => {
        const capture = threatened.createMove(square, from)
        const legal = capture && [capture, capture.withPromote()].find((candidate) => threatened.isValidMove(candidate))
        return legal ? [formatMove(threatened, legal)] : []
      })
    if (threats.length)
      return describe({
        pattern: 'development',
        summary: i18n.t('coach.live.escapesCapture', { ...values, from: squareName(from), threats: threats.join(i18n.t('moveFacts.sep')) }),
        detail: [capture, i18n.t('coach.live.escapeDetail', values)].filter(Boolean).join(' '),
      })
  }
  if (!captured) {
    for (const target of after.board.listNonEmptySquares()) {
      if (after.board.at(target)!.color === move.color) continue
      const opened = after.listAttackers(target).find((square) => {
        const attacker = after.board.at(square)!
        if (
          attacker.color !== move.color ||
          square.equals(move.to) ||
          ![PieceType.BISHOP, PieceType.ROOK, PieceType.LANCE, PieceType.HORSE, PieceType.DRAGON].includes(attacker.type)
        )
          return false
        if (before.listAttackers(target).some((old) => old.equals(square))) return false
        const attack = attacking.createMove(square, target)
        return !!attack && [attack, attack.withPromote()].some((candidate) => attacking.isValidMove(candidate))
      })
      if (opened)
        return describe({
          pattern: 'development',
          summary: i18n.t('coach.live.opensLine', {
            ...values,
            openedPiece: pieceName(after.board.at(opened)!.type),
            from: squareName(opened),
            target: squareName(target),
          }),
          detail: i18n.t('coach.live.clearsSquare', { square: squareName(from) }),
        })
    }
    return describe({
      pattern: 'development',
      summary: i18n.t('coach.live.repositions', { ...values, from: squareName(from) }),
      detail: '',
    })
  }
  return captured
    ? describe({ pattern: 'capture', summary: i18n.t('coach.live.capture', { ...values, captured: pieceName(captured) }), detail: capture })
    : null
}
