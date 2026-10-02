import * as THREE from 'three'
import { Color, PieceType, Square, unpromotedPieceType, type ImmutablePosition } from 'tsshogi'
import { STAND_TOP, squareX, squareZ } from './dimensions'
import { handLayout, handPieceMesh, handSpot } from './hand'
import { layout, standCenter } from './layout'
import { drawMarks } from './marks'
import { pieceMesh } from './piece'
import { badgeSprite } from './textures'
import type { Board3DProps, SceneState } from './types'

const squarePoint = (sq: Square) => new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))

const board3 = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

function playedMove(prev: ImmutablePosition, position: ImmutablePosition, usi: string) {
  const next = prev.clone()
  const move = next.createMoveByUSI(usi)
  return move && next.doMove(move) && board3(next.sfen) === board3(position.sfen) ? move : null
}

function avatarMove(s: SceneState, position: ImmutablePosition, prev: ImmutablePosition | null, usi: string, mesh: THREE.Object3D, placed: boolean) {
  const move = prev && s.avatars?.ready() && playedMove(prev, position, usi)
  if (!move || !s.avatars || !prev) return false
  const from = move.from instanceof Square ? squarePoint(move.from) : handSpot(prev, move.color, move.from)
  if (!from) return false
  const captured = move.capturedPieceType && prev.board.at(move.to)
  const type = move.capturedPieceType && unpromotedPieceType(move.capturedPieceType)
  const to = type && handSpot(position, move.color, type)
  const capture = captured && type && to ? { mesh: pieceMesh(captured.type, captured.color), to, hide: s.handMeshes.find((m) => m.userData.color === move.color && m.userData.type === type && m.userData.liftable) } : undefined
  const step = move.from instanceof Square ? Math.max(Math.abs(move.from.file - move.to.file), Math.abs(move.from.rank - move.to.rank)) : 0
  const kind = !(move.from instanceof Square) ? 'drop' : capture ? 'capture' : move.promote ? 'promote' : step <= 1 ? 'slide' : 'carry'
  const land = s.onLand
  const source = kind === 'drop' && !placed ? s.handMeshes.find((m) => m.userData.color === move.color && m.userData.type === move.pieceType && m.userData.liftable) : undefined
  if (source) source.visible = false
  const played = s.avatars.playMove({ kind, flip: kind === 'promote' ? pieceMesh(move.pieceType, move.color) : undefined, color: move.color, mesh, from, to: mesh.position.clone(), placed, land: source ? () => (land?.(), s.settle?.()) : land, capture })
  if (!played && source) {
    source.visible = true
    queueMicrotask(() => s.settle?.())
  }
  if (played) s.onLand = null
  return played
}

export function rebuild(s: SceneState, props: Board3DProps, animate: boolean, prev: ImmutablePosition | null = null, placed = false) {
  const { position, lastMove } = props
  const held = s.pieces.children.filter((m) => m.userData.held && m.userData.square)
  s.pieces.clear()
  s.handMeshes = []
  let moved: { mesh: THREE.Object3D; color: Color; square: Square } | null = null
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    const mesh = pieceMesh(piece.type, piece.color)
    mesh.position.copy(squarePoint(square))
    mesh.userData.square = square
    mesh.userData.baseY = 0
    s.pieces.add(mesh)
    if (lastMove && lastMove.slice(2, 4) === square.usi) moved = { mesh, color: piece.color, square }
  }
  s.placeStands()
  const lagging = !!(prev && lastMove && lastMove[1] === '*' && animate && !placed && s.avatars?.ready())
  for (const color of [Color.BLACK, Color.WHITE]) {
    const spots = handLayout(lagging && prev ? prev : position, color)
    const seen = new Map<PieceType, number>()
    for (const spot of spots) {
      const nth = seen.get(spot.type) ?? 0
      seen.set(spot.type, nth + 1)
      const same = spots.filter((p) => p.type === spot.type).length
      const mesh = handPieceMesh(spot, color)
      mesh.castShadow = false
      mesh.userData = { color, type: spot.type, baseY: mesh.position.y, liftable: nth === Math.floor(same / 2) }
      s.pieces.add(mesh)
      s.handMeshes.push(mesh)
      if (spot.count && spot.count > 1) {
        const badge = badgeSprite(String(spot.count), '#2a241e')
        const sign = color === Color.BLACK ? 1 : -1
        badge.position.set(spot.x + (layout.portrait ? sign * 0.3 : 0), layout.portrait ? 0.4 : STAND_TOP + 0.45, spot.z - sign * (layout.portrait ? 0.3 : 0.5))
        s.pieces.add(badge)
      }
    }
  }
  for (const old of held) {
    const next = s.pieces.children.find((m) => (m.userData.square as Square | undefined)?.equals(old.userData.square as Square))
    if (next) s.avatars?.swap(old, next)
  }
  if (moved && lastMove && (animate || placed) && !avatarMove(s, position, prev, lastMove, moved.mesh, placed) && animate) {
    const { mesh } = moved
    const from = lastMove[1] === '*' ? standCenter(moved.color) : squarePoint(Square.newByUSI(lastMove.slice(0, 2)) ?? moved.square)
    s.animations.push({ mesh, from, to: mesh.position.clone(), start: performance.now() })
    mesh.position.copy(from)
  }
  for (const mesh of s.pieces.children) if (isLifted(mesh, props)) mesh.position.y = (mesh.userData.baseY as number) + LIFT
  drawMarks(s, props)
}

const LIFT = 0.45

const isLifted = (mesh: THREE.Object3D, props: Board3DProps) => {
  const sel = props.selected
  if (mesh.userData.baseY === undefined || sel === null) return false
  return sel instanceof Square ? !!(mesh.userData.square as Square | undefined)?.equals(sel) : !!mesh.userData.liftable && mesh.userData.type === sel && mesh.userData.color === props.selectedColor
}

export function liftSelected(s: SceneState, props: Board3DProps, dt: number) {
  for (const mesh of s.pieces.children) {
    const base = mesh.userData.baseY as number | undefined
    if (mesh.userData.held && performance.now() - ((mesh.userData.heldAt as number | undefined) ?? 0) > 4000) mesh.userData.held = false
    if (base === undefined || mesh.userData.held || s.animations.some((a) => a.mesh === mesh) || s.drag?.mesh === mesh) continue
    const target = base + (isLifted(mesh, props) ? LIFT : 0)
    const k = 1 - Math.exp(-dt * 18)
    mesh.position.y += (target - mesh.position.y) * k
    const square = mesh.userData.square as Square | undefined
    if (square) {
      mesh.position.x += (squareX(square.file) - mesh.position.x) * k
      mesh.position.z += (squareZ(square.rank) - mesh.position.z) * k
    }
  }
}

export function stepAnimations(s: SceneState, time: number) {
  for (const anim of [...s.animations]) {
    const t = Math.min(1, (time - anim.start) / 220)
    const e = 1 - Math.pow(1 - t, 3)
    anim.mesh.position.lerpVectors(anim.from, anim.to, e)
    anim.mesh.position.y = anim.to.y + Math.sin(Math.PI * t) * 0.5
    if (t >= 1) s.animations.splice(s.animations.indexOf(anim), 1)
  }
}
