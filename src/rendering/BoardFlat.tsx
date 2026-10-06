import './board.css'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Color, Square, type ImmutablePosition, type PieceType } from 'tsshogi'
import type { Board3DProps } from './Board3D'
import { OverMarks, UnderMarks } from './flatMarks'
import { useLatest } from '@/app/hooks/useLatest'
import { useBakedPieces } from '@/app/hooks/useBakedPieces'
import { useSvgBoard } from '@/app/hooks/useSvgBoard'
import { SPRITE_BOX, spriteKey, type Baked } from './sprites'
import { HALF_D, HALF_W, MARGIN, SQ_D, STAND, STRIP_D, STRIP_W, setBoardDims } from '@/rendering/board3d/dimensions'
import { handArrangement } from '@/rendering/board3d/hand'
import { layout, sideStandsFit, standCenter } from '@/rendering/board3d/layout'
import { steppedMove } from '@/utils/stepped'
import { playSound, useSettings } from '@/appearance/settings'

const U = 100
const CH = SQ_D * U
const PAD = 0.08 * U
const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

interface Drag {
  from: Square | PieceType
  color: Color
  type: PieceType
  x: number
  y: number
  moved: boolean
  id: number
  handIndex?: number
}

function geometry(portrait: boolean, narrow: boolean) {
  layout.portrait = portrait
  layout.narrow = narrow
  const half = portrait ? { x: STRIP_W / 2, z: STRIP_D / 2 } : { x: STAND / 2, z: STAND / 2 }
  const top = standCenter(Color.WHITE)
  const bottom = standCenter(Color.BLACK)
  const minX = Math.min(-HALF_W, top.x - half.x, bottom.x - half.x)
  const maxX = Math.max(HALF_W, top.x + half.x, bottom.x + half.x)
  const minZ = Math.min(-HALF_D, top.z - half.z, bottom.z - half.z)
  const maxZ = Math.max(HALF_D, top.z + half.z, bottom.z + half.z)
  const rect = (x: number, z: number, w: number, h: number) => ({ x: (x - minX) * U, y: (z - minZ) * U, w: w * U, h: h * U })
  const board = rect(-HALF_W, -HALF_D, 2 * HALF_W, 2 * HALF_D)
  return {
    portrait,
    width: (maxX - minX) * U,
    height: (maxZ - minZ) * U,
    ox: -minX * U,
    oy: -minZ * U,
    bx: board.x,
    by: board.y,
    bw: board.w,
    bh: board.h,
    stands: { top: rect(top.x - half.x, top.z - half.z, 2 * half.x, 2 * half.z), bottom: rect(bottom.x - half.x, bottom.z - half.z, 2 * half.x, 2 * half.z) },
  }
}

function Koma({ baked, type, color, up }: { baked: Baked; type: PieceType; color: Color; up: boolean }) {
  const size = SPRITE_BOX * U
  return <image href={baked.pieces.get(spriteKey(type, color, up))} x={-size / 2} y={-size / 2} width={size} height={size} />
}

export function BoardFlat(props: Board3DProps) {
  const { position, flipped, selected, selectedColor, lastMove, movable } = props
  const settings = useSettings()
  setBoardDims()
  const { i18n } = useTranslation()
  const svgRef = useSvgBoard()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 1, h: 1 })
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const zoned = !!props.onZones && globalThis.innerWidth >= 1100 && sideStandsFit(globalThis.innerWidth - 100, globalThis.innerHeight - 110)
  const g = geometry(!(zoned || sideStandsFit(box.w, box.h)), box.w < 560)
  const margin = MARGIN * U
  const { baked, loading, error } = useBakedPieces()
  const gx = g.bx + margin
  const gy = g.by + margin
  const col = (file: number) => (flipped ? file - 1 : 9 - file)
  const row = (rank: number) => (flipped ? 9 - rank : rank - 1)
  const cx = (sq: Square) => gx + (col(sq.file) + 0.5) * U
  const cy = (sq: Square) => gy + (row(sq.rank) + 0.5) * CH

  const geo = useLatest({ g, cx, cy })
  const onZones = useLatest(props.onZones)
  const zoneKey = useRef('')
  useLayoutEffect(() => {
    const report = onZones.current
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!report || !svg || !m) return
    if (g.portrait) {
      if (zoneKey.current !== 'none') report(null)
      zoneKey.current = 'none'
      return
    }
    const rect = svg.getBoundingClientRect()
    const screenBox = (x: number, y: number, w: number, h: number) => ({
      l: x * m.a + m.e - rect.left,
      r: (x + w) * m.a + m.e - rect.left,
      t: y * m.d + m.f - rect.top,
      b: (y + h) * m.d + m.f - rect.top,
    })
    const bd = screenBox(g.bx, g.by, g.bw, g.bh)
    const top = screenBox(g.stands.top.x, g.stands.top.y, g.stands.top.w, g.stands.top.h)
    const bottom = screenBox(g.stands.bottom.x, g.stands.bottom.y, g.stands.bottom.w, g.stands.bottom.h)
    const w = rect.width
    const h = rect.height
    const gap = 12
    const W = Math.max(0, Math.min(bd.l - gap - 16, w - 16 - bd.r - gap))
    const H = Math.max(0, Math.min(h - top.b - gap, bottom.t - gap))
    const zones = {
      board: { left: rect.left + bd.l, top: rect.top + bd.t, width: bd.r - bd.l, height: bd.b - bd.t },
      under: { left: rect.left + bd.l - gap - W, top: rect.top + top.b + gap, width: W, height: H },
      over: { left: rect.left + bd.r + gap, top: rect.top + bottom.t - gap - H, width: W, height: H },
    }
    const key = [zones.under, zones.over].map((r) => [r.left, r.top, r.width, r.height].map((v) => Math.round(v / 6)).join(',')).join('|')
    if (key === zoneKey.current) return
    zoneKey.current = key
    report(zones)
  })
  const previous = useRef<ImmutablePosition | null>(null)
  useLayoutEffect(() => {
    svgRef.current?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())
    const prev = previous.current
    previous.current = position
    if (!prev || prev.sfen === position.sfen || !lastMove) return
    const stepped = steppedMove(prev, position, lastMove)
    const to = Square.newByUSI(lastMove.slice(2, 4))
    if (!stepped || !to) return
    const from = lastMove[1] === '*' ? null : Square.newByUSI(lastMove.slice(0, 2))
    const { g: at, cx: px, cy: py } = geo.current
    const mover = position.board.at(to)?.color ?? Color.BLACK
    const stand = (mover === Color.BLACK) === flipped ? at.stands.top : at.stands.bottom
    const fx = from ? px(from) : stand.x + stand.w / 2
    const fy = from ? py(from) : stand.y + stand.h / 2
    const dx = fx - px(to)
    const dy = fy - py(to)
    const animation = svgRef.current
      ?.querySelector(`[data-sq="${to.usi}"]`)
      ?.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: `translate(${dx / 2}px, ${dy / 2 - 10}px) scale(1.16)`, offset: 0.5 },
          { transform: 'none' },
        ],
        { duration: 220, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
      )
    if (!animation) return
    animation.onfinish = () => playSound(stepped.capture ? 'capture' : 'move')
    return () => animation.cancel()
  }, [position, lastMove, flipped, geo, svgRef])

  const [drag, setDrag] = useState<Drag | null>(null)
  const [pickedHand, setPickedHand] = useState<{ color: Color; type: PieceType; index: number; sfen: string; portrait: boolean } | null>(null)
  const dragRef = useLatest(drag)
  const toSvg = (clientX: number, clientY: number) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return { x: 0, y: 0 }
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }
  const squareAt = (x: number, y: number) => {
    const c = Math.floor((x - gx) / U)
    const r = Math.floor((y - gy) / CH)
    if (c < 0 || c > 8 || r < 0 || r > 8) return null
    return new Square(flipped ? c + 1 : 9 - c, flipped ? 9 - r : r + 1)
  }
  const startDrag = (e: ReactPointerEvent, from: Square | PieceType, color: Color, type: PieceType, handIndex?: number) => {
    const p = toSvg(e.clientX, e.clientY)
    if (handIndex !== undefined) setPickedHand({ color, type, index: handIndex, sfen: position.sfen, portrait: g.portrait })
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    setDrag({ from, color, type, x: p.x, y: p.y, moved: false, id: e.pointerId, handIndex })
  }
  const onBoardDown = (e: ReactPointerEvent) => {
    const p = toSvg(e.clientX, e.clientY)
    const sq = squareAt(p.x, p.y)
    if (!sq) return
    const piece = position.board.at(sq)
    if (piece && movable === piece.color) startDrag(e, sq, piece.color, piece.type)
    else props.onSquare(sq)
  }
  const onMove = (e: ReactPointerEvent) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    const p = toSvg(e.clientX, e.clientY)
    if (!d.moved && Math.hypot(p.x - d.x, p.y - d.y) < U * 0.2) return
    setDrag({ ...d, x: p.x, y: p.y, moved: true })
  }
  const onUp = (e: ReactPointerEvent) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    setDrag(null)
    const p = toSvg(e.clientX, e.clientY)
    const to = squareAt(p.x, p.y)
    const fromSquare = d.from instanceof Square ? d.from : null
    if (d.moved && to && !(fromSquare && fromSquare.equals(to))) return props.onDrop(d.from, to)
    if (fromSquare) props.onSquare(fromSquare)
    else props.onHand(d.color, d.from as PieceType)
  }

  if (!baked)
    return (
      <div className="app-flat app-flat-wood" ref={wrapRef}>
        <output>{error ?? i18n.t('settings.loadingEvalFile')}</output>
      </div>
    )

  const hands = new Map([Color.BLACK, Color.WHITE].map((color) => [color, handArrangement(position, color).spots]))
  const handIndex = (color: Color, type: PieceType) => {
    const picked = pickedHand
    if (picked && picked.color === color && picked.type === type && picked.sfen === position.sfen && picked.portrait === g.portrait) return picked.index
    return hands.get(color)!.findIndex((spot) => spot.type === type)
  }
  const handPoint = (color: Color, type: PieceType) => hands.get(color)![handIndex(color, type)] ?? null

  const hand = (color: Color) => {
    const bottom = (color === Color.BLACK) !== flipped
    const s = bottom ? g.stands.bottom : g.stands.top
    const sign = flipped ? -1 : 1
    const colorSpots = hands.get(color)!
    const order = colorSpots.map((_, i) => i).toSorted((a, b) => (colorSpots[a].lift ?? 0) - (colorSpots[b].lift ?? 0))
    const size = SPRITE_BOX * U * 0.96
    return (
      <g key={color}>
        <image href={baked.stand} x={s.x} y={s.y} width={s.w} height={s.h} preserveAspectRatio="none" />
        <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="none" stroke="rgba(60,34,12,0.5)" strokeWidth={2} />
        {order.map((i) => {
          const spot = colorSpots[i]
          const x = g.ox + sign * spot.x * U
          const y = g.oy + sign * spot.z * U
          const on = selected === spot.type && selectedColor === color && i === handIndex(color, spot.type)
          const lifted = drag?.from === spot.type && drag.color === color && drag.handIndex === i && drag.moved
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${(-spot.rot * 180) / Math.PI})`}
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => (movable === color ? startDrag(e, spot.type, color, spot.type, i) : props.onHand(color, spot.type))}
            >
              <g opacity={lifted ? 0.35 : 1} className={`app-koma-lift${on ? ' on' : ''}`}>
                <image href={baked.pieces.get(spriteKey(spot.type, color, bottom))} x={-size / 2} y={-size / 2} width={size} height={size} />
              </g>
              {spot.count && spot.count > 1 && (
                <g transform={`rotate(${(spot.rot * 180) / Math.PI}) translate(${U * 0.34} ${-U * 0.36})${bottom ? '' : ' rotate(180)'}`} pointerEvents="none">
                  <circle r={U * 0.17} fill="#2a241e" stroke="#fbf6ec" strokeWidth={2.5} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={U * 0.22}
                    fontWeight={700}
                    fontFamily="'Zen Kaku Gothic New', sans-serif"
                    fill="#fff"
                  >
                    {spot.count}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  const project = (x: number, z: number): [number, number] => [g.ox + (flipped ? -x : x) * U, g.oy + (flipped ? -z : z) * U]
  const coordFill = settings.boardStyle === 'dark' ? 'rgba(250,232,196,0.92)' : 'rgba(40,22,8,0.85)'
  const dragFrom = drag?.moved && drag.from instanceof Square ? drag.from : null
  return (
    <div className="app-flat app-flat-wood" ref={wrapRef} aria-busy={loading}>
      {(loading || error) && <output className="app-board-loading">{error ?? i18n.t('settings.loadingEvalFile')}</output>}
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${-PAD} ${-PAD} ${g.width + 2 * PAD} ${g.height + 2 * PAD}`}
        preserveAspectRatio="xMidYMid meet"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- inline interactive SVG cannot be an <img>; role="img" is the standard way to expose it as one image
        role="img"
        aria-label={i18n.t('board.shogiBoard')}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
      >
        <image href={baked.board} x={g.bx} y={g.by} width={g.bw} height={g.bh} preserveAspectRatio="none" />
        <rect className="app-board-frame" x={g.bx - 6} y={g.by - 6} width={g.bw + 12} height={g.bh + 12} rx={10} fill="none" pointerEvents="none" />
        <UnderMarks props={props} p={project} u={U} />
        {settings.coords &&
          Array.from({ length: 9 }, (_, i) => (
            <g
              key={`c${i}`}
              fill={coordFill}
              fontSize={U * 0.3}
              fontWeight={800}
              fontFamily="'Shippori Mincho B1', serif"
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
            >
              <text x={gx + (i + 0.5) * U} y={g.by + margin / 2}>
                {flipped ? i + 1 : 9 - i}
              </text>
              <text x={gx + 9 * U + margin / 2} y={gy + (i + 0.5) * CH}>
                {KANJI_NUM[flipped ? 9 - i : i + 1]}
              </text>
            </g>
          ))}
        <rect x={gx} y={gy} width={9 * U} height={9 * CH} fill="transparent" onPointerDown={onBoardDown} style={{ cursor: 'pointer', touchAction: 'none' }} />
        <g pointerEvents="none">
          {position.board.listNonEmptySquares().map((sq) => {
            const piece = position.board.at(sq)!
            const up = (piece.color === Color.BLACK) !== flipped
            const lifted = dragFrom?.equals(sq)
            return (
              <g key={sq.usi} transform={`translate(${cx(sq)} ${cy(sq)})`} opacity={lifted ? 0.35 : 1}>
                <g data-sq={sq.usi}>
                  <g className={`app-koma-lift${selected instanceof Square && selected.equals(sq) ? ' on' : ''}`}>
                    <Koma baked={baked} type={piece.type} color={piece.color} up={up} />
                  </g>
                </g>
              </g>
            )
          })}
        </g>
        {hand(Color.BLACK)}
        {hand(Color.WHITE)}
        <OverMarks props={props} p={project} u={U} flip={flipped ? -1 : 1} coordFill={coordFill} handPoint={handPoint} />
        {drag?.moved && (
          <g transform={`translate(${drag.x} ${drag.y - U * 0.3}) scale(1.12)`} pointerEvents="none">
            <Koma baked={baked} type={drag.type} color={drag.color} up={(drag.color === Color.BLACK) !== flipped} />
          </g>
        )}
      </svg>
    </div>
  )
}
