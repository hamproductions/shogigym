import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { usiPosition } from '@/utils/analysis'
import { analyze, engineSupported } from '@/utils/engine'
import { courseTitle, findPath, loadCourse, sideToMove, type Course, type JosekiNode } from '@/utils/model'
import { applyUsi, engineReady, moveText, positionOf } from '@/utils/shogi'
import { positionKey, record } from '@/utils/srs'
import type { BoardArrow } from '@/rendering/Board3D'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { Load, Snapshot } from '@/app/hooks/useModeSwitch'
import { courseNodeAt, goodBranches, lessonText, mainBranch, setupOf, strip } from '@/utils/book'
import { isWeak } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { markOpened } from '@/app/practice'
import { playSound } from '@/appearance/settings'
import { freshScore, type LessonMode, type Score, type Tab } from '@/app/types'
import { moveGloss } from '@/app/pieces'
import { lessonLeadIn } from '@/utils/lessonLeadIn'
import { figureMarks, type MentionMove } from './figureMarks'

const LESSON_GREEN = '#4f8a2a'

type LessonDeps = { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void; setSheetOpen: (open: boolean, height?: number) => void; compact: boolean }

export function useLesson(session: BoardSession, { mistakes, load, setTab, setSheetOpen, compact }: LessonDeps) {
  const { t, i18n } = useTranslation()
  const { mode, course, nodes, liveSfen, cursor, game, preview, toMove, userSide, atEnd, play } = session
  const [lessonMode, setLessonMode] = useState<LessonMode>('study')
  const [answerAt, setAnswerAt] = useState<string | null>(null)
  const [score, setScore] = useState<Score>(freshScore)
  const [jumped, setJumped] = useState(false)
  const [justRight, setJustRight] = useState(false)
  const [checking, setChecking] = useState(false)
  const [pickerSetup, setPickerSetup] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [reading, setReading] = useState({ position: '', index: 0 })
  const missedHere = useRef(new Set<string>())
  const answeredHere = useRef(new Set<string>())
  const shownHere = useRef(new Set<string>())
  const attempts = useCallback(() => ({ answered: [...answeredHere.current], missed: [...missedHere.current], shown: [...shownHere.current] }), [])
  const answerKey = `${cursor}:${strip(liveSfen)}`
  const showAnswer = answerAt === answerKey

  const progress = useMemo(() => {
    if (!course) return null
    let node: JosekiNode | null | undefined = course.root
    let total = 0
    let done = 0
    let ply = 0
    const leadIn = setupOf(course)?.path ? lessonLeadIn(course.root).length : 0
    while (node) {
      const next = mainBranch(node)
      if (!next) break
      if (ply >= leadIn && sideToMove(node) === course.userSide) {
        total++
        if (ply < cursor && game.moves[ply] === next.usi) done++
      }
      node = next.child
      ply++
    }
    return { done, total }
  }, [course, cursor, game.moves])

  const active = mode === 'lesson' && !!course
  const played = useMemo(() => game.moves.slice(0, cursor), [game.moves, cursor])
  const node = useMemo(
    () => (active && course ? courseNodeAt(course, played, liveSfen, i18n.language) : undefined),
    [active, course, played, liveSfen, i18n.language],
  )
  const good = goodBranches(node)
  const { setSourceMarks } = session
  const readingPosition = `${course?.id}:${played.join(' ')}:${liveSfen}`
  const readingParts = (course ? lessonText(node?.comment, node?.commentEn, i18n.language, course) : undefined)?.split('\n').filter(Boolean) ?? []
  const readingIndex = reading.position === readingPosition ? Math.min(reading.index, Math.max(0, readingParts.length - 1)) : 0
  const guided = lessonMode === 'study' && !!course && !!setupOf(course)?.path
  const readingComplete = !guided || readingIndex >= readingParts.length - 1
  const figures = node?.figures
  const asking = active && !preview && toMove === userSide && good.length > 0
  const offBook = active && !preview && !node
  const done = active && atEnd && !preview && !!node && node.branches.filter((b) => b.kind !== 'deviation').length === 0
  const waitingForReply = active && lessonMode === 'study' && !asking && !done && !preview && !mistakes.mistake
  const hidesAnswer = asking && lessonMode === 'quiz' && !showAnswer
  const lastBranch = useMemo(
    () =>
      course && cursor > 0
        ? courseNodeAt(course, played.slice(0, -1), session.sfens[cursor - 1], i18n.language)?.branches.find((branch) => branch.usi === played.at(-1))
        : undefined,
    [course, cursor, played, session.sfens, i18n.language],
  )
  const annotationText = [
    guided ? readingParts[readingIndex] : course ? lessonText(node?.comment, node?.commentEn, i18n.language, course) : undefined,
    ...(!hidesAnswer ? good.map((branch) => branch.note) : []),
    lastBranch?.note,
  ]
    .filter(Boolean)
    .join('\n')
  useEffect(() => {
    if (!active) return
    if (hidesAnswer) return setSourceMarks(null)
    const moves: MentionMove[] = []
    if (lastBranch && session.sfens[cursor - 1]) moves.push({ sfen: session.sfens[cursor - 1], usi: lastBranch.usi })
    const walk = (at: JosekiNode) => {
      for (const branch of at.branches) {
        moves.push({ sfen: at.sfen, usi: branch.usi })
        if (branch.child) walk(branch.child)
      }
    }
    if (node) walk(node)
    if (course && node !== course.root) walk(course.root)
    const selected = guided && figures?.length === readingParts.length ? figures.slice(readingIndex, readingIndex + 1) : figures
    setSourceMarks(selected || annotationText ? figureMarks(selected ?? [], liveSfen, cursor === 0, annotationText, moves) : null)
  }, [
    active,
    figures,
    annotationText,
    course,
    node,
    lastBranch,
    session.sfens,
    liveSfen,
    cursor,
    setSourceMarks,
    guided,
    readingParts.length,
    readingIndex,
    hidesAnswer,
  ])
  const quizTask = (() => {
    if (course?.quizPrompt) return i18n.language === 'ja' ? course.quizPrompt.ja : course.quizPrompt.en
    if (course && setupOf(course)?.path && !course.quizTargets)
      return i18n.language === 'ja' ? 'この章で見た手を、ヒントなしで指してみましょう。' : 'Play the move from this chapter without hints.'
    if (!course?.quizTargets || !good[0]) return undefined
    const usi = good[0].usi
    const position = positionOf(liveSfen)
    const promoted = position.createMoveByUSI(`${usi}+`)
    const decline = !usi.endsWith('+') && promoted && position.isValidMove(promoted)
    return moveGloss(liveSfen, usi) + (decline ? (i18n.language === 'ja' ? ' 成らずに指してください。' : ' Do not promote.') : '')
  })()
  const arrows: BoardArrow[] =
    asking && (lessonMode === 'study' || showAnswer) ? good.map((b) => ({ usi: b.usi, color: LESSON_GREEN, dashed: b.kind !== 'main' })) : []

  const reset = () => {
    setJustRight(false)
    setReading({ position: '', index: 0 })
    setAnswerAt(null)
    setScore(freshScore())
    missedHere.current = new Set()
    answeredHere.current = new Set()
    shownHere.current = new Set()
    setJumped(false)
  }

  const restore = (snapshot: Snapshot) => {
    missedHere.current = new Set(snapshot.lessonAttempts?.missed ?? [])
    answeredHere.current = new Set(snapshot.lessonAttempts?.answered ?? [])
    shownHere.current = new Set(snapshot.lessonAttempts?.shown ?? [])
    let at = snapshot.game.start
    for (const usi of snapshot.game.moves.slice(0, snapshot.cursor)) {
      const next = applyUsi(at, usi)
      if (!next) break
      at = next
    }
    const key = `${snapshot.cursor}:${strip(at)}`
    setAnswerAt(shownHere.current.has(key) ? key : null)
    if (!snapshot.lessonAttempts && snapshot.course) {
      let sfen = snapshot.game.start
      for (const [ply, usi] of snapshot.game.moves.entries()) {
        const node = courseNodeAt(snapshot.course, snapshot.game.moves.slice(0, ply), sfen)
        if (node && sideToMove(node) === snapshot.course.userSide && goodBranches(node).some((branch) => branch.usi === usi))
          answeredHere.current.add(`${ply}:${strip(sfen)}`)
        const next = applyUsi(sfen, usi)
        if (!next) break
        sfen = next
      }
    }
    setLessonMode(snapshot.lessonMode)
    setScore(snapshot.score)
  }

  const open = async (target: Course, sub: LessonMode = 'study', path?: string[]) => {
    const c = await loadCourse(target)
    markOpened(c.id)
    load(c.root.sfen, c.userSide, 'lesson', c)
    const leadIn = path ?? (setupOf(c)?.path ? lessonLeadIn(c.root) : [])
    if (leadIn.length) {
      session.setGame({ start: c.root.sfen, moves: leadIn })
      session.setCursor(leadIn.length)
    }
    setLessonMode(sub)
    setPickerSetup(setupOf(c)?.id ?? null)
    setTab('coach')
    setSheetOpen(compact, compact ? (sub === 'study' ? 50 : 45) : undefined)
  }

  const leave = () => {
    load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null)
    setPickerSetup(null)
    if (compact) setSheetOpen(true, 65)
  }

  const switchLessonMode = (m: LessonMode) => {
    if (m === lessonMode) return
    if (m === 'quiz' && course) return void open(course, 'quiz')
    setLessonMode(m)
    if (compact) setSheetOpen(true, 50)
    setAnswerAt(null)
  }

  const jumpTo = (nodeId: string) => {
    if (!course) return
    session.setPreview(null)
    if (lessonMode === 'quiz') setLessonMode('study')
    const path = findPath(course.root, nodeId) ?? []
    mistakes.setMistake(null)
    setScore(freshScore())
    setJumped(true)
    if (game.start !== course.root.sfen || !path.every((branch, i) => game.moves[i] === branch.usi))
      session.setGame({ start: course.root.sfen, moves: path.map((b) => b.usi) })
    session.setCursor(path.length)
    session.setSelection(null)
    session.setPromotion(null)
  }

  const backToLine = () => {
    let i = cursor
    while (i > 0 && !nodes?.get(strip(session.sfens[i]))) i--
    session.truncate(i)
  }

  const explore = () => {
    if (!course) return
    const moves = preview ? [...game.moves.slice(0, preview.base), ...preview.moves.slice(0, preview.step)] : game.moves.slice(0, cursor)
    const { start } = game
    const keepFlip = session.flipped
    load(start, 'sente', 'analyze', null)
    session.setGame({ start, moves })
    session.setCursor(moves.length)
    session.setFlipped(keepFlip)
    setTab('coach')
  }

  const previewTheirMove = async (usi: string) => {
    const after = applyUsi(liveSfen, usi)
    const line =
      after && engineSupported() && engineReady(after)
        ? ((await analyze(usiPosition(after), { multipv: 1, movetime: 700 })).candidates[0]?.pv.slice(0, 5) ?? [])
        : []
    session.setSelection(null)
    mistakes.setMistake(null)
    session.startPreview([usi, ...line], t('app.ifTheyPlay', { move: moveText(liveSfen, usi) }), 1)
  }

  const commit = (usi: string) => {
    if (!active || preview) return false
    if (toMove !== userSide) {
      if (node?.branches.some((b) => b.usi === usi && b.kind !== 'deviation')) play(usi)
      else void previewTheirMove(usi)
      return true
    }
    const goodMoves = good.map((b) => b.usi)
    if (!node || !goodMoves.length) return false
    const key = `${cursor}:${strip(liveSfen)}`
    const ok = goodMoves.includes(usi)
    const answered = answeredHere.current.has(key)
    const shown = showAnswer || shownHere.current.has(key)
    const assisted = shown || missedHere.current.has(key)
    if (lessonMode === 'quiz' && !answered && !(ok && assisted)) record(positionKey(liveSfen), ok)
    if (!ok) missedHere.current.add(key)
    setJustRight(ok && !answered && !assisted && lessonMode === 'quiz')
    if (ok && !answered) {
      answeredHere.current.add(key)
      setScore((sc) => (shown ? { ...sc, shown: (sc.shown ?? 0) + 1 } : assisted ? { ...sc, retried: (sc.retried ?? 0) + 1 } : { ...sc, right: sc.right + 1 }))
    }
    setAnswerAt(null)
    playSound(ok ? 'right' : 'wrong')
    if (ok) {
      mistakes.setMistake(null)
      play(usi)
      return true
    }
    setChecking(true)
    void mistakes
      .show(
        usi,
        goodMoves[0],
        node.branches.find((b) => b.usi === usi),
      )
      .finally(() => setChecking(false))
      .then((verdict) => {
        if (!answered && (!verdict || isWeak(verdict.label) || node.branches.some((b) => b.usi === usi && b.kind === 'deviation')))
          setScore((sc) => ({ ...sc, wrong: sc.wrong + 1 }))
      })
    return true
  }

  const instruction = () => {
    if (!course) return t('app.pickATechniqueOrAn')
    if (offBook) return t('app.offTheLessonLineGo')
    if (done) return t('app.lineComplete')
    if (asking)
      return lessonMode === 'study'
        ? good[0]?.note
          ? t('app.studyPlayWhy', { move: moveText(liveSfen, good[0].usi), note: good[0].note })
          : t('app.studyYourMove', { side: sideMark(userSide) })
        : showAnswer
          ? t('app.answerShownPlayTheGreen')
          : (quizTask ?? t('app.yourMoveAsFindThe', { me: sideMark(userSide) }))
    return lessonMode === 'study' ? (compact ? t('app.theirMoveIsShownTap') : t('app.theirMoveIsShownPress')) : t('app.theirReplyComesInA')
  }

  return {
    lessonMode,
    score,
    attempts,
    showAnswer,
    revealAnswer: () => {
      shownHere.current.add(answerKey)
      setAnswerAt(answerKey)
    },
    jumped,
    justRight,
    checking,
    pickerSetup,
    setPickerSetup,
    mapOpen,
    setMapOpen,
    readingIndex,
    readingComplete,
    setReadingIndex: (index: number) => setReading({ position: readingPosition, index }),
    progress,
    node,
    good,
    asking,
    offBook,
    done,
    waitingForReply,
    hidesAnswer,
    quizTask,
    annotationText,
    arrows,
    title: course ? `${lessonMode === 'study' ? t('app.study') : t('app.quiz')}: ${courseTitle(course, i18n.language)}` : t('app.openingsPickALesson'),
    instruction,
    reset,
    restore,
    open,
    leave,
    switchLessonMode,
    jumpTo,
    backToLine,
    explore,
    commit,
  }
}

export type Lesson = ReturnType<typeof useLesson>
