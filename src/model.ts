import { buildCatalog } from './catalog'
import { positionOf, colorSide, type Side } from './shogi'

export type { Setup } from './catalog'

export type MoveKind = 'main' | 'alt' | 'deviation'

export type MoveDemo = { title: string; usi: string[]; text: string }

export type JosekiMove = {
  usi: string
  kind: MoveKind
  note?: string
  aim?: string
  openEnded?: boolean
  demos?: MoveDemo[]
  punishNote?: string
  child: JosekiNode | null
}

export type JosekiNode = {
  id: string
  sfen: string
  comment?: string
  branches: JosekiMove[]
}

export type RawCourse = {
  id: string
  title: string
  titleEn?: string
  myStrategy: string
  opponentStrategy: string
  mySide: Side
  userSide?: Side
  source?: string
  goalFormation: string
  goalLabel?: string
  root: JosekiNode
}

export type Course = RawCourse & {
  userSide: Side
  notesFromOpponentView: boolean
  noEngine?: boolean
  setupId: string
  baseId: string
  main: string | null
  vs: string | null
  mirrored: boolean
}

const rawFiles = {
  ...import.meta.glob<string>('../vendor/shiryu-joseki/src/data/joseki/*.json', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('./data/joseki/*.json', { eager: true, query: '?raw', import: 'default' }),
}

const DERIVED: { id: string; from: string; start: number; end: number; title: string; goalFormation: string }[] = [
  {
    id: 'sabaki--kuboryu',
    from: 'shikenbisha-vs-bougin--kuboryu',
    start: 37,
    end: 48,
    title: '捌き: 棒銀に△4五歩から捌く(久保流)',
    goalFormation: '△4五歩で角道を開けて捌き、角を成り込み、守りの銀を4五へ捌く。',
  },
  {
    id: 'sabaki--torisashi',
    from: 'shikenbisha-vs-torisashi--basic',
    start: 19,
    end: 22,
    title: '捌き: 軽く捌かず手厚く受ける(鳥刺し)',
    goalFormation: '鳥刺しには△3二銀型のまま軽く捌かず、△4三銀から手厚く受け止める。',
  },
]

function cut(node: JosekiNode, depth: number): JosekiNode {
  const main = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
  if (depth <= 0) return { ...node, branches: [] }
  return { ...node, branches: node.branches.map((b) => (b === main && b.child ? { ...b, child: cut(b.child, depth - 1) } : b)) }
}

function derive(base: RawCourse, spec: (typeof DERIVED)[number]): RawCourse {
  let node = base.root
  for (let i = 0; i < spec.start; i++) {
    const next = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
    if (!next?.child) break
    node = next.child
  }
  return { ...base, id: spec.id, title: spec.title, goalFormation: spec.goalFormation, source: `${base.title}の${spec.start + 1}手目から${spec.end}手目までを切り出したもの。手順と解説は元のコースと同じ出典(${base.source ?? 'Shiryu181/shogi-joseki'})。`, root: cut(node, spec.end - spec.start) }
}

const RAW: RawCourse[] = Object.values(rawFiles).map((text) => JSON.parse(text) as RawCourse)

const CATALOG = buildCatalog([...RAW, ...DERIVED.map((d) => derive(RAW.find((r) => r.id === d.from)!, d))])

export const COURSES: Course[] = CATALOG.courses

export const SETUPS = CATALOG.setups

export const courseById = (id: string) => COURSES.find((c) => c.id === id)

export const sideToMove = (node: JosekiNode): Side => colorSide(positionOf(node.sfen).color)

export function findPath(root: JosekiNode, targetId: string): JosekiMove[] | null {
  for (const branch of root.branches) {
    if (!branch.child) continue
    if (branch.child.id === targetId) return [branch]
    const rest = findPath(branch.child, targetId)
    if (rest) return [branch, ...rest]
  }
  return null
}

export function walkNodes(root: JosekiNode, visit: (node: JosekiNode, path: JosekiMove[]) => void, path: JosekiMove[] = []) {
  visit(root, path)
  for (const branch of root.branches) if (branch.child) walkNodes(branch.child, visit, [...path, branch])
}

export type Verdict = 'good' | 'mistake' | 'opponent-mistake' | 'book'

export function verdictFor(course: Course, mover: Side, kind: MoveKind): Verdict {
  if (kind !== 'deviation') return mover === course.userSide ? 'good' : 'book'
  return mover === course.userSide ? 'mistake' : 'opponent-mistake'
}

export const courseTitle = (course: Pick<Course, 'title' | 'titleEn'>, lang: string) => (lang === 'ja' ? course.title : (course.titleEn ?? course.title))
