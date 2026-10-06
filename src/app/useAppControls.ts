import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { useCommands } from '@/app/dialogs/commands'
import { useShortcuts } from '@/app/hooks/useShortcuts'
import type { Load } from '@/app/hooks/useModeSwitch'
import type { useOpponent } from '@/app/hooks/useOpponent'
import type { useView } from '@/app/hooks/useView'
import { canAutoplay, studyMoveUsi, type Layout, type Lesson, type Session, type Spar, type Tsume, type Watch } from '@/app/appStatus'
import type { Mode } from '@/app/types'
import type { DialogState } from '@/app/useDialogState'
import type { useFurigoma } from '@/app/useFurigoma'

interface ControlDeps {
  session: Session
  view: ReturnType<typeof useView>
  layout: Layout
  lesson: Lesson
  tsume: Tsume
  watch: Watch
  spar: Spar
  opponent: ReturnType<typeof useOpponent>
  furigoma: ReturnType<typeof useFurigoma>
  dialogs: DialogState
  load: Load
  enterMode: (mode: Mode) => void
  commit: (usi: string) => void
}

/** Keyboard shortcuts, the command palette and the "start over" confirmation of the application shell. */
export function useAppControls({ session, view, layout, lesson, tsume, watch, spar, opponent, furigoma, dialogs, load, enterMode, commit }: ControlDeps) {
  const { t } = useTranslation()
  const { mode, course, userSide, game, sfen } = session
  const { watchSetup, pendingFurigoma, setPendingFurigoma } = furigoma
  const { palette, setPalette, showSettings, setShowSettings, confirm, setConfirm } = dialogs
  const newGame = () => load(InitialPositionSFEN.STANDARD, userSide, mode === 'lesson' ? 'analyze' : mode, null)
  const startOver = () => {
    if (game.moves.length === 0) return
    setConfirm({
      text: t('app.startOverFromTheBeginning'),
      run: () => load(course ? course.root.sfen : InitialPositionSFEN.STANDARD, userSide, mode, course),
    })
  }
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
    studyMove: studyMoveUsi(lesson),
    commit,
    autoplayAllowed: canAutoplay(session),
    togglePanel: layout.togglePanel,
    toggleEscape: tsume.toggleEscape,
    toggleWatch: watch.toggle,
  })
  return { commands, startOver }
}
