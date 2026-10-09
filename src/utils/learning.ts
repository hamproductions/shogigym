import { LABELS, scoreWinRate, type Label, type MoveReview } from './analysis'
import type { Score } from './engine'
import i18n from './i18n'
import { applyUsi, colorSide, positionOf } from './shogi'
import { isBad, isWeak } from './mistake'
import type { Mistake } from './mistakes'

/**
 * Deterministic learning analytics. Everything here is derived from data the
 * app already stores (rated moves, saved games, saved mistakes, spaced-repetition
 * cards), so it works with a handful of games and needs no server or LLM.
 */

export type Phase = 'opening' | 'middle' | 'endgame'
export const PHASES: Phase[] = ['opening', 'middle', 'endgame']
const OPENING_END = 30
const MIDDLE_END = 80

export const phaseOf = (ply: number): Phase => (ply <= OPENING_END ? 'opening' : ply <= MIDDLE_END ? 'middle' : 'endgame')

export type Weakness = 'missedMate' | 'allowedMate' | 'hangs' | 'slippedWin' | 'openingSlip' | 'other'
export const WEAKNESSES: Weakness[] = ['missedMate', 'allowedMate', 'hangs', 'slippedWin', 'openingSlip', 'other']

const mateFor = (score: Score | undefined) => (score && 'mate' in score ? score.mate : 0)
const reasonPrefix = (key: string, lng: string) =>
  i18n.t(key, { lng, move: '\u0000', line: '\u0000', piece: '\u0000', pieces: '\u0000', square: '\u0000', count: 0 }).split('\u0000')[0]

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
  if (before && after && scoreWinRate(before) >= 0.7 && scoreWinRate(after) < 0.5) return 'slippedWin'
  if (ply <= OPENING_END && (loss === undefined || loss > 0)) return 'openingSlip'
  return 'other'
}

export const weaknessOfMistake = (m: Pick<Mistake, 'label' | 'ply' | 'reasons'> & { tag?: string }): Weakness =>
  (WEAKNESSES as string[]).includes(m.tag ?? '') ? (m.tag as Weakness) : weaknessOf({ ply: m.ply, label: m.label, reasons: m.reasons })

/** Accuracy-style score 0–100 from mean win-chance loss (0 = perfect). */
export const scoreFromLoss = (meanLoss: number) => Math.max(0, Math.min(100, Math.round(100 - meanLoss * 400)))

export type RatedMove = {
  gameId: string
  ply: number
  sfen: string
  usi: string
  review: MoveReview
}

export type GameLike = {
  id: string
  start: string
  moves: string[]
  userSide: 'sente' | 'gote'
  vsAi?: boolean
  result?: string
  title?: string
  savedAt?: number
}

/** The player's own moves that have a stored engine rating. */
export function ratedMoves(games: GameLike[], reviewOf: (sfen: string, usi: string) => MoveReview | undefined): RatedMove[] {
  const out: RatedMove[] = []
  for (const g of games) {
    if (!g.vsAi) continue
    let at: string | null = g.start
    for (let i = 0; i < g.moves.length && at; i++) {
      const usi = g.moves[i]
      if (colorSide(positionOf(at).color) === g.userSide) {
        const review = reviewOf(at, usi)
        if (review) out.push({ gameId: g.id, ply: i + 1, sfen: at, usi, review })
      }
      at = applyUsi(at, usi)
    }
  }
  return out
}

type Bucket = { moves: number; loss: number }
const bucket = (): Bucket => ({ moves: 0, loss: 0 })
const add = (b: Bucket, loss: number) => {
  b.moves++
  b.loss += loss
}
const readout = (b: Bucket, min: number) => ({ moves: b.moves, score: b.moves >= min ? scoreFromLoss(b.loss / b.moves) : null })

export type Highlight = RatedMove & { rank: number }

const PRAISE_RANK: Partial<Record<Label, number>> = { brilliant: 3, great: 2, best: 1 }

export type Profile = {
  games: number
  movesRated: number
  record: { win: number; loss: number; other: number }
  phases: Record<Phase, { moves: number; score: number | null }>
  traits: { accuracy: number | null; tactics: number | null; conversion: number | null; tenacity: number | null }
  weaknesses: { tag: Weakness; count: number; example?: Pick<Mistake, 'id' | 'sfen' | 'played' | 'best' | 'ply'> }[]
  highlights: Highlight[]
  labelCounts: Partial<Record<Label, number>>
  strongest: Phase | null
  weakest: Phase | null
}

const MIN_PHASE = 6
const MIN_TRAIT = 5

export function buildProfile(games: GameLike[], mistakes: Mistake[], reviewOf: (sfen: string, usi: string) => MoveReview | undefined): Profile {
  const moves = ratedMoves(games, reviewOf)
  const phases: Record<Phase, Bucket> = { opening: bucket(), middle: bucket(), endgame: bucket() }
  const all = bucket()
  const ahead = bucket()
  const behind = bucket()
  const labelCounts: Profile['labelCounts'] = {}
  let weak = 0
  for (const m of moves) {
    const { loss, label, before } = m.review
    add(phases[phaseOf(m.ply)], loss)
    add(all, loss)
    labelCounts[label] = (labelCounts[label] ?? 0) + 1
    if (isWeak(label)) weak++
    const wr = scoreWinRate(before)
    if (wr >= 0.65) add(ahead, loss)
    else if (wr <= 0.35) add(behind, loss)
  }

  const found = new Map<string, { tag: Weakness; example: NonNullable<Profile['weaknesses'][number]['example']> }>()
  for (const m of moves) {
    if (!isBad(m.review.label)) continue
    const id = `${m.sfen}|${m.usi}`
    found.set(id, {
      tag: weaknessOf({ ply: m.ply, ...m.review }),
      example: { id, sfen: m.sfen, played: m.usi, best: m.review.best.move, ply: m.ply },
    })
  }
  for (const m of mistakes)
    if (!found.has(m.id)) found.set(m.id, { tag: weaknessOfMistake(m), example: { id: m.id, sfen: m.sfen, played: m.played, best: m.best, ply: m.ply } })
  const tally = new Map<Weakness, Profile['weaknesses'][number]>()
  for (const { tag, example } of found.values()) {
    const row = tally.get(tag) ?? { tag, count: 0, example }
    row.count++
    tally.set(tag, row)
  }

  const phaseScores = PHASES.map((p) => ({ p, ...readout(phases[p], MIN_PHASE) })).filter((r) => r.score !== null) as {
    p: Phase
    moves: number
    score: number
  }[]
  const ranked = [...phaseScores].sort((a, b) => b.score - a.score)

  const highlights = moves
    .flatMap((m): Highlight[] => {
      const rank = PRAISE_RANK[m.review.label]
      return rank ? [{ ...m, rank }] : []
    })
    .sort((a, b) => b.rank - a.rank || PHASES.indexOf(phaseOf(b.ply)) - PHASES.indexOf(phaseOf(a.ply)) || b.ply - a.ply)
    .slice(0, 5)

  return {
    games: new Set(moves.map((m) => m.gameId)).size,
    movesRated: moves.length,
    record: games.reduce(
      (r, g) =>
        g.vsAi
          ? g.result === 'win'
            ? { ...r, win: r.win + 1 }
            : g.result === 'loss' || g.result === 'resigned' || g.result === 'time'
              ? { ...r, loss: r.loss + 1 }
              : { ...r, other: r.other + 1 }
          : r,
      { win: 0, loss: 0, other: 0 },
    ),
    phases: {
      opening: readout(phases.opening, MIN_PHASE),
      middle: readout(phases.middle, MIN_PHASE),
      endgame: readout(phases.endgame, MIN_PHASE),
    },
    traits: {
      accuracy: readout(all, MIN_PHASE).score,
      tactics: moves.length >= MIN_PHASE ? Math.max(0, Math.min(100, Math.round(100 - (weak / moves.length) * 300))) : null,
      conversion: readout(ahead, MIN_TRAIT).score,
      tenacity: readout(behind, MIN_TRAIT).score,
    },
    weaknesses: [...tally.values()].sort((a, b) => b.count - a.count),
    highlights,
    labelCounts,
    strongest: ranked.length > 1 ? ranked[0].p : null,
    weakest: ranked.length > 1 ? ranked.at(-1)!.p : null,
  }
}

export const highlightLabel = (h: Highlight) => LABELS[h.review.label]

/* ---------- Curriculum: milestones and today's plan ---------- */

export type Route =
  | { kind: 'drill'; queue: 'due' | 'new' | 'difficult' | 'mistakes' }
  | { kind: 'tsume'; length: 1 | 3 | 5 | 7 }
  | { kind: 'tesuji' }
  | { kind: 'lesson'; courseId?: string }
  | { kind: 'spar' }
  | { kind: 'analyze' }

export const WEAKNESS_ROUTE: Record<Weakness, Route> = {
  missedMate: { kind: 'tsume', length: 3 },
  allowedMate: { kind: 'drill', queue: 'mistakes' },
  hangs: { kind: 'drill', queue: 'mistakes' },
  slippedWin: { kind: 'drill', queue: 'mistakes' },
  openingSlip: { kind: 'drill', queue: 'new' },
  other: { kind: 'drill', queue: 'mistakes' },
}

export type Snapshot = {
  due: number
  mistakesDue: number
  difficult: number
  newPositions: number
  learned: number
  started: number
  tsumeSolved: number
  tsumeByLength: Record<number, number>
  tesujiSolved: number
  openedLessons: number
  lessonToContinue?: { id: string; title: string; learned: number; total: number }
  gamesPlayed: number
  mistakesSaved: number
  streak: number
  practisedToday: boolean
}

export type Milestone = { id: string; done: boolean; route: Route }

export function journey(s: Snapshot): Milestone[] {
  return [
    { id: 'lesson', done: s.openedLessons >= 1, route: { kind: 'lesson' } },
    { id: 'memorize', done: s.started >= 5, route: { kind: 'drill', queue: 'new' } },
    { id: 'mate1', done: s.tsumeSolved >= 3, route: { kind: 'tsume', length: 1 } },
    { id: 'game', done: s.gamesPlayed >= 1, route: { kind: 'spar' } },
    { id: 'learnFromGame', done: s.mistakesSaved >= 1, route: { kind: 'analyze' } },
    { id: 'learned25', done: s.learned >= 25, route: { kind: 'drill', queue: 'new' } },
    { id: 'streak3', done: s.streak >= 3, route: { kind: 'drill', queue: 'due' } },
  ]
}

export type PlanItem = { id: string; route: Route; count?: number; minutes: number; focus?: Weakness; detail?: string }

/** Tsume level that matches what the player already solves. */
export function tsumeLevel(byLength: Record<number, number>): 1 | 3 | 5 | 7 {
  if ((byLength[5] ?? 0) >= 10) return 7
  if ((byLength[3] ?? 0) >= 10) return 5
  if ((byLength[1] ?? 0) >= 10) return 3
  return 1
}

export function todaysPlan(s: Snapshot, profile: Profile): PlanItem[] {
  const items: PlanItem[] = []
  if (s.due > 0) items.push({ id: 'due', route: { kind: 'drill', queue: 'due' }, count: s.due, minutes: Math.min(15, Math.max(2, Math.ceil(s.due / 3))) })
  if (s.mistakesDue > 0)
    items.push({
      id: 'mistakes',
      route: { kind: 'drill', queue: 'mistakes' },
      count: s.mistakesDue,
      minutes: Math.min(15, Math.max(2, Math.ceil(s.mistakesDue / 2))),
    })
  const top = profile.weaknesses.find((w) => w.tag !== 'other')
  if (top && top.tag === 'missedMate') items.push({ id: 'focusMate', route: WEAKNESS_ROUTE.missedMate, minutes: 5, focus: top.tag, count: top.count })
  if (s.lessonToContinue && s.openedLessons > 0)
    items.push({
      id: 'continueLesson',
      route: { kind: 'lesson', courseId: s.lessonToContinue.id },
      minutes: 5,
      detail: s.lessonToContinue.title,
      count: s.lessonToContinue.total - s.lessonToContinue.learned,
    })
  else if (s.openedLessons === 0) items.push({ id: 'startLesson', route: { kind: 'lesson' }, minutes: 5, detail: s.lessonToContinue?.title })
  if (s.difficult > 0) items.push({ id: 'difficult', route: { kind: 'drill', queue: 'difficult' }, count: s.difficult, minutes: 3 })
  if (s.due === 0 && s.newPositions > 0) items.push({ id: 'learnNew', route: { kind: 'drill', queue: 'new' }, count: Math.min(10, s.newPositions), minutes: 5 })
  items.push({ id: 'tsume', route: { kind: 'tsume', length: tsumeLevel(s.tsumeByLength) }, minutes: 3 })
  if (s.gamesPlayed < 3 || profile.games === 0) items.push({ id: 'play', route: { kind: 'spar' }, minutes: 15 })
  return items.slice(0, 5)
}
