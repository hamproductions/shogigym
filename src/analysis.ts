import { Color, PieceType, Square, formatMove, type Move, type Position } from 'tsshogi'
import { analyze, scoreToCp, type Analysis, type Candidate, type Score } from './engine'
import { PIECE_CHAR, positionOf, type Side } from './shogi'
import i18n from './i18n'

export type Label = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'miss' | 'blunder'

export const LABELS: Record<Label, { text: string; symbol: string; color: string }> = {
  brilliant: { get text() { return i18n.t('labels.brilliant') }, symbol: '!!', color: '#1baca6' },
  great: { get text() { return i18n.t('labels.great') }, symbol: '!', color: '#5c8bb0' },
  best: { get text() { return i18n.t('labels.best') }, symbol: '★', color: '#81b64c' },
  excellent: { get text() { return i18n.t('labels.excellent') }, symbol: '◎', color: '#81b64c' },
  good: { get text() { return i18n.t('labels.good') }, symbol: '○', color: '#95b776' },
  book: { get text() { return i18n.t('labels.book') }, symbol: '本', color: '#a88865' },
  inaccuracy: { get text() { return i18n.t('labels.inaccuracy') }, symbol: '?!', color: '#f0c15c' },
  mistake: { get text() { return i18n.t('labels.mistake') }, symbol: '?', color: '#e58f2a' },
  miss: { get text() { return i18n.t('labels.miss') }, symbol: '✗', color: '#ee6b55' },
  blunder: { get text() { return i18n.t('labels.blunder') }, symbol: '??', color: '#ca3431' },
}

export const PIECE_VALUE: Record<PieceType, number> = {
  [PieceType.PAWN]: 1,
  [PieceType.LANCE]: 3,
  [PieceType.KNIGHT]: 4,
  [PieceType.SILVER]: 5,
  [PieceType.GOLD]: 6,
  [PieceType.BISHOP]: 8,
  [PieceType.ROOK]: 10,
  [PieceType.KING]: 100,
  [PieceType.PROM_PAWN]: 7,
  [PieceType.PROM_LANCE]: 6,
  [PieceType.PROM_KNIGHT]: 6,
  [PieceType.PROM_SILVER]: 6,
  [PieceType.HORSE]: 10,
  [PieceType.DRAGON]: 12,
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

const pieceName = (type: PieceType) => PIECE_CHAR[type]

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
    if (attackersOf(after, square, move.color).some((s) => s.equals(move.to))) out.push(piece.type)
  }
  return out.sort((a, b) => PIECE_VALUE[b] - PIECE_VALUE[a])
}

function attackersOf(position: Position, square: Square, color: Color): Square[] {
  return position.listAttackers(square).filter((s) => position.board.at(s)?.color === color && !s.equals(square))
}

function hangingPieces(position: Position, color: Color): Map<string, PieceType> {
  const out = new Map<string, PieceType>()
  const enemy = color === Color.BLACK ? Color.WHITE : Color.BLACK
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    if (piece.color !== color || piece.type === PieceType.KING || PIECE_VALUE[piece.type] < 4) continue
    const attackers = attackersOf(position, square, enemy)
    if (attackers.length === 0) continue
    const cheapest = Math.min(...attackers.map((s) => PIECE_VALUE[position.board.at(s)!.type]))
    if (attackersOf(position, square, color).length === 0 || cheapest < PIECE_VALUE[piece.type]) out.set(square.usi, piece.type)
  }
  return out
}

const squareName = (usi: string) => `${usi[0]}${'一二三四五六七八九'['abcdefghi'.indexOf(usi[1])]}`

function isHanging(position: Position, move: Move): boolean {
  const after = position.clone()
  after.doMove(move)
  return hangingPieces(after, move.color).has(move.to.usi) || (PIECE_VALUE[after.board.at(move.to)!.type] < 4 && attackersOf(after, move.to, after.color).length > 0 && attackersOf(after, move.to, move.color).length === 0)
}

export function describeMove(sfen: string, usi: string): string[] {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return []
  const out: string[] = []
  if (move.capturedPieceType) out.push(`captures the ${pieceName(move.capturedPieceType)}`)
  const after = position.clone()
  after.doMove(move)
  if (after.checked) out.push('gives check')
  if (move.promote) out.push(`promotes to ${PIECE_CHAR[after.board.at(move.to)!.type]}`)
  if (!(move.from instanceof Square)) out.push(`drops a ${pieceName(move.pieceType)}`)
  const targets = attackedEnemies(position, move).filter((t) => t !== move.capturedPieceType)
  if (targets.length >= 2) out.push(`forks ${targets.slice(0, 2).map(pieceName).join(' and ')}`)
  else if (targets.length === 1 && PIECE_VALUE[targets[0]] >= 5) out.push(`attacks the ${pieceName(targets[0])}`)
  return out
}

function lineText(sfen: string, pv: string[], plies: number): string {
  const p = positionOf(sfen)
  const out: string[] = []
  for (const usi of pv.slice(0, plies)) {
    const move = p.createMoveByUSI(usi)
    if (!move || !p.isValidMove(move)) break
    out.push(formatMove(p, move))
    p.doMove(move)
  }
  return out.join(' ')
}

export function explainMistake(sfen: string, usi: string, best: Candidate, reply: Candidate | null): string[] {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return []
  const reasons: string[] = []
  const after = position.clone()
  after.doMove(move)
  const hangingBefore = hangingPieces(position, move.color)
  for (const [square, type] of hangingPieces(after, move.color)) {
    if (hangingBefore.has(square) || square === move.to.usi) continue
    reasons.push(`Your move leaves the ${pieceName(type)} on ${squareName(square)} hanging: it is attacked and not safely defended`)
  }
  if ('mate' in best.score && best.score.mate > 0 && best.move !== usi)
    reasons.push(`Missed a forced mate in ${best.score.mate}: ${lineText(sfen, best.pv, best.score.mate)}`)
  if (reply && 'mate' in reply.score && reply.score.mate > 0)
    reasons.push(`This allows the opponent to mate in ${reply.score.mate}: ${lineText(after.sfen, reply.pv, reply.score.mate)}`)
  if (reply) {
    const replyMove = after.createMoveByUSI(reply.move)
    if (replyMove?.capturedPieceType && replyMove.to.equals(move.to))
      reasons.push(`Your ${pieceName(after.board.at(move.to)!.type)} on ${squareName(move.to.usi)} can just be taken: ${formatMove(after, replyMove)}`)
    else if (isHanging(position, move)) reasons.push(`The ${pieceName(after.board.at(move.to)!.type)} you moved is left en prise on ${squareName(move.to.usi)}`)
    const { swing, captured } = materialSwing(after, reply.pv, move.color, 6)
    const lost = captured.filter((c) => c.by !== move.color).map((c) => pieceName(c.type))
    if (swing <= -4 && lost.length)
      reasons.push(`Opponent's best line wins material (you lose ${lost.join(', ')}): ${lineText(after.sfen, reply.pv, 6)}`)
    const threat = describeMove(after.sfen, reply.move)
    if (threat.length) reasons.push(`Opponent's strongest reply ${formatMove(after, after.createMoveByUSI(reply.move)!)} ${threat.join(', ')}`)
  }
  if (best.move !== usi) {
    const { swing } = materialSwing(position, best.pv, move.color, 6)
    if (swing >= 4) reasons.push(`The best move ${lineText(sfen, [best.move], 1)} wins material: ${lineText(sfen, best.pv, 6)}`)
  }
  return reasons
}

export function bestMoveReasons(sfen: string, best: Candidate): string[] {
  const what = describeMove(sfen, best.move)
  const reasons = what.length ? [`${lineText(sfen, [best.move], 1)} ${what.join(', ')}`] : []
  reasons.push(`Engine line: ${lineText(sfen, best.pv, 8)}`)
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

export function classify(params: {
  sfen: string
  usi: string
  before: Analysis
  after: Analysis | null
  inBook: boolean
  previousLoss?: number
}): MoveReview {
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

  const bad = ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(label)
  return {
    usi,
    label,
    loss,
    before: best.score,
    after: afterScore,
    best,
    reply,
    reasons: bad ? explainMistake(sfen, usi, best, reply) : describeMove(sfen, usi),
    bestReasons: best.move === usi ? [] : bestMoveReasons(sfen, best),
  }
}

export function usiPosition(sfen: string): string {
  return `position sfen ${sfen}`
}

export async function reviewMove(sfen: string, usi: string, opts: { inBook?: boolean; movetime?: number; previousLoss?: number } = {}): Promise<MoveReview> {
  const movetime = opts.movetime ?? 300
  const before = await analyze(usiPosition(sfen), { multipv: 3, movetime })
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move || !position.doMove(move)) throw new Error(`illegal ${usi}`)
  const known = before.candidates.find((c) => c.move === usi && c.pv.length > 1)
  const after: Analysis = known
    ? { bestmove: known.pv[1], candidates: [{ ...known, move: known.pv[1], pv: known.pv.slice(1), score: negate(known.score) }] }
    : await analyze(usiPosition(position.sfen), { multipv: 1, movetime })
  return classify({ sfen, usi, before, after, inBook: opts.inBook ?? false, previousLoss: opts.previousLoss })
}
