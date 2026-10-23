import * as THREE from 'three'
import { animateHistorical } from '@/rendering/historical/piece'
import { prepareSpirit, poseSpirit, prepareRevival, poseRevival } from '@/rendering/historical/spirit'
import { campEntrance, campWalls } from '@/rendering/historical/camp'
import { groundPath, groundPathLength, groundPathPoint, walkGroundPath, type GroundObstacle } from '@/rendering/historical/navigation'
import { Color, PieceType, Square, unpromotedPieceType, type ImmutablePosition } from 'tsshogi'
import { HALF_W, HALF_D, STAND_TOP, komaDepth, pieceScale, pieceSegments, squareX, squareZ, setCampLoad, standWidth, stripDepth, STRIP_W } from './dimensions'
import { handLayout, handSpot, handSurface } from './hand'
import { layout, standCenter } from './layout'
import { preparePieceEnvironment } from './materials'
import { drawMarks, flushMarks } from './marks'
import { disposePiece, pieceMesh } from './piece'
import { retainResource } from './resources'
import { badgeSprite, faceTextureRevision } from './textures'
import { getSettings, playSound } from '@/appearance/settings'
import type { Board3DProps, SceneState } from './types'

const CAPTURE_SEED = Object.fromEntries(Object.values(PieceType).map((type, i) => [type, (i + 1) * 19349663]))
let spiritId = 0

const squarePoint = (sq: Square) => new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))

function campDimensions() {
  return {
    width: layout.portrait ? (layout.vertical ? stripDepth() : STRIP_W) : standWidth(),
    depth: layout.portrait ? (layout.vertical ? STRIP_W : stripDepth()) : standWidth(),
  }
}

function actorObstacle(mesh: THREE.Object3D): GroundObstacle {
  const sin = Math.abs(Math.sin(mesh.rotation.y))
  const cos = Math.abs(Math.cos(mesh.rotation.y))
  const x = 0.28 * cos + campDepth(mesh) * sin
  const z = 0.28 * sin + campDepth(mesh) * cos
  return { minX: mesh.position.x - x, maxX: mesh.position.x + x, minZ: mesh.position.z - z, maxZ: mesh.position.z + z }
}

function dropGroundPath(s: SceneState, mesh: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, color: Color) {
  const { width, depth } = campDimensions()
  const center = standCenter(color)
  const exit = campEntrance(center.x, center.z, width, depth)
  const obstacles = s.pieces.children
    .filter((piece) => piece !== mesh && (piece.visible || piece.userData.arriving) && piece.userData.historical && !piece.userData.transient)
    .map(actorObstacle)
  for (const side of [Color.BLACK, Color.WHITE]) {
    const camp = standCenter(side)
    obstacles.push(...campWalls(camp.x, camp.z, width, depth))
  }
  const bounds = { minX: -HALF_W - width - 2, maxX: HALF_W + width + 2, minZ: -HALF_D - depth - 2, maxZ: HALF_D + depth + 2 }
  const path = [from.clone()]
  for (const destination of [exit.inside, exit.gate, exit.outside, to]) {
    const segment = groundPath(path.at(-1)!, destination, bounds, obstacles, 0.28)
    if (!segment) return null
    path.push(...segment.slice(1))
  }
  for (const point of path) point.y = Math.abs(point.x) <= HALF_W && Math.abs(point.z) <= HALF_D ? 0 : handSurface()
  return path
}

const scenePiece = (s: SceneState, type: PieceType, color: Color, seed?: number) =>
  pieceMesh(type, color, seed, pieceSegments(), undefined, preparePieceEnvironment(s.renderer, false))

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
  if (mesh.userData.historical) return false
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
  const kind = !(move.from instanceof Square) ? 'drop' : move.promote ? 'promote' : capture ? 'capture' : step <= 1 ? 'slide' : 'carry'
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

export function piecePreparation(s: SceneState, position: ImmutablePosition) {
  const grains = new Map(s.pieces.children.filter((mesh) => mesh.userData.square).map((mesh) => [mesh.userData.square.usi, mesh.userData.grainSeed as number]))
  const pending = position.board.listNonEmptySquares().map((square) => ({
    ...position.board.at(square)!,
    grainSeed: (grains.get(square.usi) ?? square.file * 73856093) ^ (square.rank * 19349663),
  }))
  for (const color of [Color.BLACK, Color.WHITE]) {
    const seen = new Map<PieceType, number>()
    for (const spot of handLayout(position, color)) {
      const nth = seen.get(spot.type) ?? 0
      seen.set(spot.type, nth + 1)
      pending.push({ type: spot.type, color, grainSeed: (nth + 1) * 83492791 + CAPTURE_SEED[spot.type] })
    }
  }
  const seen = new Set<string>()
  return pending.filter((piece) => {
    const key = `${piece.type}|${piece.color}|${Math.abs(piece.grainSeed - 1) % 4}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function rebuild(s: SceneState, props: Board3DProps, animate: boolean, prev: ImmutablePosition | null = null, placed = false, relayout = false) {
  s.instances.dispose()
  const { position, lastMove } = props
  if (getSettings().environment === 'battlefield') {
    const load = Math.max(
      ...[Color.BLACK, Color.WHITE].map((color) =>
        [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT, PieceType.LANCE, PieceType.PAWN].reduce(
          (load, type) =>
            load +
            position.hand(color).count(type) * ([PieceType.ROOK, PieceType.BISHOP, PieceType.LANCE].includes(type) ? 4 : type === PieceType.KNIGHT ? 3 : 1),
          0,
        ),
      ),
    )
    if (load || lastMove?.[1] !== '*') setCampLoad(load)
  }
  const retired = [...s.pieces.children]
  const previousHands = new Set(s.handMeshes)
  if (relayout) {
    s.avatars?.reset?.()
    s.animations = s.animations.filter((animation) => !previousHands.has(animation.mesh))
  }
  const handSlides: SceneState['animations'] = []
  const transforms = new Map(retired.map((mesh) => [mesh, { position: mesh.position.clone(), quaternion: mesh.quaternion.clone(), visible: mesh.visible }]))
  const flips = new Set(s.animations.map((animation) => animation.flip))
  const available = new Set(retired.filter((mesh) => mesh.userData.type && !mesh.userData.transient && !flips.has(mesh)))
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
    if (
      reused &&
      (mesh.userData.pieceFactory !== pieceMesh || mesh.userData.appearance !== appearance || mesh.userData.type !== type || mesh.userData.color !== color)
    ) {
      const next = scenePiece(s, type, color, mesh.userData.grainSeed ?? seed)
      disposePiece(mesh)
      mesh.clear()
      ;(mesh as THREE.Mesh).geometry = next.geometry
      ;(mesh as THREE.Mesh).material = next.material
      mesh.add(...[...next.children])
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
    for (const animation of s.animations) {
      const motion = animation.mesh.userData.motion
      if (motion?.camp) delete motion.camp.userData.arriving
      delete animation.mesh.userData.motion
      if (animation.flip) {
        animation.flip.removeFromParent()
        disposePiece(animation.flip)
      }
    }
    s.animations.length = 0
    animate = (animate || settings.environment === 'battlefield') && !!(lastMove && playedMove(prev, position, lastMove))
    if (!animate) {
      for (const flight of s.spiritFlights) {
        if (flight.camp.userData.arrivalToken === flight.id) {
          delete flight.camp.userData.arriving
          delete flight.camp.userData.arrivalToken
        }
      }
      s.spiritFlights.length = 0
    }
  }
  const grains = new Map(
    s.pieces.children.filter((mesh) => mesh.userData.square).map((mesh) => [(mesh.userData.square as Square).usi, mesh.userData.grainSeed as number]),
  )
  const move = prev && lastMove ? playedMove(prev, position, lastMove) : null
  const victim =
    animate && settings.environment === 'battlefield' && move?.capturedPieceType
      ? [...available].find((mesh) => (mesh.userData.square as Square | undefined)?.equals(move.to))
      : undefined
  if (victim) available.delete(victim)
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
    delete mesh.userData.arriving
    delete mesh.userData.arrivalToken
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
      mesh.scale.setScalar(mesh.userData.historical ? 1 : 0.96)
      mesh.position.set(spot.x, handSurface() + (spot.lift ?? 0), spot.z)
      const previous = transforms.get(mesh)
      const patrolling = mesh.userData.historical && previousHands.has(mesh) && !relayout
      if (patrolling && previous) {
        mesh.position.copy(previous.position)
        mesh.quaternion.copy(previous.quaternion)
      }
      if (
        !relayout &&
        !patrolling &&
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
          duration: mesh.userData.historical ? 180 : 550,
          slide: true,
        })
      mesh.castShadow = false
      delete mesh.userData.square
      Object.assign(mesh.userData, {
        color,
        type: spot.type,
        baseY: mesh.position.y,
        liftable: mesh.userData.historical || nth === Math.floor(same / 2),
        campX: spot.x,
        campZ: spot.z,
      })
      if (mesh.userData.arriving) mesh.visible = false
      s.pieces.add(mesh)
      s.handMeshes.push(mesh)
      if (spot.count && spot.count > 1) {
        const badge = badgeSprite(String(spot.count), '#2a241e')
        const sign = color === Color.BLACK ? 1 : -1
        if (mesh.userData.historical) {
          const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.32, 0.32),
            new THREE.MeshBasicMaterial({ map: badge.material.map, transparent: true, depthWrite: false }),
          )
          badge.material.dispose()
          const resources = new Set<THREE.BufferGeometry | THREE.Texture>([label.geometry, label.material.map!])
          resources.forEach(retainResource)
          label.userData.pieceResources = resources
          label.rotation.x = -Math.PI / 2
          label.position.set(spot.x + 0.3, handSurface() + 0.008, spot.z + 0.35)
          s.pieces.add(label)
        } else {
          badge.position.set(
            spot.x + (layout.portrait ? sign * 0.3 : 0),
            layout.portrait ? 0.4 : STAND_TOP + 0.45,
            spot.z - sign * (layout.portrait ? 0.3 : 0.5),
          )
          s.pieces.add(badge)
        }
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
  if (!prev)
    for (const animation of s.animations) {
      if (animation.flip) s.pieces.add(animation.flip)
      const motion = animation.mesh.userData.motion
      for (const transient of [motion?.victim, motion?.spirit, motion?.body]) if (transient) s.pieces.add(transient)
    }
  for (const flight of s.spiritFlights) {
    s.pieces.add(flight.mesh)
    if (flight.body) s.pieces.add(flight.body)
  }
  const carried = moved && lastMove && (animate || placed) ? avatarMove(s, position, prev, lastMove, moved.mesh, placed, captureSeed) : false
  if (moved && lastMove && !carried && (animate || (placed && moved.mesh.userData.historical && !!move?.capturedPieceType))) {
    const { mesh } = moved
    const from =
      placed && !mesh.userData.historical
        ? mesh.position.clone()
        : lastMove[1] === '*'
          ? mesh.userData.historical && prev && move
            ? (transforms.get(mesh)?.position.clone() ?? handSpot(prev, moved.color, move.pieceType) ?? standCenter(moved.color))
            : standCenter(moved.color)
          : squarePoint(Square.newByUSI(lastMove.slice(0, 2)) ?? moved.square)
    const flip = move?.promote ? scenePiece(s, move.pieceType, move.color, mesh.userData.grainSeed as number) : undefined
    if (flip) {
      flip.position.copy(from)
      s.pieces.add(flip)
      mesh.visible = false
    }
    mesh.userData.striking = !!move?.capturedPieceType
    let duration: number | undefined
    if (mesh.userData.historical) {
      const distance = Math.hypot(mesh.position.x - from.x, mesh.position.z - from.z)
      const heading = distance > 0.02 ? Math.atan2(from.x - mesh.position.x, from.z - mesh.position.z) : mesh.rotation.y
      const initial = transforms.get(mesh)?.quaternion
      const initialDirection = initial ? new THREE.Vector3(0, 0, -1).applyQuaternion(initial) : null
      const destination = mesh.position.clone()
      const dropColor = moved.color
      const plan = lastMove[1] === '*' ? () => dropGroundPath(s, mesh, from, destination, dropColor) : undefined
      const path = plan?.()
      const motion = {
        turn: distance > 0.02 ? 110 : 0,
        walk: distance > 0.02 ? Math.min(1000, 420 + distance * 90) : 0,
        strike: move?.capturedPieceType ? 300 : 0,
        defeat: victim ? 400 : 0,
        transfer: victim ? 1600 : 0,
        flights: s.spiritFlights,
        promote: flip ? 360 : 0,
        back: distance > 0.02 ? 110 : 0,
        heading,
        initial: initialDirection ? Math.atan2(-initialDirection.x, -initialDirection.z) : mesh.rotation.y,
        facing: moved.color === Color.WHITE ? Math.PI : 0,
        distance,
        path,
        plan,
        planAt: 0,
        effects: s.battlefieldFx,
        victim,
        spirit: victim ? scenePiece(s, victim.userData.type, victim.userData.color, captureSeed) : undefined,
        body: victim ? scenePiece(s, unpromotedPieceType(victim.userData.type), victim.userData.color, captureSeed) : undefined,
        camp:
          victim && move
            ? s.handMeshes.find(
                (piece) =>
                  !previousHands.has(piece) && piece.userData.type === unpromotedPieceType(move.capturedPieceType!) && piece.userData.color === move.color,
              )
            : undefined,
      }
      if (victim) {
        victim.userData.transient = true
        delete victim.userData.square
        s.pieces.add(victim)
        if (motion.spirit) {
          prepareSpirit(motion.spirit)
          motion.spirit.userData.transient = true
          motion.spirit.visible = false
          s.pieces.add(motion.spirit)
        }
        if (motion.camp) {
          motion.camp.visible = false
          motion.camp.userData.arriving = true
          const center = standCenter(move!.color)
          const { width, depth } = campDimensions()
          const candidates: THREE.Vector3[] = []
          for (let x = center.x - width / 2 + 0.95; x <= center.x + width / 2 - 0.95; x += 0.35)
            for (let z = center.z - depth / 2 + 0.95; z <= center.z + depth / 2 - 0.95; z += 0.35) candidates.push(new THREE.Vector3(x, handSurface(), z))
          candidates.sort((a, b) => a.distanceToSquared(motion.camp!.position) - b.distanceToSquared(motion.camp!.position))
          const landing = candidates.find(
            (point) => !s.handMeshes.some((other) => other !== motion.camp && campCollision(motion.camp!, other, point.x, point.z)),
          )
          if (landing) motion.camp.position.copy(landing)
          if (motion.body) {
            motion.body.userData.transient = true
            motion.body.visible = false
            prepareRevival(motion.body, motion.camp)
            s.pieces.add(motion.body)
          }
        }
      }
      mesh.userData.motion = motion
      mesh.userData.stepAt = -1
      mesh.userData.impactPlayed = false
      mesh.userData.promotionPlayed = false
      duration = Math.max(1, motion.turn + motion.walk + motion.strike + motion.defeat + motion.promote + motion.back)
    }
    s.animations.push({ mesh, from, to: mesh.position.clone(), start: performance.now(), duration, flip, land: s.onLand, impact: s.onImpact })
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
    if (!existing.length && !mesh.userData.historical && !mesh.userData.held && isLifted(mesh, props)) mesh.position.y = (mesh.userData.baseY as number) + LIFT
  drawMarks(s, props)
  for (const mesh of retired) if (mesh.parent !== s.pieces) disposePiece(mesh)
}

export const LIFT = 0.45
const captureSources = new WeakMap<ImmutablePosition, Set<string>>()

function legalCaptureSources(position: ImmutablePosition) {
  const cached = captureSources.get(position)
  if (cached) return cached
  const sources = new Set<string>()
  const squares = position.board.listNonEmptySquares()
  for (const color of [Color.BLACK, Color.WHITE]) {
    const ready = position.clone()
    ready.setColor(color)
    for (const from of squares.filter((square) => position.board.at(square)!.color === color)) {
      for (const to of squares.filter((square) => position.board.at(square)!.color !== color)) {
        const move = ready.createMove(from, to)
        if (move && (ready.isValidMove(move) || ready.isValidMove(move.withPromote()))) {
          sources.add(from.usi)
          break
        }
      }
    }
  }
  captureSources.set(position, sources)
  return sources
}

const isLifted = (mesh: THREE.Object3D, props: Board3DProps) => {
  const sel = props.selected
  if (mesh.userData.baseY === undefined || sel === null) return false
  return sel instanceof Square
    ? !!(mesh.userData.square as Square | undefined)?.equals(sel)
    : !!mesh.userData.liftable && mesh.userData.type === sel && mesh.userData.color === props.selectedColor
}

export function liftSelected(s: SceneState, props: Board3DProps, dt: number) {
  if (s.flip) return
  const captures = getSettings().environment === 'battlefield' ? legalCaptureSources(props.position) : null
  for (const mesh of s.pieces.children) {
    const base = mesh.userData.baseY as number | undefined
    if (mesh.userData.historical) {
      const selected = isLifted(mesh, props)
      const square = mesh.userData.square as Square | undefined
      const target = square && captures?.has(square.usi) ? 1 : 0
      mesh.userData.ready = selected
      mesh.userData.readiness = (mesh.userData.readiness ?? 0) + (target - (mesh.userData.readiness ?? 0)) * (1 - Math.exp(-dt * 10))
    }
    if (
      base === undefined ||
      mesh.userData.transient ||
      mesh.userData.arriving ||
      mesh.userData.held ||
      s.animations.some((a) => a.mesh === mesh || a.flip === mesh) ||
      s.drag?.mesh === mesh
    )
      continue
    const lifted = isLifted(mesh, props)
    const target = base + (lifted && !mesh.userData.historical ? LIFT : 0)
    const k = 1 - Math.exp(-dt * 18)
    if (lifted || mesh.userData.historical) mesh.position.y = target
    else mesh.position.y += (target - mesh.position.y) * k
    const square = mesh.userData.square as Square | undefined
    if (square) {
      mesh.position.x += (squareX(square.file) - mesh.position.x) * k
      mesh.position.z += (squareZ(square.rank) - mesh.position.z) * k
    }
  }
}

export type PieceAnimation = SceneState['animations'][number]

export function stepPieceAnimation(anim: PieceAnimation, time: number) {
  const motion = anim.mesh.userData.historical && !anim.slide ? anim.mesh.userData.motion : undefined
  if (motion) {
    if (motion.plan && !motion.path) {
      animateHistorical(anim.mesh, time)
      if (time < motion.planAt) return false
      motion.path = motion.plan()
      motion.planAt = time + 400
      anim.start = time
      if (!motion.path) return false
    }
    if (motion.path && !motion.pathReady) {
      motion.distance = groundPathLength(motion.path)
      motion.walk = Math.min(2400, Math.max(450, motion.distance * 110))
      motion.heading = groundPathPoint(motion.path, 0).heading
      motion.pathReady = true
      anim.duration = motion.turn + motion.walk + motion.strike + motion.defeat + motion.promote + motion.back
    }
    let elapsed = Math.max(0, time - anim.start)
    if (motion.path) {
      motion.walker ??= { position: anim.from.clone(), heading: motion.heading, index: 1, distance: 0 }
      motion.routeMoved = 0
      if (elapsed >= motion.turn && motion.routeEnd === undefined) {
        const dt = Math.min(0.05, Math.max(0, time - (motion.routeTime ?? anim.start + motion.turn)) / 1000)
        const step = walkGroundPath(motion.walker, motion.path, dt, motion.distance / Math.max(0.001, motion.walk / 1000))
        motion.routeMoved = step.moved
        if (step.complete) motion.routeEnd = time
      }
      motion.routeTime = time
      if (elapsed >= motion.turn)
        elapsed =
          motion.turn +
          motion.walk * (motion.routeEnd === undefined ? motion.walker.distance / Math.max(0.001, motion.distance) : 1) +
          (motion.routeEnd === undefined ? 0 : time - motion.routeEnd)
    }
    const progress = motion.walk ? THREE.MathUtils.clamp((elapsed - motion.turn) / motion.walk, 0, 1) : 1
    const eased = motion.path ? progress : progress * progress * (3 - 2 * progress)
    const afterWalk = elapsed - motion.turn - motion.walk
    const attack = motion.strike && afterWalk >= 0 && afterWalk < motion.strike ? afterWalk / motion.strike : -1
    const afterCapture = afterWalk - motion.strike - motion.defeat
    const promote = motion.promote ? THREE.MathUtils.clamp(afterCapture / motion.promote, 0, 1) : 1
    const returning = THREE.MathUtils.clamp((afterCapture - motion.promote) / Math.max(1, motion.back), 0, 1)
    const turning = motion.turn ? THREE.MathUtils.smoothstep(elapsed / motion.turn, 0, 1) : 1
    const angle = (from: number, to: number, amount: number) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * amount
    const route = motion.path ? motion.walker : null
    anim.mesh.rotation.y =
      elapsed < motion.turn
        ? angle(motion.initial, motion.heading, turning)
        : angle(route?.heading ?? motion.heading, motion.facing, THREE.MathUtils.smoothstep(returning, 0, 1))
    if (route) {
      anim.mesh.position.copy(route.position)
    } else anim.mesh.position.lerpVectors(anim.from, anim.to, eased)
    if (motion.victim) {
      const defeat = THREE.MathUtils.clamp((afterWalk - motion.strike * 0.48) / (motion.strike * 0.52 + motion.defeat), 0, 1)
      const approach = new THREE.Vector3()
        .subVectors(anim.from, anim.to)
        .normalize()
        .multiplyScalar(0.42 * (1 - defeat))
      anim.mesh.position.addScaledVector(approach, eased)
      const victim = motion.victim as THREE.Object3D
      victim.rotation.x = (-defeat * Math.PI) / 2
      victim.position.y = -0.08 * defeat
      victim.visible = defeat < 1
      if (motion.spirit && motion.camp && afterCapture >= 0) {
        const id = ++spiritId
        motion.camp.userData.arrivalToken = id
        motion.flights.push({
          id,
          mesh: motion.spirit,
          body: motion.body,
          camp: motion.camp,
          from: anim.to.clone(),
          to: motion.camp.position.clone(),
          start: anim.start + motion.turn + motion.walk + motion.strike + motion.defeat,
          duration: motion.transfer,
          revive: 500,
        })
        motion.spirit = undefined
        motion.body = undefined
        motion.camp = undefined
      }
    }
    const walking = elapsed >= motion.turn && progress < 1 && (!motion.path || motion.routeMoved > 0.0001) ? Math.min(1, progress * 6, (1 - progress) * 6) : 0
    if (attack >= 0) anim.mesh.userData.readiness = 1
    animateHistorical(anim.mesh, time, walking, attack, eased * motion.distance * 10)
    if (walking) {
      const step = Math.floor(eased * Math.min(6, Math.max(2, motion.distance * 1.5)))
      if (step !== anim.mesh.userData.stepAt) {
        anim.mesh.userData.stepAt = step
        const body = anim.mesh.userData.figure.userData.spec.body as string
        motion.effects?.burst('step', anim.mesh.position, time)
        playSound('move', body === 'horse' ? 'horse' : body.endsWith('cart') || body === 'chariot' ? 'cart' : 'foot')
      }
    }
    if (motion.strike && afterWalk >= motion.strike * 0.48 && !anim.mesh.userData.impactPlayed) {
      anim.mesh.userData.impactPlayed = true
      playSound('capture')
      motion.effects?.burst('hit', anim.to, time)
      anim.impact?.()
    }
    if (motion.promote && afterCapture >= 0 && !anim.mesh.userData.promotionPlayed) {
      anim.mesh.userData.promotionPlayed = true
      motion.effects?.burst('promotion', anim.to, time)
    }
    if (anim.flip) {
      anim.flip.position.copy(anim.mesh.position)
      anim.flip.rotation.y = anim.mesh.rotation.y
      anim.flip.scale.setScalar(Math.max(0.001, 1 - promote * 2))
      anim.mesh.visible = promote > 0.35
      anim.mesh.scale.setScalar(Math.max(0.001, Math.min(1, (promote - 0.35) / 0.65)))
      animateHistorical(anim.flip, time, walking, attack, eased * motion.distance * 10)
    }
    if (elapsed < (anim.duration ?? 0)) return false
    for (const transient of [motion.victim, motion.spirit, motion.body])
      if (transient) {
        transient.removeFromParent()
        disposePiece(transient)
      }
    if (motion.camp) delete motion.camp.userData.arriving
    anim.mesh.position.copy(anim.to)
    anim.mesh.rotation.y = motion.facing
    anim.mesh.scale.setScalar(1)
    anim.mesh.visible = true
    delete anim.mesh.userData.motion
    delete anim.mesh.userData.striking
    delete anim.mesh.userData.stepAt
    delete anim.mesh.userData.impactPlayed
    delete anim.mesh.userData.promotionPlayed
    if (anim.flip) {
      anim.flip.removeFromParent()
      disposePiece(anim.flip)
    }
    return true
  }
  const historical = !!anim.mesh.userData.historical
  const t = Math.min(
    1,
    (time - anim.start) / (anim.duration ?? (historical ? (anim.flip ? 360 : anim.mesh.userData.striking ? 320 : 160) : anim.flip ? 550 : 220)),
  )
  const e = 1 - Math.pow(1 - t, 3)
  anim.mesh.position.lerpVectors(anim.from, anim.to, e)
  if (!anim.slide && !historical)
    anim.mesh.position.y = anim.to.y + Math.sin(Math.PI * t) * (historical ? (anim.mesh.userData.figure.userData.spec.body === 'horse' ? 0.35 : 0.03) : 0.5)
  if (historical) animateHistorical(anim.mesh, time, 1 - t, anim.mesh.userData.striking ? t : -1)
  if (anim.fromQ && anim.toQ) anim.mesh.quaternion.slerpQuaternions(anim.fromQ, anim.toQ, e)
  if (anim.flip) {
    anim.flip.position.copy(anim.mesh.position)
    if (historical) {
      anim.flip.scale.setScalar(Math.max(0.001, 1 - t * 2))
      anim.mesh.visible = t > 0.35
      anim.mesh.scale.setScalar(Math.max(0.001, Math.min(1, (t - 0.35) / 0.65)))
      animateHistorical(anim.flip, time, 1 - t)
    } else {
      anim.flip.rotation.z = Math.PI * e
      anim.flip.position.y += komaDepth(pieceScale(anim.flip.userData.type ?? anim.mesh.userData.type ?? PieceType.KING)) * e
    }
  }
  if (t < 1) return false
  anim.mesh.position.copy(anim.to)
  anim.mesh.visible = true
  if (historical) {
    anim.mesh.scale.setScalar(1)
    delete anim.mesh.userData.striking
  }
  if (anim.flip) {
    anim.flip.removeFromParent()
    disposePiece(anim.flip)
  }
  return true
}

function campDepth(mesh: THREE.Object3D) {
  if (mesh.userData.arriving) return 0.9
  const body = mesh.userData.figure.userData.spec.body as string
  return body.endsWith('cart') || body === 'chariot' ? 0.58 : body === 'horse' ? 0.62 : 0.36
}

function campCollision(piece: THREE.Object3D, other: THREE.Object3D, x: number, z: number) {
  const a = piece.rotation.y
  const b = other.rotation.y
  const dx = other.position.x - x
  const dz = other.position.z - z
  for (const axis of [-a, Math.PI / 2 - a, -b, Math.PI / 2 - b]) {
    const radiusA = 0.32 * Math.abs(Math.cos(axis + a)) + campDepth(piece) * Math.abs(Math.sin(axis + a))
    const radiusB = 0.32 * Math.abs(Math.cos(axis + b)) + campDepth(other) * Math.abs(Math.sin(axis + b))
    if (Math.abs(dx * Math.cos(axis) + dz * Math.sin(axis)) >= radiusA + radiusB + 0.02) return false
  }
  return true
}

export function stepAnimations(s: SceneState, time: number) {
  for (const piece of s.pieces.children) {
    if (piece.userData.transient || piece.userData.arriving) continue
    if (s.animations.some((animation) => animation.mesh === piece || animation.flip === piece)) continue
    if (
      piece.userData.historical &&
      !piece.userData.square &&
      piece.userData.campX !== undefined &&
      !piece.userData.ready &&
      s.drag?.mesh !== piece &&
      !s.animations.some((animation) => animation.mesh === piece)
    ) {
      const body = piece.userData.figure.userData.spec.body as string
      const vehicle = body.endsWith('cart') || body === 'chariot' || body === 'horse'
      const center = standCenter(piece.userData.color)
      const width = layout.portrait ? (layout.vertical ? stripDepth() : STRIP_W) : standWidth()
      const depth = layout.portrait ? (layout.vertical ? STRIP_W : stripDepth()) : standWidth()
      const margin = vehicle ? 0.7 : 0.55
      const neighbours = s.pieces.children.filter(
        (other) =>
          other !== piece &&
          (other.visible || other.userData.arriving) &&
          other.userData.historical &&
          !other.userData.transient &&
          other.userData.color === piece.userData.color &&
          (!other.userData.square || other.userData.motion?.plan),
      )
      const clear = (x: number, z: number) => {
        const sin = Math.abs(Math.sin(piece.rotation.y))
        const cos = Math.abs(Math.cos(piece.rotation.y))
        const extentX = 0.32 * cos + campDepth(piece) * sin + 0.05
        const extentZ = 0.32 * sin + campDepth(piece) * cos + 0.05
        if (Math.abs(x - center.x) + extentX > width / 2 || Math.abs(z - center.z) + extentZ > depth / 2) return false
        return !neighbours.some((other) => campCollision(piece, other, x, z))
      }
      const patrol = (piece.userData.patrol ??= {
        last: time,
        x: piece.position.x,
        z: piece.position.z,
        until: time + Math.abs(piece.userData.grainSeed % 1500),
        phase: 0,
        seed: piece.userData.grainSeed >>> 0,
      })
      const random = () => (patrol.seed = (Math.imul(patrol.seed, 1664525) + 1013904223) >>> 0) / 4294967296
      const dt = Math.min(0.05, Math.max(0, (time - patrol.last) / 1000))
      patrol.last = time
      if (time >= patrol.until) {
        patrol.x = center.x + (random() - 0.5) * Math.max(0, width - margin * 2)
        patrol.z = center.z + (random() - 0.5) * Math.max(0, depth - margin * 2)
        const bounds = {
          minX: center.x - width / 2 + margin,
          maxX: center.x + width / 2 - margin,
          minZ: center.z - depth / 2 + margin,
          maxZ: center.z + depth / 2 - margin,
        }
        const obstacles = neighbours.map(actorObstacle)
        patrol.path = groundPath(piece.position, new THREE.Vector3(patrol.x, handSurface(), patrol.z), bounds, obstacles, 0.28)?.slice(1) ?? []
        patrol.until = time + (patrol.path.length ? 15000 : 300 + random() * 500)
      }
      while (patrol.path?.length && piece.position.distanceTo(patrol.path[0]) < 0.08) patrol.path.shift()
      const waypoint = patrol.path?.[0]
      const dx = waypoint ? waypoint.x - piece.position.x : 0
      const dz = waypoint ? waypoint.z - piece.position.z : 0
      const distance = Math.hypot(dx, dz)
      let travel = 0
      if (distance > 0.08) {
        const heading = Math.atan2(-dx, -dz)
        const turn = Math.atan2(Math.sin(heading - piece.rotation.y), Math.cos(heading - piece.rotation.y))
        const previousYaw = piece.rotation.y
        piece.rotation.y += THREE.MathUtils.clamp(turn, -dt * 3, dt * 3)
        const canTurn = clear(piece.position.x, piece.position.z)
        if (!canTurn) piece.rotation.y = previousYaw
        const step = Math.min(distance, dt * (vehicle ? 0.55 : 0.8))
        const x = piece.position.x - Math.sin(piece.rotation.y) * step
        const z = piece.position.z - Math.cos(piece.rotation.y) * step
        const blocked = !clear(x, z)
        if ((Math.abs(turn) < 0.1 || !canTurn) && !blocked) {
          const moved = Math.hypot(x - piece.position.x, z - piece.position.z)
          piece.position.x = x
          piece.position.z = z
          patrol.phase += moved * 10
          travel = moved > 0.0001 ? 0.8 : 0
        } else if (blocked) patrol.until = Math.min(patrol.until, time + 200 + random() * 350)
      } else if (patrol.until > time + 1800) patrol.until = time + 300 + random() * 1200
      piece.position.y = handSurface()
      animateHistorical(piece, time, travel, -1, patrol.phase)
    } else animateHistorical(piece, time)
  }
  for (const anim of [...s.animations]) {
    if (!stepPieceAnimation(anim, time)) continue
    s.animations.splice(s.animations.indexOf(anim), 1)
    anim.land?.()
  }
  flushMarks(s)
  for (const flight of [...s.spiritFlights]) {
    const progress = THREE.MathUtils.clamp((time - flight.start) / flight.duration, 0, 1)
    const revival = THREE.MathUtils.clamp((time - flight.start - flight.duration) / flight.revive, 0, 1)
    const arriving = flight.camp.userData.arrivalToken === flight.id && flight.camp.parent === s.pieces && !flight.camp.userData.square
    if (arriving) flight.to.copy(flight.camp.position)
    if (flight.body) {
      if (arriving) {
        flight.body.visible = true
        animateHistorical(flight.body, time)
        poseRevival(flight.body, flight.to, flight.camp.rotation.y, revival)
      } else {
        flight.body.removeFromParent()
        disposePiece(flight.body)
        flight.body = undefined
      }
    }
    animateHistorical(flight.mesh, time)
    poseSpirit(flight.mesh, flight.from, flight.to, progress)
    if (flight.mesh.visible && time >= (flight.lastWisp ?? 0)) {
      s.battlefieldFx?.burst('spirit', flight.mesh.position, time)
      flight.lastWisp = time + 100
    }
    if (progress === 1 && !flight.merged) {
      if (arriving) s.battlefieldFx?.burst('spirit', flight.to, time)
      flight.merged = true
    }
    if (revival < 1) continue
    if (flight.camp.userData.arrivalToken === flight.id) {
      if (flight.camp.parent === s.pieces && !flight.camp.userData.square) {
        flight.camp.visible = true
        s.battlefieldFx?.burst('spirit', flight.camp.position, time)
      }
      delete flight.camp.userData.arriving
      delete flight.camp.userData.arrivalToken
    }
    flight.mesh.removeFromParent()
    disposePiece(flight.mesh)
    if (flight.body) {
      flight.body.removeFromParent()
      disposePiece(flight.body)
    }
    s.spiritFlights.splice(s.spiritFlights.indexOf(flight), 1)
  }
  s.battlefieldFx?.update(time)
}
