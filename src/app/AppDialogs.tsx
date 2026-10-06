import { Suspense, lazy } from 'react'
import { InitialPositionSFEN } from 'tsshogi'
import { useSettings } from '@/appearance/settings'
import type { Command } from '@/app/dialogs/commands'
import type { useLevel } from '@/app/hooks/useLevel'
import type { Load } from '@/app/hooks/useModeSwitch'
import type { useLesson } from '@/app/modes/lesson/useLesson'
import type { useSpar } from '@/app/modes/spar/useSpar'
import type { useWatch } from '@/app/modes/view/useWatch'
import type { Mode } from '@/app/types'
import type { DialogState } from '@/app/useDialogState'
import type { useFurigoma } from '@/app/useFurigoma'
import { COURSES, SETUPS } from '@/utils/model'
import type { Side } from '@/utils/shogi'

const ConfirmDialog = lazy(() => import('@/app/dialogs/ConfirmDialog').then((m) => ({ default: m.ConfirmDialog })))
const NewGameDialog = lazy(() => import('@/app/dialogs/NewGameDialog').then((m) => ({ default: m.NewGameDialog })))
const Palette = lazy(() => import('@/app/dialogs/Palette').then((m) => ({ default: m.Palette })))
const SettingsDialog = lazy(() => import('@/app/dialogs/SettingsDialog').then((m) => ({ default: m.SettingsDialog })))
const WelcomeDialog = lazy(() => import('@/app/dialogs/WelcomeDialog').then((m) => ({ default: m.WelcomeDialog })))
const FurigomaToss = lazy(() => import('@/app/dialogs/FurigomaToss').then((m) => ({ default: m.FurigomaToss })))
const WatchSetupDialog = lazy(() => import('@/app/dialogs/WatchSetupDialog').then((m) => ({ default: m.WatchSetupDialog })))
const PieceViewer = lazy(() => import('@/features/piece-viewer/PieceViewer').then((m) => ({ default: m.PieceViewer })))
const Furigoma = lazy(() => import('@/app/stage/Furigoma').then((m) => ({ default: m.Furigoma })))

interface AppDialogsProps {
  mode: Mode
  userSide: Side
  three: boolean
  dialogs: DialogState
  furigoma: ReturnType<typeof useFurigoma>
  watch: ReturnType<typeof useWatch>
  spar: ReturnType<typeof useSpar>
  levels: ReturnType<typeof useLevel>
  commands: (query: string) => Command[]
  startWatching: () => void
  startNewGame: (side: Side, isRandom?: boolean) => void
  finishFurigoma: (side: Side) => void
  load: Load
  enterMode: (mode: Mode) => void
  openLesson: ReturnType<typeof useLesson>['open']
}

function firstLessonFor(mainStrategy: string) {
  const setup = SETUPS.find((x) => x.basics && x.main === mainStrategy) ?? SETUPS.find((x) => x.main === mainStrategy) ?? SETUPS[0]
  return COURSES.find((c) => c.id === setup.courseIds[0])
}

export function AppDialogs({
  mode,
  userSide,
  three,
  dialogs,
  furigoma,
  watch,
  spar,
  levels,
  commands,
  startWatching,
  startNewGame,
  finishFurigoma,
  load,
  enterMode,
  openLesson,
}: AppDialogsProps) {
  const { lang, mainStrategy } = useSettings()
  const { watchSetup, setWatchSetup, watchOrder, setWatchOrder, pendingFurigoma, setPendingFurigoma, furigomaFaces } = furigoma
  const { palette, setPalette, showSettings, setShowSettings, showViewer, setShowViewer, confirm, setConfirm } = dialogs
  const firstLesson = firstLessonFor(mainStrategy)
  const welcomeDone = (next?: () => void) => () => {
    levels.finishWelcome()
    next?.()
  }
  return (
    <Suspense fallback={null}>
      {mode === 'view' && watchSetup && (
        <WatchSetupDialog watch={watch} order={watchOrder} onOrder={setWatchOrder} onCancel={() => setWatchSetup(false)} onStart={startWatching} />
      )}
      {spar.newGameOpen && <NewGameDialog side={userSide} onClose={() => spar.setNewGameOpen(false)} onStart={startNewGame} />}
      {pendingFurigoma && !three && <Furigoma spectator={mode === 'view'} onCancel={() => setPendingFurigoma(false)} onDone={finishFurigoma} />}
      {pendingFurigoma && three && (
        <FurigomaToss faces={furigomaFaces} spectator={mode === 'view'} lang={lang} onStart={finishFurigoma} onCancel={() => setPendingFurigoma(false)} />
      )}
      {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
      {confirm && <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} level={levels.level} onLevel={levels.setLevel} />}
      {showViewer && <PieceViewer onClose={() => setShowViewer(false)} />}
      {levels.welcome && (
        <WelcomeDialog
          level={levels.level}
          onPreviewLevel={levels.previewLevel}
          onLearnBasics={welcomeDone(() => firstLesson && openLesson(firstLesson, 'study'))}
          onPlayAi={welcomeDone(() => load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null))}
          onTsume={welcomeDone(() => enterMode('tsume'))}
          onLookAround={welcomeDone()}
        />
      )}
    </Suspense>
  )
}
