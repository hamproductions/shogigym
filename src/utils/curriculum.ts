import { InitialPositionSFEN } from 'tsshogi'
import catalog from '@/data/curriculum/catalog.json'
import type { Text } from '@/data/strategies'
import type { Course, JosekiNode } from './model'
import { colorSide, positionOf, type Side } from './shogi'

export type TopicExample = { title: Text; startSfen?: string; userSide?: Side; moves: string[]; notes?: Text[] }
export type TopicContent = {
  id: string
  title: Text
  paragraphs: Text[]
  question: Text
  answer: Text
  practice?: { courseIds?: string[]; tsume?: number }
  examples?: TopicExample[]
}

export type Topic = (typeof catalog)[number] & { content: TopicContent }

const files = import.meta.glob<string>('../data/curriculum/*.json', { eager: true, query: '?raw', import: 'default' })
const contents = new Map<string, TopicContent>(
  Object.entries(files)
    .filter(([path]) => !path.endsWith('/catalog.json'))
    .flatMap(([, text]) => (JSON.parse(text) as TopicContent[]).map((topic) => [topic.id, topic] as const)),
)

export const TOPICS: Topic[] = catalog.map((topic) => {
  const content = contents.get(topic.id)
  if (!content) throw new Error(`Missing curriculum topic ${topic.id}`)
  return { ...topic, content }
})

export const CATEGORY_EN: Record<string, string> = {
  はじめての将棋: 'First steps',
  将棋のルール: 'Rules',
  初心者向け入門講座: 'Beginner fundamentals',
  上達のためのテクニック: 'Skills and study',
  将棋の格言: 'Proverbs',
  '囲い、駒組み': 'Castles and development',
  手筋: 'Tactics',
  '詰将棋、必至、寄せ': 'Mate, brinkmate and finishing',
  囲い崩し: 'Breaking castles',
  勉強法: 'Study methods',
  棋書: 'Shogi books',
  '戦法、定跡': 'Openings',
  矢倉戦法: 'Yagura',
  角換わり: 'Bishop Exchange',
  相掛かり: 'Double Wing Attack',
  横歩取り: 'Side Pawn Capture',
  '対振り飛車、対抗型': 'Static vs Ranging Rook',
  向かい飛車: 'Opposing Rook',
  三間飛車: 'Third File Rook',
  四間飛車: 'Fourth File Rook',
  中飛車: 'Central Rook',
  角交換振り飛車: 'Bishop-exchange Ranging Rook',
  相振り飛車: 'Double Ranging Rook',
  奇襲戦法: 'Surprise openings',
  駒落ち定跡: 'Handicap openings',
  '将棋ゲーム、ソフト': 'Games and software',
  '勉強・学習用ソフト': 'Learning apps',
  '対戦アプリ、ゲーム': 'Playing online',
  '検討・解析ソフト': 'Analysis software',
  コラム: 'Shogi culture',
  プロ棋士: 'Professional shogi',
  その他: 'More about shogi',
}

export const topicText = (text: Text, lang: string) => (lang === 'ja' ? text.ja : text.en)

export function exampleCourse(topic: Topic, example: TopicExample, index: number, lang: string, completion?: Text): Course {
  const position = positionOf(example.startSfen ?? InitialPositionSFEN.STANDARD)
  const userSide = example.userSide ?? colorSide(position.color)
  const root: JosekiNode = { id: 'n0', sfen: position.sfen, branches: [] }
  let node = root
  example.moves.forEach((usi, ply) => {
    const move = position.createMoveByUSI(usi)
    if (!move || !position.isValidMove(move) || !position.doMove(move)) throw new Error(`Invalid curriculum move ${topic.id}:${index}:${ply} ${usi}`)
    const child: JosekiNode = { id: `n${ply + 1}`, sfen: position.sfen, branches: [] }
    node.branches.push({ usi, kind: 'main', note: example.notes?.[ply] && topicText(example.notes[ply], lang), child })
    node = child
  })
  const title = topic.content ? topicText(topic.content.title, lang) : topic.title
  const goal = completion ? topicText(completion, lang) : topic.content ? topicText(topic.content.answer, lang) : title
  const lastNote = example.notes?.at(-1)
  node.comment = completion ? topicText(completion, lang) : lastNote ? topicText(lastNote, lang) : goal
  const exampleTitle = (lang: string) => {
    const name = topicText(topic.content.title, lang)
    const subtitle = topicText(example.title, lang)
    return subtitle.startsWith(name) ? subtitle : `${name}: ${subtitle}`
  }
  return {
    id: `curriculum-${topic.id}-${index}-${lang}`,
    baseId: `curriculum-${topic.id}-${index}`,
    setupId: `curriculum-${topic.id}`,
    title: exampleTitle('ja'),
    titleEn: exampleTitle('en'),
    myStrategy: 'curriculum',
    opponentStrategy: 'curriculum',
    mySide: userSide,
    userSide,
    notesFromOpponentView: false,
    goalFormation: goal,
    source: topic.source,
    root,
    main: null,
    vs: null,
    mirrored: false,
    noEngine: true,
  }
}
