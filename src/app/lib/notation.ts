import { Color, type Square } from 'tsshogi'
import { applyUsi, type Side } from '../../shogi'
import type { Score } from '../../engine'

export const sideMark = (side: Side | Color) => (side === 'sente' || side === Color.BLACK ? '☗' : '☖')

const rankKanji = (rank: number) => '一二三四五六七八九'[rank - 1]

export const squareName = (square: Square) => `${square.file}${rankKanji(square.rank)}`

export const toSente = (score: Score, mover: Side): Score => (mover === 'sente' ? score : 'cp' in score ? { cp: -score.cp } : { mate: -score.mate })

export const sfenAfter = (start: string, moves: string[]) => moves.reduce((s, usi) => applyUsi(s, usi) ?? s, start)

export function clockTime(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export function savedAtLabel(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
