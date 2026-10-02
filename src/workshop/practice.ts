import problemsData from '../data/tsume.json'
import { analyze, engineSupported } from '../engine'
import { COURSES, SETUPS, findPath, sideToMove, walkNodes, type Course, type JosekiNode } from '../model'
import { getSettings } from './settings'
import { getCard, isDifficult, isLearned, positionKey } from '../srs'
import { loadMistakes, type Mistake } from '../mistakes'
import { applyUsi, colorSide, hasLegalMove, moveText, positionOf, type Side } from '../shogi'

export type Problem = { id: string; mate: number; sfen: string; pv: string[] }
const BASE = problemsData as Problem[]

const MATE_IN_ONE: Problem[] = BASE.filter((p) => p.mate === 3 && p.pv.length >= 3).flatMap((p) => {
  const after = applyUsi(applyUsi(p.sfen, p.pv[0]) ?? '', p.pv[1])
  return after ? [{ id: `${p.id}-m1`, mate: 1, sfen: after, pv: [p.pv[2]] }] : []
})

export const PROBLEMS = [...MATE_IN_ONE, ...BASE]

const STATS_KEY = 'joseki-practice:tsume:v1'
export type TsumeStats = { solved: string[]; failed: string[] }

export function loadTsumeStats(): TsumeStats {
  try {
    return { solved: [], failed: [], ...JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}') }
  } catch {
    return { solved: [], failed: [] }
  }
}

export function markTsume(id: string, key: 'solved' | 'failed') {
  const stats = loadTsumeStats()
  const next = { ...stats, [key]: [...new Set([...stats[key], id])] }
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('tsume stats not persisted', error)
  }
  return next
}

export function pickProblem(length: number | 'all', exclude?: string): Problem {
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => (length === 'all' || p.mate === length) && p.id !== exclude)
  const unsolved = pool.filter((p) => !stats.solved.includes(p.id))
  const from = unsolved.length ? unsolved : pool
  return from[Math.floor(Math.random() * from.length)]
}

export const attackerOf = (problem: Problem): Side => colorSide(positionOf(problem.sfen).color)

export type TsumeVerdict = { kind: 'continue'; offBook: boolean } | { kind: 'solved' } | { kind: 'wrong'; reason: string }

export async function judgeTsumeMove(problem: Problem, line: string[], sfen: string, usi: string, onBook: boolean): Promise<TsumeVerdict> {
  const next = applyUsi(sfen, usi)
  if (!next) return { kind: 'wrong', reason: 'That move is not legal.' }
  const after = positionOf(next)
  if (!after.checked) return { kind: 'wrong', reason: 'In tsume every attacking move must give check. This move does not.' }
  if (!hasLegalMove(after)) return { kind: 'solved' }
  if (onBook && usi === problem.pv[line.length]) return { kind: 'continue', offBook: false }
  if (!engineSupported()) return { kind: 'wrong', reason: `The stored solution plays ${moveText(sfen, problem.pv[line.length])}.` }
  const movesLeft = Math.ceil((problem.mate - line.length) / 2)
  const result = await analyze(`position sfen ${next}`, { multipv: 1, movetime: 800 })
  const score = result.candidates[0]?.score
  const plies = score && 'mate' in score && score.mate < 0 ? -score.mate : null
  if (plies !== null && Math.ceil(plies / 2) <= movesLeft - 1) return { kind: 'continue', offBook: true }
  return { kind: 'wrong', reason: `After this check the defence holds: there is no forced mate in the ${movesLeft - 1 > 0 ? `${movesLeft - 1} move${movesLeft - 1 === 1 ? '' : 's'}` : 'moves'} left.` }
}

export async function defenderMove(problem: Problem, line: string[], sfen: string, onBook: boolean): Promise<string | null> {
  if (onBook && problem.pv[line.length]) return problem.pv[line.length]
  if (!engineSupported()) return null
  const result = await analyze(`position sfen ${sfen}`, { multipv: 1, movetime: 600 })
  return result.bestmove && !['resign', 'win'].includes(result.bestmove) ? result.bestmove : null
}

export const mistakeKey = (id: string) => `mistake#${id}`

export type ReviewItem =
  | { kind: 'position'; key: string; course: Course; node: JosekiNode; moves: string[] }
  | { kind: 'mistake'; key: string; mistake: Mistake }

export type ReviewQueue = 'due' | 'new' | 'difficult' | 'mistakes'

type Spot = { key: string; course: Course; node: JosekiNode; depth: number; alts: { course: Course; node: JosekiNode; depth: number }[] }
const positionsCache = new Map<string, Spot[]>()

export const coursesForMain = (main: string) => {
  const ids = new Set(SETUPS.filter((s) => s.technique || s.main === main).flatMap((s) => s.courseIds))
  return COURSES.filter((c) => ids.has(c.id))
}

function trainablePositions() {
  const main = getSettings().mainStrategy
  const cached = positionsCache.get(main)
  if (cached) return cached
  const seen = new Map<string, Spot>()
  for (const course of coursesForMain(main))
    walkNodes(course.root, (node, path) => {
      if (sideToMove(node) !== course.userSide || !node.branches.some((b) => b.kind !== 'deviation')) return
      const key = positionKey(node.sfen)
      const hit = seen.get(key)
      if (hit) hit.alts.push({ course, node, depth: path.length })
      else seen.set(key, { key, course, node, depth: path.length, alts: [{ course, node, depth: path.length }] })
    })
  const spots = [...seen.values()]
  positionsCache.set(main, spots)
  return spots
}

export function courseProgress(course: Course) {
  let total = 0
  let learned = 0
  walkNodes(course.root, (node) => {
    if (sideToMove(node) !== course.userSide || !node.branches.some((b) => b.kind !== 'deviation')) return
    total++
    if (isLearned(getCard(positionKey(node.sfen)))) learned++
  })
  return { total, learned }
}

export function reviewCounts(now = Date.now()) {
  const all = trainablePositions()
  return {
    due: all.filter((i) => (getCard(i.key)?.due ?? Infinity) <= now).length,
    new: all.filter((i) => !getCard(i.key)).length,
    difficult: all.filter((i) => {
      const c = getCard(i.key)
      return c && isDifficult(c)
    }).length,
    mistakes: loadMistakes().filter((m) => (getCard(mistakeKey(m.id))?.due ?? 0) <= now).length,
    started: all.filter((i) => getCard(i.key)).length + loadMistakes().filter((m) => getCard(mistakeKey(m.id))).length,
    nextDue: Math.min(...all.map((i) => getCard(i.key)?.due ?? Infinity), ...loadMistakes().map((m) => getCard(mistakeKey(m.id))?.due ?? Infinity)),
  }
}

export function buildQueue(queue: ReviewQueue, now = Date.now()): ReviewItem[] {
  if (queue === 'mistakes') return loadMistakes().filter((m) => (getCard(mistakeKey(m.id))?.due ?? 0) <= now).map((mistake) => ({ kind: 'mistake', key: mistakeKey(mistake.id), mistake }))
  const all = trainablePositions()
  const pick =
    queue === 'due'
      ? all.filter((i) => (getCard(i.key)?.due ?? Infinity) <= now)
      : queue === 'new'
        ? (() => {
            const opened = openedCourses()
            const rank = (id: string) => (opened.includes(id) ? opened.indexOf(id) : opened.length)
            return all
              .filter((i) => !getCard(i.key))
              .map((i) => ({ ...i, ...i.alts.reduce((best, a) => (rank(a.course.id) < rank(best.course.id) ? a : best), i.alts[0]) }))
              .sort((a, b) => rank(a.course.id) - rank(b.course.id) || a.course.id.localeCompare(b.course.id) || a.depth - b.depth)
              .slice(0, 10)
          })()
        : all.filter((i) => {
            const c = getCard(i.key)
            return c && isDifficult(c)
          })
  return pick.map((i) => ({ kind: 'position', key: i.key, course: i.course, node: i.node, moves: (findPath(i.course.root, i.node.id) ?? []).map((b) => b.usi) }))
}

export function expectedMoves(item: ReviewItem): string[] {
  return item.kind === 'mistake' ? [item.mistake.best] : item.node.branches.filter((b) => b.kind !== 'deviation').map((b) => b.usi)
}

const OPENED_KEY = 'joseki-practice:opened:v1'

export function openedCourses(): string[] {
  try {
    return JSON.parse(localStorage.getItem(OPENED_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function markOpened(id: string) {
  try {
    localStorage.setItem(OPENED_KEY, JSON.stringify([id, ...openedCourses().filter((x) => x !== id)].slice(0, 20)))
  } catch (error) {
    console.warn('opened lessons not persisted', error)
  }
}
