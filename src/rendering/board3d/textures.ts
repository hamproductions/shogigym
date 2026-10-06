import * as THREE from 'three'
import { PieceType } from 'tsshogi'
import { PIECE_FONTS, pieceTone, getSettings, type BoardStyle, type PieceAppearance } from '@/appearance/settings'
import { loadedGuide, twoCharacterGlyph, type LoadedPiece } from '@/appearance/pieceSets'
import { grainTexture, rng } from '@/rendering/roomFloor'
import { CASUAL, HALF_D, HALF_W, MARGIN, komaWidth, pieceScale } from './dimensions'
import { BOARD_STYLES, loadedBoard } from '@/appearance/boardStyles'
import { BOARD_TONE, piecePolygon } from '@/rendering/koma'
import { releaseDerived } from './relief'

// The table is the largest thing on screen in the locked camera, so it gets the texels. Touch devices keep the
// smaller size to stay inside their GPU memory.
const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
const FACE = 256
const FACE_SCALE = 1
export const BOARD_SCALE = COARSE ? 1.5 : 3

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

// Canvases that get read back with getImageData must be CPU-backed, or the browser keeps shuttling them off the GPU.
function canvas2d(width: number, height = width, readback = false) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, ctx: canvas.getContext('2d', readback ? { willReadFrequently: true } : undefined)! }
}

export function boardSurface(style: BoardStyle, width: number, height: number) {
  if (!BOARD_STYLES[style].source) {
    // Grain strokes are fixed-width in pixels, so draw them at the base density and let the lines/marks stay sharp.
    const base = Math.min(width, 1024)
    const grain = grainTexture(base, Math.round((height * base) / width), BOARD_TONE[style].board, 260, 7)
    if (base === width) return grain
    const { canvas, ctx } = canvas2d(width, height)
    ctx.drawImage(grain, 0, 0, width, height)
    return canvas
  }
  const image = loadedBoard(style)
  if (!image) throw new Error(`Board surface not loaded: ${BOARD_STYLES[style].label}`)
  const { canvas, ctx } = canvas2d(width, height)
  ctx.drawImage(image, 0, 0, width, height)
  return canvas
}

export function boardTexture(style: BoardStyle, scale = BOARD_SCALE) {
  const sizeW = 1024
  const sizeH = Math.round((sizeW * HALF_D) / HALF_W)
  const canvas = boardSurface(style, Math.round(sizeW * scale), Math.round(sizeH * scale))
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
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
  ctx.fillStyle = BOARD_TONE[style].line
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

// three.js never frees GPU memory for a texture until dispose() is called, so every cache here is bounded and
// disposes what it drops. Disposing a texture a live mesh still uses is safe: it is simply re-uploaded on next use.
const TEXTURE_LIMIT = 256
const GLYPH_LIMIT = 512
const faceCache = new Map<string, THREE.Texture>()
const artCache = new Map<string, THREE.Texture>()
const clearHooks = new Set<() => void>()
export let faceTextureRevision = 0

export const onFaceTexturesCleared = (hook: () => void) => {
  clearHooks.add(hook)
}

export function releaseTexture(texture: THREE.Texture) {
  releaseDerived(texture)
  const ink = texture.userData.inkCanvas as HTMLCanvasElement | undefined
  if (ink) {
    glyphTextures.get(ink)?.dispose()
    glyphTextures.delete(ink)
  }
  texture.dispose()
}

export function recall<K, T>(cache: Map<K, T>, key: K) {
  const hit = cache.get(key)
  if (hit !== undefined) {
    cache.delete(key)
    cache.set(key, hit)
  }
  return hit
}

export function remember<K, T extends THREE.Texture>(cache: Map<K, T>, key: K, texture: T, limit = TEXTURE_LIMIT) {
  cache.set(key, texture)
  while (cache.size > limit) {
    const [oldKey, old] = cache.entries().next().value!
    cache.delete(oldKey)
    releaseTexture(old)
  }
  return texture
}

export const clearFaceTextures = () => {
  for (const texture of [...faceCache.values(), ...artCache.values()]) releaseTexture(texture)
  faceCache.clear()
  artCache.clear()
  glyphCache.clear()
  for (const hook of clearHooks) hook()
  faceTextureRevision++
}

export function pieceSurface(seed: number, appearance?: PieceAppearance) {
  const { pieceMaterial, pieceGrain, pieceColor } = { ...getSettings(), ...appearance }
  const tone = pieceTone(pieceMaterial, pieceColor)
  const { canvas, ctx } = canvas2d(FACE)
  ctx.scale(FACE_SCALE, FACE_SCALE)
  ctx.fillStyle = `rgb(${tone.join(',')})`
  ctx.fillRect(0, 0, 256, 256)
  if (pieceMaterial === 'plastic' || pieceMaterial === 'glass' || pieceMaterial === 'frostedGlass') return canvas
  const random = rng((Math.abs(seed) % 2147483646) + 1)
  const warmth = random() * 4 - 2
  ctx.fillStyle = `rgba(${warmth > 0 ? '255,225,165' : '125,85,35'},0.035)`
  ctx.fillRect(0, 0, 256, 256)
  const phase = random() * Math.PI * 2
  const bend = 0.012 + random() * 0.012
  const amplitude = 0.7 + random() * 0.8
  const knotX = 40 + random() * 176
  const knotY = 40 + random() * 176
  let base = -40 + random() * 8
  while (base < 300) {
    base += 4 + random() * 7
    const drift = random() * 2 - 1
    ctx.strokeStyle = random() < 0.7 ? `rgba(120,78,30,${0.1 + random() * 0.15})` : `rgba(255,245,210,${0.18 + random() * 0.16})`
    ctx.lineWidth = 0.9 + random() * 1.5
    ctx.beginPath()
    for (let y = 0; y <= 256; y += 3) {
      const flow = Math.sin(y * bend + phase + base * 0.004)
      let offset: number
      switch (pieceGrain) {
        case 'masame': {
          offset = flow * 2.5 * amplitude + drift * y * 0.009
          break
        }
        case 'itame': {
          offset = flow * (14 + Math.abs(base - 128) * 0.09) * amplitude
          break
        }
        case 'root': {
          offset = Math.atan2(y - knotY, base - knotX) * 13 * amplitude + flow * 10
          break
        }
        case 'tiger': {
          offset = Math.sin(y * (0.045 + bend) + phase) * (8 + flow * 4) * amplitude
          break
        }
        default: {
          offset = Math.asin(Math.sin(y * bend * 1.7 + phase)) * 18 * amplitude + flow * 5
        }
      }
      ctx.lineTo(base + offset, y)
    }
    ctx.stroke()
  }
  return canvas
}

function guideInk(guide: HTMLCanvasElement | undefined, ink: HTMLCanvasElement) {
  if (!guide) return guide
  const pixels = ink.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, ink.width, ink.height).data
  let index = 0
  for (let i = 4; i < pixels.length; i += 4) if (pixels[i + 3] > pixels[index + 3]) index = i
  const { canvas, ctx } = canvas2d(guide.width, guide.height, true)
  ctx.drawImage(guide, 0, 0)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = `rgb(${pixels[index]},${pixels[index + 1]},${pixels[index + 2]})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas
}

function glyphInk(lightInk: boolean, promoted: boolean) {
  if (lightInk) return promoted ? '#ffa0a4' : '#faf6eb'
  return promoted ? '#9c1c12' : '#0e0804'
}

function composeGlyph(ink: HTMLCanvasElement, guide?: HTMLCanvasElement, two = false, marks = false) {
  const { canvas, ctx } = canvas2d(ink.width)
  const scale = pieceScale(PieceType.KING)
  const width = komaWidth(scale)
  const [, , [x, y]] = piecePolygon(scale)
  const left = canvas.width * (0.5 - x / width)
  const top = canvas.height * (0.5 - y / scale)
  const faceWidth = canvas.width - left * 2
  const faceHeight = canvas.height - top - top / 2
  const draw = (image: HTMLCanvasElement, boxTop: number, boxHeight: number) => {
    const factor = two && !guide ? (boxHeight * scale) / canvas.height / image.height : (faceWidth * width) / canvas.width / image.width
    const fit = guide ? Math.min(factor, (boxHeight * scale) / canvas.height / image.height) : factor
    const drawWidth = (image.width * fit * canvas.width) / width
    const drawHeight = (image.height * fit * canvas.height) / scale
    ctx.drawImage(image, left + (faceWidth - drawWidth) / 2, boxTop + (boxHeight - drawHeight) / 2, drawWidth, drawHeight)
  }
  if (!guide || marks) {
    if (guide) ctx.drawImage(guide, 0, 0, canvas.width, canvas.height)
    draw(ink, top, faceHeight)
  } else {
    const gap = faceHeight / 12
    const half = (faceHeight - gap) / 2
    draw(ink, top, half)
    draw(guide, top + half + gap, half)
  }
  return canvas
}

export function artTexture(art: LoadedPiece, key: string, seed = 1, appearance?: PieceAppearance) {
  const settings = { ...getSettings(), ...appearance }
  const lightInk = settings.pieceColor === 'dark' || settings.pieceColor === 'mahogany'
  const glyphKey = `art|${key}|${settings.pieceStyle}|${settings.pieceGuide}|${lightInk}`
  key += `|${settings.pieceStyle}|${settings.pieceGuide}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${seed}`
  const cached = recall(artCache, key)
  if (cached) return cached
  const canvas = pieceSurface(seed, appearance)
  let glyph = glyphCache.get(glyphKey)
  if (!glyph) {
    const ink = canvas2d(FACE, FACE, true)
    ink.ctx.drawImage(art.canvas, 0, 0, FACE, FACE)
    if (lightInk) {
      const image = ink.ctx.getImageData(0, 0, FACE, FACE)
      for (let i = 0; i < image.data.length; i += 4) {
        const red = image.data[i] - image.data[i + 1] > 35 && image.data[i] - image.data[i + 2] > 20
        const [cr, cg, cb] = red ? [255, 160, 164] : [250, 246, 235]
        image.data[i] = cr
        image.data[i + 1] = cg
        image.data[i + 2] = cb
      }
      ink.ctx.putImageData(image, 0, 0)
    }
    const sourceGuide = settings.pieceGuide === 'none' ? undefined : loadedGuide(art.code, settings.pieceGuide)
    const guide = settings.pieceGuide === 'lines' ? guideInk(sourceGuide, ink.canvas) : sourceGuide
    glyph = composeGlyph(ink.canvas, guide, twoCharacterGlyph(settings.pieceSet), settings.pieceGuide === 'movement')
    rememberGlyph(glyphKey, glyph)
  }
  canvas.getContext('2d')!.drawImage(glyph, 0, 0)
  const texture = srgbTexture(canvas, 8)
  texture.userData.lightInk = lightInk
  texture.userData.glyphCanvas = glyph
  texture.userData.inkCanvas = glyph
  return remember(artCache, key, texture)
}

const glyphCache = new Map<string, HTMLCanvasElement>()

function rememberGlyph(key: string, glyph: HTMLCanvasElement) {
  glyphCache.set(key, glyph)
  if (glyphCache.size > GLYPH_LIMIT) glyphCache.delete(glyphCache.keys().next().value!)
}

function normalizeInk(source: HTMLCanvasElement) {
  const pixels = source.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, source.width, source.height).data
  let left = source.width
  let top = source.height
  let right = 0
  let bottom = 0
  for (let y = 0; y < source.height; y++)
    for (let x = 0; x < source.width; x++)
      if (pixels[(y * source.width + x) * 4 + 3]) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x + 1)
        bottom = Math.max(bottom, y + 1)
      }
  const { canvas, ctx } = canvas2d(source.width)
  if (right <= left || bottom <= top) return canvas
  const factor = Math.min(canvas.width / (right - left), canvas.height / (bottom - top))
  const width = (right - left) * factor
  const height = (bottom - top) * factor
  ctx.drawImage(source, left, top, right - left, bottom - top, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
  return canvas
}

export function faceTexture(char: string, promoted: boolean, seed = 1, appearance?: PieceAppearance, code = 'FU') {
  const set = appearance?.pieceSet ?? getSettings().pieceSet
  const broadcast = set === 'broadcast'
  const font = PIECE_FONTS[appearance?.pieceFont ?? getSettings().pieceFont] ?? PIECE_FONTS.mincho
  const settings = { ...getSettings(), ...appearance }
  const key = `${char}${promoted}${font.family}${broadcast}|${set}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.pieceGuide}|${code}|${seed}`
  const cached = recall(faceCache, key)
  if (cached) return cached
  // Until the font has loaded the canvas silently draws the fallback face; never cache that.
  const fontReady = document.fonts.check(`${font.weight} 100px "${font.family}"`, char)
  const canvas = pieceSurface(seed, appearance)
  const lightInk = settings.pieceColor === 'dark' || settings.pieceColor === 'mahogany'
  const glyphKey = `${char}|${promoted}|${font.family}|${broadcast}|${lightInk}|${settings.pieceStyle}|${settings.pieceGuide}|${code}`
  let glyph = glyphCache.get(glyphKey)
  if (!glyph) {
    glyph = canvas2d(FACE, FACE, true).canvas
    const ctx = glyph.getContext('2d')!
    ctx.scale(FACE_SCALE, FACE_SCALE)
    ctx.fillStyle = glyphInk(lightInk, promoted)
    ctx.strokeStyle = ctx.fillStyle
    ctx.lineWidth = font.weight >= 700 ? 3 : 7
    ctx.lineJoin = 'round'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const chars = [...char]
    const size = chars.length === 1 ? 176 : 116
    ctx.font = `${font.weight} ${size}px "${font.family}", "Shippori Mincho B1", serif`
    chars.forEach((c, i) => {
      const y = 128 + (i - (chars.length - 1) / 2) * size * 0.98 + 6
      ctx.fillText(c, 128, y)
      if (!broadcast) ctx.strokeText(c, 128, y)
    })
    const sourceGuide = settings.pieceGuide === 'none' ? undefined : loadedGuide(code, settings.pieceGuide)
    const guide = settings.pieceGuide === 'lines' ? guideInk(sourceGuide, glyph) : sourceGuide
    if (settings.pieceGuide !== 'none' && !guide) throw new Error(`Guide not loaded: ${code}/${settings.pieceGuide}`)
    glyph = composeGlyph(normalizeInk(glyph), guide, settings.pieceStyle === 'two', settings.pieceGuide === 'movement')
    if (fontReady) rememberGlyph(glyphKey, glyph)
  }
  canvas.getContext('2d')!.drawImage(glyph, 0, 0)
  const texture = srgbTexture(canvas, 8)
  texture.userData.lightInk = lightInk
  texture.userData.glyphCanvas = glyph
  texture.userData.inkCanvas = glyph
  return fontReady ? remember(faceCache, key, texture) : texture
}

const glyphTextures = new WeakMap<HTMLCanvasElement, THREE.Texture>()

export function glyphTexture(map: THREE.Texture) {
  const canvas = map.userData.inkCanvas as HTMLCanvasElement
  let texture = glyphTextures.get(canvas)
  if (!texture) {
    texture = srgbTexture(canvas, 8)
    glyphTextures.set(canvas, texture)
  }
  return texture
}

const coordCache = new Map<string, THREE.Texture>()

function coordTexture(text: string) {
  const cacheKey = `${text}|${getSettings().boardStyle}`
  let texture = coordCache.get(cacheKey)
  if (!texture) {
    const { canvas, ctx } = canvas2d(64)
    ctx.fillStyle = getSettings().boardStyle.endsWith('dark') ? 'rgba(250, 232, 196, 0.92)' : 'rgba(40, 22, 8, 0.85)'
    ctx.font = '800 40px "Shippori Mincho B1", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 32, 34)
    texture = srgbTexture(canvas, 8)
    texture.userData.shared = true
    coordCache.set(cacheKey, texture)
  }
  return texture
}

export function coordSprite(text: string) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: coordTexture(text), depthTest: false }))
  s.scale.setScalar(0.3)
  s.renderOrder = 9
  return s
}

export function coordPlane(text: string, size: number, flipped: boolean) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: coordTexture(text), transparent: true, depthWrite: false }),
  )
  mesh.rotation.set(-Math.PI / 2, 0, flipped ? Math.PI : 0)
  mesh.renderOrder = 0
  return mesh
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
