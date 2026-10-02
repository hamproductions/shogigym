import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Color, PieceType, Square, type ImmutablePosition } from 'tsshogi'
import { HAND_ORDER, PIECE_CHAR } from '../shogi'
import { PIECE_FINISHES, PIECE_FONTS, getSettings, type BoardStyle } from './settings'
import { loadedPiece, pieceCode, type LoadedPiece } from './pieceSets'

export type BoardArrow = { usi: string; color: string; dashed?: boolean; label?: string }

export type Board3DProps = {
  position: ImmutablePosition
  flipped: boolean
  tilted: boolean
  lastMove?: string
  selected: Square | PieceType | null
  selectedColor?: Color
  targets: Square[]
  arrows: BoardArrow[]
  castles?: { squares: Square[]; color: string; label: string }[]
  peek?: Square[]
  heat?: { square: Square; color: number; opacity: number; label?: string }[]
  checkSquare?: Square | null
  snapKey?: string
  peekFrom?: Square | null
  stamp?: { square: string; text: string; color: string } | null
  onSquare: (square: Square) => void
  onHand: (color: Color, type: PieceType) => void
  onDrop: (from: Square | PieceType, to: Square) => void
  onArrow?: (usi: string) => void
}

const MM_PER_SQUARE = 34

const KOMA_MM: [PieceType[], number, number, number, number][] = [
  [[PieceType.KING], 32.5, 29.3, 9.6, 3.93],
  [[PieceType.ROOK, PieceType.BISHOP, PieceType.DRAGON, PieceType.HORSE], 31.5, 28.3, 9.3, 3.81],
  [[PieceType.GOLD, PieceType.SILVER, PieceType.PROM_SILVER], 30.5, 27.3, 9.0, 3.68],
  [[PieceType.KNIGHT, PieceType.PROM_KNIGHT], 29.5, 26.3, 8.7, 3.56],
  [[PieceType.LANCE, PieceType.PROM_LANCE], 29.5, 24.1, 8.4, 3.26],
  [[PieceType.PAWN, PieceType.PROM_PAWN], 28.3, 23.1, 8.1, 3.17],
]

const PIECE_SIZE: Partial<Record<PieceType, number>> = Object.fromEntries(KOMA_MM.flatMap(([types, h]) => types.map((t) => [t, h / MM_PER_SQUARE])))

const KOMA_DIMS = new Map(KOMA_MM.map(([, h, l, k, tip]) => [h / MM_PER_SQUARE, { w: l / MM_PER_SQUARE, t: k / MM_PER_SQUARE, taper: tip / k }]))

const komaWidth = (scale: number) => KOMA_DIMS.get(scale)?.w ?? scale * 0.9
const komaDepth = (scale: number) => (KOMA_DIMS.get(scale)?.t ?? 0.28 * scale) - 0.05
const komaTaper = (scale: number) => KOMA_DIMS.get(scale)?.taper ?? 0.41
const SIDE_COT = 1 / Math.tan((81 * Math.PI) / 180)
const TIP_SLOPE = Math.tan(((180 - 146) / 2 / 180) * Math.PI)

const PROMOTED = new Set([PieceType.PROM_PAWN, PieceType.PROM_LANCE, PieceType.PROM_KNIGHT, PieceType.PROM_SILVER, PieceType.HORSE, PieceType.DRAGON])
const FACE: Record<PieceType, string> = {
  [PieceType.KING]: '王将',
  [PieceType.ROOK]: '飛車',
  [PieceType.BISHOP]: '角行',
  [PieceType.GOLD]: '金将',
  [PieceType.SILVER]: '銀将',
  [PieceType.KNIGHT]: '桂馬',
  [PieceType.LANCE]: '香車',
  [PieceType.PAWN]: '歩兵',
  [PieceType.DRAGON]: '龍王',
  [PieceType.HORSE]: '龍馬',
  [PieceType.PROM_SILVER]: '成銀',
  [PieceType.PROM_KNIGHT]: '成桂',
  [PieceType.PROM_LANCE]: '成香',
  [PieceType.PROM_PAWN]: 'と金',
}
const KING_GOTE = '玉将'

const BOARD_TONE: Record<BoardStyle, { board: [number, number, number]; edge: [number, number, number]; line: string }> = {
  kaya: { board: [219, 170, 98], edge: [196, 146, 80], line: 'rgba(40,22,8,0.88)' },
  'shin-kaya': { board: [236, 206, 150], edge: [214, 178, 118], line: 'rgba(60,36,14,0.8)' },
  dark: { board: [150, 98, 52], edge: [112, 70, 34], line: 'rgba(250,228,190,0.7)' },
}

const squareX = (file: number) => 5 - file
const squareZ = (rank: number) => rank - 5

function grainTexture(width: number, height: number, base: [number, number, number], lines: number, seed: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${base.join(',')})`
  ctx.fillRect(0, 0, width, height)
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < lines; i++) {
    const y = rand() * height
    const amp = 2 + rand() * 9
    const freq = 0.002 + rand() * 0.006
    const phase = rand() * 10
    const dark = rand() < 0.55
    ctx.strokeStyle = dark ? `rgba(110,62,22,${0.05 + rand() * 0.12})` : `rgba(255,226,170,${0.04 + rand() * 0.08})`
    ctx.lineWidth = 0.6 + rand() * 2.4
    ctx.beginPath()
    for (let x = 0; x <= width; x += 8) ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1) * amp * 0.3)
    ctx.stroke()
  }
  return canvas
}

function boardTexture(style: BoardStyle) {
  const size = 1024
  const canvas = grainTexture(size, size, BOARD_TONE[style].board, 260, 7)
  const ctx = canvas.getContext('2d')!
  const margin = size * 0.05
  const cell = (size - margin * 2) / 9
  ctx.strokeStyle = BOARD_TONE[style].line
  ctx.lineWidth = 2.2
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath()
    ctx.moveTo(margin + i * cell, margin)
    ctx.lineTo(margin + i * cell, size - margin)
    ctx.moveTo(margin, margin + i * cell)
    ctx.lineTo(size - margin, margin + i * cell)
    ctx.stroke()
  }
  ctx.lineWidth = 4
  ctx.strokeRect(margin, margin, cell * 9, cell * 9)
  ctx.fillStyle = 'rgba(40,22,8,0.9)'
  for (const [cx, cy] of [
    [3, 3],
    [6, 3],
    [3, 6],
    [6, 6],
  ]) {
    ctx.beginPath()
    ctx.arc(margin + cx * cell, margin + cy * cell, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function woodMaterial(base: [number, number, number], seed: number, roughness = 0.62) {
  const texture = new THREE.CanvasTexture(grainTexture(512, 512, base, 120, seed))
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshPhysicalMaterial({ map: texture, roughness: Math.min(roughness, 0.5), metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.32, envMap: pieceEnv, envMapIntensity: 0.35 })
}

const faceCache = new Map<string, THREE.Texture>()

const artCache = new Map<string, THREE.Texture>()

function artTexture(art: LoadedPiece, key: string) {
  const cached = artCache.get(key)
  if (cached) return cached
  const canvas = grainTexture(256, 256, [240, 210, 152], 18, key.length)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(art.canvas, 0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  artCache.set(key, texture)
  return texture
}

function faceTexture(char: string, promoted: boolean) {
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
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  faceCache.set(key, texture)
  return texture
}

const geometryCache = new Map<number, THREE.ExtrudeGeometry>()

function pieceGeometry(scale: number) {
  const cached = geometryCache.get(scale)
  if (cached) return cached
  const w = komaWidth(scale)
  const h = scale
  const shape = new THREE.Shape(piecePolygon(scale).map(([x, y]) => new THREE.Vector2(x, y)))
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: komaDepth(scale), bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 })
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + h * 0.5) / h
    pos.setZ(i, pos.getZ(i) * (1 - (1 - komaTaper(scale)) * Math.min(1, Math.max(0, t))))
  }
  geometry.computeVertexNormals()
  geometry.rotateX(-Math.PI / 2)
  geometryCache.set(scale, geometry)
  return geometry
}

const hiddenLid = new THREE.MeshBasicMaterial({ visible: false })

function piecePolygon(scale: number): [number, number][] {
  const l = komaWidth(scale)
  const h = scale
  const xs = (l / 2 - h * SIDE_COT) / (1 - TIP_SLOPE * SIDE_COT)
  const ys = h - xs * TIP_SLOPE - h / 2
  return [
    [-l / 2, -h / 2],
    [l / 2, -h / 2],
    [xs, ys],
    [0, h / 2],
    [-xs, ys],
  ]
}

function inside(poly: [number, number][], x: number, y: number) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function nearestOnPolygon(poly: [number, number][], x: number, y: number): [number, number] {
  let best: [number, number] = poly[0]
  let bestD = Infinity
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + 1) % poly.length]
    const dx = bx - ax
    const dy = by - ay
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    const px = ax + t * dx
    const py = ay + t * dy
    const d = (px - x) ** 2 + (py - y) ** 2
    if (d < bestD) {
      bestD = d
      best = [px, py]
    }
  }
  return best
}

let pieceEnv: THREE.Texture | null = null

export function preparePieceEnvironment(renderer: THREE.WebGLRenderer) {
  if (pieceEnv) return
  const pmrem = new THREE.PMREMGenerator(renderer)
  pieceEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
}

const lacquerCache = new WeakMap<THREE.Texture, THREE.Texture>()

function lacquerMap(map: THREE.Texture) {
  const cached = lacquerCache.get(map)
  if (cached) return cached
  const ink = inkMask(map)
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = Math.min(1, ink(x / (size - 1), 1 - y / (size - 1)) * 1.4)
      const o = (y * size + x) * 4
      img.data[o] = Math.round(k * 255)
      img.data[o + 1] = Math.round(215 - k * 195)
      img.data[o + 2] = 0
      img.data[o + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  lacquerCache.set(map, texture)
  return texture
}

const normalCache = new WeakMap<THREE.Texture, Map<number, THREE.Texture>>()

function reliefNormal(map: THREE.Texture, relief: number, w: number, h: number) {
  let byRelief = normalCache.get(map)
  if (!byRelief) normalCache.set(map, (byRelief = new Map()))
  const cached = byRelief.get(relief)
  if (cached) return cached
  const ink = inkMask(map)
  const size = 256
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const k = ink(x / (size - 1), 1 - y / (size - 1))
      height[y * size + x] = k * relief
    }
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const at = (x: number, y: number) => height[Math.min(size - 1, Math.max(0, y)) * size + Math.min(size - 1, Math.max(0, x))]
  const sx = (2 * w) / size
  const sy = (2 * h) / size
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) / sx
      const dy = (at(x, y - 1) - at(x, y + 1)) / sy
      const len = Math.hypot(dx, dy, 1)
      const o = (y * size + x) * 4
      img.data[o] = Math.round(((-dx / len) * 0.5 + 0.5) * 255)
      img.data[o + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255)
      img.data[o + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255)
      img.data[o + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  byRelief.set(relief, texture)
  return texture
}

const topCache = new WeakMap<THREE.Texture, Map<number, THREE.BufferGeometry>>()

const inkCache = new WeakMap<THREE.Texture, (u: number, v: number) => number>()

function inkMask(map: THREE.Texture) {
  const cached = inkCache.get(map)
  if (cached) return cached
  const source = map.image as HTMLCanvasElement
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(source, 0, 0, size, size)
  const raw = ctx.getImageData(0, 0, size, size).data
  const hard = new Float32Array(size * size)
  for (let i = 0; i < hard.length; i++) {
    const r = raw[i * 4]
    const g = raw[i * 4 + 1]
    const b = raw[i * 4 + 2]
    const red = r > 110 && r - g > 55 && r - b > 55
    hard[i] = red || 0.3 * r + 0.59 * g + 0.11 * b < 125 ? 1 : 0
  }
  const blur = (src: Float32Array, radius: number) => {
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
  const soft = blur(blur(hard, 3), 3)
  const sample = (u: number, v: number) => {
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
  return sample
}

function carvedTop(scale: number, map: THREE.Texture) {
  let byScale = topCache.get(map)
  if (!byScale) topCache.set(map, (byScale = new Map()))
  const finish = PIECE_FINISHES[getSettings().pieceFinish] ?? PIECE_FINISHES.moriage
  const key = Math.round(scale * 1000) * 1000 + Math.round(finish.relief * 1000)
  const cached = byScale.get(key)
  if (cached) return cached
  const ink = inkMask(map)
  const relief = finish.relief * scale
  const w = komaWidth(scale)
  const h = scale
  const poly = piecePolygon(scale)
  const top = komaDepth(scale) + 0.026
  const n = 200
  const positions: number[] = []
  const uvs: number[] = []
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      let x = -w / 2 + (w * i) / n
      let y = -h / 2 + (h * j) / n
      if (!inside(poly, x, y)) [x, y] = nearestOnPolygon(poly, x, y)
      const u = x / w + 0.5
      const v = y / h + 0.5
      const t = Math.min(1, Math.max(0, v))
      positions.push(x, y, top * (1 - (1 - komaTaper(scale)) * t) + ink(u, v) * relief)
      uvs.push(u, v)
    }
  const index: number[] = []
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i
      index.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1)
    }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(index)
  geometry.computeVertexNormals()
  geometry.rotateX(-Math.PI / 2)
  byScale.set(key, geometry)
  return geometry
}

const bottomCache = new Map<number, THREE.BufferGeometry>()

function pieceBottom(scale: number) {
  const cached = bottomCache.get(scale)
  if (cached) return cached
  const shape = new THREE.Shape(piecePolygon(scale).map(([x, y]) => new THREE.Vector2(x, y)))
  const geometry = new THREE.ShapeGeometry(shape)
  geometry.rotateX(Math.PI / 2)
  geometry.scale(1, 1, -1)
  geometry.translate(0, -0.02, 0)
  bottomCache.set(scale, geometry)
  return geometry
}

const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xdcb377, emissive: 0x8a6232, emissiveIntensity: 0.75, roughness: 0.85 })

export function pieceMesh(type: PieceType, color: Color) {
  const scale = PIECE_SIZE[type] ?? 0.8
  const one = getSettings().pieceStyle === 'one'
  const char = type === PieceType.KING && color === Color.WHITE ? (one ? '玉' : KING_GOTE) : one ? (type === PieceType.KING ? '王' : PIECE_CHAR[type]) : FACE[type]
  const set = getSettings().pieceSet
  const art = set && set !== 'letters' ? loadedPiece(set, pieceCode(type, color === Color.WHITE && type === PieceType.KING ? Color.WHITE : Color.BLACK)) : undefined
  const map = art ? artTexture(art, `${set}/${pieceCode(type, color)}`) : faceTexture(char, PROMOTED.has(type))
  const lm = lacquerMap(map)
  const finish = PIECE_FINISHES[getSettings().pieceFinish] ?? PIECE_FINISHES.moriage
  const gloss = finish.gloss
  const face = new THREE.MeshPhysicalMaterial({ map, roughness: 1, roughnessMap: lm, normalMap: finish.relief ? reliefNormal(map, finish.relief * scale, komaWidth(scale), scale) : null, clearcoat: gloss, clearcoatMap: lm, clearcoatRoughness: 0.18, envMap: pieceEnv, envMapIntensity: 0.4 })
  const mesh = new THREE.Mesh(pieceGeometry(scale), [hiddenLid, sideMaterial])
  mesh.castShadow = true
  mesh.receiveShadow = true
  const top = new THREE.Mesh(carvedTop(scale, map), face)
  top.castShadow = true
  top.receiveShadow = true
  const bottom = new THREE.Mesh(pieceBottom(scale), sideMaterial)
  mesh.add(top, bottom)
  if (color === Color.WHITE) mesh.rotation.y = Math.PI
  return mesh
}

type Pick = { kind: 'square'; square: Square } | { kind: 'hand'; color: Color; type: PieceType } | { kind: 'arrow'; usi: string }

type SceneState = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  root: THREE.Group
  pieces: THREE.Group
  marks: THREE.Group
  board: THREE.Mesh
  handMeshes: THREE.Object3D[]
  tags: THREE.Object3D[]
  tilt: number
  tiltTarget: number
  animations: { mesh: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; start: number }[]
  drag: { mesh: THREE.Object3D; from: Square | PieceType } | null
  settled?: boolean
  lastTime?: number
}

const layout = { portrait: false, narrow: false }

export function Board3D(props: Board3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const state = useRef<SceneState | null>(null)
  const latest = useRef(props)
  latest.current = props
  const previous = useRef<ImmutablePosition | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9
    preparePieceEnvironment(renderer)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)

    scene.add(new THREE.HemisphereLight(0xc9d6ff, 0x20160c, 0.55))
    const lamp = new THREE.SpotLight(0xffe8c4, 120, 80, Math.PI / 3, 1, 1.2)
    lamp.position.set(-1.5, 18, 2.5)
    lamp.castShadow = true
    lamp.shadow.mapSize.set(2048, 2048)
    lamp.shadow.bias = -0.0004
    scene.add(lamp, lamp.target)
    const fill = new THREE.DirectionalLight(0x8fa6d8, 0.35)
    fill.position.set(8, 6, -6)
    scene.add(fill)

    const root = new THREE.Group()
    scene.add(root)

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.22 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.95
    floor.receiveShadow = true
    scene.add(floor)

    const tone = BOARD_TONE[getSettings().boardStyle]
    const boardMaterials = [woodMaterial(tone.edge, 3), woodMaterial(tone.edge, 5), new THREE.MeshPhysicalMaterial({ map: boardTexture(getSettings().boardStyle), roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.45, envMap: pieceEnv, envMapIntensity: 0.25 }), woodMaterial([150, 104, 50], 9), woodMaterial(tone.edge, 11), woodMaterial(tone.edge, 13)]
    const board = new THREE.Mesh(new THREE.BoxGeometry(9 / 0.9, 0.9, 9 / 0.9), boardMaterials)
    board.position.y = -0.45
    board.castShadow = true
    board.receiveShadow = true
    root.add(board)

    const legMaterial = woodMaterial([120, 78, 36], 17)
    for (const [x, z] of [
      [-3.6, -3.6],
      [3.6, -3.6],
      [-3.6, 3.6],
      [3.6, 3.6],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.6, 16), legMaterial)
      leg.position.set(x, -1.2, z)
      leg.castShadow = true
      root.add(leg)
    }

    const standMaterial = woodMaterial([180, 128, 66], 21)
    const stands = [1, -1].map((side) => {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(STAND, 0.5, STAND), standMaterial)
      stand.castShadow = true
      stand.receiveShadow = true
      root.add(stand)
      return { stand, side }
    })
    const placeStands = () =>
      stands.forEach(({ stand, side }) => {
        const c = standCenter(side === 1 ? Color.BLACK : Color.WHITE)
        stand.scale.set(layout.portrait ? STRIP_W / STAND : 1, 1, layout.portrait ? strip().d / STAND : 1)
        stand.position.set(c.x, -0.55, c.z)
      })
    placeStands()

    const pieces = new THREE.Group()
    const marks = new THREE.Group()
    root.add(pieces, marks)

    state.current = { renderer, scene, camera, root, pieces, marks, board, handMeshes: [], tags: [], tilt: 0, tiltTarget: 0, animations: [], drag: null }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const sideFit = Math.max((2 * (5.17 + STAND)) / (w / h), 10.6)
      const portrait = w < 560 || (h * 10) / sideFit < 540
      const narrow = w < 560
      if (portrait !== layout.portrait || narrow !== layout.narrow) {
        layout.portrait = portrait
        layout.narrow = narrow
        placeStands()
        rebuild(false)
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

    const ray = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
    }

    const localPoint = () => {
      const hit = new THREE.Vector3()
      if (!raycaster.ray.intersectPlane(plane, hit)) return null
      return root.worldToLocal(hit)
    }

    const pick = (): Pick | null => {
      const s = state.current!
      if (latest.current.onArrow) {
        const rect = renderer.domElement.getBoundingClientRect()
        const near = s.tags
          .map((tag) => {
            const p = tag.getWorldPosition(new THREE.Vector3()).project(camera)
            const dx = ((p.x - pointer.x) * rect.width) / 2
            const dy = ((p.y - pointer.y) * rect.height) / 2
            return { tag, d: Math.hypot(dx, dy) }
          })
          .filter((t) => t.d < 22)
          .sort((a, b) => a.d - b.d)[0]
        if (near) return { kind: 'arrow', usi: near.tag.userData.usi as string }
      }
      const handHit = raycaster.intersectObjects(s.handMeshes, false)[0]
      if (handHit) return { kind: 'hand', ...(handHit.object.userData as { color: Color; type: PieceType }) }
      const p = localPoint()
      if (!p) return null
      const file = 5 - Math.round(p.x)
      const rank = Math.round(p.z) + 5
      if (file < 1 || file > 9 || rank < 1 || rank > 9 || Math.abs(p.x) > 4.5 || Math.abs(p.z) > 4.5) return null
      return { kind: 'square', square: new Square(file, rank) }
    }

    let down: { pick: Pick; x: number; y: number } | null = null

    const onDown = (event: PointerEvent) => {
      ray(event)
      const hit = pick()
      if (!hit) return
      down = { pick: hit, x: event.clientX, y: event.clientY }
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      const s = state.current!
      ray(event)
      const hit = pick()
      renderer.domElement.style.cursor = hit ? 'pointer' : 'default'
      if (!down) return
      if (!s.drag && down.pick.kind !== 'arrow' && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) {
        const from = down.pick.kind === 'square' ? down.pick.square : down.pick.type
        const mesh = down.pick.kind === 'square' ? s.pieces.children.find((m) => (m.userData.square as Square | undefined)?.equals(from as Square)) : s.handMeshes.find((m) => m.userData.type === from && m.userData.color === (down!.pick as { color: Color }).color)
        if (mesh) {
          if (down.pick.kind === 'square') latest.current.onSquare(down.pick.square)
          else latest.current.onHand(down.pick.color, down.pick.type)
          s.drag = { mesh, from }
        }
      }
      if (s.drag) {
        const p = localPoint()
        if (p) s.drag.mesh.position.set(p.x, 0.6, p.z)
      }
    }

    const onUp = (event: PointerEvent) => {
      const s = state.current!
      ray(event)
      const hit = pick()
      if (s.drag) {
        const { from } = s.drag
        s.drag = null
        if (hit?.kind === 'square') latest.current.onDrop(from, hit.square)
        rebuild(true)
      } else if (down && hit) {
        if (hit.kind === 'square') latest.current.onSquare(hit.square)
        else if (hit.kind === 'arrow') latest.current.onArrow?.(hit.usi)
        else latest.current.onHand(hit.color, hit.type)
      }
      down = null
    }

    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerup', onUp)

    let frame = 0
    const loop = (time: number) => {
      const s = state.current!
      const dt = Math.min(0.5, (time - (s.lastTime ?? time)) / 1000)
      s.lastTime = time
      s.tilt += (s.tiltTarget - s.tilt) * (1 - Math.exp(-dt * 9))
      const flip = latest.current.flipped ? Math.PI : 0
      if (!s.settled) {
        s.root.rotation.y = flip
        s.settled = true
      }
      s.root.rotation.y += (flip - s.root.rotation.y) * (1 - Math.exp(-dt * 12))
      if (Math.abs(flip - s.root.rotation.y) < 0.002) s.root.rotation.y = flip
      const fit = (layout.portrait ? Math.max((layout.narrow ? 10.1 : 10.6) / camera.aspect, 2 * (strip().z + strip().d / 2) + 0.2) : Math.max((2 * (5.17 + STAND)) / camera.aspect, 10.6)) * (1 + (layout.portrait ? 0.06 : 0.16) * s.tilt)
      const distance = fit / (2 * Math.tan((camera.fov * Math.PI) / 360))
      const angle = 0.02 + s.tilt * 0.8
      const pan = layout.portrait ? 0 : s.tilt * 0.6
      camera.position.set(pan, Math.cos(angle) * distance, Math.sin(angle) * distance)
      camera.lookAt(pan, 0, s.tilt * 0.4)
      for (const anim of [...s.animations]) {
        const t = Math.min(1, (time - anim.start) / 220)
        const e = 1 - Math.pow(1 - t, 3)
        anim.mesh.position.lerpVectors(anim.from, anim.to, e)
        anim.mesh.position.y = anim.to.y + Math.sin(Math.PI * t) * 0.5
        if (t >= 1) s.animations.splice(s.animations.indexOf(anim), 1)
      }
      renderer.render(scene, camera)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    document.fonts.load('800 64px "Shippori Mincho B1"').then(() => {
      faceCache.clear()
      rebuild(false)
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      state.current = null
    }
  }, [])

  const rebuild = (animate: boolean) => {
    const s = state.current
    if (!s) return
    const { position, lastMove } = latest.current
    s.pieces.clear()
    s.handMeshes = []
    for (const square of position.board.listNonEmptySquares()) {
      const piece = position.board.at(square)!
      const mesh = pieceMesh(piece.type, piece.color)
      mesh.position.set(squareX(square.file), 0, squareZ(square.rank))
      mesh.userData.square = square
      s.pieces.add(mesh)
      if (animate && lastMove && lastMove.slice(2, 4) === square.usi) {
        const from = lastMove[1] === '*' ? standCenter(piece.color) : (() => {
          const sq = Square.newByUSI(lastMove.slice(0, 2)) ?? Square.newByUSI(lastMove.slice(2, 4))!
          return new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))
        })()
        s.animations.push({ mesh, from, to: mesh.position.clone(), start: performance.now() })
        mesh.position.copy(from)
      }
    }
    for (const color of [Color.BLACK, Color.WHITE]) {
      for (const spot of handLayout(position, color)) {
        const mesh = pieceMesh(spot.type, color)
        mesh.rotation.y += spot.rot
        mesh.scale.setScalar(0.96 * spot.scale)
        mesh.position.set(spot.x, -0.3 + (spot.lift ?? 0), spot.z)
        mesh.castShadow = false
        mesh.userData = { color, type: spot.type }
        s.pieces.add(mesh)
        s.handMeshes.push(mesh)
        if (spot.count && spot.count > 1) {
          const badge = badgeSprite(String(spot.count), '#2a241e')
          badge.scale.setScalar(0.36)
          const sign = color === Color.BLACK ? 1 : -1
          badge.position.set(spot.x + sign * 0.3, 0.4, spot.z - sign * 0.3)
          s.pieces.add(badge)
        }
      }
    }
    drawMarks()
  }

  const drawMarks = () => {
    const s = state.current
    if (!s) return
    const { lastMove, selected, selectedColor, targets, arrows } = latest.current
    s.marks.clear()
    const tile = (square: Square, color: number, opacity: number) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }))
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(squareX(square.file), 0.004, squareZ(square.rank))
      s.marks.add(mesh)
    }
    if (lastMove) {
      const to = Square.newByUSI(lastMove.slice(2, 4))
      if (to) tile(to, 0xe8a63a, 0.55)
      if (lastMove[1] !== '*') {
        const from = Square.newByUSI(lastMove.slice(0, 2))
        if (from) tile(from, 0xe8a63a, 0.38)
      }
    }
    if (latest.current.checkSquare) tile(latest.current.checkSquare, 0xe0301e, 0.6)
    if (selected instanceof Square) {
      tile(selected, 0xfff1c9, 0.45)
      const frame = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.69, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xc8442f, depthWrite: false }))
      frame.rotation.x = -Math.PI / 2
      frame.position.set(squareX(selected.file), 0.006, squareZ(selected.rank))
      s.marks.add(frame)
    }
    if (selected !== null && !(selected instanceof Square) && selectedColor !== undefined) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.44, 0.48, 40), new THREE.MeshBasicMaterial({ color: 0xc8442f }))
      const slot = handSpot(latest.current.position, selectedColor, selected) ?? standCenter(selectedColor)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(slot.x, -0.29, slot.z)
      s.marks.add(ring)
    }
    for (const target of targets) {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: 0x5a3a1c, transparent: true, opacity: 0.5, depthWrite: false }))
      dot.rotation.x = -Math.PI / 2
      dot.position.set(squareX(target.file), 0.006, squareZ(target.rank))
      s.marks.add(dot)
    }
    s.tags = []
    const stacked = new Map<string, number>()
    for (const arrow of arrows) {
      const end = arrow.usi.slice(2, 4)
      const stack = stacked.get(end) ?? 0
      if (arrow.label) stacked.set(end, stack + 1)
      const group = arrowMesh(arrow, latest.current.position, stack)
      group.traverse((o) => o.userData.usi && s.tags.push(o))
      s.marks.add(group)
    }
    const flipSign = latest.current.flipped ? -1 : 1
    for (let i = 1; i <= 9; i++) {
      const file = coordSprite(String(i))
      file.position.set(squareX(i), 0.05, -4.75 * flipSign)
      s.marks.add(file)
      const rank = coordSprite('一二三四五六七八九'[i - 1])
      rank.position.set(4.75 * flipSign, 0.05, squareZ(i))
      s.marks.add(rank)
    }
    for (const sq of latest.current.peek ?? []) {
      tile(sq, 0xc8442f, 0.26)
      const edge = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.69, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xb33a26, transparent: true, opacity: 0.7, depthWrite: false }))
      edge.rotation.x = -Math.PI / 2
      edge.position.set(squareX(sq.file), 0.005, squareZ(sq.rank))
      s.marks.add(edge)
    }
    if (latest.current.peekFrom) tile(latest.current.peekFrom, 0xc8442f, 0.22)
    for (const h of latest.current.heat ?? []) {
      tile(h.square, h.color, h.opacity)
      if (h.label) {
        const tag = coordSprite(h.label)
        tag.scale.setScalar(0.34)
        tag.position.set(squareX(h.square.file) + 0.32, 0.06, squareZ(h.square.rank) + 0.3)
        s.marks.add(tag)
      }
    }
    for (const castle of latest.current.castles ?? []) s.marks.add(castleBox(castle))
    const stamp = latest.current.stamp
    if (stamp) {
      const sq = Square.newByUSI(stamp.square)
      if (sq) {
        const badge = badgeSprite(stamp.text, stamp.color)
        const flip = latest.current.flipped ? -1 : 1
        badge.position.set(squareX(sq.file) + 0.36 * flip, 0.55, squareZ(sq.rank) - 0.36 * flip)
        s.marks.add(badge)
      }
    }
    const animating = new Set(s.animations.map((a) => a.mesh))
    for (const piece of s.pieces.children) {
      const sq = piece.userData.square as Square | undefined
      if (sq && !animating.has(piece)) piece.position.y = 0
    }
  }

  useEffect(() => {
    const prev = previous.current
    previous.current = props.position
    rebuild(prev !== null && prev.sfen !== props.position.sfen)
  }, [props.position])

  useEffect(() => {
    drawMarks()
  }, [props.selected, props.targets, props.arrows, props.lastMove, props.castles, props.stamp, props.flipped, props.peek, props.peekFrom, props.checkSquare, props.heat])

  useEffect(() => {
    if (state.current) state.current.tiltTarget = props.tilted ? 1 : 0
  }, [props.tilted])

  useEffect(() => {
    if (state.current) state.current.settled = false
  }, [props.snapKey])

  return <div className="board3d" ref={host} />
}

type HandSpot = { type: PieceType; x: number; z: number; rot: number; scale: number; count?: number; lift?: number }

const BIG = HAND_ORDER.filter((t) => t !== PieceType.PAWN)

function standCenter(color: Color) {
  const sign = color === Color.BLACK ? 1 : -1
  return layout.portrait ? new THREE.Vector3(0, -0.3, sign * strip().z) : new THREE.Vector3(sign * (5.12 + STAND / 2), -0.3, sign * (5.0 - STAND / 2))
}

const STAND = 3.4
const STRIP_W = 10
const strip = () => (layout.narrow ? { d: 0.95, z: 5.08 + 0.95 / 2, k: 0.84 } : { d: 1.3, z: 5.15 + 1.3 / 2, k: 1 })

function handLayout(position: ImmutablePosition, color: Color): HandSpot[] {
  const hand = position.hand(color)
  if (layout.portrait) {
    const c = standCenter(color)
    const sign = color === Color.BLACK ? 1 : -1
    const types = [...BIG, PieceType.PAWN].filter((t) => hand.count(t) > 0)
    return types.map((type, i) => ({ type, x: c.x + sign * (STRIP_W / 2 - 0.6 - i * 1.02), z: c.z, rot: 0, scale: strip().k, count: hand.count(type) }))
  }
  const groups = [
    [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER],
    [PieceType.KNIGHT, PieceType.LANCE],
    [PieceType.PAWN],
  ]
    .map((types) => types.flatMap((t) => Array(hand.count(t)).fill(t) as PieceType[]))
    .filter((g) => g.length)
  const size = STAND - 0.45
  const pivot = 3.2
  const base = (t: PieceType, k: number) => (PIECE_SIZE[t] ?? 0.8) * 0.96 * k
  const gaps = (row: PieceType[], k: number) => row.slice(1).map((t, i) => ((base(row[i], k) + base(t, k)) * 0.8) / 2)
  const rowRadius = (row: PieceType[], k: number) => Math.max(pivot * k, gaps(row, k).reduce((a, b) => a + b, 0) / 0.5)
  const rowSteps = (row: PieceType[], k: number) => gaps(row, k).map((g) => g / rowRadius(row, k))
  const rowWidth = (row: PieceType[], k: number) => {
    const angle = rowSteps(row, k).reduce((a, b) => a + b, 0)
    return 2 * rowRadius(row, k) * Math.sin(angle / 2) + base(row[0], k) * 0.9
  }
  const rowSag = (row: PieceType[], k: number) => rowRadius(row, k) * (1 - Math.cos(rowSteps(row, k).reduce((a, b) => a + b, 0) / 2))
  const rowHeight = (row: PieceType[], k: number) => Math.max(...row.map((t) => base(t, k))) * 1.25 + rowSag(row, k)
  let k = 1
  let rows: PieceType[][] = []
  for (let attempt = 0; attempt < 14; attempt++) {
    rows = []
    for (const g of groups) {
      let row: PieceType[] = []
      for (const t of g) {
        if (row.length && (row.length >= 6 || rowWidth([...row, t], k) > size)) {
          rows.push(row)
          row = []
        }
        row.push(t)
      }
      rows.push(row)
    }
    const height = rows.reduce((sum, row) => sum + rowHeight(row, k), 0)
    if (height <= size) break
    k *= 0.92
  }
  const c = standCenter(color)
  const sign = color === Color.BLACK ? 1 : -1
  const heights = rows.map((row) => rowHeight(row, k))
  const total = heights.reduce((a, b) => a + b, 0)
  const spots: HandSpot[] = []
  let offset = -total / 2
  rows.forEach((row, r) => {
    const v = offset + heights[r] / 2 + rowSag(row, k) / 2
    offset += heights[r]
    const radius = rowRadius(row, k)
    const steps = rowSteps(row, k)
    const span = steps.reduce((a, b) => a + b, 0)
    let theta = -span / 2
    row.forEach((type, i) => {
      if (i > 0) theta += steps[i - 1]
      spots.push({ type, x: c.x + sign * radius * Math.sin(theta), z: c.z + sign * (v - radius * (1 - Math.cos(theta))), rot: theta, scale: k, lift: (row.length - 1 - i) * 0.02 })
    })
  })
  return spots
}

function handSpot(position: ImmutablePosition, color: Color, type: PieceType) {
  const spots = handLayout(position, color).filter((p) => p.type === type)
  const spot = spots[Math.floor(spots.length / 2)]
  return spot ? new THREE.Vector3(spot.x, -0.3, spot.z) : null
}

const DROP_TYPE: Record<string, PieceType> = { P: PieceType.PAWN, L: PieceType.LANCE, N: PieceType.KNIGHT, S: PieceType.SILVER, G: PieceType.GOLD, B: PieceType.BISHOP, R: PieceType.ROOK }

const coordCache = new Map<string, THREE.Texture>()

function coordSprite(text: string) {
  const cacheKey = `${text}|${getSettings().boardStyle}`
  let texture = coordCache.get(cacheKey)
  if (!texture) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = getSettings().boardStyle === 'dark' ? 'rgba(250, 232, 196, 0.92)' : 'rgba(40, 22, 8, 0.85)'
    ctx.font = '800 40px "Shippori Mincho B1", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 32, 34)
    texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    coordCache.set(cacheKey, texture)
  }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
  sprite.scale.setScalar(0.3)
  sprite.renderOrder = 9
  return sprite
}

function arrowMesh(arrow: BoardArrow, position: ImmutablePosition, stack = 0) {
  const mover = position.color
  const to = Square.newByUSI(arrow.usi.slice(2, 4))
  if (!to || !/^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(arrow.usi)) return new THREE.Group()
  const end = new THREE.Vector3(squareX(to.file), 0.05, squareZ(to.rank))
  let start: THREE.Vector3
  if (arrow.usi[1] === '*') {
    const slot = handSpot(position, mover, DROP_TYPE[arrow.usi[0]]) ?? standCenter(mover)
    start = new THREE.Vector3(slot.x, 0.05, slot.z)
  } else {
    const from = Square.newByUSI(arrow.usi.slice(0, 2))
    if (!from) return new THREE.Group()
    start = new THREE.Vector3(squareX(from.file), 0.05, squareZ(from.rank))
  }
  const dir = end.clone().sub(start)
  const length = dir.length()
  const shaft = Math.max(0.01, length - 0.45)
  const w = arrow.dashed ? 0.06 : 0.09
  const head = arrow.dashed ? 0.2 : 0.26
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(arrow.color), transparent: true, opacity: arrow.dashed ? 0.7 : 0.82, depthTest: false })
  const shapes: THREE.Shape[] = []
  const tip = new THREE.Shape()
  tip.moveTo(head, shaft)
  tip.lineTo(0, length - 0.1)
  tip.lineTo(-head, shaft)
  tip.closePath()
  shapes.push(tip)
  const segment = arrow.dashed ? 0.16 : shaft
  const gap = arrow.dashed ? 0.1 : 0
  for (let y = 0; y < shaft - 0.001; y += segment + gap) {
    const part = new THREE.Shape()
    const top = Math.min(shaft, y + segment)
    part.moveTo(-w, y)
    part.lineTo(w, y)
    part.lineTo(w, top)
    part.lineTo(-w, top)
    part.closePath()
    shapes.push(part)
  }
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shapes), material)
  mesh.renderOrder = arrow.dashed ? 9 : 10
  mesh.rotation.x = -Math.PI / 2
  const group = new THREE.Group()
  group.add(mesh)
  if (arrow.label) {
    const tag = arrowTag(arrow.label, arrow.color)
    tag.userData.usi = arrow.usi
    tag.position.set(0, 0.3, -Math.max(0.3, length - 0.1 - stack * 0.55))
    group.add(tag)
  }
  group.position.copy(start).setY(0.3)
  group.rotation.y = Math.atan2(-dir.x, -dir.z)
  return group
}

function arrowTag(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 72
  const ctx = canvas.getContext('2d')!
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
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
  sprite.scale.set(0.56, 0.25, 1)
  sprite.renderOrder = 13
  return sprite
}

function castleBox({ squares, color, label }: { squares: Square[]; color: string; label: string }) {
  const xs = squares.map((sq) => squareX(sq.file))
  const zs = squares.map((sq) => squareZ(sq.rank))
  const minX = Math.min(...xs) - 0.5
  const maxX = Math.max(...xs) + 0.5
  const minZ = Math.min(...zs) - 0.5
  const maxZ = Math.max(...zs) + 0.5
  const group = new THREE.Group()
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.85, depthWrite: false })
  const t = 0.06
  const bar = (w: number, d: number, x: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(x, 0.008, z)
    group.add(mesh)
  }
  bar(maxX - minX + t, t, (minX + maxX) / 2, minZ)
  bar(maxX - minX + t, t, (minX + maxX) / 2, maxZ)
  bar(t, maxZ - minZ, minX, (minZ + maxZ) / 2)
  bar(t, maxZ - minZ, maxX, (minZ + maxZ) / 2)
  const tag = labelSprite(label, color)
  tag.position.set((minX + maxX) / 2, 0.5, (minZ + maxZ) / 2 > 0 ? minZ - 0.22 : maxZ + 0.22)
  group.add(tag)
  return group
}

function labelSprite(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(4, 8, 248, 48, 10)
  ctx.fill()
  ctx.fillStyle = '#fbf6ec'
  ctx.font = '800 34px "Shippori Mincho B1", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
  sprite.scale.set(1.6, 0.4, 1)
  sprite.renderOrder = 12
  return sprite
}

function badgeSprite(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 96
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(48, 48, 44, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fbf6ec'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.font = `800 ${text.length > 1 ? 40 : 50}px "Shippori Mincho B1", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 48, 52)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
  sprite.scale.setScalar(0.5)
  sprite.renderOrder = 13
  return sprite
}
