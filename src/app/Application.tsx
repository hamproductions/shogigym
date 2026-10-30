import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { LABELS } from '@/utils/analysis'
import { COURSES, SETUPS, loadBookFor, loadCatalog, useCourseVersion } from '@/utils/model'
import { useCommands } from '@/app/dialogs/commands'
import { loadSounds, useSettings } from '@/appearance/settings'
import { loadFormations } from '@/utils/formationTags'
import { SessionContext } from '@/app/hooks/session'
import { useAnnouncements } from '@/app/hooks/useAnnouncements'
import { useAutoplay } from '@/app/hooks/useAutoplay'
import { useBoardDecor } from '@/app/hooks/useBoardDecor'
import { useBoardInput } from '@/app/hooks/useBoardInput'
import { useBoardSession } from '@/app/hooks/useBoardSession'
import { useEvaluation } from '@/app/hooks/useEvaluation'
import { useCandidateMoves } from '@/app/hooks/useCandidateMoves'
import { useFlowLanes } from '@/app/hooks/useFlowLanes'
import { scrollPanelTop, useLayout } from '@/app/hooks/useLayout'
import { useLevel } from '@/app/hooks/useLevel'
import { useMistake } from '@/app/hooks/useMistake'
import { useModeSlots, useModeSwitch } from '@/app/hooks/useModeSwitch'
import { useMoveReview } from '@/app/hooks/useMoveReview'
import { useOpponent } from '@/app/hooks/useOpponent'
import { usePersistedSession } from '@/app/hooks/usePersistedSession'
import { useAutoRate } from '@/app/hooks/useAutoRate'
import { useKifuDrop } from '@/app/hooks/useKifuDrop'
import { useRouteMode } from '@/app/hooks/useRouteMode'
import { useShortcuts } from '@/app/hooks/useShortcuts'
import { useTransient } from '@/app/hooks/useTransient'
import { useView } from '@/app/hooks/useView'
import { Icon } from './icons'
import { bookForMove, bookMovesAt } from '@/utils/book'
import { SNAPSHOT_NAME, VIEWER_EVENT } from '@/utils/events'
import { mistakeIsBad } from '@/utils/mistake'
import { moveText, pvText, type Side } from '@/utils/shogi'
import { useAnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import { useDrill } from '@/app/modes/drill/useDrill'
import { useLesson } from '@/app/modes/lesson/useLesson'
import { useSpar } from '@/app/modes/spar/useSpar'
import { useWatch } from '@/app/modes/view/useWatch'
import { useTesuji } from '@/app/modes/tesuji/useTesuji'
import { firstPieceHint } from '@/app/modes/tsume/firstPiece'
import { sideMark } from '@/utils/notation'
import { attackerOf } from '@/app/practice'
import { useTsume } from '@/app/modes/tsume/useTsume'
import { SidePanels } from '@/app/panels/SidePanels'
import { AppShell } from '@/app/layout.styles'
import { styled, Wrap } from 'styled-system/jsx'
import { useLineAhead } from '@/app/hooks/useLineAhead'
import { saveMistakes } from '@/utils/mistakes'
import { useSteadyRate } from '@/app/hooks/useSteadyRate'
import { say, sayFurigomaResult } from '@/utils/voice'
import { Rail } from '@/app/rail/Rail'
import { ORIGIN_KEY, RETURN_EVENT, store } from '@/app/modes/lesson/reading'
import { BoardStage } from '@/app/stage/BoardStage'
import { ModeBar, WatchOptions } from '@/app/stage/ModeBar'
import { FsExit, Stage } from '@/app/stage/stage.styles'
import { Button } from '@/app/ui/Button'
import { Marks } from '@/app/ui/SideMark'
import { dialog } from 'styled-system/recipes'
import { Dialog } from '@/app/ui/Dialog'
import { SegmentedField } from '@/app/ui/Segmented'
import { isGameMode, type Confirm, type Mode, type Tab } from './types'

const ConfirmDialog = lazy(() => import('@/app/dialogs/ConfirmDialog').then((m) => ({ default: m.ConfirmDialog })))
const NewGameDialog = lazy(() => import('@/app/dialogs/NewGameDialog').then((m) => ({ default: m.NewGameDialog })))
const InsightsDialog = lazy(() => import('@/app/dialogs/InsightsDialog').then((m) => ({ default: m.InsightsDialog })))
const ReportDialog = lazy(() => import('@/app/dialogs/ReportDialog').then((m) => ({ default: m.ReportDialog })))
const OpenGameDialog = lazy(() => import('@/app/dialogs/OpenGameDialog').then((m) => ({ default: m.OpenGameDialog })))
const Palette = lazy(() => import('@/app/dialogs/Palette').then((m) => ({ default: m.Palette })))
const SettingsDialog = lazy(() => import('@/app/dialogs/SettingsDialog').then((m) => ({ default: m.SettingsDialog })))
const WelcomeDialog = lazy(() => import('@/app/dialogs/WelcomeDialog').then((m) => ({ default: m.WelcomeDialog })))
const PieceViewer = lazy(() => import('@/features/piece-viewer/PieceViewer').then((m) => ({ default: m.PieceViewer })))
const Furigoma = lazy(() => import('@/app/stage/Furigoma').then((m) => ({ default: m.Furigoma })))
const CameraPanel = lazy(() => import('@/features/camera/CameraPanel').then((m) => ({ default: m.CameraPanel })))

const CAMERA_OPEN = 'joseki-practice:camera-open:v1'

export function Application({ routeMode, routeMain }: { routeMode?: string; routeMain?: string }) {
  const courseVersion = useCourseVersion()
  useEffect(() => {
    void loadSounds()
    void loadFormations()
    loadCatalog().catch((error) => console.warn('lesson catalog not loaded', error))
  }, [])
  const { t } = useTranslation()
  const session = useBoardSession()
  const { mode, course, preview, sfen, sfens, nodes, prevSfen, lastMove, cursor, atEnd, playing, userSide, game } = session
  const needsBook = mode !== 'tsume' && mode !== 'tesuji' && mode !== 'lesson'
  useEffect(() => {
    if (needsBook) loadBookFor([...sfens.slice(Math.max(0, cursor - 2), cursor + 1), sfen]).catch((error) => console.warn('opening book not loaded', error))
  }, [needsBook, sfens, cursor, sfen])
  const [tab, setTab] = useState<Tab>('coach')
  const [ratingPaused, setRatingPaused] = useState(false)
  const [palette, setPalette] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(CAMERA_OPEN) === '1') setCameraOpen(true)
    } catch {
      return
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(CAMERA_OPEN, cameraOpen ? '1' : '0')
    } catch {
      return
    }
  }, [cameraOpen])
  const [cameraLive, setCameraLive] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const [report, setReport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [watchSetup, setWatchSetup] = useState(false)
  const [watchOrder, setWatchOrder] = useState<'random' | 'sente' | 'gote'>('random')
  const [pendingFurigoma, setPendingFurigoma] = useState(false)
  const furigomaCompleted = useRef(false)
  const furigomaResult = useRef<boolean[] | null>(null)
  const [furigomaFaces, setFurigomaFaces] = useState<boolean[] | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [nudge, setNudge] = useTransient<string>(2200)
  const levels = useLevel()
  const view = useView(mode)
  const slots = useModeSlots()
  const { load } = slots
  const mistakes = useMistake(session, setTab)
  const coach = useMoveReview(session)
  const watch = useWatch(session, load, !!coach.review, pendingFurigoma)
  const evaluation = useEvaluation(session)
  const drill = useDrill(session, { mistakes, setTab })
  const layout = useLayout({
    mode,
    needsPicking: (mode === 'lesson' && !course) || (mode === 'drill' && !drill.drill?.items.length),
    welcome: levels.welcome,
  })
  const lesson = useLesson(session, { mistakes, load, setTab, closeSheet: () => layout.setSheetOpen(false), compact: layout.compact })
  const tsume = useTsume(session, { mistakes, load, setTab })
  const tesuji = useTesuji(session, { mistakes, load, setTab })
  const analyze = useAnalyzeGames(session, {
    load,
    setTab,
    setConfirm,
    analysisSnapshot: () => slots.stashed('analyze'),
    onSaveError: () => setNudge(t('games.couldNotSaveBrowserStorage')),
    onOpen: () => {
      layout.setPanel({ hidden: false })
      requestAnimationFrame(() => scrollPanelTop())
    },
  })
  useKifuDrop(analyze.importGame, setNudge)
  const spar = useSpar(session, {
    load,
    setTab,
    coach,
    mistakes,
    setNudge,
    setConfirm,
    forgetReply: () => opponent.forget(),
    openInAnalyze: analyze.openReview,
    preserveAnalysis: analyze.preserveAnalysis,
    paused: pendingFurigoma,
    onOpenAnalyze: () => layout.setDrawer(true),
    onRematch: (side, drawn) => startSpar(side, drawn),
  })
  const opponent = useOpponent(session, {
    lessonMode: lesson.lessonMode,
    halted: spar.halted,
    sparGame: spar.config,
    pace: spar.pace,
    onAiEnd: spar.endByAi,
    hold: cameraOpen && cameraLive,
  })
  const board = mode === 'spar' ? { ...session, assist: spar.assist, userTurn: atEnd ? session.userTurn : spar.over } : session
  const rating = useAutoRate({
    enabled: board.ai && board.assist && (mode === 'spar' || (mode === 'analyze' && !ratingPaused)),
    sfens: session.sfens,
    moves: game.moves,
    cursor,
    allSides: mode === 'analyze',
    userSide,
    onScore: evaluation.recordEval,
  })
  const { enterMode, resume } = useModeSwitch(slots, { session, lesson, drill, tsume, tesuji, spar, analyze, mistakes, layout, setTab })
  const restored = usePersistedSession({ session, lesson, tsume, drill, spar, slots, resume })
  useRouteMode(mode, enterMode, routeMode, routeMain, restored, lesson.leave)
  const { announce, tesujiNote, onMoveLanded } = useAnnouncements(session, mode === 'spar' && !spar.over && !spar.assist)
  const flow = useFlowLanes(session, evaluation.analysis)
  const upcoming = useAutoplay(session, evaluation.best?.move)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bookHere = useMemo(() => bookMovesAt(sfen, nodes), [sfen, nodes, courseVersion])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bookLast = useMemo(() => bookForMove(prevSfen, lastMove, nodes, course), [prevSfen, lastMove, nodes, course, courseVersion])
  const { mistake } = mistakes
  const startWatch = watch.start
  const setFurigomaBanner = spar.setFurigomaBanner
  const completeFurigoma = useCallback(
    (resolvedSide?: Side) => {
      if (furigomaCompleted.current) return
      furigomaCompleted.current = true
      const side =
        resolvedSide ?? ((furigomaResult.current ?? Array.from({ length: 5 }, () => Math.random() < 0.5)).filter(Boolean).length >= 3 ? 'sente' : 'gote')
      if (mode === 'view') startWatch(side)
      else {
        load(InitialPositionSFEN.STANDARD, side, 'spar', null)
        setFurigomaBanner(t(side === 'sente' ? 'app.playSente' : 'app.playGote'))
      }
      setPendingFurigoma(false)
    },
    [mode, startWatch, load, setFurigomaBanner, t],
  )

  const commit = (usi: string) => {
    session.setPromotion(null)
    session.setPeekFrom(null)
    if (mode === 'view') {
      session.setPlaying(false)
      session.play(usi)
      return
    }
    if (mode === 'tesuji' && tesuji.drill) return tesuji.commit(usi)
    if (mode === 'tsume' && tsume.tsume) return tsume.commit(usi)
    if (lesson.commit(usi) || drill.commit(usi)) return
    session.play(usi)
  }
  const goBack = () => {
    session.exitPreview()
    tsume.resume()
  }
  const spoilerFree = lesson.hidesAnswer || drill.hidesAnswer || tsume.hidesAnswer || tesuji.hidesAnswer
  const candidateMoves = useCandidateMoves(
    board,
    evaluation.analysis,
    !spoilerFree && (mode !== 'spar' || (!spar.halted && !spar.newGameOpen && !spar.over)) && !pendingFurigoma,
  )
  const decor = useBoardDecor(board, {
    candidateMove: tab === 'coach' ? (candidateMoves.selected?.move ?? null) : null,
    analysis: evaluation.analysis,
    showBest: evaluation.showBest,
    tab,
    spoilerFree,
    modeArrows: [...tesuji.arrows, ...drill.arrows, ...lesson.arrows, ...tsume.arrows],
    review: coach.review,
    reviewAt: coach.reviewAt,
    reply: opponent.reply,
    upcoming,
    hoverLane: flow.hoverLane,
    showControl: view.showControl,
    showEscape: tsume.showEscape,
    level: levels.level,
    nudge,
    checking: lesson.checking,
    tesujiNote,
    bookLast,
  })
  const input = useBoardInput(board, { mistakes, commit, lessonMode: lesson.lessonMode, halted: spar.halted, setNudge })

  useEffect(() => {
    if (mode !== 'view' || game.moves.length !== 0) return
    setWatchSetup(true)
    setPendingFurigoma(false)
    return () => {
      setWatchSetup(false)
      setPendingFurigoma(false)
    }
  }, [mode, game])

  useEffect(() => {
    if (mode !== 'view' || !pendingFurigoma || !furigomaFaces) return
    const timer = setTimeout(() => {
      completeFurigoma()
    }, 2500)
    return () => clearTimeout(timer)
  }, [mode, pendingFurigoma, furigomaFaces, completeFurigoma])

  useEffect(() => {
    const back = (event: Event) => {
      enterMode((event as CustomEvent<Mode>).detail)
      setTab('report')
    }
    window.addEventListener(RETURN_EVENT, back)
    return () => window.removeEventListener(RETURN_EVENT, back)
  })
  useEffect(() => {
    const open = () => setShowViewer(true)
    window.addEventListener(VIEWER_EVENT, open)
    return () => window.removeEventListener(VIEWER_EVENT, open)
  }, [])
  useEffect(() => {
    scrollPanelTop()
  }, [mode])
  const previewOpen = preview !== null
  const lessonDone = lesson.done
  useEffect(() => {
    if (mode === 'lesson' || mode === 'drill' || mode === 'tsume') scrollPanelTop(true)
  }, [mode, previewOpen, lessonDone])
  if (layout.twoPanels && tab === 'moves') setTab('coach')

  const instruction = (() => {
    if (lesson.checking) return t('app.checkingThatMove')
    if (preview && mistake) return mistakeIsBad(mistake) ? t('app.watchHowItGetsPunished') : t('app.watchWhatFollowsThenGo')
    if (mistake && !((mode === 'lesson' || mode === 'tesuji') && !layout.compact && !preview))
      return mistakeIsBad(mistake)
        ? t('app.wasAMistakeTryAgain', { move: moveText(session.sfens[mistake.base], mistake.usi) })
        : t(mode === 'lesson' || mode === 'drill' ? 'app.isAFineMoveBut' : 'app.isAFineMoveNotIt', { move: moveText(session.sfens[mistake.base], mistake.usi) })
    if (preview) return t('app.previewWatchItPlayOut')
    return { lesson, drill, tesuji, tsume, spar, view: watch, analyze }[mode].instruction()
  })()
  const title = mode === 'lesson' ? lesson.title : mode === 'tsume' ? (tsume.title ?? analyze.title) : { drill, tesuji, spar, view: watch, analyze }[mode].title
  const studyReply = lesson.waitingForReply ? opponent.reply : null
  const picking = mode === 'lesson' && !course
  const tsumeTask = (() => {
    const state = tsume.tsume
    if (!state) return null
    if (state.status === 'solved' || state.status === 'shown')
      return {
        text: state.status === 'solved' ? tsume.solvedText(state) : `${t('tsume.solution')}${pvText(state.problem.sfen, state.problem.pv, state.problem.mate)}`,
        ...(state.status === 'shown' ? { action: t('tsume.tryAgain'), run: tsume.retry } : {}),
      }
    const hintAction = state.hint >= 2 ? { action: t('tsume.showSolution'), run: tsume.reveal } : { action: t('tsume.hint'), run: tsume.hint }
    if (state.status === 'wrong' && state.reply) return { text: `✗ ${state.reason}：${state.reply}`, action: t('tsume.tryAgain'), run: tsume.tryAgain }
    if (state.status === 'wrong' || (state.missed && state.reason)) return { text: `✗ ${state.reason}${state.reply ? `：${state.reply}` : ''}`, ...hintAction }
    if (state.hint >= 1) return { text: t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(state.problem) }), ...hintAction }
    return { text: t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(state.problem)), mate: state.problem.mate }), ...hintAction }
  })()
  const phoneTask =
    layout.compact && !layout.drawer && mode === 'tsume'
      ? tsumeTask
      : layout.compact && !layout.drawer && !isGameMode(mode) && mode !== 'view' && mode !== 'tsume'
        ? spar.erred && coach.review
          ? {
              text: t('app.phoneMistake', {
                move: moveText(session.sfens[coach.reviewAt - 1], game.moves[coach.reviewAt - 1]),
                label: LABELS[coach.review.label].text,
              }),
              action: t('app.takeBack'),
              run: spar.takeBack,
            }
          : {
              text: instruction,
              action: studyReply
                ? t('app.playTheirMove')
                : picking
                  ? t('app.pickALesson')
                  : mode === 'drill' && !drill.item
                    ? t('app.pickAQueue')
                    : t('app.panel'),
              run: () => (studyReply ? session.play(studyReply.usi) : layout.setDrawer(true)),
            }
        : null
  const autoplayAllowed = isGameMode(mode) || !!preview
  const finished = mode === 'spar' && (session.gameOver || spar.resigned || !!spar.aiEnded || !!spar.flagged)
  const result = !finished
    ? null
    : spar.aiEnded
      ? spar.aiEnded === 'resign'
        ? 'win'
        : 'loss'
      : spar.resigned
        ? 'resigned'
        : spar.flagged
          ? spar.flagged === userSide
            ? 'time'
            : 'win'
          : session.toMove === userSide
            ? 'loss'
            : 'win'
  useEffect(() => {
    if (mode !== 'spar') return
    if (!game.moves.length) analyze.forgetLive()
    else analyze.saveLive(result ?? undefined)
  }, [mode, game.start, game.moves, result]) // eslint-disable-line react-hooks/exhaustive-deps
  const speechState = useRef({ mode, finished: !!result || !!watch.result, restored })
  useEffect(() => {
    const previous = speechState.current
    speechState.current = { mode, finished: !!result || !!watch.result, restored }
    if (!previous.restored || previous.mode !== mode || previous.finished) return
    if (!(result || (mode === 'view' && watch.won)) || (!result && !atEnd) || !game.moves.length || spar.newGameOpen || pendingFurigoma || watchSetup) return
    if (session.gameOver) return
    return say('ありがとうございました')
  }, [result, mode, watch.result, watch.won, restored, atEnd, game.moves.length, spar.newGameOpen, pendingFurigoma, watchSetup, session.gameOver])
  const evalOn = board.ai && board.assist && (isGameMode(mode) || mode === 'view' || (mode === 'lesson' && !!course && lesson.lessonMode === 'study'))
  const steadyRate = useSteadyRate(evalOn && evaluation.evalSente ? evaluation.senteRate : null)
  const evalRate = evalOn ? (steadyRate ?? 0.5) : null
  const evalBar = evalRate !== null && !view.hideUi
  const startSpar = (side: Side, isRandom?: boolean) => {
    spar.clearFurigomaBanner()
    spar.setDrawn(!!isRandom)
    session.setPlaying(false)
    if (isRandom) {
      furigomaCompleted.current = false
      furigomaResult.current = null
      setFurigomaFaces(null)
      if (three) load(InitialPositionSFEN.STANDARD, side, 'spar', null)
      setPendingFurigoma(true)
      if (three) say('あなたの振り歩先です', true)
    } else {
      load(InitialPositionSFEN.STANDARD, side, 'spar', null)
      say('よろしくお願いします', true)
    }
  }
  const newGame = () => load(InitialPositionSFEN.STANDARD, userSide, mode === 'lesson' ? 'analyze' : mode, null)
  const startOver = () =>
    game.moves.length > 0
      ? setConfirm({
          text: t('app.startOverFromTheBeginning'),
          run: () => load(course ? course.root.sfen : InitialPositionSFEN.STANDARD, userSide, mode, course),
        })
      : undefined
  const commands = useCommands({
    sfen,
    setMode: enterMode,
    flip: () => session.setFlipped((v) => !v),
    tilt: () => view.setTilted((v) => !v),
    openCourse: lesson.open,
    play: commit,
    newGame,
  })

  const lineAhead = useLineAhead(session, lesson)
  useShortcuts({
    session,
    view,
    palette,
    togglePalette: () => setPalette((v) => !v),
    dialogOpen: watchSetup || showSettings || showImport || showTrends || !!confirm || spar.newGameOpen || pendingFurigoma,
    closeDialogs: () => (
      setShowSettings(false),
      setShowImport(false),
      setShowTrends(false),
      setConfirm(null),
      spar.setNewGameOpen(false),
      pendingFurigoma ? completeFurigoma() : setPendingFurigoma(false)
    ),
    overlayOpen: lesson.mapOpen && !!course,
    replyMove: opponent.reply?.usi,
    studyMove: lesson.asking && lesson.lessonMode === 'study' ? lesson.good[0]?.usi : undefined,
    commit,
    autoplayAllowed,
    togglePanel: layout.togglePanel,
    toggleEscape: tsume.toggleEscape,
    toggleWatch: watch.toggle,
    lineAhead,
  })

  const welcomeDone = (next?: () => void) => () => {
    levels.finishWelcome()
    next?.()
  }
  const settings = useSettings()
  const three = settings.environment === 'traditional' || settings.environment === 'casual'
  const mainStrategy = settings.mainStrategy
  const firstLesson = COURSES.find(
    (c) => c.id === (SETUPS.find((x) => x.basics && x.main === mainStrategy) ?? SETUPS.find((x) => x.main === mainStrategy) ?? SETUPS[0])?.courseIds[0],
  )

  const cameraDocked = !layout.compact && !layout.panelHidden
  const camera = (
    <CameraPanel
      live={mode === 'spar' ? session.sfens[session.sfens.length - 1] : sfen}
      line={session.sfens}
      moves={game.moves}
      userSide={userSide}
      opponent={mode === 'spar'}
      reply={mode === 'spar' ? opponent.reply?.usi : undefined}
      land={opponent.land}
      onLive={setCameraLive}
      canMove={input.canMove && !session.visualMoving && !session.promotion}
      busy={session.visualMoving}
      over={session.gameOver || (mode === 'spar' && spar.over)}
      commit={commit}
      undo={() => (mode === 'spar' ? spar.takeBack() : session.setCursor(Math.max(0, cursor - 1)))}
      promote={(from, to) => input.onDrop(from, to)}
      fresh={() => load(InitialPositionSFEN.STANDARD, 'sente', 'analyze', null)}
      onClose={() => setCameraOpen(false)}
      docked={cameraDocked}
    />
  )

  return (
    <SessionContext.Provider value={board}>
      <AppShell
        className="app-shell"
        _compact={{
          '&[data-drawer-open][data-panel-side]:not([data-fs])': {
            gridTemplateColumns: 'minmax(0, 1fr) clamp(160px, var(--panel-w), 70vw)',
            gridTemplateRows: 'auto minmax(0, 1fr)',
          },
        }}
        data-fs={view.hideUi || undefined}
        data-zoned={layout.zoned || undefined}
        data-panel-hidden={(!layout.zoned && layout.panelHidden) || undefined}
        data-drawer-open={(layout.compact && layout.drawer) || undefined}
        data-panel-side={(layout.compact && layout.panelSide) || undefined}
        data-sheet-set={!!layout.sheetH || undefined}
        style={{ ['--panel-w' as string]: `${layout.panelWidth}px`, ['--sheet-h' as string]: layout.sheetH ?? undefined }}
      >
        <Rail
          mode={mode}
          onLessonBack={mode === 'lesson' && course ? lesson.leave : undefined}
          onMode={enterMode}
          compact={layout.compact}
          view={view}
          settingsOpen={showSettings}
          onSettings={() => setShowSettings(true)}
          onPalette={() => setPalette(true)}
          onTrends={() => setShowTrends(true)}
          camera={{ on: cameraOpen, toggle: () => setCameraOpen((v) => !v) }}
          onReport={isGameMode(mode) && game.moves.length > 0 ? () => (setTab('report'), layout.setPanel({ hidden: false })) : undefined}
          snapshotName={`${SNAPSHOT_NAME}-${mode}-${cursor}`}
        />
        <Stage className="app-stage" data-previewing={!!preview || !atEnd || (playing && mode !== 'view' && mode !== 'spar') || undefined}>
          <FsExit className="app-fs-exit" onClick={() => view.setHideUi(false)} aria-label={t('app.showUi')} title={`${t('app.showUi')} (Esc)`}>
            <Icon name="panel" size={18} />
            <span>{t('app.showUi')} (Esc)</span>
          </FsExit>
          <ModeBar
            onFlip={() => session.setFlipped((v) => !v)}
            title={title}
            instruction={instruction}
            lessonMode={lesson.lessonMode}
            sheetUp={layout.compact && layout.drawer}
            panelHidden={layout.panelHidden}
            onPanel={(hidden) => layout.setPanel({ hidden })}
            spar={spar}
            watch={watch}
            onWatchSetup={() => setWatchSetup(true)}
            evalRate={evalRate}
            barShown={evalBar}
            onStartOver={startOver}
            onOpenGame={() => setShowImport(true)}
            tsume={tsume}
            tesuji={tesuji}
            lesson={lesson}
            drill={drill}
          />
          <BoardStage
            hideCoordinates={(mode === 'spar' && atEnd && !spar.over) || (spoilerFree && mode !== 'tsume')}
            furigoma={pendingFurigoma && three}
            onFurigoma={(faces) => {
              if (!pendingFurigoma || furigomaCompleted.current) return
              furigomaResult.current = faces
              setFurigomaFaces(faces)
              const pawns = faces.filter(Boolean).length
              sayFurigomaResult(pawns, mode === 'view')
            }}
            onMoveLanded={(landed) => (onMoveLanded(landed), session.landed(landed))}
            evalRate={evalBar ? evalRate : null}
            evalSlot={mode === 'spar' && board.ai && !view.hideUi}
            view={view}
            decor={decor}
            input={input}
            commit={commit}
            mistake={mistake}
            onBack={goBack}
            spar={spar}
            watch={watch}
            tsume={tsume.tsume}
            hasDrillCard={!!drill.item}
            phoneTask={phoneTask}
            announce={announce}
            onZones={layout.setZones}
          />
        </Stage>
        <SidePanels
          dock={cameraOpen && cameraDocked ? <Suspense fallback={null}>{camera}</Suspense> : undefined}
          layout={layout}
          tab={tab}
          setTab={setTab}
          sheetOpen={layout.sheetOpen ?? (picking || (mode === 'drill' && !drill.item))}
          model={{
            analyzeMoves: slots.stashed('analyze')?.game.moves.length ?? 0,
            rating,
            ratingPaused,
            onToggleRating: () => setRatingPaused((paused) => !paused),
            lesson,
            drill,
            tsume,
            tesuji,
            spar,
            watch,
            analyze,
            mistakes,
            evaluation,
            candidateMoves,
            coach,
            level: levels.level,
            reply: opponent.reply,
            spoilerFree,
            bookHere,
            bookLast,
            lanes: flow.lanes,
            lanesSfen: flow.lanesSfen,
            onHoverLane: flow.setHoverLane,
            onBack: goBack,
            setConfirm,
            onReportRoute: (route) => {
              const from = mode
              enterMode(route)
              store(ORIGIN_KEY, from)
              if (route === 'tesuji') tesuji.start('両取り')
            },
            onReportExpand: () => setReport(true),
            onReportPractice: (items) => (saveMistakes(items), enterMode('drill', items)),
            onReturnTo: (m) => (enterMode(m), setTab('report')),
            onReportLesson: (id) => {
              const from = mode
              enterMode('lesson')
              lesson.setPickerSetup(`lesson-${id}`)
              store(ORIGIN_KEY, from)
            },
          }}
          canAutoplay={!!upcoming && autoplayAllowed}
          picking={picking || (mode === 'drill' && !drill.item)}
        />
        <Suspense fallback={null}>
          {mode === 'view' && watchSetup && (
            <Dialog label={t('watch.title')} onBackdrop={() => setWatchSetup(false)}>
              <styled.h2 mb="2">{t('watch.title')}</styled.h2>
              <WatchOptions watch={watch} />
              <SegmentedField
                label={t('watch.order')}
                value={watchOrder}
                options={[
                  { v: 'random', t: t('watch.furigoma') },
                  { v: 'sente', t: `${t('watch.kamite')} · ${t('common.sente')}` },
                  { v: 'gote', t: `${t('watch.shimote')} · ${t('common.sente')}` },
                ]}
                onChange={(value) => setWatchOrder(value as typeof watchOrder)}
              />
              <Wrap gap="2" align="center" justify="flex-end" mt="4">
                <Button onClick={() => setWatchSetup(false)}>{t('app.cancel')}</Button>
                <Button
                  variant="primary"
                  autoFocus
                  onClick={() => {
                    setWatchSetup(false)
                    if (watchOrder !== 'random') {
                      watch.start(watchOrder)
                      say('よろしくお願いします', true)
                      return
                    }
                    furigomaCompleted.current = false
                    furigomaResult.current = null
                    setFurigomaFaces(null)
                    setPendingFurigoma(true)
                    if (three) say('振り駒を行います', true)
                  }}
                >
                  {t('newGame.start')}
                </Button>
              </Wrap>
            </Dialog>
          )}
          {spar.newGameOpen && (
            <NewGameDialog
              side={userSide}
              preset={spar.newGamePreset}
              onClose={() => spar.setNewGameOpen(false)}
              onStart={(side, isRandom) => {
                spar.setNewGameOpen(false)
                startSpar(side, isRandom)
              }}
            />
          )}
          {pendingFurigoma && !three && <Furigoma spectator={mode === 'view'} onDone={completeFurigoma} />}
          {pendingFurigoma && three && (
            <div onClick={() => completeFurigoma()} style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'auto', cursor: 'pointer' }}>
              <div className={`${dialog().content} app-dialog`} style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
                <styled.p mt="0" mx="0" mb="4" role="status">
                  <Marks>
                    {furigomaFaces
                      ? mode === 'view'
                        ? t('watch.furigomaResult', {
                            pawns: furigomaFaces.filter(Boolean).length,
                            tokins: furigomaFaces.filter((face) => !face).length,
                            side: t(furigomaFaces.filter(Boolean).length >= 3 ? 'common.sente' : 'common.gote'),
                          })
                        : settings.lang === 'ja'
                          ? `歩${furigomaFaces.filter(Boolean).length}枚・と金${furigomaFaces.filter((face) => !face).length}枚：あなたは${furigomaFaces.filter(Boolean).length >= 3 ? '先手' : '後手'}`
                          : `${furigomaFaces.filter(Boolean).length} pawns · ${furigomaFaces.filter((face) => !face).length} tokins: you play ${furigomaFaces.filter(Boolean).length >= 3 ? 'Sente' : 'Gote'}`
                      : settings.lang === 'ja'
                        ? '振り駒を行います'
                        : 'Tossing five pawns…'}
                  </Marks>
                </styled.p>
                <Wrap gap="2" align="center" justify="flex-end" mt="4">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation()
                      completeFurigoma()
                    }}
                  >
                    {furigomaFaces ? t('newGame.start') : settings.lang === 'ja' ? 'スキップして対局開始' : 'Skip and start game'}
                  </Button>
                  {furigomaFaces && (
                    <span>{mode === 'view' ? t('watch.starting') : settings.lang === 'ja' ? 'どこかをクリックして対局開始' : 'Click anywhere to start'}</span>
                  )}
                </Wrap>
              </div>
            </div>
          )}
          {report && (
            <ReportDialog
              game={game}
              userSide={userSide}
              onShow={(ply) => session.setCursor(ply - 1)}
              onRoute={(route) => {
                enterMode(route)
                if (route === 'tesuji') tesuji.start('両取り')
              }}
              onClose={() => setReport(false)}
            />
          )}
          {showTrends && (
            <InsightsDialog
              onClose={() => setShowTrends(false)}
              onPractice={(items) => (saveMistakes(items), enterMode('drill', items))}
              onRoute={(route) => {
                const from = mode
                enterMode(route)
                store(ORIGIN_KEY, from)
                if (route === 'tesuji') tesuji.start('両取り')
              }}
              onLesson={(id) => {
                const from = mode
                enterMode('lesson')
                lesson.setPickerSetup(`lesson-${id}`)
                store(ORIGIN_KEY, from)
              }}
            />
          )}
          {showImport && <OpenGameDialog games={analyze} onClose={() => setShowImport(false)} />}
          {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
          {confirm && <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />}
          {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} level={levels.level} onLevel={levels.setLevel} />}
          {showViewer && <PieceViewer onClose={() => setShowViewer(false)} />}
          {cameraOpen && !cameraDocked && camera}
          {levels.welcome && (
            <WelcomeDialog
              level={levels.level}
              onPreviewLevel={levels.previewLevel}
              onLearnRules={welcomeDone(() => {
                load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null)
                lesson.setPickerSetup('lesson-rules-game')
              })}
              onLearnBasics={welcomeDone(() => firstLesson && lesson.open(firstLesson, 'study'))}
              onPlayAi={welcomeDone(() => {
                load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null)
                spar.setNewGameOpen(true, { opponent: levels.level === 'new' ? 'beginner' : 'club' })
              })}
              onTsume={welcomeDone(() => enterMode('tsume'))}
              onLookAround={welcomeDone()}
            />
          )}
        </Suspense>
      </AppShell>
    </SessionContext.Provider>
  )
}
