import * as THREE from 'three'
import { Color, PieceType, Square, unpromotedPieceType, type ImmutablePosition } from 'tsshogi'
import { STAND_TOP, komaDepth, pieceScale, squareX, squareZ } from './dimensions'
import { handLayout, handSpot } from './hand'
import { layout, standCenter } from './layout'
import { preparePieceEnvironment } from './materials'
import { drawMarks } from './marks'
import { disposePiece, pieceMesh } from './piece'
import { badgeSprite, faceTextureRevision } from './textures'
import { getSettings } from '@/appearance/settings'
import type { Board3DProps, SceneState } from './types'

const CAPTURE_SEED = Object.fromEntries(Object.values(PieceType).map((type, i) => [type, (i + 1) * 19349663]))

const squarePoint = (sq: Square) => new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))

const scenePiece = (s: SceneState, type: PieceType, color: Color, seed?: number) =>
  pieceMesh(type, color, seed, 48, undefined, preparePieceEnvironment(s.renderer, false))

const board3 = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

function playedMove(prev: ImmutablePosition, position: ImmutablePosition, usi: string) {
  const next = prev.clone()
  const move = next.createMoveByUSI(usi)
  return move && next.doMove(move) && board3(next.sfen) === board3(position.sfen) ? move : null
}

function avatarMove(
  s: SceneState,
  position: ImmutablePosition,
  prev: ImmutablePosition | null,
  usi: string,
  mesh: THREE.Object3D,
  placed: boolean,
  captureSeed?: number,
) {
  const move = prev && s.avatars?.ready() && playedMove(prev, position, usi)
  if (!move || !s.avatars || !prev) return false
  const from = move.from instanceof Square ? squarePoint(move.from) : handSpot(prev, move.color, move.from)
  if (!from) return false
  const captured = move.capturedPieceType && prev.board.at(move.to)
  const type = move.capturedPieceType && unpromotedPieceType(move.capturedPieceType)
  const to = type && handSpot(position, move.color, type)
  const capture =
    captured && type && to
      ? {
          mesh: scenePiece(s, captured.type, captured.color, captureSeed),
          to,
          hide: s.handMeshes.find((m) => m.userData.color === move.color && m.userData.type === type && m.userData.liftable),
        }
      : undefined
  const step = move.from instanceof Square ? Math.max(Math.abs(move.from.file - move.to.file), Math.abs(move.from.rank - move.to.rank)) : 0
  const kind = move.from instanceof Square ? (move.promote ? 'promote' : capture ? 'capture' : step <= 1 ? 'slide' : 'carry') : 'drop'
  const land = placed ? null : s.onLand
  const source =
    kind === 'drop' && !placed
      ? s.handMeshes.find((m) => m.userData.color === move.color && m.userData.type === move.pieceType && m.userData.liftable)
      : undefined
  if (source) source.visible = false
  if (placed && move.promote) return false
  const played = s.avatars.playMove({
    kind,
    flip: move.promote ? scenePiece(s, move.pieceType, move.color, mesh.userData.grainSeed as number) : undefined,
    color: move.color,
    mesh,
    from,
    to: mesh.position.clone(),
    placed,
    land: source ? () => (land?.(), s.settle?.()) : land,
    capture,
  })
  if (!played && source) {
    source.visible = true
    queueMicrotask(() => s.settle?.())
  }
  if (played && !placed) s.onLand = null
  return played
}

export function rebuild(s: SceneState, props: Board3DProps, animate: boolean, prev: ImmutablePosition | null = null, placed = false, relayout = false) {
  const { position, lastMove } = props
  const retired = [...s.pieces.children]
  const previousHands = new Set(s.handMeshes)
  if (relayout) {
    s.avatars?.reset?.()
    s.animations = s.animations.filter((animation) => !previousHands.has(animation.mesh))
  }
  const handSlides: SceneState['animations'] = []
  const transforms = new Map(retired.map((mesh) => [mesh, { position: mesh.position.clone(), quaternion: mesh.quaternion.clone(), visible: mesh.visible }]))
  const flips = new Set(s.animations.map((animation) => animation.flip))
  const available = new Set(retired.filter((mesh) => mesh.userData.type && !flips.has(mesh)))
  const settings = getSettings()
  const appearance = JSON.stringify([
    faceTextureRevision,
    settings.environment,
    settings.pieceSet,
    settings.pieceFont,
    settings.pieceStyle,
    settings.pieceGuide,
    settings.pieceMaterial,
    settings.pieceColor,
    settings.pieceGrain,
    settings.pieceFinish,
  ])
  const take = (candidate: THREE.Object3D | undefined, type: PieceType, color: Color, seed: number) => {
    const reused = candidate && available.delete(candidate)
    const mesh = reused ? candidate : scenePiece(s, type, color, seed)
    if (reused && (mesh.userData.appearance !== appearance || mesh.userData.type !== type || mesh.userData.color !== color)) {
      const next = scenePiece(s, type, color, mesh.userData.grainSeed ?? seed)
      disposePiece(mesh)
      mesh.clear()
      ;(mesh as THREE.Mesh).geometry = next.geometry
      ;(mesh as THREE.Mesh).material = next.material
      mesh.add(...next.children)
      mesh.castShadow = next.castShadow
      mesh.receiveShadow = next.receiveShadow
      Object.assign(mesh.userData, next.userData)
    }
    mesh.userData.appearance = appearance
    mesh.scale.setScalar(1)
    mesh.rotation.set(0, color === Color.WHITE ? Math.PI : 0, 0)
    mesh.visible = true
    return mesh
  }
  if (prev) {
    s.avatars?.reset?.()
    for (const animation of s.animations)
      if (animation.flip) {
        animation.flip.removeFromParent()
        disposePiece(animation.flip)
      }
    s.animations.length = 0
    animate = animate && !!(lastMove && playedMove(prev, position, lastMove))
  }
  const grains = new Map(
    s.pieces.children.filter((mesh) => mesh.userData.square).map((mesh) => [(mesh.userData.square as Square).usi, mesh.userData.grainSeed as number]),
  )
  const move = prev && lastMove ? playedMove(prev, position, lastMove) : null
  const captureSeed = move?.capturedPieceType ? grains.get(move.to.usi) : undefined
  if (move && move.from instanceof Square) {
    const seed = grains.get(move.from.usi)
    grains.delete(move.from.usi)
    if (seed !== undefined) grains.set(move.to.usi, seed)
  }
  const held = s.pieces.children.filter((m) => m.userData.held && m.userData.square)
  const existing = prev ? [] : [...s.pieces.children]
  s.pieces.clear()
  s.handMeshes = []
  let moved: { mesh: THREE.Object3D; color: Color; square: Square } | null = null
  for (const square of position.board.listNonEmptySquares()) {
    const piece = position.board.at(square)!
    const source = move?.to.equals(square) ? move.from : square
    const candidate = [...available].find((mesh) =>
      source instanceof Square
        ? (mesh.userData.square as Square | undefined)?.equals(source)
        : !mesh.userData.square && mesh.userData.type === source && mesh.userData.color === piece.color && mesh.userData.liftable,
    )
    const mesh = take(candidate, piece.type, piece.color, grains.get(square.usi) ?? (square.file * 73856093) ^ (square.rank * 19349663))
    mesh.position.copy(squarePoint(square))
    mesh.userData.square = square
    delete mesh.userData.liftable
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
      const candidate =
        [...available].find((mesh) => !mesh.userData.square && mesh.userData.type === spot.type && mesh.userData.color === color) ??
        [...available].find((mesh) => move?.capturedPieceType && (mesh.userData.square as Square | undefined)?.equals(move.to))
      const mesh = take(candidate, spot.type, color, (nth + 1) * 83492791 + CAPTURE_SEED[spot.type])
      mesh.rotation.y += spot.rot
      mesh.rotation.z = spot.roll ?? 0
      mesh.scale.setScalar(0.96)
      mesh.position.set(spot.x, STAND_TOP + (spot.lift ?? 0), spot.z)
      const previous = transforms.get(mesh)
      if (
        !relayout &&
        previousHands.has(mesh) &&
        previous &&
        ((previous.position.x - spot.x) ** 2 + (previous.position.z - spot.z) ** 2 > 0.000001 || previous.quaternion.angleTo(mesh.quaternion) > 0.001) &&
        !s.animations.some((animation) => animation.mesh === mesh && animation.to.distanceTo(mesh.position) < 0.001)
      )
        handSlides.push({
          mesh,
          from: previous.position,
          to: mesh.position.clone(),
          fromQ: previous.quaternion,
          toQ: mesh.quaternion.clone(),
          start: performance.now(),
          duration: 550,
          slide: true,
        })
      mesh.castShadow = false
      delete mesh.userData.square
      Object.assign(mesh.userData, { color, type: spot.type, baseY: mesh.position.y, liftable: nth === Math.floor(same / 2) })
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
  for (const old of existing) {
    const square = old.userData.square as Square | undefined
    if (!square && (!old.userData.held || relayout) && s.drag?.mesh !== old) continue
    const next = s.pieces.children.includes(old)
      ? old
      : square
        ? s.pieces.children.find((m) => (m.userData.square as Square | undefined)?.equals(square))
        : s.handMeshes.find(
            (m) => m.userData.type === old.userData.type && m.userData.color === old.userData.color && m.userData.liftable === old.userData.liftable,
          )
    if (!next) continue
    const transform = transforms.get(old)!
    next.position.copy(transform.position)
    next.quaternion.copy(transform.quaternion)
    next.visible = transform.visible
    for (const animation of s.animations) if (animation.mesh === old) animation.mesh = next
    if (s.drag?.mesh === old) s.drag.mesh = next
  }
  if (!prev) for (const animation of s.animations) if (animation.flip) s.pieces.add(animation.flip)
  const carried = moved && lastMove && (animate || placed) ? avatarMove(s, position, prev, lastMove, moved.mesh, placed, captureSeed) : false
  if (moved && lastMove && !carried && animate) {
    const { mesh } = moved
    const from = placed
      ? mesh.position.clone()
      : lastMove[1] === '*'
        ? standCenter(moved.color)
        : squarePoint(Square.newByUSI(lastMove.slice(0, 2)) ?? moved.square)
    const flip = move?.promote ? scenePiece(s, move.pieceType, move.color, mesh.userData.grainSeed as number) : undefined
    if (flip) {
      flip.position.copy(from)
      s.pieces.add(flip)
      mesh.visible = false
    }
    s.animations.push({ mesh, from, to: mesh.position.clone(), start: performance.now(), flip, land: s.onLand })
    s.onLand = null
    mesh.position.copy(from)
  }
  for (const slide of handSlides) {
    s.animations = s.animations.filter((animation) => animation.mesh !== slide.mesh)
    slide.mesh.position.copy(slide.from)
    slide.mesh.quaternion.copy(slide.fromQ!)
    s.animations.push(slide)
  }
  if (placed) {
    s.onLand?.()
    s.onLand = null
  }
  for (const mesh of s.pieces.children)
    if (!existing.length && !mesh.userData.held && isLifted(mesh, props)) mesh.position.y = (mesh.userData.baseY as number) + LIFT
  drawMarks(s, props)
  for (const mesh of retired) if (mesh.parent !== s.pieces) disposePiece(mesh)
}

const LIFT = 0.45

const isLifted = (mesh: THREE.Object3D, props: Board3DProps) => {
  const sel = props.selected
  if (mesh.userData.baseY === undefined || sel === null) return false
  return sel instanceof Square
    ? !!(mesh.userData.square as Square | undefined)?.equals(sel)
    : !!mesh.userData.liftable && mesh.userData.type === sel && mesh.userData.color === props.selectedColor
}

export function liftSelected(s: SceneState, props: Board3DProps, dt: number) {
  if (s.flip) return
  for (const mesh of s.pieces.children) {
    const base = mesh.userData.baseY as number | undefined
    if (base === undefined || mesh.userData.held || s.animations.some((a) => a.mesh === mesh || a.flip === mesh) || s.drag?.mesh === mesh) continue
    const lifted = isLifted(mesh, props)
    const target = base + (lifted ? LIFT : 0)
    const k = 1 - Math.exp(-dt * 18)
    if (lifted) mesh.position.y = target
    else mesh.position.y += (target - mesh.position.y) * k
    const square = mesh.userData.square as Square | undefined
    if (square) {
      mesh.position.x += (squareX(square.file) - mesh.position.x) * k
      mesh.position.z += (squareZ(square.rank) - mesh.position.z) * k
    }
  }
}

export function stepAnimations(s: SceneState, time: number) {
  for (const anim of [...s.animations]) {
    const t = Math.min(1, (time - anim.start) / (anim.duration ?? (anim.flip ? 550 : 220)))
    const e = 1 - (1 - t) ** 3
    anim.mesh.position.lerpVectors(anim.from, anim.to, e)
    if (!anim.slide) anim.mesh.position.y = anim.to.y + Math.sin(Math.PI * t) * 0.5
    if (anim.fromQ && anim.toQ) anim.mesh.quaternion.slerpQuaternions(anim.fromQ, anim.toQ, e)
    if (anim.flip) {
      anim.flip.position.copy(anim.mesh.position)
      anim.flip.rotation.z = Math.PI * e
      anim.flip.position.y += komaDepth(pieceScale(anim.flip.userData.type ?? anim.mesh.userData.type ?? PieceType.KING)) * e
    }
    if (t >= 1) {
      anim.mesh.position.copy(anim.to)
      anim.mesh.visible = true
      if (anim.flip) {
        anim.flip.removeFromParent()
        disposePiece(anim.flip)
      }
      s.animations.splice(s.animations.indexOf(anim), 1)
      anim.land?.()
    }
  }
}
