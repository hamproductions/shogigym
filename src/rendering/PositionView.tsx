import { useMemo } from 'react'
import { Color, PieceType, Square } from 'tsshogi'
import { styled } from 'styled-system/jsx'
import { useBakedPieces } from '@/app/hooks/useBakedPieces'
import { HALF_D, HALF_W, MARGIN, setBoardDims } from '@/rendering/board3d/dimensions'
import { HAND_ORDER, positionOf } from '@/utils/shogi'
import { CH, Koma, U } from './flatBoard'

const PLAYED = '#c4442a'
const BEST = '#2f8f4e'
const STRIP = 1.15 * U
const GAP = 0.12 * U
const HAND_SCALE = 0.62

type Props = {
  sfen: string
  /** The move that was played, drawn in red. */
  played?: string
  /** The better move, drawn in green. */
  best?: string
  /** Put White at the bottom (use when White is the side to move). */
  flipped?: boolean
  label?: string
}

/**
 * A static, non-interactive picture of a position drawn with the player's own baked board, pieces and stands,
 * so it matches the main board and reuses its cache.
 */
export function PositionView({ sfen, played, best, flipped = false, label }: Props) {
  setBoardDims()
  const { baked } = useBakedPieces()
  const position = useMemo(() => positionOf(sfen), [sfen])
  const margin = MARGIN * U
  const width = 2 * HALF_W * U
  const boardHeight = 2 * HALF_D * U
  const anyHand = [Color.BLACK, Color.WHITE].some((color) => HAND_ORDER.some((type) => position.hand(color).count(type) > 0))
  const top = anyHand ? STRIP + GAP : 0
  const height = boardHeight + 2 * top
  const gx = margin
  const gy = top + margin

  const centre = (square: Square) => {
    const col = flipped ? square.file - 1 : 9 - square.file
    const row = flipped ? 9 - square.rank : square.rank - 1
    return [gx + (col + 0.5) * U, gy + (row + 0.5) * CH] as const
  }
  const bottomColor = flipped ? Color.WHITE : Color.BLACK

  const marks = (usi: string | undefined, color: string) => {
    const to = usi && Square.newByUSI(usi.slice(2, 4))
    if (!usi || !to) return null
    const from = usi[1] === '*' ? null : Square.newByUSI(usi.slice(0, 2))
    const [tx, ty] = centre(to)
    const origin = from ? centre(from) : null
    const head = (() => {
      if (!origin) return null
      const angle = Math.atan2(ty - origin[1], tx - origin[0])
      const size = 0.3 * U
      const back = (offset: number) => [
        tx - Math.cos(angle) * size + Math.cos(angle + Math.PI / 2) * offset,
        ty - Math.sin(angle) * size + Math.sin(angle + Math.PI / 2) * offset,
      ]
      return `${tx},${ty} ${back(size * 0.45).join(',')} ${back(-size * 0.45).join(',')}`
    })()
    return (
      <g pointerEvents="none" key={color}>
        <rect x={tx - U / 2} y={ty - CH / 2} width={U} height={CH} fill={color} opacity={0.38} />
        {origin && (
          <>
            <rect x={origin[0] - U / 2} y={origin[1] - CH / 2} width={U} height={CH} fill={color} opacity={0.2} />
            <line x1={origin[0]} y1={origin[1]} x2={tx} y2={ty} stroke={color} strokeWidth={0.1 * U} strokeLinecap="round" opacity={0.85} />
            <polygon points={head!} fill={color} opacity={0.95} />
          </>
        )}
      </g>
    )
  }

  const hand = (color: Color, y: number) => {
    const counts = HAND_ORDER.flatMap((type) => (position.hand(color).count(type) ? [{ type, count: position.hand(color).count(type) }] : []))
    const up = color === bottomColor
    const step = 0.86 * U
    return (
      <g>
        {baked && <image href={baked.stand} x={0} y={y} width={width} height={STRIP} preserveAspectRatio="none" />}
        <rect x={0} y={y} width={width} height={STRIP} fill="none" stroke="rgba(60,34,12,0.5)" strokeWidth={2} />
        {baked &&
          counts.map(({ type, count }, i) => (
            <g key={type} transform={`translate(${0.7 * U + i * step} ${y + STRIP / 2})`}>
              <g transform={`scale(${HAND_SCALE})`}>
                <Koma baked={baked} type={type as PieceType} color={color} up={up} />
              </g>
              {count > 1 && (
                <g transform={`translate(${0.3 * U} ${-0.3 * U})`}>
                  <circle r={0.2 * U} fill="#2a241e" stroke="#fbf6ec" strokeWidth={2.5} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={0.26 * U}
                    fontWeight={700}
                    fontFamily="'Zen Kaku Gothic New', sans-serif"
                    fill="#fff"
                  >
                    {count}
                  </text>
                </g>
              )}
            </g>
          ))}
      </g>
    )
  }

  return (
    <styled.svg display="block" w="100%" h="auto" borderRadius="sm" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} aria-busy={!baked}>
      {anyHand && hand(bottomColor === Color.BLACK ? Color.WHITE : Color.BLACK, 0)}
      {baked ? (
        <image href={baked.board} x={0} y={top} width={width} height={boardHeight} preserveAspectRatio="none" />
      ) : (
        <rect x={0} y={top} width={width} height={boardHeight} fill="#ecd29a" />
      )}
      {marks(best, BEST)}
      {marks(played, PLAYED)}
      {baked &&
        position.board.listNonEmptySquares().map((square) => {
          const piece = position.board.at(square)!
          const [x, y] = centre(square)
          return (
            <g key={square.usi} transform={`translate(${x} ${y})`} pointerEvents="none">
              <Koma baked={baked} type={piece.type} color={piece.color} up={(piece.color === Color.BLACK) !== flipped} />
            </g>
          )
        })}
      {anyHand && hand(bottomColor, top + boardHeight + GAP)}
    </styled.svg>
  )
}
