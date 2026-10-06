import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@fontsource/shippori-mincho-b1/800.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import '@/styles/controls.css'
import './layout.css'
import '@/styles/panels.css'
import { useSettings } from '@/appearance/settings'
import { SessionContext } from '@/app/hooks/session'
import { useAnnouncements } from '@/app/hooks/useAnnouncements'
import { useAutoplay } from '@/app/hooks/useAutoplay'
import { useBoardDecor } from '@/app/hooks/useBoardDecor'
import { useBoardInput } from '@/app/hooks/useBoardInput'
import { useBoardSession } from '@/app/hooks/useBoardSession'
import { useEvaluation } from '@/app/hooks/useEvaluation'
import { useFlowLanes } from '@/app/hooks/useFlowLanes'
import { useLayout } from '@/app/hooks/useLayout'
import { useLevel } from '@/app/hooks/useLevel'
import { useMistake } from '@/app/hooks/useMistake'
import { useModeSlots, useModeSwitch } from '@/app/hooks/useModeSwitch'
import { useMoveReview } from '@/app/hooks/useMoveReview'
import { useOpponent } from '@/app/hooks/useOpponent'
import { usePersistedSession } from '@/app/hooks/usePersistedSession'
import { useRouteMode } from '@/app/hooks/useRouteMode'
import { useTransient } from '@/app/hooks/useTransient'
import { useView } from '@/app/hooks/useView'
import { bookForMove, bookMovesAt } from '@/utils/book'
import { SNAPSHOT_NAME } from '@/utils/events'
import { useAnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import { useDrill } from '@/app/modes/drill/useDrill'
import { useLesson } from '@/app/modes/lesson/useLesson'
import { useSpar } from '@/app/modes/spar/useSpar'
import { useWatch } from '@/app/modes/view/useWatch'
import { useTesuji } from '@/app/modes/tesuji/useTesuji'
import { useTsume } from '@/app/modes/tsume/useTsume'
import { SidePanels } from '@/app/panels/SidePanels'
import { Rail } from '@/app/rail/Rail'
import {
  canAutoplay,
  commitMove,
  describeInstruction,
  gameResult,
  hidesAnswer,
  isPicking,
  layoutNeedsPicking,
  modeTitle,
  phoneTaskFor,
  shellClassName,
} from './appStatus'
import { useFurigoma, useFurigomaActions } from './useFurigoma'
import { useShellEffects } from './useShellEffects'
import { AppDialogs } from './AppDialogs'
import { useAppControls } from './useAppControls'
import { useDialogState } from './useDialogState'
import { AppStage } from './AppStage'
import { useEvalBar } from './useEvalBar'
import { useThankYou } from './useThankYou'
import { useLatest } from '@/app/hooks/useLatest'
import type { Tab } from './types'

export function Application({ routeMode, routeMain }: { routeMode?: string; routeMain?: string }) {
  const { t } = useTranslation()
  const session = useBoardSession()
  const { mode, course, preview, sfen, nodes, prevSfen, lastMove, cursor, atEnd, userSide, game } = session
  const [tab, setTab] = useState<Tab>('coach')
  const dialogs = useDialogState()
  const { showSettings, setShowSettings, setPalette, setShowViewer, setConfirm } = dialogs
  const furigoma = useFurigoma(mode, game)
  const { watchSetup, setWatchSetup, pendingFurigoma } = furigoma
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
    needsPicking: layoutNeedsPicking(mode, course, drill),
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

  const commit = (usi: string) => commitMove({ mode, session, lesson, drill, tsume, tesuji }, usi)
  const handles = { lesson, drill, tesuji, tsume, spar, view: watch, analyze }
  const goBack = () => {
    session.exitPreview()
    tsume.resume()
  }
  const spoilerFree = hidesAnswer(handles)
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

  useShellEffects({ mode, cursor, previewOpen: preview !== null, lessonDone: lesson.done, furigoma, startWatch: watch.start, setShowViewer })
  if (layout.twoPanels && tab === 'moves') setTab('coach')

  const instruction = describeInstruction({ t, mode, handles, preview, mistake, compact: layout.compact, sfens: session.sfens })
  const title = modeTitle(mode, handles)
  const studyReply = lesson.waitingForReply ? opponent.reply : null
  const picking = mode === 'lesson' && !course
  const panelPicking = isPicking(mode, course, drill)
  const phoneTask = phoneTaskFor({ t, mode, layout, session, spar, coach, drill, instruction, studyReply, picking })
  const result = gameResult(mode, session, spar)
  const saveFinished = useLatest(analyze.saveFinished)
  useEffect(() => {
    if (result) saveFinished.current(result)
  }, [result, saveFinished])
  useThankYou({
    mode,
    restored,
    result,
    watchResult: watch.result,
    watchWon: !!watch.won,
    atEnd,
    hasMoves: game.moves.length > 0,
    gameOver: session.gameOver,
    busy: spar.newGameOpen || pendingFurigoma || watchSetup,
  })
  const { evalRate, evalBar } = useEvalBar({
    mode,
    enabled: session.ai && session.assist,
    inCourse: !!course,
    lessonMode: lesson.lessonMode,
    evaluation,
    hideUi: view.hideUi,
  })
  const { commands, startOver } = useAppControls({ session, view, layout, lesson, tsume, watch, spar, opponent, furigoma, dialogs, load, enterMode, commit })

  const settings = useSettings()
  const three = settings.environment === 'traditional' || settings.environment === 'casual'

  const { finishFurigoma, startWatching, startNewGame, onToss } = useFurigomaActions({ furigoma, mode, three, session, spar, watch, load })

  return (
    <SessionContext.Provider value={session}>
      <div
        className={shellClassName(view.hideUi, layout)}
        style={{ ['--panel-w' as string]: `${layout.panelWidth}px`, ['--sheet-h' as string]: layout.sheetH ?? undefined }}
      >
        <Rail
          mode={mode}
          onMode={enterMode}
          compact={layout.compact}
          view={view}
          settingsOpen={showSettings}
          onSettings={() => setShowSettings(true)}
          onPalette={() => setPalette(true)}
          snapshotName={`${SNAPSHOT_NAME}-${mode}-${cursor}`}
        />
        <AppStage
          session={session}
          view={view}
          layout={layout}
          spar={spar}
          watch={watch}
          tsume={tsume}
          tesuji={tesuji}
          lesson={lesson}
          drill={drill}
          title={title}
          instruction={instruction}
          evalRate={evalRate}
          evalBar={evalBar}
          decor={decor}
          input={input}
          commit={commit}
          mistake={mistake}
          onBack={goBack}
          phoneTask={phoneTask}
          announce={announce}
          tossing={pendingFurigoma && three}
          onToss={onToss}
          onWatchSetup={() => setWatchSetup(true)}
          onStartOver={startOver}
        />
        <SidePanels
          layout={layout}
          tab={tab}
          setTab={setTab}
          sheetOpen={layout.sheetOpen ?? panelPicking}
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
          canAutoplay={!!upcoming && canAutoplay(session)}
          picking={panelPicking}
        />
        <AppDialogs
          mode={mode}
          userSide={userSide}
          three={three}
          dialogs={dialogs}
          furigoma={furigoma}
          watch={watch}
          spar={spar}
          levels={levels}
          commands={commands}
          startWatching={startWatching}
          startNewGame={startNewGame}
          finishFurigoma={finishFurigoma}
          load={load}
          enterMode={enterMode}
          openLesson={lesson.open}
        />
      </div>
    </SessionContext.Provider>
  )
}
