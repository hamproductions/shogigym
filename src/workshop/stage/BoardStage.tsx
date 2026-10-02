import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'tsshogi'
import type { Side } from '../../shogi'
import { avatarCues } from '../avatars'
import { Board2D } from '../Board2D'
import { Board3D, type StandZones } from '../Board3D'
import { useSession } from '../hooks/session'
import type { useBoardDecor } from '../hooks/useBoardDecor'
import type { useBoardInput } from '../hooks/useBoardInput'
import type { Announcement } from '../hooks/useAnnouncements'
import type { View } from '../hooks/useView'
import type { ShownMistake } from '../lib/mistake'
import { GameOverBanner } from '../modes/spar/GameOverBanner'
import type { Spar } from '../modes/spar/useSpar'
import { firstPieceHint } from '../modes/tsume/firstPiece'
import type { TsumeState } from '../modes/tsume/useTsume'
import { Plate } from '../panels/Plate'
import { loadPieceFont, useSettings } from '../settings'
import { loadPieceSet } from '../pieceSets'
import { isGameMode } from '../types'
import { AnnounceBadge, PromotionPicker, TsumePlate } from './BoardOverlays'
import { BoardBanners } from './BoardBanners'

type BoardStageProps = {
  view: View
  decor: ReturnType<typeof useBoardDecor>
  input: ReturnType<typeof useBoardInput>
  commit: (usi: string) => void
  mistake: ShownMistake | null
  onBack: () => void
  spar: Spar
  tsume: TsumeState | null
  hasDrillCard: boolean
  phoneTask: { text: string; action: string; run: () => void } | null
  announce: Announcement | null
  onZones: (zones: StandZones | null) => void
}

function usePieceAssetsKey() {
  const settings = useSettings()
  const [ready, setReady] = useState('mincho')
  useEffect(() => {
    let live = true
    Promise.all([loadPieceFont(settings.pieceFont), loadPieceSet(settings.pieceSet)])
      .catch(() => undefined)
      .then(() => live && setReady(`${settings.pieceFont}|${settings.pieceSet}`))
    return () => {
      live = false
    }
  }, [settings.pieceFont, settings.pieceSet])
  return ready
}

export function BoardStage({ view, decor, input, commit, mistake, onBack, spar, tsume, hasDrillCard, phoneTask, announce, onZones }: BoardStageProps) {
  const { t } = useTranslation()
  const settings = useSettings()
  const assetsKey = usePieceAssetsKey()
  const { mode, course, game, position, flipped, userSide, lastMove, selection, promotion, gameOver, sfen, atEnd, userTurn, toMove } = useSession()
  const picking = mode === 'lesson' && !course
  const playing = mode === 'spar' || (mode === 'lesson' && !!course)
  const sideColor = (side: Side) => (side === 'sente' ? Color.BLACK : Color.WHITE)
  const stamp = decor.stamp
  const cues = useMemo(
    () => avatarCues({ playing, aiTurn: atEnd && !userTurn && !gameOver && !spar.resigned, resigned: spar.resigned, userColor: sideColor(userSide), toMove: sideColor(toMove), fresh: game.moves.length === 0, gameKey: `${mode}|${game.start}|${course?.id ?? ''}`, lastMove, ply: game.moves.length, stamp }),
    [playing, atEnd, userTurn, gameOver, spar.resigned, userSide, toMove, game.moves.length, game.start, mode, course?.id, lastMove, stamp],
  )
  const board = { position, flipped, lastMove, selected: selection?.from ?? null, selectedColor: selection?.color, targets: input.targets, arrows: decor.arrows, heat: decor.heat, checkSquare: decor.checkSquare, onSquare: input.onSquare, onHand: input.onHand, onDrop: input.onDrop }
  const who = (side: Side) => (mode === 'analyze' || picking || (mode === 'drill' && !hasDrillCard) ? null : side === userSide ? t('workshop.you') : t('workshop.opponent'))
  const plate = (place: 'top' | 'bottom') => {
    const side: Side = (place === 'top') === flipped ? 'sente' : 'gote'
    return <Plate className={place} clock={spar.clockFace(side)} position={position} color={side === 'sente' ? Color.BLACK : Color.WHITE} who={who(side)} />
  }
  const sparEnded = mode === 'spar' && (spar.resigned || !!spar.flagged)
  const showGameOver = ((gameOver && game.moves.length > 0 && isGameMode(mode)) || sparEnded) && spar.endHidden !== sfen
  return (
    <div className="ws-board-wrap">
      {settings.environment === 'diagram' || settings.environment === 'broadcast' ? (
        <Board2D style={settings.environment} {...board} tilted={false} />
      ) : (
        <Board3D
          key={`${settings.pieceStyle}|${settings.boardStyle}|${settings.pieceFinish}|${settings.coords}|${settings.environment}|${assetsKey}`}
          {...board}
          tilted={view.tilted && !view.flatView}
          castles={decor.castles}
          snapKey={`${mode}|${game.start}|${course?.id ?? ''}|${tsume?.problem.id ?? ''}`}
          peek={decor.peekTargets}
          peekFrom={decor.peekFrom}
          stamp={decor.stamp}
          onZones={onZones}
          orbit={view.orbit && !view.flatView}
          sideRoom={0}
          cues={cues}
        />
      )}
      <BoardBanners mistake={mistake} onBack={onBack} />
      {mode === 'tsume' && <TsumePlate position="top" flipped={flipped} userSide={userSide} />}
      {mode === 'tsume' && <TsumePlate position="bottom" flipped={flipped} userSide={userSide} />}
      {mode !== 'tsume' && !picking && plate('top')}
      {phoneTask && (
        <button className="ws-phone-task" onClick={phoneTask.run}>
          <span>{phoneTask.text}</span>
          <b>{phoneTask.action} ›</b>
        </button>
      )}
      {mode !== 'tsume' && !picking && plate('bottom')}
      {showGameOver && <GameOverBanner spar={spar} flatView={view.flatView} />}
      {announce && <AnnounceBadge key={announce.key} announce={announce} />}
      {decor.note && (
        <div className="ws-peek" role="status">
          {decor.note}
        </div>
      )}
      {!decor.note && mode === 'tsume' && tsume && tsume.status === 'playing' && tsume.good === 0 && tsume.hint >= 1 && (
        <div className="ws-peek ws-phone-only" role="status">
          {t('workshop.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) })}
        </div>
      )}
      {promotion && <PromotionPicker options={promotion} onPick={commit} onCancel={input.cancelPromotion} />}
    </div>
  )
}
