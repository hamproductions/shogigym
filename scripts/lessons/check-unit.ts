import { readFileSync, readdirSync } from 'node:fs'
import { Color, Position } from 'tsshogi'
import { FREE_LICENSES, HANDICAPS, STARTPOS, buildUnit, type Node, type Text, type Unit } from './unit'
import { bookMoves } from './book'
import { pawnCapturesOfNonPawns, unrecapturedMajorCaptures } from './capture-notes'
import { evaluate } from './engine-scores'
import { boardKey, material, oldPositions, overlaps, textsOf } from './originality'

const args = process.argv.slice(2)
const useEngine = args.includes('--engine')
const withBranches = args.includes('--branches')
const ids = args.filter((arg) => !arg.startsWith('--'))
const files = ids.length
  ? ids.map((id) => `data/lessons/units/${id.replace(/\.json$/, '')}.json`)
  : readdirSync('data/lessons/units').map((f) => `data/lessons/units/${f}`)

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
    const edges: { sfen: string; after: string; usi: string; kind: string; node: string; color: Color }[] = []
    if (chapter.kind === 'opening' && !opening) errors.push(`${course.id}: opening chapters start from the initial or a handicap position`)
    const walk = (node: Node) => {
      const position = Position.newBySFEN(node.sfen)!
      for (const capture of pawnCapturesOfNonPawns(position))
        notes.push(
          `${course.id} ${node.id}: pawn ${capture.usi} can capture ${capture.target}; inspect the complete exchange even if it is guarded (${position.sfen})`,
        )
      for (const capture of unrecapturedMajorCaptures(position))
        notes.push(`${course.id} ${node.id}: ${capture} can capture a major piece without immediate board recapture (${position.sfen})`)
      if (node.branches.length && position.board.isChecked(position.color === Color.BLACK ? Color.WHITE : Color.BLACK))
        errors.push(`${course.id}: side not to move is in check at ${node.sfen}`)
      const match = old.get(boardKey(position.sfen))
      if (match && (!opening || material(node.sfen) < 40)) errors.push(`${course.id}: position copies a source figure (${match}): ${node.sfen}`)
      node.branches.forEach((branch) => {
        edges.push({ sfen: node.sfen, after: branch.child.sfen, usi: branch.usi, kind: branch.kind, node: node.id, color: position.color })
        walk(branch.child)
      })
    }
    walk(course.root)
    if (!opening) continue
    let node: Node | undefined = course.root
    let ply = 0
    const misses: string[] = []
    const line: { sfen: string; usi: string }[] = []
    while (node?.branches.length) {
      const branch: Node['branches'][number] | undefined = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
      if (!branch) break
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
      if (withBranches) {
        const scores = evaluate(edges.flatMap((edge) => [edge.sfen, edge.after]))
        edges.forEach((edge, i) => {
          const loss = scores[i * 2].score + scores[i * 2 + 1].score
          const role = edge.color === (chapter.side === 'gote' ? Color.WHITE : Color.BLACK) ? 'learner' : 'opponent'
          if (loss > 300)
            notes.push(
              `${course.id} ${edge.node} ${edge.usi} (${role}, edge ${edge.kind}): engine loss ${loss} (engine prefers ${scores[i * 2].best})${scores[i * 2 + 1].pv.length ? `; reply PV: ${scores[i * 2 + 1].pv.slice(0, 6).join(' ')}` : ''}`,
            )
        })
        notes.push(
          `${course.id}: engine branch coverage ${edges.length} moves, ${new Set(edges.flatMap((edge) => [edge.sfen, edge.after])).size} distinct positions`,
        )
      } else {
        const scores = evaluate([...line.map((step) => step.sfen), node.sfen])
        line.forEach((step, i) => {
          const loss = scores[i].score + scores[i + 1].score
          if (loss > 300)
            notes.push(
              `${course.id} ply ${i + 1} ${step.usi}: engine loss ${loss} (engine prefers ${scores[i].best}, eval for mover ${scores[i].score} -> ${-scores[i + 1].score})${scores[i + 1].pv.length ? `; reply PV: ${scores[i + 1].pv.slice(0, 6).join(' ')}` : ''}`,
            )
        })
      }
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
