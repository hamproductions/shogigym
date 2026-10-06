import type { Color, PieceType } from 'tsshogi'

export const SPRITE_BOX = 1.3

export type Baked = { pieces: Map<string, string>; board: string; surface: string; stand: string }

export const spriteKey = (type: PieceType, color: Color, up: boolean) => `${type}${color}${up ? 'u' : 'd'}`

export type PromotionAtlas = { image: string; types: PieceType[]; columns: number; rows: number }
