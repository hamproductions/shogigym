import * as THREE from 'three'
import { Color, PieceType, Square } from 'tsshogi'
import { pieceMesh } from './piece'
import { playSound } from '@/appearance/settings'
import type { SceneState } from './types'

export function createFurigoma3D(state: SceneState, onDone: (faces: boolean[]) => void) {
  const group = new THREE.Group()
  state.root.add(group)
  playSound('clatter')
  const hidden = state.pieces.children.filter(
    (mesh) => mesh.userData.square instanceof Square && mesh.userData.square.rank === 7 && mesh.userData.square.file >= 3 && mesh.userData.square.file <= 7,
  )
  hidden.forEach((mesh) => {
    mesh.visible = false
  })
  const materials = new Set<THREE.Material>()
  let completed = false
  const faces = Array.from({ length: 5 }, () => Math.random() < 0.5)
  const bodies: {
    mesh: THREE.Mesh
    velocity: THREE.Vector3
    spin: THREE.Vector3
    corners: THREE.Vector3[]
    target: THREE.Quaternion
    contacts: number
    settled: boolean
  }[] = []
  for (let i = 0; i < faces.length; i++) {
    const mesh = pieceMesh(PieceType.PAWN, Color.BLACK, i + 71, 48)
    mesh.traverse((node) => {
      const material = (node as THREE.Mesh).material
      if (!material) return
      const owned = (Array.isArray(material) ? material : [material]).map((m) => m.clone())
      owned.forEach((m) => materials.add(m))
      ;(node as THREE.Mesh).material = Array.isArray(material) ? owned : owned[0]
    })
    group.add(mesh)
    mesh.geometry.computeBoundingBox()
    const box = mesh.geometry.boundingBox!
    const corners = [box.min.x, box.max.x].flatMap((x) => [box.min.y, box.max.y].flatMap((y) => [box.min.z, box.max.z].map((z) => new THREE.Vector3(x, y, z))))
    const yaw = (Math.random() - 0.5) * 0.6
    mesh.position.set((i - 2) * 0.35, 1.8 + Math.random() * 0.4, (i % 2 ? 1 : -1) * 0.25)
    mesh.rotation.set(Math.random() * Math.PI, yaw, (Math.random() - 0.5) * 0.6)
    bodies.push({
      mesh,
      velocity: new THREE.Vector3((i - 2) * 0.8, 1.2 + Math.random(), (i % 2 ? 1 : -1) * 0.65),
      spin: new THREE.Vector3(10 + Math.random() * 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5),
      corners,
      target: new THREE.Quaternion().setFromEuler(new THREE.Euler(faces[i] ? 0 : Math.PI, yaw, 0)),
      contacts: 0,
      settled: false,
    })
  }
  const point = new THREE.Vector3()
  const lowest = (body: (typeof bodies)[number]) => Math.min(...body.corners.map((corner) => point.copy(corner).applyQuaternion(body.mesh.quaternion).y))
  const stepPhysics = (delta: number) => {
    const dt = Math.min(0.05, delta)
    const steps = Math.max(1, Math.ceil(dt * 120))
    const step = dt / steps
    for (let n = 0; n < steps; n++) {
      for (const body of bodies) {
        if (body.settled) continue
        const { mesh, velocity, spin } = body
        velocity.y -= 12 * step
        mesh.position.addScaledVector(velocity, step)
        mesh.rotateX(spin.x * step)
        mesh.rotateY(spin.y * step)
        mesh.rotateZ(spin.z * step)
        const bottom = lowest(body)
        if (mesh.position.y + bottom <= 0) {
          mesh.position.y = -bottom
          if (!body.contacts) playSound('move')
          body.contacts++
          if (velocity.y < 0) velocity.y *= -0.33
          velocity.x *= 0.8
          velocity.z *= 0.8
          spin.multiplyScalar(0.65)
          if (body.contacts > 2 && velocity.y < 0.45) {
            mesh.quaternion.slerp(body.target, 1 - Math.exp(-step * 18))
            mesh.position.y = -lowest(body)
            velocity.y = 0
            if (mesh.quaternion.angleTo(body.target) < 0.015 && Math.hypot(velocity.x, velocity.z) < 0.03) {
              mesh.quaternion.copy(body.target)
              mesh.position.y = -lowest(body)
              body.settled = true
            }
          }
        }
        for (const axis of ['x', 'z'] as const) {
          const limit = axis === 'x' ? 3.5 : 1.95
          if (Math.abs(mesh.position[axis]) > limit) {
            mesh.position[axis] = Math.sign(mesh.position[axis]) * limit
            velocity[axis] *= -0.35
          }
        }
      }
      for (let i = 0; i < bodies.length; i++)
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i]
          const b = bodies[j]
          if (Math.abs(a.mesh.position.y - b.mesh.position.y) > 0.25) continue
          const dx = b.mesh.position.x - a.mesh.position.x
          const dz = b.mesh.position.z - a.mesh.position.z
          const distance = Math.hypot(dx, dz)
          if (distance <= 0 || distance >= 0.85) continue
          const overlap = (0.85 - distance) / 2
          a.mesh.position.x -= (dx / distance) * overlap
          a.mesh.position.z -= (dz / distance) * overlap
          b.mesh.position.x += (dx / distance) * overlap
          b.mesh.position.z += (dz / distance) * overlap
        }
    }
    if (!completed && bodies.every((body) => body.settled)) {
      completed = true
      onDone(faces)
    }
  }
  return {
    step: stepPhysics,
    dispose: () => {
      state.root.remove(group)
      hidden.forEach((mesh) => {
        mesh.visible = true
      })
      for (const material of materials) material.dispose()
    },
  }
}
