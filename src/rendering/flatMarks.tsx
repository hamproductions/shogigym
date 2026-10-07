import { PieceType, Square, type ImmutablePosition, type Color } from 'tsshogi'
import type { Board3DProps, BoardArrow } from './Board3D'
import { SQ_D, squareX, squareZ } from '@/rendering/board3d/dimensions'
import { handSpot } from '@/rendering/board3d/hand'
import { standCenter } from '@/rendering/board3d/layout'

const DROP_TYPE: Record<string, PieceType> = {
  P: PieceType.PAWN,
  L: PieceType.LANCE,
  N: PieceType.KNIGHT,
  S: PieceType.SILVER,
  G: PieceType.GOLD,
  B: PieceType.BISHOP,
  R: PieceType.ROOK,
}

export type Project = (x: number, z: number) => [number, number]

type HandPoint = (color: Color, type: PieceType) => { x: number; z: number } | null

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

function Tile({ p, u, square, color, opacity }: { p: Project; u: number; square: Square; color: number; opacity: number }) {
  const [x, y] = p(squareX(square.file), squareZ(square.rank))
  const w = 0.98 * u
  const h = 0.98 * SQ_D * u
  return <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={hex(color)} opacity={opacity} />
}

function Frame({ p, u, square, inner, color, opacity = 1 }: { p: Project; u: number; square: Square; inner: number; color: string; opacity?: number }) {
  const [x, y] = p(squareX(square.file), squareZ(square.rank))
  const o = 0.69 * Math.SQRT1_2
  const i = inner * Math.SQRT1_2
  const path = (r: number) => `M ${x - r * u} ${y - r * SQ_D * u} H ${x + r * u} V ${y + r * SQ_D * u} H ${x - r * u} Z`
  return <path d={`${path(o)} ${path(i)}`} fillRule="evenodd" fill={color} opacity={opacity} />
}

function Badge({ x, y, size, text, color }: { x: number; y: number; size: number; text: string; color: string }) {
  const k = size / 96
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={44} fill={color} stroke="#fbf6ec" strokeWidth={5} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={text.length > 1 ? 40 : 50}
        fontWeight={700}
        fontFamily="'Zen Kaku Gothic New', sans-serif"
        fill="#fff"
      >
        {text}
      </text>
    </g>
  )
}

function Tag({ x, y, u, text, color }: { x: number; y: number; u: number; text: string; color: string }) {
  const k = (0.56 * u) / 160
  const w = Math.min(152, [...text].reduce((sum, c) => sum + (c.charCodeAt(0) > 255 ? 46 : 26), 0) + 28)
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(-80 -36)`}>
      <rect x={(160 - w) / 2} y={6} width={w} height={60} rx={14} fill={color} />
      <text
        x={80}
        y={38}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={46}
        fontWeight={700}
        fontFamily="'Zen Kaku Gothic New', sans-serif"
        fill="#fff"
      >
        {text}
      </text>
    </g>
  )
}

function Arrow({ p, u, arrow, position, handPoint }: { p: Project; u: number; arrow: BoardArrow; position: ImmutablePosition; handPoint?: HandPoint }) {
  const to = Square.newByUSI(arrow.usi.slice(2, 4))
  if (!to || !/^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(arrow.usi)) return null
  let sx: number
  let sz: number
  if (arrow.usi[1] === '*') {
    const slot =
      handPoint?.(position.color, DROP_TYPE[arrow.usi[0]]) ?? handSpot(position, position.color, DROP_TYPE[arrow.usi[0]]) ?? standCenter(position.color)
    sx = slot.x
    sz = slot.z
  } else {
    const from = Square.newByUSI(arrow.usi.slice(0, 2))
    if (!from) return null
    sx = squareX(from.file)
    sz = squareZ(from.rank)
  }
  const ex = squareX(to.file)
  const ez = squareZ(to.rank)
  const length = Math.hypot(ex - sx, ez - sz)
  const shaft = Math.max(0.01, length - 0.45)
  const w = arrow.dashed ? 0.06 : 0.09
  const head = arrow.dashed ? 0.2 : 0.26
  const segment = arrow.dashed ? 0.16 : shaft
  const gap = arrow.dashed ? 0.1 : 0
  const parts: string[] = [`M ${head} ${shaft} L 0 ${length - 0.1} L ${-head} ${shaft} Z`]
  for (let y = 0; y < shaft - 0.001; y += segment + gap) parts.push(`M ${-w} ${y} H ${w} V ${Math.min(shaft, y + segment)} H ${-w} Z`)
  const [x0, y0] = p(sx, sz)
  const [x1, y1] = p(ex, ez)
  const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI - 90
  return <path d={parts.join(' ')} transform={`translate(${x0} ${y0}) rotate(${angle}) scale(${u})`} fill={arrow.color} opacity={arrow.dashed ? 0.7 : 0.82} />
}

function Castle({ p, u, castle }: { p: Project; u: number; castle: { squares: Square[]; color: string; label: string } }) {
  const xs = castle.squares.map((sq) => squareX(sq.file))
  const zs = castle.squares.map((sq) => squareZ(sq.rank))
  const minX = Math.min(...xs) - 0.5
  const maxX = Math.max(...xs) + 0.5
  const minZ = Math.min(...zs) - 0.5
  const maxZ = Math.max(...zs) + 0.5
  const t = 0.06
  const corners = [p(minX, minZ), p(maxX, maxZ)]
  const left = Math.min(corners[0][0], corners[1][0])
  const top = Math.min(corners[0][1], corners[1][1])
  const width = Math.abs(corners[1][0] - corners[0][0])
  const height = Math.abs(corners[1][1] - corners[0][1])
  const [lx, ly] = p((minX + maxX) / 2, (minZ + maxZ) / 2 > 0 ? minZ - 0.22 : maxZ + 0.22)
  const k = (1.6 * u) / 256
  return (
    <>
      <rect x={left} y={top} width={width} height={height} fill="none" stroke={castle.color} strokeWidth={t * u} opacity={0.85} />
      <g transform={`translate(${lx} ${ly}) scale(${k}) translate(-128 -32)`}>
        <rect x={4} y={8} width={248} height={48} rx={10} fill={castle.color} />
        <text
          x={128}
          y={34}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={34}
          fontWeight={800}
          fontFamily="'Shippori Mincho B1', serif"
          fill="#fbf6ec"
        >
          {castle.label}
        </text>
      </g>
    </>
  )
}

export function UnderMarks({
  props,
  p,
  u,
  handPoint,
  markersOnly = false,
}: {
  props: Board3DProps
  p: Project
  u: number
  handPoint?: HandPoint
  markersOnly?: boolean
}) {
  const { lastMove, selected, targets, checkSquare, peek, peekFrom, heat, arrows, position } = props
  const to = lastMove ? Square.newByUSI(lastMove.slice(2, 4)) : null
  const from = lastMove && lastMove[1] !== '*' ? Square.newByUSI(lastMove.slice(0, 2)) : null
  return (
    <g pointerEvents="none">
      {!markersOnly && (
        <g>
          {to && <Tile p={p} u={u} square={to} color={0xe8a63a} opacity={0.55} />}
          {from && <Tile p={p} u={u} square={from} color={0xe8a63a} opacity={0.38} />}
          {checkSquare && (
            <>
              <Tile p={p} u={u} square={checkSquare} color={0xe0301e} opacity={0.6} />
              <Frame p={p} u={u} square={checkSquare} inner={0.6} color="#c62a1a" />
            </>
          )}
          {selected instanceof Square && (
            <>
              <Tile p={p} u={u} square={selected} color={0xfff1c9} opacity={0.45} />
              <Frame p={p} u={u} square={selected} inner={0.66} color="#c8442f" />
            </>
          )}
          {targets.map((sq) => {
            const [x, y] = p(squareX(sq.file), squareZ(sq.rank))
            return <circle key={sq.usi} cx={x} cy={y} r={0.12 * u} fill="#5a3a1c" opacity={0.5} />
          })}
          {(peek ?? []).map((sq) => (
            <g key={`p${sq.usi}`}>
              <Tile p={p} u={u} square={sq} color={0xc8442f} opacity={0.26} />
              <Frame p={p} u={u} square={sq} inner={0.62} color="#b33a26" opacity={0.7} />
            </g>
          ))}
          {peekFrom && <Tile p={p} u={u} square={peekFrom} color={0xc8442f} opacity={0.22} />}
          {(heat ?? []).map((h, i) => (
            <Tile key={`h${i}`} p={p} u={u} square={h.square} color={h.color} opacity={h.opacity} />
          ))}
        </g>
      )}
      {arrows.map((arrow, i) => (
        <Arrow key={`a${i}`} p={p} u={u} arrow={arrow} position={position} handPoint={handPoint} />
      ))}
    </g>
  )
}

export function OverMarks({ props, p, u, coordFill, handPoint }: { props: Board3DProps; p: Project; u: number; coordFill: string; handPoint?: HandPoint }) {
  const { position, selected, selectedColor, heat, castles, arrows, stamp } = props
  const flip = props.flipped ? -1 : 1
  const stacked = new Map<string, number>()
  const stamped = stamp && Square.newByUSI(stamp.square)
  const handSlot =
    selected !== null && !(selected instanceof Square) && selectedColor !== undefined
      ? (handPoint?.(selectedColor, selected) ?? handSpot(position, selectedColor, selected) ?? standCenter(selectedColor))
      : null
  return (
    <g pointerEvents="none">
      {handSlot &&
        (() => {
          const [x, y] = p(handSlot.x, handSlot.z)
          return <circle cx={x} cy={y} r={0.46 * u} fill="none" stroke="#c8442f" strokeWidth={0.04 * u} />
        })()}
      {(heat ?? []).map((h, i) => {
        if (!h.label) return null
        const [x, y] = p(squareX(h.square.file) + 0.32, squareZ(h.square.rank) + 0.3)
        return (
          <text
            key={`hl${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={0.34 * u * (40 / 64)}
            fontWeight={800}
            fontFamily="'Shippori Mincho B1', serif"
            fill={coordFill}
          >
            {h.label}
          </text>
        )
      })}
      {(castles ?? []).map((c, i) => (
        <Castle key={`c${i}`} p={p} u={u} castle={c} />
      ))}
      {arrows.map((arrow, i) => {
        const to = Square.newByUSI(arrow.usi.slice(2, 4))
        if (!arrow.label || !to) return null
        const stack = stacked.get(to.usi) ?? 0
        stacked.set(to.usi, stack + 1)
        const [x, y] = p(squareX(to.file), squareZ(to.rank) + (0.49 - stack * 0.25) * SQ_D * flip)
        return <Tag key={`a${i}`} x={x} y={y} u={u} text={arrow.label} color={arrow.color} />
      })}
      {stamp &&
        stamped &&
        (() => {
          const [x, y] = p(squareX(stamped.file) + 0.48 * flip, squareZ(stamped.rank) - 0.48 * SQ_D * flip)
          return <Badge x={x} y={y} size={0.5 * u} text={stamp.text} color={stamp.color} />
        })()}
    </g>
  )
}
