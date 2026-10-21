import { Color, type Square } from 'tsshogi'
import { applyUsi, type Side } from './shogi'
import type { Score } from './engine'

export const sideMark = (side: Side | Color) => (side === 'sente' || side === Color.BLACK ? '☗' : '☖')

/** Native tooltips cannot turn a glyph with the board, so they name the sides in words. */
export const spellMarks = (text: string, lang: string) =>
  text.replace(
    /([☗☖])(\s?)/g,
    (_, mark: string, space: string) =>
      `${mark === '☗' ? (lang === 'ja' ? '先手' : 'Sente') : lang === 'ja' ? '後手' : 'Gote'}${space || (lang === 'ja' ? '' : ' ')}`,
  )

export const rankKanji = (rank: number): string => {
  const digits = '一二三四五六七八九'
  if (rank < 10) return digits[rank - 1]
  const tens = Math.floor(rank / 10)
  return `${tens === 1 ? '' : digits[tens - 1]}十${rank % 10 ? digits[(rank % 10) - 1] : ''}`
}

const WESTERN_SQUARE = /(?<![\w])([1-9])([a-i])(?![\w])/g

const PIECE_KANJI: Record<string, string> = {
  P: '歩',
  L: '香',
  N: '桂',
  S: '銀',
  G: '金',
  B: '角',
  R: '飛',
  K: '玉',
  '+P': 'と',
  '+L': '成香',
  '+N': '成桂',
  '+S': '成銀',
  '+B': '馬',
  '+R': '龍',
}
const westernSquare = (file: string, rank: string) => `${file}${rankKanji('abcdefghi'.indexOf(rank) + 1)}`
// Letter shorthand: B*6e (drop), P-7e (move to), S7h–6g / R7f×7d (from to), B7g (a piece on a square).
const WESTERN_MOVE = /(?<![A-Za-z])(\+?[PLNSGBRK])(?:([*-])([1-9])([a-i])|([1-9])([a-i])(?:\s?([–×x-])\s?([1-9])([a-i])(\+)?)?)(?![\w])/g

/** Rewrites English letter notation (B7g, P5e–5d, B*6e) in Japanese style (7七角, 5五歩→5四, 6五角打). */
export const localizeMoves = (text: string) =>
  text.replace(
    WESTERN_MOVE,
    (
      _,
      piece: string,
      sep: string | undefined,
      f: string | undefined,
      r: string | undefined,
      ff: string | undefined,
      fr: string | undefined,
      arrow: string | undefined,
      tf: string | undefined,
      tr: string | undefined,
      promote: string | undefined,
    ) => {
      const kanji = PIECE_KANJI[piece] ?? piece
      if (sep) return `${westernSquare(f!, r!)}${kanji}${sep === '*' ? '打' : ''}`
      const from = `${westernSquare(ff!, fr!)}${kanji}`
      return tf ? `${from}${arrow === '×' || arrow === 'x' ? '×' : '→'}${westernSquare(tf, tr!)}${promote ? '成' : ''}` : from
    },
  )

/** English lessons were written with letter ranks (7f); show squares the way the board and move text do (7六). */
export const localizeSquares = (text: string) => localizeMoves(text).replace(WESTERN_SQUARE, (_, file: string, rank: string) => westernSquare(file, rank))

/** Applies localizeSquares to every English string (keys `en` / `*En`) in loaded lesson data. */
export function localizeEnglish<T>(value: T, key = ''): T {
  if (typeof value === 'string') return (key === 'en' || key.endsWith('En') ? localizeSquares(value) : value) as T
  if (Array.isArray(value)) return value.map((item) => localizeEnglish(item, key)) as T
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localizeEnglish(v, k)])) as T
  return value
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
