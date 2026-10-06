import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import type { Session, Spar, Watch } from '@/app/appStatus'
import type { Load } from '@/app/hooks/useModeSwitch'
import { say, sayFurigomaResult } from '@/utils/voice'
import type { Game, Mode } from '@/app/types'
import type { Side } from '@/utils/shogi'

export type WatchOrder = 'random' | 'sente' | 'gote'

export const pawnCount = (faces: boolean[]) => faces.filter(Boolean).length

/** Three or more pawns face up means sente. */
export function tossSide(faces: boolean[]): Side {
  return pawnCount(faces) >= 3 ? 'sente' : 'gote'
}

/**
 * State for the watch-setup dialog and the pending furigoma (piece toss).
 * Whenever the (mode, game) pair changes it is reset the same way the original
 * effect did: a freshly opened empty watch game shows the setup dialog, and the
 * state of a previous empty watch game is cleared when leaving it.
 */
export function useFurigoma(mode: Mode, game: Game) {
  const [watchSetup, setWatchSetup] = useState(false)
  const [watchOrder, setWatchOrder] = useState<WatchOrder>('random')
  const [pendingFurigoma, setPendingFurigoma] = useState(false)
  const [furigomaFaces, setFurigomaFaces] = useState<boolean[] | null>(null)
  const [synced, setSynced] = useState<{ mode: Mode; game: Game; armed: boolean } | null>(null)
  const armed = mode === 'view' && game.moves.length === 0
  if (synced?.mode !== mode || synced.game !== game) {
    setSynced({ mode, game, armed })
    if (synced?.armed || armed) {
      setWatchSetup(armed)
      setPendingFurigoma(false)
    }
  }
  return { watchSetup, setWatchSetup, watchOrder, setWatchOrder, pendingFurigoma, setPendingFurigoma, furigomaFaces, setFurigomaFaces }
}

interface FurigomaActionDeps {
  furigoma: ReturnType<typeof useFurigoma>
  mode: Mode
  three: boolean
  session: Session
  spar: Spar
  watch: Watch
  load: Load
}

/** Handlers that start a game from the watch-setup dialog, the new-game dialog, or a finished toss. */
export function useFurigomaActions({ furigoma, mode, three, session, spar, watch, load }: FurigomaActionDeps) {
  const { t } = useTranslation()
  const { setWatchSetup, watchOrder, setPendingFurigoma, setFurigomaFaces } = furigoma
  const finishFurigoma = (side: Side) => {
    if (mode === 'view') watch.start(side)
    else {
      load(InitialPositionSFEN.STANDARD, side, 'spar', null)
      spar.setFurigomaBanner(t(side === 'sente' ? 'app.playSente' : 'app.playGote'))
    }
    setPendingFurigoma(false)
  }
  const startWatching = () => {
    setWatchSetup(false)
    if (watchOrder !== 'random') {
      watch.start(watchOrder)
      say('よろしくお願いします', true)
      return
    }
    setFurigomaFaces(null)
    setPendingFurigoma(true)
    if (three) say('振り駒を行います', true)
  }
  const startNewGame = (side: Side, isRandom?: boolean) => {
    spar.setNewGameOpen(false)
    spar.clearFurigomaBanner()
    session.setPlaying(false)
    if (!isRandom) {
      load(InitialPositionSFEN.STANDARD, side, 'spar', null)
      say('よろしくお願いします', true)
      return
    }
    setFurigomaFaces(null)
    if (three) load(InitialPositionSFEN.STANDARD, side, 'spar', null)
    setPendingFurigoma(true)
    if (three) say('あなたの振り歩先です', true)
  }
  const onToss = (faces: boolean[]) => {
    setFurigomaFaces(faces)
    sayFurigomaResult(pawnCount(faces), mode === 'view')
  }
  return { finishFurigoma, startWatching, startNewGame, onToss }
}
