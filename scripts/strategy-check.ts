import { readdirSync, readFileSync } from 'node:fs'
import { buildCatalog, sideOf, strategiesAt } from '../src/catalog'
import { COURSE_SIDES, MATCHUPS, SOURCE_URLS, STRATEGIES, TECHNIQUES, strategyById } from '../src/data/strategies'
import type { RawCourse } from '../src/model'

const dirs = ['vendor/shiryu-joseki/src/data/joseki', 'src/data/joseki']
const raws: RawCourse[] = dirs.flatMap((dir) => readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as RawCourse))
const byId = new Map(raws.map((r) => [r.id, r]))
const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

const techniqueIds = new Set(TECHNIQUES.flatMap((t) => t.courseIds))
const listed = new Set(MATCHUPS.flatMap((m) => m.courseIds))

for (const raw of raws) {
  if (!/https?:\/\/\S+|\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|jp|org|net)\b/i.test(raw.source ?? '') && !SOURCE_URLS[raw.id]?.length) fail(`${raw.id}: source does not cite a URL`)
  if (!techniqueIds.has(raw.id) && !listed.has(raw.id)) fail(`${raw.id}: not in any matchup or technique`)
  if (!techniqueIds.has(raw.id) && !COURSE_SIDES[raw.id]) fail(`${raw.id}: no COURSE_SIDES entry`)
}

for (const id of Object.keys(COURSE_SIDES)) {
  if (!byId.has(id)) fail(`COURSE_SIDES ${id}: no such course`)
  for (const side of ['sente', 'gote'] as const) for (const s of strategiesAt(id, side)) if (!strategyById(s)) fail(`COURSE_SIDES ${id}: unknown strategy ${s}`)
}

const ids = new Set<string>()
for (const m of MATCHUPS) {
  if (ids.has(m.id)) fail(`matchup ${m.id}: duplicate id`)
  ids.add(m.id)
  if (!strategyById(m.main)) fail(`matchup ${m.id}: unknown main ${m.main}`)
  if (!strategyById(m.vs)) fail(`matchup ${m.id}: unknown vs ${m.vs}`)
  if (!m.plan.ja || !m.plan.en) fail(`matchup ${m.id}: plan needs ja and en`)
  for (const id of m.courseIds) {
    const raw = byId.get(id)
    if (!raw) {
      fail(`matchup ${m.id}: unknown course ${id}`)
      continue
    }
    const side = sideOf(raw, m.main)
    if (!side) {
      fail(`matchup ${m.id}: ${id} has no side playing ${m.main}`)
      continue
    }
    if (!strategiesAt(id, side === 'sente' ? 'gote' : 'sente').includes(m.vs)) fail(`matchup ${m.id}: ${id} opponent side does not play ${m.vs}`)
  }
}

const RAW_WING: Record<string, string> = { shikenbisha: 'furibisha', sankenbisha: 'furibisha', nakabisha: 'furibisha', mukaibisha: 'furibisha', ibisha: 'ibisha', kakugawari: 'ibisha', yagura: 'ibisha', aigakari: 'ibisha', sujichigaikaku: 'ibisha' }
for (const raw of raws) {
  const sides = COURSE_SIDES[raw.id]
  if (!sides) continue
  const [mine, theirs] = raw.mySide === 'sente' ? sides : [sides[1], sides[0]]
  const fits = (declared: string[], name: string) => !RAW_WING[name] || declared.some((d) => strategyById(d)?.side === RAW_WING[name])
  if (!fits(mine, raw.myStrategy)) fail(`${raw.id}: mySide plays ${raw.myStrategy} but is declared ${mine.join('/')}`)
  if (!fits(theirs, raw.opponentStrategy)) fail(`${raw.id}: opponent plays ${raw.opponentStrategy} but is declared ${theirs.join('/')}`)
}

const { courses, setups } = buildCatalog(raws)
const seen = new Set<string>()
for (const c of courses) {
  if (seen.has(c.id)) fail(`course id ${c.id} duplicated`)
  seen.add(c.id)
}

if (process.argv.includes('--counts')) {
  for (const s of STRATEGIES) {
    const rows = setups.filter((x) => x.main === s.id)
    if (!rows.length) {
      console.log(`${s.ja}: (no matchups)`)
      continue
    }
    console.log(`${s.ja}: ${rows.map((r) => `${r.ja} ${r.courseIds.length}`).join(', ')}`)
  }
  console.log(`${courses.length} courses (${courses.filter((c) => c.mirrored).length} mirrored) in ${setups.length} groups`)
}

for (const e of errors) console.error(e)
console.log(`strategies: ${MATCHUPS.length} matchups, ${Object.keys(COURSE_SIDES).length} courses with sides, ${errors.length} errors`)
process.exit(errors.length ? 1 : 0)
