import * as THREE from 'three'

export function animatedBounds(root: THREE.Object3D) {
  const point = new THREE.Vector3()
  const margin = new THREE.Vector3()
  const delta = new THREE.Vector3()
  const base = new THREE.Vector3()
  const weights = new THREE.Vector4()
  const indices = new THREE.Vector4()
  const matrix = new THREE.Matrix4()
  const inverse = new THREE.Matrix4()
  const bounds = new THREE.Box3()
  const transformed = new THREE.Box3()
  const meshes: { mesh: THREE.SkinnedMesh; bones: { bone: THREE.Bone; box: THREE.Box3 }[] }[] = []
  root.traverse((object) => {
    if (!(object instanceof THREE.SkinnedMesh)) {
      object.frustumCulled = true
      return
    }
    const mesh = object
    const { position, skinIndex, skinWeight } = mesh.geometry.attributes
    const boxes = new Map<number, THREE.Box3>()
    const morphs = mesh.geometry.morphAttributes.position ?? []
    margin.setScalar(0)
    for (const morph of morphs) {
      delta.setScalar(0)
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(morph, i)
        if (!mesh.geometry.morphTargetsRelative) point.sub(base.fromBufferAttribute(position, i))
        delta.max(point.set(Math.abs(point.x), Math.abs(point.y), Math.abs(point.z)))
      }
      margin.add(delta)
    }
    for (let i = 0; i < position.count; i++) {
      weights.fromBufferAttribute(skinWeight, i)
      indices.fromBufferAttribute(skinIndex, i)
      for (let j = 0; j < 4; j++) {
        if (weights.getComponent(j) <= 0) continue
        const index = indices.getComponent(j)
        let box = boxes.get(index)
        if (!box) boxes.set(index, (box = new THREE.Box3()))
        matrix.multiplyMatrices(mesh.skeleton.boneInverses[index], mesh.bindMatrix)
        box.expandByPoint(point.fromBufferAttribute(position, i).applyMatrix4(matrix))
      }
    }
    const bones = [...boxes].map(([index, box]) => {
      const e = matrix.multiplyMatrices(mesh.skeleton.boneInverses[index], mesh.bindMatrix).elements
      delta.set(
        Math.abs(e[0]) * margin.x + Math.abs(e[4]) * margin.y + Math.abs(e[8]) * margin.z,
        Math.abs(e[1]) * margin.x + Math.abs(e[5]) * margin.y + Math.abs(e[9]) * margin.z,
        Math.abs(e[2]) * margin.x + Math.abs(e[6]) * margin.y + Math.abs(e[10]) * margin.z,
      )
      box.expandByVector(delta)
      return { bone: mesh.skeleton.bones[index], box }
    })
    mesh.boundingSphere = new THREE.Sphere()
    mesh.frustumCulled = true
    meshes.push({ mesh, bones })
  })
  return () => {
    root.updateWorldMatrix(true, true)
    for (const { mesh, bones } of meshes) {
      bounds.makeEmpty()
      inverse.copy(mesh.bindMode === THREE.AttachedBindMode ? mesh.matrixWorld : mesh.bindMatrix).invert()
      for (const { bone, box } of bones) {
        matrix.multiplyMatrices(inverse, bone.matrixWorld)
        bounds.union(transformed.copy(box).applyMatrix4(matrix))
      }
      bounds.expandByScalar(0.01).getBoundingSphere(mesh.boundingSphere!)
    }
  }
}
