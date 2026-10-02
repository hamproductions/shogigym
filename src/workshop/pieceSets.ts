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
  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  const inset = 0
  const out = document.createElement('canvas')
  out.width = out.height = 256
  const octx = out.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(full, x0 + w * inset, y0 + h * inset, w * (1 - 2 * inset), h * (1 - 2 * inset), 256 * inset, 256 * inset, 256 * (1 - 2 * inset), 256 * (1 - 2 * inset))
  const img = octx.getImageData(0, 0, 256, 256)
  const px = img.data
  const inside = new Uint8Array(256 * 256)
  for (let i = 0; i < inside.length; i++) inside[i] = px[i * 4 + 3] > 40 ? 1 : 0
  const sum = new Int32Array(257 * 257)
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) sum[(y + 1) * 257 + x + 1] = inside[y * 256 + x] + sum[y * 257 + x + 1] + sum[(y + 1) * 257 + x] - sum[y * 257 + x]
  const r = 14
  const deep = (x: number, y: number) => {
    const xa = Math.max(0, x - r)
    const ya = Math.max(0, y - r)
    const xb = Math.min(256, x + r + 1)
    const yb = Math.min(256, y + r + 1)
    const area = (xb - xa) * (yb - ya)
    return x - r >= 0 && y - r >= 0 && x + r < 256 && y + r < 256 && sum[yb * 257 + xb] - sum[ya * 257 + xb] - sum[yb * 257 + xa] + sum[ya * 257 + xa] === area
  }
  for (let i = 0; i < px.length; i += 4) {
    const p = i / 4
    if (!deep(p % 256, Math.floor(p / 256))) {
      px[i + 3] = 0
      continue
    }
    const r = px[i]
    const g = px[i + 1]
    const b = px[i + 2]
    const lum = 0.3 * r + 0.59 * g + 0.11 * b
    const red = r > 120 && r - g > 70 && r - b > 70
    const ink = red ? 1 : Math.min(1, Math.max(0, (175 - lum) / 90))
    px[i + 3] = Math.round(px[i + 3] * Math.min(1, ink * 1.35))
    if (!red) {
      px[i] = 18
      px[i + 1] = 12
      px[i + 2] = 6
    }
  }
  octx.putImageData(img, 0, 0)
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
