import { Color, PieceType, Square } from 'tsshogi'
import { positionOf } from '@/utils/shogi'
import i18n from '@/utils/i18n'

export interface Step {
  dx: number
  dy: number
  slide?: boolean
}

const KING_STEPS: Step[] = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => ({ dx, dy }))).filter((s) => s.dx || s.dy)
const GOLD_STEPS: Step[] = KING_STEPS.filter((s) => !(s.dy === 1 && s.dx !== 0))
const SILVER_STEPS: Step[] = KING_STEPS.filter((s) => !(s.dy === 0 || (s.dy === 1 && s.dx === 0)))
const ROOK_SLIDES: Step[] = [
  { dx: 0, dy: -1, slide: true },
  { dx: 0, dy: 1, slide: true },
  { dx: -1, dy: 0, slide: true },
  { dx: 1, dy: 0, slide: true },
]
const BISHOP_SLIDES: Step[] = [
  { dx: -1, dy: -1, slide: true },
  { dx: 1, dy: -1, slide: true },
  { dx: -1, dy: 1, slide: true },
  { dx: 1, dy: 1, slide: true },
]

export const PIECE_INFO: Record<PieceType, { ja: string; reading: string; en: string; moves: string; steps: Step[]; promotes?: string }> = {
  [PieceType.PAWN]: {
    ja: '歩兵',
    reading: 'fuhyō',
    en: 'Pawn',
    get moves() {
      return i18n.t('pieces.oneSquareStraightForward')
    },
    steps: [{ dx: 0, dy: -1 }],
    get promotes() {
      return i18n.t('pieces.promotesToTokinWhichMoves')
    },
  },
  [PieceType.LANCE]: {
    ja: '香車',
    reading: 'kyōsha',
    en: 'Lance',
    get moves() {
      return i18n.t('pieces.anyNumberOfSquaresStraight')
    },
    steps: [{ dx: 0, dy: -1, slide: true }],
    get promotes() {
      return i18n.t('pieces.promotesToWhichMovesLike')
    },
  },
  [PieceType.KNIGHT]: {
    ja: '桂馬',
    reading: 'keima',
    en: 'Knight',
    get moves() {
      return i18n.t('pieces.jumpsTwoSquaresForwardAnd')
    },
    steps: [
      { dx: -1, dy: -2 },
      { dx: 1, dy: -2 },
    ],
    get promotes() {
      return i18n.t('pieces.promotesToWhichMovesLike2')
    },
  },
  [PieceType.SILVER]: {
    ja: '銀将',
    reading: 'ginshō',
    en: 'Silver general',
    get moves() {
      return i18n.t('pieces.oneSquareForwardOrOne')
    },
    steps: SILVER_STEPS,
    get promotes() {
      return i18n.t('pieces.promotesToWhichMovesLike3')
    },
  },
  [PieceType.GOLD]: {
    ja: '金将',
    reading: 'kinshō',
    en: 'Gold general',
    get moves() {
      return i18n.t('pieces.oneSquareInAnyDirection')
    },
    steps: GOLD_STEPS,
  },
  [PieceType.BISHOP]: {
    ja: '角行',
    reading: 'kakugyō',
    en: 'Bishop',
    get moves() {
      return i18n.t('pieces.anyNumberOfSquaresDiagonally')
    },
    steps: BISHOP_SLIDES,
    get promotes() {
      return i18n.t('pieces.promotesToHorseABishop')
    },
  },
  [PieceType.ROOK]: {
    ja: '飛車',
    reading: 'hisha',
    en: 'Rook',
    get moves() {
      return i18n.t('pieces.anyNumberOfSquaresUp')
    },
    steps: ROOK_SLIDES,
    get promotes() {
      return i18n.t('pieces.promotesToDragonARook')
    },
  },
  [PieceType.KING]: {
    ja: '玉将',
    reading: 'gyokushō',
    en: 'King',
    get moves() {
      return i18n.t('pieces.oneSquareInAnyDirection2')
    },
    steps: KING_STEPS,
  },
  [PieceType.PROM_PAWN]: {
    ja: 'と金',
    reading: 'tokin',
    en: 'Promoted pawn',
    get moves() {
      return i18n.t('pieces.movesLikeAGoldIf')
    },
    steps: GOLD_STEPS,
  },
  [PieceType.PROM_LANCE]: {
    ja: '成香',
    reading: 'narikyō',
    en: 'Promoted lance',
    get moves() {
      return i18n.t('pieces.movesLikeAGold')
    },
    steps: GOLD_STEPS,
  },
  [PieceType.PROM_KNIGHT]: {
    ja: '成桂',
    reading: 'narikei',
    en: 'Promoted knight',
    get moves() {
      return i18n.t('pieces.movesLikeAGold')
    },
    steps: GOLD_STEPS,
  },
  [PieceType.PROM_SILVER]: {
    ja: '成銀',
    reading: 'narigin',
    en: 'Promoted silver',
    get moves() {
      return i18n.t('pieces.movesLikeAGold')
    },
    steps: GOLD_STEPS,
  },
  [PieceType.HORSE]: {
    ja: '龍馬',
    reading: 'ryūma',
    en: 'Horse (promoted bishop)',
    get moves() {
      return i18n.t('pieces.anyNumberOfSquaresDiagonally2')
    },
    steps: [...BISHOP_SLIDES, ...ROOK_SLIDES.map((s) => ({ dx: s.dx, dy: s.dy }))],
  },
  [PieceType.DRAGON]: {
    ja: '龍王',
    reading: 'ryūō',
    en: 'Dragon (promoted rook)',
    get moves() {
      return i18n.t('pieces.anyNumberOfSquaresUp2')
    },
    steps: [...ROOK_SLIDES, ...BISHOP_SLIDES.map((s) => ({ dx: s.dx, dy: s.dy }))],
  },
}

const FILE = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const RANK = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

export function moveGloss(sfen: string, usi: string): string {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return ''
  const to = `${FILE[move.to.file]}${RANK[move.to.rank]}`
  const piece = PIECE_INFO[move.pieceType]
  if (!(move.from instanceof Square)) return i18n.t('pieces.glossDrop', { pieceEn: piece.en.toLowerCase(), pieceJa: piece.ja, to })
  const taken = move.capturedPieceType !== null && move.capturedPieceType !== undefined ? PIECE_INFO[move.capturedPieceType] : null
  return (
    i18n.t('pieces.glossMove', { pieceEn: piece.en, pieceJa: piece.ja, to }) +
    (taken ? i18n.t('pieces.glossCapture', { takenEn: taken.en.toLowerCase(), takenJa: taken.ja }) : '') +
    (move.promote ? i18n.t('pieces.glossPromote') : '')
  )
}

export function sees(sfen: string, square: Square): Square[] {
  const position = positionOf(sfen)
  const piece = position.board.at(square)
  if (!piece) return []
  const dir = piece.color === Color.BLACK ? 1 : -1
  const out: Square[] = []
  for (const step of PIECE_INFO[piece.type].steps) {
    let { file } = square
    let { rank } = square
    for (;;) {
      file -= step.dx * dir
      rank += step.dy * dir
      if (file < 1 || file > 9 || rank < 1 || rank > 9) break
      const to = new Square(file, rank)
      out.push(to)
      if (!step.slide || position.board.at(to)) break
    }
  }
  return out
}
