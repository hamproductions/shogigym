import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { lessonOf, type Node, type Unit } from './unit'

const UNITS = 'data/lessons/units'
const OUT = 'src/data/lessons'

if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })
let chapters = 0
let moves = 0
const count = (n: Node): number => n.branches.reduce((sum, b) => sum + 1 + count(b.child), 0)
const units = readdirSync(UNITS)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(`${UNITS}/${file}`, 'utf8')) as Unit)
for (const unit of units) {
  const lesson = lessonOf(unit)
  chapters += lesson.courses.length
  moves += lesson.courses.reduce((sum, course) => sum + count(course.root), 0)
  writeFileSync(`${OUT}/${unit.id}.json`, JSON.stringify(lesson))
}
console.log(`${units.length} lessons, ${chapters} chapters, ${moves} moves`)
