import * as THREE from 'three'
import { Color, PieceType, Square } from 'tsshogi'
import { STAND_TOP, squareX, squareZ } from './dimensions'
import { handLayout, handPieceMesh } from './hand'
import { layout, standCenter } from './layout'
import { drawMarks } from './marks'
import { pieceMesh } from './piece'
import { badgeSprite } from './textures'
import type { Board3DProps, SceneState } from './types'

const squarePoint = (sq: Square) => new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))

export function rebuild(s: SceneState, props: Board3DProps, animate: boolean) {
  const { position, lastMove } = props
  s.pieces.clear()
  s.handMeshes = []
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    const mesh = pieceMesh(piece.type, piece.color)
    mesh.position.copy(squarePoint(square))
    mesh.userData.square = square
    mesh.userData.baseY = 0
    s.pieces.add(mesh)
    if (animate && lastMove && lastMove.slice(2, 4) === square.usi) {
      const from = lastMove[1] === '*' ? standCenter(piece.color) : squarePoint(Square.newByUSI(lastMove.slice(0, 2)) ?? square)
      s.animations.push({ mesh, from, to: mesh.position.clone(), start: performance.now() })
      mesh.position.copy(from)
    }
  }
  s.placeStands()
  for (const color of [Color.BLACK, Color.WHITE]) {
    const spots = handLayout(position, color)
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
  drawMarks(s, props)
}

export function liftSelected(s: SceneState, props: Board3DProps, dt: number) {
  const sel = props.selected
  for (const mesh of s.pieces.children) {
    const base = mesh.userData.baseY as number | undefined
    if (base === undefined || s.animations.some((a) => a.mesh === mesh) || s.drag?.mesh === mesh) continue
    const on = sel instanceof Square ? (mesh.userData.square as Square | undefined)?.equals(sel) : sel !== null && mesh.userData.liftable && mesh.userData.type === sel && mesh.userData.color === props.selectedColor
    const target = base + (on ? 0.45 : 0)
    mesh.position.y += (target - mesh.position.y) * (1 - Math.exp(-dt * 18))
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
