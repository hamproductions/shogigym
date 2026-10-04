import { Color, PieceType } from 'tsshogi'
import { PIECE_CHAR } from '../shogi'
import { SIDE_COT, TIP_SLOPE, komaWidth } from './board3d/dimensions'
import type { BoardStyle, PieceStyle } from './settings'

export type Poly = [number, number][]

export const PROMOTED = new Set([PieceType.PROM_PAWN, PieceType.PROM_LANCE, PieceType.PROM_KNIGHT, PieceType.PROM_SILVER, PieceType.HORSE, PieceType.DRAGON])

const FACE: Record<PieceType, string> = {
  [PieceType.KING]: '王将',
  [PieceType.ROOK]: '飛車',
  [PieceType.BISHOP]: '角行',
  [PieceType.GOLD]: '金将',
  [PieceType.SILVER]: '銀将',
  [PieceType.KNIGHT]: '桂馬',
  [PieceType.LANCE]: '香車',
  [PieceType.PAWN]: '歩兵',
  [PieceType.DRAGON]: '龍王',
  [PieceType.HORSE]: '龍馬',
  [PieceType.PROM_SILVER]: '成銀',
  [PieceType.PROM_KNIGHT]: '成桂',
  [PieceType.PROM_LANCE]: '成香',
  [PieceType.PROM_PAWN]: 'と金',
}

export const BOARD_TONE: Record<BoardStyle, { board: [number, number, number]; edge: [number, number, number]; line: string }> = {
  'sunfish-light': { board: [233, 214, 170], edge: [211, 191, 146], line: '#000' },
  'sunfish-warm': { board: [227, 169, 83], edge: [204, 146, 62], line: '#000' },
  'sunfish-resin': { board: [214, 155, 0], edge: [194, 135, 0], line: '#000' },
  'sunfish-dark': { board: [51, 51, 51], edge: [40, 40, 40], line: '#fff' },
  kaya: { board: [219, 170, 98], edge: [196, 146, 80], line: 'rgba(40,22,8,0.88)' },
  'shin-kaya': { board: [236, 206, 150], edge: [214, 178, 118], line: 'rgba(60,36,14,0.8)' },
  dark: { board: [150, 98, 52], edge: [112, 70, 34], line: 'rgba(250,228,190,0.7)' },
}

export function faceText(type: PieceType, color: Color, style: PieceStyle) {
  const one = style !== 'two'
  if (type === PieceType.KING && color === Color.WHITE) return one ? '玉' : '玉将'
  return one ? (type === PieceType.KING ? '王' : PIECE_CHAR[type]) : FACE[type]
}

export function piecePolygon(scale: number): Poly {
  const l = komaWidth(scale)
  const h = scale
  const xs = (l / 2 - h * SIDE_COT) / (1 - TIP_SLOPE * SIDE_COT)
  const ys = h - xs * TIP_SLOPE - h / 2
  return [
    [-l / 2, -h / 2],
    [l / 2, -h / 2],
    [xs, ys],
    [0, h / 2],
    [-xs, ys],
  ]
}

