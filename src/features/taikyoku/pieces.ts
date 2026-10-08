import { Color, PieceType } from 'tsshogi'
import { pieceScale } from '@/rendering/board3d/dimensions'
import type { CustomFace } from '@/rendering/board3d/piece'
import { catalog, type Side } from './notation'

const types: Record<string, PieceType> = {
  王将: PieceType.KING,
  玉将: PieceType.KING,
  飛車: PieceType.ROOK,
  角行: PieceType.BISHOP,
  金将: PieceType.GOLD,
  銀将: PieceType.SILVER,
  桂馬: PieceType.KNIGHT,
  香車: PieceType.LANCE,
  歩兵: PieceType.PAWN,
  龍王: PieceType.DRAGON,
  龍馬: PieceType.HORSE,
}

export function taikyokuPiece(key: string, side: Side) {
  const info = catalog[key]
  const text = (side === 'w' && info?.k2) || info?.k || ''
  const type = types[text] ?? PieceType.PAWN
  const color = side === 'b' ? Color.BLACK : Color.WHITE
  const base = catalog[key.replace(/^\+/, '')]?.k ?? ''
  const face: CustomFace = { text, promoted: key.startsWith('+'), code: key, scale: pieceScale(types[base] ?? PieceType.PAWN), relief: false }
  return { type, color, face }
}
