import * as THREE from 'three'

export function shadowUpdater(scene: THREE.Scene) {
  const states = new WeakMap<THREE.Object3D, number[]>()
  const materials = new WeakMap<THREE.Material, number>()
  let nextMaterial = 0
  const materialKey = (material?: THREE.Material) => {
    if (!material) return -1
    let key = materials.get(material)
    if (key === undefined) materials.set(material, (key = nextMaterial++))
    return key
  }
  let casters = new Set<THREE.Object3D>()
  const changed = (object: THREE.Object3D, values: number[]) => {
    const previous = states.get(object)
    if (previous?.length === values.length && values.every((value, index) => value === previous[index])) return false
    states.set(object, values)
    return true
  }
  return (force = false) => {
    let dirty = force
    const next = new Set<THREE.Object3D>()
    const lights: (THREE.SpotLight | THREE.DirectionalLight | THREE.PointLight)[] = []
    scene.traverseVisible((object) => {
      if (object instanceof THREE.SpotLight || object instanceof THREE.DirectionalLight || object instanceof THREE.PointLight) {
        if (object.castShadow) lights.push(object)
      }
      const mesh = object as THREE.Mesh
      if (!mesh.castShadow || !mesh.geometry) return
      next.add(mesh)
      const surface = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const geometry = mesh.geometry
      const values = [
        ...mesh.matrixWorld.elements,
        mesh.layers.mask,
        geometry.id,
        geometry.index?.version ?? 0,
        ...Object.values(geometry.attributes).map((attribute) => ('version' in attribute ? attribute.version : attribute.data.version)),
        ...surface.flatMap((material) => [materialKey(material), material.version, +material.visible, material.side, material.shadowSide ?? -1]),
        materialKey(mesh.customDepthMaterial),
        mesh.customDepthMaterial?.version ?? 0,
        materialKey(mesh.customDistanceMaterial),
        mesh.customDistanceMaterial?.version ?? 0,
      ]
      if (changed(mesh, values) || !casters.has(mesh) || mesh instanceof THREE.SkinnedMesh || mesh.morphTargetInfluences?.some((weight) => weight !== 0))
        dirty = true
    })
    if (casters.size !== next.size || [...casters].some((caster) => !next.has(caster))) dirty = true
    casters = next
    for (const light of lights) {
      const shadow = light.shadow
      const values = [
        ...light.matrixWorld.elements,
        ...shadow.camera.projectionMatrix.elements,
        shadow.mapSize.x,
        shadow.mapSize.y,
        shadow.bias,
        shadow.normalBias,
      ]
      if (light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight) {
        light.target.updateWorldMatrix(true, false)
        values.push(...light.target.matrixWorld.elements)
      }
      if (light instanceof THREE.SpotLight) values.push(light.angle, light.distance, shadow.camera.far, light.shadow.focus)
      if (light instanceof THREE.PointLight) values.push(light.distance, shadow.camera.far)
      shadow.autoUpdate = false
      shadow.needsUpdate ||= dirty || changed(light, values) || !shadow.map
    }
  }
}
