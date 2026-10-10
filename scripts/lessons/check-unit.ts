import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { Color, Position } from 'tsshogi'
import { FREE_LICENSES, HANDICAPS, STARTPOS, buildUnit, type Node, type Text, type Unit } from './unit'
import { bookMoves } from './book'
import { boardKey, material, oldPositions, overlaps, textsOf } from './originality'

const args = process.argv.slice(2)
const useEngine = args.includes('--engine')
const ids = args.filter((arg) => !arg.startsWith('--'))
const files = ids.length
  ? ids.map((id) => `data/lessons/units/${id.replace(/\.json$/, '')}.json`)
  : readdirSync('data/lessons/units').map((f) => `data/lessons/units/${f}`)

const evaluate = (sfens: string[]) =>
  execFileSync('node', ['scripts/lessons/engine-eval.mjs', '400'], { input: sfens.join('\n'), encoding: 'utf8', timeout: 600000 })
    .trim()
    .split('\n')
    .map((line) => {
      const [score, best] = line.split(' ')
      return { score: Number(score), best }
    })

const old = oldPositions()
let failures = 0
for (const file of files) {
  const errors: string[] = []
  const notes: string[] = []
  const unit = JSON.parse(readFileSync(file, 'utf8')) as Unit
  const text = (value: Text | undefined, where: string) => {
    if (!value || !value.ja?.trim() || !value.en?.trim()) errors.push(`missing ja/en text at ${where}`)
  }
  if (!/^[a-z0-9-]+$/.test(unit.id) || !file.endsWith(`/${unit.id}.json`)) errors.push('id must be kebab-case and match the file name')
  if (!unit.path?.length || typeof unit.order !== 'number') errors.push('path and order are required')
  text(unit.title, 'title')
  text(unit.intro, 'intro')
  if (unit.check) (text(unit.check.question, 'check.question'), text(unit.check.answer, 'check.answer'))
  for (const ref of unit.references ?? []) {
    if (!ref.title || !/^https:\/\//.test(ref.url) || !ref.license) errors.push(`incomplete reference ${ref.title}`)
    if (ref.adapted && !FREE_LICENSES.includes(ref.license)) errors.push(`adapted reference must be freely licensed: ${ref.url}`)
  }
  if (!unit.chapters?.length) errors.push('no chapters')
  unit.chapters?.forEach((chapter, c) => {
    text(chapter.title, `chapter ${c + 1} title`)
    if (!['sente', 'gote'].includes(chapter.side)) errors.push(`chapter ${c + 1} side`)
    chapter.steps.forEach((step, s) => text(step.text, `chapter ${c + 1} step ${s + 1}`))
    chapter.variations?.forEach((variation, v) => {
      text(variation.text, `chapter ${c + 1} variation ${v + 1}`)
      variation.steps?.forEach((step, s) => text(step.text, `chapter ${c + 1} variation ${v + 1} step ${s + 1}`))
    })
  })
  let courses: ReturnType<typeof buildUnit> = []
  try {
    courses = buildUnit(unit)
  } catch (error) {
    errors.push(String((error as Error).message))
  }
  for (const [c, course] of courses.entries()) {
    const chapter = unit.chapters[c]
    const opening = ['startpos', STARTPOS, ...HANDICAPS].includes(chapter.start)
    if (chapter.kind === 'opening' && !opening) errors.push(`${course.id}: opening chapters start from the initial or a handicap position`)
    const walk = (node: Node) => {
      const position = Position.newBySFEN(node.sfen)!
      if (node.branches.length && position.board.isChecked(position.color === Color.BLACK ? Color.WHITE : Color.BLACK))
        errors.push(`${course.id}: side not to move is in check at ${node.sfen}`)
      const match = old.get(boardKey(position.sfen))
      if (match && (!opening || material(node.sfen) < 40)) errors.push(`${course.id}: position copies a source figure (${match}): ${node.sfen}`)
      node.branches.forEach((branch) => walk(branch.child))
    }
    walk(course.root)
    if (!opening) continue
    let node: Node | undefined = course.root
    let ply = 0
    const misses: string[] = []
    const line: { sfen: string; usi: string }[] = []
    while (node?.branches.length) {
      const branch: Node['branches'][number] = node.branches.find((b) => b.kind === 'main') ?? node.branches[0]
      ply++
      line.push({ sfen: node.sfen, usi: branch.usi })
      const entry = bookMoves(node.sfen)
      if (entry && !entry.some(({ usi }) => usi === branch.usi))
        misses.push(
          `${ply}.${branch.usi} (book: ${entry
            .slice(0, 3)
            .map(({ usi, ev }) => `${usi} ${ev}`)
            .join(', ')})`,
        )
      node = branch.child
    }
    if (useEngine && node) {
      const scores = evaluate([...line.map((step) => step.sfen), node.sfen])
      line.forEach((step, i) => {
        const loss = scores[i].score + scores[i + 1].score
        if (loss > 300)
          notes.push(
            `${course.id} ply ${i + 1} ${step.usi}: engine loss ${loss} (engine prefers ${scores[i].best}, eval for mover ${scores[i].score} -> ${-scores[i + 1].score})`,
          )
      })
    }
    if (misses.length) notes.push(`${course.id}: moves outside the Peta book where the position is in it: ${misses.join('; ')}`)
  }
  for (const finding of overlaps(textsOf(unit, unit.id)))
    errors.push(
      `${finding.where}: ${(finding.share * 100).toFixed(0)}% shared with references${finding.runs.map((run) => `\n    "${run.phrase}" <- ${run.doc}`).join('')}`,
    )
  console.log(`${unit.id}: ${errors.length ? 'FAIL' : 'ok'} (${courses.length} chapters)`)
  for (const error of errors) console.log(`  ERROR ${error}`)
  for (const note of notes) console.log(`  NOTE ${note}`)
  if (errors.length) failures++
}
process.exit(failures ? 1 : 0)
