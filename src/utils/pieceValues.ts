import { PieceType } from 'tsshogi'
import { PIECE_CHAR } from './shogi'
import i18n from './i18n'

export const PIECE_VALUE: Record<PieceType, number> = {
  [PieceType.PAWN]: 1,
  [PieceType.LANCE]: 3,
  [PieceType.KNIGHT]: 4,
  [PieceType.SILVER]: 5,
  [PieceType.GOLD]: 6,
  [PieceType.BISHOP]: 8,
  [PieceType.ROOK]: 10,
  [PieceType.KING]: 100,
  [PieceType.PROM_PAWN]: 7,
  [PieceType.PROM_LANCE]: 6,
  [PieceType.PROM_KNIGHT]: 6,
  [PieceType.PROM_SILVER]: 6,
  [PieceType.HORSE]: 10,
  [PieceType.DRAGON]: 12,
}

const PIECE_EN: Record<PieceType, string> = {
  [PieceType.PAWN]: 'pawn',
  [PieceType.LANCE]: 'lance',
  [PieceType.KNIGHT]: 'knight',
  [PieceType.SILVER]: 'silver',
  [PieceType.GOLD]: 'gold',
  [PieceType.BISHOP]: 'bishop',
  [PieceType.ROOK]: 'rook',
  [PieceType.KING]: 'king',
  [PieceType.PROM_PAWN]: 'tokin',
  [PieceType.PROM_LANCE]: 'promoted lance',
  [PieceType.PROM_KNIGHT]: 'promoted knight',
  [PieceType.PROM_SILVER]: 'promoted silver',
  [PieceType.HORSE]: 'horse',
  [PieceType.DRAGON]: 'dragon',
}

export const pieceName = (type: PieceType) => (i18n.language === 'ja' ? PIECE_CHAR[type] : PIECE_EN[type])
