import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function battlefieldSurface(halfW: number, halfD: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#aa9d79'
  ctx.fillRect(0, 0, 1024, 1024)
  let seed = 711
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296
  for (let i = 0; i < 52000; i++) {
    ctx.fillStyle = i % 3 ? `rgba(55,55,29,${random() * 0.12})` : `rgba(233,217,173,${random() * 0.2})`
    ctx.fillRect(random() * 1024, random() * 1024, 1 + random() * 4, 1 + random() * 3)
  }
  const x = (v: number) => (v / (halfW * 2) + 0.5) * 1024
  const z = (v: number) => (v / (halfD * 2) + 0.5) * 1024
  ctx.strokeStyle = '#655e46'
  ctx.lineWidth = 2
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath()
    ctx.moveTo(x(i - 4.5), z((-4.5 * 38.6) / 35.2))
    ctx.lineTo(x(i - 4.5), z((4.5 * 38.6) / 35.2))
    ctx.moveTo(x(-4.5), z(((i - 4.5) * 38.6) / 35.2))
    ctx.lineTo(x(4.5), z(((i - 4.5) * 38.6) / 35.2))
    ctx.stroke()
  }
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  return new THREE.MeshStandardMaterial({ map, roughness: 1 })
}

export function createBattlefield(halfW: number, halfD: number) {
  const root = new THREE.Group()
  const materials = new Map<number, THREE.MeshStandardMaterial>()
  const box = new THREE.BoxGeometry(1, 1, 1)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8)
  const cone = new THREE.ConeGeometry(1, 1, 10)
  const sphere = new THREE.IcosahedronGeometry(1, 1)
  const mountain = new THREE.ConeGeometry(1, 1, 7, 2)
  const mesh = (geometry: THREE.BufferGeometry, color: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    let material = materials.get(color)
    if (!material) materials.set(color, (material = new THREE.MeshStandardMaterial({ color, roughness: 0.95 })))
    const object = new THREE.Mesh(geometry, material)
    object.position.set(x, y, z)
    object.scale.set(sx, sy, sz)
    object.castShadow = object.receiveShadow = true
    root.add(object)
    return object
  }
  mesh(box, 0x7e8260, 0, -0.3, 0, 200, 0.1, 200)
  for (const side of [-1, 1]) {
    const z = side * (halfD + 3)
    for (let i = -11; i <= 11; i++) {
      if (Math.abs(i) <= 2) continue
      mesh(cylinder, 0x6b5438, i * 0.65, 0.18, z, 0.06, 0.85, 0.06)
      mesh(cone, 0x6b5438, i * 0.65, 0.66, z, 0.06, 0.13, 0.06)
    }
    for (const h of [0.1, 0.4]) {
      mesh(box, 0x775d3d, -4.5, h, z, 5.4, 0.06, 0.07)
      mesh(box, 0x775d3d, 4.5, h, z, 5.4, 0.06, 0.07)
    }
    for (const sign of [-1, 1]) {
      mesh(box, 0x785338, sign * 1.15, 1, z, 0.22, 2.5, 0.24)
      mesh(box, 0x4c3930, sign * 1.15, 0.02, z, 0.5, 0.45, 0.55)
    }
    mesh(box, 0x72503a, 0, 1.9, z, 3.1, 0.15, 0.24)
    for (const sign of [-1, 1]) mesh(box, 0x363c37, sign * 0.78, 2.3, z, 1.9, 0.15, 0.9).rotation.z = -sign * 0.12
    mesh(box, 0x3d3930, 0, 2.43, z, 0.1, 0.1, 1)
    const camp = side < 0 ? 0x485a5a : 0x9f8656
    for (const sign of [-1, 1]) {
      const x = sign * (halfW + 3.5)
      mesh(box, 0x584b36, x, -0.14, z - side * 1.2, 2.2, 0.22, 1.8)
      for (const edge of [-1, 1])
        mesh(box, camp, x + edge * 0.55, 0.71, z - side * 1.2, Math.hypot(1.1, 1.48), 0.06, 2.1).rotation.z = -edge * Math.atan2(1.48, 1.1)
      for (const end of [-1, 1]) {
        mesh(cylinder, 0x70563b, x, 0.62, z - side * 1.2 + end * 0.85, 0.045, 1.74, 0.045)
        for (const edge of [-1, 1]) mesh(cylinder, 0x70563b, x + edge * 0.55, 0.22, z - side * 1.2 + end * 0.85, 0.035, 0.94, 0.035)
      }
      for (let i = 0; i < 3; i++) {
        mesh(box, 0x7c6240, x + (i - 1) * 0.55, 0.16, z + side * 0.2, 0.44, 0.6, 0.5)
        mesh(box, 0x473a2b, x + (i - 1) * 0.55, 0.16, z + side * 0.2, 0.47, 0.05, 0.52)
      }
      const towerX = sign * (halfW + 2)
      for (const dx of [-0.6, 0.6]) for (const dz of [-0.6, 0.6]) mesh(cylinder, 0x70563b, towerX + dx, 1.6, z + side * 2 + dz, 0.08, 3.8, 0.08)
      mesh(box, 0x826b4c, towerX, 2.5, z + side * 2, 1.55, 0.15, 1.55)
      for (const edge of [-1, 1]) mesh(box, 0x3e4540, towerX + edge * 0.4, 3.6, z + side * 2, 1.1, 0.12, 2).rotation.z = -edge * 0.4
      for (const dx of [-0.65, 0.65]) mesh(box, 0x70563b, towerX + dx, 2.9, z + side * 2, 0.08, 0.65, 1.5)
    }
  }
  let seed = 979
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296
  const mountainColors = [0x747c6c, 0x858575, 0x666f64, 0x93917c]
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2 + (random() - 0.5) * 0.12
    const distance = 34 + random() * 8
    const height = 8 + random() * 9
    const peak = mesh(
      mountain,
      mountainColors[i % mountainColors.length],
      Math.cos(angle) * distance,
      height / 2 - 0.25,
      Math.sin(angle) * distance,
      6 + random() * 6,
      height,
      5 + random() * 6,
    )
    peak.rotation.y = random() * Math.PI
    peak.castShadow = peak.receiveShadow = false
    ;(peak.material as THREE.MeshStandardMaterial).flatShading = true
  }
  for (let i = 0; i < 90; i++) {
    const angle = random() * Math.PI * 2
    const distance = Math.max(12, Math.hypot(halfW + 8.2, halfD + 2)) + random() * 12
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    const height = 1.8 + random() * 2.5
    mesh(cylinder, 0x64513a, x, height * 0.3, z, 0.12, height * 0.8, 0.12)
    for (let layer = 0; layer < 3; layer++)
      mesh(cone, i % 3 ? 0x394e38 : 0x4d6040, x, height * (0.45 + layer * 0.19), z, 1.2 - layer * 0.25, height * 0.7, 1.2 - layer * 0.25)
  }
  for (let i = 0; i < 120; i++) {
    const side = i % 2 ? 1 : -1
    const x = side * (halfW + 8.2 + random() * 1.3)
    const z = (random() - 0.5) * halfD * 2
    if (i % 4 === 0) mesh(sphere, 0x75766b, x, -0.12, z, 0.1 + random() * 0.2, 0.12 + random() * 0.15, 0.12 + random() * 0.2)
    else
      for (let blade = 0; blade < 3; blade++)
        mesh(cone, 0x646d42, x + blade * 0.04, -0.08, z, 0.025, 0.2 + random() * 0.2, 0.025).rotation.z = (blade - 1) * 0.3
  }
  const batches = new Map<THREE.Material, { geometries: THREE.BufferGeometry[]; castShadow: boolean; receiveShadow: boolean }>()
  for (const object of root.children as THREE.Mesh[]) {
    object.updateMatrix()
    const material = object.material as THREE.Material
    const batch = batches.get(material) ?? { geometries: [], castShadow: false, receiveShadow: false }
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()
    batch.geometries.push(geometry.applyMatrix4(object.matrix))
    batch.castShadow ||= object.castShadow
    batch.receiveShadow ||= object.receiveShadow
    batches.set(material, batch)
  }
  root.clear()
  batches.forEach(({ geometries, castShadow, receiveShadow }, material) => {
    const geometry = mergeGeometries(geometries)!
    geometries.forEach((item) => item.dispose())
    const object = new THREE.Mesh(geometry, material)
    object.castShadow = castShadow
    object.receiveShadow = receiveShadow
    root.add(object)
  })
  for (const geometry of [box, cylinder, cone, sphere, mountain]) geometry.dispose()
  return root
}
