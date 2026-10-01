import { useMemo, useState } from 'react'
import { Color, PieceType, Square, type Move } from 'tsshogi'
import { HAND_ORDER, PIECE_CHAR, legalTargets, positionOf, promotionOptions } from '../shogi'
import { LABELS, type Label } from '../analysis'

export type Arrow = { usi: string; color: string }

type Props = {
  sfen: string
  flipped: boolean
  lastMove?: string
  arrows?: Arrow[]
  stamp?: { usi: string; label: Label } | null
  interactive?: boolean
  onMove?: (usi: string) => void
}

type Selection = { from: Square | PieceType; targets: Square[] } | null

const squareAt = (col: number, row: number, flipped: boolean) =>
  flipped ? new Square(col + 1, 9 - row) : new Square(9 - col, row + 1)

const cellOf = (square: Square, flipped: boolean) =>
  flipped ? { col: square.file - 1, row: 9 - square.rank } : { col: 9 - square.file, row: square.rank - 1 }

function parseTarget(usi: string): Square | null {
  return Square.newByUSI(usi.slice(2, 4))
}

function parseSource(usi: string): Square | null {
  return usi[1] === '*' ? null : Square.newByUSI(usi.slice(0, 2))
}

export function Board({ sfen, flipped, lastMove, arrows = [], stamp, interactive = true, onMove }: Props) {
  const position = useMemo(() => positionOf(sfen), [sfen])
  const [selection, setSelection] = useState<Selection>(null)
  const [promotion, setPromotion] = useState<{ moves: Move[]; at: Square } | null>(null)
  const [lastSfen, setLastSfen] = useState(sfen)
  if (lastSfen !== sfen) {
    setLastSfen(sfen)
    setSelection(null)
    setPromotion(null)
  }

  const bottomColor = flipped ? Color.WHITE : Color.BLACK
  const topColor = flipped ? Color.BLACK : Color.WHITE
  const lastTo = lastMove ? parseTarget(lastMove) : null
  const lastFrom = lastMove ? parseSource(lastMove) : null

  const play = (move: Move) => {
    setSelection(null)
    setPromotion(null)
    onMove?.(move.usi)
  }

  const clickSquare = (square: Square) => {
    if (!interactive) return
    const piece = position.board.at(square)
    if (selection?.targets.some((t) => t.equals(square))) {
      const options = promotionOptions(position, selection.from, square)
      if (options.length === 1) play(options[0])
      else if (options.length === 2) setPromotion({ moves: options, at: square })
      return
    }
    if (piece && piece.color === position.color) {
      if (selection?.from instanceof Square && selection.from.equals(square)) return setSelection(null)
      return setSelection({ from: square, targets: legalTargets(position, square) })
    }
    setSelection(null)
  }

  const clickHand = (color: Color, type: PieceType) => {
    if (!interactive || color !== position.color) return
    if (selection?.from === type) return setSelection(null)
    setSelection({ from: type, targets: legalTargets(position, type) })
  }

  const hand = (color: Color, place: 'top' | 'bottom') => {
    const h = position.hand(color)
    const pieces = HAND_ORDER.filter((t) => h.count(t) > 0)
    return (
      <div className={`hand hand-${place}`} aria-label={`${color === Color.BLACK ? 'Sente' : 'Gote'} pieces in hand`}>
        <span className="hand-owner">{color === Color.BLACK ? '☗' : '☖'}</span>
        {pieces.length === 0 && <span className="hand-empty">none</span>}
        {pieces.map((type) => (
          <button
            key={type}
            className={`hand-piece ${selection?.from === type && color === position.color ? 'selected' : ''}`}
            onClick={() => clickHand(color, type)}
            disabled={!interactive || color !== position.color}
          >
            <span className={`glyph ${place === 'top' ? 'rotated' : ''}`}>{PIECE_CHAR[type]}</span>
            {h.count(type) > 1 && <sub>{h.count(type)}</sub>}
          </button>
        ))}
      </div>
    )
  }

  const cells = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const square = squareAt(col, row, flipped)
      const piece = position.board.at(square)
      const isTarget = selection?.targets.some((t) => t.equals(square))
      const isSelected = selection?.from instanceof Square && selection.from.equals(square)
      const isLast = lastTo?.equals(square) || lastFrom?.equals(square)
      const isPromo = promotion?.at.equals(square)
      cells.push(
        <button
          key={`${col}-${row}`}
          className={`cell ${isLast ? 'last' : ''} ${isSelected ? 'selected' : ''} ${isTarget ? (piece ? 'target capture' : 'target') : ''}`}
          onClick={() => clickSquare(square)}
          aria-label={`${square.file}${square.rank}${piece ? ` ${piece.color === Color.BLACK ? 'sente' : 'gote'} ${PIECE_CHAR[piece.type]}` : ''}`}
        >
          {piece && (
            <span className={`glyph piece ${piece.color === topColor ? 'rotated' : ''} ${piece.type.startsWith('prom') || piece.type === PieceType.HORSE || piece.type === PieceType.DRAGON ? 'promoted' : ''}`}>
              {PIECE_CHAR[piece.type]}
            </span>
          )}
          {isPromo && (
            <span className="promo-choice" onClick={(e) => e.stopPropagation()}>
              {promotion!.moves.map((m) => (
                <span key={m.usi} role="button" tabIndex={0} className="promo-option" onClick={() => play(m)} onKeyDown={(e) => e.key === 'Enter' && play(m)}>
                  {m.promote ? '成' : '不成'}
                </span>
              ))}
            </span>
          )}
        </button>,
      )
    }
  }

  const stampCell = stamp ? parseTarget(stamp.usi) : null
  const stampPos = stampCell ? cellOf(stampCell, flipped) : null

  return (
    <div className="board-wrap">
      {hand(topColor, 'top')}
      <div className="board">
        <div className="files">{Array.from({ length: 9 }, (_, i) => <span key={i}>{flipped ? i + 1 : 9 - i}</span>)}</div>
        <div className="grid-row">
          <div className="grid">
            {cells}
            <svg className="overlay" viewBox="0 0 9 9" aria-hidden="true">
              <defs>
                {arrows.map((a, i) => (
                  <marker key={i} id={`head-${i}`} markerWidth="3" markerHeight="3" refX="1.6" refY="1.5" orient="auto">
                    <path d="M0,0 L3,1.5 L0,3 z" fill={a.color} />
                  </marker>
                ))}
              </defs>
              {arrows.map((a, i) => {
                const to = parseTarget(a.usi)
                if (!to) return null
                const t = cellOf(to, flipped)
                const from = parseSource(a.usi)
                if (!from) return <circle key={i} cx={t.col + 0.5} cy={t.row + 0.5} r={0.42} fill="none" stroke={a.color} strokeWidth={0.09} opacity={0.85} />
                const f = cellOf(from, flipped)
                return (
                  <line key={i} x1={f.col + 0.5} y1={f.row + 0.5} x2={t.col + 0.5} y2={t.row + 0.5} stroke={a.color} strokeWidth={0.13} strokeLinecap="round" opacity={0.85} markerEnd={`url(#head-${i})`} />
                )
              })}
            </svg>
            {stamp && stampPos && (
              <span
                className="stamp"
                style={{ left: `${((stampPos.col + 1) / 9) * 100}%`, top: `${(stampPos.row / 9) * 100}%`, background: LABELS[stamp.label].color }}
                title={LABELS[stamp.label].text}
              >
                {LABELS[stamp.label].symbol}
              </span>
            )}
          </div>
          <div className="ranks">{Array.from({ length: 9 }, (_, i) => <span key={i}>{'一二三四五六七八九'[flipped ? 8 - i : i]}</span>)}</div>
        </div>
      </div>
      {hand(bottomColor, 'bottom')}
    </div>
  )
}
