import * as THREE from 'three'
import { instanceTextureKey, instanceTextures, textureProperties } from './instanceTextures'

type Entry = { piece: THREE.Object3D; mesh: THREE.Mesh; key: string }
type Batch = {
  entries: Set<Entry>
  mesh: THREE.InstancedMesh | null
  dirty: boolean
  structural: boolean
  textureRefs: unknown[]
  signature?: string
  textures?: ReturnType<typeof instanceTextures>
}

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

function materialKey(material: THREE.Material, variants = false) {
  const cached = materialKeys.get(material)
  if (!variants && cached?.version === material.version) return cached.key
  const key = JSON.stringify(
    Object.fromEntries(
      Object.keys(material)
        .sort()
        .filter((key) => !['id', 'uuid', 'version', '_listeners'].includes(key))
        .map((key) => {
          const value = (material as unknown as Record<string, unknown>)[key]
          return [
            key,
            variants && (textureProperties as readonly string[]).includes(key) && value instanceof THREE.Texture ? instanceTextureKey(value) : valueKey(value),
          ]
        }),
    ),
  )
  if (!variants) materialKeys.set(material, { version: material.version, key })
  return key
}

const materialsOf = (mesh: THREE.Mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material])

export class PieceInstances {
  private pieces = new Map<THREE.Object3D, Entry[] | null>()
  private batches = new Map<string, Batch>()
  private parent: THREE.Group
  private retained: boolean
  private textureVariants: boolean
  private current = new Set<THREE.Object3D>()
  private visibility = new Map<THREE.Mesh, boolean>()
  private inverse = new THREE.Matrix4()
  private matrix = new THREE.Matrix4()

  constructor(parent: THREE.Group, retained = false, textureVariants = retained) {
    this.parent = parent
    this.retained = retained
    this.textureVariants = textureVariants
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
    if (!this.retained) piece.removeFromParent()
    if (ordinary) {
      this.pieces.set(piece, null)
      if (!this.retained) this.parent.add(piece)
      return
    }
    const entries = meshes.map((mesh) => ({ piece, mesh, key: '' }))
    this.pieces.set(piece, entries)
    for (const entry of entries) {
      const base = this.key(entry.mesh)
      let key = base
      let partition = 0
      while (this.textureVariants && this.batches.has(key) && !this.fits(this.batches.get(key)!, entry.mesh)) key = `${base}/${++partition}`
      entry.key = key
      let batch = this.batches.get(key)
      if (!batch) this.batches.set(key, (batch = { entries: new Set(), mesh: null, dirty: true, structural: true, textureRefs: [] }))
      batch.entries.add(entry)
      batch.dirty = batch.structural = true
    }
  }

  remove(piece: THREE.Object3D) {
    if (!this.pieces.has(piece)) return
    const entries = this.pieces.get(piece)
    this.pieces.delete(piece)
    if (!entries) {
      if (!this.retained) piece.removeFromParent()
      return
    }
    for (const entry of entries) {
      const batch = this.batches.get(entry.key)
      if (!batch) continue
      batch.entries.delete(entry)
      batch.dirty = batch.structural = true
    }
  }

  update(moving = false) {
    let any = false
    for (const batch of this.batches.values()) any = (batch.dirty ||= moving) || any
    if (!any) return
    for (const [piece, entries] of this.pieces) if (entries) piece.updateWorldMatrix(true, true)
    this.parent.updateWorldMatrix(true, false)
    const inverse = this.retained ? this.inverse.copy(this.parent.matrixWorld).invert() : null
    const matrix = this.matrix
    for (const [key, batch] of this.batches) {
      if (!batch.dirty) continue
      let fresh = false
      if (!batch.entries.size) {
        this.release(batch)
        this.batches.delete(key)
        continue
      }
      if (this.texturesMoved(batch) || batch.structural || !batch.mesh) {
        batch.structural = false
        const source = batch.entries.values().next().value!.mesh
        const meshes = [...batch.entries].map((entry) => entry.mesh)
        const signature = [
          ...new Set(
            meshes.map((mesh) =>
              materialsOf(mesh)
                .map((material) => textureProperties.map((key) => (material as unknown as Record<string, THREE.Texture>)[key]?.uuid ?? '').join('/'))
                .join('/'),
            ),
          ),
        ]
          .sort()
          .join('|')
        if (!batch.mesh || batch.mesh.instanceMatrix.count < batch.entries.size || (this.textureVariants && batch.signature !== signature)) {
          this.release(batch)
          const capacity = Math.max(4, 2 ** Math.ceil(Math.log2(batch.entries.size)))
          if (this.textureVariants) batch.textures = instanceTextures(meshes, capacity)
          const material = batch.textures?.material ?? (Array.isArray(source.material) ? source.material.map((item) => item.clone()) : source.material.clone())
          batch.signature = signature
          batch.mesh = new THREE.InstancedMesh(batch.textures?.geometry ?? source.geometry, batch.textures?.material ?? material, capacity)
          batch.mesh.castShadow = source.castShadow
          batch.mesh.receiveShadow = source.receiveShadow
          batch.mesh.renderOrder = source.renderOrder
          batch.mesh.layers.mask = source.layers.mask
          batch.mesh.frustumCulled = source.frustumCulled
          batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          this.parent.add(batch.mesh)
          fresh = true
        }
      }
      batch.dirty = false
      const mesh = batch.mesh!
      const array = mesh.instanceMatrix.array
      let index = 0
      let moved = fresh
      let retextured = fresh
      for (const entry of batch.entries) {
        let visible = true
        for (let object: THREE.Object3D | null = entry.mesh; object; object = object.parent) visible &&= object.visible
        if (visible) {
          const world = inverse ? matrix.multiplyMatrices(inverse, entry.mesh.matrixWorld) : entry.mesh.matrixWorld
          for (let i = 0, offset = index * 16; i < 16; i++)
            if (array[offset + i] !== Math.fround(world.elements[i])) {
              mesh.setMatrixAt(index, world)
              moved = true
              break
            }
          if (batch.textures?.update(entry.mesh, index)) retextured = true
          index++
        }
      }
      if (mesh.count !== index) moved = retextured = true
      mesh.count = index
      if (moved) {
        mesh.instanceMatrix.needsUpdate = true
        mesh.computeBoundingSphere()
      }
      if (retextured) batch.textures?.upload()
    }
  }

  render(source: THREE.Group, draw: () => void) {
    this.parent.visible = source.visible
    const current = this.current
    current.clear()
    for (const piece of source.children) current.add(piece)
    for (const piece of this.pieces.keys()) if (!current.has(piece)) this.remove(piece)
    for (const piece of current) this.add(piece)
    this.update(true)
    const visibility = this.visibility
    visibility.clear()
    for (const entries of this.pieces.values())
      for (const entry of entries ?? []) {
        visibility.set(entry.mesh, entry.mesh.visible)
        entry.mesh.visible = false
      }
    try {
      draw()
    } finally {
      for (const [mesh, visible] of visibility) mesh.visible = visible
    }
  }

  dispose() {
    for (const batch of this.batches.values()) this.release(batch)
    for (const [piece, entries] of this.pieces) if (!entries && !this.retained) piece.removeFromParent()
    this.batches.clear()
    this.pieces.clear()
  }

  private key(mesh: THREE.Mesh) {
    return `${mesh.geometry.uuid}/${materialsOf(mesh)
      .map((material) => materialKey(material, this.textureVariants))
      .join('/')}/${mesh.castShadow}/${mesh.receiveShadow}/${mesh.renderOrder}/${mesh.layers.mask}/${mesh.frustumCulled}`
  }

  private texturesMoved(batch: Batch) {
    if (!this.textureVariants) return false
    const refs = batch.textureRefs
    let at = 0
    let moved = false
    for (const entry of batch.entries)
      for (const material of materialsOf(entry.mesh))
        for (const property of textureProperties) {
          const texture = (material as unknown as Record<string, unknown>)[property]
          if (refs[at] !== texture) {
            refs[at] = texture
            moved = true
          }
          at++
        }
    if (refs.length !== at) {
      refs.length = at
      moved = true
    }
    return moved
  }

  private fits(batch: Batch, mesh: THREE.Mesh) {
    return materialsOf(mesh).every((material, index) =>
      textureProperties.every((property) => {
        const texture = (material as unknown as Record<string, THREE.Texture>)[property]
        if (!texture || instanceTextureKey(texture) === texture.uuid) return true
        const textures = new Set([...batch.entries].map((entry) => (materialsOf(entry.mesh)[index] as unknown as Record<string, THREE.Texture>)[property]))
        textures.add(texture)
        return textures.size <= 128
      }),
    )
  }

  private release(batch: Batch) {
    const mesh = batch.mesh
    if (!mesh) return
    mesh.removeFromParent()
    mesh.dispose()
    for (const material of materialsOf(mesh)) material.dispose()
    batch.textures?.dispose()
    batch.textures = undefined
    batch.mesh = null
  }
}
