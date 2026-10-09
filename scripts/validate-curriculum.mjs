import { readFileSync, readdirSync } from 'node:fs'
import { InitialPositionSFEN, Position } from 'tsshogi'

const dir = 'src/data/curriculum'
const catalog = JSON.parse(readFileSync(`${dir}/catalog.json`, 'utf8'))
const content = readdirSync(dir)
  .filter((file) => file.endsWith('.json') && file !== 'catalog.json')
  .flatMap((file) => JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')))
const ids = new Set()
const errors = []
let examples = 0
let moves = 0
const text = (value) => value && ['ja', 'en'].every((lang) => typeof value[lang] === 'string' && value[lang].trim().length > 0)

for (const topic of content) {
  if (ids.has(topic.id)) errors.push(`Duplicate topic ${topic.id}`)
  ids.add(topic.id)
  const entry = catalog.find((item) => item.id === topic.id)
  if (!entry || topic.title?.ja !== entry.title) errors.push(`Unknown or mismatched topic ${topic.id}`)
  if (!text(topic.title) || !text(topic.question) || !text(topic.answer) || topic.paragraphs?.length < 2 || !topic.paragraphs?.every(text))
    errors.push(`Incomplete bilingual content ${topic.id}`)
  if (
    topic.paragraphs
      ?.map((p) => p.en)
      .join(' ')
      .split(/\s+/).length < 80
  )
    errors.push(`Insufficient explanation ${topic.id}`)
  for (const example of topic.examples ?? []) {
    examples++
    const position = Position.newBySFEN(example.startSfen ?? InitialPositionSFEN.STANDARD)
    if (!text(example.title) || !position || !example.moves?.length) {
      errors.push(`Invalid example ${topic.id}:${examples}`)
      continue
    }
    if (!example.notes?.every(text) || example.notes.length !== example.moves.length) errors.push(`Invalid notes ${topic.id}`)
    if (example.userSide && !['sente', 'gote'].includes(example.userSide)) errors.push(`Invalid teaching side ${topic.id}`)
    for (const [ply, usi] of example.moves.entries()) {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.isValidMove(move) || !position.doMove(move)) {
        errors.push(`Illegal move ${topic.id}:${ply + 1} ${usi}`)
        break
      }
      moves++
    }
  }
}
if (new Set(catalog.map((topic) => topic.id)).size !== catalog.length) errors.push('Duplicate catalog IDs')
for (const topic of catalog) {
  if (!ids.has(topic.id)) errors.push(`Missing topic ${topic.id}: ${topic.title}`)
  if (!topic.path.length || !/^https:\/\/shogi-joutatsu\.com\/archives\/\d+\/?$/.test(topic.source)) errors.push(`Invalid provenance ${topic.id}`)
}
if (process.argv[2]) {
  const supplied = readFileSync(process.argv[2], 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const labels = new Set(['コンテンツ一覧', ...catalog.flatMap((topic) => [topic.title, ...topic.path])])
  for (const line of supplied) if (!labels.has(line)) errors.push(`Unmatched supplied item: ${line}`)
}
for (const error of errors) console.error(error)
console.log(`${catalog.length} topics, ${content.length} explanations, ${examples} examples, ${moves} legal moves, ${errors.length} errors`)
process.exit(errors.length ? 1 : 0)
