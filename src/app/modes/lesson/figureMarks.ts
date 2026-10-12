import { Square } from 'tsshogi'
import type { SourceMarks } from '@/app/hooks/useBoardSession'
import type { LessonFigure } from '@/utils/curriculum'

export const MENTION_OPACITY = 0.38
/** One colour per distinct mentioned square, in order of first mention, shared by board tiles, arrows and text. */
export const MENTION_COLORS = [0xe0b84a, 0x4aa3d9, 0xd9644a, 0x6bbf59, 0xa66bd9, 0xe08ab4, 0x3fbfae, 0xb08a4a, 0x8c8c99]
export const mentionColor = (squares: string[], usi: string) => {
  const at = squares.indexOf(usi)
  return at < 0 ? undefined : MENTION_COLORS[at % MENTION_COLORS.length]
}

const tile = (usi: string, color: number, opacity: number) => {
  const square = Square.newByUSI(usi)
  return square ? [{ square, color, opacity }] : []
}

const DIGITS = '１２３４５６７８９'
const RANKS = '一二三四五六七八九'
const SQUARE = /([1-9１-９])([一二三四五六七八九])|(?<![\w])([1-9])([a-i])(?![\w])/g
const usiOf = ([, file, rank, enFile, enRank]: RegExpMatchArray) =>
  enFile ? `${enFile}${enRank}` : `${DIGITS.includes(file) ? DIGITS.indexOf(file) + 1 : file}${'abcdefghi'[RANKS.indexOf(rank)]}`

/** Splits text into plain strings and `{ square }` parts for each mentioned square (７六 or 7f). */
export const squareParts = (text: string) => {
  const parts: (string | { text: string; square: string })[] = []
  let at = 0
  for (const match of text.matchAll(SQUARE)) {
    if (match.index > at) parts.push(text.slice(at, match.index))
    parts.push({ text: match[0], square: usiOf(match) })
    at = match.index + match[0].length
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}

export const mentionedSquares = (text: string) => [...new Set([...text.matchAll(SQUARE)].map(usiOf))]

export function figureMarks(figures: LessonFigure[], sfen: string, showLast: boolean, text = ''): SourceMarks {
  const mentioned = mentionedSquares(text)
  const marks = Object.assign({}, ...figures.map((figure) => figure.marks ?? {})) as NonNullable<LessonFigure['marks']>
  return {
    at: sfen.split(' ')[0],
    arrows: (marks.arrows ?? []).map((usi) => {
      const tint = mentionColor(mentioned, usi.slice(2, 4))
      return { usi, color: tint === undefined ? '#2f5d9b' : `#${tint.toString(16).padStart(6, '0')}` }
    }),
    heat: [
      ...(showLast && marks.last ? tile(marks.last, 0xf1c27a, 0.55) : []),
      ...(marks.ghosts ?? []).flatMap((usi) => tile(usi, 0x857a6b, 0.35)),
      ...(marks.boxes ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.4)),
      ...(marks.dashed ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.15)),
      ...mentioned.flatMap((usi, i) => tile(usi, MENTION_COLORS[i % MENTION_COLORS.length], MENTION_OPACITY)),
    ],
    illustration: figures.find((figure) => figure.crop || figure.pieces),
  }
}
