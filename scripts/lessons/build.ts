import { Color, Position } from 'tsshogi'
import { inferMoves } from './infer-moves'
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
type Branch = { usi: string; kind: 'main' | 'deviation'; note?: string; noteEn?: string; child: Node }
type Node = { id: string; sfen: string; comment?: string; commentEn?: string; figures?: Figure[]; branches: Branch[] }

const DIAGRAMS = 'data/lessons/figures'
const OUT = 'src/data/lessons'
const EMPTY = '9/9/9/9/9/9/9/9/9 b - 1'
const catalog: { id: string; title: string; path: string[]; source: string }[] = JSON.parse(readFileSync('data/lessons/topics/catalog.json', 'utf8'))
type Example = { title: Text; startSfen?: string; userSide?: 'sente' | 'gote'; moves: string[]; notes?: (Text | undefined)[] }
type Content = { title: Text; paragraphs: Text[]; question: Text; answer: Text; examples?: Example[] }
const contents = new Map<string, Content>(
  readdirSync('data/lessons/topics')
    .filter((file) => file.endsWith('.json') && file !== 'catalog.json')
    .flatMap((file) => JSON.parse(readFileSync(`data/lessons/topics/${file}`, 'utf8')) as (Content & { id: string })[])
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

const DIGIT = '１２３４５６７８９'
const RANK = '一二三四五六七八九'
const REPLACED = /([▲△☗☖](?:[1-9１-９][一二三四五六七八九]|同)[^▲△☗☖、。]*?)(?:に代えて|とせず|ではなく|の代わりに)/g
function proseMoves(text: string) {
  const out: { side: string; to: string | null; promote: boolean | null }[] = []
  for (const match of text.replace(REPLACED, '').matchAll(/([▲△☗☖])([1-9１-９][一二三四五六七八九]|同)([^▲△☗☖、。\s]*)/g)) {
    const side = '▲☗'.includes(match[1]) ? 'b' : 'w'
    const at =
      match[2] === '同' ? null : `${DIGIT.includes(match[2][0]) ? DIGIT.indexOf(match[2][0]) + 1 : match[2][0]}${'abcdefghi'[RANK.indexOf(match[2][1])]}`
    out.push({ side, to: at, promote: /不成/.test(match[3]) ? false : /成/.test(match[3]) ? true : null })
  }
  return out
}
const legalStart = (sfen: string) => {
  const position = Position.newBySFEN(sfen)
  return !!position && !position.board.isChecked(position.color === Color.BLACK ? Color.WHITE : Color.BLACK)
}
const withTurn = (sfen: string, turn: string) => {
  const parts = sfen.split(' ')
  parts[1] = turn
  return parts.join(' ')
}
const statedIn = (text: string, moves: string[], turn: string) => text.split('。').some((sentence) => matches(moves, turn, proseMoves(sentence)))
const sidesFrom = (turn: string, count: number) => Array.from({ length: count }, (_, i) => (i % 2 === 0 ? turn : turn === 'b' ? 'w' : 'b')).join('')
const matches = (moves: string[], turn: string, prose: { side: string; to: string | null; promote: boolean | null }[], prefix = false) => {
  if (!prose.length || prose.length > moves.length || (!prefix && prose.length !== moves.length)) return false
  const sides = sidesFrom(turn, moves.length)
  return prose.every(
    (token, i) =>
      token.side === sides[i] &&
      (token.to === null || moves[i].slice(2, 4) === token.to) &&
      (token.promote === null || moves[i].endsWith('+') === token.promote),
  )
}
let inferredLines = 0
let variationCount = 0
let practiceLessons = 0

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
    const previous = diagrams
      .slice(0, diagrams.indexOf(diagram))
      .reverse()
      .find((item) => item.sfen)
    if (!line && chapter && previous && chapter.tipFigure === previous.id) {
      const text = previous.explain?.ja ?? ''
      const fresh = chapter.tip === chapter.root && !chapter.root.branches.length
      const turns = fresh ? ['b', 'w'] : [chapter.tip.sfen.split(' ')[1]]
      const compareHands = !previous.handsHidden && !diagram.handsHidden
      let found: { turn: string; moves: string[] } | undefined
      for (const turn of turns) {
        const start = withTurn(chapter.tip.sfen, turn)
        const moves = legalStart(start) ? inferMoves(start, diagram.sfen, compareHands).find((candidate) => statedIn(text, candidate, turn)) : undefined
        if (moves) {
          found = { turn, moves }
          break
        }
      }
      if (found) {
        if (fresh) chapter.root.sfen = Position.newBySFEN(withTurn(chapter.root.sfen, found.turn))!.sfen
        inferredLines++
        chapter.tip = extend(chapter.tip, {
          from: previous.id,
          start: chapter.tip.sfen,
          moves: found.moves,
          sides: sidesFrom(found.turn, found.moves.length),
          text: '',
        })
        chapter.tipFigure = diagram.id
        chapter.lastSide = sidesFrom(found.turn, found.moves.length).at(-1)!
        chapter.lastTitle = diagram.title
        annotate(chapter.tip, diagram)
        continue
      }
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
  const byId = new Map(diagrams.map((diagram) => [diagram.id, diagram]))
  const figureOfNode = (target: Node) => (target.figures?.length ? byId.get(target.figures[0].id) : undefined)
  const label = (target: Node) => /^図([^\s　]+)/.exec(figureOfNode(target)?.title.ja ?? '')?.[1]
  const everyNode = (except?: Node) => {
    const out: Node[] = []
    for (const chapter of chapters)
      if (chapter.root !== except) {
        const walk = (at: Node) => {
          out.push(at)
          at.branches.forEach((branch) => walk(branch.child))
        }
        walk(chapter.root)
      }
    return out
  }
  for (let i = 1; i < chapters.length; i++) {
    const root = chapters[i].root
    const target = everyNode(root).find((at) => !at.branches.length && at.figures?.length && key(at.sfen) === key(root.sfen) && label(at) === label(root))
    if (!target) continue
    target.branches.push(...root.branches)
    const have = new Set(target.figures!.map((figure) => figure.id))
    for (const figure of root.figures ?? []) if (!have.has(figure.id)) target.figures!.push(figure)
    const lines = (target.comment ?? '').split('\n')
    const linesEn = (target.commentEn ?? '').split('\n')
    target.comment = [...lines, ...(root.comment ?? '').split('\n').filter((line) => !lines.includes(line))].join('\n')
    target.commentEn = [...linesEn, ...(root.commentEn ?? '').split('\n').filter((line) => !linesEn.includes(line))].join('\n')
    chapters.splice(i--, 1)
  }
  for (let i = 0; i < chapters.length; i++) {
    const root = chapters[i].root
    const source = figureOfNode(root)
    if (!source) continue
    const text = source.explain?.ja ?? ''
    const ref = /^図([^\sから]+?)から/.exec(text)?.[1]
    if (ref === label(root)) continue
    const earlier = everyNode(root).filter((at) => at.figures?.length && Number(at.figures[0].id) < Number(source.id))
    const previous = earlier.sort((x, y) => Number(y.figures![0].id) - Number(x.figures![0].id))[0]
    const parent = ref ? earlier.find((at) => label(at) === ref) : previous && /['’″]/.test(label(previous) ?? '') ? previous : undefined
    if (!parent) continue
    const turn = parent.sfen.split(' ')[1]
    const prose = proseMoves(text.split('。')[0])
    const solutions = inferMoves(parent.sfen, root.sfen, false, 6)
    const prefixed = solutions.filter((candidate) => matches(candidate, turn, prose, true))
    const moves = solutions.find((candidate) => matches(candidate, turn, prose)) ?? (prefixed.length === 1 ? prefixed[0] : undefined)
    if (!moves) continue
    const end = Position.newBySFEN(parent.sfen)!
    moves.forEach((usi) => end.doMove(end.createMoveByUSI(usi)!))
    if (root.branches.length && end.sfen.split(' ')[1] !== root.sfen.split(' ')[1]) continue
    const position = Position.newBySFEN(parent.sfen)!
    let at = parent
    moves.forEach((usi, ply) => {
      position.doMove(position.createMoveByUSI(usi)!)
      const last = ply === moves.length - 1
      const existing = at.branches.find((branch) => branch.usi === usi)
      if (existing) {
        at = existing.child
        if (last) {
          at.figures = [...(at.figures ?? []), ...(root.figures ?? [])]
          at.comment = [at.comment, root.comment].filter(Boolean).join('\n')
          at.commentEn = [at.commentEn, root.commentEn].filter(Boolean).join('\n')
          at.branches.push(...root.branches)
        }
        return
      }
      const child: Node = last ? { ...root, id: `n${ids++}`, sfen: position.sfen } : node(position.sfen)
      at.branches.push({ usi, kind: 'deviation', child })
      at = child
    })
    variationCount++
    chapters.splice(i--, 1)
  }
  const views = diagrams.filter((diagram) => diagram.sfen)
  const lessonSide = views.length && views.filter((diagram) => diagram.view === 'gote').length * 2 > views.length ? 'gote' : 'sente'
  return [
    ...chapters.map((chapter, index) => {
      const titles: Text[] = []
      let walk: Node | undefined = chapter.root
      while (walk) {
        const source = figureOfNode(walk)
        if (source) titles.push(source.title)
        walk = walk.branches.find((branch) => branch.kind === 'main')?.child
      }
      const side = lessonSide
      const first = titles[0] ?? chapter.firstTitle
      const last = titles.at(-1) ?? chapter.lastTitle
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
  const examples = content?.examples ?? []
  if (!examples.length) continue
  const title = content!.title
  let ids = 0
  const practice = examples.map((example, index) => {
    const position = Position.newBySFEN(example.startSfen ?? 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1')!
    const root: Node = { id: `n${ids++}`, sfen: position.sfen, branches: [] }
    let current = root
    example.moves.forEach((usi, ply) => {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.doMove(move)) throw new Error(`Illegal practice move ${topicId} ${usi}`)
      const child: Node = { id: `n${ids++}`, sfen: position.sfen, branches: [] }
      const note = example.notes?.[ply]
      current.branches.push({ usi, kind: 'main', ...(note ? { note: note.ja, noteEn: note.en } : {}), child })
      current = child
    })
    const side = example.userSide ?? (Position.newBySFEN(root.sfen)!.color === Color.BLACK ? 'sente' : 'gote')
    return {
      id: `lesson-${topicId}-practice-${index + 1}`,
      title: `${title.ja}・練習問題: ${example.title.ja}`,
      titleEn: `${title.en} practice: ${example.title.en}`,
      myStrategy: 'lesson',
      opponentStrategy: 'lesson',
      mySide: side,
      userSide: side,
      noEngine: true,
      quizTargets: true,
      source: topic.source,
      goalFormation: example.title.ja,
      root,
    }
  })
  chapters += practice.length
  practiceLessons++
  writeFileSync(
    `${OUT}/${topicId}-practice.json`,
    JSON.stringify({
      id: `${topicId}-practice`,
      order: catalog.indexOf(topic) + 0.5,
      title: { ja: `${title.ja}・練習問題`, en: `${title.en}: practice` },
      path: topic.path,
      intro: {
        ja: `「${title.ja}」で学んだ形を、実際に手順を指して確認します。`,
        en: `Play through the moves to check what you learned in “${title.en}”.`,
      },
      source: topic.source,
      courses: practice,
    }),
  )
}
console.log(
  `${readdirSync(OUT).length} lessons (${practiceLessons} practice), ${chapters} chapters, ${moves} moves, ${inferredLines} stated figure links, ${variationCount} variations`,
)
