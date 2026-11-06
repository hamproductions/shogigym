import { Color, PieceType, Square, formatMove, type Move, type Position } from 'tsshogi'
import { analyze, scoreToCp, type Analysis, type Candidate, type Score } from './engine'
import { positionOf, type Side } from './shogi'
import { PIECE_VALUE, pieceName } from './pieceValues'
export { PIECE_VALUE } from './pieceValues'
import i18n from './i18n'

export type Label = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'miss' | 'blunder'

export const LABELS: Record<Label, { text: string; symbol: string; color: string }> = {
  brilliant: {
    get text() {
      return i18n.t('labels.brilliant')
    },
    symbol: '!!',
    color: '#1baca6',
  },
  great: {
    get text() {
      return i18n.t('labels.great')
    },
    symbol: '!',
    color: '#5c8bb0',
  },
  best: {
    get text() {
      return i18n.t('labels.best')
    },
    symbol: '★',
    color: '#81b64c',
  },
  excellent: {
    get text() {
      return i18n.t('labels.excellent')
    },
    symbol: '◎',
    color: '#81b64c',
  },
  good: {
    get text() {
      return i18n.t('labels.good')
    },
    symbol: '○',
    color: '#95b776',
  },
  book: {
    get text() {
      return i18n.t('labels.book')
    },
    symbol: '本',
    color: '#a88865',
  },
  inaccuracy: {
    get text() {
      return i18n.t('labels.inaccuracy')
    },
    symbol: '?!',
    color: '#f0c15c',
  },
  mistake: {
    get text() {
      return i18n.t('labels.mistake')
    },
    symbol: '?',
    color: '#e58f2a',
  },
  miss: {
    get text() {
      return i18n.t('labels.miss')
    },
    symbol: '✗',
    color: '#ee6b55',
  },
  blunder: {
    get text() {
      return i18n.t('labels.blunder')
    },
    symbol: '??',
    color: '#ca3431',
  },
}

const UNPROMOTED_VALUE: Record<PieceType, number> = {
  ...PIECE_VALUE,
  [PieceType.PROM_PAWN]: 1,
  [PieceType.PROM_LANCE]: 3,
  [PieceType.PROM_KNIGHT]: 4,
  [PieceType.PROM_SILVER]: 5,
  [PieceType.HORSE]: 8,
  [PieceType.DRAGON]: 10,
}

export const winRate = (cp: number) => 1 / (1 + Math.exp(-cp / 600))

export const scoreWinRate = (score: Score) => winRate(scoreToCp(score))

export const negate = (score: Score): Score => ('cp' in score ? { cp: -score.cp } : { mate: -score.mate })

export const scoreForSide = (score: Score, scoreSide: Side, viewer: Side): Score => (scoreSide === viewer ? score : negate(score))

export type MoveReview = {
  usi: string
  label: Label
  loss: number
  before: Score
  after: Score
  best: Candidate
  reply: Candidate | null
  reasons: string[]
  bestReasons: string[]
}

function materialSwing(position: Position, pv: string[], perspective: Color, plies: number) {
  const p = position.clone()
  let swing = 0
  const captured: { by: Color; type: PieceType }[] = []
  for (const usi of pv.slice(0, plies)) {
    const move = p.createMoveByUSI(usi)
    if (!move || !p.isValidMove(move)) break
    if (move.capturedPieceType) {
      const gain = PIECE_VALUE[move.capturedPieceType] + UNPROMOTED_VALUE[move.capturedPieceType]
      swing += move.color === perspective ? gain : -gain
      captured.push({ by: move.color, type: move.capturedPieceType })
    }
    p.doMove(move)
  }
  return { swing, captured }
}

function attackedEnemies(position: Position, move: Move): PieceType[] {
  const after = position.clone()
  after.doMove(move)
  const out: PieceType[] = []
  for (const square of after.board.listNonEmptySquares()) {
    const piece = after.board.at(square)
    if (!piece || piece.color === move.color || piece.type === PieceType.KING) continue
    if (capturesOf(after, square, move.color).some((capture) => capture.from instanceof Square && capture.from.equals(move.to))) out.push(piece.type)
  }
  return out.sort((a, b) => PIECE_VALUE[b] - PIECE_VALUE[a])
}

function capturesOf(position: Position, square: Square, color: Color): Move[] {
  const at = position.clone()
  at.setColor(color)
  if (at.board.at(square)?.color === color) return []
  return at.listAttackers(square).flatMap((from) => {
    if (at.board.at(from)?.color !== color || from.equals(square)) return []
    const move = at.createMove(from, square)
    if (!move) return []
    const legal = [move, move.withPromote()].find((candidate) => at.isValidMove(candidate))
    return legal ? [legal] : []
  })
}

function canLosePiece(position: Position, square: Square, color: Color, badTrade: boolean): boolean {
  const piece = position.board.at(square)
  if (!piece || piece.color !== color) return false
  const enemy = color === Color.BLACK ? Color.WHITE : Color.BLACK
  return capturesOf(position, square, enemy).some((capture) => {
    if (badTrade && PIECE_VALUE[capture.pieceType] < PIECE_VALUE[piece.type]) return true
    return !canRecapture(position, capture)
  })
}

function canRecapture(position: Position, capture: Move): boolean {
  const after = position.clone()
  after.setColor(capture.color)
  after.doMove(capture)
  return capturesOf(after, capture.to, capture.color === Color.BLACK ? Color.WHITE : Color.BLACK).length > 0
}

function hangingPieces(position: Position, color: Color): Map<string, PieceType> {
  const out = new Map<string, PieceType>()
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    if (piece.color !== color || piece.type === PieceType.KING || PIECE_VALUE[piece.type] < 4) continue
    if (canLosePiece(position, square, color, true)) out.set(square.usi, piece.type)
  }
  return out
}

const squareName = (usi: string) => `${usi[0]}${'一二三四五六七八九'['abcdefghi'.indexOf(usi[1])]}`

function isHanging(position: Position, move: Move): boolean {
  const after = position.clone()
  after.doMove(move)
  return (
    hangingPieces(after, move.color).has(move.to.usi) || (PIECE_VALUE[after.board.at(move.to)!.type] < 4 && canLosePiece(after, move.to, move.color, false))
  )
}

export function describeMove(sfen: string, usi: string): string[] {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move || move.usi !== usi || !position.isValidMove(move)) return []
  const out: string[] = []
  if (move.capturedPieceType) out.push(i18n.t('moveFacts.captures', { piece: pieceName(move.capturedPieceType) }))
  const after = position.clone()
  after.doMove(move)
  if (after.checked) out.push(i18n.t('moveFacts.check'))
  if (move.promote) out.push(i18n.t('moveFacts.promotes', { piece: pieceName(after.board.at(move.to)!.type) }))
  if (!(move.from instanceof Square)) out.push(i18n.t('moveFacts.drops', { piece: pieceName(move.pieceType) }))
  const targets = attackedEnemies(position, move)
  if (targets.length >= 2) out.push(i18n.t('moveFacts.forks', { a: pieceName(targets[0]), b: pieceName(targets[1]) }))
  else if (targets.length === 1 && PIECE_VALUE[targets[0]] >= 5) out.push(i18n.t('moveFacts.attacks', { piece: pieceName(targets[0]) }))
  return out
}

function lineText(sfen: string, pv: string[], plies: number): string {
  const p = positionOf(sfen)
  const out: string[] = []
  for (const usi of pv.slice(0, plies)) {
    const move = p.createMoveByUSI(usi)
    if (!move || move.usi !== usi || !p.isValidMove(move)) break
    out.push(formatMove(p, move))
    p.doMove(move)
  }
  return out.join(' ') + (out.length === plies && pv.length > plies ? ' …' : '')
}

export function explainMistake(sfen: string, usi: string, best: Candidate, reply: Candidate | null): string[] {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return []
  const reasons: string[] = []
  const after = position.clone()
  after.doMove(move)
  const capturedValue = move.capturedPieceType ? PIECE_VALUE[move.capturedPieceType] + UNPROMOTED_VALUE[move.capturedPieceType] : 0
  const movedType = after.board.at(move.to)!.type
  const exchangeLoses = capturedValue < PIECE_VALUE[movedType] + UNPROMOTED_VALUE[movedType]
  if ('mate' in best.score && best.score.mate > 0 && best.move !== usi)
    reasons.push(i18n.t('moveFacts.missedMate', { count: best.score.mate, line: lineText(sfen, best.pv, Math.min(best.score.mate, 6)) }))
  if (reply && 'mate' in reply.score && reply.score.mate > 0)
    reasons.push(
      i18n.t('mate' in best.score && best.score.mate < 0 ? 'moveFacts.opponentMate' : 'moveFacts.allowsMate', {
        count: reply.score.mate,
        line: lineText(after.sfen, reply.pv, Math.min(reply.score.mate, 6)),
      }),
    )
  const hangingBefore = hangingPieces(position, move.color)
  for (const [square, type] of hangingPieces(after, move.color)) {
    if (hangingBefore.has(square) || square === move.to.usi) continue
    reasons.push(i18n.t('moveFacts.leavesHanging', { piece: pieceName(type), square: squareName(square) }))
  }
  if (reply) {
    const replyMove = after.createMoveByUSI(reply.move)
    if (exchangeLoses && replyMove?.capturedPieceType && replyMove.to.equals(move.to) && after.isValidMove(replyMove) && !canRecapture(after, replyMove))
      reasons.push(
        i18n.t('moveFacts.canBeTaken', {
          piece: pieceName(after.board.at(move.to)!.type),
          square: squareName(move.to.usi),
          move: formatMove(after, replyMove),
        }),
      )
    else if (exchangeLoses && canLosePiece(after, move.to, move.color, false))
      reasons.push(i18n.t('moveFacts.enPrise', { piece: pieceName(after.board.at(move.to)!.type), square: squareName(move.to.usi) }))
    const { swing, captured } = materialSwing(after, reply.pv, move.color, 6)
    const lost = captured.filter((c) => c.by !== move.color).map((c) => pieceName(c.type))
    if (swing + capturedValue <= -4 && lost.length)
      reasons.push(i18n.t('moveFacts.losesMaterial', { pieces: lost.join(i18n.t('moveFacts.sep')), line: lineText(after.sfen, reply.pv, 3) }))
    const threat = describeMove(after.sfen, reply.move)
    if (threat.length)
      reasons.push(
        i18n.t('moveFacts.strongestReply', { move: formatMove(after, after.createMoveByUSI(reply.move)!), what: threat.join(i18n.t('moveFacts.sep')) }),
      )
  }
  if (best.move !== usi) {
    const { swing } = materialSwing(position, best.pv, move.color, 6)
    if (swing >= 4) reasons.push(i18n.t('moveFacts.bestWins', { move: lineText(sfen, [best.move], 1), line: lineText(sfen, best.pv, 3) }))
  }
  return reasons
}

export function reviewReasons(sfen: string, review: Pick<MoveReview, 'usi' | 'label' | 'best' | 'reply'>): string[] {
  const { usi, label, best, reply } = review
  const critical = (reply && 'mate' in reply.score && reply.score.mate > 0) || ('mate' in best.score && best.score.mate > 0 && best.move !== usi)
  const explain = critical || ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(label)
  return [...new Set([...(explain ? explainMistake(sfen, usi, best, reply) : []), ...describeMove(sfen, usi)])]
}

export function bestMoveReasons(sfen: string, best: Candidate): string[] {
  const what = describeMove(sfen, best.move)
  const reasons = what.length ? [i18n.t('moveFacts.bestDoes', { move: lineText(sfen, [best.move], 1), what: what.join(i18n.t('moveFacts.sep')) })] : []
  reasons.push(i18n.t('moveFacts.engineLine', { line: lineText(sfen, best.pv, 8) }))
  return reasons
}

function isSacrifice(sfen: string, usi: string): boolean {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return false
  const after = position.clone()
  after.doMove(move)
  const piece = after.board.at(move.to)
  if (!piece || PIECE_VALUE[piece.type] < 4) return false
  const given = PIECE_VALUE[piece.type] - (move.capturedPieceType ? PIECE_VALUE[move.capturedPieceType] : 0)
  return given >= 3 && isHanging(position, move)
}

export function classify(params: { sfen: string; usi: string; before: Analysis; after: Analysis | null; inBook: boolean; previousLoss?: number }): MoveReview {
  const { sfen, usi, before, after, inBook } = params
  const best = before.candidates[0]
  const reply = after?.candidates[0] ?? null
  const afterScore = reply ? negate(reply.score) : best.score
  const bestWp = scoreWinRate(best.score)
  const userWp = scoreWinRate(afterScore)
  const loss = Math.max(0, best.move === usi ? 0 : bestWp - userWp)
  const second = before.candidates[1]
  const onlyMove = second ? bestWp - scoreWinRate(second.score) >= 0.1 : false

  let label: Label
  if (inBook && loss < 0.1) label = 'book'
  else if (loss <= 0.02 && isSacrifice(sfen, usi) && userWp >= 0.45 && bestWp < 0.95) label = 'brilliant'
  else if (best.move === usi && onlyMove && bestWp >= 0.45) label = 'great'
  else if (best.move === usi) label = 'best'
  else if (loss <= 0.02) label = 'excellent'
  else if (loss <= 0.05) label = 'good'
  else if (loss <= 0.1) label = 'inaccuracy'
  else if (loss <= 0.2) label = (params.previousLoss ?? 0) >= 0.1 && bestWp >= 0.6 ? 'miss' : 'mistake'
  else label = (params.previousLoss ?? 0) >= 0.1 && bestWp >= 0.6 && userWp >= 0.4 ? 'miss' : 'blunder'

  return {
    usi,
    label,
    loss,
    before: best.score,
    after: afterScore,
    best,
    reply,
    reasons: reviewReasons(sfen, { usi, label, best, reply }),
    bestReasons: best.move === usi ? [] : bestMoveReasons(sfen, best),
  }
}

export function usiPosition(sfen: string): string {
  return `position sfen ${sfen}`
}

export async function reviewMove(
  sfen: string,
  usi: string,
  opts: { inBook?: boolean; movetime?: number; previousLoss?: number; idle?: boolean; signal?: AbortSignal } = {},
): Promise<MoveReview> {
  const movetime = opts.movetime ?? 300
  const before = await analyze(usiPosition(sfen), { multipv: 3, movetime, idle: opts.idle, signal: opts.signal })
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move || !position.doMove(move)) throw new Error(`illegal ${usi}`)
  const known = before.candidates.find((c) => c.move === usi && c.pv.length > 1)
  const after: Analysis = known
    ? { bestmove: known.pv[1], candidates: [{ ...known, move: known.pv[1], pv: known.pv.slice(1), score: negate(known.score) }] }
    : await analyze(usiPosition(position.sfen), { multipv: 3, movetime, idle: opts.idle, signal: opts.signal })
  return classify({ sfen, usi, before, after, inBook: opts.inBook ?? false, previousLoss: opts.previousLoss })
}
