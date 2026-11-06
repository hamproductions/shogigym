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
const SAME_SQUARE = /同(成香|成桂|成銀|歩|香|桂|銀|金|角|飛|玉|王|と|馬|龍|竜)(打|不成|成)?/g
export type MentionMove = { sfen: string; usi: string }
type SquarePart = { text: string; square: string; piece?: string; suffix?: string; move: boolean }
const usiOf = ([, file, rank, enFile, enRank]: RegExpMatchArray) =>
  enFile ? `${enFile}${enRank}` : `${DIGITS.includes(file) ? DIGITS.indexOf(file) + 1 : file}${'abcdefghi'[RANKS.indexOf(rank)]}`

const sameParts = (text: string) =>
  [...text.matchAll(SAME_SQUARE)].map((match) => ({
    text: match[0],
    index: match.index,
    piece: match[1],
    suffix: match[2],
  }))

const occurrences = (text: string, part: string) => {
  const indexes: number[] = []
  for (let index = text.indexOf(part); index >= 0; index = text.indexOf(part, index + 1)) indexes.push(index)
  return indexes
}

const contextOffsets = (text: string, context: string) => (context.includes(text) ? occurrences(context, text) : [context.length + 1])
const contextText = (text: string, context: string) => (context.includes(text) ? context : `${context}\n${text}`)

const precedingSquare = (text: string, index: number) => {
  let square: string | undefined
  for (const match of text.slice(0, index).matchAll(SQUARE)) square = usiOf(match)
  return square
}

const sameSquareAt = (text: string, context: string, index: number) => {
  const source = contextText(text, context)
  const squares = new Set(contextOffsets(text, context).map((offset) => precedingSquare(source, offset + index)))
  return squares.size === 1 ? [...squares][0] : undefined
}

const isMoveText = (prefix: string, suffix: string | undefined, after: string) =>
  !!suffix || /[▲△☗☖]\s*$/.test(prefix) || /^(で|と(?:指|進|跳|打|寄|引|動|逃|取|突|され))/.test(after)

/** Splits text into plain strings and `{ square }` parts for each mentioned square (７六 or 7f). */
export const squareParts = (text: string, context = text) => {
  const contextual = contextText(text, context)
  const offsets = contextOffsets(text, context)
  const annotated: { text: string; index: number; square: string; piece?: string; suffix?: string; move: boolean }[] = []
  for (const match of text.matchAll(SQUARE)) {
    const piece = text.slice(match.index + match[0].length).match(PIECE)
    const after = text.slice(match.index + match[0].length + (piece?.[0].length ?? 0))
    const move = !!piece && isMoveText(text.slice(0, match.index), piece[2], after)
    annotated.push({
      text: match[0] + (piece?.[0] ?? ''),
      index: match.index,
      square: usiOf(match),
      piece: piece?.[1],
      suffix: piece?.[2],
      move,
    })
  }
  for (const part of sameParts(text)) {
    const square = sameSquareAt(text, context, part.index)
    if (!square) continue
    const after = text.slice(part.index + part.text.length)
    const move = offsets.some((at) => isMoveText(contextual.slice(0, at + part.index), part.suffix, after))
    annotated.push({ text: part.text, index: part.index, square, piece: part.piece, suffix: part.suffix, move })
  }
  annotated.sort((a, b) => a.index - b.index)
  const parts: (string | SquarePart)[] = []
  let at = 0
  for (const part of annotated) {
    if (part.index > at) parts.push(text.slice(at, part.index))
    parts.push(part)
    at = part.index + part.text.length
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}

export const mentionedSquares = (text: string, context = text) => {
  const source = contextText(text, context)
  const squares = [...source.matchAll(SQUARE)].map(usiOf)
  for (const part of sameParts(source)) {
    const after = source.slice(part.index + part.text.length)
    const prefix = source.slice(0, part.index)
    if (!isMoveText(prefix, part.suffix, after)) continue
    const square = precedingSquare(source, part.index)
    if (square) squares.push(square)
  }
  return [...new Set(squares)]
}

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
  const marks = Object.assign({}, ...figures.map((figure) => figure.marks ?? {})) as NonNullable<LessonFigure['marks']>
  const heat = [
    ...(showLast && marks.last ? tile(marks.last, 0xf1c27a, 0.55) : []),
    ...(marks.ghosts ?? []).flatMap((usi) => tile(usi, 0x857a6b, 0.35)),
    ...(marks.boxes ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.4)),
    ...(marks.dashed ?? []).flatMap((usi) => tile(usi, 0xc4442a, 0.15)),
    ...mentioned.flatMap((usi) => tile(usi, mentionColor(mentioned, usi)!, MENTION_OPACITY)),
  ]
  return {
    at: sfen.split(' ')[0],
    arrows: [
      ...(marks.arrows ?? []).map((usi) => {
        const tint = mentionColor(mentioned, usi.slice(2, 4))
        return { usi, color: tint === undefined ? '#2f5d9b' : `#${tint.toString(16).padStart(6, '0')}` }
      }),
      ...references,
    ],
    heat: [...new Map(heat.map((entry) => [entry.square.usi, entry])).values()],
    illustration: figures.find((figure) => figure.crop || figure.pieces),
  }
}
