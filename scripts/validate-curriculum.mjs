import { readFileSync, readdirSync } from 'node:fs'
import { Color, Position } from 'tsshogi'

const lessonsDir = 'src/data/lessons'
const lessons = readdirSync(lessonsDir).map((file) => JSON.parse(readFileSync(`${lessonsDir}/${file}`, 'utf8')))
const errors = []
const text = (value) => value && ['ja', 'en'].every((lang) => typeof value[lang] === 'string' && value[lang].trim().length > 0)
let chapters = 0
let moves = 0
let figures = 0

const ids = new Set()
for (const lesson of lessons) {
  if (ids.has(lesson.id)) errors.push(`Duplicate lesson ${lesson.id}`)
  ids.add(lesson.id)
  if (!lesson.source?.trim() || !Array.isArray(lesson.references)) errors.push(`Missing provenance ${lesson.id}`)
  for (const ref of lesson.references ?? [])
    if (!ref.title || !/^https:\/\//.test(ref.url ?? '') || !ref.license) errors.push(`Incomplete reference ${lesson.id}`)
  if (lesson.check && (!text(lesson.check.question) || !text(lesson.check.answer))) errors.push(`Incomplete check question ${lesson.id}`)
}

const courseIds = new Set()
for (const lesson of lessons) {
  if (!text(lesson.title) || !text(lesson.intro) || !lesson.path?.length) errors.push(`Incomplete lesson ${lesson.id}`)
  for (const course of lesson.courses) {
    chapters++
    if (courseIds.has(course.id)) errors.push(`Duplicate chapter ${course.id}`)
    courseIds.add(course.id)
    if (!course.title || !course.titleEn || !['sente', 'gote'].includes(course.userSide)) errors.push(`Incomplete chapter ${course.id}`)
    const walk = (node) => {
      const position = Position.newBySFEN(node.sfen)
      if (!position) return errors.push(`Invalid position ${course.id}:${node.id}`)
      if (position.board.isChecked(position.color === Color.BLACK ? Color.WHITE : Color.BLACK) && node.branches.length)
        errors.push(`Side not to move is in check ${course.id}:${node.id}`)
      if (node.figures) {
        figures += node.figures.length
        if (!node.comment || !node.commentEn) errors.push(`Figure without explanation ${course.id}:${node.id}`)
      }
      for (const branch of node.branches) {
        const replay = Position.newBySFEN(node.sfen)
        const move = replay.createMoveByUSI(branch.usi)
        if (!move || !replay.isValidMove(move) || !replay.doMove(move)) {
          errors.push(`Illegal move ${course.id}:${node.id} ${branch.usi}`)
          continue
        }
        if (replay.sfen.split(' ').slice(0, 3).join(' ') !== branch.child.sfen.split(' ').slice(0, 3).join(' '))
          errors.push(`Move does not reach child ${course.id}:${node.id}`)
        moves++
        walk(branch.child)
      }
    }
    walk(course.root)
  }
}
for (const error of errors) console.error(error)
console.log(`${lessons.length} lessons, ${chapters} chapters, ${figures} figures, ${moves} legal moves, ${errors.length} errors`)
process.exit(errors.length ? 1 : 0)
