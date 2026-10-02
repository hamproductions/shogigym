import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { usiPosition } from '../../../analysis'
import { analyze, engineSupported } from '../../../engine'
import { courseTitle, findPath, sideToMove, type Course, type JosekiNode } from '../../../model'
import { applyUsi, moveText } from '../../../shogi'
import { positionKey, record } from '../../../srs'
import type { BoardArrow } from '../../Board3D'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Mistakes } from '../../hooks/useMistake'
import type { Load } from '../../hooks/useModeSwitch'
import { goodBranches, mainBranch, setupOf, strip } from '../../lib/book'
import { isWeak } from '../../lib/mistake'
import { sideMark } from '../../lib/notation'
import { markOpened } from '../../practice'
import { playSound } from '../../settings'
import { freshScore, type LessonMode, type Score, type Tab } from '../../types'

const LESSON_GREEN = '#4f8a2a'

type LessonDeps = { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void; closeSheet: () => void; compact: boolean }

export function useLesson(session: BoardSession, { mistakes, load, setTab, closeSheet, compact }: LessonDeps) {
  const { t, i18n } = useTranslation()
  const { mode, course, nodes, liveSfen, cursor, game, preview, toMove, userSide, atEnd, play } = session
  const [lessonMode, setLessonMode] = useState<LessonMode>('study')
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState<Score>(freshScore)
  const [jumped, setJumped] = useState(false)
  const [justRight, setJustRight] = useState(false)
  const [checking, setChecking] = useState(false)
  const [pickerSetup, setPickerSetup] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const missedHere = useRef(new Set<string>())

  const progress = useMemo(() => {
    if (!course) return null
    let node: JosekiNode | null | undefined = course.root
    let total = 0
    let done = 0
    let ply = 0
    while (node) {
      const next = mainBranch(node)
      if (!next) break
      if (sideToMove(node) === course.userSide) {
        total++
        if (ply < cursor && game.moves[ply] === next.usi) done++
      }
      node = next.child
      ply++
    }
    return { done, total }
  }, [course, cursor, game.moves])

  const active = mode === 'lesson' && !!course
  const node = active ? nodes?.get(strip(liveSfen)) : undefined
  const good = goodBranches(node)
  const asking = active && !preview && toMove === userSide && good.length > 0
  const offBook = active && !preview && !nodes?.get(strip(liveSfen))
  const done = active && atEnd && !preview && !!node && node.branches.filter((b) => b.kind !== 'deviation').length === 0
  const waitingForReply = active && lessonMode === 'study' && !asking && !done && !preview && !mistakes.mistake
  const hidesAnswer = asking && lessonMode === 'quiz' && !showAnswer
  const arrows: BoardArrow[] = asking && (lessonMode === 'study' || showAnswer) ? good.map((b) => ({ usi: b.usi, color: LESSON_GREEN, dashed: b.kind !== 'main' })) : []

  const reset = () => {
    setJustRight(false)
    setShowAnswer(false)
    setScore(freshScore())
    missedHere.current = new Set()
    setJumped(false)
  }

  const restore = (snapshot: { lessonMode: LessonMode; score: Score }) => {
    setLessonMode(snapshot.lessonMode)
    setScore(snapshot.score)
  }

  const open = (c: Course, sub: LessonMode = 'study') => {
    markOpened(c.id)
    load(c.root.sfen, c.userSide, 'lesson', c)
    setLessonMode(sub)
    setPickerSetup(setupOf(c)?.id ?? null)
    setTab('coach')
    closeSheet()
  }

  const leave = () => {
    load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null)
    setPickerSetup(null)
  }

  const switchLessonMode = (m: LessonMode) => {
    if (m === 'quiz' && course && lessonMode !== 'quiz' && game.moves.length > 0) return open(course, 'quiz')
    setLessonMode(m)
    setShowAnswer(false)
    setScore(freshScore())
  }

  const jumpTo = (nodeId: string) => {
    if (!course) return
    session.setPreview(null)
    if (lessonMode === 'quiz') setLessonMode('study')
    const path = findPath(course.root, nodeId) ?? []
    mistakes.setMistake(null)
    setScore(freshScore())
    setJumped(true)
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
    const line = after && engineSupported() ? ((await analyze(usiPosition(after), { multipv: 1, movetime: 700 })).candidates[0]?.pv.slice(0, 5) ?? []) : []
    session.setSelection(null)
    mistakes.setMistake(null)
    session.startPreview([usi, ...line], t('workshop.ifTheyPlay', { move: moveText(liveSfen, usi) }), 1)
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
    const key = strip(liveSfen)
    const ok = goodMoves.includes(usi)
    const assisted = showAnswer || missedHere.current.has(key)
    if (lessonMode === 'quiz' && !(ok && assisted)) record(positionKey(liveSfen), ok)
    if (!ok) missedHere.current.add(key)
    setJustRight(ok && !assisted && lessonMode === 'quiz')
    if (ok) setScore((sc) => (showAnswer ? { ...sc, shown: (sc.shown ?? 0) + 1 } : assisted ? { ...sc, retried: (sc.retried ?? 0) + 1 } : { ...sc, right: sc.right + 1 }))
    setShowAnswer(false)
    playSound(ok ? 'right' : 'wrong')
    if (ok) {
      mistakes.setMistake(null)
      play(usi)
      return true
    }
    setChecking(true)
    void mistakes
      .show(usi, goodMoves[0], node.branches.find((b) => b.usi === usi))
      .finally(() => setChecking(false))
      .then((verdict) => {
        if (!verdict || isWeak(verdict.label) || node.branches.some((b) => b.usi === usi && b.kind === 'deviation')) setScore((sc) => ({ ...sc, wrong: sc.wrong + 1 }))
      })
    return true
  }

  const instruction = () => {
    if (!course) return t('workshop.pickATechniqueOrAn')
    if (offBook) return t('workshop.offTheLessonLineGo')
    if (done) return t('workshop.lineComplete')
    if (asking) return lessonMode === 'study' ? (good[0]?.note ? t('workshop.studyPlayWhy', { move: moveText(liveSfen, good[0].usi), note: good[0].note }) : t('workshop.studyYourMove', { side: sideMark(userSide) })) : showAnswer ? t('workshop.answerShownPlayTheGreen') : t('workshop.yourMoveAsFindThe', { me: sideMark(userSide) })
    return lessonMode === 'study' ? (compact ? t('workshop.theirMoveIsShownTap') : t('workshop.theirMoveIsShownPress')) : t('workshop.theirReplyComesInA')
  }

  return {
    lessonMode,
    score,
    showAnswer,
    revealAnswer: () => setShowAnswer(true),
    jumped,
    justRight,
    checking,
    pickerSetup,
    setPickerSetup,
    mapOpen,
    setMapOpen,
    progress,
    node,
    good,
    asking,
    offBook,
    done,
    waitingForReply,
    hidesAnswer,
    arrows,
    title: course ? `${lessonMode === 'study' ? t('workshop.study') : t('workshop.quiz')}: ${courseTitle(course, i18n.language)}` : t('workshop.openingsPickALesson'),
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
