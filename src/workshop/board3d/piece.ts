import * as THREE from 'three'
import { Color, PieceType, promotedPieceType, unpromotedPieceType } from 'tsshogi'
import { PIECE_FINISHES, pieceTone, getSettings, type PieceAppearance, pieceFinishOptions } from '../settings'
import { loadedPiece, pieceCode } from '../pieceSets'
import { komaDepth, komaTaper, komaWidth, pieceScale } from './dimensions'
import { PROMOTED, faceText, piecePolygon, type Poly } from '../koma'
import { environmentMap } from './materials'
import { finishMask, lacquerMap, reliefNormal } from './relief'
import { artTexture, faceTexture, glyphTexture } from './textures'

const finish = (appearance?: PieceAppearance) => {
  const settings = { ...getSettings(), ...appearance }
  const options = pieceFinishOptions(settings.pieceMaterial)
  const selected = options.includes(settings.pieceFinish) ? settings.pieceFinish : options[0]
  const spec = PIECE_FINISHES[selected]
  return { ...spec, kind: selected }
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

const topCache = new WeakMap<object, Map<number, THREE.BufferGeometry>>()

function carvedTop(scale: number, map: THREE.Texture, segments: number, appearance?: PieceAppearance) {
  const glyph = map.userData.glyph ?? map.userData.glyphCanvas ?? map
  let byScale = topCache.get(glyph)
  if (!byScale) topCache.set(glyph, (byScale = new Map()))
  const spec = finish(appearance)
  const depth = spec.relief
  const key = ((Math.round(scale * 1000) * 1000 + Math.round(depth * 10000)) * 1000 + segments) * 10 + ['insatsu', 'oshi', 'molded', 'kaki', 'hori', 'fukabori', 'horiume', 'moriage'].indexOf(spec.kind)
  const cached = byScale.get(key)
  if (cached) return cached
  const ink = finishMask(map, spec.kind)
  const relief = depth * scale
  const w = komaWidth(scale)
  const h = scale
  const poly = piecePolygon(scale)
  const top = komaDepth(scale) + 0.024
  const n = segments
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
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 - pos.getX(i) / komaWidth(scale), pos.getY(i) / scale + 0.5)
  geometry.rotateX(-Math.PI / 2)
  geometry.scale(1, -1, 1)
  const index = geometry.index!
  for (let i = 0; i < index.count; i += 3) {
    const second = index.getX(i + 1)
    index.setX(i + 1, index.getX(i + 2))
    index.setX(i + 2, second)
  }
  geometry.computeVertexNormals()
  geometry.translate(0, -0.02, 0)
  bottomCache.set(scale, geometry)
  return geometry
}

const hiddenLid = new THREE.MeshBasicMaterial({ visible: false })
const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xdcb377, emissive: 0x8a6232, emissiveIntensity: 0.75, roughness: 0.85 })

export const pieceFaceUrl = (type: PieceType, color: Color) => (faceMap(type, color).image as HTMLCanvasElement).toDataURL()

function faceMap(type: PieceType, color: Color, seed = 1, appearance?: PieceAppearance) {
  const gote = color === Color.WHITE
  const set = appearance?.pieceSet ?? getSettings().pieceSet
  const art = set && set !== 'letters' ? loadedPiece(set, pieceCode(type, gote && type === PieceType.KING ? Color.WHITE : Color.BLACK)) : undefined
  if (art) return artTexture(art, `${set}/${pieceCode(type, color)}/${appearance?.pieceGuide ?? getSettings().pieceGuide}`, seed, appearance)
  return faceTexture(faceText(type, color, appearance?.pieceStyle ?? getSettings().pieceStyle), PROMOTED.has(type), seed, appearance, pieceCode(type, color))
}

export function pieceMesh(type: PieceType, color: Color, seed = [...pieceCode(unpromotedPieceType(type), color)].reduce((value, char) => value * 31 + char.charCodeAt(0), color === Color.BLACK ? 17 : 29), segments = 200, appearance?: PieceAppearance, envMap = environmentMap(), flat = false) {
  const scale = pieceScale(type)
  const map = faceMap(type, color, seed, appearance)
  const inkMap = faceMap(type, color, 1, appearance)
  const settings = { ...getSettings(), ...appearance }
  const plastic = settings.pieceMaterial === 'plastic'
  const frosted = settings.pieceMaterial === 'frostedGlass'
  const glass = settings.pieceMaterial === 'glass' || frosted
  if (glass) segments = Math.min(segments, 48)
  const { relief, gloss, kind, coating } = finish(appearance)
  const lacquer = coating === 'lacquer'
  const lm = lacquerMap(inkMap, lacquer ? 0.5 : 0)
  const face = plastic && !relief ? new THREE.MeshBasicMaterial({ map }) : new THREE.MeshPhysicalMaterial({ map: glass ? glyphTexture(map) : map, transparent: glass, alphaTest: glass ? 0.01 : 0, depthWrite: !glass, emissive: plastic ? 0xffffff : 0x000000, emissiveMap: plastic ? map : null, emissiveIntensity: plastic ? 0.65 : 0, roughness: 1, roughnessMap: lm, normalMap: relief ? reliefNormal(inkMap, relief * scale, komaWidth(scale), scale, kind) : null, normalScale: new THREE.Vector2(0.5, 0.5), clearcoat: lacquer ? Math.max(0.375, gloss * 0.5) : 0, clearcoatMap: lm, clearcoatRoughness: lacquer ? 0.3 : 1, specularIntensity: lacquer ? 0.5 : 0.15, envMap, envMapIntensity: lacquer ? 0.35 : 0.08 })
  const tone = pieceTone(settings.pieceMaterial, settings.pieceColor)
  const glassMaterial = () => flat ? new THREE.MeshBasicMaterial({ color: `rgb(${tone.join(',')})`, transparent: true, opacity: frosted ? 0.62 : 0.28, depthWrite: false, side: THREE.FrontSide }) : new THREE.MeshPhysicalMaterial({ color: `rgb(${tone.join(',')})`, roughness: frosted ? 0.75 : 0.06, metalness: 0, transmission: 0, ior: 1.5, thickness: komaDepth(scale), transparent: true, opacity: frosted ? 0.62 : 0.28, depthWrite: false, clearcoat: frosted ? 0.08 : 0.5, clearcoatRoughness: frosted ? 0.8 : 0.15, envMap, envMapIntensity: frosted ? 0.2 : 0.6, side: THREE.FrontSide })
  const side = glass ? glassMaterial() : settings.pieceColor !== 'natural' || plastic ? new THREE.MeshBasicMaterial({ color: `rgb(${tone.map((channel) => Math.round(channel * 0.9)).join(',')})` }) : sideMaterial.clone()
  if (!plastic && !glass && settings.pieceColor === 'natural') side.color.set(`rgb(${tone.join(',')})`)
  const mesh = new THREE.Mesh(pieceBody(scale), [hiddenLid, side])
  mesh.userData.grainSeed = seed
  mesh.userData.type = type
  mesh.userData.color = color
  mesh.castShadow = !glass
  mesh.receiveShadow = !glass
  const top = new THREE.Mesh(carvedTop(scale, inkMap, segments, appearance), face)
  top.castShadow = !glass
  top.receiveShadow = !plastic && !glass
  const reverse = PROMOTED.has(type) ? unpromotedPieceType(type) : promotedPieceType(type)
  const backMap = type === PieceType.KING || type === PieceType.GOLD ? faceTexture('', false, seed, { ...appearance, pieceGuide: 'none' }) : faceMap(reverse, color, seed, appearance)
  const backFace = glass ? face.clone() : new THREE.MeshBasicMaterial({ map: backMap, side: THREE.DoubleSide })
  if (glass) {
    backFace.map = glyphTexture(backMap)
    backFace.side = THREE.DoubleSide
    backFace.depthWrite = false
    if (backFace instanceof THREE.MeshPhysicalMaterial) {
      backFace.roughnessMap = lacquerMap(backMap, lacquer ? 0.5 : 0)
      backFace.clearcoatMap = backFace.roughnessMap
      backFace.normalMap = relief ? reliefNormal(backMap, relief * scale, komaWidth(scale), scale, kind) : null
    }
  }
  const bottom = new THREE.Mesh(pieceBottom(scale), backFace)
  if (glass) bottom.position.y = 0.022
  bottom.castShadow = !glass
  mesh.add(top, bottom)
  if (glass) {
    const frontSurface = new THREE.Mesh(carvedTop(scale, inkMap, segments, { ...appearance, pieceFinish: 'horiume' }), glassMaterial())
    frontSurface.position.y = -0.001
    const backMaterial = glassMaterial()
    backMaterial.side = THREE.DoubleSide
    const backSurface = new THREE.Mesh(pieceBottom(scale), backMaterial)
    backSurface.position.y = 0.021
    bottom.renderOrder = 1
    backSurface.renderOrder = 2
    mesh.renderOrder = 3
    frontSurface.renderOrder = 4
    top.renderOrder = 5
    mesh.add(frontSurface, backSurface)
  }
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
