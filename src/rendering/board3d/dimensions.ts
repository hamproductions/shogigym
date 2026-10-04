import { PieceType, Square } from 'tsshogi'
import { getSettings } from '../../appearance/settings'

export const MM_PER_SQUARE = 35.2
export const SQ_D = 38.6 / MM_PER_SQUARE
export const STAND_TOP = -8 / MM_PER_SQUARE
export const STAND_SLAB = 20 / MM_PER_SQUARE
export const STAND = 3.4
export const STRIP_W = 10
export const STRIP_D = 1.15

export function sideStandsFit(w: number, h: number) {
  setBoardDims()
  const side = Math.min(w / (2 * (HALF_W + 0.45 + STAND)), h / (2 * HALF_D + 0.6))
  const sd = w < 560 ? 0.95 : 1.15
  const strips = Math.min(w / (2 * HALF_W + (w < 560 ? 0.5 : 1.0)), h / (2 * (HALF_D + 0.3 + sd) + 0.2))
  return side >= strips * 0.97
}

export let MARGIN = 8 / MM_PER_SQUARE
export let HALF_W = 4.5 + MARGIN
export let HALF_D = 4.5 * SQ_D + MARGIN
export let CASUAL = false
export let THICK = 182 / MM_PER_SQUARE
export let LEG = 95 / MM_PER_SQUARE

export function setBoardDims() {
  const { coords, environment } = getSettings()
  MARGIN = (coords ? 26 : 8) / MM_PER_SQUARE
  HALF_W = 4.5 + MARGIN
  HALF_D = 4.5 * SQ_D + MARGIN
  CASUAL = environment === 'casual'
  THICK = (CASUAL ? 60 : 182) / MM_PER_SQUARE
  LEG = CASUAL ? 0 : 95 / MM_PER_SQUARE
}

const KOMA_MM: [PieceType[], number, number, number, number][] = [
  [[PieceType.KING], 32.5, 29.3, 9.6, 3.93],
  [[PieceType.ROOK, PieceType.BISHOP, PieceType.DRAGON, PieceType.HORSE], 31.5, 28.3, 9.3, 3.81],
  [[PieceType.GOLD, PieceType.SILVER, PieceType.PROM_SILVER], 30.5, 27.3, 9.0, 3.68],
  [[PieceType.KNIGHT, PieceType.PROM_KNIGHT], 29.5, 26.3, 8.7, 3.56],
  [[PieceType.LANCE, PieceType.PROM_LANCE], 29.5, 24.1, 8.4, 3.26],
  [[PieceType.PAWN, PieceType.PROM_PAWN], 28.3, 23.1, 8.1, 3.17],
]

const PIECE_SIZE: Partial<Record<PieceType, number>> = Object.fromEntries(KOMA_MM.flatMap(([types, h]) => types.map((t) => [t, h / MM_PER_SQUARE])))

const KOMA_DIMS = new Map(KOMA_MM.map(([, h, l, k, tip]) => [h / MM_PER_SQUARE, { w: l / MM_PER_SQUARE, t: k / MM_PER_SQUARE, taper: tip / k }]))

export const pieceScale = (type: PieceType) => PIECE_SIZE[type] ?? 0.8
export const komaWidth = (scale: number) => KOMA_DIMS.get(scale)?.w ?? scale * 0.9
export const komaDepth = (scale: number) => (KOMA_DIMS.get(scale)?.t ?? 0.28 * scale) - 0.05
export const komaTaper = (scale: number) => KOMA_DIMS.get(scale)?.taper ?? 0.41
export const SIDE_COT = 1 / Math.tan((81 * Math.PI) / 180)
export const TIP_SLOPE = Math.tan(((180 - 146) / 2 / 180) * Math.PI)

export const squareX = (file: number) => 5 - file
export const squareZ = (rank: number) => (rank - 5) * SQ_D

export function squareAt(x: number, z: number) {
  const file = 5 - Math.round(x)
  const rank = Math.round(z / SQ_D) + 5
  if (file < 1 || file > 9 || rank < 1 || rank > 9 || Math.abs(x) > 4.5 || Math.abs(z) > 4.5 * SQ_D) return null
  return new Square(file, rank)
}
