import { Square } from 'tsshogi'
import type { SourceMarks } from '@/app/hooks/useBoardSession'
import type { LessonFigure } from '@/utils/curriculum'

const tile = (usi: string, color: number, opacity: number) => {
  const square = Square.newByUSI(usi)
  return square ? [{ square, color, opacity }] : []
}

export function figureMarks(figures: LessonFigure[], sfen: string, showLast: boolean): SourceMarks {
  const marks = Object.assign({}, ...figures.map((figure) => figure.marks ?? {})) as NonNullable<LessonFigure['marks']>
  return {
    at: sfen.split(' ')[0],
    arrows: (marks.arrows ?? []).map((usi) => ({ usi, color: '#2f5d9b' })),
    heat: [
      ...(showLast && marks.last ? tile(marks.last, 0xf1c27a, 0.55) : []),
      ...(marks.ghosts ?? []).flatMap((usi) => tile(usi, 0x857a6b, 0.35)),
      ...(marks.boxes ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.4)),
      ...(marks.dashed ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.15)),
    ],
    illustration: figures.find((figure) => figure.crop || figure.pieces),
  }
}
