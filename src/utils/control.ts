import { Color, Square, type ImmutablePosition } from 'tsshogi'
import { sees } from '@/app/pieces'

export interface ControlCell {
  s: Square[]
  g: Square[]
}
interface HeatCell {
  square: Square
  color: number
  opacity: number
  label?: string
}

// prettier-ignore
const SENTE_BLUE = 0x1F7AE0
// prettier-ignore
const GOTE_RED = 0xD2402A
// prettier-ignore
const CONTESTED = 0x9A5AD0

export const EMPTY_CELL: ControlCell = { s: [], g: [] }

export function controlMap(sfen: string, position: ImmutablePosition) {
  const grid = new Map<string, ControlCell>()
  for (const sq of position.board.listNonEmptySquares()) {
    const piece = position.board.at(sq)!
    for (const t of sees(sfen, sq)) {
      const cell = grid.get(t.usi) ?? { s: [], g: [] }
      ;(piece.color === Color.BLACK ? cell.s : cell.g).push(sq)
      grid.set(t.usi, cell)
    }
  }
  return grid
}

const sideColor = (diff: number) => {
  if (diff > 0) return SENTE_BLUE
  return diff < 0 ? GOTE_RED : CONTESTED
}

export function controlHeat(control: Map<string, ControlCell>): HeatCell[] {
  return [...control.entries()].map(([usi, c]) => {
    const d = c.s.length - c.g.length
    return {
      square: Square.newByUSI(usi)!,
      color: sideColor(d),
      opacity: Math.min(0.42, 0.14 + 0.1 * Math.abs(d || 1)),
      label: String(Math.max(c.s.length, c.g.length) && (d === 0 ? c.s.length : Math.abs(d))),
    }
  })
}

export function focusHeat(square: Square, cell: ControlCell): HeatCell {
  return { square, color: sideColor(cell.s.length - cell.g.length), opacity: 0.35 }
}
