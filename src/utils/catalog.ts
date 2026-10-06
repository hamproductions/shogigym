import { COURSE_SIDES, MATCHUPS, TECHNIQUES, strategyById, type Level, type Text } from '@/data/strategies'
import { TITLES_EN } from '@/data/titlesEn'
import type { Course, JosekiNode, RawCourse } from './model'

type Side = 'sente' | 'gote'

export interface Setup {
  id: string
  main: string | null
  vs: string | null
  name: string
  ja: string
  intro: Text
  plan?: Text
  level: Level
  sources: string[]
  courseIds: string[]
  technique?: boolean
  basics?: boolean
}

const other = (side: Side): Side => (side === 'sente' ? 'gote' : 'sente')

export const primarySide = (raw: RawCourse): Side => raw.userSide ?? (raw.opponentStrategy === 'shikenbisha' ? other(raw.mySide) : raw.mySide)

export const courseIdFor = (raw: RawCourse, userSide: Side) => (userSide === primarySide(raw) ? raw.id : `${raw.id}@${userSide}`)

function mainLine(root: JosekiNode) {
  const moves: string[] = []
  let node: JosekiNode | null = root
  while (node) {
    const next: JosekiNode['branches'][number] | undefined = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
    if (!next) break
    moves.push(next.usi)
    node = next.child
  }
  return moves
}

const sameGame = (a: RawCourse, b: RawCourse) => {
  if (a.root.sfen.split(' ').slice(0, 3).join(' ') !== b.root.sfen.split(' ').slice(0, 3).join(' ')) return false
  const [x, y] = [mainLine(a.root), mainLine(b.root)]
  const n = Math.min(x.length, y.length)
  return n > 0 && x.slice(0, n).every((usi, i) => usi === y[i])
}

export function sideOf(raw: RawCourse, strategy: string): Side | null {
  const sides = COURSE_SIDES[raw.id]
  if (!sides) return null
  const [sente, gote] = [sides[0].includes(strategy), sides[1].includes(strategy)]
  if (sente && gote) return primarySide(raw)
  if (sente) return 'sente'
  return gote ? 'gote' : null
}

export const strategiesAt = (baseId: string, side: Side) => COURSE_SIDES[baseId]?.[side === 'sente' ? 0 : 1] ?? []

export function buildCatalog(raws: RawCourse[]) {
  const byId = new Map(raws.map((r) => [r.id, r]))
  const courses = new Map<string, Course>()
  const setups: Setup[] = []
  const make = (raw: RawCourse, userSide: Side, setupId: string, main: string | null, vs: string | null) => {
    const id = courseIdFor(raw, userSide)
    const existing = courses.get(id)
    if (existing) return existing
    const mirrored = id !== raw.id
    const strategy = main ? strategyById(main) : null
    const course: Course = {
      ...raw,
      id,
      baseId: raw.id,
      title: mirrored && strategy ? `${raw.title} ― ${userSide === 'sente' ? '先手' : '後手'}・${strategy.ja}側` : raw.title,
      titleEn: mirrored && strategy ? `${raw.titleEn ?? TITLES_EN[raw.id] ?? raw.title} (as ${strategy.en})` : (raw.titleEn ?? TITLES_EN[raw.id]),
      userSide,
      notesFromOpponentView: userSide !== raw.mySide,
      setupId,
      main,
      vs,
      mirrored,
    }
    courses.set(id, course)
    return course
  }
  const strategySets = new Map<string, Set<string>>()
  const strategiesSetAt = (baseId: string, side: Side) => {
    const key = `${baseId}@${side}`
    let set = strategySets.get(key)
    if (!set) {
      set = new Set(strategiesAt(baseId, side))
      strategySets.set(key, set)
    }
    return set
  }
  const explicit = new Map<string, { raw: RawCourse; side: Side }[]>()
  for (const mu of MATCHUPS)
    explicit.set(
      mu.id,
      mu.courseIds.flatMap((id) => {
        const raw = byId.get(id)
        const side = raw && sideOf(raw, mu.main)
        return raw && side ? [{ raw, side }] : []
      }),
    )
  for (const mu of MATCHUPS) {
    const own = explicit.get(mu.id)!
    const list = [...own]
    const candidates = MATCHUPS.filter((r) => r.main === mu.vs && r.vs === mu.main)
      .flatMap((r) => (explicit.get(r.id) ?? []).map(({ raw, side }) => ({ raw, side: other(side) })))
      .filter(({ raw, side }) => strategiesSetAt(raw.id, side).has(mu.main))
      .toSorted((a, b) => Number(a.side !== a.raw.mySide) - Number(b.side !== b.raw.mySide))
    for (const c of candidates) if (!list.some((o) => o.side === c.side && (o.raw.id === c.raw.id || sameGame(o.raw, c.raw)))) list.push(c)
    const main = strategyById(mu.main)
    const vs = strategyById(mu.vs)
    setups.push({
      id: mu.id,
      main: mu.main,
      vs: mu.vs,
      name: mu.title?.en ?? vs?.en ?? mu.vs,
      ja: mu.title?.ja ?? vs?.ja ?? mu.vs,
      intro: vs?.about ?? main?.about ?? { ja: '', en: '' },
      plan: mu.plan,
      level: mu.level,
      sources: mu.sources ?? [],
      courseIds: list.map(({ raw, side }) => make(raw, side, mu.id, mu.main, mu.vs).id),
      basics: mu.basics,
    })
  }
  for (const tech of TECHNIQUES)
    setups.push({
      id: tech.id,
      main: null,
      vs: null,
      name: tech.en,
      ja: tech.ja,
      intro: tech.intro,
      plan: tech.plan,
      level: 1,
      sources: tech.sources,
      technique: true,
      courseIds: tech.courseIds.flatMap((id) => {
        const raw = byId.get(id)
        return raw ? [make(raw, primarySide(raw), tech.id, null, null).id] : []
      }),
    })
  return { courses: [...courses.values()], setups }
}
