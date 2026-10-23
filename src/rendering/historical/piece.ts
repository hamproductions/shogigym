import * as THREE from 'three'
import { Color, PieceType } from 'tsshogi'
import { createFigure, poseFigure, type Figure, type FigureId } from './figures'

const ids: Record<PieceType, FigureId> = {
  [PieceType.KING]: 'king',
  [PieceType.GOLD]: 'gold',
  [PieceType.SILVER]: 'silver',
  [PieceType.KNIGHT]: 'knight',
  [PieceType.LANCE]: 'lance',
  [PieceType.ROOK]: 'rook',
  [PieceType.BISHOP]: 'bishop',
  [PieceType.PAWN]: 'pawn',
  [PieceType.PROM_SILVER]: 'prom-silver',
  [PieceType.PROM_KNIGHT]: 'prom-knight',
  [PieceType.PROM_LANCE]: 'prom-lance',
  [PieceType.DRAGON]: 'dragon',
  [PieceType.HORSE]: 'dragon-horse',
  [PieceType.PROM_PAWN]: 'tokin',
}
const idlePoses = new WeakMap<THREE.Object3D, number>()

export function historicalPiece(type: PieceType, color: Color, seed: number) {
  const figure = createFigure(ids[type], color === Color.WHITE ? 1 : 0)
  const root = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }))
  const materials = new Map<THREE.Material, THREE.Material>()
  figure.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const copy = (material: THREE.Material) => {
      let cloned = materials.get(material)
      if (!cloned) materials.set(material, (cloned = material.clone()))
      return cloned
    }
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material)
  })
  root.add(figure)
  root.rotation.y = color === Color.WHITE ? Math.PI : 0
  root.userData = { type, color, grainSeed: seed, figure, historical: true, pieceResources: new Set() }
  root.castShadow = root.receiveShadow = true
  return root
}

export function animateHistorical(object: THREE.Object3D, time: number, travel = 0, attack = -1, gait?: number) {
  const figure = object.userData.figure as Figure | undefined
  if (figure) {
    const readiness = object.userData.readiness ?? 0
    const previous = idlePoses.get(object)
    if (travel === 0 && attack < 0 && previous !== undefined && Math.abs(previous - readiness) < 0.0005) return
    idlePoses.set(object, travel === 0 && attack < 0 ? readiness : NaN)
    figure.userData.readiness = readiness
    figure.userData.gaitPhase = gait
    poseFigure(figure, time / 1000, travel, attack)
  }
}
