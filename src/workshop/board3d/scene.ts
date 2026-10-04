import * as THREE from 'three'
import { Color } from 'tsshogi'
import { getSettings } from '../settings'
import { furnishFloor, type RoomDims } from '../roomFloor'
import { CASUAL, HALF_D, HALF_W, LEG, STAND, STAND_SLAB, STAND_TOP, STRIP_D, STRIP_W, THICK } from './dimensions'
import { layout, standCenter } from './layout'
import { surroundings } from './surroundings'
import { environmentMap, preparePieceEnvironment, standMaterial, woodMaterial } from './materials'
import { boardTexture } from './textures'
import { BOARD_TONE } from '../koma'
import type { SceneState, Stand } from './types'

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.82
  preparePieceEnvironment(renderer)
  return renderer
}

export function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xe8e0d0, 0x3a2a18, 0.9))
  const lamp = new THREE.SpotLight(0xffe8c4, 70, 80, Math.PI / 3, 1, 1.2)
  lamp.position.set(-1.5, 18, 2.5)
  lamp.castShadow = true
  lamp.shadow.mapSize.set(2048, 2048)
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
  furnishFloor(root, dims, CASUAL)
  return dims
}

function addBoard(root: THREE.Group) {
  const style = getSettings().boardStyle
  const tone = BOARD_TONE[style]
  const top = new THREE.MeshPhysicalMaterial({ map: boardTexture(style), roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.45, envMap: environmentMap(), envMapIntensity: 0.25 })
  const board = new THREE.Mesh(new THREE.BoxGeometry(2 * HALF_W, THICK, 2 * HALF_D), [woodMaterial(tone.edge, 3), woodMaterial(tone.edge, 5), top, woodMaterial([150, 104, 50], 9), woodMaterial(tone.edge, 11), woodMaterial(tone.edge, 13)])
  board.position.y = -THICK / 2
  board.castShadow = true
  board.receiveShadow = true
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
    leg.visible = !CASUAL
    root.add(leg)
    return leg
  })
}

function addStands(root: THREE.Group) {
  const material = standMaterial()
  const stands: Stand[] = [1, -1].map((side) => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(STAND, STAND_SLAB, STAND), material)
    stand.castShadow = true
    stand.receiveShadow = true
    root.add(stand)
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
      stand.scale.set(layout.portrait ? STRIP_W / STAND : 1, 1, layout.portrait ? STRIP_D / STAND : 1)
      const block = CASUAL && !layout.portrait ? (THICK + STAND_TOP) / STAND_SLAB : 1
      stand.scale.y = block
      stand.position.set(c.x, STAND_TOP - (STAND_SLAB * block) / 2, c.z)
      const legH = THICK + LEG + STAND_TOP - STAND_SLAB
      const [post, foot] = legs
      post.visible = foot.visible = !layout.portrait && !CASUAL
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
  addLights(scene)
  const root = new THREE.Group()
  scene.add(root)
  const dims = addFloor(root)
  const board = addBoard(root)
  const legs = addLegs(root)
  const { stands, placeStands } = addStands(root)
  const pieces = new THREE.Group()
  const marks = new THREE.Group()
  root.add(pieces, marks)
  return { room: surroundings(root, dims), renderer, scene, camera, root, pieces, marks, board, legs, stands, placeStands, handMeshes: [], tags: [], tilt: 0, tiltTarget: 0, animations: [], drag: null, controls: null, flip: null }
}
