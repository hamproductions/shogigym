import * as THREE from 'three'
import { Color, PieceType, promotedPieceType, unpromotedPieceType } from 'tsshogi'
import { PIECE_FINISHES, pieceTone, getSettings, type PieceAppearance, pieceFinishOptions } from '@/appearance/settings'
import { loadedPiece, pieceCode } from '@/appearance/pieceSets'
import { komaDepth, komaTaper, komaWidth, pieceScale } from './dimensions'
import { PROMOTED, faceText, piecePolygon, type Poly } from '@/rendering/koma'
import { environmentMap } from './materials'
import { finishMask, lacquerMap, reliefNormal } from './relief'
import { artTexture, faceTexture, glyphTexture, onFaceTexturesCleared, pieceSurface, recall, remember, srgbTexture } from './textures'

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

// Half the piece outline's width at height y, so grain on a tapered wall stays parallel to its edge.
function halfWidthAt(poly: Poly, y: number) {
  let half = 0
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + 1) % poly.length]
    if (ay === by || y < Math.min(ay, by) || y > Math.max(ay, by)) continue
    half = Math.max(half, Math.abs(ax + ((bx - ax) * (y - ay)) / (by - ay)))
  }
  return half
}

const bodyCache = new Map<number, THREE.ExtrudeGeometry>()

function pieceBody(scale: number) {
  const cached = bodyCache.get(scale)
  if (cached) return cached
  const w = komaWidth(scale)
  const h = scale
  const geometry = new THREE.ExtrudeGeometry(pieceShape(scale), {
    depth: komaDepth(scale),
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
  })
  const { uv } = geometry.attributes
  const pos = geometry.attributes.position
  const depth = komaDepth(scale)
  const poly = piecePolygon(scale)
  const sideGroup = geometry.groups.find((group) => group.materialIndex === 1)
  const sideStart = sideGroup?.start ?? Infinity
  const sideEnd = sideGroup ? sideGroup.start + sideGroup.count : -1
  const { index } = geometry
  const isSide = new Uint8Array(uv.count)
  for (let i = sideStart; i < sideEnd; i++) isSide[index ? index.getX(i) : i] = 1
  // Walls facing along the piece length show the board's cross-section, so their grain runs through the thickness.
  const isEnd = new Uint8Array(uv.count)
  if (!index)
    for (let i = sideStart; i + 2 < sideEnd; i += 3) {
      const nx = (pos.getY(i + 1) - pos.getY(i)) * (pos.getZ(i + 2) - pos.getZ(i)) - (pos.getZ(i + 1) - pos.getZ(i)) * (pos.getY(i + 2) - pos.getY(i))
      const ny = (pos.getZ(i + 1) - pos.getZ(i)) * (pos.getX(i + 2) - pos.getX(i)) - (pos.getX(i + 1) - pos.getX(i)) * (pos.getZ(i + 2) - pos.getZ(i))
      if (Math.abs(ny) > Math.abs(nx)) isEnd[i] = isEnd[i + 1] = isEnd[i + 2] = 1
    }
  for (let i = 0; i < uv.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    // Grain runs along the piece length on every face; walls continue the top face's UVs at the edge and
    // slide sideways with depth, as if the piece was cut from one block of wood.
    if (!isSide[i]) {
      uv.setXY(i, x / w + 0.5, y / h + 0.5)
      continue
    }
    const sink = (pos.getZ(i) - depth) / depth
    if (isEnd[i]) {
      uv.setXY(i, x / w + 0.5, y / h + 0.5 + sink * 0.1)
      continue
    }
    const half = halfWidthAt(poly, y)
    uv.setXY(i, (half ? x / (2 * half) : x / w) + 0.5 + sink * 0.6, y / h + 0.5)
  }
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + h * 0.5) / h
    pos.setZ(i, pos.getZ(i) * (1 - (1 - komaTaper(scale)) * Math.min(1, Math.max(0, t))))
  }
  geometry.computeVertexNormals()
  geometry.rotateX(-Math.PI / 2)
  bodyCache.set(scale, geometry)
  return geometry
}

// Carved faces are keyed by glyph canvas; bounded, and dropped geometry is disposed so its GPU buffers are freed.
const TOP_LIMIT = 192
const topCache = new Map<object, Map<number, THREE.BufferGeometry>>()
const flatCache = new Map<number, THREE.BufferGeometry>()

const disposeTops = (byScale: Map<number, THREE.BufferGeometry>) => byScale.forEach((geometry) => geometry.dispose())

onFaceTexturesCleared(() => {
  topCache.forEach(disposeTops)
  topCache.clear()
})

// A print or lacquer face with no relief is a plain tapered plane: triangulate the outline instead of a dense grid.
function flatTop(scale: number) {
  const cached = flatCache.get(scale)
  if (cached) return cached
  const w = komaWidth(scale)
  const geometry = new THREE.ShapeGeometry(pieceShape(scale))
  const pos = geometry.attributes.position
  const { uv } = geometry.attributes
  const top = komaDepth(scale) + 0.024
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const v = y / scale + 0.5
    uv.setXY(i, x / w + 0.5, v)
    pos.setZ(i, top * (1 - (1 - komaTaper(scale)) * Math.min(1, Math.max(0, v))))
  }
  geometry.computeVertexNormals()
  geometry.rotateX(-Math.PI / 2)
  flatCache.set(scale, geometry)
  return geometry
}

function carvedTop(scale: number, map: THREE.Texture, segments: number, appearance?: PieceAppearance) {
  const glyph = map.userData.glyph ?? map.userData.glyphCanvas ?? map
  const spec = finish(appearance)
  if (!spec.relief) return flatTop(scale)
  let byScale = recall(topCache, glyph)
  if (!byScale) {
    topCache.set(glyph, (byScale = new Map()))
    if (topCache.size > TOP_LIMIT) {
      const [oldKey, old] = topCache.entries().next().value!
      topCache.delete(oldKey)
      disposeTops(old)
    }
  }
  const depth = spec.relief
  const key =
    ((Math.round(scale * 1000) * 1000 + Math.round(depth * 10000)) * 1000 + segments) * 10 +
    ['insatsu', 'oshi', 'molded', 'kaki', 'hori', 'fukabori', 'horiume', 'moriage'].indexOf(spec.kind)
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
  const { uv } = geometry.attributes
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

const sideTextures = new Map<string, THREE.Texture>()
onFaceTexturesCleared(() => {
  sideTextures.forEach((texture) => texture.dispose())
  sideTextures.clear()
})

function sideTexture(seed: number, appearance?: PieceAppearance) {
  const { pieceMaterial, pieceGrain, pieceColor } = { ...getSettings(), ...appearance }
  const key = `${seed}/${pieceMaterial}/${pieceGrain}/${pieceColor}`
  let texture = recall(sideTextures, key)
  if (!texture) {
    const surface = pieceSurface(seed, appearance)
    // Calm the grain so the walls read as clean wood next to the carved face.
    const ctx = surface.getContext('2d')!
    ctx.fillStyle = `rgba(${pieceTone(pieceMaterial, pieceColor).join(',')},0.5)`
    ctx.fillRect(0, 0, surface.width, surface.height)
    texture = srgbTexture(surface)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    remember(sideTextures, key, texture, 64)
  }
  return texture
}

export function disposePiece(piece: THREE.Object3D) {
  piece.traverse((child) => {
    const { material } = child as THREE.Mesh
    for (const item of Array.isArray(material) ? material : material ? [material] : []) {
      if (item === hiddenLid) continue
      if (child instanceof THREE.Sprite) (item as THREE.SpriteMaterial).map?.dispose()
      item.dispose()
    }
  })
}

export const pieceFaceUrl = (type: PieceType, color: Color) => (faceMap(type, color).image as HTMLCanvasElement).toDataURL()

function faceMap(type: PieceType, color: Color, seed = 1, appearance?: PieceAppearance) {
  const gote = color === Color.WHITE
  const set = appearance?.pieceSet ?? getSettings().pieceSet
  const art = set && set !== 'letters' ? loadedPiece(set, pieceCode(type, gote && type === PieceType.KING ? Color.WHITE : Color.BLACK)) : undefined
  if (art) return artTexture(art, `${set}/${pieceCode(type, color)}/${appearance?.pieceGuide ?? getSettings().pieceGuide}`, seed, appearance)
  return faceTexture(faceText(type, color, appearance?.pieceStyle ?? getSettings().pieceStyle), PROMOTED.has(type), seed, appearance, pieceCode(type, color))
}

export function pieceMesh(
  type: PieceType,
  color: Color,
  seed = [...pieceCode(unpromotedPieceType(type), color)].reduce((value, char) => value * 31 + char.charCodeAt(0), color === Color.BLACK ? 17 : 29),
  segments = 64,
  appearance?: PieceAppearance,
  envMap = environmentMap(),
  flat = false,
) {
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
  const normal = relief ? reliefNormal(inkMap, relief * scale, komaWidth(scale), scale, kind) : null
  const face =
    plastic && !relief
      ? new THREE.MeshBasicMaterial({ map })
      : new THREE.MeshPhysicalMaterial({
          map: glass ? glyphTexture(map) : map,
          transparent: glass,
          alphaTest: glass ? 0.01 : 0,
          depthWrite: !glass,
          emissive: plastic ? 0xffffff : 0x000000,
          emissiveMap: plastic ? map : null,
          emissiveIntensity: plastic ? 0.65 : 0,
          roughness: 1,
          roughnessMap: lm,
          normalMap: normal,
          normalScale: new THREE.Vector2(0.5, 0.5),
          clearcoat: lacquer ? Math.max(0.375, gloss * 0.5) : 0,
          clearcoatMap: lm,
          clearcoatNormalMap: lacquer ? normal : null,
          clearcoatNormalScale: new THREE.Vector2(0.5, 0.5),
          clearcoatRoughness: lacquer ? 0.3 : 1,
          specularIntensity: lacquer ? 0.5 : 0.15,
          envMap,
          envMapIntensity: lacquer ? 0.35 : 0.08,
        })
  const tone = pieceTone(settings.pieceMaterial, settings.pieceColor)
  const glassMaterial = () =>
    flat
      ? new THREE.MeshBasicMaterial({
          color: `rgb(${tone.join(',')})`,
          transparent: true,
          opacity: frosted ? 0.62 : 0.28,
          depthWrite: false,
          side: THREE.FrontSide,
        })
      : new THREE.MeshPhysicalMaterial({
          color: `rgb(${tone.join(',')})`,
          roughness: frosted ? 0.75 : 0.06,
          metalness: 0,
          transmission: 0,
          ior: 1.5,
          thickness: komaDepth(scale),
          transparent: true,
          opacity: frosted ? 0.62 : 0.28,
          depthWrite: false,
          clearcoat: frosted ? 0.08 : 0.5,
          clearcoatRoughness: frosted ? 0.8 : 0.15,
          envMap,
          envMapIntensity: frosted ? 0.2 : 0.6,
          side: THREE.FrontSide,
        })
  const sideGrain = !plastic && !glass ? sideTexture(seed, appearance) : null
  const side = glass
    ? glassMaterial()
    : settings.pieceColor !== 'natural' || plastic
      ? new THREE.MeshBasicMaterial({ color: sideGrain ? 0xe6e6e6 : `rgb(${tone.map((channel) => Math.round(channel * 0.9)).join(',')})`, map: sideGrain })
      : sideMaterial.clone()
  if (!plastic && !glass && settings.pieceColor === 'natural') {
    side.color.set(0xffffff)
    side.map = sideGrain
    if (side instanceof THREE.MeshStandardMaterial) side.emissiveMap = sideGrain
  }
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
  const reverseInk = type === PieceType.KING || type === PieceType.GOLD ? null : faceMap(reverse, color, 1, appearance)
  const backMap =
    type === PieceType.KING || type === PieceType.GOLD
      ? faceTexture('', false, seed, { ...appearance, pieceGuide: 'none' })
      : faceMap(reverse, color, seed, appearance)
  if (reverseInk && !PROMOTED.has(type)) {
    carvedTop(scale, reverseInk, segments, appearance)
    lacquerMap(reverseInk, lacquer ? 0.5 : 0)
    if (relief) reliefNormal(reverseInk, relief * scale, komaWidth(scale), scale, kind)
    if (glass) carvedTop(scale, reverseInk, segments, { ...appearance, pieceFinish: 'horiume' })
  }
  const backFace = glass ? face.clone() : new THREE.MeshBasicMaterial({ map: backMap, side: THREE.DoubleSide })
  if (glass) {
    backFace.map = glyphTexture(backMap)
    backFace.side = THREE.DoubleSide
    backFace.depthWrite = false
    if (backFace instanceof THREE.MeshPhysicalMaterial) {
      backFace.roughnessMap = lacquerMap(reverseInk ?? backMap, lacquer ? 0.5 : 0)
      backFace.clearcoatMap = backFace.roughnessMap
      backFace.normalMap = relief ? reliefNormal(reverseInk ?? backMap, relief * scale, komaWidth(scale), scale, kind) : null
      backFace.clearcoatNormalMap = lacquer ? backFace.normalMap : null
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
