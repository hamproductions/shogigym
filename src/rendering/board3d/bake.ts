import * as THREE from 'three'
import { Color, PieceType } from 'tsshogi'
import { getSettings, type PieceAppearance, type BoardStyle, type Settings } from '../../appearance/settings'
import { grainTexture } from '../roomFloor'
import { HALF_D, HALF_W, setBoardDims } from './dimensions'
import { preparePieceEnvironment } from './materials'
import { pieceMesh } from './piece'
import { addLights, boardTopMaterial, createRenderer } from './scene'
import { boardSurface, boardTexture, clearFaceTextures } from './textures'

import { SPRITE_BOX, spriteKey, type Baked } from '../sprites'

const TYPES = [PieceType.PAWN, PieceType.LANCE, PieceType.KNIGHT, PieceType.SILVER, PieceType.GOLD, PieceType.BISHOP, PieceType.ROOK, PieceType.KING, PieceType.PROM_PAWN, PieceType.PROM_LANCE, PieceType.PROM_KNIGHT, PieceType.PROM_SILVER, PieceType.HORSE, PieceType.DRAGON]

export async function bakeFlat(px: number, signal: AbortSignal, settings: Settings = getSettings()): Promise<Baked> {
  setBoardDims()
  clearFaceTextures()
  const renderer = createRenderer(false)
  const environment = preparePieceEnvironment(renderer, false)
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
  try {
    for (const color of [Color.BLACK, Color.WHITE])
      for (const type of TYPES) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        signal.throwIfAborted()
        const mesh = pieceMesh(type, color, undefined, 48, settings, environment, true)
        scene.add(mesh)
        for (const up of [true, false]) {
          mesh.rotation.y = up ? 0 : Math.PI
          renderer.render(scene, camera)
          pieces.set(spriteKey(type, color, up), renderer.domElement.toDataURL('image/png'))
        }
        scene.remove(mesh)
      }
  } finally {
    renderer.dispose()
    renderer.forceContextLoss()
  }
  const board = (boardTexture(settings.boardStyle).image as HTMLCanvasElement).toDataURL('image/jpeg', 0.92)
  const stand = grainTexture(512, 512, [180, 128, 66], 120, 21).toDataURL('image/jpeg', 0.9)
  return { pieces, board, surface: boardSurface(settings.boardStyle, 1024, 1120).toDataURL(), stand }
}

const previewCache = new Map<string, string>()

export async function bakePreviews(options: ({ key: string; color?: Color; types?: PieceType[] } & PieceAppearance)[], signal: AbortSignal, types = [PieceType.KING, PieceType.PAWN, PieceType.PROM_PAWN], onPreview?: (key: string, images: string[]) => void) {
  signal.throwIfAborted()
  clearFaceTextures()
  const renderer = createRenderer(false)
  const environment = preparePieceEnvironment(renderer, false)
  renderer.setPixelRatio(1)
  renderer.setSize(options.some((option) => option.key.startsWith('finish:')) ? 384 : 192, options.some((option) => option.key.startsWith('finish:')) ? 384 : 192, false)
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  addLights(scene)
  const camera = new THREE.OrthographicCamera(-SPRITE_BOX / 2, SPRITE_BOX / 2, SPRITE_BOX / 2, -SPRITE_BOX / 2, 0.1, 60)
  camera.position.set(0, 30, 0)
  camera.up.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
  const previews = new Map<string, string[]>()
  let rendered = 0
  try {
    for (const option of options) {
      const images: string[] = []
      for (const type of option.types ?? types) {
        const cacheKey = JSON.stringify(['glyph-box-v18', option, type])
        const cached = previewCache.get(cacheKey)
        if (cached) {
          images.push(cached)
          continue
        }
        if (rendered++ % 4 === 0) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        signal.throwIfAborted()
        const angled = option.key.startsWith('finish:')
        camera.position.set(angled ? 0.8 : 0, angled ? 1.2 : 30, angled ? -1.4 : 0)
        camera.up.set(0, angled ? 1 : 0, angled ? 0 : -1)
        camera.zoom = angled ? 2.8 : 1
        camera.updateProjectionMatrix()
        camera.lookAt(0, angled ? 0.18 : 0, angled ? -0.08 : 0)
        const mesh = pieceMesh(type, option.color ?? Color.BLACK, undefined, angled ? 200 : 48, option, environment, !angled)
        mesh.rotation.y = 0
        scene.add(mesh)
        renderer.render(scene, camera)
        const image = renderer.domElement.toDataURL('image/png')
        images.push(image)
        previewCache.set(cacheKey, image)
        if (previewCache.size > 512) previewCache.delete(previewCache.keys().next().value!)
        scene.remove(mesh)
        for (const child of mesh.children) ((child as THREE.Mesh).material as THREE.Material).dispose()
        const side = (mesh.material as THREE.Material[])[1]
        side.dispose()
      }
      previews.set(option.key, images)
      onPreview?.(option.key, images)
    }
    return previews
  } finally {
    renderer.dispose()
    renderer.forceContextLoss()
  }
}

export async function bakeBoardPreviews(styles: BoardStyle[], signal: AbortSignal) {
  setBoardDims()
  const renderer = createRenderer(false)
  const environment = preparePieceEnvironment(renderer, false)
  renderer.setPixelRatio(1)
  renderer.setSize(320, 320, false)
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  addLights(scene)
  const camera = new THREE.OrthographicCamera(-HALF_W - 0.4, HALF_W + 0.4, HALF_D + 0.4, -HALF_D - 0.4, 0.1, 60)
  camera.position.set(0, 30, 0)
  camera.up.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
  const geometry = new THREE.PlaneGeometry(HALF_W * 2, HALF_D * 2)
  geometry.rotateX(-Math.PI / 2)
  const previews = new Map<string, string[]>()
  try {
    for (const style of styles) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      signal.throwIfAborted()
      const material = boardTopMaterial(style, environment)
      const board = new THREE.Mesh(geometry, material)
      scene.add(board)
      renderer.render(scene, camera)
      previews.set(style, [renderer.domElement.toDataURL('image/png')])
      scene.remove(board)
      material.map?.dispose()
      material.dispose()
    }
    return previews
  } finally {
    geometry.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
}
