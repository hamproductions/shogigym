import type { Color, PieceType } from 'tsshogi'
import { SPRITE_BOX, spriteKey, type Baked } from './sprites'
import { SQ_D } from '@/rendering/board3d/dimensions'

/** Flat-board units: one file is U wide, one rank CH tall; PAD frames the board in the SVG. */
export const U = 100
export const CH = SQ_D * U
export const PAD = 0.08 * U
export const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** A baked piece sprite centred on the origin. `up` points it toward the viewer. */
export function Koma({ baked, type, color, up }: { baked: Baked; type: PieceType; color: Color; up: boolean }) {
  const size = SPRITE_BOX * U
  return <image href={baked.pieces.get(spriteKey(type, color, up))} x={-size / 2} y={-size / 2} width={size} height={size} />
}
