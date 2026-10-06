import * as THREE from 'three'
import { createCapture } from './capture'
import { Color, PieceType } from 'tsshogi'
import { getSettings, type PieceAppearance, type BoardStyle, type Settings } from '@/appearance/settings'
import { grainTexture } from '@/rendering/roomFloor'
import { HALF_D, HALF_W, setBoardDims } from './dimensions'
import { preparePieceEnvironment } from './materials'
import { disposePiece, pieceMesh } from './piece'
import { addLights, boardTopMaterial, createRenderer, disposeRenderer } from './scene'
import { boardSurface, boardTexture } from './textures'

import { SPRITE_BOX, spriteKey, type Baked } from '@/rendering/sprites'

let queue: Promise<unknown> = Promise.resolve()

function withBakeRenderer<T>(job: (renderer: THREE.WebGLRenderer, environment: THREE.Texture) => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const renderer = createRenderer(false)
    try {
      return await job(renderer, preparePieceEnvironment(renderer, false))
    } finally {
      disposeRenderer(renderer)
    }
  })
  queue = run.catch(() => undefined)
  return run
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const TYPES = [
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
  PieceType.KING,
  PieceType.PROM_PAWN,
  PieceType.PROM_LANCE,
  PieceType.PROM_KNIGHT,
  PieceType.PROM_SILVER,
  PieceType.HORSE,
  PieceType.DRAGON,
]

export function bakeFlat(px: number, signal: AbortSignal, settings: Settings = getSettings()): Promise<Baked> {
  return withBakeRenderer((renderer, environment) => bakeFlatWith(renderer, environment, px, signal, settings))
}

async function bakeFlatWith(renderer: THREE.WebGLRenderer, environment: THREE.Texture, px: number, signal: AbortSignal, settings: Settings): Promise<Baked> {
  signal.throwIfAborted()
  setBoardDims()
  const columns = 4
  const rows = Math.ceil(TYPES.length / columns)
  const target = createCapture(columns * px, rows * px)
  const scene = new THREE.Scene()
  addLights(scene, 512)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(columns * SPRITE_BOX, rows * SPRITE_BOX), new THREE.ShadowMaterial({ opacity: 0.32 }))
  catcher.rotation.x = -Math.PI / 2
  catcher.receiveShadow = true
  scene.add(catcher)
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
  const crop = document.createElement('canvas')
  crop.width = crop.height = px
  const ctx = crop.getContext('2d')!
  const pieces = new Map<string, string>()
  try {
    for (const color of [Color.BLACK, Color.WHITE]) {
      const meshes: THREE.Object3D[] = []
      for (const [index, type] of TYPES.entries()) {
        await nextFrame()
        signal.throwIfAborted()
        const mesh = pieceMesh(type, color, undefined, 48, settings, environment, true)
        mesh.rotation.y = 0
        mesh.position.x = ((index % columns) - (columns - 1) / 2) * SPRITE_BOX
        mesh.position.z = (Math.floor(index / columns) - (rows - 1) / 2) * SPRITE_BOX
        scene.add(mesh)
        meshes.push(mesh)
      }
      await renderer.compileAsync(scene, camera)
      signal.throwIfAborted()
      const atlas = target.render(renderer, scene, camera)
      for (const [index, type] of TYPES.entries()) {
        for (const up of [true, false]) {
          ctx.clearRect(0, 0, px, px)
          ctx.save()
          if (!up) {
            ctx.translate(px, px)
            ctx.rotate(Math.PI)
          }
          ctx.drawImage(atlas, (index % columns) * px, Math.floor(index / columns) * px, px, px, 0, 0, px, px)
          ctx.restore()
          pieces.set(spriteKey(type, color, up), crop.toDataURL('image/png'))
        }
        await nextFrame()
        signal.throwIfAborted()
      }
      for (const mesh of meshes) {
        scene.remove(mesh)
        disposePiece(mesh)
      }
    }
  } finally {
    target.dispose()
    catcher.geometry.dispose()
    catcher.material.dispose()
    disposeScene(scene)
  }
  const boardMap = boardTexture(settings.boardStyle, 1)
  const board = (boardMap.image as HTMLCanvasElement).toDataURL('image/jpeg', 0.92)
  boardMap.dispose()
  const stand = grainTexture(512, 512, [180, 128, 66], 120, 21).toDataURL('image/jpeg', 0.9)
  return { pieces, board, surface: boardSurface(settings.boardStyle, 1024, 1120).toDataURL(), stand }
}

export function bakePromotionAtlas(settings: PieceAppearance, types: PieceType[], signal: AbortSignal, onProgress: (done: number, total: number) => void) {
  return withBakeRenderer(async (renderer, environment) => {
    const columns = 4
    const rows = Math.ceil(types.length / columns)
    const target = createCapture(columns * 192, rows * 192)
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
    try {
      await nextFrame()
      for (const [index, type] of types.entries()) {
        signal.throwIfAborted()
        const mesh = pieceMesh(type, Color.BLACK, undefined, 24, settings, environment, true)
        mesh.rotation.y = 0
        mesh.position.x = ((index % columns) - (columns - 1) / 2) * SPRITE_BOX
        mesh.position.z = (Math.floor(index / columns) - (rows - 1) / 2) * SPRITE_BOX
        scene.add(mesh)
        onProgress(index + 1, types.length)
      }
      await renderer.compileAsync(scene, camera)
      signal.throwIfAborted()
      return { image: target.render(renderer, scene, camera).toDataURL('image/png'), types, columns, rows }
    } finally {
      target.dispose()
      disposeScene(scene)
    }
  })
}

const previewCache = new Map<string, string>()

export function bakePreviews(
  options: ({ key: string; color?: Color; types?: PieceType[] } & PieceAppearance)[],
  signal: AbortSignal,
  types = [PieceType.KING, PieceType.PAWN, PieceType.PROM_PAWN],
  onPreview?: (key: string, images: string[]) => void,
  onProgress?: (done: number, total: number) => void,
) {
  return withBakeRenderer((renderer, environment) => bakePreviewsWith(renderer, environment, options, signal, types, onPreview, onProgress))
}

async function bakePreviewsWith(
  renderer: THREE.WebGLRenderer,
  environment: THREE.Texture,
  options: ({ key: string; color?: Color; types?: PieceType[] } & PieceAppearance)[],
  signal: AbortSignal,
  types: PieceType[],
  onPreview?: (key: string, images: string[]) => void,
  onProgress?: (done: number, total: number) => void,
) {
  signal.throwIfAborted()
  const previews = new Map<string, string[]>()
  const total = options.reduce((count, option) => count + (option.types ?? types).length, 0)
  let done = 0
  for (const option of options) {
    const selected = option.types ?? types
    const keys = selected.map((type) => JSON.stringify(['glyph-atlas-v19', option, type]))
    const images = keys.map((key) => previewCache.get(key))
    const pending = selected.map((type, index) => ({ type, index })).filter(({ index }) => !images[index])
    if (pending.length) {
      const columns = Math.min(4, pending.length)
      const rows = Math.ceil(pending.length / columns)
      const angled = option.key.startsWith('finish:')
      const px = angled ? 384 : 192
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
      camera.position.set(angled ? 0.8 : 0, angled ? 1.2 : 30, angled ? -1.4 : 0)
      camera.up.set(0, angled ? 1 : 0, angled ? 0 : -1)
      camera.zoom = angled ? 2.8 : 1
      camera.updateProjectionMatrix()
      camera.lookAt(0, angled ? 0.18 : 0, angled ? -0.08 : 0)
      camera.updateMatrixWorld()
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
      try {
        for (const [cell, { type }] of pending.entries()) {
          await nextFrame()
          signal.throwIfAborted()
          const mesh = pieceMesh(type, option.color ?? Color.BLACK, undefined, 24, option, environment, !angled)
          mesh.rotation.y = 0
          mesh.position.addScaledVector(right, (((cell % columns) - (columns - 1) / 2) * SPRITE_BOX) / camera.zoom)
          mesh.position.addScaledVector(up, (((rows - 1) / 2 - Math.floor(cell / columns)) * SPRITE_BOX) / camera.zoom)
          scene.add(mesh)
        }
        await renderer.compileAsync(scene, camera)
        signal.throwIfAborted()
        const atlas = target.render(renderer, scene, camera)
        const crop = document.createElement('canvas')
        crop.width = crop.height = px
        const ctx = crop.getContext('2d')!
        for (const [cell, { index }] of pending.entries()) {
          ctx.clearRect(0, 0, px, px)
          ctx.drawImage(atlas, (cell % columns) * px, Math.floor(cell / columns) * px, px, px, 0, 0, px, px)
          const image = crop.toDataURL('image/png')
          images[index] = image
          previewCache.set(keys[index], image)
          if (previewCache.size > 512) previewCache.delete(previewCache.keys().next().value!)
          await nextFrame()
          signal.throwIfAborted()
        }
      } finally {
        target.dispose()
        disposeScene(scene)
      }
    }
    const completed = images as string[]
    previews.set(option.key, completed)
    onPreview?.(option.key, completed)
    done += completed.length
    onProgress?.(done, total)
  }
  return previews
}

export function bakeBoardPreviews(styles: BoardStyle[], signal: AbortSignal) {
  return withBakeRenderer((renderer, environment) => bakeBoardPreviewsWith(renderer, environment, styles, signal))
}

async function bakeBoardPreviewsWith(renderer: THREE.WebGLRenderer, environment: THREE.Texture, styles: BoardStyle[], signal: AbortSignal) {
  setBoardDims()
  const target = createCapture(320)
  const scene = new THREE.Scene()
  addLights(scene, 512)
  const camera = new THREE.OrthographicCamera(-HALF_W - 0.4, HALF_W + 0.4, HALF_D + 0.4, -HALF_D - 0.4, 0.1, 60)
  camera.position.set(0, 30, 0)
  camera.up.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
  const geometry = new THREE.PlaneGeometry(HALF_W * 2, HALF_D * 2)
  geometry.rotateX(-Math.PI / 2)
  const previews = new Map<string, string[]>()
  try {
    for (const style of styles) {
      await nextFrame()
      signal.throwIfAborted()
      const material = boardTopMaterial(style, environment, 1)
      const board = new THREE.Mesh(geometry, material)
      scene.add(board)
      previews.set(style, [target.render(renderer, scene, camera).toDataURL('image/png')])
      scene.remove(board)
      material.map?.dispose()
      material.dispose()
    }
    return previews
  } finally {
    target.dispose()
    geometry.dispose()
    disposeScene(scene)
  }
}

// Lights own a shadow map render target; free it, since the shared renderer outlives each bake.
function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (object.userData.pieceResources) disposePiece(object)
    if (object instanceof THREE.Light) object.dispose()
  })
}
