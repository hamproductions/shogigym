import * as THREE from 'three'
import { createCampFence, CAMP_GROUND } from '@/rendering/historical/camp'
import { createBattlefield, battlefieldSurface } from '@/rendering/historical/battlefield'
import { addBattlefieldLighting, disposeBattlefieldLighting } from '@/rendering/historical/lighting'
import { createBattlefieldEffects } from '@/rendering/historical/effects'
import { Color } from 'tsshogi'
import { getSettings, type BoardStyle } from '@/appearance/settings'
import { furnishFloor, type RoomDims } from '@/rendering/roomFloor'
import { CASUAL, HALF_D, HALF_W, LEG, STAND, STAND_SLAB, STAND_TOP, STRIP_W, THICK, compactRendering, standWidth, stripDepth } from './dimensions'
import { layout, standCenter } from './layout'
import { surroundings } from './surroundings'
import { environmentMap, preparePieceEnvironment, releasePieceEnvironment, standMaterial, woodMaterial } from './materials'
import { boardTexture, clearFaceTextures } from './textures'
import { BOARD_TONE } from '@/rendering/koma'
import type { SceneState, Stand } from './types'
import { disposePiece } from './piece'
import { PieceInstances } from './instances'

let sharedRenderer: THREE.WebGLRenderer | null = null
let rendererUsers = 0
let releaseTimer = 0

export function createRenderer(activateEnvironment = true) {
  window.clearTimeout(releaseTimer)
  // A lock screen or memory pressure can leave the shared context dead; reusing it would draw nothing forever.
  if (sharedRenderer?.getContext().isContextLost()) {
    destroyRenderer(sharedRenderer)
    clearFaceTextures()
    sharedRenderer = null
    rendererUsers = 0
  }
  if (sharedRenderer) {
    if (getSettings().environment !== 'battlefield') sharedRenderer.shadowMap.type = THREE.PCFShadowMap
    preparePieceEnvironment(sharedRenderer, activateEnvironment)
    rendererUsers++
    return sharedRenderer
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, getSettings().environment === 'battlefield' ? 1.25 : Infinity))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.82
  preparePieceEnvironment(renderer, activateEnvironment)
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    releasePieceEnvironment(renderer)
    preparePieceEnvironment(renderer)
  })
  sharedRenderer = renderer
  rendererUsers++
  return renderer
}

export function disposeRenderer(renderer: THREE.WebGLRenderer) {
  if (renderer === sharedRenderer) {
    if (--rendererUsers > 0) return
    releaseTimer = window.setTimeout(() => {
      if (rendererUsers || sharedRenderer !== renderer) return
      sharedRenderer = null
      destroyRenderer(renderer)
    }, 4000)
    return
  }
  destroyRenderer(renderer)
}

function destroyRenderer(renderer: THREE.WebGLRenderer) {
  releasePieceEnvironment(renderer)
  renderer.dispose()
  renderer.forceContextLoss()
}

export function disposeScene(scene: THREE.Scene) {
  disposeBattlefieldLighting(scene)
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const pieces = new Set<THREE.Object3D>()
  scene.traverse((object) => {
    if (!object.userData.pieceResources) return
    object.traverse((child) => pieces.add(child))
    disposePiece(object)
  })
  scene.traverse((object) => {
    if (pieces.has(object)) return
    if (object instanceof THREE.Light || object instanceof THREE.InstancedMesh) object.dispose()
    const mesh = object as THREE.Mesh
    if (mesh.geometry) geometries.add(mesh.geometry)
    for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
      materials.add(material)
      for (const [key, value] of Object.entries(material)) if (key !== 'envMap' && value instanceof THREE.Texture) textures.add(value)
    }
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
  scene.clear()
}

export function addLights(scene: THREE.Scene, shadowSize = compactRendering() ? 512 : 1024) {
  scene.add(new THREE.HemisphereLight(0xe8e0d0, 0x3a2a18, 0.9))
  const lamp = new THREE.SpotLight(0xffe8c4, 70, 80, Math.PI / 3, 1, 1.2)
  lamp.position.set(-1.5, 18, 2.5)
  lamp.castShadow = true
  lamp.shadow.mapSize.set(shadowSize, shadowSize)
  lamp.shadow.bias = -0.0004
  scene.add(lamp, lamp.target)
  const fill = new THREE.DirectionalLight(0x8fa6d8, 0.35)
  fill.position.set(8, 6, -6)
  scene.add(fill)
}

function addFloor(root: THREE.Group): RoomDims {
  const floor = new THREE.Mesh()
  floor.receiveShadow = true
  const dims = { thick: THICK, leg: LEG, halfW: HALF_W, halfD: HALF_D, floor }
  if (getSettings().environment === 'battlefield') root.add(createBattlefield(HALF_W, HALF_D))
  else furnishFloor(root, dims, CASUAL)
  return dims
}

export function boardTopMaterial(style: BoardStyle, envMap = environmentMap(), scale?: number) {
  return new THREE.MeshPhysicalMaterial({
    map: boardTexture(style, scale),
    roughness: 0.55,
    clearcoat: 0.15,
    clearcoatRoughness: 0.45,
    envMap,
    envMapIntensity: 0.25,
  })
}

function addBoard(root: THREE.Group) {
  if (getSettings().environment === 'battlefield') {
    const board = new THREE.Mesh(new THREE.BoxGeometry(2 * HALF_W, 0.22, 2 * HALF_D), battlefieldSurface(HALF_W, HALF_D))
    board.position.y = -0.11
    board.receiveShadow = true
    root.add(board)
    return board
  }
  const style = getSettings().boardStyle
  const tone = BOARD_TONE[style]
  const top = boardTopMaterial(style)
  const board = new THREE.Mesh(new THREE.BoxGeometry(2 * HALF_W, THICK, 2 * HALF_D), [
    woodMaterial(tone.edge, 3),
    woodMaterial(tone.edge, 5),
    top,
    woodMaterial([150, 104, 50], 9),
    woodMaterial(tone.edge, 11),
    woodMaterial(tone.edge, 13),
  ])
  board.position.y = -THICK / 2
  board.castShadow = true
  board.receiveShadow = true
  board.userData.armCollider = true
  root.add(board)
  return board
}

function addLegs(root: THREE.Group) {
  const material = woodMaterial([120, 78, 36], 17)
  return [
    [-3.4, -3.8],
    [3.4, -3.8],
    [-3.4, 3.8],
    [3.4, 3.8],
  ].map(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.55, LEG, 24), material)
    leg.position.set(x, -THICK - LEG / 2, z)
    leg.castShadow = true
    leg.visible = !CASUAL && getSettings().environment !== 'battlefield'
    root.add(leg)
    return leg
  })
}

function addStands(root: THREE.Group) {
  const battlefield = getSettings().environment === 'battlefield'
  const material = battlefield ? new THREE.MeshStandardMaterial({ color: 0x9b9275, roughness: 1 }) : standMaterial()
  const camps = new Map<THREE.Mesh, ReturnType<typeof createCampFence>>()
  const stands: Stand[] = [1, -1].map((side) => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(STAND, STAND_SLAB, STAND), material)
    stand.castShadow = true
    stand.receiveShadow = true
    stand.userData.armCollider = true
    root.add(stand)
    if (battlefield) {
      const camp = createCampFence(side === 1 ? '先手' : '後手')
      camps.set(stand, camp)
      root.add(camp.root)
    }
    const legs = [new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1, 24), material), new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 1.9), material)]
    for (const m of legs) {
      m.castShadow = true
      root.add(m)
    }
    return { stand, side, legs }
  })
  const placeStands = () =>
    stands.forEach(({ stand, side, legs }) => {
      const c = standCenter(side === 1 ? Color.BLACK : Color.WHITE)
      stand.scale.set(
        layout.portrait ? (layout.vertical ? stripDepth() : STRIP_W) / STAND : standWidth() / STAND,
        1,
        layout.portrait ? (layout.vertical ? STRIP_W : stripDepth()) / STAND : standWidth() / STAND,
      )
      const block = CASUAL && !layout.portrait ? (THICK + STAND_TOP) / STAND_SLAB : 1
      stand.scale.y = block
      stand.position.set(c.x, STAND_TOP - (STAND_SLAB * block) / 2, c.z)
      if (battlefield) {
        stand.scale.y = 0.06 / STAND_SLAB
        stand.position.y = CAMP_GROUND - 0.03
        camps.get(stand)!.place(c.x, c.z, stand.scale.x * STAND, stand.scale.z * STAND)
      }
      const legH = THICK + LEG + STAND_TOP - STAND_SLAB
      const [post, foot] = legs
      post.visible = foot.visible = !layout.portrait && !CASUAL && getSettings().environment !== 'battlefield'
      post.scale.y = legH
      post.position.set(c.x, STAND_TOP - STAND_SLAB - legH / 2, c.z)
      foot.position.set(c.x, -THICK - LEG + 0.11, c.z)
    })
  placeStands()
  return { stands, placeStands }
}

export function buildScene(renderer: THREE.WebGLRenderer): SceneState {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
  if (getSettings().environment === 'battlefield') {
    addBattlefieldLighting(scene, renderer, compactRendering())
  } else {
    addLights(scene)
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMappingExposure = 0.82
  }
  const root = new THREE.Group()
  scene.add(root)
  const battlefieldFx = getSettings().environment === 'battlefield' ? createBattlefieldEffects() : undefined
  if (battlefieldFx) root.add(battlefieldFx.mesh)
  const dims = addFloor(root)
  const board = addBoard(root)
  const legs = addLegs(root)
  const { stands, placeStands } = addStands(root)
  const pieces = new THREE.Group()
  const marks = new THREE.Group()
  const batches = new THREE.Group()
  root.add(pieces, marks)
  root.add(batches)
  return {
    room: surroundings(root, dims),
    battlefieldFx,
    renderer,
    scene,
    camera,
    root,
    pieces,
    instances: new PieceInstances(batches, true),
    marks,
    board,
    legs,
    stands,
    placeStands,
    handMeshes: [],
    tags: [],
    tilt: 0,
    tiltTarget: 0,
    animations: [],
    spiritFlights: [],
    drag: null,
    controls: null,
    flip: null,
  }
}
