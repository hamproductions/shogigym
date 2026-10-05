import * as THREE from 'three'
import { Color, PieceType, Square } from 'tsshogi'
import { squareAt, squareX, squareZ } from './dimensions'
import { squareFrame, squareTile } from './marks'
import { ghostPiece } from './piece'
import type { Latest, SceneState } from './types'

type Pick = { kind: 'square'; square: Square } | { kind: 'hand'; color: Color; type: PieceType } | { kind: 'arrow'; usi: string }

const LEGAL = { fill: 0x3fae5a, edge: 0x1f7a3a, opacity: 0.55 }
const ILLEGAL = { fill: 0x8a8a8a, edge: 0x5a5a5a, opacity: 0.3 }

const squareOwner = (object: THREE.Object3D) => {
  let o: THREE.Object3D | null = object
  while (o && !o.userData.square) o = o.parent
  return o
}

function dropMarker(root: THREE.Group) {
  const fill = squareTile(LEGAL.fill, LEGAL.opacity)
  fill.rotation.x = -Math.PI / 2
  fill.visible = false
  const edge = squareFrame(0.62, new THREE.MeshBasicMaterial({ color: LEGAL.edge, depthWrite: false }))
  edge.position.z = 0.001
  fill.add(edge)
  root.add(fill)
  return {
    hide: () => void (fill.visible = false),
    show: (sq: Square | null, legal: boolean) => {
      fill.visible = !!sq
      if (!sq) return
      const look = legal ? LEGAL : ILLEGAL
      fill.position.set(squareX(sq.file), 0.008, squareZ(sq.rank))
      fill.material.color.set(look.fill)
      fill.material.opacity = look.opacity
      edge.material.color.set(look.edge)
    },
  }
}

export function bindPointer(s: SceneState, latest: Latest, rebuild: () => void) {
  const canvas = s.renderer.domElement
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const drop = dropMarker(s.root)
  let down: { pick: Pick; x: number; y: number; pointerId: number } | null = null
  let ghost: THREE.Object3D | null = null
  let orbitDown: { x: number; y: number } | null = null
  const exitPov = () => {
    if (s.tilePov) {
      s.tilePov = null
      s.tilePovFrame = null
    }
  }

  const ray = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, s.camera)
  }

  const localPoint = () => {
    const hit = new THREE.Vector3()
    if (!raycaster.ray.intersectPlane(plane, hit)) return null
    return s.root.worldToLocal(hit)
  }

  const nearTag = () => {
    const rect = canvas.getBoundingClientRect()
    return s.tags
      .map((tag) => {
        const p = tag.getWorldPosition(new THREE.Vector3()).project(s.camera)
        return { tag, d: Math.hypot(((p.x - pointer.x) * rect.width) / 2, ((p.y - pointer.y) * rect.height) / 2) }
      })
      .filter((t) => t.d < 22)
      .sort((a, b) => a.d - b.d)[0]
  }

  const pick = (): Pick | null => {
    const tag = latest.current.onArrow && nearTag()
    if (tag) return { kind: 'arrow', usi: tag.tag.userData.usi as string }
    const handHit = raycaster.intersectObjects(s.handMeshes, false)[0]
    if (handHit) return { kind: 'hand', ...(handHit.object.userData as { color: Color; type: PieceType }) }
    const pieceHit = raycaster.intersectObjects(s.pieces.children, true).find((h) => squareOwner(h.object))
    const owner = pieceHit && squareOwner(pieceHit.object)
    if (owner && s.drag?.mesh !== owner) return { kind: 'square', square: owner.userData.square as Square }
    const p = localPoint()
    const square = p && squareAt(p.x, p.z)
    return square ? { kind: 'square', square } : null
  }

  const clearGhost = () => {
    if (ghost) s.marks.remove(ghost)
    ghost = null
  }

  const startDrag = (from: Pick) => {
    if (from.kind === 'arrow') return
    const mesh =
      from.kind === 'square'
        ? s.pieces.children.find((m) => (m.userData.square as Square | undefined)?.equals(from.square))
        : s.handMeshes.find((m) => m.userData.type === from.type && m.userData.color === from.color)
    if (!mesh) return
    const toMove = latest.current.movable === undefined ? latest.current.position.color : latest.current.movable
    const owner = from.kind === 'square' ? latest.current.position.board.at(from.square)?.color : from.color
    if (owner !== toMove) return
    if (from.kind === 'square') latest.current.onSquare(from.square)
    else latest.current.onHand(from.color, from.type)
    s.drag = { mesh, from: from.kind === 'square' ? from.square : from.type }
  }

  const showGhost = (sq: Square) => {
    const { drag } = s
    if (!drag) return
    const onBoard = drag.from instanceof Square ? latest.current.position.board.at(drag.from) : null
    const type = onBoard?.type ?? (drag.mesh.userData.type as PieceType | undefined)
    const color = onBoard?.color ?? (drag.mesh.userData.color as Color | undefined)
    if (type === undefined || color === undefined) return
    ghost = ghostPiece(type, color)
    ghost.position.set(squareX(sq.file), 0, squareZ(sq.rank))
    ghost.userData.at = sq.usi
    s.marks.add(ghost)
  }

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0 || !event.isPrimary) return
    orbitDown = latest.current.orbit ? { x: event.clientX, y: event.clientY } : null
    if (s.flip) {
      down = null
      return
    }
    ray(event)
    const hit = pick()
    if (!hit) return
    down = { pick: hit, x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    canvas.setPointerCapture(event.pointerId)
  }

  const onMove = (event: PointerEvent) => {
    if (s.flip) {
      canvas.style.cursor = 'grab'
      return
    }
    ray(event)
    const hit = pick()
    canvas.style.cursor = hit ? 'pointer' : 'default'
    if (!down || event.pointerId !== down.pointerId) return
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6
    if (s.controls && !s.drag && (event.clientX !== down.x || event.clientY !== down.y)) down = null
    if (!down) return
    if (!s.drag && moved) startDrag(down.pick)
    if (!s.drag) return
    const p = localPoint()
    if (p) s.drag.mesh.position.set(p.x, 0.6, p.z)
    const sq = hit?.kind === 'square' ? hit.square : null
    const legal = !!sq && (latest.current.targets ?? []).some((t) => t.equals(sq))
    if (ghost && (!legal || ghost.userData.at !== sq?.usi)) clearGhost()
    if (legal && sq && !ghost) showGhost(sq)
    if (sq) drop.show(sq, legal)
    else drop.hide()
  }

  const onUp = (event: PointerEvent) => {
    if (latest.current.orbit && event.button === 0) {
      ray(event)
      const click = orbitDown && Math.hypot(event.clientX - orbitDown.x, event.clientY - orbitDown.y) <= 6
      orbitDown = null
      if (!raycaster.intersectObjects(s.pieces.children, true).length && click) {
        if (s.tilePov) exitPov()
        down = null
        return
      }
    }
    if (!down || event.pointerId !== down.pointerId || event.button !== 0) return
    if (s.flip) {
      down = null
      return
    }
    ray(event)
    const hit = pick()
    if (s.drag) {
      const { from } = s.drag
      s.drag = null
      drop.hide()
      clearGhost()
      s.droppedAt = performance.now()
      if (hit?.kind === 'square') latest.current.onDrop(from, hit.square)
      rebuild()
    } else if (down && hit && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 6) {
      if (hit.kind === 'square') latest.current.onSquare(hit.square)
      else if (hit.kind === 'arrow') latest.current.onArrow?.(hit.usi)
      else latest.current.onHand(hit.color, hit.type)
    }
    down = null
  }

  const cancel = () => {
    down = null
    if (s.drag) {
      s.drag = null
      drop.hide()
      clearGhost()
      rebuild()
    }
  }
  const tilePov = (event: MouseEvent) => {
    if (!latest.current.orbit || s.flip) return
    if (event.type === 'contextmenu' && s.tilePov) {
      event.preventDefault()
      exitPov()
      return
    }
    ray(event)
    const hit = raycaster.intersectObjects(s.pieces.children, true)[0]
    if (!hit) {
      if (event.type === 'contextmenu') {
        event.preventDefault()
        exitPov()
      }
      return
    }
    let tile = hit.object
    while (tile.parent && tile.parent !== s.pieces) tile = tile.parent
    if (tile.parent !== s.pieces) return
    event.preventDefault()
    cancel()
    s.tilePov = tile
    s.tilePovFrame = null
  }
  const unlockPov = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !latest.current.orbit) return
    event.preventDefault()
    event.stopImmediatePropagation()
    exitPov()
  }
  const outsidePov = (event: PointerEvent) => {
    if (latest.current.orbit && s.tilePov && event.button === 0 && event.target !== canvas) exitPov()
  }
  canvas.addEventListener('contextmenu', tilePov)
  canvas.addEventListener('dblclick', tilePov)
  canvas.ownerDocument.addEventListener('keydown', unlockPov, true)
  canvas.ownerDocument.addEventListener('pointerdown', outsidePov, true)
  canvas.addEventListener('pointercancel', cancel)
  canvas.addEventListener('lostpointercapture', cancel)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  return () => {
    canvas.removeEventListener('contextmenu', tilePov)
    canvas.removeEventListener('dblclick', tilePov)
    canvas.ownerDocument.removeEventListener('keydown', unlockPov, true)
    canvas.ownerDocument.removeEventListener('pointerdown', outsidePov, true)
    canvas.removeEventListener('pointercancel', cancel)
    canvas.removeEventListener('lostpointercapture', cancel)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
  }
}
