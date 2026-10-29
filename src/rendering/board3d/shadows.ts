import * as THREE from 'three'

type Light = THREE.SpotLight | THREE.DirectionalLight | THREE.PointLight

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
  let state: number[] = []
  let at = 0
  let differs = false
  const begin = (object: THREE.Object3D) => {
    let saved = states.get(object)
    if (!saved) states.set(object, (saved = []))
    state = saved
    at = 0
    differs = false
  }
  const put = (value: number) => {
    if (state[at] !== value) {
      state[at] = value
      differs = true
    }
    at++
  }
  const putAll = (values: ArrayLike<number>) => {
    for (let i = 0; i < values.length; i++) put(values[i])
  }
  const end = () => {
    if (state.length !== at) {
      state.length = at
      differs = true
    }
    return differs
  }
  const putMaterial = (material: THREE.Material) => {
    put(materialKey(material))
    put(material.version)
    put(+material.visible)
    put(material.side)
    put(material.shadowSide ?? -1)
  }
  let casters = new Set<THREE.Object3D>()
  let next = new Set<THREE.Object3D>()
  const lights: Light[] = []
  let dirty = false
  const visit = (object: THREE.Object3D) => {
    if (object instanceof THREE.SpotLight || object instanceof THREE.DirectionalLight || object instanceof THREE.PointLight) {
      if (object.castShadow) lights.push(object)
    }
    const mesh = object as THREE.Mesh
    if (!mesh.castShadow || !mesh.geometry) return
    next.add(mesh)
    const geometry = mesh.geometry
    begin(mesh)
    putAll(mesh.matrixWorld.elements)
    put(mesh.layers.mask)
    put(geometry.id)
    put(geometry.index?.version ?? 0)
    put((mesh as THREE.InstancedMesh).instanceMatrix?.version ?? 0)
    put((mesh as THREE.InstancedMesh).count ?? 0)
    for (const name in geometry.attributes) {
      const attribute = geometry.attributes[name]
      put('version' in attribute ? attribute.version : attribute.data.version)
    }
    if (Array.isArray(mesh.material)) mesh.material.forEach(putMaterial)
    else putMaterial(mesh.material)
    put(materialKey(mesh.customDepthMaterial))
    put(mesh.customDepthMaterial?.version ?? 0)
    put(materialKey(mesh.customDistanceMaterial))
    put(mesh.customDistanceMaterial?.version ?? 0)
    if (end() || !casters.has(mesh) || mesh instanceof THREE.SkinnedMesh || mesh.morphTargetInfluences?.some((weight) => weight !== 0)) dirty = true
  }
  return (force = false) => {
    dirty = force
    next.clear()
    lights.length = 0
    scene.traverseVisible(visit)
    if (casters.size !== next.size) dirty = true
    else for (const caster of casters) if (!next.has(caster)) dirty = true
    ;[casters, next] = [next, casters]
    for (const light of lights) {
      const shadow = light.shadow
      begin(light)
      putAll(light.matrixWorld.elements)
      putAll(shadow.camera.projectionMatrix.elements)
      put(shadow.mapSize.x)
      put(shadow.mapSize.y)
      put(shadow.bias)
      put(shadow.normalBias)
      if (light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight) {
        light.target.updateWorldMatrix(true, false)
        putAll(light.target.matrixWorld.elements)
      }
      if (light instanceof THREE.SpotLight) {
        put(light.angle)
        put(light.distance)
        put(shadow.camera.far)
        put(light.shadow.focus)
      }
      if (light instanceof THREE.PointLight) {
        put(light.distance)
        put(shadow.camera.far)
      }
      shadow.autoUpdate = false
      shadow.needsUpdate ||= end() || dirty || !shadow.map
    }
  }
}
