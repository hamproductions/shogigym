import * as THREE from 'three'
import { PieceType, Square, type ImmutablePosition } from 'tsshogi'
import { getSettings } from '@/appearance/settings'
import { HALF_D, HALF_W, MARGIN, SQ_D, STAND_TOP, squareX, squareZ } from './dimensions'
import { handSpot } from './hand'
import { standCenter } from './layout'
import { arrowTag, badgeSprite, coordPlane, coordSprite, faceTextureRevision, labelSprite } from './textures'
import { layout } from './layout'
import type { Board3DProps, BoardArrow, SceneState } from './types'

const DROP_TYPE: Record<string, PieceType> = {
  P: PieceType.PAWN,
  L: PieceType.LANCE,
  N: PieceType.KNIGHT,
  S: PieceType.SILVER,
  G: PieceType.GOLD,
  B: PieceType.BISHOP,
  R: PieceType.ROOK,
}

// Marks are rebuilt on every arrow change; fresh materials force a shader-compile
// stall in the render loop, so reusable ones are cached and never disposed.
const sharedMaterials = new Map<string, THREE.MeshBasicMaterial>()
const sharedMaterial = (key: string, make: () => THREE.MeshBasicMaterial) => {
  let material = sharedMaterials.get(key)
  if (!material) {
    material = make()
    material.userData.shared = true
    sharedMaterials.set(key, material)
  }
  return material
}

const ARROW_LIFT = 0.2

const flatOnBoard = <T extends THREE.Object3D>(obj: T, square: Square, y: number) => {
  obj.rotation.x = -Math.PI / 2
  obj.position.set(squareX(square.file), y, squareZ(square.rank))
  return obj
}

export const squareTile = (color: number, opacity: number) =>
  new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98 * SQ_D), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }))

export function squareFrame(inner: number, material: THREE.MeshBasicMaterial) {
  const frame = new THREE.Mesh(new THREE.RingGeometry(inner, 0.69, 4, 1, Math.PI / 4), material)
  frame.scale.set(1, SQ_D, 1)
  return frame
}

export const moveTarget = () =>
  new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: 0x5a3a1c, transparent: true, opacity: 0.5, depthWrite: false }))

function boardMarker(sprite: THREE.Sprite, width: number, height: number, flipped: boolean) {
  const material = new THREE.MeshBasicMaterial({ map: sprite.material.map, transparent: true, depthTest: false, depthWrite: false })
  sprite.material.dispose()
  const marker = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  marker.renderOrder = 13
  marker.rotation.set(-Math.PI / 2, 0, flipped ? Math.PI : 0)
  return marker
}

export function arrowMesh(arrow: BoardArrow, position: ImmutablePosition, stack = 0, flipped = false) {
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
  return arrowBetween(arrow, start, end, stack, flipped)
}

export function arrowBetween(arrow: Omit<BoardArrow, 'usi'> & { usi?: string }, start: THREE.Vector3, end: THREE.Vector3, stack = 0, flipped = false) {
  const dir = end.clone().sub(start)
  const length = dir.length()
  const shaft = Math.max(0.01, length - 0.45)
  const w = arrow.dashed ? 0.06 : 0.09
  const head = arrow.dashed ? 0.2 : 0.26
  const material = sharedMaterial(
    `arrow:${arrow.color}:${arrow.dashed ? 1 : 0}`,
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(arrow.color),
        transparent: true,
        opacity: arrow.dashed ? 0.7 : 0.82,
        depthTest: false,
        depthWrite: false,
      }),
  )
  const tip = new THREE.Shape()
  tip.moveTo(head, shaft)
  tip.lineTo(0, length - 0.1)
  tip.lineTo(-head, shaft)
  tip.closePath()
  const shapes = [tip]
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
  group.position.copy(start).setY(ARROW_LIFT)
  group.rotation.y = Math.atan2(-dir.x, -dir.z)
  if (arrow.label) {
    const flip = flipped ? -1 : 1
    const tag = boardMarker(arrowTag(arrow.label, arrow.color), 0.56, 0.25, flipped)
    tag.userData.usi = arrow.usi
    tag.position.set(end.x, 0.004, end.z + (0.49 - stack * 0.25) * SQ_D * flip)
    tag.position.sub(group.position).applyAxisAngle(new THREE.Vector3(0, 1, 0), -group.rotation.y)
    tag.position.y = 0.004 - ARROW_LIFT
    tag.rotation.z -= group.rotation.y
    group.add(tag)
  }
  return group
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

const markKeys = new WeakMap<SceneState, string>()

export function drawMarks(s: SceneState, props: Board3DProps) {
  const { lastMove, selected, selectedColor, targets, arrows, position, flipped } = props
  const settings = getSettings()
  const key = JSON.stringify([
    position.sfen,
    lastMove,
    selected,
    selectedColor,
    targets,
    arrows,
    flipped,
    props.checkSquare,
    props.peek,
    props.peekFrom,
    props.heat,
    props.castles,
    props.stamp,
    settings.coords,
    settings.boardStyle,
    layout.portrait,
    HALF_D,
    HALF_W,
    faceTextureRevision,
  ])
  if (markKeys.get(s) === key) return
  markKeys.set(s, key)
  s.marks.traverse((child) => {
    if (child instanceof THREE.Mesh) child.geometry.dispose()
    const material = (child as THREE.Mesh).material
    for (const item of Array.isArray(material) ? material : material ? [material] : []) {
      const map = (item as THREE.MeshBasicMaterial).map
      if (map && !map.userData.shared) map.dispose()
      if (!item.userData.shared) item.dispose()
    }
  })
  s.marks.clear()
  const tile = (square: Square, color: number, opacity: number) => s.marks.add(flatOnBoard(squareTile(color, opacity), square, 0.004))
  if (lastMove) {
    const to = Square.newByUSI(lastMove.slice(2, 4))
    if (to) tile(to, 0xe8a63a, 0.55)
    if (lastMove[1] !== '*') {
      const from = Square.newByUSI(lastMove.slice(0, 2))
      if (from) tile(from, 0xe8a63a, 0.38)
    }
  }
  if (props.checkSquare) tile(props.checkSquare, 0xe0301e, 0.6)
  if (selected instanceof Square) {
    tile(selected, 0xfff1c9, 0.45)
    s.marks.add(flatOnBoard(squareFrame(0.66, new THREE.MeshBasicMaterial({ color: 0xc8442f, depthWrite: false })), selected, 0.006))
  }
  if (selected !== null && !(selected instanceof Square) && selectedColor !== undefined) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.44, 0.48, 40), new THREE.MeshBasicMaterial({ color: 0xc8442f }))
    const slot = handSpot(position, selectedColor, selected) ?? standCenter(selectedColor)
    ring.rotation.x = -Math.PI / 2
    ring.position.set(slot.x, STAND_TOP + 0.004, slot.z)
    s.marks.add(ring)
  }
  for (const target of targets) s.marks.add(flatOnBoard(moveTarget(), target, 0.006))
  s.tags = []
  const stacked = new Map<string, number>()
  for (const arrow of arrows) {
    const end = arrow.usi.slice(2, 4)
    const stack = stacked.get(end) ?? 0
    if (arrow.label) stacked.set(end, stack + 1)
    const group = arrowMesh(arrow, position, stack, !!flipped)
    group.traverse((o) => o.userData.usi && s.tags.push(o))
    s.marks.add(group)
  }
  const flip = flipped ? -1 : 1
  if (getSettings().coords)
    for (let i = 1; i <= 9; i++) {
      const file = coordPlane(String(i), MARGIN * 0.82, !!flipped)
      file.position.set(squareX(i), 0.006, -(HALF_D - MARGIN / 2) * flip)
      s.marks.add(file)
      const rank = coordPlane('一二三四五六七八九'[i - 1], MARGIN * 0.82, !!flipped)
      rank.position.set((HALF_W - MARGIN / 2) * flip, 0.006, squareZ(i))
      s.marks.add(rank)
    }
  for (const sq of props.peek ?? []) {
    tile(sq, 0xc8442f, 0.26)
    s.marks.add(flatOnBoard(squareFrame(0.62, new THREE.MeshBasicMaterial({ color: 0xb33a26, transparent: true, opacity: 0.7, depthWrite: false })), sq, 0.005))
  }
  if (props.peekFrom) tile(props.peekFrom, 0xc8442f, 0.22)
  for (const heat of props.heat ?? []) {
    tile(heat.square, heat.color, heat.opacity)
    if (heat.label) {
      const tag = coordSprite(heat.label)
      tag.scale.setScalar(0.34)
      tag.position.set(squareX(heat.square.file) + 0.32, 0.06, squareZ(heat.square.rank) + 0.3)
      s.marks.add(tag)
    }
  }
  for (const castle of props.castles ?? []) s.marks.add(castleBox(castle))
  if (props.checkSquare)
    s.marks.add(flatOnBoard(squareFrame(0.6, new THREE.MeshBasicMaterial({ color: 0xc62a1a, depthWrite: false })), props.checkSquare, 0.007))
  const stamp = props.stamp && Square.newByUSI(props.stamp.square)
  if (props.stamp && stamp) {
    const badge = boardMarker(badgeSprite(props.stamp.text, props.stamp.color), 0.5, 0.5, !!flipped)
    badge.position.set(squareX(stamp.file) + 0.3 * flip, 0.012, squareZ(stamp.rank) - 0.3 * SQ_D * flip)
    s.marks.add(badge)
  }
  const animating = new Set(s.animations.map((a) => a.mesh))
  for (const piece of s.pieces.children) if (piece.userData.square && !animating.has(piece)) piece.position.y = 0
}
