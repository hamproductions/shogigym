import { Color, PieceType, Position, Square, unpromotedPieceType, type ImmutablePosition, type Piece } from 'tsshogi'

type Vector = readonly [number, number]
export interface MotionEvent {
  to: Square
  from: Square | null
  ply: number
  capturedType?: PieceType
  joban: boolean
  hirateLike: boolean
  generalPreset: boolean
  usedCounts: Partial<Record<PieceType, number>>
}
const front: Vector[] = [
  [0, -1],
  [-1, -1],
  [1, -1],
]
const diagonal: Vector[] = [
  [-1, -1],
  [1, -1],
]
const backDiagonal: Vector[] = [
  [-1, 1],
  [1, 1],
]
const knight: Vector[] = [
  [-1, -2],
  [1, -2],
]
const backKnight: Vector[] = [
  [-1, 2],
  [1, 2],
]
const lateral: Vector[] = [
  [-1, 0],
  [1, 0],
]
const outer: Vector[] = [[0, -1], [1, 0], [0, 1], [-1, 0], ...diagonal, ...backDiagonal]
const weight: Record<PieceType, number> = {
  pawn: 100,
  lance: 600,
  knight: 700,
  silver: 1000,
  gold: 1200,
  bishop: 1800,
  rook: 2000,
  king: 40000,
  promPawn: 1200,
  promLance: 1200,
  promKnight: 1200,
  promSilver: 1200,
  horse: 2000,
  dragon: 2200,
}
const forward = (piece: Piece) => piece.type !== unpromotedPieceType(piece.type) || ![PieceType.BISHOP, PieceType.KNIGHT].includes(piece.type)
const distance = (a: Square, b: Square) => Math.max(Math.abs(a.file - b.file), Math.abs(a.rank - b.rank))

export function detectMotion(
  position: ImmutablePosition,
  previous: ImmutablePosition,
  color: Color,
  event: MotionEvent,
  history: { sfens: string[]; moves: string[] },
  tags: string[],
): string[] {
  const soldier = position.board.at(event.to)
  if (!soldier || soldier.color !== color) return []
  const origin = event.from ? previous.board.at(event.from) : null
  const sign = color === Color.BLACK ? 1 : -1
  const opposite = color === Color.BLACK ? Color.WHITE : Color.BLACK
  const at = event.to
  const row = (square: Square) => (color === Color.BLACK ? square.rank - 1 : 9 - square.rank)
  const file = (square: Square) => (color === Color.BLACK ? square.file : 10 - square.file)
  const edge = (square: Square) => Math.min(square.file - 1, 9 - square.file)
  const base = unpromotedPieceType(soldier.type)
  const promoted = base !== soldier.type
  const drop = !event.from
  const result: string[] = []
  const offset = (square: Square, [x, y]: Vector, owner = color, steps = 1) => {
    const direction = owner === Color.BLACK ? 1 : -1
    const target = square.neighbor(x * direction * steps, y * direction * steps)
    return target.valid ? target : null
  }
  const pieceAt = (square: Square | null) => (square ? position.board.at(square) : null)
  const relative = (vector: Vector, square = at) => pieceAt(offset(square, vector))
  const empty = (vector: Vector, square = at) => {
    const target = offset(square, vector)
    return !!target && !position.board.at(target)
  }
  const is = (vector: Vector, type: PieceType, owner = opposite, square = at) => {
    const piece = relative(vector, square)
    return piece?.color === owner && piece.type === type
  }
  const owned = (vector: Vector, square = at) => relative(vector, square)?.color === color
  const enemy = (vector: Vector) => relative(vector)?.color === opposite
  const all = position.board.listNonEmptySquares()
  const ownSquares = all.filter((square) => position.board.at(square)?.color === color)
  const kings = (owner: Color) =>
    all.filter((square) => {
      const piece = position.board.at(square)
      return piece?.color === owner && piece.type === PieceType.KING
    })
  const ownKings = kings(color)
  const enemyKings = kings(opposite)
  const king = ownKings.length === 1 ? ownKings[0] : null
  const enemyKing = enemyKings.length === 1 ? enemyKings[0] : null
  const approaching = !!enemyKing && !!event.from && distance(at, enemyKing) < distance(event.from, enemyKing)
  const retreating = !!king && !!event.from && distance(at, king) > distance(event.from, king)
  const currentPromote = !!origin && origin.type === base && promoted
  const count = (type: PieceType) => ownSquares.filter((square) => position.board.at(square)?.type === type).length
  const add = (name: string, condition: unknown) => {
    if (condition) result.push(name)
  }
  const old = (n: number) => {
    const index = event.ply - n - 1
    if (index < 0) return null
    const prior = Position.newBySFEN(history.sfens[index])
    const next = Position.newBySFEN(history.sfens[index + 1])
    const move = prior?.createMoveByUSI(history.moves[index])
    const piece = move && next?.board.at(move.to)
    return move && piece ? { move, piece, drop: !(move.from instanceof Square) } : null
  }
  const last = old(1)
  const beforeLast = old(2)
  const used = (type: PieceType) => event.usedCounts[type] ?? 0
  const ray = (vector: Vector, start = 1) => {
    const squares: Square[] = []
    for (let steps = start; steps <= 8; steps++) {
      const square = offset(at, vector, color, steps)
      if (!square) break
      squares.push(square)
    }
    return squares
  }
  const pawnUp = is([0, -1], PieceType.PAWN)
  const knightUp = is([0, -1], PieceType.KNIGHT)
  const noCapture = event.capturedType === undefined
  const leftRight = file(at) === 5 ? 0 : file(at) < 5 ? 1 : -1
  const newMove = !drop

  if (!promoted && [PieceType.ROOK, PieceType.BISHOP].includes(base)) {
    const centerClear = (square: Square, diagonalMove: boolean, owner: Color) => {
      const ownerFile = owner === Color.BLACK ? square.file : 10 - square.file
      if (ownerFile === 5) return true
      const target = offset(square, [ownerFile < 5 ? -1 : 1, diagonalMove ? -1 : 0], owner)
      return !!target && !position.board.at(target)
    }
    const rooks = [color, opposite].every((owner) =>
      all.some((square) => {
        const piece = position.board.at(square)!
        return piece.color === owner && piece.type === PieceType.ROOK && square.rank >= 4 && square.rank <= 6 && centerClear(square, false, owner)
      }),
    )
    const bishops = all.some((square) => {
      const piece = position.board.at(square)!
      const top = piece.color === Color.BLACK ? square.rank - 1 : 9 - square.rank
      return piece.type === PieceType.BISHOP && ((top >= 3 && top <= 5) || 8 - top >= 2) && centerClear(square, true, piece.color)
    })
    add('空中戦', event.joban && noCapture && used(PieceType.GOLD) <= 2 && used(PieceType.SILVER) <= 2 && rooks && bishops)
  }
  if (soldier.type === PieceType.GOLD && newMove && event.from) {
    add(
      '堅陣の金',
      row(at) >= 7 &&
        (event.from.rank - at.rank) * sign === -1 &&
        event.from.file === at.file &&
        noCapture &&
        !front.some((v) => relative(v, event.from!)?.color === opposite) &&
        !knight.some((v) => is(v, PieceType.KNIGHT, opposite, event.from!)),
    )
    const rightLength = (event.from.file - at.file) * sign
    add(
      '退場の金',
      !!king &&
        rightLength !== 0 &&
        (event.from.rank - at.rank) * sign > 0 &&
        is([0, 1], PieceType.PAWN, color) &&
        is([rightLength > 0 ? -1 : 1, 0], PieceType.PAWN, color) &&
        retreating,
    )
  }
  if (soldier.type === PieceType.PAWN && newMove) {
    add('パンドラの歩', event.joban && row(at) === 5 && file(at) === 5 && position.hand(opposite).count(PieceType.BISHOP) > 0 && event.hirateLike)
    add('突き捨て', noCapture && row(at) >= 3 && row(at) <= 4 && pawnUp)
    add(
      '突き違いの歩',
      noCapture &&
        is([0, -1], PieceType.SILVER) &&
        last &&
        !last.drop &&
        last.piece.type === PieceType.PAWN &&
        last.piece.color === opposite &&
        last.move.to.rank === at.rank &&
        Math.abs(last.move.to.file - at.file) <= 1,
    )
    add('端攻め', edge(at) === 0 && pawnUp && noCapture)
    const above = ray([0, -1], 2).find((s) => position.board.at(s))
    const below = ray([0, 1], 2).find((s) => position.board.at(s))
    const behind = below && position.board.at(below)
    add(
      '端玉には端歩',
      !!enemyKing &&
        edge(at) === 0 &&
        pawnUp &&
        !!above &&
        position.board.at(above)?.type === PieceType.KING &&
        position.board.at(above)?.color === opposite &&
        behind?.color === color &&
        (behind.type === PieceType.ROOK || behind.type === PieceType.DRAGON || behind.type === PieceType.LANCE),
    )
  }
  if (currentPromote && [PieceType.ROOK, PieceType.BISHOP].includes(base))
    add('双竜双馬陣', !tags.includes('双竜双馬陣') && count(PieceType.HORSE) === 2 && count(PieceType.DRAGON) === 2)
  if (currentPromote && base === PieceType.PAWN) add('歩の錬金術師', !tags.includes('歩の錬金術師') && count(PieceType.PROM_PAWN) >= 3)
  if ([PieceType.SILVER, PieceType.GOLD].includes(soldier.type) && newMove) {
    add(
      'ハッチ閉鎖',
      event.joban &&
        row(at) === 7 &&
        edge(at) === 1 &&
        !!king &&
        is([leftRight, 1], PieceType.KING, color) &&
        [
          [leftRight, 0],
          [0, -1],
          [0, 1],
        ].every((v) => owned([v[0], v[1]])),
    )
    if (event.from)
      add(
        base === PieceType.GOLD ? '壁金' : '壁銀',
        edge(at) === 1 &&
          row(at) === 7 &&
          relative([0, 1])?.color === color &&
          unpromotedPieceType(relative([0, 1])!.type) === PieceType.KNIGHT &&
          relative([0, -1])?.color === color &&
          unpromotedPieceType(relative([0, -1])!.type) === PieceType.PAWN &&
          edge(event.from) === 2 &&
          !!king &&
          Math.abs(at.file - king.file) <= 3 &&
          Math.abs(king.file - 5) <= 3 &&
          row(king) >= 6,
      )
  }
  if (soldier.type === PieceType.KING && newMove && event.from) {
    add(
      '右玉',
      used(PieceType.KING) === 1 &&
        event.joban &&
        (event.from.file - at.file) * sign > 0 &&
        [8, 9].some((rank) => {
          const square = color === Color.BLACK ? new Square(2, rank) : new Square(8, 10 - rank)
          return position.board.at(square)?.color === color && position.board.at(square)?.type === PieceType.ROOK
        }),
    )
    const nearbyWorth = (square: Square, excludeKing: boolean) =>
      outer.some((v) => {
        const piece = relative(v, square)
        return piece?.color === color && (!excludeKing || piece.type !== PieceType.KING) && weight[piece.type] >= 600
      })
    add('裸玉', !nearbyWorth(at, false) && nearbyWorth(event.from, true))
    add('双玉接近', !!enemyKing && distance(at, enemyKing) <= 2 && distance(event.from, enemyKing) > 2)
    add('端玉', edge(at) === 0 && at.rank >= 2 && at.rank <= 8 && !(edge(event.from) === 0 && event.from.rank >= 2 && event.from.rank <= 8))
    add('中段玉', row(event.from) >= 6 && row(at) < 6)
    add('桂頭の玉', knightUp)
    add('入玉', row(at) === 2 && row(event.from) === 3)
    add('タッチダウン', row(at) === 0 && file(at) === 5 && event.generalPreset)
  }
  if (soldier.type === PieceType.PAWN && drop) {
    const rookBelow = last && !last.drop && last.piece.color === opposite && last.piece.type === PieceType.ROOK && last.move.to.equals(offset(at, [0, 1]))
    add(
      '蓋歩',
      rookBelow && empty([0, 2]) && (backKnight.some((v) => is(v, PieceType.KNIGHT, color)) || backDiagonal.some((v) => is(v, PieceType.SILVER, color))),
    )
    add('銀裾の歩', row(at) === 8 && diagonal.some((v) => is(v, PieceType.SILVER, color)))
    add('歩切れ', !event.joban && position.hand(color).count(PieceType.PAWN) === 0)
    add('垂れ歩', row(at) >= 1 && row(at) <= 3 && empty([0, -1]))
    const twoAbove = relative([0, -2])
    add('土下座の歩', row(at) >= 7 && empty([0, -1]) && twoAbove?.color === opposite && forward(twoAbove))
    const up = relative([0, -1])
    const down = relative([0, 1])
    const previousDropUp =
      beforeLast?.drop && beforeLast.piece.type === PieceType.PAWN && beforeLast.piece.color === color && beforeLast.move.to.equals(offset(at, [0, -1]))
    add(
      'たたきの歩',
      row(at) >= 1 &&
        row(at) <= 3 &&
        up?.color === opposite &&
        (up.type !== unpromotedPieceType(up.type) || [PieceType.ROOK, PieceType.GOLD, PieceType.SILVER, PieceType.KING].includes(up.type)) &&
        !(down?.color === color && forward(down)) &&
        !previousDropUp,
    )
    const ownPreviousUp = beforeLast?.piece.color === color && beforeLast.piece.type === PieceType.PAWN && beforeLast.move.to.equals(offset(at, [0, -1]))
    const enemyPreviousUp = last && !last.drop && last.piece.color === opposite && last.move.to.equals(offset(at, [0, -1]))
    add('継ぎ歩', ownPreviousUp && !beforeLast?.drop && enemyPreviousUp && last?.piece.type === PieceType.PAWN)
    add('連打の歩', ownPreviousUp && beforeLast?.drop && enemyPreviousUp)
  }
  if (drop && [PieceType.PAWN, PieceType.LANCE].includes(soldier.type)) {
    add(base === PieceType.PAWN ? '金底の歩' : '金底の香', row(at) === 8 && is([0, -1], PieceType.GOLD, color))
    add(
      base === PieceType.PAWN ? '歩裏の歩' : '歩裏の香',
      ray([0, 1]).some((s) => position.board.at(s)?.color === opposite && position.board.at(s)?.type === PieceType.PAWN),
    )
  }
  if (soldier.type === PieceType.DRAGON && newMove)
    add(
      '一間竜',
      [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2],
      ].some((v) => is([v[0], v[1]], PieceType.KING)),
    )
  if (drop && [PieceType.ROOK, PieceType.BISHOP].includes(soldier.type)) add(base === PieceType.ROOK ? '自陣飛車' : '自陣角', row(at) >= 6)
  if (soldier.type === PieceType.PAWN) {
    add(
      '角頭攻め',
      is([0, -1], PieceType.BISHOP) || (row(at) < 6 && pawnUp && is([0, -2], PieceType.BISHOP) && !(event.joban && file(at) === 2 && row(at) === 3)),
    )
    add('桂頭攻め', knightUp || (row(at) >= 3 && row(at) < 6 && pawnUp && is([0, -2], PieceType.KNIGHT)))
    add('玉頭攻め', is([0, -1], PieceType.KING) || (enemy([0, -1]) && is([0, -2], PieceType.KING)))
    add('こびん攻め', edge(at) > 0 && pawnUp && knight.some((v) => is(v, PieceType.KING) || is(v, PieceType.ROOK)))
    add(
      '銀ばさみ',
      event.joban &&
        noCapture &&
        empty([0, -1]) &&
        [-1, 1].some((x) => is([x, 0], PieceType.SILVER) && is([x * 2, 0], PieceType.PAWN, color) && empty([x * 2, -1])),
    )
  }
  if (soldier.type === PieceType.PROM_PAWN && origin?.type === PieceType.PROM_PAWN) {
    add('と金攻め', event.capturedType !== undefined && weight[event.capturedType] > 100 && !!enemyKing && distance(at, enemyKing) <= 3 && approaching)
    add('マムシのと金', !!enemyKing && approaching && noCapture)
  }
  if (soldier.type === PieceType.SILVER && newMove)
    add('位の確保', event.joban && row(at) === 5 && file(at) >= 3 && file(at) <= 7 && is([0, -1], PieceType.PAWN, color) && empty([0, -2]))
  if (soldier.type === PieceType.ROOK && newMove && event.from) {
    add('浮き飛車', event.joban && row(at) === 5 && at.file === event.from.file && noCapture)
    add(
      '飛車先交換',
      last &&
        !last.drop &&
        last.piece.color === opposite &&
        unpromotedPieceType(last.piece.type) === PieceType.PAWN &&
        last.move.to.equals(at) &&
        beforeLast &&
        !beforeLast.drop &&
        beforeLast.piece.color === color &&
        unpromotedPieceType(beforeLast.piece.type) === PieceType.PAWN &&
        beforeLast.move.to.equals(at),
    )
  }
  if (base === PieceType.ROOK) {
    const partner = ownSquares.find((square) => !square.equals(at) && unpromotedPieceType(position.board.at(square)!.type) === PieceType.ROOK)
    add(
      '二枚飛車',
      !!enemyKing && Math.abs(enemyKing.rank - at.rank) <= 1 && !!partner && partner.rank === at.rank && (!event.from || event.from.rank !== partner.rank),
    )
  }
  if ([PieceType.ROOK, PieceType.KING].includes(soldier.type) && newMove && event.from) {
    const partner = base === PieceType.ROOK ? PieceType.KING : PieceType.ROOK
    add(
      '玉飛接近',
      !!king &&
        used(PieceType.KING) + used(PieceType.ROOK) > 2 &&
        outer.some((v) => is(v, partner, color)) &&
        !outer.some((v) => is(v, partner, color, event.from!)),
    )
  }
  if (((soldier.type === PieceType.KING || soldier.type === PieceType.PROM_SILVER) && newMove) || soldier.type === PieceType.GOLD) {
    const members = king
      ? outer.reduce((sum, v) => {
          const p = relative(v, king)
          return sum + (p?.color === color ? weight[p.type] : 0)
        }, 0)
      : 0
    const score = (owner: Color) =>
      all.reduce((sum, square) => {
        const p = position.board.at(square)!
        return sum + (p.color === owner ? weight[p.type] : 0)
      }, 0) + position.hand(owner).counts.reduce((sum, { type, count }) => sum + (type === PieceType.KING ? 40000 : weight[type] * 1.05) * count, 0)
    add(
      '天空の城',
      event.generalPreset &&
        !!king &&
        row(king) >= 3 &&
        row(king) <= 5 &&
        !tags.includes('天空の城') &&
        distance(at, king) <= 1 &&
        members >= 3300 &&
        score(color) > score(opposite),
    )
  }
  if (soldier.type === PieceType.KNIGHT && newMove && event.from)
    add(
      'パンティを脱ぐ',
      event.joban && row(at) === 6 && edge(at) === 2 && edge(event.from) === 1 && is([file(event.from) < 5 ? 1 : -1, 0], PieceType.KING, color, event.from),
    )
  if ([PieceType.SILVER, PieceType.GOLD].includes(soldier.type)) {
    const label = base === PieceType.SILVER ? '銀' : '金'
    add(
      `腹${label}`,
      lateral.some((v) => is(v, PieceType.KING)),
    )
    add(`尻${label}`, is([0, 1], PieceType.KING))
    add(
      `肩${label}`,
      diagonal.some((v) => is(v, PieceType.KING)),
    )
    add(
      `裾${label}`,
      backDiagonal.some((v) => is(v, PieceType.KING)),
    )
    add(`頭${label}`, is([0, -1], PieceType.KING))
  }
  if (soldier.type === PieceType.BISHOP) {
    const clearLong = diagonal.some((vector) => {
      for (let steps = 1; steps <= 8; steps++) {
        const target = offset(at, vector, color, steps)
        if (!target) return false
        if (steps >= 5 && row(target) < 3) return true
        if (position.board.at(target)) return false
      }
      return false
    })
    add('遠見の角', !event.joban && row(at) >= 6 && clearLong)
  }
  if (soldier.type === PieceType.SILVER) {
    add(
      '割り打ちの銀',
      backDiagonal.every((v) => is(v, PieceType.ROOK) || is(v, PieceType.GOLD)),
    )
    add('桂頭の銀', knightUp && !(edge(at) === 1 && row(at) === 1))
  }
  if ([PieceType.SILVER, PieceType.BISHOP].includes(soldier.type))
    add(
      base === PieceType.SILVER ? 'たすきの銀' : 'たすきの角',
      [-1, 1].some((x) => is([x, -1], PieceType.ROOK) && (is([-x, 1], PieceType.GOLD) || is([-x, 1], PieceType.PROM_SILVER))),
    )
  if (soldier.type === PieceType.KNIGHT) {
    add('歩頭の桂', pawnUp)
    add(
      '急所の桂',
      relative([0, -1])?.color === opposite &&
        forward(relative([0, -1])!) &&
        knight.some((v) => {
          const p = relative(v)
          return p?.color === opposite && weight[p.type] > weight[soldier.type]
        }),
    )
    add('金頭の桂', is([0, -1], PieceType.GOLD))
    add('桂頭の桂', knightUp)
    add(
      'ふんどしの桂',
      knight.every((v) => {
        const p = relative(v)
        return p?.color === opposite && weight[p.type] > weight[soldier.type]
      }),
    )
    const targets = knight.map((v) => relative(v)).filter((p) => p?.color === opposite)
    add('控えの桂', drop && row(at) >= 5 && targets.length > 0 && targets.every((p) => p && unpromotedPieceType(p.type) === PieceType.PAWN))
    add('高跳びの桂', newMove && (9 - at.file) % 2 === 1 && row(at) === 4)
    add(
      '継ぎ桂',
      backKnight.some((v) => is(v, PieceType.KNIGHT, color)),
    )
  }
  if (base === PieceType.KNIGHT && newMove && event.from)
    add(
      '跳ね違いの桂',
      knight.some((v) => is(v, PieceType.KNIGHT, opposite, event.from!) && !!last && !last.drop && last.move.to.equals(offset(event.from!, v))),
    )
  if (soldier.type === PieceType.LANCE && drop) {
    let mode = 0
    for (const target of ray([0, -1])) {
      const p = position.board.at(target)
      if (!p) continue
      if (p.color === color) break
      if (mode === 0 && p.type === PieceType.BISHOP) mode = 1
      else if (mode === 1 && [PieceType.KING, PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER].includes(unpromotedPieceType(p.type))) {
        mode = 2
        break
      }
    }
    add('田楽刺し', mode === 2)
    const top = color === Color.BLACK ? new Square(at.file, 1) : new Square(at.file, 9)
    const topPawn = position.board.at(top)
    const topGold = pieceAt(offset(top, [0, -1], opposite))
    let goldReached = false
    for (const target of ray([0, -1])) {
      const p = position.board.at(target)
      if (p?.color === color) break
      if (p?.color === opposite && (opposite === Color.BLACK ? 9 - target.rank : target.rank - 1) === 1) goldReached = true
    }
    add(
      '底歩に香',
      topPawn?.type === PieceType.PAWN &&
        topPawn.color === opposite &&
        topGold?.type === PieceType.GOLD &&
        topGold.color === opposite &&
        empty([0, -1]) &&
        goldReached,
    )
    add('下段の香', row(at) === 8)
  }
  if (soldier.type === PieceType.SILVER || (soldier.type === PieceType.KING && newMove))
    add('オリオン囲い', event.generalPreset && !!king && front.every((v) => is(v, PieceType.SILVER, color, king)) && lateral.every((v) => empty(v, king)))
  if ([PieceType.BISHOP, PieceType.ROOK, PieceType.SILVER].includes(soldier.type) && newMove && event.from)
    add(base === PieceType.BISHOP ? '角不成' : base === PieceType.ROOK ? '飛車不成' : '銀不成', row(at) <= 2 || row(event.from) <= 2)
  return result
}
