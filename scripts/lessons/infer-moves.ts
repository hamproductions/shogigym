import { Color, Position, Square, handPieceTypes } from 'tsshogi'

const SQUARES = Array.from({ length: 81 }, (_, i) => Square.newByUSI(`${(i % 9) + 1}${'abcdefghi'[Math.floor(i / 9)]}`)!)
const placement = (sfen: string) => sfen.split(' ')[0]
const hands = (sfen: string) => sfen.split(' ')[2]

function differing(a: Position, b: Position) {
  return SQUARES.filter((square) => {
    const x = a.board.at(square)
    const y = b.board.at(square)
    return x?.sfen !== y?.sfen
  })
}

function candidates(position: Position, targets: Square[]) {
  const usis: string[] = []
  for (const to of targets) {
    const here = position.board.at(to)
    if (here && here.color === position.color) continue
    for (const from of position.listAttackers(to)) {
      if (position.board.at(from)?.color !== position.color) continue
      for (const promote of ['', '+']) usis.push(`${from.usi}${to.usi}${promote}`)
    }
    if (!here)
      for (const type of handPieceTypes)
        if (position.hand(position.color).count(type)) usis.push(`${'PLNSGBR'['pawn lance knight silver gold bishop rook'.split(' ').indexOf(type)]}*${to.usi}`)
  }
  return usis
}

export function inferMoves(from: string, to: string, compareHands: boolean, maxDepth = 6): string[][] {
  const target = Position.newBySFEN(to)
  const start = Position.newBySFEN(from)
  if (!target || !start) return []
  const goal = (position: Position) => placement(position.sfen) === placement(target.sfen) && (!compareHands || hands(position.sfen) === hands(target.sfen))
  const changed = differing(start, target)
  if (!changed.length || changed.length > 2 * maxDepth) return []
  for (let depth = 1; depth <= maxDepth; depth++) {
    const found: string[][] = []
    const search = (position: Position, line: string[]) => {
      if (found.length > 8) return
      if (line.length === depth) {
        if (goal(position)) found.push([...line])
        return
      }
      const remaining = differing(position, target)
      if (remaining.length > 2 * (depth - line.length)) return
      const touched = new Set(
        [
          ...changed,
          ...line
            .flatMap((usi) => [usi.slice(0, 2), usi.slice(2, 4)])
            .map((usi) => Square.newByUSI(usi))
            .filter((s): s is Square => !!s),
        ].map((s) => s.usi),
      )
      for (const usi of new Set(
        candidates(
          position,
          [...touched].map((s) => Square.newByUSI(s)!),
        ),
      )) {
        const move = position.createMoveByUSI(usi)
        if (!move || !position.isValidMove(move)) continue
        const next = position.clone()
        if (!next.doMove(move) || next.board.isChecked(position.color)) continue
        search(next, [...line, usi])
      }
    }
    search(start, [])
    if (found.length) return found
  }
  return []
}

export const turnOf = (sfen: string) => (Position.newBySFEN(sfen)?.color === Color.BLACK ? 'b' : 'w')
