import { PieceType, Square } from 'tsshogi'
import { scoreWinRate, type Label, type MoveReview } from './analysis'
import { isBad } from './mistake'
import { buildReport, phaseBounds, phaseOf, scoreFromLoss, weaknessOf, playerMoves, type Phase, type RatedMove, type Weakness } from './learning'
import { colorSide, positionOf, type Side } from './shogi'

/**
 * Cross-game analysis: tendencies, repeated mistakes and where to work, from every game the player marked as theirs.
 * Pure: reviews come in through `reviewOf`, nothing is stored here.
 */

export type InsightGame = {
  id: string
  title: string
  start: string
  moves: string[]
  side: Side
  savedAt: number
  result?: 'win' | 'loss' | 'resigned' | 'time'
}

export type SkillKey = 'opening' | 'middle' | 'endgame' | 'convert' | 'tenacity' | 'punish' | 'steady'
export type Skill = { key: SkillKey; value: number | null; hits: number; total: number; avgLoss?: number; mistakeRate?: number }

export type Recurring = {
  sfen: string
  ply: number
  count: number
  games: number
  played: string[]
  best: string
  avgLoss: number
  tag: Weakness
  example: RatedMove & { gameId: string }
}
export type PieceStat = { piece: string; moves: number; mistakes: number; rate: number }

export type SuggestionKind = 'recurring' | 'phase' | 'weakness' | 'convert' | 'tenacity' | 'punish' | 'steady' | 'piece' | 'turn'
export type Suggestion = { kind: SuggestionKind; weight: number; params: Record<string, string | number>; phase?: Phase; tag?: Weakness }

export type GameSummary = {
  id: string
  title: string
  savedAt: number
  rated: number
  total: number
  accuracy: number | null
  avgLoss: number | null
  mistakes: number
}

export type Insights = {
  included: number
  /** My moves with a rating / all my moves in the included games. */
  coverage: { rated: number; total: number }
  games: GameSummary[]
  skills: Skill[]
  recurring: Recurring[]
  pieces: PieceStat[]
  /** Median ply of the first bad move of mine, across games that had one. */
  turningPly: number | null
  suggestions: Suggestion[]
}

const ADVANTAGE = 0.65
const BEHIND = 0.35
const RECOVERED = 0.5
const KEPT = 0.6
const SOLID: Label[] = ['brilliant', 'great', 'best', 'excellent', 'good', 'book']
const MIN_SAMPLE = 3

const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')
const other = (side: Side): Side => (side === 'sente' ? 'gote' : 'sente')
const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const DROPPED: Record<string, PieceType> = {
  P: PieceType.PAWN,
  L: PieceType.LANCE,
  N: PieceType.KNIGHT,
  S: PieceType.SILVER,
  G: PieceType.GOLD,
  B: PieceType.BISHOP,
  R: PieceType.ROOK,
}

function pieceOf(sfen: string, usi: string) {
  if (usi[1] === '*') return DROPPED[usi[0]] ?? null
  const from = Square.newByUSI(usi.slice(0, 2))
  const piece = from && positionOf(sfen).board.at(from)
  return piece ? piece.type : null
}

type Rated = { mine: RatedMove[]; theirs: RatedMove[]; total: number }

function rateGame(game: InsightGame, reviewOf: (sfen: string, usi: string) => MoveReview | undefined): Rated {
  const rate = (side: Side) =>
    playerMoves(game, side).flatMap((m) => {
      const review = reviewOf(m.sfen, m.usi)
      return review ? [{ ...m, review }] : []
    })
  return { mine: rate(game.side), theirs: rate(other(game.side)), total: playerMoves(game, game.side).length }
}

/** My win chance at the start of each rated move (either side), in ply order. */
function trajectory(game: InsightGame, rated: Rated) {
  return [...rated.mine, ...rated.theirs]
    .sort((a, b) => a.ply - b.ply)
    .map((m) => {
      const mover = colorSide(positionOf(m.sfen).color)
      const wr = scoreWinRate(m.review.before)
      return { ply: m.ply, wr: mover === game.side ? wr : 1 - wr }
    })
}

export function buildInsights(games: InsightGame[], reviewOf: (sfen: string, usi: string) => MoveReview | undefined): Insights {
  const phaseLoss: Record<Phase, { n: number; loss: number; bad: number }> = {
    opening: { n: 0, loss: 0, bad: 0 },
    middle: { n: 0, loss: 0, bad: 0 },
    endgame: { n: 0, loss: 0, bad: 0 },
  }
  const summaries: GameSummary[] = []
  const positions = new Map<string, { items: (RatedMove & { gameId: string })[]; games: Set<string> }>()
  const pieces = new Map<string, { moves: number; mistakes: number }>()
  const tally = new Map<Weakness, number>()
  const turning: number[] = []
  let advantageGames = 0
  let advantageKept = 0
  let behindGames = 0
  let behindRecovered = 0
  let punishChances = 0
  let punished = 0
  let collapseGames = 0
  let collapseSteady = 0
  let rated = 0
  let total = 0

  for (const game of games) {
    const r = rateGame(game, reviewOf)
    rated += r.mine.length
    total += r.total
    const report = buildReport(game, game.side, reviewOf)
    summaries.push({
      id: game.id,
      title: game.title,
      savedAt: game.savedAt,
      rated: r.mine.length,
      total: r.total,
      accuracy: report.accuracy,
      avgLoss: report.avgLoss,
      mistakes: report.mistakes,
    })
    const bounds = phaseBounds(game)
    for (const m of r.mine) {
      const bucket = phaseLoss[phaseOf(m.ply, bounds)]
      bucket.n++
      bucket.loss += m.review.loss
      const bad = isBad(m.review.label)
      if (bad) bucket.bad++
      const piece = pieceOf(m.sfen, m.usi)
      if (piece !== null) {
        const entry = pieces.get(String(piece)) ?? { moves: 0, mistakes: 0 }
        entry.moves++
        if (bad) entry.mistakes++
        pieces.set(String(piece), entry)
      }
      if (bad) {
        const key = strip(m.sfen)
        const entry = positions.get(key) ?? { items: [], games: new Set<string>() }
        entry.items.push({ ...m, gameId: game.id })
        entry.games.add(game.id)
        positions.set(key, entry)
        const tag = weaknessOf({ ply: m.ply, ...m.review })
        tally.set(tag, (tally.get(tag) ?? 0) + 1)
      }
    }
    const firstBad = r.mine.filter((m) => isBad(m.review.label)).sort((a, b) => a.ply - b.ply)[0]
    if (firstBad) turning.push(firstBad.ply)

    const line = trajectory(game, r)
    if (line.length >= MIN_SAMPLE) {
      const last = line.at(-1)!.wr
      const won = game.result ? game.result === 'win' : last >= KEPT
      const peak = line.findIndex((p) => p.wr >= ADVANTAGE)
      if (peak >= 0) {
        advantageGames++
        if (won) advantageKept++
      }
      const low = line.findIndex((p) => p.wr <= BEHIND)
      if (low >= 0) {
        behindGames++
        if (game.result === 'win' || line.slice(low).some((p) => p.wr >= RECOVERED)) behindRecovered++
      }
    }
    for (const m of r.theirs) {
      if (!isBad(m.review.label)) continue
      const reply = r.mine.find((mine) => mine.ply === m.ply + 1)
      if (!reply) continue
      punishChances++
      if (SOLID.includes(reply.review.label)) punished++
    }
    const firstTheirs = r.theirs.filter((m) => isBad(m.review.label)).sort((a, b) => a.ply - b.ply)[0]
    if (firstBad || firstTheirs) {
      collapseGames++
      if (!firstBad || (firstTheirs && firstTheirs.ply < firstBad.ply)) collapseSteady++
    }
  }

  const phaseSkill = (key: Phase): Skill => {
    const b = phaseLoss[key]
    return {
      key,
      value: b.n >= MIN_SAMPLE ? scoreFromLoss(b.loss / b.n) : null,
      hits: b.n - b.bad,
      total: b.n,
      avgLoss: b.n >= MIN_SAMPLE ? Math.round((b.loss / b.n) * 100) : undefined,
      mistakeRate: b.n >= MIN_SAMPLE ? Math.round((b.bad / b.n) * 100) : undefined,
    }
  }
  const ratio = (key: SkillKey, hits: number, n: number): Skill => ({ key, value: n >= MIN_SAMPLE ? Math.round((hits / n) * 100) : null, hits, total: n })
  const skills = [
    phaseSkill('opening'),
    phaseSkill('middle'),
    phaseSkill('endgame'),
    ratio('convert', advantageKept, advantageGames),
    ratio('tenacity', behindRecovered, behindGames),
    ratio('punish', punished, punishChances),
    ratio('steady', collapseSteady, collapseGames),
  ]

  const recurring: Recurring[] = [...positions.values()]
    .filter((p) => p.games.size >= 2 || p.items.length >= 2)
    .map((p) => {
      const worst = [...p.items].sort((a, b) => b.review.loss - a.review.loss)[0]
      return {
        sfen: worst.sfen,
        ply: worst.ply,
        count: p.items.length,
        games: p.games.size,
        played: [...new Set(p.items.map((i) => i.usi))],
        best: worst.review.best.move,
        avgLoss: Math.round((p.items.reduce((s, i) => s + i.review.loss, 0) / p.items.length) * 100),
        tag: weaknessOf({ ply: worst.ply, ...worst.review }),
        example: worst,
      }
    })
    .sort((a, b) => b.count - a.count || b.avgLoss - a.avgLoss)
    .slice(0, 8)

  const pieceStats: PieceStat[] = [...pieces.entries()]
    .filter(([, v]) => v.moves >= 5)
    .map(([piece, v]) => ({ piece, moves: v.moves, mistakes: v.mistakes, rate: Math.round((v.mistakes / v.moves) * 100) }))
    .sort((a, b) => b.rate - a.rate)

  const turningPly = median(turning)
  const suggestions: Suggestion[] = []
  if (recurring.length)
    suggestions.push({
      kind: 'recurring',
      weight: 100 + recurring.length,
      params: { count: recurring.length, times: recurring.reduce((s, r) => s + r.count, 0) },
    })
  const worstPhase = skills
    .slice(0, 3)
    .filter((s): s is Skill & { value: number } => s.value !== null)
    .sort((a, b) => a.value - b.value)[0]
  if (worstPhase && worstPhase.value < 85)
    suggestions.push({
      kind: 'phase',
      weight: 90 - worstPhase.value / 2,
      phase: worstPhase.key as Phase,
      params: { score: worstPhase.value, loss: worstPhase.avgLoss ?? 0 },
    })
  const topTag = [...tally.entries()].filter(([tag]) => tag !== 'other').sort((a, b) => b[1] - a[1])[0]
  if (topTag && topTag[1] >= 2) suggestions.push({ kind: 'weakness', weight: 80 + topTag[1], tag: topTag[0], params: { count: topTag[1] } })
  for (const key of ['convert', 'tenacity', 'punish', 'steady'] as const) {
    const s = skills.find((x) => x.key === key)!
    if (s.value !== null && s.value < 60) suggestions.push({ kind: key, weight: 70 - s.value / 2, params: { percent: s.value, hits: s.hits, total: s.total } })
  }
  if (pieceStats[0] && pieceStats[0].rate >= 15)
    suggestions.push({ kind: 'piece', weight: 60, params: { piece: pieceStats[0].piece, percent: pieceStats[0].rate, moves: pieceStats[0].moves } })
  if (turningPly !== null && turning.length >= 3) suggestions.push({ kind: 'turn', weight: 50, params: { ply: turningPly } })
  suggestions.sort((a, b) => b.weight - a.weight)

  return {
    included: games.length,
    coverage: { rated, total },
    games: summaries.sort((a, b) => a.savedAt - b.savedAt),
    skills,
    recurring,
    pieces: pieceStats,
    turningPly,
    suggestions,
  }
}
