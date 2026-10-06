import * as THREE from 'three'
import { Color, Position } from 'tsshogi'
import { STAND, STAND_SLAB, STAND_TOP, setBoardDims } from './dimensions'
import { handArrangement, handPieceMesh, type HandMode } from './hand'
import { layout, standCenter } from './layout'
import { preparePieceEnvironment, standMaterial } from './materials'
import { disposePiece } from './piece'
import { disposeRenderer } from './scene'

export interface HandSnapshot {
  url: string
  mode: HandMode
}

export function handSnapshots(sfens: string[], px: number): HandSnapshot[] {
  setBoardDims()
  const { portrait } = layout
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(px, px)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.82
  const environment = preparePieceEnvironment(renderer, false)
  const material = standMaterial(environment)
  const out: HandSnapshot[] = []
  try {
    layout.portrait = false
    for (const sfen of sfens) {
      const position = Position.newBySFEN(sfen)
      if (!position) continue
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1b2230)
      scene.add(new THREE.HemisphereLight(0xe8e0d0, 0x3a2a18, 1.2))
      const sun = new THREE.DirectionalLight(0xffe8c4, 1.6)
      sun.position.set(-1, 10, 2)
      scene.add(sun)
      const { spots, mode } = handArrangement(position, Color.BLACK)
      const c = standCenter(Color.BLACK)
      const stand = new THREE.Mesh(new THREE.BoxGeometry(STAND, STAND_SLAB, STAND), material)
      stand.position.set(c.x, STAND_TOP - STAND_SLAB / 2, c.z)
      scene.add(stand)
      const pieces = spots.map((spot) => handPieceMesh(spot, Color.BLACK, 1, environment))
      scene.add(...pieces)
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
      camera.position.set(c.x, 6.2, c.z + 4.2)
      camera.lookAt(c.x, STAND_TOP, c.z)
      renderer.render(scene, camera)
      out.push({ url: renderer.domElement.toDataURL('image/png'), mode })
      for (const piece of pieces) disposePiece(piece)
      stand.geometry.dispose()
    }
  } finally {
    layout.portrait = portrait
    material.map?.dispose()
    material.dispose()
    disposeRenderer(renderer)
  }
  return out
}
