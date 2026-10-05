import { Color, PieceType, Square, unpromotedPieceType, type ImmutablePosition } from 'tsshogi'
import { positionOf } from './shogi'

export type Detection = { name: string; color: Color; kind: 'castle' | 'technique'; squares: Square[]; ply: number; repeat: boolean; annotation: boolean }
export type DetectionEvent = { to: Square; from: Square | null; captured: boolean; ply: number }
const opposite = (color: Color) => (color === Color.BLACK ? Color.WHITE : Color.BLACK)
const base = unpromotedPieceType
const major = (type: PieceType) => [PieceType.ROOK, PieceType.BISHOP].includes(base(type))
const strong = (type: PieceType) => ![PieceType.PAWN, PieceType.LANCE, PieceType.KNIGHT].includes(type)
const ownerSquares = (position: ImmutablePosition, color: Color) => position.board.listNonEmptySquares().filter((at) => position.board.at(at)!.color === color)
const distance = (a: Square, b: Square) => Math.max(Math.abs(a.file - b.file), Math.abs(a.rank - b.rank))
const names: Partial<Record<PieceType, string>> = { [PieceType.ROOK]: '飛車', [PieceType.BISHOP]: '角', [PieceType.DRAGON]: '龍', [PieceType.HORSE]: '馬' }

export function detectCustom(
  position: ImmutablePosition,
  color: Color,
  event: DetectionEvent | undefined,
  sfens: string[],
  moves: string[],
  opening: boolean,
  hirate: boolean,
  generalPreset: boolean,
  known: string[],
): Detection[] {
  const found: Detection[] = []
  const add = (
    name: string,
    kind: Detection['kind'] = 'technique',
    target = color,
    squares: Square[] = [],
    ply = event?.ply ?? 0,
    repeat = true,
    annotation = true,
  ) => found.push({ name, kind, color: target, squares, ply, repeat, annotation })
  const owned = ownerSquares(position, color)
  const kings = owned.filter((at) => position.board.at(at)!.type === PieceType.KING)
  const king = kings[0]
  const onlyKing = kings.length === 1
  const moved = event && position.board.at(event.to)
  if (onlyKing && king && [1, 9].includes(king.file)) {
    const home = color === Color.BLACK ? 9 : 1
    const nearby = owned.filter(
      (at) =>
        distance(at, king) <= 2 &&
        !at.equals(king) &&
        strong(position.board.at(at)!.type) &&
        ![PieceType.ROOK, PieceType.BISHOP].includes(position.board.at(at)!.type),
    )
    if (king.rank === home && (!event || (moved && (king.equals(event.to) || nearby.some((at) => at.equals(event.to)))))) {
      add('穴熊', 'castle', color, [king, ...nearby], event?.ply ?? 0, false, false)
      add(known.includes('振り飛車') ? '振り飛車穴熊' : '居飛車穴熊', 'castle', color, [king, ...nearby], event?.ply ?? 0, false)
      const countNames = ['裸', '一枚', '二枚', '三枚', '四枚', '五枚', '六枚', '七枚', '八枚']
      if (countNames[nearby.length]) add(`${countNames[nearby.length]}穴熊`, 'castle', color, [king, ...nearby])
      if (event && !event.from && moved && [PieceType.GOLD, PieceType.SILVER].includes(base(moved.type))) add('穴熊再生')
      if (opening && known.includes('角換わり')) add('角換わり穴熊', 'castle', color, [king, ...nearby], event?.ply ?? 0, false)
    }
    const close = owned.filter(
      (at) => !at.equals(king) && distance(at, king) <= 1 && strong(position.board.at(at)!.type) && position.board.at(at)!.type !== PieceType.SILVER,
    )
    if (
      king.rank === 10 - home &&
      close.length >= 3 &&
      (!event || (moved && strong(moved.type) && moved.type !== PieceType.SILVER && distance(event.to, king) <= 1))
    )
      add('入玉穴熊', 'castle', color, [king, ...close], event?.ply ?? 0, false)
  }
  if (hirate && onlyKing && king && king.file > 1 && king.file < 9 && king.rank > 1 && king.rank < 9) {
    const ring = ownerSquares(position, Color.BLACK).filter((at) => distance(at, king) === 1 && position.board.at(at)!.type !== PieceType.PAWN)
    if (ring.length === 8) add('魔方陣', 'castle', color, [king, ...ring])
  }
  if (!event || !moved) return found
  if (Array.from({ length: 9 }, (_, i) => position.board.at(new Square(event.to.file, i + 1))).every(Boolean)) add('駒柱')
  const previous = positionOf(sfens[event.ply - 1])
  const captured = previous.board.at(event.to)
  const previousPosition = event.ply >= 2 ? positionOf(sfens[event.ply - 2]) : null
  const previousMove = previousPosition?.createMoveByUSI(moves[event.ply - 2])
  const previousCapture = previousMove && previousPosition?.board.at(previousMove.to)
  const previousOrigin = previousMove?.from instanceof Square ? previousPosition?.board.at(previousMove.from) : null
  if (
    moved.type === PieceType.PROM_KNIGHT &&
    event.from &&
    previous.board.at(event.from)?.type === PieceType.KNIGHT &&
    (!captured || captured.type === PieceType.PAWN) &&
    previousOrigin?.type === PieceType.GOLD &&
    previousMove?.from instanceof Square &&
    event.ply >= 3
  ) {
    const before = positionOf(sfens[event.ply - 3]),
      knight = before.createMoveByUSI(moves[event.ply - 3])
    const knightPiece = knight && positionOf(sfens[event.ply - 2]).board.at(knight.to)
    const sign = color === Color.BLACK ? -1 : 1
    if (
      knight &&
      knightPiece?.type === PieceType.KNIGHT &&
      Math.abs(knight.to.file - previousMove.from.file) === 1 &&
      previousMove.from.rank === knight.to.rank + sign * 2
    ) {
      const obstruction = position.board.at(new Square(knight.to.file, previousMove.from.rank))
      if (obstruction?.color === opposite(color) && [PieceType.BISHOP, PieceType.SILVER, PieceType.KNIGHT, PieceType.PAWN].includes(obstruction.type))
        add('技ありの桂', 'technique', color, [], event.ply - 2)
    }
  }
  if (captured) {
    if (
      opening &&
      base(captured.type) === PieceType.BISHOP &&
      previousOrigin &&
      base(previousOrigin.type) === PieceType.BISHOP &&
      previousCapture &&
      base(previousCapture.type) === PieceType.BISHOP
    ) {
      add('角交換')
      add('手得')
      add('角交換', 'technique', opposite(color), [], event.ply - 1)
      add('手損', 'technique', opposite(color), [], event.ply - 1)
    }
    if (major(captured.type) && previousMove && previousOrigin && previousCapture) {
      if (previousMove.to.equals(event.to) && [PieceType.GOLD, PieceType.SILVER].includes(base(previousCapture.type)))
        add(`${names[previousOrigin.type]?.replace('龍', '竜')}切り`, 'technique', opposite(color), [], event.ply - 1)
      const ownHand = position.hand(color).counts.filter(({ type, count }) => type !== PieceType.PAWN && count)
      const otherHand = position.hand(opposite(color)).counts.filter(({ type, count }) => type !== PieceType.PAWN && count)
      if (
        hirate &&
        base(previousOrigin.type) === base(captured.type) &&
        major(previousCapture.type) &&
        base(previousCapture.type) !== base(captured.type) &&
        ownHand.length === 1 &&
        ownHand[0].count === 1 &&
        ownHand[0].type === base(captured.type) &&
        otherHand.length === 1 &&
        otherHand[0].count === 1 &&
        otherHand[0].type === base(previousCapture.type)
      ) {
        add(base(captured.type) === PieceType.ROOK ? '序盤は角より飛車' : '序盤は飛車より角')
        add(base(captured.type) === PieceType.ROOK ? '序盤は飛車より角' : '序盤は角より飛車', 'technique', opposite(color), [], event.ply - 1)
      }
      const dropPosition = event.ply >= 3 ? positionOf(sfens[event.ply - 3]) : null
      const drop = dropPosition?.createMoveByUSI(moves[event.ply - 3])
      if (
        drop &&
        !(drop.from instanceof Square) &&
        major(drop.from) &&
        drop.to.equals(event.to) &&
        previousMove.to.equals(event.to) &&
        major(previousOrigin.type) &&
        major(previousCapture.type) &&
        previousCapture.type === base(previousCapture.type)
      )
        add(`${names[previousOrigin.type]}には${names[drop.from]}`, 'technique', color, [], event.ply - 2)
    }
    const enemy = ownerSquares(position, opposite(color))
    if (generalPreset) {
      const count = (types: PieceType[]) =>
        owned.filter((at) => types.includes(base(position.board.at(at)!.type))).length + types.reduce((n, type) => n + position.hand(color).count(type), 0)
      if (enemy.length === 1 && position.hand(opposite(color)).counts.every(({ count }) => !count)) add('全駒')
      if ([PieceType.GOLD, PieceType.SILVER].includes(base(captured.type)) && count([PieceType.GOLD, PieceType.SILVER]) === 8) add('金銀コンプリート')
      if (major(captured.type) && count([PieceType.ROOK, PieceType.BISHOP]) === 4) add('大駒コンプリート')
      if (base(captured.type) === PieceType.PAWN && count([PieceType.PAWN]) >= 18) add('ポーンハンター')
      if (base(captured.type) === PieceType.KNIGHT && position.hand(color).count(PieceType.KNIGHT) === 3) add('三桂懐刃')
      if (base(captured.type) === PieceType.LANCE && position.hand(color).count(PieceType.LANCE) === 4) add('封香連舞')
    }
    const otherKing = enemy.find((at) => position.board.at(at)!.type === PieceType.KING)
    if (
      !known.includes('玉頭戦') &&
      king &&
      otherKing &&
      Math.abs(king.file - otherKing.file) <= 1 &&
      king.rank !== (color === Color.BLACK ? 9 : 1) &&
      otherKing.rank !== (color === Color.BLACK ? 1 : 9) &&
      Math.abs(king.rank - otherKing.rank) <= 4 &&
      event.to.file >= Math.min(king.file, otherKing.file) &&
      event.to.file <= Math.max(king.file, otherKing.file) &&
      event.to.rank >= (color === Color.BLACK ? otherKing.rank : king.rank) &&
      event.to.rank <= (color === Color.BLACK ? king.rank : otherKing.rank)
    ) {
      const shielded = [king, otherKing].some((at) => {
        const owner = position.board.at(at)!.color
        const ahead = position.board.at(new Square(at.file, at.rank + (owner === Color.BLACK ? -1 : 1)))
        return ahead?.color === owner && ahead.type === PieceType.PAWN
      })
      if (!shielded) add('玉頭戦', 'technique', color, [], event.ply, false)
    }
  }
  if (base(moved.type) === PieceType.ROOK || (moved.type === PieceType.LANCE && !event.from)) {
    const top = color === Color.BLACK ? 1 : 9
    let count = event.to.rank === top ? 0 : 1
    for (const step of [-1, 1])
      for (let rank = event.to.rank + step; rank > 0 && rank < 10 && rank !== top; rank += step) {
        const piece = position.board.at(new Square(event.to.file, rank))
        if (!piece) continue
        if (piece.color !== color || !(base(piece.type) === PieceType.ROOK || piece.type === PieceType.LANCE)) break
        count++
      }
    if (count >= 2) {
      add('ロケット', 'technique', color, [], event.ply, false, false)
      if (count <= 6) add(`${count}段ロケット`)
    }
  }
  if (onlyKing && king && moved.type === PieceType.HORSE && event.from && (color === Color.BLACK ? king.rank > 3 : king.rank < 7)) {
    const near = (at: Square) => Math.abs(at.file - king.file) + Math.abs(at.rank - king.rank) <= 2
    if (near(event.to) && !near(event.from)) {
      const horses = owned.filter((at) => !at.equals(event.to) && position.board.at(at)!.type === PieceType.HORSE)
      const order = (at: Square) => {
        for (let ply = event.ply - 1; ply > 0; ply--) {
          const before = positionOf(sfens[ply - 1]),
            move = before.createMoveByUSI(moves[ply - 1])
          if (move?.to.equals(at)) return 81 + ply
        }
        return (at.rank - 1) * 9 + 9 - at.file
      }
      const other = horses.sort((a, b) => order(a) - order(b))[0]
      add(other && near(other) ? '双馬結界' : '守りの馬', 'technique', color, [], event.ply, !(other && near(other)))
    }
  }
  if (major(moved.type)) {
    const diagonal = base(moved.type) === PieceType.BISHOP
    const vectors = diagonal
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ]
    const targets: Square[] = []
    let kingFound = false,
      pinned = false
    for (const [dx, dy] of vectors) {
      let targetFound = false
      for (let file = event.to.file + dx, rank = event.to.rank + dy; file > 0 && file < 10 && rank > 0 && rank < 10; file += dx, rank += dy) {
        const at = new Square(file, rank),
          piece = position.board.at(at)
        if (!piece) continue
        if (piece.color === color) break
        if (piece.type === PieceType.KING) {
          if (targetFound) pinned = true
          else kingFound = true
          break
        }
        if (!targetFound && base(piece.type) === (diagonal ? PieceType.ROOK : PieceType.BISHOP)) {
          targets.push(at)
          targetFound = true
          continue
        }
        break
      }
    }
    if (kingFound && targets.length) add(diagonal ? '王手飛車' : '王手角')
    else if (pinned) add(diagonal ? '準王手飛車' : '準王手角')
    else if (targets.length > 1) {
      add('両取り')
      add(diagonal ? '角による両取り' : '飛車による両取り')
    }
  }
  return found
}
