import { Color, PieceType, Square, type Position } from 'tsshogi'

export function pawnCapturesOfNonPawns(position: Position) {
  const captures: { usi: string; target: PieceType }[] = []
  for (const from of position.board.listSquaresByColor(position.color)) {
    if (position.board.at(from)?.type !== PieceType.PAWN) continue
    const to = new Square(from.file, from.rank + (position.color === Color.BLACK ? -1 : 1))
    if (!to.valid) continue
    const target = position.board.at(to)
    if (!target || target.color === position.color || target.type === PieceType.PAWN || target.type === PieceType.KING) continue
    const capture = position.createMove(from, to)
    if (!capture) continue
    const move = [capture, capture.withPromote()].find((candidate) => position.isValidMove(candidate))
    if (move) captures.push({ usi: move.usi, target: target.type })
  }
  return captures
}

export function unrecapturedMajorCaptures(position: Position): string[] {
  const captures: string[] = []
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    if (piece.color === position.color || ![PieceType.ROOK, PieceType.BISHOP, PieceType.HORSE, PieceType.DRAGON].includes(piece.type)) continue
    for (const from of position.listAttackers(square)) {
      if (position.board.at(from)?.color !== position.color) continue
      const capture = position.createMove(from, square)
      if (!capture) continue
      for (const move of [capture, capture.withPromote()]) {
        if (!position.isValidMove(move)) continue
        const after = position.clone()
        if (!after.doMove(move)) continue
        const recaptured = after.listAttackers(square).some((origin) => {
          if (after.board.at(origin)?.color !== after.color) return false
          const reply = after.createMove(origin, square)
          return reply && [reply, reply.withPromote()].some((candidate) => after.isValidMove(candidate))
        })
        if (!recaptured) {
          captures.push(move.usi)
          break
        }
      }
    }
  }
  return captures
}
