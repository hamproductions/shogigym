import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { grainTexture } from '../roomFloor'
import { srgbTexture } from './textures'

let pieceEnv: THREE.Texture | null = null

export const environmentMap = () => pieceEnv

export function preparePieceEnvironment(renderer: THREE.WebGLRenderer) {
  if (pieceEnv) return
  const pmrem = new THREE.PMREMGenerator(renderer)
  pieceEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
}

export function woodMaterial(base: [number, number, number], seed: number) {
  return new THREE.MeshPhysicalMaterial({ map: srgbTexture(grainTexture(512, 512, base, 120, seed)), roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.32, envMap: pieceEnv, envMapIntensity: 0.35 })
}

export const standMaterial = () => woodMaterial([180, 128, 66], 21)
