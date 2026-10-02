import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import '@fontsource/shippori-mincho-b1/800.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import '../styles/controls.css'
import '../styles/layout.css'
import '../styles/stage.css'
import '../styles/panels.css'
import '../styles/dialogs.css'
import { COURSES, SETUPS } from '../model'
import { useCommands } from './dialogs/commands'
import { ConfirmDialog } from './dialogs/ConfirmDialog'
import { NewGameDialog } from './dialogs/NewGameDialog'
import { Palette } from './dialogs/Palette'
import { SettingsDialog } from './dialogs/SettingsDialog'
import { WelcomeDialog } from './dialogs/WelcomeDialog'
import { useSettings } from './settings'
import { SessionContext } from './hooks/session'
import { useAnnouncements } from './hooks/useAnnouncements'
import { useAutoplay } from './hooks/useAutoplay'
import { useBoardDecor } from './hooks/useBoardDecor'
import { useBoardInput } from './hooks/useBoardInput'
import { useBoardSession } from './hooks/useBoardSession'
import { useEvaluation } from './hooks/useEvaluation'
import { useFlowLanes } from './hooks/useFlowLanes'
import { scrollPanelTop, useLayout } from './hooks/useLayout'
import { useLevel } from './hooks/useLevel'
import { useMistake } from './hooks/useMistake'
import { useModeSlots, useModeSwitch } from './hooks/useModeSwitch'
import { useMoveReview } from './hooks/useMoveReview'
import { useOpponent } from './hooks/useOpponent'
import { usePersistedSession } from './hooks/usePersistedSession'
import { useRouteMode } from './hooks/useRouteMode'
import { useShortcuts } from './hooks/useShortcuts'
import { useTransient } from './hooks/useTransient'
import { useView } from './hooks/useView'
import { Icon } from './icons'
import { bookForMove, bookMovesAt } from './lib/book'
import { SNAPSHOT_NAME, VIEWER_EVENT } from './lib/events'
import { mistakeIsBad } from './lib/mistake'
import { moveText } from '../shogi'
import { useAnalyzeGames } from './modes/analyze/useAnalyzeGames'
import { useDrill } from './modes/drill/useDrill'
import { useLesson } from './modes/lesson/useLesson'
import { useSpar } from './modes/spar/useSpar'
import { useTesuji } from './modes/tesuji/useTesuji'
import { useTsume } from './modes/tsume/useTsume'
import { SidePanels } from './panels/SidePanels'
import { PieceViewer } from './PieceViewer'
import { Rail } from './rail/Rail'
import { BoardStage } from './stage/BoardStage'
import { ModeBar } from './stage/ModeBar'
import { isGameMode, type Confirm, type Tab } from './types'

export function Workshop({ routeMode, routeMain }: { routeMode?: string; routeMain?: string }) {
  const { t } = useTranslation()
  const session = useBoardSession()
  const { mode, course, preview, sfen, nodes, prevSfen, lastMove, cursor, atEnd, playing, userSide, game } = session
  const [tab, setTab] = useState<Tab>('coach')
  const [palette, setPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [nudge, setNudge] = useTransient<string>(2200)
  const levels = useLevel()
  const view = useView()
  const slots = useModeSlots()
  const { load } = slots
  const mistakes = useMistake(session, setTab)
  const coach = useMoveReview(session)
  const evaluation = useEvaluation(session)
  const drill = useDrill(session, { mistakes, setTab })
  const layout = useLayout({ mode, needsPicking: (mode === 'lesson' && !course) || (mode === 'drill' && !drill.drill?.items.length), welcome: levels.welcome })
  const lesson = useLesson(session, { mistakes, load, setTab, closeSheet: () => layout.setSheetOpen(false), compact: layout.compact })
  const tsume = useTsume(session, { mistakes, load, setTab })
  const tesuji = useTesuji(session, { load, setTab })
  const analyze = useAnalyzeGames(session, { load, setTab, setConfirm })
  const spar = useSpar(session, { load, setTab, coach, mistakes, setNudge, setConfirm, forgetReply: () => opponent.forget(), openInAnalyze: analyze.openReview, analyzeMoves: () => slots.stashed('analyze')?.game.moves.length ?? 0 })
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
  const decor = useBoardDecor(session, { analysis: evaluation.analysis, showBest: evaluation.showBest, tab, spoilerFree, modeArrows: [...tesuji.arrows, ...drill.arrows, ...lesson.arrows, ...tsume.arrows], review: coach.review, reviewAt: coach.reviewAt, reply: opponent.reply, upcoming, hoverLane: flow.hoverLane, showControl: view.showControl, showEscape: tsume.showEscape, level: levels.level, nudge, checking: lesson.checking, tesujiNote, bookLast })
  const input = useBoardInput(session, { mistakes, commit, lessonMode: lesson.lessonMode, halted: spar.halted, setNudge })

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
    if (lesson.checking) return t('workshop.checkingThatMove')
    if (preview && mistake) return mistakeIsBad(mistake) ? t('workshop.watchHowItGetsPunished') : t('workshop.watchWhatFollowsThenGo')
    if (mistake) return mistakeIsBad(mistake) ? t('workshop.wasAMistakeTryAgain', { move: moveText(session.sfens[mistake.base], mistake.usi) }) : t('workshop.isAFineMoveBut', { move: moveText(session.sfens[mistake.base], mistake.usi) })
    if (preview) return t('workshop.previewWatchItPlayOut')
    return { lesson, drill, tesuji, tsume, spar, analyze }[mode].instruction()
  })()
  const title = mode === 'lesson' ? lesson.title : mode === 'tsume' ? (tsume.title ?? analyze.title) : { drill, tesuji, spar, analyze }[mode].title
  const studyReply = lesson.waitingForReply ? opponent.reply : null
  const picking = mode === 'lesson' && !course
  const phoneTask = layout.compact && !layout.drawer ? { text: instruction, action: studyReply ? t('workshop.playTheirMove') : picking ? t('workshop.pickALesson') : mode === 'drill' && !drill.item ? t('workshop.pickAQueue') : t('workshop.panel'), run: () => (studyReply ? session.play(studyReply.usi) : layout.setDrawer(true)) } : null
  const autoplayAllowed = isGameMode(mode) || !!preview
  const evalRate = session.ai && session.assist && evaluation.evalSente && (isGameMode(mode) || (mode === 'lesson' && !!course && lesson.lessonMode === 'study')) ? evaluation.senteRate : null
  const newGame = () => load(InitialPositionSFEN.STANDARD, userSide, mode === 'lesson' ? 'analyze' : mode, null)
  const startOver = () => (game.moves.length > 0 ? setConfirm({ text: t('workshop.startOverFromTheBeginning'), run: () => load(course ? course.root.sfen : InitialPositionSFEN.STANDARD, userSide, mode, course) }) : undefined)
  const commands = useCommands({ sfen, setMode: enterMode, flip: () => session.setFlipped((v) => !v), tilt: () => view.setTilted((v) => !v), openCourse: lesson.open, play: session.play, newGame })

  useShortcuts({
    session,
    view,
    palette,
    togglePalette: () => setPalette((v) => !v),
    dialogOpen: showSettings || !!confirm || spar.newGameOpen,
    closeDialogs: () => (setShowSettings(false), setConfirm(null), spar.setNewGameOpen(false)),
    overlayOpen: lesson.mapOpen && !!course,
    replyMove: opponent.reply?.usi,
    studyMove: lesson.asking && lesson.lessonMode === 'study' ? lesson.good[0]?.usi : undefined,
    commit,
    autoplayAllowed,
    togglePanel: layout.togglePanel,
    toggleEscape: tsume.toggleEscape,
  })

  const welcomeDone = (next?: () => void) => () => {
    levels.finishWelcome()
    next?.()
  }
  const mainStrategy = useSettings().mainStrategy
  const firstLesson = COURSES.find((c) => c.id === (SETUPS.find((x) => x.basics && x.main === mainStrategy) ?? SETUPS.find((x) => x.main === mainStrategy) ?? SETUPS[0]).courseIds[0])

  return (
    <SessionContext.Provider value={session}>
      <div className={`ws${view.hideUi ? ' fs' : ''}${layout.zoned ? ' zoned' : layout.panelHidden ? ' panel-hidden' : ''}${layout.compact && layout.drawer ? ' drawer-open' : ''}${layout.sheetH ? ' sheet-set' : ''}`} style={{ ['--panel-w' as string]: `${layout.panelWidth}px`, ['--sheet-h' as string]: layout.sheetH ?? undefined }}>
        <Rail mode={mode} onMode={enterMode} compact={layout.compact} view={view} onFlip={() => session.setFlipped((v) => !v)} settingsOpen={showSettings} onSettings={() => setShowSettings(true)} onPalette={() => setPalette(true)} snapshotName={`${SNAPSHOT_NAME}-${mode}-${cursor}`} />
        <section className={`ws-stage${preview || playing || !atEnd ? ' previewing' : ''}`}>
          <button className="ws-fs-exit" onClick={() => view.setHideUi(false)} aria-label={t('workshop.showUi')} title={`${t('workshop.showUi')} (Esc)`}>
            <Icon name="exitFullscreen" size={18} />
            <span>{t('workshop.showUi')} (Esc)</span>
          </button>
          <ModeBar title={title} instruction={instruction} lessonMode={lesson.lessonMode} sheetUp={layout.compact && layout.drawer} panelHidden={layout.panelHidden} onPanel={(hidden) => layout.setPanel({ hidden })} spar={spar} evalRate={evalRate} />
          <BoardStage view={view} decor={decor} input={input} commit={commit} mistake={mistake} onBack={goBack} spar={spar} tsume={tsume.tsume} hasDrillCard={!!drill.item} phoneTask={phoneTask} announce={announce} onZones={layout.setZones} />
        </section>
        <SidePanels
          layout={layout}
          tab={tab}
          setTab={setTab}
          sheetOpen={layout.sheetOpen ?? (picking || (mode === 'drill' && !drill.item))}
          model={{ lesson, drill, tsume, tesuji, spar, analyze, mistakes, evaluation, coach, level: levels.level, reply: opponent.reply, spoilerFree, bookHere, bookLast, lanes: flow.lanes, lanesSfen: flow.lanesSfen, onHoverLane: flow.setHoverLane, onBack: goBack, setConfirm }}
          canAutoplay={!!upcoming && autoplayAllowed}
          onStartOver={startOver}
        />
        {spar.newGameOpen && (
          <NewGameDialog
            side={userSide}
            onClose={() => spar.setNewGameOpen(false)}
            onStart={(side) => {
              spar.setNewGameOpen(false)
              load(InitialPositionSFEN.STANDARD, side, 'spar', null)
            }}
          />
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
      </div>
    </SessionContext.Provider>
  )
}
