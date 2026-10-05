import './board-stage.css'
import './board-layout.css'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvalBar } from './EvalBar'
import { Color } from 'tsshogi'
import type { Side } from '@/utils/shogi'
import { avatarCues } from '@/rendering/avatars'
import { useSession } from '@/app/hooks/session'
import type { useBoardDecor } from '@/app/hooks/useBoardDecor'
import type { useBoardInput } from '@/app/hooks/useBoardInput'
import type { Announcement } from '@/app/hooks/useAnnouncements'
import type { View } from '@/app/hooks/useView'
import type { ShownMistake } from '@/utils/mistake'
import { GameOverBanner } from '@/app/modes/spar/GameOverBanner'
import type { Spar } from '@/app/modes/spar/useSpar'
import type { Watch } from '@/app/modes/view/useWatch'
import { firstPieceHint } from '@/app/modes/tsume/firstPiece'
import type { TsumeState } from '@/app/modes/tsume/useTsume'
import { Plate } from '@/app/panels/Plate'
import { loadPieceFont, useSettings } from '@/appearance/settings'
import { loadBoardStyle } from '@/appearance/boardStyles'
import { loadPieceSet } from '@/appearance/pieceSets'
import { isGameMode } from '@/app/types'
import { AnnounceBadge, PromotionPicker, TsumePlate } from './BoardOverlays'
import { BoardBanners } from './BoardBanners'
import { BoardLoading } from '@/rendering/BoardLoading'
import { Button } from '@/app/ui/Button'

import type { StandZones } from '@/rendering/board3d/types'

const Board2D = lazy(() => import('@/rendering/Board2D').then((m) => ({ default: m.Board2D })))
const BoardFlat = lazy(() => import('@/rendering/BoardFlat').then((m) => ({ default: m.BoardFlat })))
const Board3D = lazy(() => import('@/rendering/Board3D').then((m) => ({ default: m.Board3D })))

type BoardStageProps = {
  furigoma?: boolean
  onFurigoma?: (faces: boolean[]) => void
  evalRate: number | null
  view: View
  decor: ReturnType<typeof useBoardDecor>
  input: ReturnType<typeof useBoardInput>
  commit: (usi: string) => void
  mistake: ShownMistake | null
  onBack: () => void
  spar: Spar
  watch: Watch
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
    setReady('')
    Promise.all([loadPieceFont(settings.pieceFont), loadPieceSet(settings.pieceSet, settings.pieceGuide), loadBoardStyle(settings.boardStyle)])
      .catch((error: unknown) => {
        if (live) setReady(`error:${error instanceof Error ? error.message : String(error)}`)
        throw error
      })
      .then(
        () => live && setReady(`${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.boardStyle}`),
        () => undefined,
      )
    return () => {
      live = false
    }
  }, [settings.pieceFont, settings.pieceSet, settings.pieceGuide, settings.boardStyle])
  return ready
}

export function BoardStage({
  view,
  decor,
  input,
  commit,
  mistake,
  onBack,
  spar,
  watch,
  tsume,
  hasDrillCard,
  phoneTask,
  announce,
  onZones,
  evalRate,
  furigoma,
  onFurigoma,
}: BoardStageProps) {
  const { t } = useTranslation()
  const settings = useSettings()
  const assetsKey = usePieceAssetsKey()
  const { mode, course, game, position, flipped, userSide, lastMove, selection, promotion, gameOver, sfen, atEnd, userTurn, toMove } = useSession()
  const picking = mode === 'lesson' && !course
  const playing = mode === 'spar' || mode === 'view' || (mode === 'lesson' && !!course)
  const sideColor = (side: Side) => (side === 'sente' ? Color.BLACK : Color.WHITE)
  const stamp = decor.stamp
  const [dismissedNote, setDismissedNote] = useState<string | null>(null)
  useEffect(() => {
    setDismissedNote(null)
    if (!decor.note) return
    const timer = window.setTimeout(() => setDismissedNote(decor.note), 2000)
    return () => window.clearTimeout(timer)
  }, [decor.note, sfen])
  const cues = useMemo(
    () =>
      avatarCues({
        playing,
        aiTurn: atEnd && !userTurn && !gameOver && !spar.resigned,
        resigned: spar.resigned,
        userColor: sideColor(userSide),
        toMove: sideColor(toMove),
        fresh: game.moves.length === 0,
        gameKey: `${mode}|${game.start}|${course?.id ?? ''}`,
        lastMove,
        ply: game.moves.length,
        stamp,
      }),
    [playing, atEnd, userTurn, gameOver, spar.resigned, userSide, toMove, game.moves.length, game.start, mode, course?.id, lastMove, stamp],
  )
  const board = {
    position,
    flipped,
    lastMove,
    selected: selection?.from ?? null,
    selectedColor: selection?.color,
    targets: input.targets,
    arrows: decor.arrows,
    heat: decor.heat,
    castles: decor.castles,
    peek: decor.peekTargets,
    peekFrom: decor.peekFrom,
    stamp: decor.stamp,
    checkSquare: decor.checkSquare,
    onSquare: input.onSquare,
    onHand: input.onHand,
    onDrop: input.onDrop,
    movable: userTurn && !gameOver ? position.color : null,
  }
  const who = (side: Side) =>
    mode === 'view'
      ? watch.bot(side)
      : mode === 'analyze' || picking || (mode === 'drill' && !hasDrillCard)
        ? null
        : side === userSide
          ? t('app.you')
          : t('app.opponent')
  const plate = (place: 'top' | 'bottom') => {
    const side: Side = (place === 'top') === flipped ? 'sente' : 'gote'
    return <Plate className={place} clock={spar.clockFace(side)} position={position} color={side === 'sente' ? Color.BLACK : Color.WHITE} who={who(side)} />
  }
  const sparEnded = mode === 'spar' && (spar.resigned || !!spar.flagged)
  const showGameOver = ((gameOver && game.moves.length > 0 && isGameMode(mode)) || sparEnded) && spar.endHidden !== sfen
  return (
    <div className={`app-board-wrap${evalRate !== null ? ' with-eval' : ''}`}>
      {mode === 'spar' && spar.furigomaBanner && (
        <div
          className="app-furigoma-banner"
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(20,20,25,0.92)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.2))',
            padding: '8px 18px',
            borderRadius: 8,
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          <span>{spar.furigomaBanner}</span>
          <Button size="sm" onClick={() => spar.clearFurigomaBanner()}>
            ✕
          </Button>
        </div>
      )}
      <div className="app-board-scene">
        {evalRate !== null && <EvalBar rate={evalRate} flipped={flipped} />}
        <Suspense fallback={<BoardLoading />}>
          {settings.environment !== 'diagram' &&
          settings.environment !== 'broadcast' &&
          settings.environment !== 'flat' &&
          assetsKey !== `${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.boardStyle}` ? (
            <BoardLoading error={assetsKey.startsWith('error:') ? assetsKey.slice(6) : undefined} />
          ) : settings.environment === 'diagram' || settings.environment === 'broadcast' ? (
            <Board2D style={settings.environment} {...board} tilted={false} />
          ) : settings.environment === 'flat' ? (
            <BoardFlat {...board} tilted={false} onZones={onZones} />
          ) : (
            <Board3D
              key={`${settings.pieceStyle}|${settings.boardStyle}|${settings.pieceFinish}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.coords}|${settings.environment}|${assetsKey}`}
              {...board}
              furigoma={furigoma}
              onFurigoma={onFurigoma}
              tilted={view.tilted && !view.flatView}
              snapKey={`${mode}|${game.start}|${course?.id ?? ''}|${tsume?.problem.id ?? ''}`}
              onZones={onZones}
              orbit={view.orbit && !view.flatView}
              sideRoom={0}
              cues={cues}
            />
          )}
        </Suspense>
        {mode !== 'tsume' && !picking && plate('top')}
        {mode !== 'tsume' && !picking && plate('bottom')}
        {decor.note && dismissedNote !== decor.note && (
          <div className="app-peek" role="status">
            {decor.note}
          </div>
        )}
      </div>
      <BoardBanners mistake={mistake} onBack={onBack} />
      {mode === 'tsume' && <TsumePlate position="top" flipped={flipped} userSide={userSide} />}
      {mode === 'tsume' && <TsumePlate position="bottom" flipped={flipped} userSide={userSide} />}
      {phoneTask && (
        <button className="app-phone-task" onClick={phoneTask.run}>
          <span>{phoneTask.text}</span>
          <b>{phoneTask.action} ›</b>
        </button>
      )}
      {showGameOver && <GameOverBanner spar={spar} flatView={view.flatView} />}
      {announce && <AnnounceBadge key={announce.key} announce={announce} />}
      {!decor.note && mode === 'tsume' && tsume && tsume.status === 'playing' && tsume.good === 0 && tsume.hint >= 1 && (
        <div className="app-peek app-phone-only" role="status">
          {t('app.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) })}
        </div>
      )}
      {promotion && <PromotionPicker options={promotion} onPick={commit} onCancel={input.cancelPromotion} />}
    </div>
  )
}
