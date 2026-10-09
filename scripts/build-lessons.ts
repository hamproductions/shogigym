import { Position } from 'tsshogi'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'

type Text = { ja: string; en: string }
type Line = {
  from: string | null
  start: string
  moves: string[]
  sides: string
  text: string
  corrected?: { index: number; stated: string; played: string }[]
  adjusted?: string[]
  statedFrom?: string
  prose?: string
  swappedMarks?: boolean
  note?: Text
}
type Diagram = {
  id: string
  title: Text
  explain?: Text
  section?: Text
  source: string
  sfen?: string
  view?: 'gote'
  handsHidden?: string
  partial?: boolean
  marks?: Record<string, unknown>
  line?: Line
  statedMoves?: string
  crop?: unknown
  pieces?: unknown
}
type Figure = Omit<Diagram, 'line' | 'sfen' | 'title' | 'explain' | 'statedMoves'>
type Branch = { usi: string; kind: 'main'; note?: string; noteEn?: string; child: Node }
type Node = { id: string; sfen: string; comment?: string; commentEn?: string; figures?: Figure[]; branches: Branch[] }

const DIAGRAMS = '.cache/extract/diagrams'
const OUT = 'src/data/lessons'
const EMPTY = '9/9/9/9/9/9/9/9/9 b - 1'
const catalog: { id: string; title: string; path: string[]; source: string }[] = JSON.parse(readFileSync('scripts/lesson-source/catalog.json', 'utf8'))
type Example = { title: Text; startSfen?: string; userSide?: 'sente' | 'gote'; moves: string[]; notes?: (Text | undefined)[] }
type Content = { title: Text; paragraphs: Text[]; question: Text; answer: Text; examples?: Example[] }
const contents = new Map<string, Content>(
  readdirSync('scripts/lesson-source')
    .filter((file) => file.endsWith('.json') && file !== 'catalog.json')
    .flatMap((file) => JSON.parse(readFileSync(`scripts/lesson-source/${file}`, 'utf8')) as (Content & { id: string })[])
    .map((topic) => [topic.id, topic]),
)

const key = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')
const playable = (line?: Line) => !!line && [...line.sides].every((side, i) => i === 0 || side !== line.sides[i - 1])
const correction = ({ stated, played }: { stated: string; played: string }): Text =>
  !stated
    ? { ja: `記事で省略されている${played}を補っています。`, en: `Adds ${played}, which the source leaves out.` }
    : !played
      ? { ja: `原文の${stated}は図の局面と合わないため省いています。`, en: `Leaves out ${stated}, which does not fit the figure.` }
      : {
          ja: `原文では${stated}ですが、図の局面になるのは${played}です。`,
          en: `The source writes ${stated}, but the move that reaches the figure is ${played}.`,
        }
const lineNotes = (line: Line): Text[] => [
  ...(line.note ? [line.note] : []),
  ...(line.swappedMarks
    ? [{ ja: '原文の▲△の表記を手番に合わせて読み替えています。', en: 'The source’s ▲/△ marks are read according to the side to move.' }]
    : []),
  ...(line.statedFrom
    ? [{ ja: `原文では${line.statedFrom}からの手順と書かれています。`, en: `The source states these moves start from ${line.statedFrom}.` }]
    : []),
  ...(line.adjusted?.length
    ? [{ ja: '図の局面に合わせて、手順に関係しない駒の位置を補っています。', en: 'Pieces not involved in the moves are placed as in the figure.' }]
    : []),
]
const join = (parts: (Text | undefined)[]) => {
  const list = parts.filter((part): part is Text => !!part && !!part.ja)
  return list.length ? { ja: list.map((part) => part.ja).join('\n'), en: list.map((part) => part.en).join('\n') } : undefined
}
const figureOf = ({ line: _line, sfen: _sfen, title: _title, explain: _explain, statedMoves: _stated, ...figure }: Diagram): Figure => figure
const PARTIAL: Text = { ja: '原図に描かれた駒だけを置いています。', en: 'Only the pieces drawn in the source figure are placed.' }
const HIDDEN: Text = {
  ja: '原図では持ち駒が示されていないため、手順に必要な駒だけを持たせています。',
  en: 'The source figure does not show the hands, so only the pieces the moves need are in hand.',
}
const describe = (diagram: Diagram, extra: Text[] = []) =>
  join([
    { ja: diagram.title.ja, en: diagram.title.en },
    diagram.explain,
    ...extra,
    diagram.partial ? PARTIAL : undefined,
    diagram.handsHidden ? HIDDEN : undefined,
    diagram.statedMoves ? { ja: `原文の手順：${diagram.statedMoves}`, en: `Moves in the source: ${diagram.statedMoves}` } : undefined,
  ])

function build(topicId: string, diagrams: Diagram[]) {
  const topic = catalog.find((item) => item.id === topicId)!
  const title = contents.get(topicId)?.title ?? { ja: topic.title, en: topic.title }
  const chapters: { root: Node; tip: Node; tipFigure: string | null; firstSide: string; lastSide: string; firstTitle: Text; lastTitle: Text }[] = []
  let ids = 0
  const node = (sfen: string): Node => ({ id: `n${ids++}`, sfen, branches: [] })
  const annotate = (target: Node, diagram: Diagram, extra: Text[] = []) => {
    const text = describe(diagram, extra)
    if (text) {
      target.comment = target.comment ? `${target.comment}\n${text.ja}` : text.ja
      target.commentEn = target.commentEn ? `${target.commentEn}\n${text.en}` : text.en
    }
    target.figures = [...(target.figures ?? []), figureOf(diagram)]
  }
  const extend = (tip: Node, line: Line) => {
    const position = Position.newBySFEN(tip.sfen)!
    let current = tip
    line.moves.forEach((usi, ply) => {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.doMove(move)) throw new Error(`Illegal move ${topicId} ${usi}`)
      const child = node(position.sfen)
      const notes = join(line.corrected?.filter((fix) => fix.index === ply).map(correction) ?? [])
      current.branches.push({ usi, kind: 'main', ...(notes ? { note: notes.ja, noteEn: notes.en } : {}), child })
      current = child
    })
    return current
  }
  for (const diagram of diagrams) {
    const chapter = chapters.at(-1)
    if (!diagram.sfen) {
      if (chapter && chapter.tipFigure) annotate(chapter.tip, diagram)
      else {
        const root = node(EMPTY)
        annotate(root, diagram)
        chapters.push({ root, tip: root, tipFigure: null, firstSide: 'b', lastSide: 'b', firstTitle: diagram.title, lastTitle: diagram.title })
      }
      continue
    }
    const line = playable(diagram.line) ? diagram.line! : undefined
    if (line && chapter && chapter.tipFigure === line.from && key(chapter.tip.sfen) === key(line.start)) {
      chapter.tip = extend(chapter.tip, line)
      chapter.tipFigure = diagram.id
      chapter.lastSide = line.sides.at(-1)!
      chapter.lastTitle = diagram.title
      annotate(chapter.tip, diagram, lineNotes(line))
      continue
    }
    if (line) {
      const root = node(Position.newBySFEN(line.start)!.sfen)
      const from = diagrams.find((item) => item.id === line.from)
      if (from) annotate(root, from)
      const tip = extend(root, line)
      annotate(tip, diagram, lineNotes(line))
      chapters.push({
        root,
        tip,
        tipFigure: diagram.id,
        firstSide: line.sides[0],
        lastSide: line.sides.at(-1)!,
        firstTitle: from?.title ?? diagram.title,
        lastTitle: diagram.title,
      })
      continue
    }
    const root = node(Position.newBySFEN(diagram.sfen)!.sfen)
    annotate(root, diagram, diagram.line ? [{ ja: `原文の手順：${diagram.line.text}`, en: `Moves in the source: ${diagram.line.text}` }] : [])
    chapters.push({
      root,
      tip: root,
      tipFigure: diagram.id,
      firstSide: diagram.view === 'gote' ? 'w' : 'b',
      lastSide: diagram.view === 'gote' ? 'w' : 'b',
      firstTitle: diagram.title,
      lastTitle: diagram.title,
    })
  }
  const examples = (contents.get(topicId)?.examples ?? []).map((example) => {
    const position = Position.newBySFEN(example.startSfen ?? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1')!
    const root = node(position.sfen)
    let current = root
    example.moves.forEach((usi, ply) => {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.doMove(move)) throw new Error(`Illegal example move ${topicId} ${usi}`)
      const child = node(position.sfen)
      const note = example.notes?.[ply]
      current.branches.push({ usi, kind: 'main', ...(note ? { note: note.ja, noteEn: note.en } : {}), child })
      current = child
    })
    const side = example.userSide ?? (Position.newBySFEN(root.sfen)!.color === 'black' ? 'sente' : 'gote')
    return { root, title: example.title, side }
  })
  const exampleCourses = examples.map(({ root, title: name, side }, index) => ({
    id: `lesson-${topicId}-x${index + 1}`,
    title: `${title.ja}: ${name.ja}`,
    titleEn: `${title.en}: ${name.en}`,
    myStrategy: 'lesson',
    opponentStrategy: 'lesson',
    mySide: side,
    userSide: side,
    noEngine: true,
    quizTargets: true,
    source: topic.source,
    goalFormation: name.ja,
    root,
  }))
  return [
    ...chapters.map((chapter, index) => {
      const side = chapter.lastSide === 'w' ? 'gote' : 'sente'
      const first = chapter.firstTitle
      const last = chapter.lastTitle
      const name = (lang: 'ja' | 'en') => [first?.[lang], last && last !== first ? last[lang] : undefined].filter(Boolean).join(' → ')
      return {
        id: `lesson-${topicId}-${index + 1}`,
        title: `${title.ja}: ${name('ja')}`,
        titleEn: `${title.en}: ${name('en')}`,
        myStrategy: 'lesson',
        opponentStrategy: 'lesson',
        mySide: side,
        userSide: side,
        noEngine: true,
        source: topic.source,
        goalFormation: chapter.tip.comment ?? title.ja,
        root: chapter.root,
      }
    }),
    ...exampleCourses,
  ]
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })
let chapters = 0
let moves = 0
for (const { id: topicId } of catalog.filter((item) => !['将棋ゲーム、ソフト', 'コラム'].includes(item.path[0]))) {
  const file = `${DIAGRAMS}/${topicId}.json`
  const diagrams = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as { diagrams: Diagram[] }).diagrams : []
  const courses = build(topicId, diagrams)
  chapters += courses.length
  const count = (n: Node): number => n.branches.reduce((sum, b) => sum + 1 + count(b.child), 0)
  moves += courses.reduce((sum, course) => sum + count(course.root), 0)
  const topic = catalog.find((item) => item.id === topicId)!
  const content = contents.get(topicId)
  writeFileSync(
    `${OUT}/${topicId}.json`,
    JSON.stringify({
      id: topicId,
      order: catalog.indexOf(topic),
      title: content?.title ?? { ja: topic.title, en: topic.title },
      path: topic.path,
      intro: content ? { ja: content.paragraphs.map((p) => p.ja).join('\n\n'), en: content.paragraphs.map((p) => p.en).join('\n\n') } : { ja: '', en: '' },
      check: content && { question: content.question, answer: content.answer },
      source: topic.source,
      courses,
    }),
  )
}
console.log(`${readdirSync(OUT).length} lessons, ${chapters} chapters, ${moves} moves`)
