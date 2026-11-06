import { MoveType, Square, movableDirections, resolveMoveType, type Position } from 'tsshogi'

export function hasLegalMove(position: Position): boolean {
  for (const from of position.board.listSquaresByColor(position.color)) {
    const piece = position.board.at(from)!
    for (const direction of movableDirections(piece)) {
      let to = from.neighbor(direction)
      while (to.valid) {
        const occupant = position.board.at(to)
        if (occupant?.color === position.color) break
        const move = position.createMove(from, to)
        if (move && (position.isValidMove(move) || (piece.isPromotable() && position.isValidMove(move.withPromote())))) return true
        if (occupant || resolveMoveType(piece, direction) !== MoveType.LONG) break
        to = to.neighbor(direction)
      }
    }
  }
  for (const hand of position.hand(position.color).counts) {
    if (!hand.count) continue
    for (const to of Square.all) {
      if (position.board.at(to)) continue
      const move = position.createMove(hand.type, to)
      if (move && position.isValidMove(move)) return true
    }
  }
  return false
}
