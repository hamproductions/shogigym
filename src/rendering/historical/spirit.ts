import * as THREE from 'three'

type ColoredMaterial = THREE.MeshBasicMaterial | THREE.MeshStandardMaterial

export function prepareRevival(body: THREE.Object3D, target: THREE.Object3D) {
  const materials = (root: THREE.Object3D) => {
    const result: ColoredMaterial[] = []
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial) result.push(material)
    })
    return result
  }
  const source = materials(body)
  const destination = materials(target)
  if (source.length !== destination.length) throw new Error('Revival rig mismatch')
  body.userData.revivalPalette = source.map((material, index) => ({ material, from: material.color.clone(), to: destination[index].color.clone() }))
}

export function poseRevival(body: THREE.Object3D, at: THREE.Vector3, facing: number, progress: number) {
  const t = THREE.MathUtils.smoothstep(progress, 0, 1)
  body.position.copy(at)
  body.rotation.set((-(1 - t) * Math.PI) / 2, facing, 0, 'YXZ')
  body.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(body)
  const center = box.getCenter(new THREE.Vector3())
  const anchor = body.parent ? body.parent.localToWorld(at.clone()) : at
  const position = body.getWorldPosition(new THREE.Vector3())
  position.x += (anchor.x - center.x) * (1 - t)
  position.z += (anchor.z - center.z) * (1 - t)
  position.y += anchor.y - box.min.y
  body.position.copy(body.parent ? body.parent.worldToLocal(position) : position)
  for (const entry of body.userData.revivalPalette as { material: ColoredMaterial; from: THREE.Color; to: THREE.Color }[])
    entry.material.color.lerpColors(entry.from, entry.to, t)
}

export function prepareSpirit(spirit: THREE.Object3D) {
  const materials = new Set<THREE.Material>()
  spirit.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = object.receiveShadow = false
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material)
      material.transparent = true
      material.opacity = 0
      material.depthWrite = false
      material.blending = THREE.AdditiveBlending
      if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial) material.color.set(0xa6e9ff)
      if (material instanceof THREE.MeshStandardMaterial) {
        material.emissive.set(0x68bfdc)
        material.emissiveIntensity = 0.7
      }
      material.needsUpdate = true
    }
  })
  spirit.userData.spiritMaterials = materials
}

export function poseSpirit(spirit: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, progress: number) {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  const flight = THREE.MathUtils.smoothstep((t - 0.2) / 0.6, 0, 1)
  spirit.position.lerpVectors(from, to, flight)
  spirit.position.y +=
    t < 0.2
      ? 1.35 * THREE.MathUtils.smoothstep(t / 0.2, 0, 1)
      : t > 0.8
        ? 1.35 * (1 - THREE.MathUtils.smoothstep((t - 0.8) / 0.2, 0, 1))
        : 1.35 + Math.sin(Math.PI * flight) * 0.8
  spirit.rotation.set(0, Math.atan2(from.x - to.x, from.z - to.z) + Math.sin(Math.PI * t) * 0.25, 0)
  spirit.scale.setScalar(0.82 + Math.sin(Math.PI * t) * 0.08)
  const opacity = 0.52 * Math.min(1, t / 0.12, (1 - t) / 0.15)
  for (const material of spirit.userData.spiritMaterials as Set<THREE.Material>) material.opacity = opacity
  spirit.visible = t > 0 && t < 1
}
