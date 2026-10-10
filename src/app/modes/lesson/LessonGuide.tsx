import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { coursesOf, setupOf } from '@/utils/book'
import { courseById, findPath, sideToMove, type Course, type JosekiMove, type JosekiNode } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { useSession } from '@/app/hooks/session'
import { Button } from '@/app/ui/Button'
import type { Lesson } from './useLesson'
import { LessonReferences } from './LessonReferences'

type Series = {
  shuffle: (() => void) | null
  back: () => void
  nextTopic: (() => void) | undefined
}
type Entry = { course: string; path: string[]; variation: boolean }

const PLAY_MS = 650
const positions = new Map<string, number>()

const order = (node: JosekiNode | undefined) => (node?.figures?.length ? Math.min(...node.figures.map((figure) => Number(figure.id) || 0)) : Infinity)
const firstFigure = (node: JosekiNode | null | undefined): JosekiNode | undefined => {
  while (node) {
    if (node.figures?.length) return node
    node = node.branches.find((b) => b.kind === 'main')?.child ?? node.branches[0]?.child
  }
  return undefined
}
const nodeAt = (root: JosekiNode, path: string[]) => {
  let at: JosekiNode | null | undefined = root
  for (const usi of path) at = at?.branches.find((b) => b.usi === usi)?.child
  return at ?? undefined
}
const same = (a: string[], b: string[]) => a.length === b.length && a.every((usi, i) => usi === b[i])

function scriptOf(courses: Course[]) {
  const out: Entry[] = []
  for (const course of courses) {
    const used = new Set<JosekiMove>()
    const detour = (branch: JosekiMove, base: string[], back: string[]) => {
      used.add(branch)
      let at = branch.child
      let path = [...base, branch.usi]
      out.push({ course: course.id, path, variation: true })
      while (at?.branches[0]) {
        path = [...path, at.branches[0].usi]
        at = at.branches[0].child
        out.push({ course: course.id, path, variation: true })
      }
      out.push({ course: course.id, path: back, variation: false })
    }
    const sides = (node: JosekiNode) => node.branches.filter((b) => b.kind !== 'main' && !used.has(b) && firstFigure(b.child))
    let node = course.root
    let parent: JosekiNode | undefined
    let path: string[] = []
    out.push({ course: course.id, path, variation: false })
    for (;;) {
      const main = node.branches.find((b) => b.kind === 'main')
      if (node.figures?.length) {
        const limit = main ? order(firstFigure(main.child)) : Infinity
        const due = [
          ...sides(node).map((branch) => ({ branch, base: path })),
          ...(parent ? sides(parent).map((branch) => ({ branch, base: path.slice(0, -1) })) : []),
        ]
          .filter(({ branch }) => order(firstFigure(branch.child)) < limit)
          .sort((a, b) => order(firstFigure(a.branch.child)) - order(firstFigure(b.branch.child)))
        for (const { branch, base } of due) detour(branch, base, path)
      }
      if (!main?.child) break
      parent = node
      node = main.child
      path = [...path, main.usi]
      out.push({ course: course.id, path, variation: false })
    }
    const end = path
    const rest = (at: JosekiNode, base: string[]) => {
      for (const branch of at.branches) {
        if (branch.kind !== 'main' && !used.has(branch) && firstFigure(branch.child)) detour(branch, base, end)
        if (branch.kind === 'main' && branch.child) rest(branch.child, [...base, branch.usi])
      }
    }
    rest(course.root, [])
  }
  return out
}

type Props = { course: Course; lesson: Lesson; series: Series | null }

export function LessonGuide({ course, lesson, series }: Props) {
  const { i18n } = useTranslation()
  const ja = i18n.language === 'ja'
  const { game, cursor, setGame, setCursor, play, liveSfen } = useSession()
  const setup = setupOf(course)
  const key = setup?.id ?? course.id
  const chapters = setup ? coursesOf(setup.courseIds) : [course]
  const [script] = useState(() => scriptOf(chapters))
  const [revealed, setRevealed] = useState(false)
  const [hold, setHold] = useState(false)
  const [pending, setPending] = useState<Entry | null>(null)
  const [index, setIndexState] = useState(() => positions.get(key) ?? 0)
  const setIndex = (value: number) => {
    positions.set(key, value)
    setIndexState(value)
  }
  const played = game.moves.slice(0, cursor)
  const here = script[index]
  const synced = !!here && here.course === course.id && same(here.path, played)

  useEffect(() => {
    if (synced || pending) return
    const near = script.findIndex((entry, i) => i >= index - 1 && entry.course === course.id && same(entry.path, played))
    const found = near >= 0 ? near : script.findIndex((entry) => entry.course === course.id && same(entry.path, played))
    if (found >= 0) {
      positions.set(key, found)
      setIndexState(found)
    }
  })

  useEffect(() => {
    if (!pending || pending.course !== course.id) return
    setGame({ start: course.root.sfen, moves: pending.path })
    setCursor(pending.path.length)
    setPending(null)
  }, [pending, course, setGame, setCursor])

  const go = (target: number) => {
    const entry = script[target]
    if (!entry) return
    setIndex(target)
    if (entry.course !== course.id) {
      const next = courseById(entry.course)
      if (!next) return
      setPending(entry)
      lesson.open(next, 'study')
      return
    }
    if (entry.path.length === played.length + 1 && same(entry.path.slice(0, -1), played)) return play(entry.path.at(-1)!)
    setGame({ start: course.root.sfen, moves: entry.path })
    setCursor(entry.path.length)
  }
  function finish() {
    if (series?.nextTopic) series.nextTopic()
    else (series?.back ?? lesson.leave)()
  }
  const forward = () => {
    setHold(false)
    if (index >= script.length - 1) return finish()
    go(index + 1)
  }
  const back = () => {
    setHold(true)
    go(index - 1)
  }

  const path: JosekiMove[] = lesson.node ? (findPath(course.root, lesson.node.id) ?? []) : []
  const nodes = [course.root, ...path.flatMap((b) => (b.child ? [b.child] : []))]
  const node = nodes.at(-1)!
  const next = script[index + 1]
  const stepMove =
    next && next.course === course.id && next.path.length === played.length + 1 && same(next.path.slice(0, -1), played) ? next.path.at(-1) : undefined
  const theirTurn = !!stepMove && sideToMove(node) !== course.userSide

  useEffect(() => {
    if (hold || pending || !synced || !theirTurn || node.figures?.length) return
    const id = setTimeout(forward, PLAY_MS)
    return () => clearTimeout(id)
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (event.key === 'ArrowRight') forward()
      else back()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const name = (at: JosekiNode | undefined) => (at ? (ja ? at.comment : (at.commentEn ?? at.comment))?.split('\n')[0] : undefined)
  const upcoming = node.figures?.length ? undefined : firstFigure(node)
  const figure = node.figures?.length ? node : (upcoming ?? [...nodes].reverse().find((at) => at.figures?.length))
  const lastNote = path.at(-1) && (ja ? path.at(-1)!.note : (path.at(-1)!.noteEn ?? path.at(-1)!.note))
  const chapterName = (ja ? course.title : (course.titleEn ?? course.title)).replace(`${ja ? setup?.ja : setup?.name}: `, '')
  const text = figure ? (ja ? figure.comment : (figure.commentEn ?? figure.comment)) : [chapterName, lastNote].filter(Boolean).join('\n')
  const [title, ...body] = (text ?? '').split('\n')
  const chapter = chapters.findIndex((c) => c.id === course.id)
  const end = index >= script.length - 1
  const entering = !!next?.variation && !here?.variation
  const nextLabel = !next
    ? series?.nextTopic
      ? ja
        ? '次のレッスン ›'
        : 'Next lesson ›'
      : ja
        ? '目次に戻る ›'
        : 'Back to the contents ›'
    : next.course !== course.id
      ? ja
        ? '次の章 ›'
        : 'Next chapter ›'
      : entering
        ? `${ja ? '変化へ：' : 'Variation: '}${name(firstFigure(nodeAt(course.root, next.path))) ?? ''} ›`
        : stepMove
          ? `${ja ? '次の手' : 'Next'} ${moveText(liveSfen, stepMove)} ›`
          : ja
            ? '本線に戻る ›'
            : 'Back to the main line ›'
  const yours = !!stepMove && !next?.variation && lesson.asking && lesson.good.some((b) => b.usi === stepMove)
  const hint = here?.variation
    ? ja
      ? '変化を見ています'
      : 'Viewing a variation'
    : yours
      ? ja
        ? `${sideMark(course.userSide)}の番：矢印の手を指すか「次の手」`
        : `${sideMark(course.userSide)} to move: play the arrowed move or press Next`
      : upcoming
        ? ja
          ? `${name(upcoming)?.split(/[\s　]/)[0] ?? '次の図'}まで`
          : `On the way to ${name(upcoming)?.split(/[\s　]/)[0] ?? 'the next figure'}`
        : ''

  return (
    <div className="app-guide">
      <div className="app-guide-head">
        <div className="app-guide-top">
          <button className="app-back" onClick={series?.back ?? lesson.leave}>
            ‹ {ja ? '目次' : 'Contents'}
          </button>
          <span className="app-guide-count">
            {ja ? `第${chapter + 1}章 / ${chapters.length}・${cursor}手目` : `Chapter ${chapter + 1} of ${chapters.length} · move ${cursor}`}
          </span>
        </div>
        <div className="app-guide-bar" aria-hidden="true">
          <i style={{ width: `${script.length > 1 ? (index / (script.length - 1)) * 100 : 100}%` }} />
        </div>
      </div>
      <div className="app-guide-foot">
        <p className="app-guide-hint" role="status">
          {hint}
        </p>
        <nav className="app-guide-nav" aria-label={ja ? '手順の移動' : 'Moves'}>
          <Button disabled={index === 0} onClick={back} aria-keyshortcuts="ArrowLeft">
            ‹ {ja ? '戻る' : 'Back'}
          </Button>
          <Button variant="primary" onClick={end ? finish : forward} aria-keyshortcuts="ArrowRight">
            {nextLabel}
          </Button>
        </nav>
      </div>
      <div className="app-guide-body">
        {title && <h3 className="app-guide-title">{title}</h3>}
        {body.map((line, i) => (
          <p key={i} className={i === 0 ? 'app-guide-text' : 'app-guide-note'}>
            {line}
          </p>
        ))}
        {setup?.references && <LessonReferences references={setup.references} ja={ja} className="app-guide-source" />}
        {end && (
          <div className="app-guide-review">
            <strong>{ja ? 'おさらい' : 'Review'}</strong>
            {setup?.check && (
              <div className="app-guide-check">
                <p>{ja ? setup.check.question.ja : setup.check.question.en}</p>
                {revealed ? (
                  <p className="app-guide-answer">{ja ? setup.check.answer.ja : setup.check.answer.en}</p>
                ) : (
                  <Button size="sm" onClick={() => setRevealed(true)}>
                    {ja ? '答えを見る' : 'Show the answer'}
                  </Button>
                )}
              </div>
            )}
            <div className="app-actions">
              {series?.shuffle && (
                <Button variant="primary" onClick={series.shuffle}>
                  {ja ? 'クイズで確認する' : 'Test yourself'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
