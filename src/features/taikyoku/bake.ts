import * as THREE from 'three'
import { getSettings, type Settings } from '@/appearance/settings'
import { withBakeRenderer } from '@/rendering/board3d/bake'
import { createCapture } from '@/rendering/board3d/capture'
import { disposePiece, pieceMesh } from '@/rendering/board3d/piece'
import { addLights } from '@/rendering/board3d/scene'
import { SPRITE_BOX } from '@/rendering/sprites'
import { taikyokuPiece } from './pieces'
import type { Cell } from './notation'

let cacheSettings = ''
let sprites = new Map<string, HTMLCanvasElement>()

export function taikyokuSprites(settings: Settings) {
  const key = JSON.stringify([
    settings.pieceFont,
    settings.pieceStyle,
    settings.pieceSet,
    settings.pieceMaterial,
    settings.pieceFinish,
    settings.pieceColor,
    settings.pieceGrain,
  ])
  if (cacheSettings !== key) {
    cacheSettings = key
    sprites = new Map()
  }
  return sprites
}

export const bakedKey = ({ key, side }: Cell) => `${key}/${side}`

export function bakeTaikyoku(cells: Cell[], signal: AbortSignal, onPiece: (key: string, image: HTMLCanvasElement) => void, settings: Settings = getSettings()) {
  return withBakeRenderer(async (renderer, environment) => {
    for (let start = 0; start < cells.length; start += 16) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      signal.throwIfAborted()
      const batch = cells.slice(start, start + 16)
      const columns = Math.min(4, batch.length)
      const rows = Math.ceil(batch.length / columns)
      const px = 128
      const target = createCapture(columns * px, rows * px)
      const scene = new THREE.Scene()
      addLights(scene, 512)
      const camera = new THREE.OrthographicCamera(
        (-columns * SPRITE_BOX) / 2,
        (columns * SPRITE_BOX) / 2,
        (rows * SPRITE_BOX) / 2,
        (-rows * SPRITE_BOX) / 2,
        0.1,
        60,
      )
      camera.position.set(0, 30, 0)
      camera.up.set(0, 0, -1)
      camera.lookAt(0, 0, 0)
      const catcher = new THREE.Mesh(new THREE.PlaneGeometry(columns * SPRITE_BOX, rows * SPRITE_BOX), new THREE.ShadowMaterial({ opacity: 0.32 }))
      catcher.rotation.x = -Math.PI / 2
      catcher.receiveShadow = true
      scene.add(catcher)
      try {
        for (const [index, cell] of batch.entries()) {
          const { type, color, face } = taikyokuPiece(cell.key, cell.side)
          const mesh = pieceMesh(type, color, undefined, 48, { ...settings, pieceGuide: 'none' }, environment, true, face)
          mesh.rotation.y = 0
          mesh.position.set(((index % columns) - (columns - 1) / 2) * SPRITE_BOX, 0, (Math.floor(index / columns) - (rows - 1) / 2) * SPRITE_BOX)
          scene.add(mesh)
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          signal.throwIfAborted()
        }
        await renderer.compileAsync(scene, camera)
        signal.throwIfAborted()
        const atlas = target.render(renderer, scene, camera)
        for (const [index, cell] of batch.entries()) {
          const image = document.createElement('canvas')
          image.width = image.height = px
          image.getContext('2d')!.drawImage(atlas, (index % columns) * px, Math.floor(index / columns) * px, px, px, 0, 0, px, px)
          onPiece(bakedKey(cell), image)
        }
      } finally {
        target.dispose()
        catcher.geometry.dispose()
        catcher.material.dispose()
        scene.traverse((object) => {
          if (object.userData.pieceResources) disposePiece(object)
          if (object instanceof THREE.Light) object.dispose()
        })
      }
    }
  })
}
