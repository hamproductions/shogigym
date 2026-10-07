import { Color, type Square } from 'tsshogi'
import { applyUsi, type Side } from './shogi'
import type { Score } from './engine'

export const sideMark = (side: Side | Color) => (side === 'sente' || side === Color.BLACK ? '☗' : '☖')

export const rankKanji = (rank: number): string => {
  const digits = '一二三四五六七八九'
  if (rank < 10) return digits[rank - 1]
  const tens = Math.floor(rank / 10)
  return `${tens === 1 ? '' : digits[tens - 1]}十${rank % 10 ? digits[(rank % 10) - 1] : ''}`
}

export const squareName = (square: Pick<Square, 'file' | 'rank'>) => `${square.file}${rankKanji(square.rank)}`

export const toSente = (score: Score, mover: Side): Score => (mover === 'sente' ? score : 'cp' in score ? { cp: -score.cp } : { mate: -score.mate })

export const sfenAfter = (start: string, moves: string[]) => moves.reduce((s, usi) => applyUsi(s, usi) ?? s, start)

export function clockTime(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export function savedAtLabel(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
