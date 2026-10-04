import * as THREE from 'three'
import type { PieceFinish } from '../settings'

type Ink = (u: number, v: number) => number

const SIZE = 256
const inkCache = new WeakMap<THREE.Texture, Ink>()
const glyphInkCache = new WeakMap<HTMLCanvasElement, Ink>()
const glyphDistanceCache = new WeakMap<HTMLCanvasElement, { distance: Float32Array; size: number }>()
const lacquerCache = new WeakMap<THREE.Texture, Map<number, THREE.Texture>>()
const profileCache = new WeakMap<THREE.Texture, Map<PieceFinish, Ink>>()
const normalCache = new WeakMap<THREE.Texture, Map<number, THREE.Texture>>()

function blur(src: Float32Array, size: number, radius: number) {
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const n = radius * 2 + 1
  for (let y = 0; y < size; y++) {
    let acc = 0
    for (let x = -radius; x <= radius; x++) acc += src[y * size + Math.min(size - 1, Math.max(0, x))]
    for (let x = 0; x < size; x++) {
      tmp[y * size + x] = acc / n
      acc += src[y * size + Math.min(size - 1, x + radius + 1)] - src[y * size + Math.max(0, x - radius)]
    }
  }
  for (let x = 0; x < size; x++) {
    let acc = 0
    for (let y = -radius; y <= radius; y++) acc += tmp[Math.min(size - 1, Math.max(0, y)) * size + x]
    for (let y = 0; y < size; y++) {
      out[y * size + x] = acc / n
      acc += tmp[Math.min(size - 1, y + radius + 1) * size + x] - tmp[Math.max(0, y - radius) * size + x]
    }
  }
  return out
}

export function inkMask(map: THREE.Texture) {
  const cached = inkCache.get(map)
  if (cached) return cached
  const glyph = map.userData.glyphCanvas as HTMLCanvasElement | undefined
  const existing = glyph && glyphInkCache.get(glyph)
  if (existing) {
    inkCache.set(map, existing)
    return existing
  }
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(glyph ?? map.image as HTMLCanvasElement, 0, 0, size, size)
  const raw = ctx.getImageData(0, 0, size, size).data
  const hard = new Float32Array(size * size)
  for (let i = 0; i < hard.length; i++) {
    const r = raw[i * 4]
    const g = raw[i * 4 + 1]
    const b = raw[i * 4 + 2]
    const red = r > 110 && r - g > 55 && r - b > 55
    const lum = 0.3 * r + 0.59 * g + 0.11 * b
    hard[i] = glyph ? raw[i * 4 + 3] / 255 : map.userData.lightInk ? lum > 125 ? 1 : 0 : red || lum < 125 ? 1 : 0
  }
  const soft = blur(blur(hard, size, 3), size, 3)
  const sample: Ink = (u, v) => {
    const fx = Math.min(size - 1.001, Math.max(0, u * (size - 1)))
    const fy = Math.min(size - 1.001, Math.max(0, (1 - v) * (size - 1)))
    const x = Math.floor(fx)
    const y = Math.floor(fy)
    const tx = fx - x
    const ty = fy - y
    const a = soft[y * size + x] * (1 - tx) + soft[y * size + x + 1] * tx
    const b = soft[(y + 1) * size + x] * (1 - tx) + soft[(y + 1) * size + x + 1] * tx
    const k = a * (1 - ty) + b * ty
    return k * k * (3 - 2 * k)
  }
  inkCache.set(map, sample)
  if (glyph) glyphInkCache.set(glyph, sample)
  return sample
}

export function finishProfile(finish: PieceFinish, distance: number) {
  const d = Math.max(0, Math.min(1, distance))
  if (finish === 'insatsu' || finish === 'horiume') return 0
  if (finish === 'oshi') return d > 0 ? 1 : 0
  if (finish === 'kaki' || finish === 'moriage') return Math.sqrt(d * (2 - d))
  return d
}

export function finishMask(map: THREE.Texture, finish: PieceFinish) {
  let profiles = profileCache.get(map)
  if (!profiles) profileCache.set(map, (profiles = new Map()))
  const cached = profiles.get(finish)
  if (cached) return cached
  const ink = inkMask(map)
  const glyph = map.userData.glyphCanvas as HTMLCanvasElement | undefined
  const prepared = glyph && glyphDistanceCache.get(glyph)
  if (prepared) {
    const { distance, size } = prepared
    const sample: Ink = (u, v) => {
      const x = Math.max(0, Math.min(size - 1, Math.round(u * (size - 1))))
      const y = Math.max(0, Math.min(size - 1, Math.round((1 - v) * (size - 1))))
      return finishProfile(finish, distance[y * size + x]) * ink(u, v)
    }
    profiles.set(finish, sample)
    return sample
  }
  const size = 512
  const distance = new Float32Array(size * size)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) distance[y * size + x] = ink(x / (size - 1), 1 - y / (size - 1)) > 0.5 ? size : 0
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    const i = y * size + x
    distance[i] = Math.min(distance[i], distance[i - 1] + 1, distance[i - size] + 1, distance[i - size - 1] + Math.SQRT2, distance[i - size + 1] + Math.SQRT2)
  }
  for (let y = size - 2; y > 0; y--) for (let x = size - 2; x > 0; x--) {
    const i = y * size + x
    distance[i] = Math.min(distance[i], distance[i + 1] + 1, distance[i + size] + 1, distance[i + size - 1] + Math.SQRT2, distance[i + size + 1] + Math.SQRT2)
  }
  if (glyph) glyphDistanceCache.set(glyph, { distance: Float32Array.from(distance, (value) => Math.min(1, value / 14)), size })
  const sample: Ink = (u, v) => {
    const x = Math.max(0, Math.min(size - 1, Math.round(u * (size - 1))))
    const y = Math.max(0, Math.min(size - 1, Math.round((1 - v) * (size - 1))))
    return finishProfile(finish, distance[y * size + x] / 14) * ink(u, v)
  }
  profiles.set(finish, sample)
  return sample
}

function dataTexture(fill: (data: Uint8ClampedArray, x: number, y: number, o: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) fill(img.data, x, y, (y * SIZE + x) * 4)
  ctx.putImageData(img, 0, 0)
  return new THREE.CanvasTexture(canvas)
}

export function lacquerMap(map: THREE.Texture, gloss: number) {
  let byGloss = lacquerCache.get(map)
  if (!byGloss) lacquerCache.set(map, (byGloss = new Map()))
  const cached = byGloss.get(gloss)
  if (cached) return cached
  const ink = inkMask(map)
  const texture = dataTexture((data, x, y, o) => {
    const k = Math.min(1, ink(x / (SIZE - 1), 1 - y / (SIZE - 1)) * 1.4)
    data[o] = Math.round(k * 255)
    data[o + 1] = Math.round(225 - k * gloss * 193)
    data[o + 2] = 0
    data[o + 3] = 255
  })
  byGloss.set(gloss, texture)
  return texture
}

export function reliefNormal(map: THREE.Texture, relief: number, w: number, h: number, finish: PieceFinish) {
  let byRelief = normalCache.get(map)
  if (!byRelief) normalCache.set(map, (byRelief = new Map()))
  const key = relief * 100 + ['insatsu', 'oshi', 'molded', 'kaki', 'hori', 'fukabori', 'horiume', 'moriage'].indexOf(finish)
  const cached = byRelief.get(key)
  if (cached) return cached
  const ink = finishMask(map, finish)
  const height = new Float32Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) height[y * SIZE + x] = ink(x / (SIZE - 1), 1 - y / (SIZE - 1)) * relief
  const at = (x: number, y: number) => height[Math.min(SIZE - 1, Math.max(0, y)) * SIZE + Math.min(SIZE - 1, Math.max(0, x))]
  const sx = (2 * w) / SIZE
  const sy = (2 * h) / SIZE
  const texture = dataTexture((data, x, y, o) => {
    const dx = (at(x + 1, y) - at(x - 1, y)) / sx
    const dy = (at(x, y - 1) - at(x, y + 1)) / sy
    const len = Math.hypot(dx, dy, 1)
    data[o] = Math.round(((-dx / len) * 0.5 + 0.5) * 255)
    data[o + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255)
    data[o + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255)
    data[o + 3] = 255
  })
  texture.anisotropy = 8
  byRelief.set(key, texture)
  return texture
}
