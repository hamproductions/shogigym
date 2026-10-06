import { Color, type Move, PieceType, Position, Square, formatMove, type ImmutablePosition } from 'tsshogi'

export type Side = 'sente' | 'gote'

export const sideColor = (side: Side) => (side === 'sente' ? Color.BLACK : Color.WHITE)
export const otherSide = (side: Side): Side => (side === 'sente' ? 'gote' : 'sente')
export const colorSide = (color: Color): Side => (color === Color.BLACK ? 'sente' : 'gote')

export function positionOf(sfen: string): Position {
  const position = Position.newBySFEN(sfen)
  if (!position) throw new Error(`invalid sfen: ${sfen}`)
  return position
}

export function moveText(sfen: string, usi: string, lastUsi?: string): string {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return usi
  const text = formatMove(position, move)
  return lastUsi && lastUsi.slice(2, 4) === usi.slice(2, 4) ? `${text.slice(0, 1)}同${text.slice(3)}` : text
}

export function pvText(sfen: string, pv: string[], limit = 8): string {
  const position = positionOf(sfen)
  const out: string[] = []
  let last = ''
  for (const usi of pv.slice(0, limit)) {
    const move = position.createMoveByUSI(usi)
    if (!move || !position.isValidMove(move)) break
    const text = formatMove(position, move)
    out.push(last && last.slice(2, 4) === usi.slice(2, 4) ? `${text.slice(0, 1)}同${text.slice(3)}` : text)
    position.doMove(move)
    last = usi
  }
  return out.join(' ')
}

export function applyUsi(sfen: string, usi: string): string | null {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move || !position.doMove(move)) return null
  return position.sfen
}

export function samePosition(a: string, b: string): boolean {
  return a.split(' ').slice(0, 3).join(' ') === b.split(' ').slice(0, 3).join(' ')
}

export function legalTargets(position: ImmutablePosition, from: Square | PieceType): Square[] {
  const targets: Square[] = []
  for (let file = 1; file <= 9; file++) {
    for (let rank = 1; rank <= 9; rank++) {
      const to = new Square(file, rank)
      const move = position.createMove(from, to)
      if (move && (position.isValidMove(move) || position.isValidMove(move.withPromote()))) targets.push(to)
    }
  }
  return targets
}

export function promotionOptions(position: ImmutablePosition, from: Square | PieceType, to: Square): Move[] {
  const move = position.createMove(from, to)
  if (!move) return []
  return [move.withPromote(), move].filter((m, i, all) => position.isValidMove(m) && all.findIndex((x) => x.usi === m.usi) === i)
}

export const PIECE_CHAR: Record<PieceType, string> = {
  [PieceType.PAWN]: '歩',
  [PieceType.LANCE]: '香',
  [PieceType.KNIGHT]: '桂',
  [PieceType.SILVER]: '銀',
  [PieceType.GOLD]: '金',
  [PieceType.BISHOP]: '角',
  [PieceType.ROOK]: '飛',
  [PieceType.KING]: '玉',
  [PieceType.PROM_PAWN]: 'と',
  [PieceType.PROM_LANCE]: '杏',
  [PieceType.PROM_KNIGHT]: '圭',
  [PieceType.PROM_SILVER]: '全',
  [PieceType.HORSE]: '馬',
  [PieceType.DRAGON]: '龍',
}

export const HAND_ORDER = [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT, PieceType.LANCE, PieceType.PAWN]

export function hasLegalMove(position: ImmutablePosition): boolean {
  const hand = position.hand(position.color)
  const sources: (Square | PieceType)[] = [
    ...position.board.listNonEmptySquares().filter((s) => position.board.at(s)!.color === position.color),
    ...HAND_ORDER.filter((t) => hand.count(t) > 0),
  ]
  return sources.some((from) => legalTargets(position, from).length > 0)
}

export function reachable(sfen: string, square: Square): Square[] {
  const position = positionOf(sfen)
  const piece = position.board.at(square)
  if (!piece) return []
  position.setColor(piece.color)
  return legalTargets(position, square)
}

export function kingSquare(sfen: string, color: Color): Square | null {
  const position = positionOf(sfen)
  return (
    position.board.listNonEmptySquares().find((s) => {
      const p = position.board.at(s)!
      return p.color === color && p.type === PieceType.KING
    }) ?? null
  )
}
