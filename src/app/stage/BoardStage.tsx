import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvalBar, EvalSlot } from './EvalBar'
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
import { loadPieceFont, STRENGTH, useSettings } from '@/appearance/settings'
import { loadBoardStyle } from '@/appearance/boardStyles'
import { loadPieceSet } from '@/appearance/pieceSets'
import { isGameMode } from '@/app/types'
import { AnnounceBadge, PromotionPicker, TsumePlate } from './BoardOverlays'
import { BoardBanners } from './BoardBanners'
import { BoardLoading } from '@/rendering/BoardLoading'
import { SourceIllustration } from '@/app/modes/lesson/SourceIllustration'
import { Button } from '@/app/ui/Button'
import { usePromotionFaces } from '@/app/hooks/useBakedPieces'
import { styled } from 'styled-system/jsx'
import { BoardScene, BoardWrap, peek } from './stage.styles'

import type { StandZones } from '@/rendering/board3d/types'
import { Marks } from '@/app/ui/SideMark'

const Board2D = lazy(() => import('@/rendering/Board2D').then((m) => ({ default: m.Board2D })))
const BoardFlat = lazy(() => import('@/rendering/BoardFlat').then((m) => ({ default: m.BoardFlat })))
const Board3D = lazy(() => import('@/rendering/Board3D').then((m) => ({ default: m.Board3D })))

type BoardStageProps = {
  furigoma?: boolean
  onFurigoma?: (faces: boolean[]) => void
  onMoveLanded: (sfen: string) => void
  evalRate: number | null
  evalSlot?: boolean
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
  const [ready, setReady] = useState('')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let live = true
    let done = 0
    setProgress(0)
    const loaded = () => {
      if (live) setProgress(++done)
    }
    Promise.all([
      loadPieceFont(settings.pieceFont).then(loaded),
      loadPieceSet(settings.pieceSet, settings.pieceGuide).then(loaded),
      loadBoardStyle(settings.boardStyle).then(loaded),
      document.fonts.load('800 64px "Shippori Mincho B1"').then(loaded),
    ])
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
  return { key: ready, progress: { phase: 'assets' as const, done: progress, total: 4 } }
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
  evalSlot,
  furigoma,
  onFurigoma,
  onMoveLanded,
}: BoardStageProps) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { key: assetsKey, progress: assetProgress } = usePieceAssetsKey()
  const assetsReady = assetsKey === `${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.boardStyle}`
  const { mode, course, game, position, flipped, userSide, lastMove, selection, promotion, gameOver, sfen, atEnd, userTurn, toMove, sourceMarks, cursor } =
    useSession()
  const { faces: promotionFaces } = usePromotionFaces(!!promotion, assetsReady)
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
        aiTurn: atEnd && !userTurn && !gameOver && !spar.resigned && !spar.aiEnded,
        resigned: spar.resigned,
        userColor: sideColor(userSide),
        toMove: sideColor(toMove),
        fresh: game.moves.length === 0,
        gameKey: `${mode}|${game.start}|${course?.id ?? ''}`,
        lastMove,
        ply: game.moves.length,
        stamp,
      }),
    [playing, atEnd, userTurn, gameOver, spar.resigned, spar.aiEnded, userSide, toMove, game.moves.length, game.start, mode, course?.id, lastMove, stamp],
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
    premove: mode === 'spar' && !userTurn && !gameOver && !spar.halted ? sideColor(userSide) : null,
  }
  const who = (side: Side) =>
    mode === 'view'
      ? watch.bot(side)
      : mode === 'analyze' || picking || (mode === 'drill' && !hasDrillCard)
        ? null
        : side === userSide
          ? t('app.you')
          : mode === 'spar'
            ? t('plate.ai', { level: STRENGTH[spar.config.opponent].label })
            : t('app.opponent')
  const plate = (place: 'top' | 'bottom') => {
    const side: Side = (place === 'top') === flipped ? 'sente' : 'gote'
    return (
      <Plate
        className={place}
        placement={place === 'top' ? 'scene' : 'caption'}
        clock={spar.clockFace(side)}
        board={position}
        side={side === 'sente' ? Color.BLACK : Color.WHITE}
        who={who(side)}
        thinking={mode === 'spar' ? side !== userSide && spar.aiThinking : undefined}
      />
    )
  }
  const sparEnded = mode === 'spar' && (spar.resigned || !!spar.aiEnded || !!spar.flagged)
  const showGameOver = ((gameOver && game.moves.length > 0 && isGameMode(mode)) || sparEnded) && spar.endHidden !== sfen
  return (
    <BoardWrap className="app-board-wrap" data-eval={evalRate !== null || evalSlot || undefined}>
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
          <span>
            <Marks>{spar.furigomaBanner}</Marks>
          </span>
          <Button size="sm" onClick={() => spar.clearFurigomaBanner()}>
            ✕
          </Button>
        </div>
      )}
      <BoardScene className="app-board-scene">
        {evalRate !== null ? <EvalBar rate={evalRate} flipped={flipped} /> : evalSlot && <EvalSlot />}
        <Suspense fallback={<BoardLoading />}>
          {settings.environment !== 'diagram' &&
          settings.environment !== 'broadcast' &&
          settings.environment !== 'flat' &&
          (!assetsKey || assetsKey.startsWith('error:')) ? (
            <BoardLoading error={assetsKey.startsWith('error:') ? assetsKey.slice(6) : undefined} state={assetProgress} />
          ) : settings.environment === 'diagram' || settings.environment === 'broadcast' ? (
            <Board2D style={settings.environment} {...board} tilted={false} />
          ) : settings.environment === 'flat' ? (
            <BoardFlat {...board} tilted={false} onZones={onZones} />
          ) : (
            <Board3D
              key={`${settings.boardStyle}|${settings.coords}|${settings.environment}`}
              assetsReady={assetsReady}
              loadingState={assetProgress}
              appearanceKey={`${settings.pieceStyle}|${settings.pieceFinish}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${assetsKey}`}
              {...board}
              furigoma={furigoma}
              onFurigoma={onFurigoma}
              onMoveLanded={onMoveLanded}
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
        <styled.div
          className="app-board-caption"
          position="absolute"
          left="2"
          right="2"
          bottom="2"
          zIndex="hud"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="2"
          pointerEvents="none"
          _compact={{ '.app-board-wrap[data-eval] &': { left: '2' } }}
          css={{ '.app-board-wrap[data-eval] &': { left: 'calc(var(--eval-bar-width) + {spacing.2})' } }}
        >
          {decor.note && dismissedNote !== decor.note && (
            <div className={peek({ placement: 'caption' })} role="status">
              <Marks>{decor.note}</Marks>
            </div>
          )}
          {mode !== 'tsume' && !picking && plate('bottom')}
        </styled.div>
      </BoardScene>
      {mode === 'lesson' && sourceMarks?.illustration && sourceMarks.at === sfen.split(' ')[0] && (
        <styled.div
          position="absolute"
          inset="0"
          zIndex="20"
          display="grid"
          placeItems="center"
          p="4"
          pointerEvents="none"
          css={{ '@media (max-width: 640px)': { p: '2' } }}
        >
          <styled.div
            maxW="min(100%, 760px)"
            maxH="100%"
            overflow="auto"
            p="4"
            borderRadius="lg"
            bg="color-mix(in srgb, {colors.gofun} 96%, transparent)"
            color="koma.ink"
            boxShadow="lg"
            pointerEvents="auto"
            css={{ '@media (max-width: 640px)': { p: '3' } }}
          >
            <SourceIllustration diagram={sourceMarks.illustration} />
          </styled.div>
        </styled.div>
      )}
      <BoardBanners mistake={mistake} onBack={onBack} />
      {mode === 'tsume' && <TsumePlate place="top" flipped={flipped} userSide={userSide} />}
      {mode === 'tsume' && <TsumePlate place="bottom" flipped={flipped} userSide={userSide} />}
      {phoneTask && (
        <styled.button
          className="app-phone-task"
          display="none"
          css={{ '.app-shell[data-fs] &': { display: 'none' } }}
          _compact={{
            order: '4',
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5',
            h: 'calc(2em * {lineHeights.tight} + 2 * {spacing.2.5})',
            m: '{spacing.1.5} {spacing.2} {spacing.0.5}',
            p: '{spacing.2.5} {spacing.3}',
            borderRadius: 'lg',
            bg: 'overlay',
            color: 'fg.default',
            fontSize: 'sm',
            lineHeight: 'tight',
            textAlign: 'left',
            boxShadow: 'inset 0 0 0 1px {colors.border}',
          }}
          onClick={phoneTask.run}
        >
          <styled.span _compact={{ flex: '1', minW: '0', maxH: 'calc(2em * {lineHeights.tight})', overflowY: 'auto' }}>
            <Marks>{phoneTask.text}</Marks>
          </styled.span>
          <styled.b _compact={{ flex: 'none', p: '{spacing.1.5} {spacing.2.5}', borderRadius: 'md', bg: 'accent', color: 'accent.contrast', fontSize: 'xs' }}>
            {phoneTask.action} ›
          </styled.b>
        </styled.button>
      )}
      {showGameOver && <GameOverBanner spar={spar} flatView={view.flatView} />}
      {announce && !(mode === 'spar' && announce.at !== cursor) && <AnnounceBadge key={announce.key} announce={announce} />}
      {!decor.note && mode === 'tsume' && tsume && tsume.status === 'playing' && tsume.good === 0 && tsume.hint >= 1 && (
        <div className={peek({ placement: 'hint' })} role="status">
          {t('app.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) })}
        </div>
      )}
      {promotion && <PromotionPicker options={promotion} faces={promotionFaces} onPick={commit} onCancel={input.cancelPromotion} />}
    </BoardWrap>
  )
}
