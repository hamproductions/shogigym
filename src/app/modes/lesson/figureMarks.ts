import { Position, Square } from 'tsshogi'
import { PIECE_CHAR } from '@/utils/shogi'
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
const PIECE = /^(成香|成桂|成銀|歩|香|桂|銀|金|角|飛|玉|王|と|馬|龍|竜)(打|不成|成)?/
export type MentionMove = { sfen: string; usi: string }
const usiOf = ([, file, rank, enFile, enRank]: RegExpMatchArray) =>
  enFile ? `${enFile}${enRank}` : `${DIGITS.includes(file) ? DIGITS.indexOf(file) + 1 : file}${'abcdefghi'[RANKS.indexOf(rank)]}`

/** Splits text into plain strings and `{ square }` parts for each mentioned square (７六 or 7f). */
export const squareParts = (text: string) => {
  const parts: (string | { text: string; square: string; piece?: string; suffix?: string; move: boolean })[] = []
  let at = 0
  for (const match of text.matchAll(SQUARE)) {
    if (match.index > at) parts.push(text.slice(at, match.index))
    const piece = text.slice(match.index + match[0].length).match(PIECE)
    const after = text.slice(match.index + match[0].length + (piece?.[0].length ?? 0))
    const move = !!piece && (!!piece[2] || /[▲△☗☖]\s*$/.test(text.slice(0, match.index)) || /^(で|と(?:指|進|跳|打|寄|引|動|逃|取|突|され))/.test(after))
    parts.push({ text: match[0] + (piece?.[0] ?? ''), square: usiOf(match), piece: piece?.[1], suffix: piece?.[2], move })
    at = match.index + match[0].length + (piece?.[0].length ?? 0)
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}

export const mentionedSquares = (text: string) => [...new Set([...text.matchAll(SQUARE)].map(usiOf))]

export function figureMarks(figures: LessonFigure[], sfen: string, showLast: boolean, text = '', moves: MentionMove[] = []): SourceMarks {
  const mentioned = mentionedSquares(text)
  const parts = squareParts(text).filter((part) => typeof part !== 'string')
  const references = parts.flatMap((part) => {
    if (!part.move || !part.piece) return []
    const piece = part.piece.replace('王', '玉').replace('竜', '龍')
    const move = moves.find(({ sfen: before, usi }) => {
      if (usi.slice(2, 4) !== part.square || (part.suffix === '打' && usi[1] !== '*')) return false
      if (part.suffix === '成' && !usi.endsWith('+')) return false
      if (part.suffix === '不成' && usi.endsWith('+')) return false
      const candidate = Position.newBySFEN(before)?.createMoveByUSI(usi)
      return candidate && PIECE_CHAR[candidate.pieceType] === piece
    })
    if (!move) return []
    const tint = mentionColor(mentioned, part.square)!
    return [{ usi: move.usi, color: `#${tint.toString(16).padStart(6, '0')}`, dashed: move.sfen.split(' ')[0] !== sfen.split(' ')[0], square: part.square }]
  })
  const squares = [...new Set(parts.filter((part) => !part.piece || !references.some((move) => move.square === part.square)).map((part) => part.square))]
  const marks = Object.assign({}, ...figures.map((figure) => figure.marks ?? {})) as NonNullable<LessonFigure['marks']>
  return {
    at: sfen.split(' ')[0],
    arrows: [
      ...(marks.arrows ?? []).map((usi) => {
        const tint = mentionColor(mentioned, usi.slice(2, 4))
        return { usi, color: tint === undefined ? '#2f5d9b' : `#${tint.toString(16).padStart(6, '0')}` }
      }),
      ...references,
    ],
    heat: [
      ...(showLast && marks.last ? tile(marks.last, 0xf1c27a, 0.55) : []),
      ...(marks.ghosts ?? []).flatMap((usi) => tile(usi, 0x857a6b, 0.35)),
      ...(marks.boxes ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.4)),
      ...(marks.dashed ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.15)),
      ...squares.flatMap((usi) => tile(usi, mentionColor(mentioned, usi)!, MENTION_OPACITY)),
    ],
    illustration: figures.find((figure) => figure.crop || figure.pieces),
  }
}
