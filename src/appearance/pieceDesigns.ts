import { PIECE_SETS, type PieceSet } from './pieceSets'
import type { PieceAppearance } from './settings'

type PieceDesign = { key: PieceSet; label: string; patch: PieceAppearance }

const design = (key: PieceSet, patch: PieceAppearance = {}): PieceDesign => ({ key, label: PIECE_SETS[key].label, patch: { pieceSet: key, pieceStyle: 'one', pieceGuide: 'none', pieceMaterial: 'satsuma', pieceColor: 'natural', pieceGrain: 'masame', pieceFinish: 'oshi', ...patch } })

export const LISHOGI_DESIGNS: PieceDesign[] = [
  design('ryoko_1kanji'),
  design('kanji_light', { pieceColor: 'light', pieceMaterial: 'plastic' }),
  design('kanji_brown', { pieceMaterial: 'sham' }),
  design('orangain', { pieceStyle: 'two', pieceColor: 'light' }),
  design('kanji_red_wood', { pieceColor: 'mahogany', pieceGrain: 'root' }),
  design('portella', { pieceFinish: 'moriage' }),
  design('portella_2kanji', { pieceStyle: 'two', pieceFinish: 'moriage' }),
  design('1kanji_3d'),
  design('2kanji_3d', { pieceStyle: 'two' }),
  design('dewitt_1kanji', { pieceColor: 'light', pieceMaterial: 'plastic' }),
  design('dewitt_2kanji', { pieceStyle: 'two', pieceColor: 'light', pieceMaterial: 'plastic' }),
  design('hitomoji'),
  design('shogi_cz', { pieceGrain: 'itame' }),
  design('shogi_bnw', { pieceColor: 'dark', pieceMaterial: 'plastic' }),
  design('glass', { pieceColor: 'light', pieceMaterial: 'glass' }),
  design('simple_kanji', { pieceColor: 'light', pieceMaterial: 'plastic' }),
  design('pixel', { pieceMaterial: 'plastic' }),
]

export const PIECE_FACE_PAIRS: Partial<Record<PieceSet, [PieceSet, PieceSet]>> = {
  sunfish_hitomoji: ['sunfish_hitomoji', 'sunfish_futamoji'],
  kaishoa_one: ['kaishoa_one', 'kaishoa_two'],
  '1kanji_3d': ['1kanji_3d', '2kanji_3d'],
  dewitt_1kanji: ['dewitt_1kanji', 'dewitt_2kanji'],
  portella: ['portella', 'portella_2kanji'],
}

const FAMILY_ALIASES: Partial<Record<PieceSet, PieceSet>> = { kanji_light: 'kanji_brown', kanji_red_wood: 'kanji_brown', broadcast: 'letters', sunfish_wood: 'sunfish_hitomoji', sunfish_dark: 'sunfish_hitomoji', sunfish_gothic_dark: 'sunfish_gothic', dewitt_czech: 'dewitt_1kanji', shogi_fcz: 'shogi_cz', engraved_cz_bnw: 'shogi_cz', engraved_cz: 'shogi_cz', kanji_guide_shadowed: 'kanji_brown', valdivia: 'kanji_brown', vald_opt: 'kanji_brown', glass: 'kanji_brown' }

export const pieceFamily = (set: PieceSet): PieceSet => Object.values(PIECE_FACE_PAIRS).find((pair) => pair?.includes(set))?.[0] ?? FAMILY_ALIASES[set] ?? set
export const pieceSetForFace = (set: PieceSet, style: 'one' | 'two') => PIECE_FACE_PAIRS[set]?.[style === 'one' ? 0 : 1] ?? set

export const PIECE_TYPEFACES: PieceSet[] = [...new Set<PieceSet>(['letters', ...LISHOGI_DESIGNS.map((design) => pieceFamily(design.key)), 'sunfish_hitomoji', 'sunfish_gothic', 'kaishoa_one'])].filter((set) => set !== 'glass')
