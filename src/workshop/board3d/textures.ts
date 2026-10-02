import * as THREE from 'three'
import { PIECE_FONTS, getSettings, type BoardStyle } from '../settings'
import type { LoadedPiece } from '../pieceSets'
import { grainTexture } from '../roomFloor'
import { CASUAL, HALF_D, HALF_W, MARGIN } from './dimensions'

export const BOARD_TONE: Record<BoardStyle, { board: [number, number, number]; edge: [number, number, number]; line: string }> = {
  kaya: { board: [219, 170, 98], edge: [196, 146, 80], line: 'rgba(40,22,8,0.88)' },
  'shin-kaya': { board: [236, 206, 150], edge: [214, 178, 118], line: 'rgba(60,36,14,0.8)' },
  dark: { board: [150, 98, 52], edge: [112, 70, 34], line: 'rgba(250,228,190,0.7)' },
}

export function srgbTexture(canvas: HTMLCanvasElement, anisotropy = 1) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  return texture
}

function sprite(canvas: HTMLCanvasElement, renderOrder: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: srgbTexture(canvas), depthTest: false }))
  s.renderOrder = renderOrder
  return s
}

function canvas2d(width: number, height = width) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, ctx: canvas.getContext('2d')! }
}

export function boardTexture(style: BoardStyle) {
  const sizeW = 1024
  const sizeH = Math.round((sizeW * HALF_D) / HALF_W)
  const canvas = grainTexture(sizeW, sizeH, BOARD_TONE[style].board, 260, 7)
  const ctx = canvas.getContext('2d')!
  const mx = (MARGIN / (2 * HALF_W)) * sizeW
  const my = (MARGIN / (2 * HALF_D)) * sizeH
  const cw = (sizeW - mx * 2) / 9
  const ch = (sizeH - my * 2) / 9
  if (CASUAL) {
    ctx.strokeStyle = 'rgba(70, 42, 16, 0.22)'
    ctx.lineWidth = 1.5
    for (const f of [0.27, 0.52, 0.76]) {
      ctx.beginPath()
      ctx.moveTo(0, sizeH * f)
      ctx.lineTo(sizeW, sizeH * f)
      ctx.stroke()
    }
  }
  ctx.strokeStyle = BOARD_TONE[style].line
  ctx.lineWidth = 2.2
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath()
    ctx.moveTo(mx + i * cw, my)
    ctx.lineTo(mx + i * cw, sizeH - my)
    ctx.moveTo(mx, my + i * ch)
    ctx.lineTo(sizeW - mx, my + i * ch)
    ctx.stroke()
  }
  ctx.lineWidth = 4
  ctx.strokeRect(mx, my, cw * 9, ch * 9)
  ctx.fillStyle = 'rgba(40,22,8,0.9)'
  for (const [cx, cy] of [
    [3, 3],
    [6, 3],
    [3, 6],
    [6, 6],
  ]) {
    ctx.beginPath()
    ctx.arc(mx + cx * cw, my + cy * ch, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  return srgbTexture(canvas, 8)
}

const faceCache = new Map<string, THREE.Texture>()
const artCache = new Map<string, THREE.Texture>()

export const clearFaceTextures = () => faceCache.clear()

export function artTexture(art: LoadedPiece, key: string) {
  const cached = artCache.get(key)
  if (cached) return cached
  const canvas = grainTexture(256, 256, [240, 210, 152], 18, key.length)
  canvas.getContext('2d')!.drawImage(art.canvas, 0, 0, 256, 256)
  const texture = srgbTexture(canvas, 8)
  artCache.set(key, texture)
  return texture
}

export function faceTexture(char: string, promoted: boolean) {
  const font = PIECE_FONTS[getSettings().pieceFont] ?? PIECE_FONTS.mincho
  const key = `${char}${promoted}${font.family}`
  const cached = faceCache.get(key)
  if (cached) return cached
  const canvas = grainTexture(256, 256, [240, 210, 152], 18, char.charCodeAt(0))
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = promoted ? '#9c1c12' : '#0e0804'
  ctx.strokeStyle = ctx.fillStyle
  ctx.lineWidth = font.weight >= 700 ? 3 : 7
  ctx.lineJoin = 'round'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const chars = [...char]
  const size = chars.length === 1 ? 150 : 104
  ctx.font = `${font.weight} ${size}px "${font.family}", "Shippori Mincho B1", serif`
  chars.forEach((c, i) => {
    const y = 128 + (i - (chars.length - 1) / 2) * size * 0.98 + 6
    ctx.fillText(c, 128, y)
    ctx.strokeText(c, 128, y)
  })
  const texture = srgbTexture(canvas, 8)
  faceCache.set(key, texture)
  return texture
}

const coordCache = new Map<string, THREE.Texture>()

export function coordSprite(text: string) {
  const cacheKey = `${text}|${getSettings().boardStyle}`
  let texture = coordCache.get(cacheKey)
  if (!texture) {
    const { canvas, ctx } = canvas2d(64)
    ctx.fillStyle = getSettings().boardStyle === 'dark' ? 'rgba(250, 232, 196, 0.92)' : 'rgba(40, 22, 8, 0.85)'
    ctx.font = '800 40px "Shippori Mincho B1", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 32, 34)
    texture = srgbTexture(canvas)
    coordCache.set(cacheKey, texture)
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
  s.scale.setScalar(0.3)
  s.renderOrder = 9
  return s
}

export function arrowTag(text: string, color: string) {
  const { canvas, ctx } = canvas2d(160, 72)
  ctx.font = '700 46px "Zen Kaku Gothic New", sans-serif'
  const w = Math.min(152, ctx.measureText(text).width + 28)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect((160 - w) / 2, 6, w, 60, 14)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 80, 38)
  const s = sprite(canvas, 13)
  s.scale.set(0.56, 0.25, 1)
  return s
}

export function labelSprite(text: string, color: string) {
  const { canvas, ctx } = canvas2d(256, 64)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(4, 8, 248, 48, 10)
  ctx.fill()
  ctx.fillStyle = '#fbf6ec'
  ctx.font = '800 34px "Shippori Mincho B1", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 34)
  const s = sprite(canvas, 12)
  s.scale.set(1.6, 0.4, 1)
  return s
}

export function badgeSprite(text: string, color: string) {
  const { canvas, ctx } = canvas2d(96)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(48, 48, 44, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fbf6ec'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.font = `700 ${text.length > 1 ? 40 : 50}px "Zen Kaku Gothic New", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(text)
  ctx.fillText(text, 48, 48 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2)
  const s = sprite(canvas, 13)
  s.scale.setScalar(0.5)
  return s
}
