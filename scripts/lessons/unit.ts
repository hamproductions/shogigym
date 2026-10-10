import { Position } from 'tsshogi'

export type Text = { ja: string; en: string }
export type Marks = { last?: string; arrows?: string[]; ghosts?: string[]; boxes?: string[]; dashed?: string[] }
export type Step = { moves?: string[]; text: Text; marks?: Marks; illustration?: { crop?: unknown; pieces?: unknown } }
export type Variation = { from: number; moves: string[]; text: Text; steps?: Step[] }
export type Chapter = { title: Text; side: 'sente' | 'gote'; kind?: 'opening' | 'position'; start: string; steps: Step[]; variations?: Variation[] }
export type Reference = { title: string; url: string; license: string; adapted?: boolean }
export type Unit = {
  id: string
  order: number
  path: string[]
  title: Text
  intro: Text
  check?: { question: Text; answer: Text }
  references?: Reference[]
  practice?: boolean
  chapters: Chapter[]
}
export type Branch = { usi: string; kind: 'main' | 'deviation'; child: Node }
export type Node = { id: string; sfen: string; comment?: string; commentEn?: string; figures?: object[]; branches: Branch[] }

export const STARTPOS = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
export const HANDICAPS = [
  'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
]
export const FREE_LICENSES = ['CC BY-SA 4.0', 'CC BY-SA 3.0', 'CC BY 4.0', 'CC0 1.0', 'MIT', 'Public domain']

export const provenance = (unit: Unit) =>
  [
    'この講座のために書き下ろした解説と局面です。',
    ...(unit.references ?? []).map((ref) => `${ref.adapted ? '翻案元' : '参考'}: ${ref.title} (${ref.url}, ${ref.license})`),
  ].join('\n')

export function buildUnit(unit: Unit) {
  let ids = 0
  const node = (sfen: string): Node => ({ id: `n${ids++}`, sfen, branches: [] })
  const annotate = (target: Node, step: Step, figureId: string) => {
    target.comment = target.comment ? `${target.comment}\n${step.text.ja}` : step.text.ja
    target.commentEn = target.commentEn ? `${target.commentEn}\n${step.text.en}` : step.text.en
    target.figures = [...(target.figures ?? []), { id: figureId, ...(step.marks ? { marks: step.marks } : {}), ...(step.illustration ?? {}) }]
  }
  const play = (from: Node, moves: string[], kind: 'main' | 'deviation', where: string) => {
    const position = Position.newBySFEN(from.sfen)
    if (!position) throw new Error(`Invalid position ${where}`)
    let current = from
    moves.forEach((usi, ply) => {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.isValidMove(move) || !position.doMove(move)) throw new Error(`Illegal move ${where} ${usi}`)
      const existing = current.branches.find((branch) => branch.usi === usi)
      if (existing) {
        current = existing.child
        return
      }
      const child = node(position.sfen)
      current.branches.push({ usi, kind: ply === 0 ? kind : 'main', child })
      current = child
    })
    return current
  }
  return unit.chapters.map((chapter, index) => {
    const where = `${unit.id}#${index + 1}`
    const start = Position.newBySFEN(chapter.start === 'startpos' ? STARTPOS : chapter.start)
    if (!start) throw new Error(`Invalid start ${where}`)
    const root = node(start.sfen)
    const tips: Node[] = []
    let tip = root
    chapter.steps.forEach((step, n) => {
      tip = step.moves?.length ? play(tip, step.moves, 'main', `${where}.${n}`) : tip
      annotate(tip, step, `${index + 1}-${n + 1}`)
      tips.push(tip)
    })
    chapter.variations?.forEach((variation, v) => {
      const from = tips[variation.from]
      if (!from) throw new Error(`Variation without anchor ${where} v${v}`)
      let at = play(from, variation.moves, 'deviation', `${where} v${v}`)
      annotate(at, { text: variation.text }, `${index + 1}-v${v + 1}`)
      variation.steps?.forEach((step, n) => {
        at = step.moves?.length ? play(at, step.moves, 'main', `${where} v${v}.${n}`) : at
        annotate(at, step, `${index + 1}-v${v + 1}-${n + 1}`)
      })
    })
    return {
      id: `lesson-${unit.id}-${index + 1}`,
      title: `${unit.title.ja}: ${chapter.title.ja}`,
      titleEn: `${unit.title.en}: ${chapter.title.en}`,
      myStrategy: 'lesson',
      opponentStrategy: 'lesson',
      mySide: chapter.side,
      userSide: chapter.side,
      noEngine: true,
      ...(unit.practice ? { quizTargets: true } : {}),
      source: provenance(unit),
      goalFormation: tip.comment ?? chapter.title.ja,
      root,
    }
  })
}

export const lessonOf = (unit: Unit) => ({
  id: unit.id,
  order: unit.order,
  title: unit.title,
  path: unit.path,
  intro: unit.intro,
  ...(unit.check ? { check: unit.check } : {}),
  source: provenance(unit),
  references: unit.references ?? [],
  courses: buildUnit(unit),
})
