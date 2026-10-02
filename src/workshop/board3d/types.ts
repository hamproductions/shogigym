import type * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Color, ImmutablePosition, PieceType, Square } from 'tsshogi'
import type { Surroundings } from './surroundings'

export type BoardArrow = { usi: string; color: string; dashed?: boolean; label?: string }

export type ZoneRect = { left: number; top: number; width: number; height: number }
export type StandZones = { under: ZoneRect; over: ZoneRect }

export type Board3DProps = {
  position: ImmutablePosition
  flipped: boolean
  tilted: boolean
  orbit?: boolean
  lastMove?: string
  selected: Square | PieceType | null
  selectedColor?: Color
  targets: Square[]
  arrows: BoardArrow[]
  castles?: { squares: Square[]; color: string; label: string }[]
  peek?: Square[]
  heat?: { square: Square; color: number; opacity: number; label?: string }[]
  checkSquare?: Square | null
  snapKey?: string
  peekFrom?: Square | null
  stamp?: { square: string; text: string; color: string } | null
  onSquare: (square: Square) => void
  onHand: (color: Color, type: PieceType) => void
  onDrop: (from: Square | PieceType, to: Square) => void
  onArrow?: (usi: string) => void
  onZones?: (zones: StandZones | null) => void
  sideRoom?: number
}

export type Latest = { readonly current: Board3DProps }

export type Stand = { stand: THREE.Mesh; side: number; legs: THREE.Mesh[] }

export type Body = { obj: THREE.Object3D; v: THREE.Vector3; w: THREE.Vector3; center: THREE.Vector3; half: THREE.Vector3; keepFlat: boolean; grounded: boolean; landed: boolean }

export type Arena = { floor: number; boxes: { minX: number; maxX: number; minZ: number; maxZ: number; top: number }[]; halfX: number; halfZ: number; ceil: number }

export type TableFlip = { start: number; bodies: Body[]; arena: Arena; rig: THREE.Group; dust: Dust; slammed: boolean; lastClatter: number }

export type Dust = { points: THREE.Points; burst: (at: THREE.Vector3, count: number, power: number) => void; step: (dt: number) => void }

export type SceneState = {
  room: Surroundings
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  root: THREE.Group
  pieces: THREE.Group
  marks: THREE.Group
  board: THREE.Mesh
  legs: THREE.Mesh[]
  stands: Stand[]
  placeStands: () => void
  handMeshes: THREE.Object3D[]
  tags: THREE.Object3D[]
  tilt: number
  tiltTarget: number
  animations: { mesh: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; start: number }[]
  drag: { mesh: THREE.Object3D; from: Square | PieceType } | null
  controls: OrbitControls | null
  flip: TableFlip | null
  settled?: boolean
  droppedAt?: number
  lastTime?: number
}
