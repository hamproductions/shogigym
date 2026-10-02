import * as THREE from 'three'
import { Color, PieceType } from 'tsshogi'
import { PIECE_CHAR } from '../../shogi'
import { PIECE_FINISHES, getSettings } from '../settings'
import { loadedPiece, pieceCode } from '../pieceSets'
import { SIDE_COT, TIP_SLOPE, komaDepth, komaTaper, komaWidth, pieceScale } from './dimensions'
import { environmentMap } from './materials'
import { inkMask, lacquerMap, reliefNormal } from './relief'
import { artTexture, faceTexture } from './textures'

type Poly = [number, number][]

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

const finish = () => PIECE_FINISHES[getSettings().pieceFinish] ?? PIECE_FINISHES.moriage

function piecePolygon(scale: number): Poly {
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

const pieceShape = (scale: number) => new THREE.Shape(piecePolygon(scale).map(([x, y]) => new THREE.Vector2(x, y)))

function inside(poly: Poly, x: number, y: number) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function nearestOnPolygon(poly: Poly, x: number, y: number): [number, number] {
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

const bodyCache = new Map<number, THREE.ExtrudeGeometry>()

function pieceBody(scale: number) {
  const cached = bodyCache.get(scale)
  if (cached) return cached
  const w = komaWidth(scale)
  const h = scale
  const geometry = new THREE.ExtrudeGeometry(pieceShape(scale), { depth: komaDepth(scale), bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 })
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + h * 0.5) / h
    pos.setZ(i, pos.getZ(i) * (1 - (1 - komaTaper(scale)) * Math.min(1, Math.max(0, t))))
  }
  geometry.computeVertexNormals()
  geometry.rotateX(-Math.PI / 2)
  bodyCache.set(scale, geometry)
  return geometry
}

const topCache = new WeakMap<THREE.Texture, Map<number, THREE.BufferGeometry>>()

function carvedTop(scale: number, map: THREE.Texture) {
  let byScale = topCache.get(map)
  if (!byScale) topCache.set(map, (byScale = new Map()))
  const { relief: depth } = finish()
  const key = Math.round(scale * 1000) * 1000 + Math.round(depth * 1000)
  const cached = byScale.get(key)
  if (cached) return cached
  const ink = inkMask(map)
  const relief = depth * scale
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
  const geometry = new THREE.ShapeGeometry(pieceShape(scale))
  geometry.rotateX(-Math.PI / 2)
  geometry.scale(1, -1, 1)
  geometry.translate(0, -0.02, 0)
  bottomCache.set(scale, geometry)
  return geometry
}

const hiddenLid = new THREE.MeshBasicMaterial({ visible: false })
const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xdcb377, emissive: 0x8a6232, emissiveIntensity: 0.75, roughness: 0.85 })
const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0xdcb377, emissive: 0x8a6232, emissiveIntensity: 0.75, roughness: 0.85, side: THREE.DoubleSide })

function faceMap(type: PieceType, color: Color) {
  const one = getSettings().pieceStyle === 'one'
  const gote = color === Color.WHITE
  const set = getSettings().pieceSet
  const art = set && set !== 'letters' ? loadedPiece(set, pieceCode(type, gote && type === PieceType.KING ? Color.WHITE : Color.BLACK)) : undefined
  if (art) return artTexture(art, `${set}/${pieceCode(type, color)}`)
  const char = type === PieceType.KING && gote ? (one ? '玉' : '玉将') : one ? (type === PieceType.KING ? '王' : PIECE_CHAR[type]) : FACE[type]
  return faceTexture(char, PROMOTED.has(type))
}

export function pieceMesh(type: PieceType, color: Color) {
  const scale = pieceScale(type)
  const map = faceMap(type, color)
  const lm = lacquerMap(map)
  const { relief, gloss } = finish()
  const face = new THREE.MeshPhysicalMaterial({ map, roughness: 1, roughnessMap: lm, normalMap: relief ? reliefNormal(map, relief * scale, komaWidth(scale), scale) : null, normalScale: new THREE.Vector2(0.5, 0.5), clearcoat: gloss * 0.5, clearcoatMap: lm, clearcoatRoughness: 0.55, specularIntensity: 0.35, envMap: environmentMap(), envMapIntensity: 0.08 })
  const mesh = new THREE.Mesh(pieceBody(scale), [hiddenLid, sideMaterial])
  mesh.castShadow = true
  mesh.receiveShadow = true
  const top = new THREE.Mesh(carvedTop(scale, map), face)
  top.castShadow = true
  top.receiveShadow = true
  mesh.add(top, new THREE.Mesh(pieceBottom(scale), bottomMaterial))
  if (color === Color.WHITE) mesh.rotation.y = Math.PI
  return mesh
}

export function ghostPiece(type: PieceType, color: Color) {
  const ghost = pieceMesh(type, color)
  ghost.traverse((o) => {
    const m = (o as THREE.Mesh).material
    for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
      const clone = mat.clone()
      clone.transparent = true
      clone.opacity = 0.4
      clone.depthWrite = false
      ;(o as THREE.Mesh).material = clone
    }
    o.castShadow = false
  })
  return ghost
}
