import * as THREE from 'three'
import { Color, PieceType } from 'tsshogi'
import { getSettings } from '../settings'
import { grainTexture } from '../roomFloor'
import { setBoardDims } from './dimensions'
import { pieceMesh } from './piece'
import { addLights, createRenderer } from './scene'
import { boardTexture, clearFaceTextures } from './textures'

export const SPRITE_BOX = 1.3

const TYPES = [PieceType.PAWN, PieceType.LANCE, PieceType.KNIGHT, PieceType.SILVER, PieceType.GOLD, PieceType.BISHOP, PieceType.ROOK, PieceType.KING, PieceType.PROM_PAWN, PieceType.PROM_LANCE, PieceType.PROM_KNIGHT, PieceType.PROM_SILVER, PieceType.HORSE, PieceType.DRAGON]

export type Baked = { pieces: Map<string, string>; board: string; stand: string }

export const spriteKey = (type: PieceType, color: Color, up: boolean) => `${type}${color}${up ? 'u' : 'd'}`

export function bakeFlat(px: number): Baked {
  setBoardDims()
  clearFaceTextures()
  const renderer = createRenderer()
  renderer.setPixelRatio(1)
  renderer.setSize(px, px, false)
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  addLights(scene)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.32 }))
  catcher.rotation.x = -Math.PI / 2
  catcher.receiveShadow = true
  scene.add(catcher)
  const camera = new THREE.OrthographicCamera(-SPRITE_BOX / 2, SPRITE_BOX / 2, SPRITE_BOX / 2, -SPRITE_BOX / 2, 0.1, 60)
  camera.position.set(0, 30, 0)
  camera.up.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
  const pieces = new Map<string, string>()
  for (const color of [Color.BLACK, Color.WHITE])
    for (const type of TYPES) {
      const mesh = pieceMesh(type, color)
      scene.add(mesh)
      for (const up of [true, false]) {
        mesh.rotation.y = up ? 0 : Math.PI
        renderer.render(scene, camera)
        pieces.set(spriteKey(type, color, up), renderer.domElement.toDataURL('image/png'))
      }
      scene.remove(mesh)
    }
  renderer.dispose()
  renderer.forceContextLoss()
  const board = (boardTexture(getSettings().boardStyle).image as HTMLCanvasElement).toDataURL('image/jpeg', 0.92)
  const stand = grainTexture(512, 512, [180, 128, 66], 120, 21).toDataURL('image/jpeg', 0.9)
  return { pieces, board, stand }
}
