import * as THREE from 'three'

export const textureProperties = ['map', 'emissiveMap', 'roughnessMap', 'clearcoatMap'] as const

const slots = [
  { property: 'map', chunk: 'map_fragment', uv: 'vMapUv' },
  { property: 'emissiveMap', chunk: 'emissivemap_fragment', uv: 'vEmissiveMapUv' },
  { property: 'roughnessMap', chunk: 'roughnessmap_fragment', uv: 'vRoughnessMapUv' },
  { property: 'clearcoatMap', chunk: 'lights_physical_fragment', uv: 'vClearcoatMapUv' },
] as const

type TexturedMaterial = THREE.Material & Partial<Record<(typeof textureProperties)[number], THREE.Texture | null>>
type Layer = { attribute: THREE.InstancedBufferAttribute; indices: Map<THREE.Texture, number>; material: number; property: (typeof textureProperties)[number] }

export function instanceTextureKey(texture: THREE.Texture) {
  if (
    !(texture instanceof THREE.CanvasTexture || (texture instanceof THREE.DataTexture && texture.image.data instanceof Uint8Array)) ||
    texture.type !== THREE.UnsignedByteType ||
    texture.format !== THREE.RGBAFormat ||
    texture.premultiplyAlpha
  )
    return texture.uuid
  return JSON.stringify([
    texture.image.width,
    texture.image.height,
    texture.colorSpace,
    texture.channel,
    texture.wrapS,
    texture.wrapT,
    texture.magFilter,
    texture.minFilter,
    texture.anisotropy,
    texture.generateMipmaps,
    texture.flipY,
    texture.offset.toArray(),
    texture.repeat.toArray(),
    texture.center.toArray(),
    texture.rotation,
    texture.matrixAutoUpdate,
    texture.matrix.toArray(),
  ])
}

function textureArray(textures: THREE.Texture[]) {
  const source = textures[0]
  const { width, height } = source.image as HTMLCanvasElement
  const stride = width * 4
  const data = new Uint8Array(stride * height * textures.length)
  textures.forEach((texture, layer) => {
    const pixels =
      texture instanceof THREE.DataTexture
        ? (texture.image.data as Uint8Array)
        : (texture.image as HTMLCanvasElement).getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, width, height).data
    for (let y = 0; y < height; y++) {
      const row = source.flipY ? height - y - 1 : y
      data.set(pixels.subarray(row * stride, (row + 1) * stride), (layer * height + y) * stride)
    }
  })
  const array = new THREE.DataArrayTexture(data, width, height, textures.length)
  array.colorSpace = source.colorSpace
  array.wrapS = source.wrapS
  array.wrapT = source.wrapT
  array.magFilter = source.magFilter
  array.minFilter = source.minFilter
  array.anisotropy = source.anisotropy
  array.generateMipmaps = source.generateMipmaps
  array.needsUpdate = true
  return array
}

export function instanceTextures(meshes: THREE.Mesh[], capacity: number) {
  const source = meshes[0]
  const originals = Array.isArray(source.material) ? source.material : [source.material]
  const materials = originals.map((material) => material.clone())
  const geometry = source.geometry.clone()
  const textures: THREE.DataArrayTexture[] = []
  const arrays = new Map<string, THREE.DataArrayTexture>()
  const layers: Layer[] = []
  materials.forEach((material, materialIndex) => {
    const patches: { name: string; chunk: string; property: string; uv: string; texture: THREE.DataArrayTexture }[] = []
    for (const slot of slots) {
      const sources = meshes.map((mesh) => {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        return (materials[materialIndex] as TexturedMaterial)[slot.property]
      })
      const unique = [...new Set(sources)].filter((texture): texture is THREE.Texture => !!texture)
      if (unique.length < 2 || unique.some((texture) => instanceTextureKey(texture) === texture.uuid)) continue
      const key = unique.map((texture) => texture.uuid).join('/')
      let texture = arrays.get(key)
      if (!texture) {
        texture = textureArray(unique)
        arrays.set(key, texture)
        textures.push(texture)
      }
      const name = `piece${slot.property}Layer${materialIndex}`
      const attribute = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1).setUsage(THREE.DynamicDrawUsage)
      geometry.setAttribute(name, attribute)
      layers.push({ attribute, indices: new Map(unique.map((texture, index) => [texture, index])), material: materialIndex, property: slot.property })
      patches.push({ name, ...slot, texture })
    }
    if (!patches.length) return
    material.customProgramCacheKey = () => `piece-texture-arrays:${patches.map((patch) => patch.name).join(',')}`
    material.onBeforeCompile = (shader) => {
      for (const patch of patches) {
        shader.uniforms[`${patch.name}Array`] = { value: patch.texture }
        shader.vertexShader = `attribute float ${patch.name};\nflat varying float v${patch.name};\n${shader.vertexShader}`.replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>\nv${patch.name} = ${patch.name};`,
        )
        shader.fragmentShader = `uniform highp sampler2DArray ${patch.name}Array;\nflat varying float v${patch.name};\n${shader.fragmentShader}`.replace(
          `#include <${patch.chunk}>`,
          THREE.ShaderChunk[patch.chunk as keyof typeof THREE.ShaderChunk].replace(
            `texture2D( ${patch.property}, ${patch.uv} )`,
            `texture( ${patch.name}Array, vec3( ${patch.uv}, v${patch.name} ) )`,
          ),
        )
      }
    }
  })
  return {
    geometry,
    material: Array.isArray(source.material) ? materials : materials[0],
    textures,
    update: (mesh: THREE.Mesh, index: number) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const layer of layers) {
        const texture = (materials[layer.material] as TexturedMaterial)[layer.property]!
        layer.attribute.setX(index, layer.indices.get(texture)!)
      }
    },
    upload: () => layers.forEach((layer) => (layer.attribute.needsUpdate = true)),
    dispose: () => {
      geometry.dispose()
      textures.forEach((texture) => texture.dispose())
    },
  }
}
