import { readFileSync, readdirSync } from 'node:fs'
import { Color, Position } from 'tsshogi'

const source = 'scripts/lesson-source'
const lessonsDir = 'src/data/lessons'
const catalog = JSON.parse(readFileSync(`${source}/catalog.json`, 'utf8'))
const content = readdirSync(source)
  .filter((file) => file.endsWith('.json') && file !== 'catalog.json')
  .flatMap((file) => JSON.parse(readFileSync(`${source}/${file}`, 'utf8')))
const lessons = readdirSync(lessonsDir).map((file) => JSON.parse(readFileSync(`${lessonsDir}/${file}`, 'utf8')))
const errors = []
const text = (value) => value && ['ja', 'en'].every((lang) => typeof value[lang] === 'string' && value[lang].trim().length > 0)
const ids = new Set()
let chapters = 0
let moves = 0
let figures = 0

for (const topic of content) {
  if (ids.has(topic.id)) errors.push(`Duplicate topic ${topic.id}`)
  ids.add(topic.id)
  const entry = catalog.find((item) => item.id === topic.id)
  if (!entry || topic.title?.ja !== entry.title) errors.push(`Unknown or mismatched topic ${topic.id}`)
  if (!text(topic.title) || !text(topic.question) || !text(topic.answer) || topic.paragraphs?.length < 2 || !topic.paragraphs?.every(text))
    errors.push(`Incomplete bilingual content ${topic.id}`)
}
for (const topic of catalog) {
  if (!ids.has(topic.id)) errors.push(`Missing topic ${topic.id}: ${topic.title}`)
  if (!topic.path.length || !/^https:\/\/shogi-joutatsu\.com\/archives\/\d+\/?$/.test(topic.source)) errors.push(`Invalid provenance ${topic.id}`)
}
const learning = catalog.filter((topic) => !['将棋ゲーム、ソフト', 'コラム'].includes(topic.path[0]))
for (const topic of learning) if (!lessons.some((lesson) => lesson.id === topic.id)) errors.push(`Lesson not generated ${topic.id}`)

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
        for (const figure of node.figures)
          if (!figure.source?.startsWith('https://shogi-joutatsu.com/wp-content/')) errors.push(`Figure without source ${course.id}:${node.id}`)
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
console.log(`${catalog.length} topics, ${lessons.length} lessons, ${chapters} chapters, ${figures} figures, ${moves} legal moves, ${errors.length} errors`)
process.exit(errors.length ? 1 : 0)
