import { Color, PieceType } from 'tsshogi'

export type PieceSet = 'letters' | 'ryoko_1kanji' | 'kanji_brown' | 'kanji_light'

export const PIECE_SETS: Record<PieceSet, { label: string; credit?: string }> = {
  letters: { label: 'Drawn letters' },
  ryoko_1kanji: { label: '菱湖 Ryoko', credit: 'Ryoko_1Kanji by nexxogen (lishogi), CC BY-SA 4.0' },
  kanji_brown: { label: '駒 Brown', credit: 'kanji_brown by Ka-hu (lishogi), CC BY 4.0' },
  kanji_light: { label: '駒 Light', credit: 'kanji_light by Ka-hu (lishogi), CC BY 4.0' },
}

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

export type LoadedPiece = { canvas: HTMLCanvasElement }

const loaded = new Map<string, LoadedPiece>()

export const loadedPiece = (set: PieceSet, code: string) => loaded.get(`${set}/${code}`)

export const pieceUrl = (set: PieceSet, code: string) => `${import.meta.env.BASE_URL}pieces/${set}/${code}.svg`

function rasterize(image: HTMLImageElement): HTMLCanvasElement {
  const size = 512
  const full = document.createElement('canvas')
  full.width = full.height = size
  const ctx = full.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  let x0 = size
  let y0 = size
  let x1 = 0
  let y1 = 0
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (data[(y * size + x) * 4 + 3] > 40) {
        if (x < x0) x0 = x
        if (y < y0) y0 = y
        if (x > x1) x1 = x
        if (y > y1) y1 = y
      }
  if (x1 <= x0) return full
  const out = document.createElement('canvas')
  out.width = out.height = 256
  out.getContext('2d')!.drawImage(full, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, 256, 256)
  return out
}

export async function loadPieceSet(set: PieceSet) {
  if (set === 'letters') return
  const codes = [...new Set([...Object.values(CODE), 'GY'])]
  await Promise.all(
    codes.map(
      (code) =>
        loaded.get(`${set}/${code}`) ??
        new Promise<void>((resolve) => {
          const image = new Image(512, 512)
          image.onload = () => {
            loaded.set(`${set}/${code}`, { canvas: rasterize(image) })
            resolve()
          }
          image.onerror = () => resolve()
          image.src = pieceUrl(set, code)
        }),
    ),
  )
}
