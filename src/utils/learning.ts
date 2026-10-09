import { scoreWinRate, type Label, type MoveReview } from './analysis'
import type { Score } from './engine'
import i18n from './i18n'
import { applyUsi, colorSide, positionOf, type Side } from './shogi'
import { isBad } from './mistake'
import type { Mistake } from './mistakes'

/**
 * Stateless game analysis: given one game and the engine ratings of its moves,
 * say what went wrong and how to fix it. Nothing here is stored.
 */

export type Phase = 'opening' | 'middle' | 'endgame'
export const PHASES: Phase[] = ['opening', 'middle', 'endgame']
const OPENING_END = 30
const MIDDLE_END = 100

export const phaseOf = (ply: number): Phase => (ply <= OPENING_END ? 'opening' : ply <= MIDDLE_END ? 'middle' : 'endgame')

export type Weakness = 'missedMate' | 'allowedMate' | 'hangs' | 'allowedTactic' | 'slippedWin' | 'openingSlip' | 'other'
export const WEAKNESSES: Weakness[] = ['missedMate', 'allowedMate', 'hangs', 'allowedTactic', 'slippedWin', 'openingSlip', 'other']

const mateFor = (score: Score | undefined) => (score && 'mate' in score ? score.mate : 0)
const reasonPrefix = (key: string, lng: string) =>
  i18n.t(key, { lng, move: '\u0000', line: '\u0000', piece: '\u0000', pieces: '\u0000', square: '\u0000', count: 0, what: '\u0000' }).split('\u0000')[0]

function reasonsMention(reasons: string[], keys: string[]) {
  const prefixes = keys.flatMap((key) => ['en', 'ja'].map((lng) => reasonPrefix(key, lng))).filter((p) => p.length > 1)
  return reasons.some((reason) => prefixes.some((p) => reason.startsWith(p)))
}

export type Swing = { ply: number; label: Label; loss?: number; before?: Score; after?: Score; reasons?: string[] }

/** The single most useful explanation for why a move was bad, in priority order. */
export function weaknessOf({ ply, loss, before, after, reasons = [] }: Swing): Weakness {
  const mateBefore = mateFor(before)
  const mateAfter = mateFor(after)
  if (mateBefore > 0 && mateAfter <= 0) return 'missedMate'
  if ((mateAfter < 0 && mateBefore >= 0) || (mateBefore >= 0 && reasonsMention(reasons, ['moveFacts.allowsMate']))) return 'allowedMate'
  if (reasonsMention(reasons, ['moveFacts.enPrise', 'moveFacts.losesMaterial'])) return 'hangs'
  if (reasonsMention(reasons, ['moveFacts.strongestReply'])) return 'allowedTactic'
  if (before && after && scoreWinRate(before) >= 0.7 && scoreWinRate(after) < 0.5) return 'slippedWin'
  if (ply <= OPENING_END && (loss === undefined || loss > 0)) return 'openingSlip'
  return 'other'
}

export const weaknessOfMistake = (m: Pick<Mistake, 'label' | 'ply' | 'reasons'>): Weakness => weaknessOf({ ply: m.ply, label: m.label, reasons: m.reasons })

/** Accuracy-style score 0–100 from mean win-chance loss (0 = perfect). */
export const scoreFromLoss = (meanLoss: number) => Math.max(0, Math.min(100, Math.round(100 - meanLoss * 400)))

export type GameLike = { start: string; moves: string[] }
export type MoveRef = { ply: number; sfen: string; usi: string }
export type RatedMove = MoveRef & { review: MoveReview }
export type Problem = RatedMove & { tag: Weakness }

/** The player's own moves in the game. */
export function playerMoves(game: GameLike, side: Side): MoveRef[] {
  const out: MoveRef[] = []
  let at: string | null = game.start
  for (let i = 0; i < game.moves.length && at; i++) {
    if (colorSide(positionOf(at).color) === side) out.push({ ply: i + 1, sfen: at, usi: game.moves[i] })
    at = applyUsi(at, game.moves[i])
  }
  return out
}

export type Report = {
  total: number
  rated: number
  accuracy: number | null
  phases: Record<Phase, { moves: number; score: number | null }>
  good: number
  problems: Problem[]
  patterns: { tag: Weakness; count: number }[]
  praise: RatedMove[]
}

const MIN_SCORE = 3
const PRAISE: Partial<Record<Label, number>> = { brilliant: 3, great: 2, best: 1 }
const SOLID: Label[] = ['brilliant', 'great', 'best', 'excellent', 'good', 'book']

export function buildReport(game: GameLike, side: Side, reviewOf: (sfen: string, usi: string) => MoveReview | undefined): Report {
  const mine = playerMoves(game, side)
  const rated: RatedMove[] = mine.flatMap((m) => {
    const review = reviewOf(m.sfen, m.usi)
    return review ? [{ ...m, review }] : []
  })
  const sums: Record<Phase, [number, number]> = { opening: [0, 0], middle: [0, 0], endgame: [0, 0] }
  let loss = 0
  let good = 0
  for (const m of rated) {
    const bucket = sums[phaseOf(m.ply)]
    bucket[0]++
    bucket[1] += m.review.loss
    loss += m.review.loss
    if (SOLID.includes(m.review.label)) good++
  }
  const score = (n: number, l: number) => (n >= MIN_SCORE ? scoreFromLoss(l / n) : null)
  const problems = rated
    .filter((m) => isBad(m.review.label))
    .map((m): Problem => ({ ...m, tag: weaknessOf({ ply: m.ply, ...m.review }) }))
    .sort((a, b) => b.review.loss - a.review.loss)
  const tally = new Map<Weakness, number>()
  for (const p of problems) tally.set(p.tag, (tally.get(p.tag) ?? 0) + 1)
  return {
    total: mine.length,
    rated: rated.length,
    accuracy: score(rated.length, loss),
    phases: {
      opening: { moves: sums.opening[0], score: score(...sums.opening) },
      middle: { moves: sums.middle[0], score: score(...sums.middle) },
      endgame: { moves: sums.endgame[0], score: score(...sums.endgame) },
    },
    good,
    problems,
    patterns: [...tally.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
    praise: rated
      .filter((m) => PRAISE[m.review.label])
      .sort((a, b) => PRAISE[b.review.label]! - PRAISE[a.review.label]! || b.ply - a.ply)
      .slice(0, 3),
  }
}
