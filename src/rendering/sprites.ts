import type { Color, PieceType } from 'tsshogi'

export const SPRITE_BOX = 1.3

export interface Baked {
  pieces: Map<string, string>
  board: string
  surface: string
  stand: string
}

export const spriteKey = (type: PieceType, color: Color, up: boolean) => `${type}${color}${up ? 'u' : 'd'}`
