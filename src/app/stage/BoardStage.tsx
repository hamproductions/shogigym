import './board-stage.css'
import './board-layout.css'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvalBar } from './EvalBar'
import { sideColor, type Side } from '@/utils/shogi'
import { avatarCues, type AvatarCues } from '@/rendering/avatars'
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

import type { Board3DProps, StandZones } from '@/rendering/board3d/types'

const Board2D = lazy(() => import('@/rendering/Board2D').then((m) => ({ default: m.Board2D })))
const BoardFlat = lazy(() => import('@/rendering/BoardFlat').then((m) => ({ default: m.BoardFlat })))
const Board3D = lazy(() => import('@/rendering/Board3D').then((m) => ({ default: m.Board3D })))

interface BoardStageProps {
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

const boardLoading = <BoardLoading />

interface PieceAssets {
  ready: boolean
  key: string
  error?: string
}

function usePieceAssets(): PieceAssets {
  const { pieceFont, pieceSet, pieceGuide, boardStyle } = useSettings()
  const key = `${pieceFont}|${pieceSet}|${pieceGuide}|${boardStyle}`
  const [loaded, setLoaded] = useState<{ key: string; error?: string }>({ key: '' })
  useEffect(() => {
    let live = true
    const loadedKey = `${pieceFont}|${pieceSet}|${pieceGuide}|${boardStyle}`
    Promise.all([loadPieceFont(pieceFont), loadPieceSet(pieceSet, pieceGuide), loadBoardStyle(boardStyle)]).then(
      () => {
        if (live) setLoaded({ key: loadedKey })
      },
      (error: unknown) => {
        if (live) setLoaded({ key: loadedKey, error: error instanceof Error ? error.message : String(error) })
      },
    )
    return () => {
      live = false
    }
  }, [pieceFont, pieceSet, pieceGuide, boardStyle])
  if (loaded.key !== key) return { ready: false, key }
  return loaded.error === undefined ? { ready: true, key } : { ready: false, key, error: loaded.error }
}

function PeekNote({ note }: { note: string }) {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDismissed(true), 2000)
    return () => globalThis.clearTimeout(timer)
  }, [])
  if (dismissed) return null
  return <output className="app-peek">{note}</output>
}

type BoardData = Omit<Board3DProps, 'tilted' | 'furigoma' | 'onFurigoma' | 'snapKey' | 'onZones' | 'orbit' | 'sideRoom' | 'cues'>

interface StageBoardProps {
  board: BoardData
  assets: PieceAssets
  view: View
  snapKey: string
  cues: AvatarCues
  furigoma?: boolean
  onFurigoma?: (faces: boolean[]) => void
  onZones: (zones: StandZones | null) => void
}

function StageBoard({ board, assets, view, snapKey, cues, furigoma, onFurigoma, onZones }: StageBoardProps) {
  const settings = useSettings()
  const { environment } = settings
  if (environment === 'diagram' || environment === 'broadcast') return <Board2D style={environment} {...board} tilted={false} />
  if (environment === 'flat') return <BoardFlat {...board} tilted={false} onZones={onZones} />
  if (!assets.ready) return <BoardLoading error={assets.error} />
  return (
    <Board3D
      key={`${settings.pieceStyle}|${settings.boardStyle}|${settings.pieceFinish}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.coords}|${environment}|${assets.key}`}
      {...board}
      furigoma={furigoma}
      onFurigoma={onFurigoma}
      tilted={view.tilted && !view.flatView}
      snapKey={snapKey}
      onZones={onZones}
      orbit={view.orbit && !view.flatView}
      sideRoom={0}
      cues={cues}
    />
  )
}

function useStageCues(spar: Spar, stamp: ReturnType<typeof useBoardDecor>['stamp']) {
  const { mode, course, game, lastMove, gameOver, atEnd, userTurn, userSide, toMove } = useSession()
  const playing = mode === 'spar' || mode === 'view' || (mode === 'lesson' && !!course)
  return useMemo(
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
}

function SidePlate({
  place,
  picking,
  hasDrillCard,
  spar,
  watch,
}: {
  place: 'top' | 'bottom'
  picking: boolean
  hasDrillCard: boolean
  spar: Spar
  watch: Watch
}) {
  const { t } = useTranslation()
  const { mode, position, flipped, userSide } = useSession()
  const side: Side = (place === 'top') === flipped ? 'sente' : 'gote'
  let who: string | null = side === userSide ? t('app.you') : t('app.opponent')
  if (mode === 'view') who = watch.bot(side)
  else if (mode === 'analyze' || picking || (mode === 'drill' && !hasDrillCard)) who = null
  return <Plate className={place} clock={spar.clockFace(side)} position={position} color={sideColor(side)} who={who} />
}

function SidePlates(props: { picking: boolean; hasDrillCard: boolean; spar: Spar; watch: Watch }) {
  const { mode } = useSession()
  if (mode === 'tsume' || props.picking) return null
  return (
    <>
      <SidePlate place="top" {...props} />
      <SidePlate place="bottom" {...props} />
    </>
  )
}

function TsumePlates() {
  const { mode, flipped, userSide } = useSession()
  if (mode !== 'tsume') return null
  return (
    <>
      <TsumePlate position="top" flipped={flipped} userSide={userSide} />
      <TsumePlate position="bottom" flipped={flipped} userSide={userSide} />
    </>
  )
}

function GameOverSlot({ spar, flatView }: { spar: Spar; flatView: boolean }) {
  const { mode, game, gameOver, sfen } = useSession()
  const sparEnded = mode === 'spar' && (spar.resigned || !!spar.flagged)
  const show = ((gameOver && game.moves.length > 0 && isGameMode(mode)) || sparEnded) && spar.endHidden !== sfen
  return show ? <GameOverBanner spar={spar} flatView={flatView} /> : null
}

function useBoardData(decor: BoardStageProps['decor'], input: BoardStageProps['input']): BoardData {
  const { position, flipped, lastMove, selection, gameOver, userTurn } = useSession()
  return {
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
}

function FurigomaBanner({ text, onClear }: { text: string; onClear: () => void }) {
  return (
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
      <span>{text}</span>
      <Button size="sm" onClick={onClear}>
        ✕
      </Button>
    </div>
  )
}

function TsumeHint({ tsume }: { tsume: TsumeState }) {
  const { t } = useTranslation()
  if (tsume.status !== 'playing' || tsume.good !== 0 || tsume.hint < 1) return null
  return <output className="app-peek app-phone-only">{t('app.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) })}</output>
}

function PhoneTask({ task }: { task: NonNullable<BoardStageProps['phoneTask']> }) {
  return (
    <button className="app-phone-task" onClick={task.run}>
      <span>{task.text}</span>
      <b>{task.action} ›</b>
    </button>
  )
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
  const assets = usePieceAssets()
  const cues = useStageCues(spar, decor.stamp)
  const board = useBoardData(decor, input)
  const { mode, course, game, flipped, promotion, sfen } = useSession()
  const picking = mode === 'lesson' && !course
  return (
    <div className={`app-board-wrap${evalRate === null ? '' : ' with-eval'}`}>
      {mode === 'spar' && spar.furigomaBanner && <FurigomaBanner text={spar.furigomaBanner} onClear={spar.clearFurigomaBanner} />}
      <div className="app-board-scene">
        {evalRate !== null && <EvalBar rate={evalRate} flipped={flipped} />}
        <Suspense fallback={boardLoading}>
          <StageBoard
            board={board}
            assets={assets}
            view={view}
            snapKey={`${mode}|${game.start}|${course?.id ?? ''}|${tsume?.problem.id ?? ''}`}
            cues={cues}
            furigoma={furigoma}
            onFurigoma={onFurigoma}
            onZones={onZones}
          />
        </Suspense>
        <SidePlates picking={picking} hasDrillCard={hasDrillCard} spar={spar} watch={watch} />
        {decor.note && <PeekNote key={`${decor.note}|${sfen}`} note={decor.note} />}
      </div>
      <BoardBanners mistake={mistake} onBack={onBack} />
      <TsumePlates />
      {phoneTask && <PhoneTask task={phoneTask} />}
      <GameOverSlot spar={spar} flatView={view.flatView} />
      {announce && <AnnounceBadge key={announce.key} announce={announce} />}
      {!decor.note && mode === 'tsume' && tsume && <TsumeHint tsume={tsume} />}
      {promotion && <PromotionPicker options={promotion} onPick={commit} onCancel={input.cancelPromotion} />}
    </div>
  )
}
