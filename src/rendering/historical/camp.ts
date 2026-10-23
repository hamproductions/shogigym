import * as THREE from 'three'
import type { GroundObstacle } from './navigation'

export const CAMP_GROUND = -0.24

export const campFacing = (x: number, z: number) => (Math.abs(x) > Math.abs(z) ? (x > 0 ? Math.PI / 2 : -Math.PI / 2) : z > 0 ? 0 : Math.PI)

export function campEntrance(x: number, z: number, width: number, depth: number) {
  const facing = campFacing(x, z)
  const forward = new THREE.Vector3(-Math.sin(facing), 0, -Math.cos(facing))
  const gate = new THREE.Vector3(x, CAMP_GROUND, z).addScaledVector(forward, Math.abs(forward.x) > 0.5 ? width / 2 : depth / 2)
  return { inside: gate.clone().addScaledVector(forward, -0.85), gate, outside: gate.clone().addScaledVector(forward, 0.85) }
}

export function campWalls(x: number, z: number, width: number, depth: number): GroundObstacle[] {
  const entrance = campEntrance(x, z, width, depth).gate
  const walls: GroundObstacle[] = []
  for (const vertical of [true, false])
    for (const sign of [-1, 1]) {
      const fixed = (vertical ? x : z) + (sign * (vertical ? width : depth)) / 2
      const middle = vertical ? z : x
      const length = vertical ? depth : width
      const gate = Math.abs(fixed - (vertical ? entrance.x : entrance.z)) < 0.01
      for (const [low, high] of gate
        ? [
            [middle - length / 2, middle - 0.35],
            [middle + 0.35, middle + length / 2],
          ]
        : [[middle - length / 2, middle + length / 2]]) {
        walls.push(
          vertical ? { minX: fixed - 0.025, maxX: fixed + 0.025, minZ: low, maxZ: high } : { minX: low, maxX: high, minZ: fixed - 0.025, maxZ: fixed + 0.025 },
        )
      }
    }
  return walls
}

export function createCampFence(side: '先手' | '後手') {
  const root = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: 0x70573a, roughness: 0.95 })
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.028, 0.04, 0.55, 6), wood, 40)
  const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), wood, 20)
  posts.castShadow = rails.castShadow = true
  posts.receiveShadow = rails.receiveShadow = true
  root.add(posts, rails)
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = side === '先手' ? '#213c50' : '#9d472e'
  ctx.fillRect(0, 0, 128, 256)
  ctx.fillStyle = '#f2e2bd'
  ctx.font = 'bold 82px "Noto Serif JP", serif'
  ctx.textAlign = 'center'
  ctx.fillText(side[0], 64, 105)
  ctx.fillText(side[1], 64, 205)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  const standard = new THREE.Group()
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 1.9, 8), wood)
  pole.position.y = 0.95
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.84), new THREE.MeshStandardMaterial({ map, side: THREE.DoubleSide, roughness: 1 }))
  banner.position.set(0.2, 1.42, 0)
  standard.add(pole, banner)
  root.add(standard)
  const transform = new THREE.Object3D()
  return {
    root,
    place(x: number, z: number, width: number, depth: number) {
      root.position.set(x, CAMP_GROUND, z)
      standard.position.set(-width / 2 + 0.12, 0, -depth / 2 + 0.12)
      const gate = Math.abs(x) > Math.abs(z) ? (x > 0 ? 3 : 1) : z > 0 ? 0 : 2
      let postCount = 0
      let railCount = 0
      for (let side = 0; side < 4; side++) {
        const horizontal = side % 2 === 0
        const length = horizontal ? width : depth
        const edge = ((side < 2 ? -1 : 1) * (horizontal ? depth : width)) / 2
        for (let i = 0; i < 10; i++) {
          const along = (i / 10 - 0.5) * length
          if (side === gate && Math.abs(along) < 0.38) continue
          transform.position.set(horizontal ? along : -edge, 0.275, horizontal ? edge : along)
          transform.rotation.set(0, 0, 0)
          transform.scale.set(1, 1, 1)
          transform.updateMatrix()
          posts.setMatrixAt(postCount++, transform.matrix)
        }
        for (const height of [0.18, 0.4]) {
          const span = side === gate ? (length - 0.7) / 2 : length
          for (const part of side === gate ? [-1, 1] : [0]) {
            const along = part * (0.35 + span / 2)
            transform.position.set(horizontal ? along : -edge, height, horizontal ? edge : along)
            transform.rotation.set(0, horizontal ? 0 : Math.PI / 2, 0)
            transform.scale.set(span, 0.045, 0.035)
            transform.updateMatrix()
            rails.setMatrixAt(railCount++, transform.matrix)
          }
        }
      }
      posts.count = postCount
      rails.count = railCount
      posts.instanceMatrix.needsUpdate = rails.instanceMatrix.needsUpdate = true
      posts.computeBoundingSphere()
      rails.computeBoundingSphere()
    },
  }
}
