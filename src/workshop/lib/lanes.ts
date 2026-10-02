import { scoreWinRate } from '../../analysis'
import type { Analysis } from '../../engine'
import { bookLookup } from '../../kifu'
import { neutralBranch, strip, type CourseNodes } from './book'
import { winLoss } from './score'

export type Lane = { first: string; moves: string[]; tag: 'book' | 'mistake' | 'ai'; note?: string; loss?: number; forks?: number; best?: boolean }

const LANE_ORDER = { book: 0, ai: 1, mistake: 2 }

export function buildLanes(sfen: string, nodes: CourseNodes | null, analysis: Analysis | null): Lane[] {
  const lanes: Lane[] = []
  const branchesHere = nodes ? (nodes.get(strip(sfen))?.branches ?? []) : bookLookup(sfen).flatMap((h) => h.node.branches.map((b) => neutralBranch(b, h.course)))
  for (const b of branchesHere) {
    if (lanes.some((l) => l.first === b.usi)) continue
    const moves = [b.usi]
    let n = b.child
    while (n && n.branches.length === 1 && n.branches[0].child && moves.length < 6) {
      moves.push(n.branches[0].usi)
      n = n.branches[0].child
    }
    lanes.push({ first: b.usi, moves, tag: b.kind === 'deviation' ? 'mistake' : 'book', note: b.kind === 'deviation' ? (b.punishNote ?? b.note) : b.note, forks: n && n.branches.length > 1 ? n.branches.length : undefined })
  }
  const candidates = (analysis?.candidates ?? []).filter((c) => /^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(c.move))
  if (candidates.length) {
    const bestRate = scoreWinRate(candidates[0].score)
    for (const c of candidates) {
      const loss = winLoss(bestRate, c.score)
      const existing = lanes.find((l) => l.first === c.move)
      const best = c === candidates[0]
      if (existing) Object.assign(existing, { loss, best })
      else lanes.push({ first: c.move, moves: c.pv.slice(0, 6), tag: 'ai', loss, best })
    }
  }
  return lanes.sort((a, b) => LANE_ORDER[a.tag] - LANE_ORDER[b.tag])
}
