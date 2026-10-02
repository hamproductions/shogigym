import { bookLookup } from '../../kifu'
import { strategiesAt } from '../../catalog'
import { LEGACY_AI_STRATEGY } from '../../data/strategies'
import { COURSES, SETUPS, type Course, type JosekiMove, type JosekiNode } from '../../model'
import type { Side } from '../../shogi'

export type CourseNodes = Map<string, JosekiNode>
export type BookMove = { usi: string; note?: string; kind: string }
export type BookHit = { branch: JosekiMove; course: Course }

export const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

export const mainBranch = (node: JosekiNode | null | undefined) => node?.branches.find((b) => b.kind === 'main' && b.child) ?? node?.branches.find((b) => b.kind !== 'deviation' && b.child)

export const goodBranches = (node: JosekiNode | null | undefined) => node?.branches.filter((b) => b.kind !== 'deviation' && b.child) ?? []

const nodesCache = new Map<string, CourseNodes>()

export function courseNodes(course: Course): CourseNodes {
  const cached = nodesCache.get(course.id)
  if (cached) return cached
  const map: CourseNodes = new Map()
  const walk = (node: JosekiNode) => {
    if (!map.has(strip(node.sfen))) map.set(strip(node.sfen), node)
    node.branches.forEach((b) => b.child && walk(b.child))
  }
  walk(course.root)
  nodesCache.set(course.id, map)
  return map
}

export const aiStrategyId = (id: string) => LEGACY_AI_STRATEGY[id] ?? id

export const strategyCourses = (strategyId: string, side: Side) => {
  const id = aiStrategyId(strategyId)
  const seen = new Set<string>()
  return COURSES.filter((c) => strategiesAt(c.baseId, side).includes(id) && !seen.has(c.baseId) && !!seen.add(c.baseId))
}

export function strategyMove(strategyId: string, side: Side, sfen: string) {
  const options = strategyCourses(strategyId, side).flatMap((c) => {
    const pick = mainBranch(courseNodes(c).get(strip(sfen)))
    return pick ? [pick] : []
  })
  return options[Math.floor(Math.random() * options.length)]
}

function neutralNote(note: string | undefined, course: Course) {
  if (!note) return note
  const other = course.userSide === 'sente' ? '後手' : '先手'
  const mine = course.userSide === 'sente' ? '先手' : '後手'
  return note.replace(/相手/g, other).replace(/こちら|自分/g, mine)
}

export function neutralBranch<T extends { note?: string; punishNote?: string }>(branch: T, course: Course): T {
  return { ...branch, note: neutralNote(branch.note, course), punishNote: neutralNote(branch.punishNote, course) }
}

const lessonsFirst = (sfen: string) => [...bookLookup(sfen)].sort((a, b) => Number(a.course.notesFromOpponentView) - Number(b.course.notesFromOpponentView))

function uniqueBook(sfen: string): BookMove[] {
  const seen = new Map<string, BookMove>()
  for (const hit of lessonsFirst(sfen))
    for (const b of hit.node.branches) {
      if (b.kind === 'deviation' || !b.child) continue
      const existing = seen.get(b.usi)
      const note = neutralNote(b.note, hit.course)
      if (!existing) seen.set(b.usi, { usi: b.usi, note, kind: b.kind })
      else if (!existing.note && note) existing.note = note
    }
  return [...seen.values()]
}

export function bookMovesAt(sfen: string, nodes: CourseNodes | null): BookMove[] {
  if (!nodes) return uniqueBook(sfen)
  const node = nodes.get(strip(sfen))
  return node ? goodBranches(node).map((b) => ({ usi: b.usi, note: b.note, kind: b.kind })) : []
}

export function bookForMove(prevSfen: string | null, usi: string | undefined, nodes: CourseNodes | null, course: Course | null): BookHit | null {
  if (!usi || !prevSfen) return null
  const own = nodes?.get(strip(prevSfen))?.branches.find((b) => b.usi === usi)
  if (own && course) return { branch: own, course }
  for (const hit of lessonsFirst(prevSfen)) {
    const branch = hit.node.branches.find((b) => b.usi === usi)
    if (branch) return { branch: neutralBranch(branch, hit.course), course: hit.course }
  }
  return null
}

export function bookAtPly(sfens: string[], moves: string[], ply: number): BookHit | null {
  if (ply < 1) return null
  for (const hit of bookLookup(sfens[ply - 1])) {
    const branch = hit.node.branches.find((b) => b.usi === moves[ply - 1])
    if (branch) return { branch, course: hit.course }
  }
  return null
}

export const inBook = (sfen: string, usi: string) => bookLookup(sfen).some((h) => h.node.branches.some((b) => b.usi === usi && b.kind !== 'deviation'))

export const setupOf = (course: Course, main?: string) => SETUPS.find((s) => s.courseIds.includes(course.id) && (!main || s.technique || s.main === main)) ?? SETUPS.find((s) => s.courseIds.includes(course.id))

export const setupsFor = (main: string) => SETUPS.filter((s) => s.main === main)

export const coursesOf = (courseIds: string[]) => courseIds.map((id) => COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c)
