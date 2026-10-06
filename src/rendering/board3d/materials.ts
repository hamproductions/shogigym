import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { grainTexture } from '@/rendering/roomFloor'
import { srgbTexture } from './textures'

const envs = new WeakMap<THREE.WebGLRenderer, THREE.WebGLRenderTarget>()
let pieceEnv: THREE.Texture | null = null

export const environmentMap = () => pieceEnv

export function preparePieceEnvironment(renderer: THREE.WebGLRenderer, activate = true) {
  let target = envs.get(renderer)
  if (!target) {
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    target = pmrem.fromScene(room, 0.04)
    room.dispose()
    pmrem.dispose()
    envs.set(renderer, target)
  }
  if (activate) pieceEnv = target.texture
  return target.texture
}

export function releasePieceEnvironment(renderer: THREE.WebGLRenderer) {
  const target = envs.get(renderer)
  if (!target) return
  if (pieceEnv === target.texture) pieceEnv = null
  target.dispose()
  envs.delete(renderer)
}

export function woodMaterial(base: [number, number, number], seed: number, envMap = pieceEnv) {
  return new THREE.MeshPhysicalMaterial({
    map: srgbTexture(grainTexture(512, 512, base, 120, seed)),
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.32,
    envMap,
    envMapIntensity: 0.35,
  })
}

export const standMaterial = (envMap = pieceEnv) => woodMaterial([180, 128, 66], 21, envMap)

export const materialList = (material: THREE.Material | THREE.Material[] | undefined): THREE.Material[] => {
  if (Array.isArray(material)) return material
  return material ? [material] : []
}
