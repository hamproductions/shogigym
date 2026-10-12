import { useMemo } from 'react'
import { Color, Square } from 'tsshogi'
import { HAND_ORDER, PIECE_CHAR, positionOf } from '@/utils/shogi'

const CELL = 30
const SIZE = CELL * 9
const PLAYED = '#c4442a'
const BEST = '#2f8f4e'

const cellCentre = (square: Square, flipped: boolean) => {
  const col = flipped ? square.file - 1 : 9 - square.file
  const row = flipped ? 9 - square.rank : square.rank - 1
  return [col * CELL + CELL / 2, row * CELL + CELL / 2] as const
}

function MoveMark({ usi, color, flipped }: { usi: string; color: string; flipped: boolean }) {
  const to = Square.newByUSI(usi.slice(2, 4))
  if (!to) return null
  const from = usi[1] === '*' ? null : Square.newByUSI(usi.slice(0, 2))
  const [tx, ty] = cellCentre(to, flipped)
  const [fx, fy] = from ? cellCentre(from, flipped) : [null, null]
  return (
    <g pointerEvents="none">
      <rect x={tx - CELL / 2} y={ty - CELL / 2} width={CELL} height={CELL} fill={color} opacity={0.35} />
      {fx !== null && fy !== null && (
        <>
          <rect x={fx - CELL / 2} y={fy - CELL / 2} width={CELL} height={CELL} fill={color} opacity={0.18} />
          <line x1={fx} y1={fy} x2={tx} y2={ty} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
        </>
      )}
      <circle cx={tx} cy={ty} r={4.5} fill={color} />
    </g>
  )
}

/**
 * A static diagram of a position with the move played (red) and the better move (green),
 * so mistakes can be understood without setting the board up in your head.
 */
export function MiniBoard({ sfen, played, best, flipped = false, label }: { sfen: string; played?: string; best?: string; flipped?: boolean; label?: string }) {
  const position = useMemo(() => positionOf(sfen), [sfen])
  const pieces = useMemo(() => {
    const out: { key: string; x: number; y: number; glyph: string; gote: boolean }[] = []
    for (const square of position.board.listNonEmptySquares()) {
      const piece = position.board.at(square)!
      const [x, y] = cellCentre(square, flipped)
      out.push({ key: square.usi, x, y, glyph: PIECE_CHAR[piece.type], gote: (piece.color === Color.WHITE) !== flipped })
    }
    return out
  }, [position, flipped])
  const hand = (color: Color) =>
    HAND_ORDER.flatMap((type) =>
      position.hand(color).count(type) ? [`${PIECE_CHAR[type]}${position.hand(color).count(type) > 1 ? position.hand(color).count(type) : ''}`] : [],
    ).join(' ')
  const handTop = hand(flipped ? Color.BLACK : Color.WHITE)
  const handBottom = hand(flipped ? Color.WHITE : Color.BLACK)
  return (
    <figure className="app-miniboard">
      <div className="app-miniboard-hand">
        {flipped ? '☗' : '☖'} {handTop || '–'}
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label}>
        <rect width={SIZE} height={SIZE} fill="#ecd29a" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} stroke="#8a6a3a" strokeWidth={i === 0 || i === 9 ? 1.6 : 0.8}>
            <line x1={i * CELL} y1={0} x2={i * CELL} y2={SIZE} />
            <line x1={0} y1={i * CELL} x2={SIZE} y2={i * CELL} />
          </g>
        ))}
        {best && <MoveMark usi={best} color={BEST} flipped={flipped} />}
        {played && <MoveMark usi={played} color={PLAYED} flipped={flipped} />}
        {pieces.map((p) => (
          <text
            key={p.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={21}
            fontFamily="'Shippori Mincho B1', 'Yuji Syuku', serif"
            fontWeight={700}
            fill="#2a1c0c"
            transform={p.gote ? `rotate(180 ${p.x} ${p.y})` : undefined}
          >
            {p.glyph}
          </text>
        ))}
      </svg>
      <div className="app-miniboard-hand">
        {flipped ? '☖' : '☗'} {handBottom || '–'}
      </div>
    </figure>
  )
}
