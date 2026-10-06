import { Color, InitialPositionSFEN, PieceType, Square, pieceTypeToSFEN, unpromotedPieceType, type ImmutablePosition } from 'tsshogi'
import data from '@/data/formations.json'
import { positionOf } from './shogi'
import { detectCustom } from './bioshogiCustom'
import { detectMotion } from './bioshogiMotion'

type Cell = [number, number, string, string]
interface Rule {
  name: string
  kind: 'strategy' | 'castle' | 'technique'
  cells: Cell[]
  turn_max?: number
  turn_eq?: number
  order_key?: string
  outbreak_skip?: boolean
  kill_count_lteq?: number
  kill_only?: boolean
  drop_only?: boolean
  has_pawn_then_skip?: boolean
  has_other_pawn_then_skip?: boolean
  hold_piece_empty?: boolean
  hold_piece_eq?: Record<string, number>
  op_hold_piece_eq?: Record<string, number>
  hold_piece_in?: Record<string, number>
  hold_piece_not_in?: Record<string, number>
  preset_is?: string
  parent?: string
  add_to_self?: string
  add_to_opponent?: string
}
export interface FormationTag {
  name: string
  kind: 'strategy' | 'castle' | 'technique'
  squares: Square[]
  ply: number
  detectedPly?: number
  annotation?: boolean
}
interface Event {
  to: Square
  from: Square | null
  captured: boolean
  ply: number
}
interface State {
  tags: [FormationTag[], FormationTag[]]
  kills: number
  outbreak: boolean
  hirate: boolean
  first: Color
  outbreakPly?: number
  firstKingMove: [number | null, number | null]
  generalPreset: boolean
  usedCounts: [Partial<Record<PieceType, number>>, Partial<Record<PieceType, number>>]
}
const rules = data.rules as Rule[]
const side = (color: Color) => (color === Color.BLACK ? 0 : 1)
const square = (color: Color, file: number, rank: number) => (color === Color.BLACK ? new Square(file, rank) : new Square(10 - file, 10 - rank))
const code = (position: ImmutablePosition, at: Square) => {
  const piece = position.board.at(at)
  return piece ? pieceTypeToSFEN(piece.type).toUpperCase() : null
}
const silverValue = (type: PieceType) => ![PieceType.PAWN, PieceType.LANCE, PieceType.KNIGHT].includes(type)

function matches(rule: Rule, position: ImmutablePosition, color: Color, state: State, event?: Event) {
  const hand = position.hand(color)
  const held = Object.fromEntries(hand.counts.map(({ type, count }) => [pieceTypeToSFEN(type), count]).filter(([, count]) => count))
  const opposite = color === Color.BLACK ? Color.WHITE : Color.BLACK
  if (rule.outbreak_skip && state.outbreak) return false
  if (rule.kill_count_lteq !== undefined && state.kills > rule.kill_count_lteq) return false
  if (rule.preset_is && !(rule.preset_is === 'hirate_like' ? state.hirate : rule.preset_is === 'x_taden' && state.generalPreset)) return false
  if (rule.turn_max !== undefined && (event?.ply ?? 0) > rule.turn_max) return false
  if (rule.turn_eq !== undefined && event?.ply !== rule.turn_eq) return false
  if (rule.order_key && color !== (rule.order_key === 'order_first' ? state.first : state.first === Color.BLACK ? Color.WHITE : Color.BLACK)) return false
  if (rule.drop_only && event?.from) return false
  if (rule.kill_only && !event?.captured) return false
  if (rule.has_pawn_then_skip && hand.count(PieceType.PAWN)) return false
  if (rule.has_other_pawn_then_skip && Object.keys(held).some((type) => type !== 'P')) return false
  if (rule.hold_piece_empty && Object.keys(held).length) return false
  for (const [expected, actual] of [
    [rule.hold_piece_eq, hand],
    [rule.op_hold_piece_eq, position.hand(opposite)],
  ] as const) {
    if (expected && actual.counts.some(({ type, count }) => count !== (expected[pieceTypeToSFEN(type)] ?? 0))) return false
  }
  if (rule.hold_piece_in && !Object.keys(rule.hold_piece_in).every((type) => held[type])) return false
  if (rule.hold_piece_not_in && Object.keys(rule.hold_piece_not_in).some((type) => held[type])) return false
  const test = ([file, rank, prefix, value]: Cell) => {
    const at = square(color, file, rank)
    const piece = position.board.at(at)
    if (value === '○') return !piece
    if (value === '●') return !!piece
    if (value === '★') return !!event?.from?.equals(at)
    if (value === '☆') return !!event?.from && !event.from.equals(at)
    if (value === '◆') return piece?.color === color && silverValue(piece.type)
    if (value === '■') return piece?.color === color && [PieceType.GOLD, PieceType.SILVER].includes(piece.type)
    if (value === '□') return !(piece?.color === color && [PieceType.GOLD, PieceType.SILVER].includes(piece.type))
    if (value === '◇') return piece?.color === color
    return piece?.color === (['v', '?'].includes(prefix) ? opposite : color) && code(position, at) === value
  }
  for (const prefix of ['*', '?']) {
    const any = rule.cells.filter((cell) => cell[2] === prefix)
    if (any.length && !any.some(test)) return false
  }
  for (const cell of rule.cells) {
    if (['*', '?', '★', '!'].includes(cell[2]) || cell[3] === '★') continue
    if (['~', '^'].includes(cell[2]) ? test(cell) : !test(cell)) return false
  }
  const origins = rule.cells.filter((cell) => cell[3] === '★')
  if (origins.length && !origins.some(test)) return false
  if (!event) {
    const explicit = rule.cells.filter((cell) => ['!', '@'].includes(cell[2]))
    if (explicit.length && !explicit.some(test)) return false
  }
  if (event) {
    const explicit = rule.cells.filter((cell) => ['!', '@'].includes(cell[2]))
    const triggers = explicit.length ? explicit : rule.cells.filter((cell) => cell[2] === '' && /^[+PRBGSNLK]/.test(cell[3]))
    if (!triggers.some((cell) => event.to.equals(square(color, cell[0], cell[1])) && test(cell))) return false
  }
  return true
}

function add(state: State, color: Color, rule: Rule, ply: number, detectedPly = ply, repeat = false, annotation = true) {
  const tags = state.tags[side(color)]
  if (tags.some((tag) => tag.name === rule.name && (!repeat || tag.ply === ply))) return
  if (rule.name === '居飛車' && tags.some((tag) => tag.name === '振り飛車')) return
  if (rule.name === '振り飛車' && tags.some((tag) => tag.name === '居飛車')) return
  const definition = data.definitions.find((definition) => definition.name === rule.name)
  tags.push({
    name: rule.name,
    kind: rule.kind,
    ply,
    detectedPly,
    annotation,
    squares: rule.cells
      .filter((cell) => !['v', '?', '^', '~', '*'].includes(cell[2]) && /^[+PRBGSNLK]/.test(cell[3]))
      .map(([file, rank]) => square(color, file, rank)),
  })
  for (const [name, owner] of [
    [definition?.add_to_self, color],
    [definition?.add_to_opponent, color === Color.BLACK ? Color.WHITE : Color.BLACK],
  ] as const) {
    const extra = data.definitions.find((definition) => definition.name === name)
    if (extra) add(state, owner, { name: extra.name, kind: extra.kind as Rule['kind'], cells: [] }, ply, detectedPly, false, false)
  }
}

function detect(position: ImmutablePosition, color: Color, state: State, event?: Event, sfens: string[] = [], moves: string[] = []) {
  for (const rule of rules) {
    if (matches(rule, position, color, state, event)) add(state, color, rule, event?.ply ?? 0)
  }
  if (event) {
    const previous = positionOf(sfens[event.ply - 1])
    for (const name of detectMotion(
      position,
      previous,
      color,
      {
        ...event,
        capturedType: previous.board.at(event.to)?.type,
        joban: !state.outbreak,
        hirateLike: state.hirate,
        generalPreset: state.generalPreset,
        usedCounts: state.usedCounts[side(color)],
      },
      { sfens, moves },
      state.tags[side(color)].map((tag) => tag.name),
    ))
      add(
        state,
        color,
        { name, kind: ['右玉'].includes(name) ? 'strategy' : ['天空の城', 'オリオン囲い'].includes(name) ? 'castle' : 'technique', cells: [] },
        event.ply,
        event.ply,
        true,
      )
  }
  for (const tag of detectCustom(
    position,
    color,
    event,
    sfens,
    moves,
    !state.outbreak,
    state.hirate,
    state.generalPreset,
    state.tags[side(color)].map((tag) => tag.name),
  )) {
    add(
      state,
      tag.color,
      {
        name: tag.name,
        kind: tag.kind,
        cells: tag.squares.map((at) => [
          tag.color === Color.BLACK ? at.file : 10 - at.file,
          tag.color === Color.BLACK ? at.rank : 10 - at.rank,
          '',
          code(position, at)!,
        ]),
      },
      tag.ply,
      event?.ply ?? tag.ply,
      tag.repeat,
      tag.annotation,
    )
    if (event && tag.ply < event.ply)
      for (let { ply } = tag; ply < event.ply; ply++) {
        const prior = cache.states[ply]
        if (prior) add(prior, tag.color, { name: tag.name, kind: tag.kind, cells: [] }, tag.ply, event.ply, tag.repeat, tag.annotation)
      }
  }
}

export interface DetectionPreset {
  hirateLike?: boolean
  generalPreset?: boolean
  kingHands?: [number, number]
}
export type DetectionResult = { winner?: Color; checkmate?: boolean; impasse?: boolean } & DetectionPreset

let cache: { preset?: string; sfens: string[]; moves: string[]; states: State[] } = { sfens: [], moves: [], states: [] }

export function formationTagsAt(sfens: string[], moves: string[], cursor: number, preset: DetectionPreset = {}) {
  const presetKey = JSON.stringify(preset)
  if (cache.sfens[0] !== sfens[0] || cache.preset !== presetKey) cache = { preset: presetKey, sfens: [], moves: [], states: [] }
  let shared = 0
  while (shared < Math.min(cache.moves.length, moves.length) && cache.moves[shared] === moves[shared] && cache.sfens[shared + 1] === sfens[shared + 1]) shared++
  if (shared < cache.moves.length)
    for (const state of cache.states.slice(0, shared + 1)) {
      state.tags = state.tags.map((tags) => tags.filter((tag) => (tag.detectedPly ?? tag.ply) <= shared)) as State['tags']
    }
  cache.states.length = Math.min(cache.states.length, shared + 1)
  if (!cache.states.length) {
    const position = positionOf(sfens[0])
    const state: State = {
      tags: [[], []],
      kills: 0,
      outbreak: false,
      hirate: [InitialPositionSFEN.STANDARD, InitialPositionSFEN.HANDICAP_LANCE, InitialPositionSFEN.HANDICAP_RIGHT_LANCE].some(
        (sfen) => sfen.split(' ')[0] === sfens[0].split(' ')[0],
      ),
      generalPreset: [
        InitialPositionSFEN.STANDARD,
        InitialPositionSFEN.HANDICAP_LANCE,
        InitialPositionSFEN.HANDICAP_RIGHT_LANCE,
        InitialPositionSFEN.HANDICAP_BISHOP,
        InitialPositionSFEN.HANDICAP_ROOK,
        InitialPositionSFEN.HANDICAP_ROOK_LANCE,
        InitialPositionSFEN.HANDICAP_2PIECES,
        InitialPositionSFEN.HANDICAP_4PIECES,
        InitialPositionSFEN.HANDICAP_6PIECES,
      ].some((sfen) => sfen.split(' ')[0] === sfens[0].split(' ')[0]),
      usedCounts: [{}, {}],
      first: position.color,
      firstKingMove: [null, null],
    }
    state.hirate = preset.hirateLike ?? state.hirate
    state.generalPreset = preset.generalPreset ?? state.generalPreset
    cache.states.push(state)
  }
  for (let ply = cache.states.length; ply <= cursor; ply++) {
    const previous = positionOf(sfens[ply - 1])
    const position = positionOf(sfens[ply])
    const move = previous.createMoveByUSI(moves[ply - 1])
    if (!move) break
    const prior = cache.states[ply - 1]
    const captured = previous.board.at(move.to)
    const state: State = {
      ...prior,
      tags: [[...prior.tags[0]], [...prior.tags[1]]],
      firstKingMove: [...prior.firstKingMove],
      usedCounts: [{ ...prior.usedCounts[0] }, { ...prior.usedCounts[1] }],
      kills: prior.kills + Number(!!captured),
      outbreak: prior.outbreak || (!!captured && ![PieceType.PAWN, PieceType.BISHOP].includes(unpromotedPieceType(captured.type))),
    }
    if (!prior.outbreak && state.outbreak) state.outbreakPly = ply
    if (move.from instanceof Square && previous.board.at(move.from)?.type === PieceType.KING && state.firstKingMove[side(previous.color)] === null)
      state.firstKingMove[side(previous.color)] = ply
    const used = move.from instanceof Square ? previous.board.at(move.from)?.type : move.from
    if (used) state.usedCounts[side(previous.color)][used] = (state.usedCounts[side(previous.color)][used] ?? 0) + 1
    detect(position, previous.color, state, { to: move.to, from: move.from instanceof Square ? move.from : null, captured: !!captured, ply }, sfens, moves)
    cache.states.push(state)
  }
  cache.sfens = sfens.slice(0, cache.states.length)
  cache.moves = moves.slice(0, cache.states.length - 1)
  return cache.states[Math.min(cursor, cache.states.length - 1)].tags
}

export function formationOpeningAt(sfens: string[], moves: string[], cursor: number, preset: DetectionPreset = {}) {
  formationTagsAt(sfens, moves, cursor, preset)
  return !cache.states[Math.min(cursor, cache.states.length - 1)].outbreak
}

export function finalizeFormationTags(sfens: string[], moves: string[], result: DetectionResult = {}) {
  const tags = formationTagsAt(sfens, moves, moves.length, {
    hirateLike: result.hirateLike,
    generalPreset: result.generalPreset,
    kingHands: result.kingHands,
  }).map((list) => [...list]) as [FormationTag[], FormationTag[]]
  const state = cache.states[moves.length]
  const position = positionOf(sfens[moves.length])
  const has = (color: Color, name: string) => tags[side(color)].some((tag) => tag.name === name)
  const add = (color: Color, name: string, kind: FormationTag['kind'] = 'technique') => {
    if (!has(color, name))
      tags[side(color)].push({
        name,
        kind,
        squares: [],
        ply: moves.length,
        annotation: name === '穴熊の姿焼き' || (result.checkmate && ['都詰め', '雪隠詰め', '吊るし桂'].includes(name)),
      })
  }
  const players = [Color.BLACK, Color.WHITE]
  if (state.hirate && state.outbreak) {
    for (const color of players) {
      if (!tags[side(color)].some((tag) => tag.kind === 'castle' || (tag.kind === 'strategy' && !['居飛車', '振り飛車'].includes(tag.name)))) {
        if (result.winner === color) add(color, '名人に定跡なし')
        add(color, '力戦', 'strategy')
      }
      if (!has(color, '振り飛車') && !has(color, '居飛車')) add(color, '居飛車', 'strategy')
      if (state.firstKingMove[side(color)] === null || state.firstKingMove[side(color)]! >= state.outbreakPly!) add(color, '居玉', 'castle')
      add(color, state.outbreakPly! - 1 < 42.0553 ? '急戦' : '持久戦')
    }
  }
  if (state.hirate && state.kills) for (const color of players) add(color, moves.length < 89.4866 ? '短手数' : '長手数')
  for (const name of ['居飛車', '振り飛車', '居玉', '穴熊', '入玉'])
    if (players.every((color) => has(color, name))) for (const color of players) add(color, `相${name}`)
  if (players.filter((color) => has(color, '振り飛車')).length === 1) for (const color of players) add(color, '対抗形')
  if (result.impasse && state.hirate) for (const color of players) add(color, '持将棋')
  for (const color of players) if (has(color, '振り飛車')) tags[side(color)] = tags[side(color)].filter((tag) => tag.name !== '雁木戦法')
  const { winner } = result
  if (winner !== undefined) {
    const loser = winner === Color.BLACK ? Color.WHITE : Color.BLACK
    const owned = (color: Color) => position.board.listNonEmptySquares().filter((at) => position.board.at(at)!.color === color)
    const kingHands = [...(result.kingHands ?? [0, 0])]
    for (let ply = 0; ply < moves.length; ply++) {
      const before = positionOf(sfens[ply]),
        move = before.createMoveByUSI(moves[ply])
      if (move && before.board.at(move.to)?.type === PieceType.KING) kingHands[side(before.color)]++
    }
    const score = (color: Color) => {
      const weights: Partial<Record<PieceType, number>> = {
        [PieceType.KING]: 40000,
        [PieceType.ROOK]: 2000,
        [PieceType.BISHOP]: 1800,
        [PieceType.GOLD]: 1200,
        [PieceType.SILVER]: 1000,
        [PieceType.KNIGHT]: 700,
        [PieceType.LANCE]: 600,
        [PieceType.PAWN]: 100,
        [PieceType.DRAGON]: 2200,
        [PieceType.HORSE]: 2000,
      }
      return (
        owned(color).reduce((total, at) => total + (weights[position.board.at(at)!.type] ?? 1200), 0) +
        position.hand(color).counts.reduce((total, { type, count }) => total + (weights[type] ?? 0) * 1.05 * count, 0) +
        kingHands[side(color)] * 40000 * 1.05
      )
    }
    const majorCount =
      owned(winner).filter((at) => [PieceType.ROOK, PieceType.BISHOP].includes(unpromotedPieceType(position.board.at(at)!.type))).length +
      position.hand(winner).count(PieceType.ROOK) +
      position.hand(winner).count(PieceType.BISHOP)
    const diff = score(winner) - score(loser)
    if (state.hirate && state.outbreak) {
      if (!majorCount && has(winner, '大駒全ブッチ')) add(winner, '屍の舞')
      if (diff > 3800) add(winner, '駒得は正義')
      if (diff < -3800) add(loser, '駒の持ち腐れ')
      const king = owned(loser).find((at) => position.board.at(at)!.type === PieceType.KING)
      if (king && [1, 9].includes(king.file) && king.rank === (loser === Color.BLACK ? 9 : 1) && score(winner) >= 52990) {
        const inward = king.file === 1 ? 1 : -1,
          forward = loser === Color.BLACK ? -1 : 1
        if (
          [
            [0, forward],
            [inward, 0],
            [inward, forward],
          ].every(([dx, dy]) => position.board.at(new Square(king.file + dx, king.rank + dy))?.color === loser)
        )
          add(winner, '穴熊の姿焼き')
      }
    }
    if (state.generalPreset && state.outbreak) {
      if (moves.length < 89.4866 / 2 && diff >= 6000) add(loser, '道場出禁')
      for (const color of players) if (has(color, '玉単騎') || has(color, '全駒')) add(color, '道場出禁')
      if (
        position.hand(winner).counts.every(({ count }) => !count) &&
        owned(winner).length <
          positionOf(sfens[0])
            .board.listNonEmptySquares()
            .filter((at) => positionOf(sfens[0]).board.at(at)?.color === winner).length
      )
        add(winner, 'ミニマリスト')
    }
    if (result.checkmate) {
      const king = owned(loser).find((at) => position.board.at(at)!.type === PieceType.KING)
      if (king?.file === 5 && king.rank === 5) add(winner, '都詰め')
      if (king && [1, 9].includes(king.file) && king.rank === (loser === Color.BLACK ? 9 : 1)) add(winner, '雪隠詰め')
      if (moves.length) {
        const before = positionOf(sfens[moves.length - 1]),
          move = before.createMoveByUSI(moves.at(-1)!)
        if (move && unpromotedPieceType(position.board.at(move.to)!.type) === PieceType.KNIGHT) add(winner, '吊るし桂')
      }
    }
  }
  return tags
}

export function currentFormation(position: ImmutablePosition, color: Color, tags?: FormationTag[]) {
  if (!tags) {
    const state: State = {
      tags: [[], []],
      kills: 0,
      outbreak: false,
      hirate: true,
      first: Color.BLACK,
      firstKingMove: [null, null],
      generalPreset: true,
      usedCounts: [{}, {}],
    }
    detect(position, color, state)
    tags = state.tags[side(color)]
  }
  const strategy =
    (tags.findLast((tag) => tag.kind === 'strategy' && !['居飛車', '振り飛車'].includes(tag.name)) ?? tags.findLast((tag) => tag.kind === 'strategy'))?.name ??
    null
  const castle = tags.findLast((tag) => tag.kind === 'castle')
  const rule = rules.find((rule) => rule.name === castle?.name)
  const state: State = {
    tags: [[], []],
    kills: 0,
    outbreak: false,
    hirate: true,
    first: Color.BLACK,
    firstKingMove: [null, null],
    generalPreset: true,
    usedCounts: [{}, {}],
  }
  const squares =
    rule && matches({ ...rule, turn_eq: undefined, kill_only: false, order_key: undefined }, position, color, state)
      ? castle!.squares
      : castle?.name.includes('穴熊') && castle.squares.some((at) => position.board.at(at)?.type === PieceType.KING && position.board.at(at)?.color === color)
        ? castle.squares.filter((at) => position.board.at(at)?.color === color)
        : []
  const unmoved = position.board.at(square(color, 5, 9))?.type === PieceType.KING && position.board.at(square(color, 5, 9))?.color === color
  return { strategy, castle: castle?.name ?? (unmoved ? '居玉' : null), squares }
}
