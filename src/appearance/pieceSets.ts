import { Color, PieceType } from 'tsshogi'
import i18n from '@/utils/i18n'
import type { PieceGuide } from './settings'

export type PieceSet =
  | 'letters'
  | 'broadcast'
  | 'ryoko_1kanji'
  | 'kanji_brown'
  | 'kanji_light'
  | 'sunfish_futamoji'
  | 'sunfish_hitomoji'
  | 'sunfish_wood'
  | 'sunfish_gothic'
  | 'sunfish_dark'
  | 'sunfish_gothic_dark'
  | 'kaishoa_one'
  | 'kaishoa_two'
  | '1kanji_3d'
  | '2kanji_3d'
  | 'simple_kanji'
  | 'orangain'
  | 'kanji_red_wood'
  | 'portella'
  | 'portella_2kanji'
  | 'dewitt_1kanji'
  | 'dewitt_2kanji'
  | 'dewitt_czech'
  | 'hitomoji'
  | 'shogi_cz'
  | 'shogi_fcz'
  | 'engraved_cz'
  | 'engraved_cz_bnw'
  | 'kanji_guide_shadowed'
  | 'valdivia'
  | 'vald_opt'
  | 'shogi_bnw'
  | 'glass'
  | 'pixel'

export const PIECE_SETS: Record<PieceSet, { label: string; credit?: string; inkOnly?: boolean; tone?: [number, number, number] }> = {
  letters: {
    get label() {
      return i18n.t('pieceSets.drawnLetters')
    },
  },
  broadcast: {
    get label() {
      return i18n.t('settings.broadcast')
    },
  },
  '1kanji_3d': { label: 'Lishogi Kanji', credit: 'Little-Mage and CouchTomato87 (Lishogi), CC BY 4.0', inkOnly: true },
  '2kanji_3d': { label: 'Lishogi Kanji · Two characters', credit: 'Little-Mage and orangain (Lishogi), CC BY-SA 3.0', inkOnly: true },
  simple_kanji: { label: 'Simple Kanji', credit: 'Ka-hu (Lishogi), CC BY 4.0', inkOnly: true },
  orangain: { label: 'Orangain', credit: 'orangain (Lishogi), CC BY-SA 3.0', inkOnly: true },
  kanji_red_wood: { label: 'Ka-hu · Red wood', credit: 'Ka-hu (Lishogi), CC BY 4.0', inkOnly: true },
  portella: { label: 'Portella', credit: 'Portella (Lishogi), CC BY-NC-SA 4.0', inkOnly: true },
  portella_2kanji: { label: 'Portella · Two characters', credit: 'Portella (Lishogi), CC BY-NC-SA 4.0', inkOnly: true },
  dewitt_1kanji: { label: 'Dewitt', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  dewitt_2kanji: { label: 'Dewitt · Two characters', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  dewitt_czech: { label: 'Dewitt · Czech guide', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  hitomoji: { label: 'Hitomoji', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  shogi_cz: { label: 'Shogi.cz', credit: 'shogi.cz (Lishogi), CC BY-SA 4.0', inkOnly: true },
  shogi_fcz: { label: 'Shogi.cz · Flat guide', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  engraved_cz: { label: 'Shogi.cz', credit: 'ddeo604 (Lishogi), CC BY-SA 4.0', inkOnly: true },
  engraved_cz_bnw: { label: 'Shogi.cz', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  kanji_guide_shadowed: { label: 'Kanji · Guide', credit: 'CouchTomato87 (Lishogi), CC BY 4.0', inkOnly: true },
  valdivia: { label: 'Valdivia', credit: 'Kleffa (Lishogi), CC BY-SA 4.0', inkOnly: true },
  vald_opt: { label: 'Valdivia · Alternate', credit: 'Kleffa (Lishogi), CC BY-SA 4.0', inkOnly: true },
  shogi_bnw: { label: 'Shogi · Dark', credit: 'visualdenniss (Lishogi), CC BY-SA 4.0', inkOnly: true },
  glass: { label: 'Glass', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  pixel: { label: 'Pixel', credit: 'Lishogi, AGPL-3.0-or-later', inkOnly: true },
  ryoko_1kanji: {
    get label() {
      return i18n.t('pieceSets.ryoko')
    },
    credit: 'Ryoko_1Kanji by nexxogen (lishogi), CC BY-SA 4.0',
  },
  kanji_brown: {
    get label() {
      return i18n.t('pieceSets.brown')
    },
    credit: 'kanji_brown by Ka-hu (lishogi), CC BY 4.0',
  },
  kanji_light: {
    get label() {
      return i18n.t('pieceSets.light')
    },
    credit: 'kanji_light by Ka-hu (lishogi), CC BY 4.0',
  },
  sunfish_futamoji: {
    get label() {
      return i18n.language.startsWith('ja') ? '二文字' : 'Sunfish · Two characters'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
  },
  sunfish_hitomoji: {
    get label() {
      return i18n.language.startsWith('ja') ? '一文字' : 'Sunfish · One character'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
  },
  sunfish_wood: {
    get label() {
      return i18n.language.startsWith('ja') ? '木目' : 'Sunfish · Wood grain'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
  },
  sunfish_gothic: {
    get label() {
      return i18n.language.startsWith('ja') ? 'ゴシック' : 'Sunfish · Gothic'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
  },
  sunfish_dark: {
    get label() {
      return i18n.language.startsWith('ja') ? 'ダーク' : 'Sunfish · Dark'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
    tone: [48, 48, 48],
  },
  sunfish_gothic_dark: {
    get label() {
      return i18n.language.startsWith('ja') ? 'ゴシック・ダーク' : 'Sunfish · Gothic dark'
    },
    credit: 'Shogi Images by Sunfish Shogi, CC0',
    inkOnly: true,
    tone: [48, 48, 48],
  },
  kaishoa_one: {
    get label() {
      return i18n.language.startsWith('ja') ? '楷書A・一字' : 'Kaisho A · One character'
    },
    credit: 'Kaisho A by Zahajki, CC0',
    inkOnly: true,
  },
  kaishoa_two: {
    get label() {
      return i18n.language.startsWith('ja') ? '楷書A・二字' : 'Kaisho A · Two characters'
    },
    credit: 'Kaisho A by Zahajki, CC0',
    inkOnly: true,
  },
}

const GLYPH_SOURCE: Partial<Record<PieceSet, PieceSet>> = {
  kanji_light: 'kanji_brown',
  kanji_red_wood: 'kanji_brown',
  sunfish_wood: 'sunfish_hitomoji',
  sunfish_dark: 'sunfish_hitomoji',
  sunfish_gothic_dark: 'sunfish_gothic',
  dewitt_czech: 'dewitt_1kanji',
  shogi_fcz: 'shogi_cz',
  engraved_cz: 'shogi_cz',
  engraved_cz_bnw: 'shogi_cz',
  kanji_guide_shadowed: 'kanji_brown',
  valdivia: 'kanji_brown',
  vald_opt: 'kanji_brown',
  glass: 'kanji_brown',
}
const glyphSource = (set: PieceSet) => GLYPH_SOURCE[set] ?? set
export const twoCharacterGlyph = (set: PieceSet) =>
  new Set<PieceSet>(['sunfish_futamoji', 'kaishoa_two', '2kanji_3d', 'orangain', 'dewitt_2kanji', 'portella_2kanji']).has(glyphSource(set))

const CODE: Record<PieceType, string> = {
  [PieceType.PAWN]: 'FU',
  [PieceType.LANCE]: 'KY',
  [PieceType.KNIGHT]: 'KE',
  [PieceType.SILVER]: 'GI',
  [PieceType.GOLD]: 'KI',
  [PieceType.BISHOP]: 'KA',
  [PieceType.ROOK]: 'HI',
  [PieceType.KING]: 'OU',
  [PieceType.PROM_PAWN]: 'TO',
  [PieceType.PROM_LANCE]: 'NY',
  [PieceType.PROM_KNIGHT]: 'NK',
  [PieceType.PROM_SILVER]: 'NG',
  [PieceType.HORSE]: 'UM',
  [PieceType.DRAGON]: 'RY',
}

export const pieceCode = (type: PieceType, color: Color) => (type === PieceType.KING && color === Color.WHITE ? 'GY' : CODE[type])

export interface LoadedPiece {
  canvas: HTMLCanvasElement
  code: string
  size: number
}

export const GUIDE_SETS = new Set<PieceSet>([
  'dewitt_czech',
  'shogi_cz',
  'shogi_fcz',
  'engraved_cz',
  'engraved_cz_bnw',
  'kanji_guide_shadowed',
  'valdivia',
  'vald_opt',
])

const loaded = new Map<string, LoadedPiece>()
const guides = new Map<string, HTMLCanvasElement>()
export const loadedGuide = (code: string, guide: PieceGuide) => guides.get(`${code}/${guide}`)

export const loadedPiece = (set: PieceSet, code: string) => loaded.get(`${glyphSource(set)}/${code}`)

export const pieceGlyphUrl = (set: PieceSet, code: string) => `${import.meta.env.BASE_URL}pieces/prepared/${glyphSource(set)}/${code}.png?v=18`

function imageCanvas(image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  canvas.getContext('2d')!.drawImage(image, 0, 0, 256, 256)
  return canvas
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image(256, 256)
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not load piece asset: ${url}`))
    image.src = url
  })
}

const pending = new Map<string, Promise<void>>()
const guidePending = new Map<PieceGuide, Promise<void>>()

function loadGuides(guide: PieceGuide, codes: string[]) {
  if (guide === 'none') return Promise.resolve()
  const existing = guidePending.get(guide)
  if (existing) return existing
  const promise = Promise.all(
    codes.map(async (code) => {
      const key = `${code}/${guide}`
      if (!guides.has(key)) guides.set(key, imageCanvas(await loadImage(`${import.meta.env.BASE_URL}pieces/prepared/guides/${code}.${guide}.png?v=16`)))
    }),
  )
    .then(() => {})
    .catch((error) => {
      guidePending.delete(guide)
      throw error
    })
  guidePending.set(guide, promise)
  return promise
}

export async function loadPieceSet(set: PieceSet, guide: PieceGuide = 'none') {
  const codes = [...new Set([...Object.values(CODE), 'GY'])]
  if (set === 'letters' || set === 'broadcast') return loadGuides(guide, codes)
  const source = glyphSource(set)
  const key = `${source}/${guide}`
  const existing = pending.get(key)
  if (existing) return existing
  const promise = (async () => {
    await Promise.all(
      codes.map(async (code) => {
        if (loaded.has(`${source}/${code}`)) return
        const image = await loadImage(`${import.meta.env.BASE_URL}pieces/prepared/${source}/${code}.png?v=18`)
        loaded.set(`${source}/${code}`, { canvas: imageCanvas(image), code, size: 256 })
      }),
    )
    await loadGuides(guide, codes)
  })().catch((error) => {
    pending.delete(key)
    throw error
  })
  pending.set(key, promise)
  return promise
}
