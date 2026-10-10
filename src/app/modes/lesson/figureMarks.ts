import { Square } from 'tsshogi'
import type { SourceMarks } from '@/app/hooks/useBoardSession'
import type { LessonFigure } from '@/utils/curriculum'

const tile = (usi: string, color: number, opacity: number) => {
  const square = Square.newByUSI(usi)
  return square ? [{ square, color, opacity }] : []
}

const DIGITS = '１２３４５６７８９'
const RANKS = '一二三四五六七八九'
export const mentionedSquares = (text: string) => [
  ...new Set(
    [...text.matchAll(/([1-9１-９])([一二三四五六七八九])/g)].map(
      ([, file, rank]) => `${DIGITS.includes(file) ? DIGITS.indexOf(file) + 1 : file}${'abcdefghi'[RANKS.indexOf(rank)]}`,
    ),
  ),
]

export function figureMarks(figures: LessonFigure[], sfen: string, showLast: boolean, text = ''): SourceMarks {
  const marks = Object.assign({}, ...figures.map((figure) => figure.marks ?? {})) as NonNullable<LessonFigure['marks']>
  return {
    at: sfen.split(' ')[0],
    arrows: (marks.arrows ?? []).map((usi) => ({ usi, color: '#2f5d9b' })),
    heat: [
      ...(showLast && marks.last ? tile(marks.last, 0xf1c27a, 0.55) : []),
      ...(marks.ghosts ?? []).flatMap((usi) => tile(usi, 0x857a6b, 0.35)),
      ...(marks.boxes ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.4)),
      ...(marks.dashed ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.15)),
      ...mentionedSquares(text).flatMap((usi) => tile(usi, 0xe0b84a, 0.3)),
    ],
    illustration: figures.find((figure) => figure.crop || figure.pieces),
  }
}
