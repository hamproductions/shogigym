import { PieceType, Square, formatMove, unpromotedPieceType } from 'tsshogi'
import { PIECE_VALUE, pieceName } from './pieceValues'
import { positionOf } from './shogi'
import i18n from './i18n'

export function moveCoaching(sfen: string, usi: string, language = i18n.language) {
  const before = positionOf(sfen)
  const move = before.createMoveByUSI(usi)
  if (!move || !before.isValidMove(move)) return null
  const after = before.clone()
  if (!after.doMove(move)) return null
  const piece = after.board.at(move.to)!
  const square = language === 'ja' ? `${move.to.file}${'一二三四五六七八九'[move.to.rank - 1]}` : move.to.usi
  const values = { piece: pieceName(piece.type), square, move: formatMove(before, move) }
  const captured = move.capturedPieceType
  const capture = captured ? i18n.t('coach.live.captureDetail', { captured: pieceName(captured), handPiece: pieceName(unpromotedPieceType(captured)) }) : ''
  const moves = [{ sfen, usi }]
  const describe = (feedback: { pattern: string; summary: string; detail: string }) => ({ ...feedback, moves })
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
  if (before.checked && !(move.from instanceof Square))
    return describe({ pattern: 'defense', summary: i18n.t('coach.live.block', values), detail: i18n.t('coach.live.blockDetail', values) })
  if (replies.length)
    return describe({
      pattern: 'recapture',
      summary: i18n.t(captured ? 'coach.live.recapture' : 'coach.live.canBeCaptured', {
        ...values,
        captured: captured ? pieceName(captured) : '',
        replies: replies.join(i18n.t('moveFacts.sep')),
      }),
      detail: [capture, i18n.t('coach.live.replyDetail')].filter(Boolean).join(' '),
    })
  if (!(move.from instanceof Square))
    return describe({
      pattern: 'drop',
      summary: i18n.t('coach.live.drop', values),
      detail: i18n.t('coach.live.dropDetail', {
        ...values,
        before: before.hand(move.color).count(move.pieceType),
        after: after.hand(move.color).count(move.pieceType),
      }),
    })
  const from = move.from
  const targets = after.board
    .listNonEmptySquares()
    .filter((target) => {
      const occupant = after.board.at(target)!
      return (
        occupant.color !== move.color &&
        occupant.type !== PieceType.KING &&
        after.listAttackers(target).some((attacker) => attacker.equals(move.to)) &&
        !before.listAttackers(target).some((attacker) => attacker.equals(from))
      )
    })
    .sort((a, b) => PIECE_VALUE[after.board.at(b)!.type] - PIECE_VALUE[after.board.at(a)!.type])
  if (targets.length) {
    const target = targets[0]
    const targetSquare = language === 'ja' ? `${target.file}${'一二三四五六七八九'[target.rank - 1]}` : target.usi
    const control = i18n.t('coach.live.control', { ...values, target: pieceName(after.board.at(target)!.type), targetSquare })
    return describe(
      move.promote
        ? {
            pattern: 'promotion',
            summary: i18n.t('coach.live.promote', values),
            detail: [capture, control, i18n.t('coach.live.controlDetail')].filter(Boolean).join(' '),
          }
        : { pattern: 'control', summary: control, detail: [capture, i18n.t('coach.live.controlDetail')].filter(Boolean).join(' ') },
    )
  }
  if (move.promote)
    return describe({ pattern: 'promotion', summary: i18n.t('coach.live.promote', values), detail: capture || i18n.t('coach.live.promotionDetail') })
  return captured
    ? describe({ pattern: 'capture', summary: i18n.t('coach.live.capture', { ...values, captured: pieceName(captured) }), detail: capture })
    : null
}
