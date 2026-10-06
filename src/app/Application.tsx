import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { LABELS } from '@/utils/analysis'
import '@fontsource/shippori-mincho-b1/800.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import '@/styles/controls.css'
import './layout.css'
import '@/styles/panels.css'
import { COURSES, SETUPS } from '@/utils/model'
import { useCommands } from '@/app/dialogs/commands'
import { useSettings } from '@/appearance/settings'
import { SessionContext } from '@/app/hooks/session'
import { useAnnouncements } from '@/app/hooks/useAnnouncements'
import { useAutoplay } from '@/app/hooks/useAutoplay'
import { useBoardDecor } from '@/app/hooks/useBoardDecor'
import { useBoardInput } from '@/app/hooks/useBoardInput'
import { useBoardSession } from '@/app/hooks/useBoardSession'
import { useEvaluation } from '@/app/hooks/useEvaluation'
import { useFlowLanes } from '@/app/hooks/useFlowLanes'
import { scrollPanelTop, useLayout } from '@/app/hooks/useLayout'
import { useLevel } from '@/app/hooks/useLevel'
import { useMistake } from '@/app/hooks/useMistake'
import { useModeSlots, useModeSwitch } from '@/app/hooks/useModeSwitch'
import { useMoveReview } from '@/app/hooks/useMoveReview'
import { useOpponent } from '@/app/hooks/useOpponent'
import { usePersistedSession } from '@/app/hooks/usePersistedSession'
import { useRouteMode } from '@/app/hooks/useRouteMode'
import { useShortcuts } from '@/app/hooks/useShortcuts'
import { useTransient } from '@/app/hooks/useTransient'
import { useView } from '@/app/hooks/useView'
import { Icon } from './icons'
import { bookForMove, bookMovesAt } from '@/utils/book'
import { SNAPSHOT_NAME, VIEWER_EVENT } from '@/utils/events'
import { mistakeIsBad } from '@/utils/mistake'
import { moveText } from '@/utils/shogi'
import { useAnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import { useDrill } from '@/app/modes/drill/useDrill'
import { useLesson } from '@/app/modes/lesson/useLesson'
import { useSpar } from '@/app/modes/spar/useSpar'
import { useWatch } from '@/app/modes/view/useWatch'
import { useTesuji } from '@/app/modes/tesuji/useTesuji'
import { useTsume } from '@/app/modes/tsume/useTsume'
import { SidePanels } from '@/app/panels/SidePanels'
import { useSteadyRate } from '@/app/hooks/useSteadyRate'
import { say, sayFurigomaResult } from '@/utils/voice'
import { Rail } from '@/app/rail/Rail'
import { BoardStage } from '@/app/stage/BoardStage'
import { ModeBar, WatchOptions } from '@/app/stage/ModeBar'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'
import { SegmentedField } from '@/app/ui/Segmented'
import { isGameMode, type Confirm, type Tab } from './types'

const ConfirmDialog = lazy(() => import('@/app/dialogs/ConfirmDialog').then((m) => ({ default: m.ConfirmDialog })))
const NewGameDialog = lazy(() => import('@/app/dialogs/NewGameDialog').then((m) => ({ default: m.NewGameDialog })))
const Palette = lazy(() => import('@/app/dialogs/Palette').then((m) => ({ default: m.Palette })))
const SettingsDialog = lazy(() => import('@/app/dialogs/SettingsDialog').then((m) => ({ default: m.SettingsDialog })))
const WelcomeDialog = lazy(() => import('@/app/dialogs/WelcomeDialog').then((m) => ({ default: m.WelcomeDialog })))
const PieceViewer = lazy(() => import('@/features/piece-viewer/PieceViewer').then((m) => ({ default: m.PieceViewer })))
const Furigoma = lazy(() => import('@/app/stage/Furigoma').then((m) => ({ default: m.Furigoma })))

export function Application({ routeMode, routeMain }: { routeMode?: string; routeMain?: string }) {
  const { t } = useTranslation()
  const session = useBoardSession()
  const { mode, course, preview, sfen, nodes, prevSfen, lastMove, cursor, atEnd, playing, userSide, game } = session
  const [tab, setTab] = useState<Tab>('coach')
  const [palette, setPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [watchSetup, setWatchSetup] = useState(false)
  const [watchOrder, setWatchOrder] = useState<'random' | 'sente' | 'gote'>('random')
  const [pendingFurigoma, setPendingFurigoma] = useState(false)
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
    orbit: view.orbit && !view.flatView,
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
  })
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
    onOpenAnalyze: () => (layout.setDrawer(true), layout.setSheetOpen(true)),
  })
  const opponent = useOpponent(session, { lessonMode: lesson.lessonMode, halted: spar.halted })
  const { enterMode, resume } = useModeSwitch(slots, { session, lesson, drill, tsume, tesuji, spar, analyze, mistakes, layout, setTab })
  const restored = usePersistedSession({ session, lesson, tsume, drill, spar, slots, resume })
  useRouteMode(mode, enterMode, routeMode, routeMain, restored)
  const { announce, tesujiNote } = useAnnouncements(session)
  const flow = useFlowLanes(session, evaluation.analysis)
  const upcoming = useAutoplay(session, evaluation.best?.move)
  const bookHere = useMemo(() => bookMovesAt(sfen, nodes), [sfen, nodes])
  const bookLast = useMemo(() => bookForMove(prevSfen, lastMove, nodes, course), [prevSfen, lastMove, nodes, course])
  const { mistake } = mistakes

  const commit = (usi: string) => {
    if (mode === 'view') return
    session.setPromotion(null)
    session.setPeekFrom(null)
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
  const decor = useBoardDecor(session, {
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
  const input = useBoardInput(session, { mistakes, commit, lessonMode: lesson.lessonMode, halted: spar.halted, setNudge })

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
      watch.start(furigomaFaces.filter(Boolean).length >= 3 ? 'sente' : 'gote')
      setPendingFurigoma(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [mode, pendingFurigoma, furigomaFaces, watch.start])

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
  }, [mode, cursor, previewOpen, lessonDone])
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
  const phoneTask =
    layout.compact && !layout.drawer && !isGameMode(mode) && mode !== 'view'
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
  const finished = mode === 'spar' && (session.gameOver || spar.resigned || !!spar.flagged)
  const result = !finished
    ? null
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
    if (!result) return
    analyze.saveFinished(result)
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps
  const speechState = useRef({ mode, finished: !!result || !!watch.result, restored })
  useEffect(() => {
    const previous = speechState.current
    speechState.current = { mode, finished: !!result || !!watch.result, restored }
    if (!previous.restored || previous.mode !== mode || previous.finished) return
    if (!(result === 'win' || (mode === 'view' && watch.won)) || !atEnd || !game.moves.length || spar.newGameOpen || pendingFurigoma || watchSetup) return
    if (session.gameOver) return
    return say('ありがとうございました')
  }, [result, mode, watch.result, watch.won, restored, atEnd, game.moves.length, spar.newGameOpen, pendingFurigoma, watchSetup, session.gameOver])
  const evalOn = session.ai && session.assist && (isGameMode(mode) || mode === 'view' || (mode === 'lesson' && !!course && lesson.lessonMode === 'study'))
  const steadyRate = useSteadyRate(evalOn && evaluation.evalSente ? evaluation.senteRate : null)
  const evalRate = evalOn ? (steadyRate ?? 0.5) : null
  const evalBar = evalRate !== null && !view.hideUi
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

  useShortcuts({
    session,
    view,
    palette,
    togglePalette: () => setPalette((v) => !v),
    dialogOpen: watchSetup || showSettings || !!confirm || spar.newGameOpen || pendingFurigoma,
    closeDialogs: () => (setShowSettings(false), setConfirm(null), spar.setNewGameOpen(false), setPendingFurigoma(false)),
    overlayOpen: lesson.mapOpen && !!course,
    replyMove: opponent.reply?.usi,
    studyMove: lesson.asking && lesson.lessonMode === 'study' ? lesson.good[0]?.usi : undefined,
    commit,
    autoplayAllowed,
    togglePanel: layout.togglePanel,
    toggleEscape: tsume.toggleEscape,
    toggleWatch: watch.toggle,
  })

  const welcomeDone = (next?: () => void) => () => {
    levels.finishWelcome()
    next?.()
  }
  const settings = useSettings()
  const three = settings.environment === 'traditional' || settings.environment === 'casual'
  const mainStrategy = settings.mainStrategy
  const firstLesson = COURSES.find(
    (c) => c.id === (SETUPS.find((x) => x.basics && x.main === mainStrategy) ?? SETUPS.find((x) => x.main === mainStrategy) ?? SETUPS[0]).courseIds[0],
  )

  return (
    <SessionContext.Provider value={session}>
      <div
        className={`app-shell${view.hideUi ? ' fs' : ''}${layout.zoned ? ' zoned' : layout.panelHidden ? ' panel-hidden' : ''}${layout.compact && layout.drawer ? ' drawer-open' : ''}${layout.compact && layout.panelSide ? ' panel-side' : ''}${layout.sheetH ? ' sheet-set' : ''}`}
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
          snapshotName={`${SNAPSHOT_NAME}-${mode}-${cursor}`}
        />
        <section className={`app-stage${preview || !atEnd || (playing && mode !== 'view' && mode !== 'spar') ? ' previewing' : ''}`}>
          <button className="app-fs-exit" onClick={() => view.setHideUi(false)} aria-label={t('app.showUi')} title={`${t('app.showUi')} (Esc)`}>
            <Icon name="panel" size={18} />
            <span>{t('app.showUi')} (Esc)</span>
          </button>
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
            tsume={tsume}
            tesuji={tesuji}
            lesson={lesson}
            drill={drill}
          />
          <BoardStage
            furigoma={pendingFurigoma && three}
            onFurigoma={(faces) => {
              setFurigomaFaces(faces)
              const pawns = faces.filter(Boolean).length
              sayFurigomaResult(pawns, mode === 'view')
            }}
            evalRate={evalBar ? evalRate : null}
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
        </section>
        <SidePanels
          layout={layout}
          tab={tab}
          setTab={setTab}
          sheetOpen={layout.sheetOpen ?? (picking || (mode === 'drill' && !drill.item))}
          model={{
            analyzeMoves: slots.stashed('analyze')?.game.moves.length ?? 0,
            lesson,
            drill,
            tsume,
            tesuji,
            spar,
            watch,
            analyze,
            mistakes,
            evaluation,
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
          }}
          canAutoplay={!!upcoming && autoplayAllowed}
          picking={picking || (mode === 'drill' && !drill.item)}
        />
        <Suspense fallback={null}>
          {mode === 'view' && watchSetup && (
            <Dialog label={t('watch.title')} onBackdrop={() => setWatchSetup(false)}>
              <h2>{t('watch.title')}</h2>
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
              <div className="app-actions">
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
                    setFurigomaFaces(null)
                    setPendingFurigoma(true)
                    if (three) say('振り駒を行います', true)
                  }}
                >
                  {t('newGame.start')}
                </Button>
              </div>
            </Dialog>
          )}
          {spar.newGameOpen && (
            <NewGameDialog
              side={userSide}
              onClose={() => spar.setNewGameOpen(false)}
              onStart={(side, isRandom) => {
                spar.setNewGameOpen(false)
                spar.clearFurigomaBanner()
                session.setPlaying(false)
                if (isRandom) {
                  setFurigomaFaces(null)
                  if (three) load(InitialPositionSFEN.STANDARD, side, 'spar', null)
                  setPendingFurigoma(true)
                  if (three) say('あなたの振り歩先です', true)
                } else {
                  load(InitialPositionSFEN.STANDARD, side, 'spar', null)
                  say('よろしくお願いします', true)
                }
              }}
            />
          )}
          {pendingFurigoma && !three && (
            <Furigoma
              spectator={mode === 'view'}
              onCancel={() => setPendingFurigoma(false)}
              onDone={(side) => {
                if (mode === 'view') watch.start(side)
                else {
                  load(InitialPositionSFEN.STANDARD, side, 'spar', null)
                  spar.setFurigomaBanner(t(side === 'sente' ? 'app.playSente' : 'app.playGote'))
                }
                setPendingFurigoma(false)
              }}
            />
          )}
          {pendingFurigoma && three && (
            <div
              onClick={() => {
                if (!furigomaFaces) return
                const side = furigomaFaces.filter(Boolean).length >= 3 ? 'sente' : 'gote'
                if (mode === 'view') watch.start(side)
                else {
                  load(InitialPositionSFEN.STANDARD, side, 'spar', null)
                  spar.setFurigomaBanner(t(side === 'sente' ? 'app.playSente' : 'app.playGote'))
                }
                setPendingFurigoma(false)
              }}
              style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'auto', cursor: furigomaFaces ? 'pointer' : 'default' }}
            >
              <div className="app-dialog" style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
                <p role="status">
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
                </p>
                <div className="app-actions">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation()
                      setPendingFurigoma(false)
                    }}
                  >
                    {t('app.cancel')}
                  </Button>
                  {furigomaFaces && (
                    <span>{mode === 'view' ? t('watch.starting') : settings.lang === 'ja' ? 'どこかをクリックして対局開始' : 'Click anywhere to start'}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
          {confirm && <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />}
          {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} level={levels.level} onLevel={levels.setLevel} />}
          {showViewer && <PieceViewer onClose={() => setShowViewer(false)} />}
          {levels.welcome && (
            <WelcomeDialog
              level={levels.level}
              onPreviewLevel={levels.previewLevel}
              onLearnBasics={welcomeDone(() => firstLesson && lesson.open(firstLesson, 'study'))}
              onPlayAi={welcomeDone(() => load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null))}
              onTsume={welcomeDone(() => enterMode('tsume'))}
              onLookAround={welcomeDone()}
            />
          )}
        </Suspense>
      </div>
    </SessionContext.Provider>
  )
}
