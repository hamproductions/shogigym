import * as THREE from 'three'

type Entry = { piece: THREE.Object3D; mesh: THREE.Mesh }
type Batch = { entries: Set<Entry>; mesh: THREE.InstancedMesh | null; dirty: boolean }

const identities = new WeakMap<object, number>()
const materialKeys = new WeakMap<THREE.Material, { version: number; key: string }>()
let nextIdentity = 0

const identity = (value: object) => {
  let id = identities.get(value)
  if (id === undefined) identities.set(value, (id = nextIdentity++))
  return id
}

function valueKey(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return typeof value === 'function' ? identity(value) : value
  if (value instanceof THREE.Texture) return value.uuid
  if (Array.isArray(value)) return value.map(valueKey)
  if (ArrayBuffer.isView(value)) return Array.from(value as unknown as ArrayLike<number>)
  if ('toArray' in value && typeof value.toArray === 'function') return value.toArray()
  if (Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, valueKey((value as Record<string, unknown>)[key])]),
    )
  return identity(value)
}

function materialKey(material: THREE.Material) {
  const cached = materialKeys.get(material)
  if (cached?.version === material.version) return cached.key
  const key = JSON.stringify(
    Object.fromEntries(
      Object.keys(material)
        .sort()
        .filter((key) => !['id', 'uuid', 'version', '_listeners'].includes(key))
        .map((key) => [key, valueKey((material as unknown as Record<string, unknown>)[key])]),
    ),
  )
  materialKeys.set(material, { version: material.version, key })
  return key
}

const materialsOf = (mesh: THREE.Mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material])

export class PieceInstances {
  private pieces = new Map<THREE.Object3D, Entry[] | null>()
  private batches = new Map<string, Batch>()
  private parent: THREE.Group

  constructor(parent: THREE.Group) {
    this.parent = parent
  }

  add(piece: THREE.Object3D) {
    if (this.pieces.has(piece)) return
    const meshes: THREE.Mesh[] = []
    let ordinary = false
    piece.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        if (!(object instanceof THREE.Group) && object !== piece) ordinary = true
        return
      }
      meshes.push(object)
      if (object.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender || object.onAfterRender !== THREE.Object3D.prototype.onAfterRender) ordinary = true
      for (const material of materialsOf(object))
        if (
          material.transparent ||
          (material instanceof THREE.MeshPhysicalMaterial && material.transmission > 0) ||
          material.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile
        )
          ordinary = true
    })
    piece.removeFromParent()
    if (ordinary) {
      this.pieces.set(piece, null)
      this.parent.add(piece)
      return
    }
    const entries = meshes.map((mesh) => ({ piece, mesh }))
    this.pieces.set(piece, entries)
    for (const entry of entries) {
      const key = this.key(entry.mesh)
      let batch = this.batches.get(key)
      if (!batch) this.batches.set(key, (batch = { entries: new Set(), mesh: null, dirty: true }))
      batch.entries.add(entry)
      batch.dirty = true
    }
  }

  remove(piece: THREE.Object3D) {
    if (!this.pieces.has(piece)) return
    const entries = this.pieces.get(piece)
    this.pieces.delete(piece)
    if (!entries) {
      piece.removeFromParent()
      return
    }
    for (const entry of entries) {
      const batch = this.batches.get(this.key(entry.mesh))
      if (!batch) continue
      batch.entries.delete(entry)
      batch.dirty = true
    }
  }

  update() {
    if (![...this.batches.values()].some((batch) => batch.dirty)) return
    for (const [piece, entries] of this.pieces) if (entries) piece.updateMatrixWorld(true)
    for (const [key, batch] of this.batches) {
      if (!batch.dirty) continue
      if (!batch.entries.size) {
        this.release(batch)
        this.batches.delete(key)
        continue
      }
      if (batch.dirty) {
        const source = batch.entries.values().next().value!.mesh
        if (!batch.mesh || batch.mesh.instanceMatrix.count < batch.entries.size) {
          this.release(batch)
          const material = Array.isArray(source.material) ? source.material.map((item) => item.clone()) : source.material.clone()
          batch.mesh = new THREE.InstancedMesh(source.geometry, material, Math.max(4, 2 ** Math.ceil(Math.log2(batch.entries.size))))
          batch.mesh.castShadow = source.castShadow
          batch.mesh.receiveShadow = source.receiveShadow
          batch.mesh.renderOrder = source.renderOrder
          batch.mesh.layers.mask = source.layers.mask
          batch.mesh.frustumCulled = source.frustumCulled
          batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          this.parent.add(batch.mesh)
        }
        batch.dirty = false
      }
      const mesh = batch.mesh!
      let index = 0
      for (const entry of batch.entries) {
        let visible = true
        for (let object: THREE.Object3D | null = entry.mesh; object; object = object.parent) visible &&= object.visible
        if (visible) mesh.setMatrixAt(index++, entry.mesh.matrixWorld)
      }
      mesh.count = index
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }

  dispose() {
    for (const batch of this.batches.values()) this.release(batch)
    for (const [piece, entries] of this.pieces) if (!entries) piece.removeFromParent()
    this.batches.clear()
    this.pieces.clear()
  }

  private key(mesh: THREE.Mesh) {
    return `${mesh.geometry.uuid}/${materialsOf(mesh).map(materialKey).join('/')}/${mesh.castShadow}/${mesh.receiveShadow}/${mesh.renderOrder}/${mesh.layers.mask}/${mesh.frustumCulled}`
  }

  private release(batch: Batch) {
    const mesh = batch.mesh
    if (!mesh) return
    mesh.removeFromParent()
    mesh.dispose()
    for (const material of materialsOf(mesh)) material.dispose()
    batch.mesh = null
  }
}
